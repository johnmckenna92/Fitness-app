import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CustomAlert } from "../../components/CustomAlert";
import { fetchRecipeById } from "../../services/recipeService";
import { Recipe } from "../../types/database";
import { getCombinedTotalTime, getMacrosPerServing } from "../../utils/formatters";
import { PROTOCOL_STORAGE_KEY } from "../(tabs)/recipes";

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [alert, setAlert] = useState({ visible: false, title: "", message: "" });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    async function loadRecipe() {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await fetchRecipeById(id);
        if (!data) throw new Error("Recipe not found.");
        setRecipe(data);
      } catch (err: any) {
        setAlert({
          visible: true,
          title: "RECIPE ERROR",
          message: err?.message || "Unable to retrieve recipe details.",
        });
      } finally {
        setIsLoading(false);
      }
    }
    loadRecipe();
  }, [id]);

  const handleAddToList = async () => {
    if (!recipe) return;
    setIsAdding(true);
    try {
      const rawIngs = recipe.ingredients.length > 0 ? recipe.ingredients : [`${recipe.title} ingredients`];
      const existing = await AsyncStorage.getItem(PROTOCOL_STORAGE_KEY);
      const currentList: string[] = existing ? JSON.parse(existing) : [];
      await AsyncStorage.setItem(PROTOCOL_STORAGE_KEY, JSON.stringify([...currentList, ...rawIngs]));

      setAlert({
        visible: true,
        title: "ADDED TO LIST",
        message: `${recipe.title} ingredients synced to Shopping List.`,
      });
    } catch {
      setAlert({
        visible: true,
        title: "STORAGE ERROR",
        message: "Failed to persist ingredients to list.",
      });
    } finally {
      setIsAdding(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#4ade80" />
        <Text style={styles.loadingText}>LOADING RECIPE INTEL...</Text>
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text style={styles.errorTitle}>RECIPE UNAVAILABLE</Text>
        <TouchableOpacity style={styles.backBtnFallback} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>RETURN TO DISCOVERY</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const rawCover = recipe.images?.[0] || recipe.image_url;
  const coverImage = typeof rawCover === "string" && rawCover.trim().length > 0 ? rawCover.trim() : null;
  const timeFormatted = getCombinedTotalTime(recipe.prep_time, recipe.cook_time, recipe.total_time);
  const { calories, protein, carbs, fats, servings } = getMacrosPerServing(recipe);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroContainer}>
          {coverImage ? (
            <Image
              source={{ uri: coverImage }}
              style={styles.heroImage}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={200}
            />
          ) : (
            <View style={styles.heroFallback}>
              <Ionicons name="fast-food-outline" size={64} color="#334155" />
            </View>
          )}

          <TouchableOpacity
            style={[styles.floatingBackBtn, { top: insets.top + 10 }]}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={22} color="#f8fafc" />
          </TouchableOpacity>

          <View style={styles.heroBadge}>
            <Ionicons name="time-outline" size={14} color="#4ade80" />
            <Text style={styles.heroBadgeText}>{timeFormatted}</Text>
          </View>
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>{recipe.title}</Text>

          <View style={styles.servingsRow}>
            <View style={styles.servingsTag}>
              <Ionicons name="people-outline" size={14} color="#94a3b8" />
              <Text style={styles.servingsText}>{servings} {servings === 1 ? "Serving" : "Servings"}</Text>
            </View>
          </View>

          <View style={styles.macroGrid}>
            <View style={styles.macroCard}>
              <Text style={styles.macroValue}>{calories}</Text>
              <Text style={styles.macroLabel}>CALORIES</Text>
            </View>
            <View style={[styles.macroCard, styles.proteinCard]}>
              <Text style={[styles.macroValue, styles.proteinValue]}>{protein}g</Text>
              <Text style={[styles.macroLabel, styles.proteinLabel]}>PROTEIN</Text>
            </View>
            <View style={styles.macroCard}>
              <Text style={styles.macroValue}>{carbs}g</Text>
              <Text style={styles.macroLabel}>CARBS</Text>
            </View>
            <View style={styles.macroCard}>
              <Text style={styles.macroValue}>{fats}g</Text>
              <Text style={styles.macroLabel}>FATS</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionSection}>
          <TouchableOpacity
            style={[styles.addToListBtn, isAdding && styles.btnDisabled]}
            onPress={handleAddToList}
            disabled={isAdding}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={18} color="#0a0a0a" />
            <Text style={styles.addToListBtnText}>
              {isAdding ? "SYNCING..." : "+ Add to List"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="basket-outline" size={18} color="#4ade80" />
            <Text style={styles.sectionTitle}>INGREDIENTS</Text>
            <Text style={styles.sectionCounter}>({recipe.ingredients.length})</Text>
          </View>

          <View style={styles.ingredientsBox}>
            {recipe.ingredients.length > 0 ? (
              recipe.ingredients.map((ingredient, index) => (
                <View key={index} style={styles.ingredientRow}>
                  <View style={styles.bullet} />
                  <Text style={styles.ingredientText}>{ingredient}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>Standard pantry staples required.</Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="reader-outline" size={18} color="#4ade80" />
            <Text style={styles.sectionTitle}>PREPARATION METHOD</Text>
            <Text style={styles.sectionCounter}>({recipe.instructions.length} Steps)</Text>
          </View>

          <View style={styles.instructionsBox}>
            {recipe.instructions.length > 0 ? (
              recipe.instructions.map((step, index) => (
                <View key={index} style={styles.instructionStep}>
                  <View style={styles.stepBadge}>
                    <Text style={styles.stepBadgeText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>Cook and prepare to preference.</Text>
            )}
          </View>
        </View>
      </ScrollView>

      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        buttonText="CONTINUE"
        onClose={() => setAlert({ visible: false, title: "", message: "" })}
      />
    </View>
  );
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020617" },
  scrollContent: { flexGrow: 1 },
  center: {
    flex: 1,
    backgroundColor: "#020617",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 14,
    color: "#64748b",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  errorTitle: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "800",
    color: "#f8fafc",
    letterSpacing: 0.5,
  },
  backBtnFallback: {
    marginTop: 20,
    backgroundColor: "#4ade80",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  backBtnText: {
    color: "#0a0a0a",
    fontSize: 12,
    fontWeight: "800",
  },
  heroContainer: {
    width: SCREEN_WIDTH,
    height: 260,
    backgroundColor: "#0f172a",
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroFallback: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#090d16",
  },
  floatingBackBtn: {
    position: "absolute",
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(2, 6, 23, 0.75)",
    borderWidth: 1,
    borderColor: "#1e293b",
    justifyContent: "center",
    alignItems: "center",
  },
  heroBadge: {
    position: "absolute",
    bottom: 14,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(2, 6, 23, 0.85)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  heroBadgeText: {
    color: "#f8fafc",
    fontSize: 12,
    fontWeight: "800",
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    color: "#f8fafc",
    lineHeight: 28,
  },
  servingsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 10,
  },
  servingsTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#0f172a",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  servingsText: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "700",
  },
  macroGrid: {
    flexDirection: "row",
    gap: 8,
    marginTop: 18,
  },
  macroCard: {
    flex: 1,
    backgroundColor: "#0f172a",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1e293b",
    paddingVertical: 10,
    alignItems: "center",
  },
  macroValue: {
    fontSize: 16,
    fontWeight: "900",
    color: "#f8fafc",
  },
  macroLabel: {
    fontSize: 8,
    fontWeight: "800",
    color: "#64748b",
    marginTop: 3,
    letterSpacing: 0.5,
  },
  proteinCard: {
    borderColor: "rgba(74, 222, 128, 0.4)",
    backgroundColor: "rgba(74, 222, 128, 0.08)",
  },
  proteinValue: { color: "#4ade80" },
  proteinLabel: { color: "#4ade80" },
  actionSection: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  addToListBtn: {
    backgroundColor: "#4ade80",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  addToListBtnText: {
    color: "#0a0a0a",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  btnDisabled: { opacity: 0.6 },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#f8fafc",
    letterSpacing: 0.8,
  },
  sectionCounter: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
  },
  ingredientsBox: {
    backgroundColor: "#171717",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#262626",
    padding: 16,
    gap: 12,
  },
  ingredientRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4ade80",
    marginTop: 7,
  },
  ingredientText: {
    flex: 1,
    fontSize: 13,
    color: "#cbd5e1",
    lineHeight: 20,
    fontWeight: "500",
  },
  instructionsBox: {
    backgroundColor: "#171717",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#262626",
    padding: 16,
    gap: 16,
  },
  instructionStep: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  stepBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(74, 222, 128, 0.15)",
    borderWidth: 1,
    borderColor: "#4ade80",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  stepBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#4ade80",
  },
  stepText: {
    flex: 1,
    fontSize: 13,
    color: "#cbd5e1",
    lineHeight: 20,
    fontWeight: "500",
  },
  emptyText: {
    fontSize: 12,
    color: "#64748b",
    fontStyle: "italic",
  },
});
