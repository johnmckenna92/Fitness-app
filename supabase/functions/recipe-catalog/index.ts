import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface LookAlikeDict {
  preferredTags?: string[];
  preferredIngredients?: string[];
  dislikedTags?: string[];
  dislikedIngredients?: string[];
  avgCalories?: number;
  avgProtein?: number;
  totalSwiped?: number;
}

interface RequestBody {
  action?: "fetch_catalog" | "fetch_deck";
  page?: number;
  pageSize?: number;
  selectedTag?: string | null;
  under30Mins?: boolean;
  simplicitySort?: boolean;
  sortByProtein?: boolean;
  isPro?: boolean;
  timeOfDayHour?: number;
  limit?: number;
  userPreferences?: {
    liked_tags?: string[];
    disliked_recipe_ids?: number[];
    look_alike_dictionary?: LookAlikeDict;
  };
}

const RECIPE_COLUMNS =
  "id, title, images, tags, ingredients, ingredient_quantities, instructions, calories, protein, carbs, fats, saturated_fats, cholesterol, sodium, fiber, sugar, servings, cook_time, prep_time, total_time";

function getTimeOfDayBoostTags(hour: number): { tags: string[]; label: string } {
  if (hour >= 5 && hour < 11) {
    return {
      tags: ["breakfast", "morning", "brunch", "pancake", "oatmeal", "egg", "smoothie"],
      label: "breakfast",
    };
  }
  if (hour >= 11 && hour < 15) {
    return {
      tags: ["lunch", "salad", "sandwich", "wrap", "bowl", "quick"],
      label: "lunch",
    };
  }
  if (hour >= 15 && hour < 18) {
    return {
      tags: ["snack", "shake", "protein bar", "smoothie", "high-protein"],
      label: "snack",
    };
  }
  if (hour >= 18 && hour < 23) {
    return {
      tags: ["dinner", "supper", "steak", "chicken", "salmon", "pasta", "beef"],
      label: "dinner",
    };
  }
  return {
    tags: ["late-night", "snack", "light", "casein"],
    label: "late-night",
  };
}

function calculateRecipeScore(
  recipe: any,
  dict: LookAlikeDict | undefined,
  isPro: boolean,
  timeOfDayHour?: number
): number {
  let score = 0;
  const rawTags: string[] = Array.isArray(recipe.tags)
    ? recipe.tags.map((t: string) => String(t).toLowerCase())
    : [];
  const rawIngs: string[] = Array.isArray(recipe.ingredients)
    ? recipe.ingredients.map((i: string) => String(i).toLowerCase())
    : [];

  const prefTags = (dict?.preferredTags || []).map((t) => t.toLowerCase());
  const prefIngs = (dict?.preferredIngredients || []).map((i) => i.toLowerCase());
  const disTags = (dict?.dislikedTags || []).map((t) => t.toLowerCase());
  const disIngs = (dict?.dislikedIngredients || []).map((i) => i.toLowerCase());

  for (const t of rawTags) {
    if (prefTags.includes(t)) score += 4;
    if (disTags.includes(t)) score -= 6;
  }

  for (const ing of rawIngs) {
    if (prefIngs.some((pi) => ing.includes(pi))) score += 2;
    if (disIngs.some((di) => ing.includes(di))) score -= 4;
  }

  if (isPro && typeof timeOfDayHour === "number") {
    const { tags: boostTags } = getTimeOfDayBoostTags(timeOfDayHour);
    for (const bt of boostTags) {
      if (rawTags.some((rt) => rt.includes(bt))) {
        score += 15;
      }
    }
  }

  return score;
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
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ error: "Missing Supabase environment variables." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const body: RequestBody = await req.json().catch(() => ({}));
    const action = body.action || "fetch_catalog";
    const isPro = Boolean(body.isPro);
    const timeOfDayHour = body.timeOfDayHour;
    const lookAlikes = body.userPreferences?.look_alike_dictionary;

    if (action === "fetch_deck") {
      const limit = body.limit || 10;
      const excludedIds = body.userPreferences?.disliked_recipe_ids || [];

      let query = supabase.from("recipes").select(RECIPE_COLUMNS);

      if (excludedIds.length > 0) {
        query = query.not("id", "in", `(${excludedIds.join(",")})`);
      }

      const poolSize = Math.max(limit * 3, 30);
      const { data, error } = await query.limit(poolSize);

      if (error) {
        return Response.json(
          { error: error.message },
          { status: 400, headers: corsHeaders }
        );
      }

      const rawList = data || [];
      const scored = rawList.map((r: any) => ({
        ...r,
        _score: calculateRecipeScore(r, lookAlikes, isPro, timeOfDayHour),
      }));

      scored.sort((a: any, b: any) => b._score - a._score);
      const selected = scored.slice(0, limit);

      return Response.json(
        { recipes: selected },
        { status: 200, headers: corsHeaders }
      );
    }

    const page = Math.max(0, body.page || 0);
    const pageSize = Math.min(60, Math.max(10, body.pageSize || 30));
    const from = page * pageSize;
    const to = from + pageSize - 1;

    let query = supabase.from("recipes").select(RECIPE_COLUMNS, { count: "exact" });

    if (body.selectedTag && body.selectedTag.trim() !== "") {
      query = query.filter("tags", "cs", JSON.stringify([body.selectedTag.trim()]));
    }

    if (body.sortByProtein) {
      query = query.order("protein", { ascending: false });
    } else if (body.simplicitySort) {
      query = query.order("servings", { ascending: true });
    } else {
      query = query.order("calories", { ascending: false });
    }

    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      return Response.json(
        { error: error.message },
        { status: 400, headers: corsHeaders }
      );
    }

    let recipes = (data as any[]) || [];

    if (body.under30Mins) {
      recipes = recipes.filter((r) => {
        const cook = String(r.cook_time || "0");
        const match = cook.match(/\d+/);
        return match ? parseInt(match[0], 10) <= 30 : true;
      });
    }

    if (!body.sortByProtein && !body.simplicitySort) {
      recipes = recipes.map((r) => ({
        ...r,
        _score: calculateRecipeScore(r, lookAlikes, isPro, timeOfDayHour),
      }));
      recipes.sort((a, b) => (b._score || 0) - (a._score || 0));
    }

    const hasMore = typeof count === "number" ? from + recipes.length < count : recipes.length === pageSize;

    return Response.json(
      {
        recipes,
        count,
        hasMore,
        timeOfDayApplied: isPro ? getTimeOfDayBoostTags(timeOfDayHour || 12).label : null,
      },
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (err: any) {
    return Response.json(
      { error: err?.message || "Internal server error" },
      { status: 400, headers: corsHeaders }
    );
  }
});
