import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../ctx/ThemeContext";

const GOAL_OPTIONS = [
  "Build Muscle",
  "Lose Fat",
  "Recomp",
  "Increase Strength",
  "Improve Endurance",
  "Maintenance",
];

interface NutritionTargetsCardProps {
  calories: string;
  onCaloriesChange: (val: string) => void;
  protein: string;
  onProteinChange: (val: string) => void;
  carbs: string;
  onCarbsChange: (val: string) => void;
  fats: string;
  onFatsChange: (val: string) => void;
  goals: string[];
  onToggleGoal: (goal: string) => void;
  macroVariance: number;
  onSelectVariance: (val: number) => void;
  isProUser: boolean;
  isTrainerLinked?: boolean;
}

export function NutritionTargetsCard({
  calories,
  onCaloriesChange,
  protein,
  onProteinChange,
  carbs,
  onCarbsChange,
  fats,
  onFatsChange,
  goals,
  onToggleGoal,
  macroVariance,
  onSelectVariance,
  isProUser,
  isTrainerLinked = false,
}: NutritionTargetsCardProps) {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <View style={[styles.iconCircle, { backgroundColor: isDark ? "rgba(74, 222, 128, 0.15)" : "rgba(74, 222, 128, 0.12)" }]}>
            <Ionicons name="nutrition-outline" size={18} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Nutritional Targets & Preferences</Text>
        </View>

        {isTrainerLinked && (
          <View
            style={[
              styles.managedBadge,
              {
                backgroundColor: isDark
                  ? "rgba(16, 185, 129, 0.15)"
                  : "rgba(16, 185, 129, 0.1)",
              },
            ]}
          >
            <Ionicons name="lock-closed" size={10} color={colors.success} style={{ marginRight: 4 }} />
            <Text style={[styles.managedBadgeText, { color: colors.success }]}>MANAGED BY COACH</Text>
          </View>
        )}
      </View>

      <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
        Daily caloric and macronutrient targets
      </Text>

      {/* Macros 4-column Grid */}
      <View style={styles.macroGrid}>
        <View style={styles.macroCol}>
          <Text style={[styles.macroLabel, { color: colors.textSecondary }]}>CALORIES</Text>
          <TextInput
            style={[
              styles.macroInput,
              {
                backgroundColor: isDark ? "#18181b" : "#f4f4f5",
                borderColor: isTrainerLinked
                  ? (isDark ? "rgba(148, 163, 184, 0.15)" : "rgba(148, 163, 184, 0.25)")
                  : colors.borderSubtle,
                color: colors.text,
                opacity: isTrainerLinked ? 0.65 : 1,
              },
            ]}
            value={calories}
            onChangeText={onCaloriesChange}
            keyboardType="numeric"
            placeholder="2200"
            placeholderTextColor={colors.textMuted}
            editable={!isTrainerLinked}
          />
          <Text style={[styles.macroUnit, { color: colors.textMuted }]}>kcal</Text>
        </View>

        <View style={styles.macroCol}>
          <Text style={[styles.macroLabel, { color: colors.textSecondary }]}>PROTEIN</Text>
          <TextInput
            style={[
              styles.macroInput,
              {
                backgroundColor: isDark ? "#18181b" : "#f4f4f5",
                borderColor: isTrainerLinked
                  ? (isDark ? "rgba(148, 163, 184, 0.15)" : "rgba(148, 163, 184, 0.25)")
                  : colors.borderSubtle,
                color: colors.text,
                opacity: isTrainerLinked ? 0.65 : 1,
              },
            ]}
            value={protein}
            onChangeText={onProteinChange}
            keyboardType="numeric"
            placeholder="140"
            placeholderTextColor={colors.textMuted}
            editable={!isTrainerLinked}
          />
          <Text style={[styles.macroUnit, { color: colors.textMuted }]}>g</Text>
        </View>

        <View style={styles.macroCol}>
          <Text style={[styles.macroLabel, { color: colors.textSecondary }]}>CARBS</Text>
          <TextInput
            style={[
              styles.macroInput,
              {
                backgroundColor: isDark ? "#18181b" : "#f4f4f5",
                borderColor: isTrainerLinked
                  ? (isDark ? "rgba(148, 163, 184, 0.15)" : "rgba(148, 163, 184, 0.25)")
                  : colors.borderSubtle,
                color: colors.text,
                opacity: isTrainerLinked ? 0.65 : 1,
              },
            ]}
            value={carbs}
            onChangeText={onCarbsChange}
            keyboardType="numeric"
            placeholder="200"
            placeholderTextColor={colors.textMuted}
            editable={!isTrainerLinked}
          />
          <Text style={[styles.macroUnit, { color: colors.textMuted }]}>g</Text>
        </View>

        <View style={styles.macroCol}>
          <Text style={[styles.macroLabel, { color: colors.textSecondary }]}>FATS</Text>
          <TextInput
            style={[
              styles.macroInput,
              {
                backgroundColor: isDark ? "#18181b" : "#f4f4f5",
                borderColor: isTrainerLinked
                  ? (isDark ? "rgba(148, 163, 184, 0.15)" : "rgba(148, 163, 184, 0.25)")
                  : colors.borderSubtle,
                color: colors.text,
                opacity: isTrainerLinked ? 0.65 : 1,
              },
            ]}
            value={fats}
            onChangeText={onFatsChange}
            keyboardType="numeric"
            placeholder="65"
            placeholderTextColor={colors.textMuted}
            editable={!isTrainerLinked}
          />
          <Text style={[styles.macroUnit, { color: colors.textMuted }]}>g</Text>
        </View>
      </View>
      <View style={styles.divider} />

      {/* Fitness Goals */}
      <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>FITNESS GOALS</Text>
      <View
        style={[
          styles.chipsContainer,
          isTrainerLinked && { opacity: 0.5 },
        ]}
        className={isTrainerLinked ? "opacity-50" : undefined}
        pointerEvents={isTrainerLinked ? "none" : "auto"}
      >
        {GOAL_OPTIONS.map((goal) => {
          const isSelected = goals.includes(goal);
          return (
            <TouchableOpacity
              key={goal}
              disabled={isTrainerLinked}
              {...({ editable: !isTrainerLinked } as any)}
              accessibilityState={{ disabled: isTrainerLinked }}
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected ? colors.primary : isDark ? "#020617" : "#f1f5f9",
                  borderColor: isSelected ? colors.primary : colors.borderSubtle,
                },
              ]}
              onPress={() => onToggleGoal(goal)}
              activeOpacity={0.7}
            >
              {isSelected && (
                <Ionicons name="checkmark" size={12} color="#ffffff" style={{ marginRight: 4 }} />
              )}
              <Text style={[styles.chipText, { color: isSelected ? "#ffffff" : colors.textSecondary }]}>
                {goal}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.divider} />

      {/* Macro Flexibility Window (Read-Only) */}
      <View style={styles.varianceHeader}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Ionicons name="speedometer-outline" size={15} color={isDark ? "#34d399" : "#15803d"} />
          <Text style={[styles.inputLabel, { color: colors.textSecondary, marginBottom: 0 }]}>
            MACRO FLEXIBILITY WINDOW
          </Text>
        </View>
        <View
          style={[
            styles.managedBadge,
            {
              backgroundColor: isDark
                ? "rgba(16, 185, 129, 0.15)"
                : "rgba(16, 185, 129, 0.1)",
            },
          ]}
        >
          <Ionicons name="lock-closed" size={10} color={colors.success} style={{ marginRight: 4 }} />
          <Text style={[styles.managedBadgeText, { color: colors.success }]}>COACH MANAGED</Text>
        </View>
      </View>
      <Text style={[styles.varianceSubtext, { color: colors.textMuted, marginBottom: 12 }]}>
        Target tolerance before nutrition check alerts flag a discrepancy. Calibrated by your coach.
      </Text>

      <View
        className="flex-row items-center justify-between bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm"
      >
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800/60 items-center justify-center">
            <Ionicons name="analytics" size={20} color={isDark ? "#34d399" : "#15803d"} />
          </View>
          <View>
            <Text className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Allowed Tolerance
            </Text>
            <Text className="text-base font-black text-emerald-700 dark:text-emerald-400">
              ± {macroVariance}% Variance
            </Text>
          </View>
        </View>
        <View className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-200/80 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700">
          <Ionicons name="shield-checkmark" size={13} color={isDark ? "#34d399" : "#15803d"} />
          <Text className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Read-Only</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 24, borderWidth: 1, padding: 18, elevation: 3 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
  titleGroup: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  iconCircle: { width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 16, fontWeight: "800", letterSpacing: -0.2, flexShrink: 1 },
  sectionSubtitle: { fontSize: 12, marginBottom: 16, marginLeft: 42 },
  macroGrid: { flexDirection: "row", gap: 8 },
  macroCol: { flex: 1, alignItems: "center" },
  macroLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 0.5, marginBottom: 4 },
  macroInput: { width: "100%", height: 42, borderRadius: 12, borderWidth: 1, textAlign: "center", fontSize: 14, fontWeight: "800" },
  macroUnit: { fontSize: 10, fontWeight: "600", marginTop: 3 },
  divider: { height: 1, backgroundColor: "rgba(148, 163, 184, 0.15)", marginVertical: 14 },
  inputLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 0.6, marginBottom: 8 },
  chipsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16, borderWidth: 1 },
  chipText: { fontSize: 12, fontWeight: "600" },
  varianceHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 2 },
  proBadge: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  proText: { fontSize: 10, fontWeight: "800" },
  varianceSubtext: { fontSize: 11, marginBottom: 10 },
  varianceRow: { flexDirection: "row", gap: 8 },
  variancePill: { flex: 1, paddingVertical: 8, borderRadius: 10, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  varianceText: { fontSize: 13, fontWeight: "700" },
  managedBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 7, paddingVertical: 4, borderRadius: 8 },
  managedBadgeText: { fontSize: 9, fontWeight: "800", letterSpacing: 0.3 },
});
