import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../lib/supabase";
import { LookAlikeDictionary, Recipe, UserPreferences } from "../types/database";

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

export interface RecipeCatalogParams {
  selectedTag?: string | null;
  under30Mins?: boolean;
  simplicitySort?: boolean;
  sortByProtein?: boolean;
  page?: number;
  pageSize?: number;
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

export function normalizeRecipe(item: any): Recipe {
  const images = parseJsonbArray(item?.images);
  if (images.length === 0 && item?.image_url) {
    images.push(item.image_url);
  }

  return {
    id: Number(item?.id),
    title: String(item?.title || "Untitled Recipe"),
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
    image_url: images[0] || item?.image_url || undefined,
  };
}

/**
 * High-performance recipes retrieval from Supabase.
 * Strictly queries the new PostgreSQL schema columns for the 44k catalog:
 * id, title, images, tags, ingredients, ingredient_quantities, instructions,
 * calories, protein, carbs, fats, saturated_fats, cholesterol, sodium, fiber, sugar, servings,
 * cook_time, prep_time, total_time
 */
export async function fetchRecipesCatalog({
  selectedTag = null,
  under30Mins = false,
  simplicitySort = false,
  sortByProtein = false,
  page = 0,
  pageSize = 40,
}: RecipeCatalogParams): Promise<RecipeQueryResult> {
  try {
    const from = page * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("recipes")
      .select(RECIPE_COLUMNS, { count: "planned" });

    // Apply JSON containment filter for tags using GIN index
    if (selectedTag && selectedTag.trim() !== "") {
      query = query.filter("tags", "cs", JSON.stringify([selectedTag.trim()]));
    }

    // High performance sorting backed by PostgreSQL indexes
    if (sortByProtein) {
      query = query.order("protein", { ascending: false });
    } else if (simplicitySort) {
      query = query.order("servings", { ascending: true });
    } else {
      query = query.order("calories", { ascending: false });
    }

    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error("[recipeService] Supabase query failed:", error.message, error.details);
      return { data: [], error: error.message, hasMore: false };
    }

    const rawList = (data as any[]) || [];
    let recipes = rawList.map(normalizeRecipe);

    // If under30Mins is requested, filter in memory or based on cook_time numeric match
    if (under30Mins) {
      recipes = recipes.filter((r) => {
        const match = r.cook_time.match(/\d+/);
        return match ? parseInt(match[0], 10) <= 30 : true;
      });
    }

    const hasMore = count ? from + rawList.length < count : rawList.length === pageSize;

    return { data: recipes, error: null, hasMore };
  } catch (err: any) {
    console.error("[recipeService] Unexpected fetch error:", err);
    return { data: [], error: err?.message || "Failed to query recipe database.", hasMore: false };
  }
}


/**
 * Fetch a deck of recipes for the Tinder-style Swipe Protocol.
 * Prioritizes recipes that the user hasn't swiped on yet.
 */
export async function fetchSwipeDeck(limit: number = 20): Promise<Recipe[]> {
  try {
    const prefs = await getUserPreferences();
    const excludedIds = [...prefs.liked_recipe_ids, ...prefs.disliked_recipe_ids];

    const randomOffset = Math.floor(Math.random() * 500);

    let query = supabase
      .from("recipes")
      .select(RECIPE_COLUMNS)
      .order("protein", { ascending: false })
      .range(randomOffset, randomOffset + limit + 25);

    const { data, error } = await query;
    if (error) {
      console.error("[recipeService] Deck fetch failed:", error.message);
      return [];
    }

    const all = (data || []).map(normalizeRecipe);
    const filtered = all
      .filter((r) => r.images && r.images.length > 0 && !excludedIds.includes(Number(r.id)))
      .slice(0, limit);
    return filtered;
  } catch (err) {
    console.error("[recipeService] Deck fetch unexpected exception:", err);
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

/**
 * Record a Swipe Action (Right = Like, Left = Dislike)
 * Dynamically adapts the Look-Alikes dictionary and syncs to Supabase & AsyncStorage.
 */
export async function recordRecipeSwipe(
  recipe: Recipe,
  action: "like" | "dislike"
): Promise<UserPreferences> {
  const current = await getUserPreferences();
  const numId = Number(recipe.id);

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

  const updated: UserPreferences = {
    ...current,
    liked_recipe_ids:
      action === "like"
        ? Array.from(new Set([...current.liked_recipe_ids, numId]))
        : current.liked_recipe_ids,
    disliked_recipe_ids:
      action === "dislike"
        ? Array.from(new Set([...current.disliked_recipe_ids, numId]))
        : current.disliked_recipe_ids,
    liked_tags:
      action === "like"
        ? Array.from(new Set([...current.liked_tags, ...rawTags]))
        : current.liked_tags,
    disliked_tags:
      action === "dislike"
        ? Array.from(new Set([...current.disliked_tags, ...rawTags]))
        : current.disliked_tags,
    liked_ingredients:
      action === "like"
        ? Array.from(new Set([...current.liked_ingredients, ...rawIngs]))
        : current.liked_ingredients,
    disliked_ingredients:
      action === "dislike"
        ? Array.from(new Set([...current.disliked_ingredients, ...rawIngs]))
        : current.disliked_ingredients,
    look_alike_dictionary: calculateLookAlikes(
      current.look_alike_dictionary,
      recipe,
      action,
      rawTags,
      rawIngs
    ),
    updated_at: new Date().toISOString(),
  };

  await AsyncStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(updated));

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;
    if (userId) {
      await supabase.from("user_preferences").upsert({
        user_id: userId,
        liked_recipe_ids: updated.liked_recipe_ids,
        disliked_recipe_ids: updated.disliked_recipe_ids,
        liked_tags: updated.liked_tags,
        disliked_tags: updated.disliked_tags,
        liked_ingredients: updated.liked_ingredients,
        disliked_ingredients: updated.disliked_ingredients,
        look_alike_dictionary: updated.look_alike_dictionary,
        updated_at: updated.updated_at,
      });
    }
  } catch (err) {
    console.warn("[recipeService] Remote sync skipped:", err);
  }

  return updated;
}

function calculateLookAlikes(
  currentDict: LookAlikeDictionary,
  recipe: Recipe,
  action: "like" | "dislike",
  tags: string[],
  ingredients: string[]
): LookAlikeDictionary {
  const total = (currentDict?.totalSwiped || 0) + 1;
  const isLike = action === "like";

  let newAvgCals = currentDict?.avgCalories || 0;
  let newAvgProt = currentDict?.avgProtein || 0;

  if (isLike) {
    const likeCount = Math.max(1, (currentDict?.preferredTags?.length > 0 ? 1 : 0) + 1);
    newAvgCals = Math.round((newAvgCals * (likeCount - 1) + (recipe.calories || 0)) / likeCount);
    newAvgProt = Math.round((newAvgProt * (likeCount - 1) + (recipe.protein || 0)) / likeCount);
  }

  const preferredTags = isLike
    ? Array.from(new Set([...(currentDict?.preferredTags || []), ...tags])).slice(-20)
    : (currentDict?.preferredTags || []).filter((t) => !tags.includes(t));

  const preferredIngredients = isLike
    ? Array.from(new Set([...(currentDict?.preferredIngredients || []), ...ingredients])).slice(-40)
    : (currentDict?.preferredIngredients || []).filter((i) => !ingredients.includes(i));

  const dislikedTags = !isLike
    ? Array.from(new Set([...(currentDict?.dislikedTags || []), ...tags])).slice(-20)
    : currentDict?.dislikedTags || [];

  const dislikedIngredients = !isLike
    ? Array.from(new Set([...(currentDict?.dislikedIngredients || []), ...ingredients])).slice(-40)
    : currentDict?.dislikedIngredients || [];

  return {
    preferredTags,
    preferredIngredients,
    dislikedTags,
    dislikedIngredients,
    avgCalories: newAvgCals,
    avgProtein: newAvgProt,
    totalSwiped: total,
  };
}

