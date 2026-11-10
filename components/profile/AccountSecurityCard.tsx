import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTheme } from "../../ctx/ThemeContext";

interface AccountSecurityCardProps {
  trainerId?: string | null;
  onSignOut: () => void;
}

export function AccountSecurityCard({
  onSignOut,
}: AccountSecurityCardProps) {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <View style={styles.header}>
        <View style={styles.titleGroup}>
          <View style={[styles.iconCircle, { backgroundColor: isDark ? "rgba(74, 222, 128, 0.15)" : "rgba(74, 222, 128, 0.12)" }]}>
            <Ionicons name="shield-checkmark-outline" size={18} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Account & Security</Text>
        </View>
      </View>

      {/* Sign Out Action */}
      <TouchableOpacity
        style={[styles.safeBtn, { backgroundColor: isDark ? "#1e293b" : "#f1f5f9", borderColor: colors.borderSubtle }]}
        onPress={onSignOut}
        activeOpacity={0.7}
      >
        <Ionicons name="log-out-outline" size={18} color={colors.destructive} style={{ marginRight: 8 }} />
        <Text style={[styles.safeBtnText, { color: colors.destructive }]}>Sign Out</Text>
      </TouchableOpacity>

      {/* Nested Account Security Settings */}
      <TouchableOpacity
        style={[styles.securityLinkBtn, { borderColor: colors.borderSubtle }]}
        onPress={() => router.push("/account-security" as any)}
        activeOpacity={0.7}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Ionicons name="lock-closed-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.securityLinkText, { color: colors.textSecondary }]}>Account Data & Security Settings</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 24, borderWidth: 1, padding: 18, elevation: 3 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  titleGroup: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconCircle: { width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 16, fontWeight: "800", letterSpacing: -0.2 },
  safeBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 12, borderRadius: 14, borderWidth: 1, marginBottom: 10 },
  safeBtnText: { fontSize: 14, fontWeight: "700" },
  securityLinkBtn: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1 },
  securityLinkText: { fontSize: 13, fontWeight: "600" },
});

