export * from "./recipe";

export interface WeeklyProtocolItem {
  recipeId: string;
  title: string;
  ingredients: string[];
  addedAt: string;
}

export interface LookAlikeDictionary {
  preferredTags: string[];
  preferredIngredients: string[];
  dislikedTags: string[];
  dislikedIngredients: string[];
  avgCalories: number;
  avgProtein: number;
  totalSwiped: number;
}

export interface UserPreferences {
  user_id?: string;
  liked_recipe_ids: number[];
  disliked_recipe_ids: number[];
  liked_tags: string[];
  disliked_tags: string[];
  liked_ingredients: string[];
  disliked_ingredients: string[];
  look_alike_dictionary: LookAlikeDictionary;
  updated_at?: string;
}


