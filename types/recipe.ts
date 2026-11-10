export interface UnifiedRecipe {
  id: string | number;
  source?: "local" | "fatsecret";
  name?: string;
  title?: string;
  image_url?: string | null;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  prep_time?: number | string;

  // Extended / optional fields for rich UI & backwards compatibility
  images?: string[];
  tags?: string[];
  ingredients?: string[];
  ingredient_quantities?: string[];
  instructions?: string[];
  servings?: number;
  cook_time?: string;
  total_time?: string;
  description?: string;
  badgeText?: string;
  badgeType?: "success" | "warning";
  has_valid_image?: boolean;
  created_at?: string;
}

export interface Recipe {
  id: number | string;
  title: string;
  name?: string;
  source?: "local" | "fatsecret";

  // Native JSONB columns parsed as string arrays
  images: string[];
  tags: string[];
  ingredients: string[];
  ingredient_quantities: string[];
  instructions: string[];

  // Numeric macros
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  saturated_fats: number;
  cholesterol: number;
  sodium: number;
  fiber: number;
  sugar: number;
  servings: number;

  // Timing
  cook_time: string;
  prep_time: string;
  total_time: string;

  // Optional extensions & backwards compatibility
  image_url?: string;
  description?: string;
  badgeText?: string;
  badgeType?: "success" | "warning";
  has_valid_image?: boolean;
  created_at?: string;
}

