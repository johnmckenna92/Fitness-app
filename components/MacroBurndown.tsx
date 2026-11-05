import React from "react";
import { StyleSheet, Text, View } from "react-native";

export interface BurndownMetrics {
  caloriesRemaining: number;
  proteinRemaining: number;
  fatsRemaining: number;
  carbsRemaining: number;
  caloriesProgress: number;
  proteinProgress: number;
  fatsProgress: number;
  carbsProgress: number;
}

interface MacroBurndownProps {
  targets: { calories: number; protein: number; carbs: number; fats: number };
  consumed: { calories: number; protein: number; carbs: number; fats: number };
  burndown: BurndownMetrics;
}

export function MacroBurndown({ targets, consumed, burndown }: MacroBurndownProps) {
  return (
    <View style={styles.container}>
      <View style={styles.calorieCard}>
        <View style={styles.rowBetween}>
          <View>
            <Text style={styles.label}>CALORIES REMAINING</Text>
            <Text style={styles.calorieVal}>
              {burndown.caloriesRemaining} <Text style={styles.unit}>KCAL</Text>
            </Text>
          </View>
          <View style={styles.alignRight}>
            <Text style={styles.subLabel}>TARGET: {targets.calories}</Text>
            <Text style={styles.subLabel}>CONSUMED: {consumed.calories}</Text>
          </View>
        </View>
        <View style={styles.barBg}>
          <View style={[styles.barFill, { width: `${burndown.caloriesProgress}%` }]} />
        </View>
        <View style={styles.rowBetween}>
          <Text style={styles.subLabel}>{burndown.caloriesProgress}% Consumed</Text>
          <Text style={styles.subLabel}>{burndown.caloriesRemaining} kcal Left</Text>
        </View>
      </View>

      <View style={styles.macroGrid}>
        <View style={styles.macroCard}>
          <View style={styles.rowBetween}>
            <Text style={styles.macroKey}>PROTEIN</Text>
            <Text style={styles.subLabel}>{targets.protein}g</Text>
          </View>
          <Text style={styles.macroVal}>{burndown.proteinRemaining}<Text style={styles.unit}>g</Text></Text>
          <Text style={styles.statusLabel}>REMAINING</Text>
          <View style={styles.miniBarBg}>
            <View style={[styles.miniBarFill, { width: `${burndown.proteinProgress}%`, backgroundColor: "#818cf8" }]} />
          </View>
          <Text style={styles.subLabel}>{consumed.protein}g Used</Text>
        </View>

        <View style={styles.macroCard}>
          <View style={styles.rowBetween}>
            <Text style={styles.macroKey}>FATS</Text>
            <Text style={styles.subLabel}>{targets.fats}g</Text>
          </View>
          <Text style={styles.macroVal}>{burndown.fatsRemaining}<Text style={styles.unit}>g</Text></Text>
          <Text style={styles.statusLabel}>REMAINING</Text>
          <View style={styles.miniBarBg}>
            <View style={[styles.miniBarFill, { width: `${burndown.fatsProgress}%`, backgroundColor: "#f59e0b" }]} />
          </View>
          <Text style={styles.subLabel}>{consumed.fats}g Used</Text>
        </View>

        <View style={styles.macroCard}>
          <View style={styles.rowBetween}>
            <Text style={styles.macroKey}>CARBS</Text>
            <Text style={styles.subLabel}>{targets.carbs}g</Text>
          </View>
          <Text style={styles.macroVal}>{burndown.carbsRemaining}<Text style={styles.unit}>g</Text></Text>
          <Text style={styles.statusLabel}>REMAINING</Text>
          <View style={styles.miniBarBg}>
            <View style={[styles.miniBarFill, { width: `${burndown.carbsProgress}%`, backgroundColor: "#10b981" }]} />
          </View>
          <Text style={styles.subLabel}>{consumed.carbs}g Used</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 6 },
  calorieCard: {
    backgroundColor: "#0f172a",
    marginHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1e293b",
    padding: 16,
  },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  alignRight: { alignItems: "flex-end" },
  label: { fontSize: 10, fontWeight: "700", color: "#94a3b8", letterSpacing: 0.8, marginBottom: 4 },
  calorieVal: { fontSize: 30, fontWeight: "900", color: "#f8fafc" },
  unit: { fontSize: 13, fontWeight: "700", color: "#818cf8" },
  subLabel: { fontSize: 10, fontWeight: "600", color: "#64748b" },
  barBg: { height: 8, backgroundColor: "#020617", borderRadius: 4, overflow: "hidden", marginVertical: 10 },
  barFill: { height: "100%", backgroundColor: "#818cf8", borderRadius: 4 },
  macroGrid: { flexDirection: "row", paddingHorizontal: 16, gap: 8, marginTop: 10 },
  macroCard: { flex: 1, backgroundColor: "#0f172a", borderRadius: 12, borderWidth: 1, borderColor: "#1e293b", padding: 12 },
  macroKey: { fontSize: 10, fontWeight: "800", color: "#94a3b8", letterSpacing: 0.5 },
  macroVal: { fontSize: 20, fontWeight: "800", color: "#f8fafc", marginVertical: 2 },
  statusLabel: { fontSize: 8, fontWeight: "700", color: "#64748b", letterSpacing: 0.5, marginBottom: 6 },
  miniBarBg: { height: 4, backgroundColor: "#020617", borderRadius: 2, overflow: "hidden", marginBottom: 6 },
  miniBarFill: { height: "100%", borderRadius: 2 },
});
