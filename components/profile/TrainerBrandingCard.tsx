import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useTheme } from "../../ctx/ThemeContext";
import { supabase } from "../../lib/supabase";
import { Profile, TrainerProfile } from "../../ctx/AuthContext";
import { getSecureAvatarUrl } from "../../lib/storage";
import { CoachBioModal } from "./CoachBioModal";

interface TrainerBrandingCardProps {
  trainerId?: string | null;
  trainer?: TrainerProfile | (Profile & { display_name?: string }) | null;
  ptNotes?: string | null;
  onPtNotesChange?: (val: string) => void;
  isProUser?: boolean;
  onScanPlan?: () => void;
  isScanning?: boolean;
}

export function TrainerBrandingCard({
  trainerId,
  trainer: propTrainer,
  ptNotes,
  onPtNotesChange,
  isProUser = false,
  onScanPlan,
  isScanning = false,
}: TrainerBrandingCardProps) {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const [fetchedTrainer, setFetchedTrainer] = useState<(Profile & { display_name?: string }) | TrainerProfile | null>(null);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [bioModalVisible, setBioModalVisible] = useState(false);

  const rawTrainer = propTrainer || fetchedTrainer;
  const trainer = Array.isArray(rawTrainer) ? rawTrainer[0] : rawTrainer;

  const handleOpenCoachProfile = () => {
    const rawTargetId = trainerId || (trainer as any)?.id;
    const targetId = Array.isArray(rawTargetId) ? rawTargetId[0] : rawTargetId;
    const isValidId =
      Boolean(targetId) &&
      typeof targetId === "string" &&
      targetId.trim() !== "" &&
      targetId.trim().toLowerCase() !== "undefined" &&
      targetId.trim().toLowerCase() !== "null";

    if (isValidId) {
      router.push(`/trainer/${targetId.trim()}` as any);
    } else {
      setBioModalVisible(true);
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function loadTrainerData() {
      await Promise.resolve();
      if (!isMounted) return;

      const resolvedPropTrainer = Array.isArray(propTrainer) ? propTrainer[0] : propTrainer;
      if (resolvedPropTrainer) {
        if (resolvedPropTrainer.avatar_url) {
          const secure = await getSecureAvatarUrl(resolvedPropTrainer.avatar_url);
          if (isMounted) setAvatarUri(secure || resolvedPropTrainer.avatar_url || null);
        } else {
          if (isMounted) setAvatarUri(null);
        }
        return;
      }

      if (!trainerId) {
        if (isMounted) setAvatarUri(null);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url, trainer_bio, role")
          .eq("id", trainerId)
          .maybeSingle();

        if (!error && data && isMounted) {
          setFetchedTrainer(data as Profile);
          if (data.avatar_url) {
            const secure = await getSecureAvatarUrl(data.avatar_url);
            if (isMounted) setAvatarUri(secure || data.avatar_url);
          }
        }
      } catch (err) {
        console.warn("[TrainerBrandingCard] Error fetching trainer:", err);
      }
    }

    loadTrainerData();

    return () => {
      isMounted = false;
    };
  }, [trainerId, propTrainer]);

  // If user does not have a trainer assigned, hide the trainer section entirely
  if (!trainerId && !trainer) {
    return null;
  }

  const isTrainerLoading = !trainer && Boolean(trainerId);

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <View style={styles.headerRow}>
        <View style={[styles.iconCircle, { backgroundColor: isDark ? "rgba(74, 222, 128, 0.15)" : "rgba(74, 222, 128, 0.12)" }]}>
          <Ionicons name="ribbon-outline" size={18} color={colors.primary} />
        </View>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Assigned Coach & Protocol</Text>
        <View style={[styles.activeTag, { backgroundColor: isDark ? "rgba(16, 185, 129, 0.15)" : "rgba(16, 185, 129, 0.1)" }]}>
          <Text style={{ color: colors.success, fontSize: 10, fontWeight: "800" }}>ACTIVE</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.trainerBox, { backgroundColor: isDark ? "#020617" : "#f8fafc", borderColor: colors.borderSubtle }]}
        onPress={handleOpenCoachProfile}
        activeOpacity={0.7}
      >
        {isTrainerLoading ? (
          <View style={[styles.avatar, styles.avatarFallback, { backgroundColor: colors.surfaceSubtle }]}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatar} contentFit="cover" />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback, { backgroundColor: colors.surfaceSubtle }]}>
            <Text style={{ color: colors.primaryText, fontSize: 20, fontWeight: "800" }}>
              {(((trainer as any)?.display_name || trainer?.full_name || "C").charAt(0)).toUpperCase()}
            </Text>
          </View>
        )}

        <View style={{ flex: 1, marginLeft: 14 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={[styles.trainerName, { color: colors.primaryText }]} numberOfLines={1}>
              {isTrainerLoading
                ? "Assigned Coach"
                : ((trainer as any)?.display_name || trainer?.full_name || "Trainer")}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.primaryText} />
          </View>
          <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>
            {isTrainerLoading ? "Loading coach profile..." : "Personal Trainer & Sports Nutritionist"}
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 4 }}>
            Tap to view coach profile
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.viewProfileBtn, { backgroundColor: colors.primary }]}
        onPress={handleOpenCoachProfile}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="View Full Coach Profile"
      >
        <Ionicons name="person-circle-outline" size={18} color="#0a0a0a" />
        <Text style={styles.viewProfileBtnText}>View Full Coach Profile</Text>
      </TouchableOpacity>

      <CoachBioModal
        visible={bioModalVisible}
        onClose={() => setBioModalVisible(false)}
        trainer={trainer}
        avatarUri={avatarUri}
      />

      {/* Subtle Data Access Notice */}
      <View style={styles.accessWarningRow}>
        <Ionicons name="shield-checkmark-outline" size={13} color={colors.textSecondary} />
        <Text style={[styles.accessWarningText, { color: colors.textSecondary }]}>
          Trainer has real-time read access to your logs and nutrition progress.
        </Text>
      </View>

      <View style={styles.divider} />

      {/* Protocol Guidelines for Assigned Coach */}
      <View style={styles.notesHeader}>
        <View style={styles.notesTitleGroup}>
          <Ionicons name="clipboard-outline" size={14} color={colors.primary} />
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
            NOTES / PROTOCOL GUIDELINES
          </Text>
        </View>
        <View
          style={[
            styles.proBadge,
            {
              backgroundColor: isDark
                ? "rgba(34, 197, 94, 0.15)"
                : "rgba(34, 197, 94, 0.12)",
            },
          ]}
        >
          <Ionicons name="shield-checkmark" size={10} color="#22c55e" />
          <Text style={[styles.proText, { color: "#22c55e" }]}>Prescribed by Coach</Text>
        </View>
      </View>

      <Text style={[styles.notesSubtext, { color: colors.textMuted }]}>
        Prescribed by your coach. Gemini strictly adheres to these rules.
      </Text>

      <View
        style={[
          styles.ptNotesBox,
          { backgroundColor: isDark ? "#020617" : "#f8fafc", borderColor: colors.borderSubtle },
        ]}
      >
        <Text style={[styles.ptNotesText, { color: ptNotes?.trim() ? colors.text : colors.textMuted }]}>
          {ptNotes?.trim() || "No specific rules provided by your coach."}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 24, borderWidth: 1, padding: 18, elevation: 3 },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  iconCircle: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", marginRight: 10 },
  cardTitle: { fontSize: 16, fontWeight: "800", letterSpacing: -0.2, flex: 1 },
  activeTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  trainerBox: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 16, borderWidth: 1 },
  viewProfileBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  viewProfileBtnText: {
    color: "#0a0a0a",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.1,
  },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  avatarFallback: { alignItems: "center", justifyContent: "center" },
  trainerName: { fontSize: 15, fontWeight: "800", textDecorationLine: "underline" },
  accessWarningRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10, paddingHorizontal: 4 },
  accessWarningText: { fontSize: 11, fontWeight: "500", flex: 1, lineHeight: 15 },
  divider: { height: 1, backgroundColor: "rgba(148, 163, 184, 0.15)", marginVertical: 14 },
  notesHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 2 },
  notesTitleGroup: { flexDirection: "row", alignItems: "center", gap: 6 },
  inputLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 0.6 },
  proBadge: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  proText: { fontSize: 10, fontWeight: "800" },
  notesSubtext: { fontSize: 11, marginBottom: 10, marginTop: 2 },
  ptNotesBox: { padding: 12, borderRadius: 12, borderWidth: 1 },
  ptNotesText: { fontSize: 12, lineHeight: 18 },
  ptNotesInput: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    fontSize: 13,
    lineHeight: 18,
    minHeight: 80,
  },
  scanPlanFooter: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  scanPlanBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  scanPlanBtnText: {
    fontSize: 11,
    fontWeight: "700",
  },
});
