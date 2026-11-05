import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SUPERMARKETS = ["All", "Aldi", "Tesco", "Sainsbury's"];

const MOCK_RECIPES = [
  {
    id: 1,
    title: "High-Protein Chicken Pasta",
    store: "Aldi",
    calories: 650,
    protein: 45,
    portions: 2,
  },
  {
    id: 2,
    title: "Greek Yoghurt & Berry Bowl",
    store: "Tesco",
    calories: 320,
    protein: 25,
    portions: 1,
  },
  {
    id: 3,
    title: "Lean Beef Mince Chilli",
    store: "Sainsbury's",
    calories: 580,
    protein: 42,
    portions: 4,
  },
];

export default function MealsScreen() {
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState("All");
  const [recipes, setRecipes] = useState(MOCK_RECIPES);

  const updatePortion = (id: number, delta: number) => {
    setRecipes((current) =>
      current.map((recipe) => {
        if (recipe.id === id) {
          const newPortions = Math.max(1, recipe.portions + delta);
          return { ...recipe, portions: newPortions };
        }
        return recipe;
      }),
    );
  };

  const filteredRecipes = recipes.filter(
    (r) => activeFilter === "All" || r.store === activeFilter,
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Meal Planner</Text>
          <Text style={styles.title}>AI Recipes</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/profile")}
          style={styles.profileButton}
        >
          <Ionicons name="person-circle-outline" size={36} color="#818cf8" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Macro Summary Progress (Mini) */}
        <View style={styles.macroSummaryCard}>
          <View style={styles.macroStat}>
            <Text style={styles.macroLabel}>Protein Target</Text>
            <Text style={styles.macroValue}>
              140g <Text style={styles.macroSub}>/ day</Text>
            </Text>
          </View>
          <View style={styles.verticalDivider} />
          <View style={styles.macroStat}>
            <Text style={styles.macroLabel}>Calorie Target</Text>
            <Text style={styles.macroValue}>
              2200 <Text style={styles.macroSub}>kcal</Text>
            </Text>
          </View>
        </View>

        {/* Action Button: Generate Grocery List */}
        <TouchableOpacity style={styles.generateListButton}>
          <Ionicons name="cart-outline" size={20} color="#ffffff" />
          <Text style={styles.generateListText}>Generate UK Grocery List</Text>
        </TouchableOpacity>

        {/* Supermarket Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          {SUPERMARKETS.map((store) => (
            <TouchableOpacity
              key={store}
              style={[
                styles.filterPill,
                activeFilter === store && styles.filterPillActive,
              ]}
              onPress={() => setActiveFilter(store)}
            >
              <Text
                style={[
                  styles.filterPillText,
                  activeFilter === store && styles.filterPillTextActive,
                ]}
              >
                {store}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Recipe Feed */}
        <View style={styles.recipeFeed}>
          {filteredRecipes.map((recipe) => (
            <View key={recipe.id} style={styles.recipeCard}>
              <View style={styles.recipeHeader}>
                <Text style={styles.recipeStore}>{recipe.store}</Text>
                <TouchableOpacity>
                  <Ionicons name="bookmark-outline" size={20} color="#94a3b8" />
                </TouchableOpacity>
              </View>

              <Text style={styles.recipeTitle}>{recipe.title}</Text>

              <View style={styles.recipeMeta}>
                <View style={styles.tag}>
                  <Ionicons name="flame-outline" size={14} color="#f8fafc" />
                  <Text style={styles.tagText}>{recipe.calories} kcal</Text>
                </View>
                <View style={styles.tag}>
                  <Ionicons name="barbell-outline" size={14} color="#f8fafc" />
                  <Text style={styles.tagText}>{recipe.protein}g protein</Text>
                </View>
              </View>

              <View style={styles.recipeFooter}>
                <Text style={styles.portionLabel}>Portions</Text>
                <View style={styles.portionControls}>
                  <TouchableOpacity
                    onPress={() => updatePortion(recipe.id, -1)}
                    style={styles.portionBtn}
                  >
                    <Ionicons name="remove" size={18} color="#f8fafc" />
                  </TouchableOpacity>
                  <Text style={styles.portionText}>{recipe.portions}</Text>
                  <TouchableOpacity
                    onPress={() => updatePortion(recipe.id, 1)}
                    style={styles.portionBtn}
                  >
                    <Ionicons name="add" size={18} color="#f8fafc" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020617" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  greeting: { color: "#94a3b8", fontSize: 16 },
  title: { color: "#f8fafc", fontSize: 28, fontWeight: "bold", marginTop: 4 },
  profileButton: { padding: 4 },
  scrollContent: { paddingBottom: 40 },
  macroSummaryCard: {
    flexDirection: "row",
    backgroundColor: "#0f172a",
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: 16,
  },
  macroStat: { flex: 1, alignItems: "center" },
  verticalDivider: {
    width: 1,
    backgroundColor: "#1e293b",
    marginHorizontal: 16,
  },
  macroLabel: {
    color: "#94a3b8",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  macroValue: { color: "#818cf8", fontSize: 20, fontWeight: "bold" },
  macroSub: { fontSize: 14, color: "#64748b", fontWeight: "normal" },
  generateListButton: {
    flexDirection: "row",
    backgroundColor: "#818cf8",
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 24,
  },
  generateListText: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },
  filterContainer: { flexGrow: 0, marginBottom: 20 },
  filterContent: { paddingHorizontal: 20, gap: 12 },
  filterPill: {
    backgroundColor: "#0f172a",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  filterPillActive: { backgroundColor: "#818cf8", borderColor: "#818cf8" },
  filterPillText: { color: "#94a3b8", fontSize: 14, fontWeight: "600" },
  filterPillTextActive: { color: "#ffffff" },
  recipeFeed: { paddingHorizontal: 20, gap: 16 },
  recipeCard: {
    backgroundColor: "#0f172a",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  recipeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  recipeStore: {
    color: "#818cf8",
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  recipeTitle: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  recipeMeta: { flexDirection: "row", gap: 12, marginBottom: 16 },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e293b",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  tagText: { color: "#f8fafc", fontSize: 12, fontWeight: "500" },
  recipeFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
    paddingTop: 12,
  },
  portionLabel: { color: "#94a3b8", fontSize: 14, fontWeight: "500" },
  portionControls: { flexDirection: "row", alignItems: "center", gap: 16 },
  portionBtn: {
    backgroundColor: "#1e293b",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  portionText: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "bold",
    minWidth: 20,
    textAlign: "center",
  },
});
