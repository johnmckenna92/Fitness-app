import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getDailyTargets, useAuth } from "../../ctx/AuthContext";

export default function CommandCenterScreen() {
  const insets = useSafeAreaInsets();
  const { profile, isPro, isTrainingDay } = useAuth();
  const isProUser = Boolean(isPro || profile?.is_pro || profile?.subscription_status === "pro");

  const baseline = {
    calories: profile?.target_calories || 2200,
    protein: profile?.target_protein || 140,
    carbs: profile?.target_carbs || 200,
    fats: profile?.target_fats || 65,
  };

  const targets = isProUser ? getDailyTargets(profile, isTrainingDay) : baseline;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>COMMAND CENTER</Text>
          <Text style={styles.headerTitle}>Discovery & Action</Text>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scroll} 
        showsVerticalScrollIndicator={false}
      >
        {/* 1. The Daily Blueprint (Static Targets, Clean & Tracker-Free) */}
        <View style={styles.blueprintCard}>
          <View style={styles.blueprintHeaderRow}>
            <Text style={styles.blueprintBadge}>DAILY BLUEPRINT</Text>
            {isProUser && (
              <View style={styles.proPill}>
                <Text style={styles.proPillText}>{isTrainingDay ? "TRAINING" : "REST"}</Text>
              </View>
            )}
          </View>
          <View style={styles.targetRow}>
            <Text style={styles.targetIcon}>🎯</Text>
            <Text style={styles.targetText}>
              {targets.calories} kcal
            </Text>
            <Text style={styles.targetDivider}>|</Text>
            <Text style={styles.targetText}>
              {targets.protein}g P
            </Text>
            <Text style={styles.targetDivider}>|</Text>
            <Text style={styles.targetText}>
              {targets.carbs}g C
            </Text>
            <Text style={styles.targetDivider}>|</Text>
            <Text style={styles.targetText}>
              {targets.fats}g F
            </Text>
          </View>
        </View>

        {/* 2. AI Coach Hero Widget */}
        <TouchableOpacity 
          style={styles.heroCard}
          activeOpacity={0.85}
          onPress={() => router.push("/chat" as any)}
        >
          <View style={styles.heroTopRow}>
            <View style={styles.heroIconBox}>
              <Ionicons name="chatbubbles" size={32} color="#818cf8" />
            </View>
            <View style={styles.heroArrowBox}>
              <Ionicons name="arrow-forward" size={18} color="#818cf8" />
            </View>
          </View>
          <Text style={styles.heroTitle}>Ask your AI Coach</Text>
          <Text style={styles.heroSub}>
            Real-time workout calibration, personalized nutrition recommendations, and rapid meal guidance.
          </Text>
        </TouchableOpacity>

        {/* 3. The Tool Grid (Spacious 2-column flex grid for secondary tools) */}
        <View style={styles.gridContainer}>
          <TouchableOpacity 
            style={styles.gridCard}
            activeOpacity={0.85}
            onPress={() => router.push("/scanner" as any)}
          >
            <View style={[styles.gridIconBox, styles.scannerIconBox]}>
              <Ionicons name="scan" size={30} color="#38bdf8" />
            </View>
            <Text style={styles.gridTitle}>Ingredient Scanner</Text>
            <Text style={styles.gridSubtitle}>AI Vision Analysis</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.gridCard}
            activeOpacity={0.85}
            onPress={() => router.push("/fix-meal" as any)}
          >
            <View style={[styles.gridIconBox, styles.fixIconBox]}>
              <Ionicons name="restaurant" size={28} color="#c084fc" />
            </View>
            <Text style={styles.gridTitle}>Fix Meal</Text>
            <Text style={styles.gridSubtitle}>Macro Re-engineer</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#020617",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerSubtitle: { 
    fontSize: 11, 
    fontWeight: "800", 
    color: "#818cf8", 
    letterSpacing: 1.5,
  },
  headerTitle: { 
    fontSize: 26, 
    fontWeight: "800", 
    color: "#f8fafc",
    marginTop: 4,
    letterSpacing: -0.5,
  },
  profileBtn: { 
    padding: 4,
  },
  scroll: { 
    paddingHorizontal: 24,
    paddingTop: 8,
    gap: 20,
    paddingBottom: 48,
  },
  blueprintCard: {
    backgroundColor: "#1e293b",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "#334155",
  },
  blueprintHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  blueprintBadge: {
    fontSize: 11,
    fontWeight: "800",
    color: "#94a3b8",
    letterSpacing: 1.2,
  },
  proPill: {
    backgroundColor: "#020617",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#818cf8",
  },
  proPillText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#818cf8",
    letterSpacing: 0.8,
  },
  targetRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  targetIcon: {
    fontSize: 16,
    marginRight: 2,
  },
  targetText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#f8fafc",
    letterSpacing: 0.2,
  },
  targetDivider: {
    fontSize: 14,
    fontWeight: "400",
    color: "#475569",
  },
  heroCard: {
    backgroundColor: "#1e293b",
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: "#334155",
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  heroIconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#020617",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(129, 140, 248, 0.4)",
  },
  heroArrowBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#020617",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#f8fafc",
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  heroSub: {
    fontSize: 14,
    color: "#94a3b8",
    lineHeight: 22,
    fontWeight: "400",
  },
  gridContainer: {
    flexDirection: "row",
    gap: 20,
  },
  gridCard: {
    flex: 1,
    backgroundColor: "#1e293b",
    borderRadius: 24,
    padding: 22,
    alignItems: "flex-start",
    justifyContent: "space-between",
    minHeight: 160,
    borderWidth: 1,
    borderColor: "#334155",
  },
  gridIconBox: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: "#020617",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    borderWidth: 1,
  },
  scannerIconBox: {
    borderColor: "rgba(56, 189, 248, 0.3)",
  },
  fixIconBox: {
    borderColor: "rgba(192, 132, 252, 0.3)",
  },
  gridTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#f8fafc",
    marginBottom: 4,
  },
  gridSubtitle: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748b",
  },
});
