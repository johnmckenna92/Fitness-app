import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CustomAlert } from "../../components/CustomAlert";
import { EmptyState } from "../../components/EmptyState";
import {
  RecipeCatalogSkeleton,
  RecipeSwipeSkeleton,
} from "../../components/RecipeCatalogSkeleton";
import { RecipeCatalog } from "../../components/RecipeCatalog";
import { FilterState, RecipeFiltersModal } from "../../components/RecipeFiltersModal";
import { RecipeSwipeDeck } from "../../components/RecipeSwipeDeck";
import { getDailyTargets, useAuth } from "../../ctx/AuthContext";
import { useTheme } from "../../ctx/ThemeContext";
import { useEntitlements } from "../../hooks/useEntitlements";
import {
  fetchRecipesCatalog,
  fetchSwipeDeck,
  getUserPreferences,
  recordRecipeSwipe,
} from "../../services/recipeService";
import {
  SwipeLimitStatus,
  getDailySwipeStatus,
  recordDailySwipe,
  upgradeSubscriptionTier,
} from "../../services/subscriptionService";
import { Recipe, UnifiedRecipe, UserPreferences } from "../../types/database";

export const PROTOCOL_STORAGE_KEY = "@protocol_weekly_ingredients";

function getWeekKey(): string {
  const d = new Date();
  const year = d.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const days = Math.floor((d.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  const week = Math.ceil((days + startOfYear.getDay() + 1) / 7);
  return `${year}-W${week}`;
}

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
  const { colors, isDark } = useTheme();
  const activeAccentTextColor = isDark ? colors.background : colors.text;
  const [mode, setMode] = useState<ViewMode>("catalog");

  // Catalog State
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [catalogError, setCatalogError] = useState<string | null>(null);
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
  const [deck, setDeck] = useState<UnifiedRecipe[]>([]);
  const [isDeckLoading, setIsDeckLoading] = useState(false);
  const [userPrefs, setUserPrefs] = useState<UserPreferences | null>(null);

  const { profile, refreshProfile } = useAuth();
  const {
    tier,
    limits: tierLimits,
    hasProAccess,
    getLimitReachedMessage,
    shouldShowPaywall,
  } = useEntitlements();
  const dailyTargets = useMemo(() => getDailyTargets(profile, true), [profile]);
  const dietaryPreferences = (profile as any)?.dietary_preferences ?? null;

  const isFetchingMoreRef = useRef(false);
  const isLoadingRef = useRef(false);
  const hasAttemptedDeckLoadRef = useRef(false);

  // Subscription & Daily Swipe Limit State
  const [swipeStatus, setSwipeStatus] = useState<SwipeLimitStatus | null>(null);
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [isUpgradingTier, setIsUpgradingTier] = useState<string | null>(null);

  // Custom Alert State (Zero native OS alerts)
  const [alert, setAlert] = useState({ visible: false, title: "", message: "" });

  // 1. Hydrate Catalog
  const loadCatalog = useCallback(
    async (targetPage: number, currentFilters: FilterState, isRefresh = false) => {
      const isReset = targetPage === 0;
      if (isReset) {
        if (!isRefresh) {
          setIsLoading(true);
          isLoadingRef.current = true;
        }
      } else {
        setIsFetchingMore(true);
        isFetchingMoreRef.current = true;
      }

      try {
        const isPro = hasProAccess;
        const prefs = await getUserPreferences();
        setUserPrefs(prefs);

        const result = await fetchRecipesCatalog({
          selectedTag: currentFilters.selectedTag,
          under30Mins: currentFilters.under30Mins,
          simplicitySort: currentFilters.simplicitySort,
          sortByProtein: currentFilters.sortByProtein,
          page: targetPage,
          pageSize: 30,
          sortOptions: {
            preferences: prefs,
            macroGoals: {
              targetCalories: dailyTargets.calories,
              targetProtein: dailyTargets.protein,
              targetCarbs: dailyTargets.carbs,
              targetFats: dailyTargets.fats,
              mealsPerDay: profile?.meals_per_day || 3,
            },
            dietaryPreferences:
              currentFilters.dietaryPreference || dietaryPreferences || null,
            isPro,
            strictDietaryFilter: true,
          },
        });

        if (result.error) {
          setCatalogError(result.error);
          setAlert({
            visible: true,
            title: "CATALOG RETRIEVAL NOTICE",
            message: result.error,
          });
        } else {
          setCatalogError(null);
        }

        if (isReset) {
          setRecipes(result.data);
          setPage(0);
        } else {
          setRecipes((prev) => [...prev, ...result.data]);
        }

        setHasMore(result.hasMore);
      } finally {
        setIsLoading(false);
        setIsFetchingMore(false);
        isLoadingRef.current = false;
        isFetchingMoreRef.current = false;
      }
    },
    [
      dailyTargets,
      hasProAccess,
      profile?.meals_per_day,
      dietaryPreferences,
    ]
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await loadCatalog(0, filters, true);
    } finally {
      setIsRefreshing(false);
    }
  }, [loadCatalog, filters]);

  // Debounced catalog refresh on filter changes (prevents network flooding)
  useEffect(() => {
    const handler = setTimeout(() => {
      loadCatalog(0, filters);
    }, 250);
    return () => clearTimeout(handler);
  }, [filters, loadCatalog]);

  // 2. Hydrate Swipe Deck & Preferences
  const loadDeck = useCallback(async () => {
    setIsDeckLoading(true);
    const prefs = await getUserPreferences();
    setUserPrefs(prefs);
    const isPro =
      profile?.subscription_status === "pro" ||
      profile?.subscription_status === "athlete" ||
      profile?.is_pro === true;

    const fetchedDeck = await fetchSwipeDeck(
      15,
      {
        targetCalories: dailyTargets.calories,
        targetProtein: dailyTargets.protein,
        targetCarbs: dailyTargets.carbs,
        targetFats: dailyTargets.fats,
        mealsPerDay: profile?.meals_per_day || 3,
      },
      {
        preferences: prefs,
        macroGoals: {
          targetCalories: dailyTargets.calories,
          targetProtein: dailyTargets.protein,
          targetCarbs: dailyTargets.carbs,
          targetFats: dailyTargets.fats,
          mealsPerDay: profile?.meals_per_day || 3,
        },
        dietaryPreferences: dietaryPreferences || null,
        isPro,
        strictDietaryFilter: true,
      }
    );
    setDeck(fetchedDeck);
    setIsDeckLoading(false);
  }, [
    dailyTargets,
    profile?.subscription_status,
    profile?.is_pro,
    profile?.meals_per_day,
    dietaryPreferences,
  ]);

  useEffect(() => {
    if (mode === "swipe" && deck.length === 0 && !isDeckLoading && !hasAttemptedDeckLoadRef.current) {
      hasAttemptedDeckLoadRef.current = true;
      loadDeck();
    }
  }, [mode, deck.length, isDeckLoading, loadDeck]);

  const handleEndReached = useCallback(() => {
    if (isFetchingMoreRef.current || isLoadingRef.current || !hasMore) {
      return;
    }
    const nextPage = page + 1;
    setPage(nextPage);
    loadCatalog(nextPage, filters);
  }, [hasMore, page, filters, loadCatalog]);

  const refreshSwipeLimit = useCallback(async () => {
    const status = await getDailySwipeStatus(profile?.id, tier, profile?.trainer_id);
    setSwipeStatus(status);
    setIsLimitReached(!status.allowed);
  }, [profile?.id, tier, profile?.trainer_id]);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (mode === "swipe") {
      refreshSwipeLimit();
    }
  }, [mode, refreshSwipeLimit]);

  const checkAndIncrementWeeklyRecipes = async (recipeId: number | string): Promise<boolean> => {
    if (tierLimits.maxShoppingListWeekly === Infinity) return true;
    const numId = Number(recipeId) || 0;
    const key = `@weekly_recipes_added_${getWeekKey()}`;
    const raw = await AsyncStorage.getItem(key);
    const addedIds: number[] = raw ? JSON.parse(raw) : [];
    if (addedIds.includes(numId)) {
      return true;
    }
    if (addedIds.length >= tierLimits.maxShoppingListWeekly) {
      setAlert({
        visible: true,
        title: "TIER LIMIT REACHED",
        message: getLimitReachedMessage("recipes", tierLimits.maxShoppingListWeekly),
      });
      return false;
    }
    await AsyncStorage.setItem(key, JSON.stringify([...addedIds, numId]));
    return true;
  };

  // Swipe handlers with 3-tier swipe limits
  const handleSwipeRight = async (recipe: Recipe | UnifiedRecipe) => {
    const status = await recordDailySwipe(profile?.id, tier, profile?.trainer_id);
    setSwipeStatus(status);
    if (!status.allowed) {
      setIsLimitReached(true);
      return;
    }

    setDeck((prev) => prev.filter((r) => r.id !== recipe.id));
    const updated = await recordRecipeSwipe(recipe, "like");
    setUserPrefs(updated);

    if (status.remaining <= 0) {
      setIsLimitReached(true);
    } else if (deck.length <= 3) {
      const more = await fetchSwipeDeck(10);
      setDeck((prev) => [...prev, ...more]);
    }
  };

  const handleSwipeLeft = async (recipe: Recipe | UnifiedRecipe) => {
    const status = await recordDailySwipe(profile?.id, tier, profile?.trainer_id);
    setSwipeStatus(status);
    if (!status.allowed) {
      setIsLimitReached(true);
      return;
    }

    setDeck((prev) => prev.filter((r) => r.id !== recipe.id));
    const updated = await recordRecipeSwipe(recipe, "dislike");
    setUserPrefs(updated);

    if (status.remaining <= 0) {
      setIsLimitReached(true);
    } else if (deck.length <= 3) {
      const more = await fetchSwipeDeck(10);
      setDeck((prev) => [...prev, ...more]);
    }
  };

  const handleUpgrade = async (targetTier: "pro" | "athlete") => {
    if (!profile?.id) {
      router.push("/pricing");
      return;
    }
    try {
      setIsUpgradingTier(targetTier);
      const res = await upgradeSubscriptionTier(profile.id, targetTier);
      if (res.success) {
        await refreshProfile();
        const updatedStatus = await getDailySwipeStatus(profile.id, targetTier);
        setSwipeStatus(updatedStatus);
        setIsLimitReached(!updatedStatus.allowed);
        setAlert({
          visible: true,
          title: "TIER UPGRADED",
          message: `Welcome to ${targetTier.toUpperCase()}! You now have ${updatedStatus.limit} daily swipes.`,
        });
      } else {
        router.push("/pricing");
      }
    } catch {
      router.push("/pricing");
    } finally {
      setIsUpgradingTier(null);
    }
  };

  const handleAddToProtocol = async (recipe: Recipe | UnifiedRecipe) => {
    try {
      const allowed = await checkAndIncrementWeeklyRecipes(recipe.id);
      if (!allowed) return;

      const title = recipe.title || recipe.name || "Meal";
      const rawIngs: string[] = (recipe.ingredients && recipe.ingredients.length > 0)
        ? recipe.ingredients
        : [`${title} ingredients`];

      const ex = await AsyncStorage.getItem(PROTOCOL_STORAGE_KEY);
      const curr: string[] = ex ? JSON.parse(ex) : [];
      await AsyncStorage.setItem(PROTOCOL_STORAGE_KEY, JSON.stringify([...curr, ...rawIngs]));

      setAlert({
        visible: true,
        title: "ADDED TO LIST",
        message: `${title} ingredients synced to Shopping List.`,
      });
    } catch {
      setAlert({ visible: true, title: "STORAGE ERROR", message: "Failed to persist to list." });
    }
  };

  const isRateLimited =
    catalogError === "429 Too Many Requests" ||
    catalogError?.includes("429") ||
    catalogError?.toLowerCase().includes("too many requests");

  const emptyTitle = catalogError ? "Connection Error" : "No Meals Found";
  const emptySubtext = isRateLimited
    ? "Refreshing too quickly. Please wait a moment."
    : "Pull down to refresh or check back soon.";
  const emptyIcon = catalogError ? ("ServerCrash" as const) : ("SearchX" as const);

  return (
    <View style={[s.c, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <View style={[s.h, { borderBottomColor: colors.borderSubtle, backgroundColor: colors.surface }]}>
        <View>
          <Text style={[s.sub, { color: colors.primaryText }]}>
            {mode === "swipe" ? "PREFERENCE ENGINE" : "DISCOVERY CATALOG"}
          </Text>
          <Text style={[s.t, { color: colors.text }]}>
            {mode === "swipe" ? "Meal Discovery" : "Recipe Database"}
          </Text>
        </View>

        <View style={s.headerActions}>
          <View style={[s.modeToggle, { backgroundColor: colors.surfaceSubtle, borderColor: colors.cardBorder }]}>
            <TouchableOpacity
              style={[s.modeBtn, mode === "catalog" && { backgroundColor: colors.primary }]}
              onPress={() => setMode("catalog")}
            >
              <Ionicons
                name="grid-outline"
                size={14}
                color={mode === "catalog" ? activeAccentTextColor : colors.primary}
              />
              <Text style={[s.modeText, { color: mode === "catalog" ? activeAccentTextColor : colors.primary }]}>
                GRID
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.modeBtn, mode === "swipe" && { backgroundColor: colors.primary }]}
              onPress={() => setMode("swipe")}
            >
              <Ionicons
                name="flame"
                size={14}
                color={mode === "swipe" ? activeAccentTextColor : colors.primary}
              />
              <Text style={[s.modeText, { color: mode === "swipe" ? activeAccentTextColor : colors.primary }]}>
                SWIPE
              </Text>
            </TouchableOpacity>
          </View>

          {mode === "catalog" && (
            <TouchableOpacity
              style={[s.btn, { backgroundColor: colors.surfaceSubtle, borderColor: colors.cardBorder }]}
              onPress={() => setIsFilterOpen(true)}
            >
              <Ionicons name="filter-outline" size={15} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {mode === "swipe" && (
        <View style={s.swipeContainer}>
          <View style={[s.prefBar, { backgroundColor: colors.surface, borderBottomColor: colors.borderSubtle }]}>
            <View style={s.prefInfo}>
              <Ionicons name="flame" size={14} color={colors.primary} />
              <Text style={[s.prefText, { color: colors.textSecondary }]}>
                {userPrefs?.look_alike_dictionary?.totalSwiped || 0} swiped • Avg{" "}
                {userPrefs?.look_alike_dictionary?.avgProtein || 0}g protein
              </Text>
            </View>
            {swipeStatus && swipeStatus.limit > 0 && (
              <View style={[s.quotaBadge, { backgroundColor: colors.surfaceSubtle, borderColor: colors.cardBorder }]}>
                <Text style={[s.quotaText, { color: colors.textSecondary }]}>
                  {swipeStatus.remaining} / {swipeStatus.limit} left today
                </Text>
              </View>
            )}
            <TouchableOpacity onPress={loadDeck} style={s.refreshBtn}>
              <Ionicons name="refresh" size={14} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {isDeckLoading ? (
            <RecipeSwipeSkeleton />
          ) : isLimitReached ? (
            <View style={s.paywallContainer}>
              <View style={s.paywallIconCircle}>
                <Ionicons name="lock-closed" size={32} color="#4ade80" />
              </View>
              <Text style={s.paywallTitle}>Daily Limit Reached</Text>
              <Text style={s.paywallSub}>
                {getLimitReachedMessage("swipes")}
              </Text>

              {shouldShowPaywall() && (
                <View style={s.paywallActions}>
                  {tier !== "pro" && tier !== "athlete" && (
                    <TouchableOpacity
                      style={s.upgradeProBtn}
                      onPress={() => handleUpgrade("pro")}
                      activeOpacity={0.8}
                      disabled={isUpgradingTier !== null}
                    >
                      {isUpgradingTier === "pro" ? (
                        <ActivityIndicator size="small" color="#020617" />
                      ) : (
                        <>
                          <View style={s.btnContentRow}>
                            <Text style={s.upgradeProBtnText}>Upgrade to Pro</Text>
                            <Text style={s.btnSubText}>5 Daily Swipes • PT Uploads</Text>
                          </View>
                          <Ionicons name="arrow-forward" size={18} color="#020617" />
                        </>
                      )}
                    </TouchableOpacity>
                  )}

                  {tier !== "athlete" && (
                    <TouchableOpacity
                      style={s.upgradeAthleteBtn}
                      onPress={() => handleUpgrade("athlete")}
                      activeOpacity={0.8}
                      disabled={isUpgradingTier !== null}
                    >
                      {isUpgradingTier === "athlete" ? (
                        <ActivityIndicator size="small" color="#f8fafc" />
                      ) : (
                        <>
                          <View style={s.btnContentRow}>
                            <Text style={s.upgradeAthleteBtnText}>Upgrade to Athlete</Text>
                            <Text style={s.athleteBtnSubText}>20 Daily Swipes • Deep Analytics</Text>
                          </View>
                          <Ionicons name="flash" size={18} color="#f59e0b" />
                        </>
                      )}
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={s.viewPlansBtn}
                    onPress={() => router.push("/pricing")}
                    activeOpacity={0.7}
                  >
                    <Text style={s.viewPlansText}>View Full Plan Pricing & Features</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : deck.length === 0 ? (
            <ScrollView
              contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
              refreshControl={
                <RefreshControl
                  refreshing={isDeckLoading}
                  onRefresh={loadDeck}
                  tintColor={colors.tint || colors.primary}
                  colors={[colors.tint || colors.primary]}
                />
              }
            >
              <EmptyState
                icon="SearchX"
                title="Discovery Horizon Reached"
                subtext="Your culinary preferences have been mapped. Pull down to refresh or check back soon."
                buttonText="RELOAD DISCOVERY DECK"
                onRetry={loadDeck}
              />
            </ScrollView>
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
          <View style={[s.chipBarContainer, { backgroundColor: colors.surface, borderBottomColor: colors.borderSubtle }]}>
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
                    style={[
                      s.filterChip,
                      { backgroundColor: colors.card, borderColor: colors.cardBorder },
                      isActive && { backgroundColor: colors.primary, borderColor: colors.primary },
                    ]}
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
                    <Text
                      style={[
                        s.filterChipText,
                        { color: colors.textSecondary },
                        isActive && { color: activeAccentTextColor, fontWeight: "800" },
                      ]}
                    >
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
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              ListEmptyComponent={
                <EmptyState
                  icon={emptyIcon}
                  title={emptyTitle}
                  subtext={emptySubtext}
                  onRetry={handleRefresh}
                />
              }
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
  c: { flex: 1 },
  h: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  sub: { fontSize: 10, fontWeight: "700", color: "#4ade80", letterSpacing: 1 },
  t: { fontSize: 20, fontWeight: "800", color: "#f8fafc" },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  modeToggle: {
    flexDirection: "row",
    backgroundColor: "#171717",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#262626",
    padding: 2,
  },
  modeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 6,
    gap: 6,
    minWidth: 78,
  },
  modeBtnActive: { backgroundColor: "#4ade80" },
  modeText: { fontSize: 11, fontWeight: "800", color: "#4ade80" },
  modeTextActive: { color: "#0a0a0a" },
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
    backgroundColor: "rgba(74, 222, 128, 0.12)",
    borderWidth: 1,
    borderColor: "#4ade80",
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
    backgroundColor: "#4ade80",
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
    backgroundColor: "#4ade80",
    borderColor: "#4ade80",
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94a3b8",
    letterSpacing: 0.2,
  },
  filterChipTextActive: {
    color: "#0a0a0a",
  },
  pills: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#262626",
  },
  pill: {
    backgroundColor: "rgba(74, 222, 128, 0.15)",
    borderColor: "#4ade80",
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pText: { fontSize: 9, fontWeight: "700", color: "#4ade80" },
  list: { padding: 8, paddingBottom: 30 },
  quotaBadge: {
    backgroundColor: "#171717",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(74, 222, 128, 0.3)",
  },
  quotaText: {
    color: "#cbd5e1",
    fontSize: 10,
    fontWeight: "700",
  },
  paywallContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },
  paywallIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "rgba(74, 222, 128, 0.12)",
    borderWidth: 1.5,
    borderColor: "#4ade80",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#4ade80",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  paywallTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#f8fafc",
    marginBottom: 10,
    letterSpacing: -0.4,
    textAlign: "center",
  },
  paywallSub: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 28,
    maxWidth: 320,
  },
  paywallActions: {
    width: "100%",
    maxWidth: 340,
    gap: 12,
  },
  upgradeProBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#4ade80",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    shadowColor: "#4ade80",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  btnContentRow: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  upgradeProBtnText: {
    color: "#0a0a0a",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  btnSubText: {
    color: "#1e1b4b",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2,
  },
  upgradeAthleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#0f172a",
    borderWidth: 1.5,
    borderColor: "#f59e0b",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    shadowColor: "#f59e0b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  upgradeAthleteBtnText: {
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  athleteBtnSubText: {
    color: "#f59e0b",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2,
  },
  viewPlansBtn: {
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  viewPlansText: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  footerLoading: { paddingVertical: 16, alignItems: "center" },
  footerText: { fontSize: 11, color: "#64748b", fontWeight: "600" },
});

