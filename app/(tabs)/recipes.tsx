import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useEffect, useState } from "react";
import {
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
import {
  fetchRecipesCatalog,
  fetchSwipeDeck,
  getUserPreferences,
  recordRecipeSwipe,
} from "../../services/recipeService";
import { Recipe, UserPreferences } from "../../types/database";

export const PROTOCOL_STORAGE_KEY = "@protocol_weekly_ingredients";

type ViewMode = "catalog" | "swipe";

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

      if (resetPage) {
        setRecipes(result.data);
        setPage(0);
      } else {
        setRecipes((prev) => [...prev, ...result.data]);
      }

      setHasMore(result.hasMore);
      setIsLoading(false);
      setIsFetchingMore(false);
    },
    [filters, page]
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
      let rawIngs: string[] = [];
      if (Array.isArray(recipe.ingredients)) {
        rawIngs = recipe.ingredients;
      } else if (typeof (recipe.ingredients as any) === "string") {
        try {
          const parsed = JSON.parse(recipe.ingredients as any);
          rawIngs = Array.isArray(parsed) ? parsed : [recipe.ingredients as any];
        } catch {
          rawIngs = (recipe.ingredients as any).split(",").map((s: string) => s.trim());
        }
      } else {
        rawIngs = [`${recipe.title} ingredients`];
      }

      const ex = await AsyncStorage.getItem(PROTOCOL_STORAGE_KEY);
      const curr: string[] = ex ? JSON.parse(ex) : [];
      await AsyncStorage.setItem(PROTOCOL_STORAGE_KEY, JSON.stringify([...curr, ...rawIngs]));

      setAlert({
        visible: true,
        title: "PROTOCOL COMMITTED",
        message: `${recipe.title} ingredients synced to Supply Chain.`,
      });
    } catch {
      setAlert({ visible: true, title: "STORAGE ERROR", message: "Failed to persist protocol." });
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
            {mode === "swipe" ? "Swipe Protocol" : "Recipe Database"}
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
              <Ionicons name="sparkles" size={14} color="#818cf8" />
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
              <Text style={s.emptyDeckTitle}>Protocol Horizon Reached</Text>
              <Text style={s.emptyDeckSub}>
                Your culinary preferences have been mapped.
              </Text>
              <TouchableOpacity style={s.reloadDeckBtn} onPress={loadDeck}>
                <Ionicons name="refresh" size={16} color="#020617" />
                <Text style={s.reloadDeckText}>RELOAD SWIPE PROTOCOL</Text>
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
          {Boolean(
            filters.selectedTag || filters.simplicitySort || filters.under30Mins
          ) && (
            <View style={s.pills}>
              {Boolean(filters.selectedTag) && (
                <View style={s.pill}>
                  <Text style={s.pText}>{filters.selectedTag}</Text>
                </View>
              )}
              {filters.simplicitySort && (
                <View style={s.pill}>
                  <Text style={s.pText}>Fewest Ings</Text>
                </View>
              )}
              {filters.under30Mins && (
                <View style={s.pill}>
                  <Text style={s.pText}>&le; 30 Mins</Text>
                </View>
              )}
            </View>
          )}

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

