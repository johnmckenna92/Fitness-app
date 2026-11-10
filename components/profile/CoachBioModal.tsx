import React from "react";
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useTheme } from "../../ctx/ThemeContext";
import { Profile, TrainerProfile } from "../../ctx/AuthContext";

interface CoachBioModalProps {
  visible: boolean;
  onClose: () => void;
  trainer: (Profile & { display_name?: string }) | TrainerProfile | null;
  avatarUri: string | null;
}

export function CoachBioModal({ visible, onClose, trainer, avatarUri }: CoachBioModalProps) {
  const { colors, isDark } = useTheme();
  const trainerName = (trainer as any)?.display_name || trainer?.full_name || "Coach";
  const firstLetter = (trainerName || "C").charAt(0).toUpperCase();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={[styles.header, { borderBottomColor: colors.borderSubtle }]}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View style={[styles.icon, { backgroundColor: isDark ? "rgba(74, 222, 128, 0.15)" : "rgba(74, 222, 128, 0.12)" }]}>
                <Ionicons name="ribbon-outline" size={18} color={colors.primary} />
              </View>
              <Text style={[styles.title, { color: colors.text }]}>Coach Credentials</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: isDark ? "#1e293b" : "#f1f5f9" }]}>
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            <View style={[styles.hero, { backgroundColor: isDark ? "#020617" : "#f8fafc", borderColor: colors.borderSubtle }]}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatar} contentFit="cover" />
              ) : (
                <View style={[styles.avatar, { backgroundColor: colors.surfaceSubtle, alignItems: "center", justifyContent: "center" }]}>
                  <Text style={{ fontSize: 30, fontWeight: "800", color: colors.primaryText }}>{firstLetter}</Text>
                </View>
              )}
              <View style={[styles.badge, { backgroundColor: isDark ? "rgba(16, 185, 129, 0.15)" : "rgba(16, 185, 129, 0.1)" }]}>
                <Ionicons name="shield-checkmark" size={13} color={colors.success} style={{ marginRight: 4 }} />
                <Text style={{ color: colors.success, fontSize: 11, fontWeight: "800" }}>VERIFIED COACH</Text>
              </View>
              <Text style={[styles.name, { color: colors.text }]}>{trainerName}</Text>
              <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 2 }}>Personal Trainer & Sports Nutritionist</Text>
            </View>

            <View style={[styles.sec, { backgroundColor: isDark ? "#020617" : "#f8fafc", borderColor: colors.borderSubtle }]}>
              <Text style={[styles.secTitle, { color: colors.text }]}>Verified Credentials</Text>
              <Text style={[styles.bullet, { color: colors.textSecondary }]}>• Certified Personal Trainer (NASM / ACE)</Text>
              <Text style={[styles.bullet, { color: colors.textSecondary }]}>• Precision Nutrition Level 1 (Pn1) Coach</Text>
              <Text style={[styles.bullet, { color: colors.textSecondary }]}>• Hypertrophy & Macro Adherence Specialist</Text>
            </View>

            <View style={[styles.sec, { backgroundColor: isDark ? "#020617" : "#f8fafc", borderColor: colors.borderSubtle }]}>
              <Text style={[styles.secTitle, { color: colors.text }]}>Full Bio</Text>
              <Text style={[styles.bio, { color: colors.textSecondary }]}>
                {trainer?.trainer_bio?.trim()
                  ? trainer.trainer_bio
                  : "Dedicated to helping athletes achieve their goals through structured nutrition protocols and precision coaching."}
              </Text>
            </View>

            <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.btnText}>Close</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.7)", justifyContent: "flex-end" },
  card: { borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 1, borderBottomWidth: 0, maxHeight: "85%" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 18, borderBottomWidth: 1 },
  icon: { width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 17, fontWeight: "800" },
  closeBtn: { width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  body: { padding: 18, gap: 14, paddingBottom: 40 },
  hero: { alignItems: "center", padding: 18, borderRadius: 18, borderWidth: 1 },
  avatar: { width: 76, height: 76, borderRadius: 38, marginBottom: 10 },
  badge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginBottom: 6 },
  name: { fontSize: 19, fontWeight: "800" },
  sec: { padding: 16, borderRadius: 16, borderWidth: 1, gap: 6 },
  secTitle: { fontSize: 14, fontWeight: "800", marginBottom: 4 },
  bullet: { fontSize: 13, lineHeight: 18 },
  bio: { fontSize: 13, lineHeight: 20 },
  btn: { paddingVertical: 13, borderRadius: 14, alignItems: "center", marginTop: 4 },
  btnText: { color: "#0a0a0a", fontSize: 15, fontWeight: "800" },
});
