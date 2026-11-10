import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../lib/supabase";
import { LookAlikeDictionary, Recipe, UnifiedRecipe, UserPreferences } from "../types/database";
import {
  isCircuitBreakerOpen,
  recordCircuitFailure,
  recordCircuitSuccess,
} from "../utils/circuitBreaker";

const PREFERENCES_STORAGE_KEY = "@user_recipe_preferences_v1";

const DEFAULT_PREFERENCES: UserPreferences = {
  liked_recipe_ids: [],
  disliked_recipe_ids: [],
  liked_tags: [],
  disliked_tags: [],
  liked_ingredients: [],
  disliked_ingredients: [],
  look_alike_dictionary: {
    preferredTags: [],
    preferredIngredients: [],
    dislikedTags: [],
    dislikedIngredients: [],
    avgCalories: 0,
    avgProtein: 0,
    totalSwiped: 0,
  },
};

export interface RecipeSortOptions {
  preferences?: UserPreferences | null;
  macroGoals?: {
    targetCalories?: number;
    targetProtein?: number;
    targetCarbs?: number;
    targetFats?: number;
    mealsPerDay?: number;
  };
  dietaryPreferences?: string | string[] | null;
  isPro?: boolean;
  localHour?: number;
  strictDietaryFilter?: boolean;
}

export interface RecipeCatalogParams {
  selectedTag?: string | null;
  under30Mins?: boolean;
  simplicitySort?: boolean;
  sortByProtein?: boolean;
  page?: number;
  pageSize?: number;
  sortOptions?: RecipeSortOptions;
}

export interface RecipeQueryResult {
  data: Recipe[];
  error: string | null;
  hasMore: boolean;
}

const RECIPE_COLUMNS =
  "id, title, images, tags, ingredients, ingredient_quantities, instructions, calories, protein, carbs, fats, saturated_fats, cholesterol, sodium, fiber, sugar, servings, cook_time, prep_time, total_time";

function parseJsonbArray(val: any): string[] {
  if (Array.isArray(val)) return val.map((v) => (typeof v === "string" ? v : JSON.stringify(v)));
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed.map((v) => (typeof v === "string" ? v : JSON.stringify(v)));
      return [val];
    } catch {
      return val ? [val] : [];
    }
  }
  return [];
}

function cleanHttpsUrl(url: any): string | null {
  if (typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http://")) return "https://" + trimmed.slice(7);
  if (trimmed.startsWith("//")) return "https:" + trimmed;
  return trimmed;
}

export function normalizeRecipe(item: any): Recipe {
  let images = parseJsonbArray(item?.images)
    .map(cleanHttpsUrl)
    .filter((u): u is string => Boolean(u));

  const directImg = cleanHttpsUrl(
    item?.image_url ||
    (typeof item?.recipe_image === "string" ? item.recipe_image : item?.recipe_image?.image_url)
  );

  if (images.length === 0 && directImg) {
    images.push(directImg);
  }

  const rawId = item?.id;
  const numId = Number(rawId);
  const safeId = !isNaN(numId) && String(numId) === String(rawId).trim() ? numId : String(rawId || "");

  return {
    id: safeId,
    title: String(item?.title || item?.name || "Untitled Recipe"),
    name: String(item?.name || item?.title || "Untitled Recipe"),
    source: item?.source || (String(safeId).startsWith("fatsecret_") ? "fatsecret" : "local"),
    images,
    tags: parseJsonbArray(item?.tags),
    ingredients: parseJsonbArray(item?.ingredients),
    ingredient_quantities: parseJsonbArray(item?.ingredient_quantities),
    instructions: parseJsonbArray(item?.instructions),
    calories: Number(item?.calories) || 0,
    protein: Number(item?.protein) || 0,
    carbs: Number(item?.carbs) || 0,
    fats: Number(item?.fats) || 0,
    saturated_fats: Number(item?.saturated_fats ?? item?.saturated_fat) || 0,
    cholesterol: Number(item?.cholesterol) || 0,
    sodium: Number(item?.sodium) || 0,
    fiber: Number(item?.fiber) || 0,
    sugar: Number(item?.sugar) || 0,
    servings: Number(item?.servings) || 1,
    cook_time: String(item?.cook_time || "0"),
    prep_time: String(item?.prep_time || "0"),
    total_time: String(item?.total_time || "0"),
    image_url: images[0] || directImg || undefined,
  };
}

async function checkUserIsPro(userId?: string): Promise<boolean> {
  if (!userId) return false;
  try {
    const { data } = await supabase
      .from("profiles")
      .select("subscription_status, is_pro")
      .eq("id", userId)
      .maybeSingle();
    return (
      data?.is_pro === true ||
      data?.subscription_status === "pro" ||
      data?.subscription_status === "athlete"
    );
  } catch {
    return false;
  }
}

function getTimeOfDayBoostTags(hour: number): string[] {
  if (hour >= 5 && hour < 11) {
    return ["breakfast", "morning", "brunch", "pancake", "oatmeal", "egg", "smoothie"];
  }
  if (hour >= 11 && hour < 15) {
    return ["lunch", "salad", "sandwich", "wrap", "bowl", "quick"];
  }
  if (hour >= 15 && hour < 18) {
    return ["snack", "shake", "protein bar", "smoothie", "high-protein"];
  }
  if (hour >= 18 && hour < 23) {
    return ["dinner", "supper", "steak", "chicken", "salmon", "pasta", "beef"];
  }
  return ["late-night", "snack", "light", "casein"];
}
const RESTRICTION_FORBIDDEN_TERMS: Record<string, string[]> = {
  vegetarian: [
    "chicken", "beef", "pork", "bacon", "turkey", "lamb", "veal", "steak",
    "ham", "fish", "salmon", "tuna", "shrimp", "prawn", "crab", "gelatin", "lard"
  ],
  vegan: [
    "chicken", "beef", "pork", "bacon", "turkey", "lamb", "veal", "steak",
    "ham", "fish", "salmon", "tuna", "shrimp", "prawn", "crab", "egg", "eggs",
    "milk", "cheese", "butter", "yogurt", "whey", "honey", "cream", "dairy", "gelatin", "lard"
  ],
  pescatarian: [
    "chicken", "beef", "pork", "bacon", "turkey", "lamb", "veal", "steak", "ham", "lard"
  ],
  halal: [
    "pork", "bacon", "ham", "lard", "swine", "prosciutto", "pancetta", "pepperoni", "alcohol", "wine", "beer"
  ],
  kosher: [
    "pork", "bacon", "ham", "lard", "swine", "shellfish", "shrimp", "prawn", "crab", "lobster", "clam", "mussel", "oyster", "scallop"
  ],
  "dairy-free": [
    "milk", "cheese", "butter", "yogurt", "cream", "whey", "casein", "lactose"
  ],
  "gluten-free": [
    "flour", "wheat", "bread", "pasta", "barley", "rye", "couscous", "soy sauce"
  ],
  "nut-free": [
    "peanut", "almond", "walnut", "cashew", "pecan", "pistachio", "hazelnut", "macadamia"
  ],
  "shellfish-free": [
    "shellfish", "shrimp", "prawn", "crab", "lobster", "clam", "mussel", "oyster", "scallop"
  ],
};


/**
 * Calculates preference weight for any recipe.
 * Factors in dietary restrictions (penalty or bonus), favorite & disliked ingredients,
 * liked & disliked tags, macro goal alignment (calories & protein per meal),
 * Pro chrono-nutrition (time of day), and swipe history (look-alike calibration).
 */
export function calculateRecipeWeight(
  recipe: Recipe | UnifiedRecipe,
  options: RecipeSortOptions = {}
): number {
  let score = 0;
  const prefs = options.preferences;
  const dict = prefs?.look_alike_dictionary;

  const recipeTags = (recipe.tags || []).map((t) => String(t).toLowerCase());
  const recipeIngs = (recipe.ingredients || []).map((i) => String(i).toLowerCase());

  // 1. Dietary Restrictions & Allergen Enforcement (Heaviest Weight / Disqualification)
  const restrictionTokens: string[] = [];
  if (typeof options.dietaryPreferences === "string") {
    restrictionTokens.push(
      ...options.dietaryPreferences
        .toLowerCase()
        .split(/[,;\n]+/)
        .map((s) => s.trim())
        .filter(Boolean)
    );
  } else if (Array.isArray(options.dietaryPreferences)) {
    restrictionTokens.push(
      ...options.dietaryPreferences.map((s) => String(s).toLowerCase().trim())
    );
  }
  if (Array.isArray(prefs?.dietary_restrictions)) {
    restrictionTokens.push(
      ...prefs.dietary_restrictions.map((s) => String(s).toLowerCase().trim())
    );
  }

  for (const token of restrictionTokens) {
    for (const [key, forbiddenList] of Object.entries(RESTRICTION_FORBIDDEN_TERMS)) {
      if (token.includes(key) || key.includes(token)) {
        const hasViolation = forbiddenList.some((term) =>
          recipeIngs.some((ing) => ing.includes(term)) ||
          recipeTags.some((tag) => tag.includes(term))
        );
        if (hasViolation) {
          score -= 2000;
        } else if (recipeTags.some((tag) => tag.includes(key))) {
          score += 25;
        }
      }
    }
  }

  // 2. Favorite & Preferred Ingredients (+5 per match, -10 for disliked)
  const favoriteIngs = [
    ...(prefs?.favorite_ingredients || []),
    ...(prefs?.liked_ingredients || []),
    ...(dict?.preferredIngredients || []),
  ].map((i) => String(i).toLowerCase());

  const dislikedIngs = [
    ...(prefs?.disliked_ingredients || []),
    ...(dict?.dislikedIngredients || []),
  ].map((i) => String(i).toLowerCase());

  for (const ing of recipeIngs) {
    if (favoriteIngs.some((fav) => ing.includes(fav) || fav.includes(ing))) {
      score += 5;
    }
    if (dislikedIngs.some((dis) => ing.includes(dis) || dis.includes(ing))) {
      score -= 10;
    }
  }

  // 3. Liked & Disliked Tags (+4 per match, -8 for disliked)
  const preferredTags = [
    ...(prefs?.liked_tags || []),
    ...(dict?.preferredTags || []),
  ].map((t) => String(t).toLowerCase());

  const dislikedTags = [
    ...(prefs?.disliked_tags || []),
    ...(dict?.dislikedTags || []),
  ].map((t) => String(t).toLowerCase());

  for (const t of recipeTags) {
    if (preferredTags.some((pt) => pt === t || t.includes(pt))) score += 4;
    if (dislikedTags.some((dt) => dt === t || t.includes(dt))) score -= 8;
  }

  // 4. Macro Goals Alignment
  const targetCals = options.macroGoals?.targetCalories;
  const targetProt = options.macroGoals?.targetProtein;
  const mealsPerDay = options.macroGoals?.mealsPerDay || 3;

  if (targetCals && targetCals > 0) {
    const mealTargetCals = Math.round(targetCals / mealsPerDay);
    const calDiffRatio = Math.abs((recipe.calories || 0) - mealTargetCals) / mealTargetCals;
    if (calDiffRatio <= 0.15) {
      score += 20;
    } else if (calDiffRatio <= 0.30) {
      score += 10;
    } else if (calDiffRatio > 0.50) {
      score -= 15;
    }
  }

  if (targetProt && targetProt > 0) {
    const mealTargetProt = Math.round(targetProt / mealsPerDay);
    const protVal = recipe.protein || 0;
    if (protVal >= mealTargetProt * 0.9) {
      score += 20;
    } else if (protVal >= mealTargetProt * 0.7) {
      score += 10;
    } else if (protVal < mealTargetProt * 0.4) {
      score -= 15;
    }
  }

  // 5. Look-Alike Swipe Calibration (Historic likes)
  if (dict && (dict.totalSwiped || 0) >= 3) {
    if (dict.avgCalories > 0) {
      const calProx = Math.abs((recipe.calories || 0) - dict.avgCalories) / dict.avgCalories;
      if (calProx <= 0.20) score += 10;
    }
    if (dict.avgProtein > 0) {
      const protProx = Math.abs((recipe.protein || 0) - dict.avgProtein) / dict.avgProtein;
      if (protProx <= 0.20) score += 10;
    }
  }

  // 6. Pro Chrono-Nutrition (Time of day matching)
  if (options.isPro) {
    const hour = options.localHour ?? new Date().getHours();
    const boostTags = getTimeOfDayBoostTags(hour);
    for (const bt of boostTags) {
      if (recipeTags.some((rt) => rt.includes(bt))) {
        score += 18;
      }
    }
  }

  return score;
}

/**
 * Sorts and filters an array of recipes based on user preferences and constraints.
 */
export function sortAndFilterRecipesByPreferences<T extends Recipe | UnifiedRecipe>(
  recipes: T[],
  options: RecipeSortOptions = {}
): T[] {
  if (!recipes || recipes.length === 0) return [];

  const scored = recipes.map((recipe) => ({
    recipe,
    score: calculateRecipeWeight(recipe, options),
  }));

  let filtered = scored;
  if (options.strictDietaryFilter) {
    const safeOnly = scored.filter((item) => item.score > -1000);
    if (safeOnly.length > 0) {
      filtered = safeOnly;
    }
  }

  filtered.sort((a, b) => b.score - a.score);
  return filtered.map((item) => item.recipe);
}

/**
 * Recipe Catalog retrieval through the unified 'get-recipes' Edge Function.
 * Merges curated local database meals and real-time FatSecret external recipes.
 * Eliminates direct client-side querying against local database tables.
 */
export async function fetchRecipesCatalog({
  selectedTag = null,
  under30Mins = false,
  simplicitySort = false,
  sortByProtein = false,
  page = 0,
  pageSize = 40,
  sortOptions,
}: RecipeCatalogParams): Promise<RecipeQueryResult> {
  const breakerStatus = isCircuitBreakerOpen("fatsecret");
  if (breakerStatus.isOpen) {
    console.warn("[recipeService] FatSecret Circuit Breaker is OPEN. Bypassing external catalog queries.");
  }

  try {
    const { data: edgeData, error: edgeError } = await supabase.functions.invoke(
      "get-recipes",
      {
        body: {
          action: "fetch_catalog",
          page: page + 1,
          limit: pageSize,
          pageSize,
          selectedTag,
          under30Mins,
          simplicitySort,
          sortByProtein,
        },
      }
    );

    if (edgeError) {
      recordCircuitFailure("fatsecret", edgeError);
      console.error("[recipeService] 'get-recipes' catalog error:", edgeError);
      const status = (edgeError as any).context?.status ?? (edgeError as any).status;
      const is429 =
        status === 429 ||
        edgeError.message?.includes("429") ||
        edgeError.message?.toLowerCase().includes("too many requests");
      return {
        data: [],
        error: is429 ? "429 Too Many Requests" : (edgeError.message || "Failed to load recipes."),
        hasMore: false,
      };
    }

    recordCircuitSuccess("fatsecret");

    const rawList = edgeData?.data || edgeData?.recipes || [];
    let recipes: Recipe[] = rawList.map(normalizeRecipe);

    // Apply preference-driven sorting & filtering if options provided
    if (sortOptions) {
      recipes = sortAndFilterRecipesByPreferences(recipes, sortOptions);
    }

    const hasMore = recipes.length >= pageSize;

    return {
      data: recipes,
      error: null,
      hasMore,
    };
  } catch (err: any) {
    recordCircuitFailure("fatsecret", err);
    console.error("[recipeService] fetchRecipesCatalog exception:", err);
    const status = err?.context?.status ?? err?.status;
    const is429 =
      status === 429 ||
      err?.message?.includes("429") ||
      err?.message?.toLowerCase().includes("too many requests");
    return {
      data: [],
      error: is429 ? "429 Too Many Requests" : (err?.message || "Failed to load recipes."),
      hasMore: false,
    };
  }
}

/**
 * Fetches full details for a single recipe by its ID via the 'get-recipes' Edge Function.
 * Seamlessly resolves external FatSecret meals (e.g. 'fatsecret_1234') or local DB meals.
 */
export async function fetchRecipeById(id: string | number): Promise<Recipe | null> {
  const isExternal = String(id).startsWith("fatsecret_");
  if (isExternal) {
    const breakerStatus = isCircuitBreakerOpen("fatsecret");
    if (breakerStatus.isOpen) {
      console.warn("[recipeService] FatSecret Breaker is OPEN. Skipping external recipe lookup:", id);
      return null;
    }
  }

  try {
    const { data, error } = await supabase.functions.invoke("get-recipes", {
      body: {
        action: "get_recipe",
        id: String(id),
      },
    });

    if (error || !data) {
      if (isExternal) {
        recordCircuitFailure("fatsecret", error || "External recipe not found");
      }
      console.error("[recipeService] fetchRecipeById error:", error);
      return null;
    }

    if (isExternal) {
      recordCircuitSuccess("fatsecret");
    }

    const item = data?.data || data?.recipe;
    return item ? normalizeRecipe(item) : null;
  } catch (err: any) {
    if (isExternal) {
      recordCircuitFailure("fatsecret", err);
    }
    console.error("[recipeService] fetchRecipeById exception:", err);
    return null;
  }
}


/**
 * Fetch a deck of recipes for the Tinder-style Swipe Protocol.
 * Calls the 'get-recipes' Edge Function to mix local database recipes and FatSecret API meals.
 * Direct database calls to supabase.from('recipes') are completely eliminated.
 */
export async function fetchSwipeDeck(
  limit: number = 20,
  targets?: {
    targetCalories?: number;
    targetProtein?: number;
    targetCarbs?: number;
    targetFats?: number;
    mealsPerDay?: number;
  },
  sortOptions?: RecipeSortOptions
): Promise<UnifiedRecipe[]> {
  const breakerStatus = isCircuitBreakerOpen("fatsecret");
  if (breakerStatus.isOpen) {
    console.warn("[recipeService] FatSecret Breaker is OPEN. Bypassing swipe deck lookup.");
    return [];
  }

  try {
    // Normalise daily macro targets into single-meal target bounds for accurate recipe matching
    const mealsPerDay = Math.max(1, targets?.mealsPerDay || 3);
    const mealPayload = targets
      ? {
          targetCalories: targets.targetCalories
            ? Math.round(targets.targetCalories / mealsPerDay)
            : undefined,
          targetProtein: targets.targetProtein
            ? Math.round(targets.targetProtein / mealsPerDay)
            : undefined,
          targetCarbs: targets.targetCarbs
            ? Math.round(targets.targetCarbs / mealsPerDay)
            : undefined,
          targetFats: targets.targetFats
            ? Math.round(targets.targetFats / mealsPerDay)
            : undefined,
          mealsPerDay,
          tolerance: 0.35,
        }
      : {};

    const { data, error } = await supabase.functions.invoke("get-recipes", {
      body: {
        action: "fetch_deck",
        limit,
        ...mealPayload,
      },
    });

    if (error) {
      recordCircuitFailure("fatsecret", error);
      console.error("[recipeService] 'get-recipes' Edge Function error:", error);
      return [];
    }

    recordCircuitSuccess("fatsecret");

    let deck: UnifiedRecipe[] = [];
    if (Array.isArray(data?.data)) {
      deck = data.data as UnifiedRecipe[];
    } else if (Array.isArray(data)) {
      deck = data as UnifiedRecipe[];
    }

    if (sortOptions && deck.length > 0) {
      deck = sortAndFilterRecipesByPreferences(deck, sortOptions);
    }

    return deck;
  } catch (err) {
    recordCircuitFailure("fatsecret", err);
    console.error("[recipeService] fetchSwipeDeck unexpected exception:", err);
    return [];
  }
}

/**
 * Retrieve cached or synced User Preferences and Look-Alikes dictionary
 */
export async function getUserPreferences(): Promise<UserPreferences> {
  try {
    const local = await AsyncStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (local) {
      return JSON.parse(local);
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;
    if (userId) {
      const { data } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (data) {
        await AsyncStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(data));
        return data as UserPreferences;
      }
    }

    return DEFAULT_PREFERENCES;
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

let syncDebounceTimer: ReturnType<typeof setTimeout> | null = null;

function syncPreferencesToSupabase(prefs: UserPreferences) {
  if (syncDebounceTimer) {
    clearTimeout(syncDebounceTimer);
  }

  syncDebounceTimer = setTimeout(async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      if (userId) {
        await supabase.from("user_preferences").upsert({
          user_id: userId,
          liked_recipe_ids: prefs.liked_recipe_ids.map(Number).filter((n) => !isNaN(n)),
          disliked_recipe_ids: prefs.disliked_recipe_ids.map(Number).filter((n) => !isNaN(n)),
          liked_tags: prefs.liked_tags,
          disliked_tags: prefs.disliked_tags,
          liked_ingredients: prefs.liked_ingredients,
          disliked_ingredients: prefs.disliked_ingredients,
          look_alike_dictionary: prefs.look_alike_dictionary,
          updated_at: prefs.updated_at,
        });
      }
    } catch (err) {
      console.warn("[recipeService] Remote sync skipped:", err);
    }
  }, 1200);
}

/**
 * Record a Swipe Action (Right = Like, Left = Dislike)
 * Dynamically adapts the Look-Alikes dictionary via EMA and syncs to Supabase (debounced) & AsyncStorage.
 */
export async function recordRecipeSwipe(
  recipe: Recipe | UnifiedRecipe,
  action: "like" | "dislike"
): Promise<UserPreferences> {
  const current = await getUserPreferences();
  const numId = Number(recipe.id) || 0;

  const rawTags: string[] = Array.isArray(recipe.tags)
    ? recipe.tags
    : typeof (recipe.tags as any) === "string"
    ? [(recipe.tags as any)]
    : [];

  const rawIngs: string[] = Array.isArray(recipe.ingredients)
    ? recipe.ingredients
    : typeof (recipe.ingredients as any) === "string"
    ? (recipe.ingredients as any).split(",").map((s: string) => s.trim().toLowerCase())
    : [];

  const lookAlikes = calculateLookAlikes(
    current.look_alike_dictionary as any,
    recipe,
    action,
    rawTags,
    rawIngs
  );

  const updated: UserPreferences = {
    ...current,
    liked_recipe_ids:
      action === "like"
        ? Array.from(new Set([...current.liked_recipe_ids, numId])).slice(-50)
        : current.liked_recipe_ids,
    disliked_recipe_ids:
      action === "dislike"
        ? Array.from(new Set([...current.disliked_recipe_ids, numId])).slice(-50)
        : current.disliked_recipe_ids,
    liked_tags: lookAlikes.preferredTags,
    disliked_tags: lookAlikes.dislikedTags,
    liked_ingredients: lookAlikes.preferredIngredients,
    disliked_ingredients: lookAlikes.dislikedIngredients,
    look_alike_dictionary: lookAlikes,
    updated_at: new Date().toISOString(),
  };

  await AsyncStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(updated));
  syncPreferencesToSupabase(updated);

  return updated;
}

function calculateLookAlikes(
  currentDict: LookAlikeDictionary & {
    tagScores?: Record<string, number>;
    ingredientScores?: Record<string, number>;
  },
  recipe: Recipe | UnifiedRecipe,
  action: "like" | "dislike",
  tags: string[],
  ingredients: string[]
): LookAlikeDictionary {
  const total = (currentDict?.totalSwiped || 0) + 1;
  const isLike = action === "like";

  // 1. Recency-weighted Exponential Moving Average (EMA) for Macros
  const recipeCals = Number(recipe.calories) || 0;
  const recipeProt = Number(recipe.protein) || 0;
  let newAvgCals = currentDict?.avgCalories || 0;
  let newAvgProt = currentDict?.avgProtein || 0;

  if (isLike && recipeCals > 0) {
    if (newAvgCals === 0) {
      newAvgCals = recipeCals;
      newAvgProt = recipeProt;
    } else {
      // 30% weight to current swipe, 70% weight to decaying history
      newAvgCals = Math.round(newAvgCals * 0.7 + recipeCals * 0.3);
      newAvgProt = Math.round(newAvgProt * 0.7 + recipeProt * 0.3);
    }
  }

  // 2. Exponential Recency Decay for Tags (decay factor 0.88 per swipe)
  const tagScores: Record<string, number> = { ...(currentDict?.tagScores || {}) };
  for (const t of Object.keys(tagScores)) {
    tagScores[t] = tagScores[t] * 0.88;
    if (Math.abs(tagScores[t]) < 0.08) {
      delete tagScores[t];
    }
  }

  for (const t of tags) {
    const key = t.toLowerCase().trim();
    if (!key) continue;
    tagScores[key] = (tagScores[key] || 0) + (isLike ? 1.0 : -1.0);
  }

  // 3. Exponential Recency Decay for Ingredients
  const ingredientScores: Record<string, number> = { ...(currentDict?.ingredientScores || {}) };
  for (const i of Object.keys(ingredientScores)) {
    ingredientScores[i] = ingredientScores[i] * 0.88;
    if (Math.abs(ingredientScores[i]) < 0.08) {
      delete ingredientScores[i];
    }
  }

  for (const i of ingredients) {
    const key = i.toLowerCase().trim();
    if (!key) continue;
    ingredientScores[key] = (ingredientScores[key] || 0) + (isLike ? 1.0 : -1.0);
  }

  // Rank and extract preferred (>= 0.45) & disliked (<= -0.45)
  const sortedTags = Object.entries(tagScores).sort((a, b) => b[1] - a[1]);
  const preferredTags = sortedTags.filter(([, s]) => s >= 0.45).slice(0, 20).map(([t]) => t);
  const dislikedTags = sortedTags.filter(([, s]) => s <= -0.45).reverse().slice(0, 20).map(([t]) => t);

  const sortedIngs = Object.entries(ingredientScores).sort((a, b) => b[1] - a[1]);
  const preferredIngredients = sortedIngs.filter(([, s]) => s >= 0.45).slice(0, 30).map(([i]) => i);
  const dislikedIngredients = sortedIngs.filter(([, s]) => s <= -0.45).reverse().slice(0, 30).map(([i]) => i);

  return {
    preferredTags,
    preferredIngredients,
    dislikedTags,
    dislikedIngredients,
    avgCalories: newAvgCals,
    avgProtein: newAvgProt,
    totalSwiped: total,
    tagScores,
    ingredientScores,
  } as any;
}

