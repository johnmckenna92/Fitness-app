import React from "react";
import { ActivityIndicator, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../ctx/ThemeContext";

interface CustomToggleProps {
  value: boolean;
  onValueChange: (val: boolean) => void;
  accessibilityLabel?: string;
}

export function CustomToggle({ value, onValueChange, accessibilityLabel }: CustomToggleProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onValueChange(!value)}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={accessibilityLabel}
      style={[styles.customToggleTrack, { backgroundColor: value ? "#10b981" : "#71717a40" }]}
      className={value ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-700"}
    >
      <View style={[styles.customToggleThumb, { alignSelf: value ? "flex-end" : "flex-start" }]} />
    </TouchableOpacity>
  );
}

interface PermissionsAndAlertsCardProps {
  pushEnabled: boolean;
  mealRemindersEnabled: boolean;
  coachAlertsEnabled: boolean;
  onTogglePush: (val: boolean) => void;
  onToggleMeals: (val: boolean) => void;
  onToggleCoach: (val: boolean) => void;
  isSyncingHealth?: boolean;
  stepsRAG?: string | null;
  healthSyncError?: string | null;
  onSyncHealth?: () => void;
}

export function PermissionsAndAlertsCard({
  pushEnabled,
  mealRemindersEnabled,
  coachAlertsEnabled,
  onTogglePush,
  onToggleMeals,
  onToggleCoach,
  isSyncingHealth = false,
  stepsRAG,
  healthSyncError,
  onSyncHealth,
}: PermissionsAndAlertsCardProps) {
  const { colors, isDark } = useTheme();
  const isWearableConnected = Boolean(stepsRAG) && !healthSyncError;
  const wearablePlatformName = Platform.OS === "ios" ? "Apple Health" : "Health Connect";

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: isDark ? "#18181b" : "#f4f4f5", borderColor: isDark ? "#27272a" : "#e4e4e7" },
      ]}
      className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm"
    >
      <View style={styles.header}>
        <View style={styles.titleGroup}>
          <View style={[styles.iconCircle, { backgroundColor: isDark ? "rgba(16, 185, 129, 0.15)" : "rgba(16, 185, 129, 0.12)" }]}>
            <Ionicons name="shield-checkmark-outline" size={18} color="#10b981" />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Permissions & Alerts</Text>
        </View>
      </View>

      <Text style={[styles.label, { color: colors.textSecondary }]}>WEARABLE HEALTH SYNC</Text>
      <View style={[styles.wearableBox, { backgroundColor: isDark ? "#09090b" : "#ffffff", borderColor: isDark ? "#27272a" : "#e4e4e7" }]}>
        <View style={styles.wearableTopRow}>
          <View style={styles.wearableInfo}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Ionicons name={Platform.OS === "ios" ? "heart-outline" : "fitness-outline"} size={16} color="#10b981" />
              <Text style={[styles.wearableTitle, { color: colors.text }]}>{wearablePlatformName}</Text>
            </View>
            <Text style={[styles.wearableSub, { color: colors.textMuted }]}>Daily step count & adherence tracking</Text>
          </View>

          <View style={[styles.statusBadge, {
            backgroundColor: isWearableConnected
              ? (isDark ? "rgba(16, 185, 129, 0.15)" : "rgba(16, 185, 129, 0.12)")
              : (isDark ? "rgba(245, 158, 11, 0.15)" : "rgba(245, 158, 11, 0.12)"),
            borderColor: isWearableConnected ? "rgba(16, 185, 129, 0.3)" : "rgba(245, 158, 11, 0.3)",
          }]}>
            <View style={[styles.statusDot, { backgroundColor: isWearableConnected ? "#10b981" : "#f59e0b" }]} />
            <Text style={[styles.statusBadgeText, { color: isWearableConnected ? "#10b981" : "#f59e0b" }]}>
              {isWearableConnected ? "Connected" : "Permissions Required"}
            </Text>
          </View>
        </View>

        <View style={styles.wearableActionRow}>
          <TouchableOpacity
            style={[styles.syncBtn, { backgroundColor: "#10b981", opacity: isSyncingHealth ? 0.7 : 1 }]}
            onPress={onSyncHealth}
            disabled={isSyncingHealth}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Sync Health Now"
          >
            {isSyncingHealth ? (
              <ActivityIndicator size="small" color="#0a0a0a" />
            ) : (
              <Ionicons name="sync" size={14} color="#0a0a0a" />
            )}
            <Text style={styles.syncBtnText}>{isSyncingHealth ? "Syncing..." : "Sync Now"}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.zeroDataBox}>
          <Ionicons name="lock-closed-outline" size={12} color={colors.textSecondary} />
          <Text style={[styles.zeroDataText, { color: colors.textSecondary }]}>
            Zero-Medical-Data: Raw metrics remain on-device. Only private RAG adherence status is synced to Supabase.
          </Text>
        </View>
      </View>

      <View style={styles.divider} />
      <Text style={[styles.label, { color: colors.textSecondary }]}>NOTIFICATIONS & ALERTS</Text>

      <View style={styles.toggleRow}>
        <View style={styles.toggleInfo}>
          <Text style={[styles.toggleTitle, { color: colors.text }]}>Push Notifications</Text>
          <Text style={[styles.toggleSub, { color: colors.textMuted }]}>Daily reminders & schedule updates</Text>
        </View>
        <CustomToggle value={pushEnabled} onValueChange={onTogglePush} accessibilityLabel="Toggle Push Notifications" />
      </View>

      <View style={styles.toggleRow}>
        <View style={styles.toggleInfo}>
          <Text style={[styles.toggleTitle, { color: colors.text }]}>Meal Log Reminders</Text>
          <Text style={[styles.toggleSub, { color: colors.textMuted }]}>Breakfast, lunch, and dinner prompts</Text>
        </View>
        <CustomToggle value={mealRemindersEnabled} onValueChange={onToggleMeals} accessibilityLabel="Toggle Meal Log Reminders" />
      </View>

      <View style={[styles.toggleRow, { marginBottom: 0 }]}>
        <View style={styles.toggleInfo}>
          <Text style={[styles.toggleTitle, { color: colors.text }]}>Coach Updates</Text>
          <Text style={[styles.toggleSub, { color: colors.textMuted }]}>Direct feedback and target adjustments from trainer</Text>
        </View>
        <CustomToggle value={coachAlertsEnabled} onValueChange={onToggleCoach} accessibilityLabel="Toggle Coach Updates" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  titleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  label: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  wearableBox: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 6,
  },
  wearableTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  wearableInfo: {
    flex: 1,
    marginRight: 10,
  },
  wearableTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  wearableSub: {
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  wearableActionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 10,
  },
  syncBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  syncBtnText: {
    color: "#0a0a0a",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  zeroDataBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(148, 163, 184, 0.15)",
  },
  zeroDataText: {
    fontSize: 11,
    flex: 1,
    lineHeight: 15,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(148, 163, 184, 0.15)",
    marginVertical: 14,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  toggleInfo: {
    flex: 1,
    marginRight: 16,
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  toggleSub: {
    fontSize: 12,
    marginTop: 2,
  },
  customToggleTrack: {
    width: 46,
    height: 26,
    borderRadius: 13,
    padding: 3,
    justifyContent: "center",
  },
  customToggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
});

