import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { getDailyTargets, useAuth } from "../../ctx/AuthContext";
import { supabase } from "../../lib/supabase";

interface MacrosWidgetProps {
  showRemaining?: boolean;
}

export default function MacrosWidget({ showRemaining = true }: MacrosWidgetProps) {
  const { profile, isPro, isTrainingDay } = useAuth();
  const isProUser = Boolean(isPro || profile?.is_pro || profile?.subscription_status === "pro");

  const targets = isProUser
    ? getDailyTargets(profile, isTrainingDay)
    : {
        calories: profile?.target_calories || 2200,
        protein: profile?.target_protein || 140,
        carbs: profile?.target_carbs || 200,
        fats: profile?.target_fats || 65,
      };

  const [consumed, setConsumed] = useState({ calories: 0, protein: 0, carbs: 0, fats: 0 });

  useEffect(() => {
    let isMounted = true;
    async function loadTodayLogs() {
      if (!profile?.id) return;
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      try {
        const { data } = await supabase
          .from("daily_logs")
          .select("calories, protein, carbs, fats")
          .eq("user_id", profile.id)
          .gte("logged_at", startOfDay.toISOString());

        if (data && isMounted) {
          const totals = data.reduce(
            (acc, item) => ({
              calories: acc.calories + (item.calories || 0),
              protein: acc.protein + (item.protein || 0),
              carbs: acc.carbs + (item.carbs || 0),
              fats: acc.fats + (item.fats || 0),
            }),
            { calories: 0, protein: 0, carbs: 0, fats: 0 }
          );
          setConsumed(totals);
        }
      } catch (err) {
        console.warn("[MacrosWidget] Error fetching logs:", err);
      }
    }

    loadTodayLogs();
    return () => {
      isMounted = false;
    };
  }, [profile?.id]);

  const caloriesRemaining = Math.max(0, targets.calories - consumed.calories);
  const calPercent = Math.min(100, Math.round((consumed.calories / (targets.calories || 1)) * 100));

  return (
    <View className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm">
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <Text style={styles.icon}>🎯</Text>
          <Text className="text-xs font-extrabold text-zinc-500 dark:text-zinc-400 tracking-wider">
            DAILY BLUEPRINT
          </Text>
          <Text className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
            • {targets.calories} kcal
          </Text>
        </View>

        {isProUser && (
          <View className="bg-zinc-100 dark:bg-zinc-950 px-2.5 py-1 rounded-xl border border-emerald-500">
            <Text className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400 tracking-wide">
              {isTrainingDay ? "TRAINING" : "REST"}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBarBg} className="bg-zinc-100 dark:bg-zinc-800">
          <View style={[styles.progressBarFill, { width: `${calPercent}%` }]} className="bg-emerald-500" />
        </View>
        <View style={styles.progressLabelRow}>
          <Text className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
            {consumed.calories} kcal ({calPercent}%)
          </Text>
          {showRemaining && (
            <Text className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
              {caloriesRemaining} kcal left
            </Text>
          )}
        </View>
      </View>

      <View style={styles.macroTagsRow}>
        <View className="bg-zinc-100 dark:bg-zinc-950 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800">
          <Text className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
            P: {consumed.protein}g / {targets.protein}g
          </Text>
        </View>
        <View className="bg-zinc-100 dark:bg-zinc-950 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800">
          <Text className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
            C: {consumed.carbs}g / {targets.carbs}g
          </Text>
        </View>
        <View className="bg-zinc-100 dark:bg-zinc-950 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800">
          <Text className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
            F: {consumed.fats}g / {targets.fats}g
          </Text>
        </View>
      </View>
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
  progressContainer: {
    marginBottom: 14,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  macroTagsRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
});
