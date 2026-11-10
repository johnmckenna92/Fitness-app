import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../ctx/ThemeContext";

interface ProtocolNotesCardProps {
  ptNotes: string;
  onPtNotesChange: (val: string) => void;
  isTrainerLinked: boolean;
  isProUser: boolean;
  onScanPlan?: () => void;
  isScanning?: boolean;
}

export function ProtocolNotesCard({
  ptNotes,
  onPtNotesChange,
  isTrainerLinked,
  isProUser,
  onScanPlan,
  isScanning = false,
}: ProtocolNotesCardProps) {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <View style={[styles.iconCircle, { backgroundColor: isDark ? "rgba(74, 222, 128, 0.15)" : "rgba(74, 222, 128, 0.12)" }]}>
            <Ionicons name="document-text-outline" size={18} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Notes & Protocol Guidelines</Text>
        </View>

        {isTrainerLinked ? (
          <View style={[styles.pill, { backgroundColor: isDark ? "rgba(34, 197, 94, 0.15)" : "rgba(34, 197, 94, 0.12)", borderColor: isDark ? "rgba(34, 197, 94, 0.4)" : "#22c55e" }]}>
            <Ionicons name="shield-checkmark" size={11} color="#22c55e" style={{ marginRight: 4 }} />
            <Text style={[styles.pillText, { color: "#22c55e" }]}>PRESCRIBED BY COACH</Text>
          </View>
        ) : isProUser ? (
          <View style={[styles.pill, { backgroundColor: isDark ? "rgba(74, 222, 128, 0.15)" : "rgba(74, 222, 128, 0.12)", borderColor: colors.primary }]}>
            <Ionicons name="star" size={11} color={colors.primaryText} style={{ marginRight: 4 }} />
            <Text style={[styles.pillText, { color: colors.primaryText }]}>PRO ATHLETE</Text>
          </View>
        ) : (
          <View style={[styles.pill, { backgroundColor: isDark ? "#1e293b" : "#f1f5f9", borderColor: colors.borderSubtle }]}>
            <Ionicons name="lock-closed" size={11} color={colors.textSecondary} style={{ marginRight: 4 }} />
            <Text style={[styles.pillText, { color: colors.textSecondary }]}>PRO ONLY</Text>
          </View>
        )}
      </View>

      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        {isTrainerLinked
          ? "Guidelines and dietary rules prescribed by your coach. Gemini strictly adheres to these rules."
          : "Your custom coaching rules, dietary constraints, and OCR guidelines. Gemini strictly adheres to these rules."}
      </Text>

      {isTrainerLinked ? (
        <View style={[styles.readOnlyContainer, { backgroundColor: isDark ? "#020617" : "#f8fafc", borderColor: colors.borderSubtle }]}>
          <View style={styles.readOnlyHeader}>
            <Ionicons name="lock-closed-outline" size={13} color={colors.textSecondary} />
            <Text style={[styles.readOnlyHeaderLabel, { color: colors.textSecondary }]}>
              Prescribed by Coach (Read-only)
            </Text>
          </View>
          <Text style={[styles.readOnlyText, { color: ptNotes ? colors.text : colors.textMuted }]}>
            {ptNotes.trim() || "No specific protocol notes prescribed yet."}
          </Text>
        </View>
      ) : isProUser ? (
        <View>
          <TextInput
            style={[styles.input, { backgroundColor: isDark ? "#18181b" : "#f4f4f5", borderColor: isDark ? "#27272a" : "#e4e4e7", color: colors.text }]}
            value={ptNotes}
            onChangeText={onPtNotesChange}
            placeholder="e.g. No dairy, high carb on leg days, 4L water daily..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <View style={styles.footerRow}>
            <Text style={[styles.helperText, { color: colors.textMuted }]}>
              AI advice and recipe screening strictly enforce these protocol rules.
            </Text>
            {onScanPlan && (
              <TouchableOpacity
                style={[styles.scanBtn, { backgroundColor: isDark ? "rgba(74, 222, 128, 0.12)" : "rgba(74, 222, 128, 0.08)", borderColor: colors.primary }]}
                onPress={onScanPlan}
                disabled={isScanning}
                activeOpacity={0.7}
              >
                {isScanning ? (
                  <ActivityIndicator size="small" color={colors.primaryText} />
                ) : (
                  <>
                    <Ionicons name="scan-outline" size={14} color={colors.primaryText} />
                    <Text style={[styles.scanBtnText, { color: colors.primaryText }]}>Upload Plan</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      ) : (
        <View style={[styles.lockedBox, { backgroundColor: isDark ? "#020617" : "#f8fafc", borderColor: colors.borderSubtle }]}>
          <Ionicons name="lock-closed" size={20} color={colors.primaryText} />
          <Text style={[styles.lockedTitle, { color: colors.text }]}>Upgrade to Pro for Protocol Guidance</Text>
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  card: { borderRadius: 24, borderWidth: 1, padding: 18, elevation: 3 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
  titleGroup: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  iconCircle: { width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 16, fontWeight: "800", letterSpacing: -0.2, flexShrink: 1 },
  pill: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  pillText: { fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  subtitle: { fontSize: 12, marginBottom: 14, marginLeft: 42, lineHeight: 16 },
  readOnlyContainer: { padding: 14, borderRadius: 14, borderWidth: 1 },
  readOnlyHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
  readOnlyHeaderLabel: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  readOnlyText: { fontSize: 13, lineHeight: 20, fontWeight: "500" },
  input: { borderRadius: 14, borderWidth: 1, padding: 12, fontSize: 13, lineHeight: 19, minHeight: 96 },
  footerRow: { marginTop: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  helperText: { fontSize: 11, flex: 1, lineHeight: 15 },
  scanBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1 },
  scanBtnText: { fontSize: 11, fontWeight: "700" },
  lockedBox: { padding: 20, borderRadius: 14, borderWidth: 1, alignItems: "center", gap: 6 },
  lockedTitle: { fontSize: 14, fontWeight: "800", marginTop: 4 },
});
