import { createClient, SupabaseClient } from "jsr:@supabase/supabase-js@^2";

const proxyUrl = Deno.env.get("FATSECRET_PROXY_URL");

// Setup the Secure Proxy Client exactly like lookup.txt
let proxyClient: Deno.HttpClient | undefined = undefined;
if (proxyUrl) {
  proxyClient = Deno.createHttpClient({
    proxy: { url: proxyUrl },
  });
}

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

/**
 * Unified recipe data structure across local Supabase recipes and external FatSecret meals.
 */
export interface UnifiedRecipe {
  id: string | number;
  source: "local" | "fatsecret";
  name: string;
  title?: string;
  image_url: string | null;
  images?: string[];
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  prep_time: number;
  cook_time?: string;
  total_time?: string;
  servings?: number;
  tags?: string[];
  ingredients?: string[];
  instructions?: string[];
}

export interface RequestPayload {
  action?: "search" | "get_recipe" | "fetch_deck" | "fetch_catalog";
  id?: string | number;
  recipe_id?: string | number;
  targetCalories?: number;
  targetProtein?: number;
  targetCarbs?: number;
  targetFats?: number;
  target_calories?: number;
  target_protein?: number;
  target_carbs?: number;
  target_fats?: number;
  tolerance?: number;
  limit?: number;
  pageSize?: number;
  page?: number;
  query?: string;
  search?: string;
  selectedTag?: string | null;
  under30Mins?: boolean;
  sortByProtein?: boolean;
  simplicitySort?: boolean;
}

/**
 * Forces HTTP image links to HTTPS to satisfy modern mobile security & ATS requirements.
 */
export function enforceHttps(url: unknown): string | null {
  if (typeof url !== "string") return null;
  const trimmed = url.trim();
  if (trimmed.length === 0) return null;
  if (trimmed.startsWith("http://")) {
    return "https://" + trimmed.slice(7);
  }
  if (trimmed.startsWith("//")) {
    return "https:" + trimmed;
  }
  return trimmed;
}

/**
 * Robustly extracts an image URL from various FatSecret payload structures
 */
export function extractFatSecretImageUrl(raw: any): string | null {
  if (!raw) return null;

  if (typeof raw === "string") {
    return enforceHttps(raw);
  }

  if (typeof raw.recipe_image === "string" && raw.recipe_image.trim()) {
    return enforceHttps(raw.recipe_image);
  }
  if (typeof raw.food_image === "string" && raw.food_image.trim()) {
    return enforceHttps(raw.food_image);
  }
  if (typeof raw.image_url === "string" && raw.image_url.trim()) {
    return enforceHttps(raw.image_url);
  }

  if (raw.recipe_image && typeof raw.recipe_image === "object") {
    const candidate =
      raw.recipe_image.image_url ||
      raw.recipe_image.url ||
      raw.recipe_image.value ||
      raw.recipe_image["#text"] ||
      raw.recipe_image._;
    if (typeof candidate === "string" && candidate.trim()) {
      return enforceHttps(candidate);
    }
  }

  const nested = raw.recipe_images?.recipe_image;
  if (nested) {
    const list = Array.isArray(nested) ? nested : [nested];
    for (const item of list) {
      if (typeof item === "string" && item.trim()) {
        const safe = enforceHttps(item);
        if (safe) return safe;
      } else if (item && typeof item === "object") {
        const candidate = item.image_url || item.url || item.value || item["#text"] || item._;
        if (typeof candidate === "string" && candidate.trim()) {
          const safe = enforceHttps(candidate);
          if (safe) return safe;
        }
      }
    }
  }

  if (Array.isArray(raw.images) && raw.images.length > 0) {
    for (const img of raw.images) {
      if (typeof img === "string" && img.trim()) {
        const safe = enforceHttps(img);
        if (safe) return safe;
      } else if (img && typeof img === "object") {
        const candidate = img.image_url || img.url || img.value;
        if (typeof candidate === "string" && candidate.trim()) {
          const safe = enforceHttps(candidate);
          if (safe) return safe;
        }
      }
    }
  }

  return null;
}

export function parsePrepTime(val: unknown): number {
  if (typeof val === "number" && !Number.isNaN(val)) {
    return Math.max(0, Math.round(val));
  }
  if (typeof val === "string") {
    const match = val.match(/\d+/);
    if (match) {
      return parseInt(match[0], 10);
    }
  }
  return 0;
}

export function resolveImageUrl(item: any): string | null {
  let url: string | null = null;
  if (item?.image_url && typeof item.image_url === "string") {
    url = item.image_url;
  } else if (Array.isArray(item?.images) && item.images.length > 0) {
    url = typeof item.images[0] === "string" ? item.images[0] : null;
  } else if (typeof item?.images === "string" && item.images.trim().startsWith("[")) {
    try {
      const parsed = JSON.parse(item.images);
      if (Array.isArray(parsed) && parsed.length > 0) {
        url = typeof parsed[0] === "string" ? parsed[0] : null;
      }
    } catch {
      // Ignore
    }
  }
  return enforceHttps(url);
}

export function mapLocalRecipeToUnified(raw: any): UnifiedRecipe {
  const imageUrl = resolveImageUrl(raw);
  return {
    id: raw.id,
    source: "local",
    name: String(raw.title || raw.name || "Untitled Meal"),
    title: String(raw.title || raw.name || "Untitled Meal"),
    image_url: imageUrl,
    images: imageUrl ? [imageUrl] : [],
    calories: Math.round(Number(raw.calories) || 0),
    protein: Math.round(Number(raw.protein) || 0),
    carbs: Math.round(Number(raw.carbs) || 0),
    fats: Math.round(Number(raw.fats) || 0),
    prep_time: parsePrepTime(raw.prep_time),
    cook_time: String(raw.cook_time || "0"),
    total_time: String(raw.total_time || raw.prep_time || "0"),
    servings: Number(raw.servings) || 1,
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    ingredients: Array.isArray(raw.ingredients) ? raw.ingredients : [],
    instructions: Array.isArray(raw.instructions) ? raw.instructions : [],
  };
}

/**
 * Fetches an OAuth 2.0 client credentials access token for FatSecret using proxyClient.
 */
async function getFatSecretToken(): Promise<string | null> {
  const clientId = Deno.env.get("FATSECRET_CLIENT_ID");
  const clientSecret = Deno.env.get("FATSECRET_CLIENT_SECRET");
  if (!clientId || !clientSecret) {
    console.error("[FatSecret Auth] Missing credentials.");
    return null;
  }

  const basicAuth = btoa(`${clientId}:${clientSecret}`);
  const tokenParams = new URLSearchParams({
    grant_type: "client_credentials",
    scope: "basic",
  });

  try {
    const fetchOptions: any = {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: tokenParams.toString(),
    };
    if (proxyClient) {
      fetchOptions.client = proxyClient; // <-- PROXY ROUTING
    }
    const tokenRes = await fetch("https://oauth.fatsecret.com/connect/token", fetchOptions);

    if (!tokenRes.ok) {
      const errText = await tokenRes.text().catch(() => "");
      console.error(`[FatSecret Auth] Token exchange failed:`, errText);
      return null;
    }

    const data = await tokenRes.json();
    return data.access_token || null;
  } catch (err) {
    console.error("FatSecret token fetch error:", err);
    return null;
  }
}

/**
 * Queries the FatSecret recipes.search API and maps results to UnifiedRecipe[].
 */
export async function fetchFatSecretRecipes(
  targets: RequestPayload = {}
): Promise<UnifiedRecipe[]> {
  try {
    const token = await getFatSecretToken();
    if (!token) return [];

    const limit = Math.min(Math.max(targets.limit ?? targets.pageSize ?? 20, 1), 50);
    const page = Math.max((targets.page ?? 1) - 1, 0);
    const tolerance = targets.tolerance ?? 0.2;

    const apiParams = new URLSearchParams({
      method: "recipes.search",
      format: "json",
      max_results: String(limit),
      page_number: String(page),
    });

    const searchQuery = targets.query || targets.search || targets.selectedTag;
    if (searchQuery) {
      apiParams.set("search_expression", searchQuery);
    }

    const calories = targets.targetCalories ?? targets.target_calories;
    if (typeof calories === "number" && calories > 0) {
      apiParams.set("calories.from", String(Math.floor(calories * (1 - tolerance))));
      apiParams.set("calories.to", String(Math.ceil(calories * (1 + tolerance))));
    }

    const protein = targets.targetProtein ?? targets.target_protein;
    if (typeof protein === "number" && protein > 0) {
      apiParams.set("protein.from", String(Math.floor(protein * (1 - tolerance))));
      apiParams.set("protein.to", String(Math.ceil(protein * (1 + tolerance))));
    }

    const apiUrl = new URL("https://platform.fatsecret.com/rest/server.api");
    apiUrl.search = apiParams.toString();

    const fetchOptions: any = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    if (proxyClient) {
      fetchOptions.client = proxyClient; // <-- PROXY ROUTING
    }
    const response = await fetch(apiUrl.toString(), fetchOptions);

    if (!response.ok) return [];
    const data = await response.json();

    if (data?.error) {
      if (data.error.code === 21 || String(data.error.message || "").includes("Invalid IP")) {
        console.warn("[FatSecret Code 21] IP restriction detected.");
        return [];
      }
      return [];
    }

    const recipesData = data?.recipes?.recipe;
    if (!recipesData) return [];

    const rawRecipes = Array.isArray(recipesData) ? recipesData : [recipesData];

    return rawRecipes.map((item: any): UnifiedRecipe => {
      const imageUrl = extractFatSecretImageUrl(item);
      const nutrition = item.recipe_nutrition || {};

      return {
        id: `fatsecret_${item.recipe_id || Math.random().toString(36).slice(2, 9)}`,
        source: "fatsecret",
        name: String(item.recipe_name || "FatSecret Recipe"),
        title: String(item.recipe_name || "FatSecret Recipe"),
        image_url: imageUrl,
        images: imageUrl ? [imageUrl] : [],
        calories: Math.round(Number(nutrition.calories) || 0),
        protein: Math.round(Number(nutrition.protein) || 0),
        carbs: Math.round(Number(nutrition.carbohydrate) || 0),
        fats: Math.round(Number(nutrition.fat) || 0),
        prep_time: parsePrepTime(item.preparation_time_min),
        cook_time: String(item.cooking_time_min || "0"),
        total_time: String((Number(item.cooking_time_min) || 0) + (Number(item.preparation_time_min) || 0)),
        servings: 1,
        tags: ["fatsecret"],
        ingredients: [],
        instructions: [],
      };
    });
  } catch (err: any) {
    console.error("[FatSecret API] Exception during recipe fetch:", err?.message || err);
    return [];
  }
}

/**
 * Fetches full recipe detail from FatSecret using recipe.get
 */
export async function fetchFatSecretRecipeDetail(
  supabase: SupabaseClient,
  recipeId: string
): Promise<any | null> {
  try {
    const { data: cached, error: cacheErr } = await supabase
      .from("recipes")
      .select("*")
      .or(`fatsecret_recipe_id.eq.${recipeId},description.eq.${recipeId}`)
      .maybeSingle();

    if (!cacheErr && cached) {
      const unified = mapLocalRecipeToUnified(cached);
      return {
        ...unified,
        id: recipeId,
        source: "fatsecret",
      };
    }
  } catch (checkErr) {
    console.warn("[Cache Check Exception]", checkErr);
  }

  const token = await getFatSecretToken();
  if (!token) return null;

  const rawId = recipeId.replace(/^fatsecret_/, "");
  const apiParams = new URLSearchParams({
    method: "recipe.get",
    recipe_id: rawId,
    format: "json",
  });

  const apiUrl = new URL("https://platform.fatsecret.com/rest/server.api");
  apiUrl.search = apiParams.toString();

  try {
    const fetchOptions: any = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    if (proxyClient) {
      fetchOptions.client = proxyClient; // <-- PROXY ROUTING
    }
    const response = await fetch(apiUrl.toString(), fetchOptions);

    if (!response.ok) return null;
    const data = await response.json();
    if (data?.error || !data?.recipe) return null;

    const r = data.recipe;

    const rawIngredients = r.ingredients?.ingredient
      ? (Array.isArray(r.ingredients.ingredient) ? r.ingredients.ingredient : [r.ingredients.ingredient])
      : [];
    const ingredients = rawIngredients.map((i: any) =>
      i.ingredient_description || i.food_name || String(i)
    );

    const rawDirections = r.directions?.direction
      ? (Array.isArray(r.directions.direction) ? r.directions.direction : [r.directions.direction])
      : [];
    const instructions = rawDirections
      .sort((a: any, b: any) => Number(a.direction_number || 0) - Number(b.direction_number || 0))
      .map((d: any) => d.direction_description || "");

    const images: string[] = [];
    const primaryImg = extractFatSecretImageUrl(r);
    if (primaryImg) images.push(primaryImg);

    const nutrition = r.recipe_nutrition || {};

    const recipeResult = {
      id: `fatsecret_${r.recipe_id}`,
      source: "fatsecret" as const,
      title: r.recipe_name || "FatSecret Meal",
      name: r.recipe_name || "FatSecret Meal",
      images,
      image_url: images[0] || null,
      tags: [],
      ingredients,
      ingredient_quantities: ingredients,
      instructions,
      calories: Math.round(Number(nutrition.calories) || 0),
      protein: Math.round(Number(nutrition.protein) || 0),
      carbs: Math.round(Number(nutrition.carbohydrate) || 0),
      fats: Math.round(Number(nutrition.fat) || 0),
      servings: Number(r.number_of_servings) || 1,
      cook_time: String(r.cooking_time_min || "0"),
      prep_time: String(r.preparation_time_min || "0"),
      total_time: String((Number(r.cooking_time_min) || 0) + (Number(r.preparation_time_min) || 0)),
    };

    try {
      await supabase.from("recipes").upsert({
        title: recipeResult.title,
        description: recipeResult.title,
        fatsecret_recipe_id: recipeId,
        images: recipeResult.images,
        image_url: recipeResult.image_url,
        tags: recipeResult.tags,
        ingredients: recipeResult.ingredients,
        ingredient_quantities: recipeResult.ingredient_quantities,
        instructions: recipeResult.instructions,
        calories: recipeResult.calories,
        protein: recipeResult.protein,
        carbs: recipeResult.carbs,
        fats: recipeResult.fats,
        servings: recipeResult.servings,
        cook_time: recipeResult.cook_time,
        prep_time: recipeResult.prep_time,
        total_time: recipeResult.total_time,
      }, { onConflict: "fatsecret_recipe_id" });
    } catch (saveErr) {
      console.warn("[Cache WRITE Failed]", saveErr);
    }

    return recipeResult;
  } catch (err) {
    console.error("[FatSecret API] Recipe detail error:", err);
    return null;
  }
}

export async function fetchLocalRecipeDetail(
  supabase: SupabaseClient,
  id: string | number
): Promise<any | null> {
  const numericId = Number(id);
  if (isNaN(numericId)) return null;

  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("id", numericId)
    .maybeSingle();

  if (error || !data) return null;
  const imageUrl = resolveImageUrl(data);
  return {
    ...data,
    source: "local",
    image_url: imageUrl,
    images: imageUrl ? [imageUrl] : (Array.isArray(data.images) ? data.images : []),
  };
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function fetchLocalUnifiedRecipes(
  supabase: SupabaseClient,
  targets: RequestPayload = {}
): Promise<UnifiedRecipe[]> {
  const calories = targets.targetCalories ?? targets.target_calories;
  const protein = targets.targetProtein ?? targets.target_protein;
  const limit = Math.min(Math.max(targets.limit ?? targets.pageSize ?? 20, 1), 100);
  const page = Math.max(targets.page ?? 1, 1);
  const offset = (page - 1) * limit;

  let query = supabase
    .from("recipes")
    .select("id, title, image_url, images, calories, protein, carbs, fats, prep_time, cook_time, total_time, servings, tags, ingredients, instructions");

  if (targets.selectedTag && targets.selectedTag.trim() !== "") {
    query = query.filter("tags", "cs", JSON.stringify([targets.selectedTag.trim()]));
  }

  query = query.range(offset, offset + limit - 1);
  let { data } = await query;
  return (data || []).map(mapLocalRecipeToUnified);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing Authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ error: "Missing Supabase environment variables." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    let body: RequestPayload = {};
    if (req.method === "POST") {
      body = await req.json().catch(() => ({}));
    }

    const targetId = body.id || body.recipe_id;
    if (body.action === "get_recipe" || (targetId && !body.action)) {
      const idStr = String(targetId);
      let recipe: any = null;

      if (idStr.startsWith("fatsecret_")) {
        recipe = await fetchFatSecretRecipeDetail(supabase, idStr);
      } else {
        recipe = await fetchLocalRecipeDetail(supabase, targetId!);
      }

      if (!recipe) {
        return new Response(
          JSON.stringify({ error: "Recipe not found." }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ data: recipe, recipe }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const [localRecipes, fatsecretRecipes] = await Promise.all([
      fetchLocalUnifiedRecipes(supabase, body).catch(() => []),
      fetchFatSecretRecipes(body).catch(() => []),
    ]);

    const mergedRecipes = shuffleArray([...localRecipes, ...fatsecretRecipes]);

    return new Response(
      JSON.stringify({
        data: mergedRecipes,
        recipes: mergedRecipes,
        count: mergedRecipes.length,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message || "Internal server error" }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});