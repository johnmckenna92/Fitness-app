export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      daily_logs: {
        Row: {
          id: string;
          user_id: string;
          meal_type: string;
          food_name: string;
          barcode: string | null;
          calories: number;
          protein: number;
          carbs: number;
          fats: number;
          serving_size: number;
          image_url: string | null;
          logged_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          meal_type: string;
          food_name: string;
          barcode?: string | null;
          calories: number;
          protein: number;
          carbs: number;
          fats: number;
          serving_size: number;
          image_url?: string | null;
          logged_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          meal_type?: string;
          food_name?: string;
          barcode?: string | null;
          calories?: number;
          protein?: number;
          carbs?: number;
          fats?: number;
          serving_size?: number;
          image_url?: string | null;
          logged_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "daily_logs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      recipes: {
        Row: {
          id: number;
          title: string;
          images: string[];
          image_url: string | null;
          has_valid_image: boolean | null;
          tags: string[];
          ingredients: string[];
          ingredient_quantities: string[];
          instructions: string[];
          calories: number;
          protein: number;
          carbs: number;
          fats: number;
          saturated_fats: number | null;
          cholesterol: number | null;
          sodium: number | null;
          fiber: number | null;
          sugar: number | null;
          servings: number | null;
          cook_time: string | null;
          prep_time: string | null;
          total_time: string | null;
          description: string | null;
          fatsecret_recipe_id?: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: number;
          title: string;
          images?: string[];
          image_url?: string | null;
          has_valid_image?: boolean | null;
          tags?: string[];
          ingredients?: string[];
          ingredient_quantities?: string[];
          instructions?: string[];
          calories: number;
          protein: number;
          carbs: number;
          fats: number;
          saturated_fats?: number | null;
          cholesterol?: number | null;
          sodium?: number | null;
          fiber?: number | null;
          sugar?: number | null;
          servings?: number | null;
          cook_time?: string | null;
          prep_time?: string | null;
          total_time?: string | null;
          description?: string | null;
          fatsecret_recipe_id?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: number;
          title?: string;
          images?: string[];
          image_url?: string | null;
          has_valid_image?: boolean | null;
          tags?: string[];
          ingredients?: string[];
          ingredient_quantities?: string[];
          instructions?: string[];
          calories?: number;
          protein?: number;
          carbs?: number;
          fats?: number;
          saturated_fats?: number | null;
          cholesterol?: number | null;
          sodium?: number | null;
          fiber?: number | null;
          sugar?: number | null;
          servings?: number | null;
          cook_time?: string | null;
          prep_time?: string | null;
          total_time?: string | null;
          description?: string | null;
          fatsecret_recipe_id?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          role: 'client' | 'trainer';
          trainer_id: string | null;
          stripe_customer_id: string | null;
          target_calories: number | null;
          target_protein: number | null;
          target_carbs: number | null;
          target_fats: number | null;
          training_target_calories: number | null;
          training_target_protein: number | null;
          training_target_carbs: number | null;
          training_target_fats: number | null;
          rest_target_calories: number | null;
          rest_target_protein: number | null;
          rest_target_carbs: number | null;
          rest_target_fats: number | null;
          is_pro: boolean | null;
          subscription_tier: string | null;
          subscription_status: string | null;
          swipes_today: number | null;
          last_swipe_date: string | null;
          height: number | null;
          weight: number | null;
          height_cm: number | null;
          weight_kg: number | null;
          age: number | null;
          sex: string | null;
          activity_level: string | null;
          goals: string[] | null;
          meals_per_day: number | null;
          pt_notes: string | null;
          trainer_bio?: string | null;
          account_status?: 'active' | 'locked_trainer_revoked' | 'pending_deletion' | string | null;
          deleted_at?: string | null;
          client_state?: 'active' | 'frozen' | 'deactivated' | string | null;

          macro_variance: number | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'client' | 'trainer';
          trainer_id?: string | null;
          stripe_customer_id?: string | null;
          target_calories?: number | null;
          target_protein?: number | null;
          target_carbs?: number | null;
          target_fats?: number | null;
          training_target_calories?: number | null;
          training_target_protein?: number | null;
          training_target_carbs?: number | null;
          training_target_fats?: number | null;
          rest_target_calories?: number | null;
          rest_target_protein?: number | null;
          rest_target_carbs?: number | null;
          rest_target_fats?: number | null;
          is_pro?: boolean | null;
          subscription_tier?: string | null;
          subscription_status?: string | null;
          swipes_today?: number | null;
          last_swipe_date?: string | null;
          height?: number | null;
          weight?: number | null;
          height_cm?: number | null;
          weight_kg?: number | null;
          age?: number | null;
          sex?: string | null;
          activity_level?: string | null;
          goals?: string[] | null;
          meals_per_day?: number | null;
          pt_notes?: string | null;
          trainer_bio?: string | null;
          account_status?: 'active' | 'locked_trainer_revoked' | 'pending_deletion' | string | null;
          deleted_at?: string | null;
          client_state?: 'active' | 'frozen' | 'deactivated' | string | null;

          macro_variance?: number | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'client' | 'trainer';
          trainer_id?: string | null;
          stripe_customer_id?: string | null;
          target_calories?: number | null;
          target_protein?: number | null;
          target_carbs?: number | null;
          target_fats?: number | null;
          training_target_calories?: number | null;
          training_target_protein?: number | null;
          training_target_carbs?: number | null;
          training_target_fats?: number | null;
          rest_target_calories?: number | null;
          rest_target_protein?: number | null;
          rest_target_carbs?: number | null;
          rest_target_fats?: number | null;
          is_pro?: boolean | null;
          subscription_tier?: string | null;
          subscription_status?: string | null;
          swipes_today?: number | null;
          last_swipe_date?: string | null;
          height?: number | null;
          weight?: number | null;
          height_cm?: number | null;
          weight_kg?: number | null;
          age?: number | null;
          sex?: string | null;
          activity_level?: string | null;
          goals?: string[] | null;
          meals_per_day?: number | null;
          pt_notes?: string | null;
          trainer_bio?: string | null;
          account_status?: 'active' | 'locked_trainer_revoked' | 'pending_deletion' | string | null;
          deleted_at?: string | null;
          client_state?: 'active' | 'frozen' | 'deactivated' | string | null;

          macro_variance?: number | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_trainer_id_fkey";
            columns: ["trainer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      user_preferences: {
        Row: {
          user_id: string;
          liked_recipe_ids: (string | number)[];
          disliked_recipe_ids: (string | number)[];
          liked_tags: string[];
          disliked_tags: string[];
          liked_ingredients: string[];
          disliked_ingredients: string[];
          look_alike_dictionary: any;
          updated_at: string | null;
        };
        Insert: {
          user_id: string;
          liked_recipe_ids?: (string | number)[];
          disliked_recipe_ids?: (string | number)[];
          liked_tags?: string[];
          disliked_tags?: string[];
          liked_ingredients?: string[];
          disliked_ingredients?: string[];
          look_alike_dictionary?: any;
          updated_at?: string | null;
        };
        Update: {
          user_id?: string;
          liked_recipe_ids?: (string | number)[];
          disliked_recipe_ids?: (string | number)[];
          liked_tags?: string[];
          disliked_tags?: string[];
          liked_ingredients?: string[];
          disliked_ingredients?: string[];
          look_alike_dictionary?: any;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      shopping_lists: {
        Row: {
          id: string;
          user_id: string;
          raw_ingredients: string[];
          sections: any;
          total_items: number;
          checked_items: number;
          adherence_rate: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          raw_ingredients?: string[];
          sections?: any;
          total_items?: number;
          checked_items?: number;
          adherence_rate?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          raw_ingredients?: string[];
          sections?: any;
          total_items?: number;
          checked_items?: number;
          adherence_rate?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "shopping_lists_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      shopping_list_history: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          raw_ingredients: string[];
          sections: any;
          total_items: number;
          checked_items: number;
          adherence_rate: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          raw_ingredients?: string[];
          sections?: any;
          total_items?: number;
          checked_items?: number;
          adherence_rate?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          raw_ingredients?: string[];
          sections?: any;
          total_items?: number;
          checked_items?: number;
          adherence_rate?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "shopping_list_history_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      chat_sessions: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "chat_sessions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      chat_messages: {
        Row: {
          id: string;
          session_id: string;
          user_id: string;
          role: "user" | "model" | "assistant";
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          user_id: string;
          role: "user" | "model" | "assistant";
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          user_id?: string;
          role?: "user" | "model" | "assistant";
          content?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "chat_sessions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "chat_messages_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };

      trainer_licenses: {
        Row: {
          id: string;
          trainer_id: string;
          tier: "starter" | "pro" | "enterprise";
          max_clients: number;
          add_ons: Json;
          billing_cycle: "monthly" | "yearly" | null;
          is_active: boolean;
          expires_at: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          trainer_id: string;
          tier?: "starter" | "pro" | "enterprise";
          max_clients?: number;
          add_ons?: Json;
          billing_cycle?: "monthly" | "yearly" | null;
          is_active?: boolean;
          expires_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          trainer_id?: string;
          tier?: "starter" | "pro" | "enterprise";
          max_clients?: number;
          add_ons?: Json;
          billing_cycle?: "monthly" | "yearly" | null;
          is_active?: boolean;
          expires_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "trainer_licenses_trainer_id_fkey";
            columns: ["trainer_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      trainer_ui_configs: {
        Row: {
          id: string;
          trainer_id: string;
          home_layout: Json;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          trainer_id: string;
          home_layout?: Json;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          trainer_id?: string;
          home_layout?: Json;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "trainer_ui_configs_trainer_id_fkey";
            columns: ["trainer_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      client_health_metrics: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          steps_rag: "red" | "amber" | "green";
          synced_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          steps_rag: "red" | "amber" | "green";
          synced_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          steps_rag?: "red" | "amber" | "green";
          synced_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "client_health_metrics_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };


      trainer_invites: {
        Row: {
          id: string;
          trainer_id: string;
          invite_code: string;
          status: string;
          used_by_id: string | null;
          used_at: string | null;
          expires_at: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          trainer_id: string;
          invite_code: string;
          status?: string;
          used_by_id?: string | null;
          used_at?: string | null;
          expires_at: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          trainer_id?: string;
          invite_code?: string;
          status?: string;
          used_by_id?: string | null;
          used_at?: string | null;
          expires_at?: string;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "trainer_invites_trainer_id_fkey";
            columns: ["trainer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {};
    Functions: {
      consume_trainer_invite: {
        Args: {
          p_invite_code: string;
          p_user_id: string;
        };
        Returns: Json;
      };
    };
    Enums: {};
  };
}
