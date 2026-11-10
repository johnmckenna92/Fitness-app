import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../ctx/AuthContext";
import { useAppStore } from "../../store/useAppStore";

interface StepsRAGWidgetProps {
  colorScheme?: string;
  stepTarget?: number;
}

export default function StepsRAGWidget({ stepTarget = 10000 }: StepsRAGWidgetProps) {
  const { session } = useAuth();
  const { stepsRAG, localSteps, isSyncingHealth, syncHealth, healthSyncError } = useAppStore();

  useEffect(() => {
    if (session?.user?.id && !stepsRAG) {
      syncHealth(session.user.id, stepTarget);
    }
  }, [session?.user?.id, stepsRAG, stepTarget, syncHealth]);

  const handleRefresh = () => {
    if (session?.user?.id) {
      syncHealth(session.user.id, stepTarget);
    }
  };

  // Determine RAG colors and status message
  let dotColor = "#ef4444"; // red
  let statusText = "Action Required: Behind Step Goal";
  let badgeBg = "bg-red-500/10 border-red-500/30";
  let badgeTextColor = "text-red-500";

  if (stepsRAG === "green") {
    dotColor = "#22c55e";
    statusText = "Optimal: Target Reached";
    badgeBg = "bg-emerald-500/10 border-emerald-500/30";
    badgeTextColor = "text-emerald-700 dark:text-emerald-400";
  } else if (stepsRAG === "amber") {
    dotColor = "#f59e0b";
    statusText = "Moderate: Approaching Target";
    badgeBg = "bg-amber-500/10 border-amber-500/30";
    badgeTextColor = "text-amber-500";
  }

  return (
    <View className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm">
      <View style={styles.topRow}>
        <View style={styles.titleWithDot}>
          <View style={[styles.ragDot, { backgroundColor: dotColor }]} />
          <Text className="text-xs font-extrabold text-zinc-500 dark:text-zinc-400 tracking-wider">
            HEALTH COMPLIANCE (RAG)
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleRefresh}
          disabled={isSyncingHealth}
          className="p-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800"
        >
          {isSyncingHealth ? (
            <ActivityIndicator size="small" color="#10b981" />
          ) : (
            <Ionicons name="sync" size={14} color="#71717a" />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.contentRow}>
        <View>
          <Text className="text-2xl font-black text-zinc-900 dark:text-white">
            {localSteps.toLocaleString()} <Text className="text-sm font-normal text-zinc-400">steps</Text>
          </Text>
          <Text className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Target: {stepTarget.toLocaleString()} steps/day
          </Text>
        </View>

        <View className={`px-3 py-1.5 rounded-full border ${badgeBg}`}>
          <Text className={`text-xs font-bold uppercase tracking-wider ${badgeTextColor}`}>
            {stepsRAG ?? "EVALUATING"}
          </Text>
        </View>
      </View>

      {healthSyncError ? (
        <View className="mb-3 p-3 rounded-2xl bg-red-500/10 border border-red-500/20 flex-row items-center justify-between">
          <View className="flex-1 mr-3">
            <Text className="text-xs font-bold text-red-500 dark:text-red-400">
              Wearable Sync Notice
            </Text>
            <Text className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5" numberOfLines={2}>
              {healthSyncError}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleRefresh}
            disabled={isSyncingHealth}
            className="px-3 py-1.5 rounded-xl bg-red-500 active:bg-red-600 flex-row items-center"
            accessibilityRole="button"
            accessibilityLabel="Refresh Sync"
          >
            {isSyncingHealth ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Ionicons name="refresh" size={12} color="#ffffff" style={{ marginRight: 4 }} />
                <Text className="text-xs font-bold text-white">Refresh Sync</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={styles.footerRow}>
        <Ionicons name="shield-checkmark-outline" size={12} color="#10b981" />
        <Text className="text-[11px] text-zinc-400 font-medium ml-1">
          {statusText} • Zero-Medical-Data Protected
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  titleWithDot: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ragDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  contentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
});

