import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CustomAlert } from "../../components/CustomAlert";
import { supabase } from "../../lib/supabase";
import { normalizeRecipe } from "../../services/recipeService";
import { Recipe } from "../../types/database";
import { getCombinedTotalTime, getMacrosPerServing } from "../../utils/formatters";
import { PROTOCOL_STORAGE_KEY } from "../(tabs)/recipes";
import { styles } from "./RecipeDetail.styles";

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
        const { data, error } = await supabase
          .from("recipes")
          .select("*")
          .eq("id", id)
          .single();

        if (error || !data) throw new Error(error?.message || "Recipe not found.");
        setRecipe(normalizeRecipe(data));
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
        <ActivityIndicator size="large" color="#818cf8" />
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

  const coverImage = recipe.images?.[0] || recipe.image_url;
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
            <Ionicons name="time-outline" size={14} color="#818cf8" />
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
            <Ionicons name="add" size={18} color="#020617" />
            <Text style={styles.addToListBtnText}>
              {isAdding ? "SYNCING..." : "+ Add to List"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="basket-outline" size={18} color="#818cf8" />
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
            <Ionicons name="reader-outline" size={18} color="#818cf8" />
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
