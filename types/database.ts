/**
 * ==============================================================================
 * 🏛️ B2B2C ARCHITECTURAL TRUTHS & STRICT PLATFORM RULES
 * ==============================================================================
 * 1. TRAINER LINKAGE & INVITES:
 *    Platform strictly uses Unique Invite Codes (e.g. KL-XXXXXX) stored in `public.trainer_invites`.
 *    Email-based auth invites are deprecated. Registration MUST query the code, extract the trainer's
 *    UUID, inject it into `profiles.trainer_id`, and mark the code as `used`.
 * 
 * 2. STANDALONE VS. TRAINER-LINKED CLIENTS:
 *    - Standalone clients (`trainer_id === null`): Manage own macros, eligible for Pro upsells.
 *    - Trainer-Linked clients (`trainer_id !== null`): Macros locked to read-only "Coach Managed" state.
 *      MUST NOT receive Pro upsell prompts.
 * 
 * 3. ROSTER DEACTIVATION:
 *    A client's `trainer_id` is a permanent historical link and MUST NEVER be set to `null` to remove
 *    them from a roster. Instead, roster removal updates `profiles.client_state` to 'frozen' or 'deactivated'
 *    (which frees the trainer's license seat).
 * 
 * 4. ACCOUNT DELETION:
 *    Immediate hard-deletes or soft-deletes are forbidden. Account deletion MUST trigger a 3-day
 *    scheduled soft-delete (`account_status: "pending_deletion"` with a `deleted_at` timestamp).
 * ==============================================================================
 */

export * from "./recipe";
export * from "./database.types";

export type MealType = "Breakfast" | "Lunch" | "Dinner" | "Snack";

export interface DailyLog {
  id: string;
  user_id: string;
  meal_type: MealType;
  food_name: string;
  barcode: string | null;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  serving_size: number;
  image_url?: string | null;
  logged_at: string;
}

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
  liked_recipe_ids: (number | string)[];
  disliked_recipe_ids: (number | string)[];
  liked_tags: string[];
  disliked_tags: string[];
  liked_ingredients: string[];
  disliked_ingredients: string[];
  dietary_restrictions?: string[];
  favorite_ingredients?: string[];
  look_alike_dictionary: LookAlikeDictionary;
  updated_at?: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface ChecklistSection {
  aisle: string;
  data: ChecklistItem[];
}

export interface ShoppingListRecord {
  id: string;
  user_id: string;
  raw_ingredients: string[];
  sections: ChecklistSection[];
  total_items: number;
  checked_items: number;
  adherence_rate: number;
  created_at?: string;
  updated_at?: string;
}





