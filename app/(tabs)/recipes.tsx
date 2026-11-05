import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CustomAlert } from "../../components/CustomAlert";
import {
  RecipeCatalogSkeleton,
  RecipeSwipeSkeleton,
} from "../../components/RecipeCatalogSkeleton";
import { RecipeCatalog } from "../../components/RecipeCatalog";
import { FilterState, RecipeFiltersModal } from "../../components/RecipeFiltersModal";
import { RecipeSwipeDeck } from "../../components/RecipeSwipeDeck";
import { getDailyTargets, useAuth } from "../../ctx/AuthContext";
import {
  fetchRecipesCatalog,
  fetchSwipeDeck,
  getUserPreferences,
  recordRecipeSwipe,
} from "../../services/recipeService";
import { Recipe, UserPreferences } from "../../types/database";

export const PROTOCOL_STORAGE_KEY = "@protocol_weekly_ingredients";

type ViewMode = "catalog" | "swipe";

const FILTER_CHIPS = [
  { id: "high-protein", label: "High Protein", type: "tag", value: "high-protein" },
  { id: "under-30", label: "Under 30 Mins", type: "under30" },
  { id: "simplicity", label: "Fewest Ingredients", type: "simplicity" },
  { id: "chicken", label: "Chicken", type: "tag", value: "chicken" },
  { id: "beef", label: "Beef", type: "tag", value: "beef" },
  { id: "low-carb", label: "Low Carb", type: "tag", value: "low-carb" },
  { id: "keto", label: "Keto", type: "tag", value: "keto" },
  { id: "vegetarian", label: "Vegetarian", type: "tag", value: "vegetarian" },
];

export default function RecipesCatalogScreen() {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<ViewMode>("catalog");

  // Catalog State
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    selectedTag: null,
    simplicitySort: false,
    under30Mins: false,
  });

  // Swipe Protocol State
  const [deck, setDeck] = useState<Recipe[]>([]);
  const [isDeckLoading, setIsDeckLoading] = useState(false);
  const [userPrefs, setUserPrefs] = useState<UserPreferences | null>(null);

  const { profile } = useAuth();
  const dailyTargets = getDailyTargets(profile, true);

  // Custom Alert State (Zero native OS alerts)
  const [alert, setAlert] = useState({ visible: false, title: "", message: "" });

  // 1. Hydrate Catalog
  const loadCatalog = useCallback(
    async (resetPage = false) => {
      const targetPage = resetPage ? 0 : page;
      if (resetPage) {
        setIsLoading(true);
      } else {
        setIsFetchingMore(true);
      }

      const result = await fetchRecipesCatalog({
        selectedTag: filters.selectedTag,
        under30Mins: filters.under30Mins,
        simplicitySort: filters.simplicitySort,
        page: targetPage,
        pageSize: 30,
      });

      if (result.error) {
        setAlert({
          visible: true,
          title: "CATALOG RETRIEVAL NOTICE",
          message: result.error,
        });
      }

      // Mathematical macro goal alignment (assumes 3 primary meals per day)
      const targetMealCals = Math.round(dailyTargets.calories / 3);
      const targetMealProtein = Math.round(dailyTargets.protein / 3);

      const alignedRecipes = [...result.data].sort((a, b) => {
        const aDiff =
          Math.abs((a.calories || 0) - targetMealCals) * 0.4 +
          Math.abs((a.protein || 0) - targetMealProtein) * 1.5;
        const bDiff =
          Math.abs((b.calories || 0) - targetMealCals) * 0.4 +
          Math.abs((b.protein || 0) - targetMealProtein) * 1.5;
        return aDiff - bDiff;
      });

      if (resetPage) {
        setRecipes(alignedRecipes);
        setPage(0);
      } else {
        setRecipes((prev) => [...prev, ...alignedRecipes]);
      }

      setHasMore(result.hasMore);
      setIsLoading(false);
      setIsFetchingMore(false);
    },
    [filters, page, dailyTargets.calories, dailyTargets.protein]
  );

  useEffect(() => {
    loadCatalog(true);
  }, [filters]);

  // 2. Hydrate Swipe Deck & Preferences
  const loadDeck = useCallback(async () => {
    setIsDeckLoading(true);
    const [fetchedDeck, prefs] = await Promise.all([
      fetchSwipeDeck(15),
      getUserPreferences(),
    ]);
    setDeck(fetchedDeck);
    setUserPrefs(prefs);
    setIsDeckLoading(false);
  }, []);

  useEffect(() => {
    if (mode === "swipe" && deck.length === 0) {
      loadDeck();
    }
  }, [mode, deck.length, loadDeck]);

  const handleEndReached = () => {
    if (!isFetchingMore && hasMore && !isLoading) {
      setPage((prev) => prev + 1);
    }
  };

  useEffect(() => {
    if (page > 0) {
      loadCatalog(false);
    }
  }, [page]);

  // Swipe handlers
  const handleSwipeRight = async (recipe: Recipe) => {
    setDeck((prev) => prev.filter((r) => r.id !== recipe.id));
    const updated = await recordRecipeSwipe(recipe, "like");
    setUserPrefs(updated);
    if (deck.length <= 3) {
      const more = await fetchSwipeDeck(10);
      setDeck((prev) => [...prev, ...more]);
    }
  };

  const handleSwipeLeft = async (recipe: Recipe) => {
    setDeck((prev) => prev.filter((r) => r.id !== recipe.id));
    const updated = await recordRecipeSwipe(recipe, "dislike");
    setUserPrefs(updated);
    if (deck.length <= 3) {
      const more = await fetchSwipeDeck(10);
      setDeck((prev) => [...prev, ...more]);
    }
  };

  const handleAddToProtocol = async (recipe: Recipe) => {
    try {
      const rawIngs: string[] = (recipe.ingredients && recipe.ingredients.length > 0)
        ? recipe.ingredients
        : [`${recipe.title} ingredients`];

      const ex = await AsyncStorage.getItem(PROTOCOL_STORAGE_KEY);
      const curr: string[] = ex ? JSON.parse(ex) : [];
      await AsyncStorage.setItem(PROTOCOL_STORAGE_KEY, JSON.stringify([...curr, ...rawIngs]));

      setAlert({
        visible: true,
        title: "ADDED TO LIST",
        message: `${recipe.title} ingredients synced to Shopping List.`,
      });
    } catch {
      setAlert({ visible: true, title: "STORAGE ERROR", message: "Failed to persist to list." });
    }
  };


  return (
    <View style={[s.c, { paddingTop: insets.top }]}>
      <View style={s.h}>
        <View>
          <Text style={s.sub}>
            {mode === "swipe" ? "PREFERENCE ENGINE" : "DISCOVERY CATALOG"}
          </Text>
          <Text style={s.t}>
            {mode === "swipe" ? "Meal Discovery" : "Recipe Database"}
          </Text>
        </View>

        <View style={s.headerActions}>
          <View style={s.modeToggle}>
            <TouchableOpacity
              style={[s.modeBtn, mode === "catalog" && s.modeBtnActive]}
              onPress={() => setMode("catalog")}
            >
              <Ionicons
                name="grid-outline"
                size={14}
                color={mode === "catalog" ? "#020617" : "#818cf8"}
              />
              <Text style={[s.modeText, mode === "catalog" && s.modeTextActive]}>
                GRID
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.modeBtn, mode === "swipe" && s.modeBtnActive]}
              onPress={() => setMode("swipe")}
            >
              <Ionicons
                name="flame"
                size={14}
                color={mode === "swipe" ? "#020617" : "#818cf8"}
              />
              <Text style={[s.modeText, mode === "swipe" && s.modeTextActive]}>
                SWIPE
              </Text>
            </TouchableOpacity>
          </View>

          {mode === "catalog" && (
            <TouchableOpacity style={s.btn} onPress={() => setIsFilterOpen(true)}>
              <Ionicons name="filter-outline" size={15} color="#818cf8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {mode === "swipe" && (
        <View style={s.swipeContainer}>
          <View style={s.prefBar}>
            <View style={s.prefInfo}>
              <Ionicons name="flame" size={14} color="#818cf8" />
              <Text style={s.prefText}>
                {userPrefs?.look_alike_dictionary?.totalSwiped || 0} swiped • Avg{" "}
                {userPrefs?.look_alike_dictionary?.avgProtein || 0}g protein
              </Text>
            </View>
            <TouchableOpacity onPress={loadDeck} style={s.refreshBtn}>
              <Ionicons name="refresh" size={14} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {isDeckLoading ? (
            <RecipeSwipeSkeleton />
          ) : deck.length === 0 ? (
            <View style={s.emptyDeck}>
              <View style={s.emptyIconCircle}>
                <Ionicons name="checkmark-done" size={32} color="#818cf8" />
              </View>
              <Text style={s.emptyDeckTitle}>Discovery Horizon Reached</Text>
              <Text style={s.emptyDeckSub}>
                Your culinary preferences have been mapped.
              </Text>
              <TouchableOpacity style={s.reloadDeckBtn} onPress={loadDeck}>
                <Ionicons name="refresh" size={16} color="#020617" />
                <Text style={s.reloadDeckText}>RELOAD DISCOVERY DECK</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={s.deckArea}>
              <RecipeSwipeDeck
                recipes={deck}
                onSwipeRight={handleSwipeRight}
                onSwipeLeft={handleSwipeLeft}
                onAddToProtocol={handleAddToProtocol}
                onDeckEmpty={loadDeck}
              />
            </View>
          )}
        </View>
      )}

      {mode === "catalog" && (
        <>
          <View style={s.chipBarContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.chipScrollContent}
            >
              {FILTER_CHIPS.map((chip) => {
                let isActive = false;
                if (chip.type === "tag") {
                  isActive = filters.selectedTag === chip.value;
                } else if (chip.type === "under30") {
                  isActive = filters.under30Mins;
                } else if (chip.type === "simplicity") {
                  isActive = filters.simplicitySort;
                }

                return (
                  <TouchableOpacity
                    key={chip.id}
                    style={[s.filterChip, isActive && s.filterChipActive]}
                    activeOpacity={0.7}
                    onPress={() => {
                      if (chip.type === "tag") {
                        setFilters((prev) => ({
                          ...prev,
                          selectedTag: prev.selectedTag === chip.value ? null : chip.value!,
                        }));
                      } else if (chip.type === "under30") {
                        setFilters((prev) => ({
                          ...prev,
                          under30Mins: !prev.under30Mins,
                        }));
                      } else if (chip.type === "simplicity") {
                        setFilters((prev) => ({
                          ...prev,
                          simplicitySort: !prev.simplicitySort,
                        }));
                      }
                    }}
                  >
                    <Text style={[s.filterChipText, isActive && s.filterChipTextActive]}>
                      {chip.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {isLoading ? (
            <RecipeCatalogSkeleton count={8} />
          ) : (
            <RecipeCatalog
              recipes={recipes}
              onAddToProtocol={handleAddToProtocol}
              onEndReached={handleEndReached}
              isFetchingMore={isFetchingMore}
            />
          )}
        </>
      )}

      <RecipeFiltersModal
        visible={isFilterOpen}
        filters={filters}
        onClose={() => setIsFilterOpen(false)}
        onApply={(f) => setFilters(f)}
        onReset={() =>
          setFilters({ selectedTag: null, simplicitySort: false, under30Mins: false })
        }
      />
      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        buttonText="ACKNOWLEDGE"
        onClose={() => setAlert({ visible: false, title: "", message: "" })}
      />
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: "#020617" },
  h: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  sub: { fontSize: 10, fontWeight: "700", color: "#818cf8", letterSpacing: 1 },
  t: { fontSize: 20, fontWeight: "800", color: "#f8fafc" },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  modeToggle: {
    flexDirection: "row",
    backgroundColor: "#0f172a",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1e293b",
    padding: 2,
  },
  modeBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 6,
    gap: 4,
  },
  modeBtnActive: { backgroundColor: "#818cf8" },
  modeText: { fontSize: 10, fontWeight: "800", color: "#818cf8" },
  modeTextActive: { color: "#020617" },
  btn: {
    backgroundColor: "#0f172a",
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  swipeContainer: { flex: 1 },
  prefBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#0f172a",
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  prefInfo: { flexDirection: "row", alignItems: "center", gap: 6 },
  prefText: { fontSize: 11, fontWeight: "700", color: "#cbd5e1" },
  refreshBtn: { padding: 4 },
  deckArea: { flex: 1, position: "relative" },
  emptyDeck: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(129, 140, 248, 0.12)",
    borderWidth: 1,
    borderColor: "#818cf8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyDeckTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#f8fafc",
    marginBottom: 8,
  },
  emptyDeckSub: {
    fontSize: 13,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
  },
  reloadDeckBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#818cf8",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    gap: 6,
  },
  reloadDeckText: {
    color: "#020617",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  chipBarContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
    backgroundColor: "#020617",
  },
  chipScrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    alignItems: "center",
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  filterChipActive: {
    backgroundColor: "#818cf8",
    borderColor: "#818cf8",
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94a3b8",
    letterSpacing: 0.2,
  },
  filterChipTextActive: {
    color: "#020617",
  },
  pills: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  pill: {
    backgroundColor: "rgba(129, 140, 248, 0.15)",
    borderColor: "#818cf8",
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pText: { fontSize: 9, fontWeight: "700", color: "#818cf8" },
  list: { padding: 8, paddingBottom: 30 },
  footerLoading: { paddingVertical: 16, alignItems: "center" },
  footerText: { fontSize: 11, color: "#64748b", fontWeight: "600" },
});

