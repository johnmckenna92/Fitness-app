import { Ionicons } from "@expo/vector-icons";
import { GoogleGenAI } from "@google/genai/web";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../ctx/AuthContext";
import { supabase } from "../../lib/supabase";

interface Recipe {
  id: string;
  title: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  badgeText: string;
  badgeType: "success" | "warning";
  description?: string;
  ingredients?: string;
  instructions?: string;
}

export default function RecipesScreen() {
  const { profile } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const targetCalories = profile?.target_calories ?? 2000;
  const targetProtein = profile?.target_protein ?? 150;
  const targetCarbs = profile?.target_carbs ?? 200;
  const targetFats = profile?.target_fats ?? 65;

  const calMin = Math.round(targetCalories * 0.8);
  const calMax = Math.round(targetCalories * 1.2);
  const proteinMin = Math.round(targetProtein * 0.8);
  const proteinMax = Math.round(targetProtein * 1.2);
  const carbsMin = Math.round(targetCarbs * 0.8);
  const carbsMax = Math.round(targetCarbs * 1.2);
  const fatsMin = Math.round(targetFats * 0.8);
  const fatsMax = Math.round(targetFats * 1.2);

  const fetchAndFilterRecipes = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Fetch potential recipes from Supabase recipes table within +/- 20% range of user targets
      const { data: dbData, error: dbError } = await supabase
        .from("recipes")
        .select("*")
        .gte("calories", calMin)
        .lte("calories", calMax)
        .gte("protein", proteinMin)
        .lte("protein", proteinMax)
        .gte("carbs", carbsMin)
        .lte("carbs", carbsMax)
        .gte("fats", fatsMin)
        .lte("fats", fatsMax);

      if (dbError) {
        console.error("Supabase recipes fetch error:", dbError);
        throw new Error(dbError.message || "Failed to fetch recipes from database.");
      }

      let candidateRecipes = dbData || [];

      // Fallback: If user targets are daily and no whole-day recipes matched, check per-meal targets
      if (
        candidateRecipes.length === 0 &&
        profile?.meals_per_day &&
        profile.meals_per_day > 1
      ) {
        const mealCal = Math.round(targetCalories / profile.meals_per_day);
        const mealProtein = Math.round(targetProtein / profile.meals_per_day);
        const mealCarbs = Math.round(targetCarbs / profile.meals_per_day);
        const mealFats = Math.round(targetFats / profile.meals_per_day);

        const { data: mealData, error: mealError } = await supabase
          .from("recipes")
          .select("*")
          .gte("calories", Math.round(mealCal * 0.8))
          .lte("calories", Math.round(mealCal * 1.2))
          .gte("protein", Math.round(mealProtein * 0.8))
          .lte("protein", Math.round(mealProtein * 1.2))
          .gte("carbs", Math.round(mealCarbs * 0.8))
          .lte("carbs", Math.round(mealCarbs * 1.2))
          .gte("fats", Math.round(mealFats * 0.8))
          .lte("fats", Math.round(mealFats * 1.2));

        if (!mealError && mealData && mealData.length > 0) {
          candidateRecipes = mealData;
        }
      }

      // If no recipes matched the +/- 20% range, inform the user without hallucinating
      if (candidateRecipes.length === 0) {
        setRecipes([]);
        setError(
          "No recipes found in the database within +/- 20% of your macro targets. Adjust your target macros or check back later."
        );
        return;
      }

      // 2. Pass fetched recipes AND pt_notes to GoogleGenAI as strict dietary filter
      const ai = new GoogleGenAI({
        apiKey:
          process.env.EXPO_PUBLIC_GEMINI_API_KEY ||
          process.env.GEMINI_API_KEY ||
          "",
      });

      const ptNotes =
        profile?.pt_notes?.trim() ||
        "No specific dietary restrictions or forbidden ingredients provided.";

      const prompt = `You are an elite sports nutritionist and strict dietary compliance filter.
We are selecting recipes from a global database catalog to fit the user's dietary guidelines.

User Personal Trainer (PT) Notes & Constraints:
"""
${ptNotes}
"""

Database Recipes Catalog (JSON array):
${JSON.stringify(candidateRecipes, null, 2)}

TASK & STRICT INSTRUCTIONS:
1. Act as a strict dietary filter: review the provided database recipes against the user's PT notes constraints.
2. Discard ANY recipe that violates the rules (e.g., forbidden ingredients, allergens, or dietary restrictions).
3. CRITICAL RULE: DO NOT INVENT RECIPES. You must ONLY select from the database recipes provided above.
4. From the qualifying compliant recipes, return the top 3 best matching recipes in strict JSON format. If fewer than 3 qualify, return all that qualify.
5. Return ONLY a strict JSON array of objects without any markdown formatting (no \`\`\`json or \`\`\`) or surrounding text.

Each recipe object in the array must strictly have this structure:
[
  {
    "id": "original recipe id from the provided database",
    "title": "original title from the provided database",
    "calories": number,
    "protein": number,
    "carbs": number,
    "fats": number,
    "badgeText": "PT Approved",
    "badgeType": "success",
    "description": "Short explanation of why this recipe matches the user's PT notes and macros"
  }
]
Note: 'badgeType' MUST be either 'success' or 'warning'. Use 'warning' if a recipe is acceptable but approaches a guideline limit.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      let parsedRecipes: Recipe[] = [];
      try {
        const rawText = response.text || "";
        const cleaned = rawText
          .replace(/```json/gi, "")
          .replace(/```/g, "")
          .trim();
        const data = JSON.parse(cleaned);
        const list = Array.isArray(data) ? data : data?.recipes || [];

        // Strict validation: AI must ONLY return recipes that were provided from the Supabase fetch
        const candidateMap = new Map(
          candidateRecipes.map((r: any) => [String(r.id), r])
        );

        const validatedList = list
          .filter((item: any) => {
            const hasId = candidateMap.has(String(item.id));
            const hasTitle = candidateRecipes.some(
              (r: any) => r.title?.toLowerCase() === item.title?.toLowerCase()
            );
            return hasId || hasTitle;
          })
          .slice(0, 3)
          .map((item: any) => {
            const original =
              candidateMap.get(String(item.id)) ||
              candidateRecipes.find(
                (r: any) => r.title?.toLowerCase() === item.title?.toLowerCase()
              );

            return {
              id: String(item.id || original?.id),
              title: original?.title || item.title,
              calories: original?.calories ?? item.calories,
              protein: original?.protein ?? item.protein,
              carbs: original?.carbs ?? item.carbs,
              fats: original?.fats ?? item.fats,
              badgeText: item.badgeText || "PT Approved",
              badgeType: (item.badgeType === "warning" ? "warning" : "success") as
                | "success"
                | "warning",
              description:
                item.description ||
                original?.description ||
                "Selected from database catalog and approved against PT guidelines.",
              ingredients: original?.ingredients || item.ingredients,
              instructions: original?.instructions || item.instructions,
            };
          });

        if (validatedList.length === 0) {
          setError(
            "All candidate recipes in the fetched batch were filtered out by your PT dietary rules (e.g. allergens or forbidden ingredients)."
          );
          setRecipes([]);
          return;
        }

        parsedRecipes = validatedList;
      } catch (parseError) {
        console.error("Failed to parse AI response:", parseError);
        setError("Failed to parse recipe selections from AI. Please try again.");
        return;
      }

      setRecipes(parsedRecipes);
    } catch (err: any) {
      console.error("Error selecting recipes:", err);
      setError(
        err?.message ||
          "Unable to select recipes right now. Please check your connection and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>Macro-Matched Recipes</Text>
        <Text style={styles.subtext}>
          Global database catalog filtered with AI against your PT plan
        </Text>

        {/* Daily Macros Banner */}
        <View style={styles.targetBanner}>
          <View style={styles.bannerHeaderRow}>
            <Text style={styles.targetBannerTitle}>Daily Macro Targets</Text>
            <Text style={styles.targetBannerRange}>±20% Window</Text>
          </View>
          <View style={styles.targetGrid}>
            <View style={styles.targetItem}>
              <Text style={styles.targetValue}>{targetCalories}</Text>
              <Text style={styles.targetLabel}>kcal</Text>
              <Text style={styles.rangeSubtext}>{calMin}-{calMax}</Text>
            </View>
            <View style={styles.targetDivider} />
            <View style={styles.targetItem}>
              <Text style={styles.targetValue}>{targetProtein}g</Text>
              <Text style={styles.targetLabel}>Protein</Text>
              <Text style={styles.rangeSubtext}>{proteinMin}-{proteinMax}g</Text>
            </View>
            <View style={styles.targetDivider} />
            <View style={styles.targetItem}>
              <Text style={styles.targetValue}>{targetCarbs}g</Text>
              <Text style={styles.targetLabel}>Carbs</Text>
              <Text style={styles.rangeSubtext}>{carbsMin}-{carbsMax}g</Text>
            </View>
            <View style={styles.targetDivider} />
            <View style={styles.targetItem}>
              <Text style={styles.targetValue}>{targetFats}g</Text>
              <Text style={styles.targetLabel}>Fats</Text>
              <Text style={styles.rangeSubtext}>{fatsMin}-{fatsMax}g</Text>
            </View>
          </View>
        </View>

        {/* PT Notes Summary if present */}
        {profile?.pt_notes?.trim() ? (
          <View style={styles.ptNotesCard}>
            <View style={styles.ptNotesHeader}>
              <Ionicons name="shield-checkmark" size={16} color="#818cf8" />
              <Text style={styles.ptNotesTitle}>Active PT Dietary Rules</Text>
            </View>
            <Text style={styles.ptNotesText} numberOfLines={3}>
              {profile.pt_notes.trim()}
            </Text>
          </View>
        ) : null}

        {/* Fetch & Select Recipes Button */}
        <TouchableOpacity
          style={[
            styles.generateButton,
            isLoading && styles.generateButtonDisabled,
          ]}
          onPress={fetchAndFilterRecipes}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#020617" />
          ) : (
            <View style={styles.buttonInner}>
              <Ionicons
                name="sparkles"
                size={18}
                color="#020617"
                style={styles.buttonIcon}
              />
              <Text style={styles.generateButtonText}>Select Matching Recipes</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Loading Indicator */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#818cf8" />
            <Text style={styles.loadingText}>
              Fetching database catalog & filtering with AI against PT notes...
            </Text>
          </View>
        )}

        {/* Fallback Error Message */}
        {error && !isLoading && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={20} color="#eab308" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Empty State */}
        {!isLoading && recipes.length === 0 && !error && (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="restaurant-outline"
              size={44}
              color="#64748b"
              style={styles.emptyIcon}
            />
            <Text style={styles.emptyTitle}>No Recipes Selected</Text>
            <Text style={styles.emptySubtext}>
              Press &quot;Select Matching Recipes&quot; to fetch meals from the database
              matching your ±20% macro window and compliant with your trainer&apos;s rules.
            </Text>
          </View>
        )}

        {/* Approved Recipe Cards (Top 3) */}
        {!isLoading &&
          recipes.map((recipe, index) => {
            const isWarning =
              recipe.badgeType?.toLowerCase() === "warning" ||
              recipe.badgeText?.toLowerCase().includes("warning");

            return (
              <View key={recipe.id || index.toString()} style={styles.card}>
                <View
                  style={isWarning ? styles.badgeWarning : styles.badgeSuccess}
                >
                  <Text
                    style={
                      isWarning
                        ? styles.badgeWarningText
                        : styles.badgeSuccessText
                    }
                  >
                    {recipe.badgeText || (isWarning ? "Warning" : "PT Approved")}
                  </Text>
                </View>

                <Text style={styles.cardTitle}>{recipe.title}</Text>

                {recipe.description ? (
                  <Text style={styles.cardDescription}>
                    {recipe.description}
                  </Text>
                ) : null}

                {/* Macro Pills Row */}
                <View style={styles.macroPillsRow}>
                  <View style={styles.macroPill}>
                    <Text style={styles.macroPillLabel}>CAL</Text>
                    <Text style={styles.macroPillValue}>{recipe.calories} kcal</Text>
                  </View>
                  <View style={styles.macroPill}>
                    <Text style={styles.macroPillLabel}>PRO</Text>
                    <Text style={styles.macroPillValue}>{recipe.protein}g</Text>
                  </View>
                  <View style={styles.macroPill}>
                    <Text style={styles.macroPillLabel}>CARB</Text>
                    <Text style={styles.macroPillValue}>{recipe.carbs}g</Text>
                  </View>
                  <View style={styles.macroPill}>
                    <Text style={styles.macroPillLabel}>FAT</Text>
                    <Text style={styles.macroPillValue}>{recipe.fats}g</Text>
                  </View>
                </View>

                {/* Ingredients if present */}
                {recipe.ingredients ? (
                  <View style={styles.ingredientsBox}>
                    <Text style={styles.ingredientsLabel}>Ingredients:</Text>
                    <Text style={styles.ingredientsText} numberOfLines={2}>
                      {recipe.ingredients}
                    </Text>
                  </View>
                ) : null}
              </View>
            );
          })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#f8fafc",
    marginBottom: 4,
  },
  subtext: {
    fontSize: 14,
    color: "#94a3b8",
    marginBottom: 16,
  },
  targetBanner: {
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  bannerHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  targetBannerTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  targetBannerRange: {
    fontSize: 11,
    color: "#818cf8",
    fontWeight: "600",
  },
  targetGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  targetItem: {
    alignItems: "center",
    flex: 1,
  },
  targetValue: {
    color: "#818cf8",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  targetLabel: {
    fontSize: 12,
    color: "#64748b",
  },
  rangeSubtext: {
    fontSize: 10,
    color: "#475569",
    marginTop: 2,
  },
  targetDivider: {
    width: 1,
    height: 32,
    backgroundColor: "#1e293b",
  },
  ptNotesCard: {
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  ptNotesHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 6,
  },
  ptNotesTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#818cf8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  ptNotesText: {
    fontSize: 13,
    color: "#cbd5e1",
    lineHeight: 18,
  },
  generateButton: {
    backgroundColor: "#818cf8",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  generateButtonDisabled: {
    opacity: 0.7,
  },
  buttonInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonIcon: {
    marginRight: 8,
  },
  generateButtonText: {
    color: "#020617",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingContainer: {
    paddingVertical: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(234, 179, 8, 0.1)",
    borderColor: "#eab308",
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    gap: 10,
  },
  errorText: {
    flex: 1,
    color: "#eab308",
    fontSize: 14,
    lineHeight: 18,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 16,
  },
  emptyIcon: {
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#f8fafc",
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 20,
  },
  card: {
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#f8fafc",
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 14,
    color: "#94a3b8",
    marginBottom: 14,
    lineHeight: 20,
  },
  macroPillsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  macroPill: {
    flex: 1,
    backgroundColor: "#020617",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: "center",
  },
  macroPillLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748b",
    marginBottom: 2,
  },
  macroPillValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#f8fafc",
  },
  ingredientsBox: {
    marginTop: 8,
    paddingTop: 8,
    borderTopColor: "#1e293b",
    borderTopWidth: 1,
  },
  ingredientsLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748b",
    marginBottom: 2,
  },
  ingredientsText: {
    fontSize: 12,
    color: "#94a3b8",
  },
  badgeSuccess: {
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 12,
    borderColor: "#22c55e",
    borderWidth: 1,
  },
  badgeSuccessText: {
    color: "#22c55e",
    fontSize: 12,
    fontWeight: "bold",
  },
  badgeWarning: {
    backgroundColor: "rgba(234, 179, 8, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 12,
    borderColor: "#eab308",
    borderWidth: 1,
  },
  badgeWarningText: {
    color: "#eab308",
    fontSize: 12,
    fontWeight: "bold",
  },
});
