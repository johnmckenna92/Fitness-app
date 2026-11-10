import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../ctx/AuthContext";
import { supabase } from "../../lib/supabase";

interface RecentMealsWidgetProps {
  maxItems?: number;
}

interface MealItem {
  id: string;
  food_name: string;
  meal_type: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  logged_at: string;
}

export default function RecentMealsWidget({ maxItems = 4 }: RecentMealsWidgetProps) {
  const { session } = useAuth();
  const [meals, setMeals] = useState<MealItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRecentMeals = useCallback(async () => {
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from("daily_logs")
        .select("id, food_name, meal_type, calories, protein, carbs, fats, logged_at")
        .eq("user_id", session.user.id)
        .order("logged_at", { ascending: false })
        .limit(maxItems);

      if (!error && data) {
        setMeals(data as MealItem[]);
      }
    } catch (err) {
      console.warn("[RecentMealsWidget] Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [session, maxItems]);

  useFocusEffect(
    useCallback(() => {
      loadRecentMeals();
    }, [loadRecentMeals])
  );

  return (
    <View className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm">
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <Text style={styles.icon}>🥗</Text>
          <Text className="text-xs font-extrabold text-zinc-500 dark:text-zinc-400 tracking-wider">
            RECENT FOOD LOGS
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push("/(tabs)/log-food" as any)}
          className="flex-row items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20"
        >
          <Ionicons name="add" size={12} color="#10b981" />
          <Text className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">Log Meal</Text>
        </TouchableOpacity>
      </View>

      {meals.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text className="text-xs text-zinc-400 text-center">
            {loading ? "Loading logs..." : "No meals logged yet today. Track your first meal!"}
          </Text>
        </View>
      ) : (
        <View style={styles.listContainer}>
          {meals.map((item) => (
            <View
              key={item.id}
              className="flex-row justify-between items-center py-2.5 border-b border-zinc-100 dark:border-zinc-800/80 last:border-b-0"
            >
              <View style={styles.mealInfo}>
                <Text
                  numberOfLines={1}
                  className="text-sm font-bold text-zinc-900 dark:text-zinc-100"
                >
                  {item.food_name}
                </Text>
                <Text className="text-[11px] text-zinc-400 mt-0.5">
                  {item.meal_type} • {item.protein}g P • {item.carbs}g C • {item.fats}g F
                </Text>
              </View>

              <View style={styles.caloriesBadge}>
                <Text className="text-xs font-black text-emerald-700 dark:text-emerald-400">
                  {item.calories} kcal
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  titleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  icon: {
    fontSize: 16,
  },
  emptyContainer: {
    paddingVertical: 16,
    alignItems: "center",
  },
  listContainer: {
    gap: 2,
  },
  mealInfo: {
    flex: 1,
    paddingRight: 10,
  },
  caloriesBadge: {
    alignItems: "flex-end",
  },
});
