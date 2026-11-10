import React, { useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { useAuth } from "../ctx/AuthContext";
import { useTheme } from "../ctx/ThemeContext";
import { showAppAlert } from "../components/CustomAlert";
import { supabase } from "../lib/supabase";

export default function AccountSecurityScreen() {
  const { session, profile, signOut, refreshProfile } = useAuth();
  const { colors, isDark } = useTheme();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const trainerId = profile?.trainer_id;
  const isCoachLinked = Boolean(trainerId && profile?.client_state !== "deactivated");

  const handleUnlinkCoach = () => {
    showAppAlert(
      "Unlink from Coach",
      "Are you sure you want to sever your coaching relationship? You will return to self-guided nutrition targets.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unlink",
          style: "destructive",
          onPress: async () => {
            const userId = session?.user?.id;
            if (!userId) return;
            try {
              setIsUnlinking(true);
              const { error } = await supabase
                .from("profiles")
                .update({
                  client_state: "deactivated",
                } as any)
                .eq("id", userId);

              if (error) throw error;

              await refreshProfile();
              Toast.show({
                type: "success",
                text1: "Coach Unlinked",
                text2: "You are now on self-guided nutrition.",
              });
            } catch (err: any) {
              console.error("[AccountSecurity] Unlink coach error:", err);
              Toast.show({
                type: "error",
                text1: "Action Failed",
                text2: err?.message || "Could not unlink coach.",
              });
            } finally {
              setIsUnlinking(false);
            }
          },
        },
      ]
    );
  };

  const handleSignOut = () => {
    showAppAlert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    showAppAlert(
      "Schedule Account Deletion",
      "Your account is scheduled for deletion in 3 days. Sign in before then to cancel.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Schedule Deletion",
          style: "destructive",
          onPress: async () => {
            const userId = session?.user?.id;
            if (!userId) return;
            try {
              setIsDeleting(true);
              const { error } = await supabase
                .from("profiles")
                .update({
                  account_status: "pending_deletion",
                  deleted_at: new Date().toISOString(),
                } as any)
                .eq("id", userId);

              if (error) throw error;

              await signOut();
              router.replace("/(auth)/login");
              Toast.show({
                type: "success",
                text1: "Account Scheduled for Deletion",
                text2: "Sign in within 3 days to cancel.",
              });
            } catch (err: any) {
              console.error("[AccountSecurity] Deletion error:", err);
              Toast.show({ type: "error", text1: "Action Failed", text2: err?.message || "Could not schedule deletion." });
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handleLinkCoach = async () => {
    const cleanSuffix = inviteCode
      .replace(/^KL-/i, "")
      .replace(/[^A-Za-z0-9]/g, "")
      .toUpperCase()
      .trim();

    if (!cleanSuffix) {
      Toast.show({
        type: "error",
        text1: "Invalid Code",
        text2: "Please enter your coach's 6-character referral code.",
      });
      return;
    }
    
    const fullCode = `KL-${cleanSuffix}`;
    const userId = session?.user?.id;
    if (!userId) return;

    try {
      setIsLinking(true);
      
      const { error } = await supabase.rpc("consume_trainer_invite", {
        p_invite_code: fullCode,
        p_user_id: userId,
      });

      if (error) throw error;

      await refreshProfile();
      
      Toast.show({ type: "success", text1: "Coach Linked", text2: "You are now linked to your coach." });
      setInviteCode("");
    } catch (err: any) {
      console.error("[AccountSecurity] Coach link error:", err);
      Toast.show({ type: "error", text1: "Link Failed", text2: err?.message || "Could not link to coach." });
    } finally {
      setIsLinking(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
      <View style={[styles.header, { borderBottomColor: colors.borderSubtle }]}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: isDark ? "#1e293b" : "#f1f5f9" }]} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Account & Security</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, { backgroundColor: isDark ? "rgba(74, 222, 128, 0.15)" : "rgba(74, 222, 128, 0.12)" }]}>
              <Ionicons name="shield-checkmark-outline" size={18} color={colors.primary} />
            </View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Coach Linkage</Text>
          </View>
          
          {isCoachLinked ? (
            <View style={{ gap: 12 }}>
              <View style={[styles.coachBox, { backgroundColor: isDark ? "#020617" : "#f8fafc", borderColor: colors.borderSubtle }]}>
                <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.coachTitle, { color: colors.text }]}>Linked Coach: Active</Text>
                  <Text style={[styles.coachSub, { color: colors.textSecondary }]}>Trainer has read access to your logs and nutrition progress.</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.unlinkBtn, { backgroundColor: colors.destructiveBg, borderColor: isDark ? "rgba(239, 68, 68, 0.4)" : "rgba(239, 68, 68, 0.2)" }]}
                onPress={handleUnlinkCoach}
                disabled={isUnlinking}
                activeOpacity={0.7}
              >
                {isUnlinking ? (
                  <ActivityIndicator size="small" color={colors.destructive} />
                ) : (
                  <>
                    <Ionicons name="link-outline" size={16} color={colors.destructive} style={{ marginRight: 6 }} />
                    <Text style={[styles.unlinkBtnText, { color: colors.destructive }]}>Unlink from Coach</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              <View style={[styles.coachBox, { backgroundColor: isDark ? "#020617" : "#f8fafc", borderColor: colors.borderSubtle }]}>
                <View style={[styles.statusDot, { backgroundColor: colors.textMuted }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.coachTitle, { color: colors.text }]}>Self-Guided (No Coach Linked)</Text>
                  <Text style={[styles.coachSub, { color: colors.textSecondary }]}>Your nutrition and workout targets are self-calibrated.</Text>
                </View>
              </View>

              <View style={[styles.linkBox, { backgroundColor: isDark ? "#1e293b" : "#f1f5f9", borderColor: colors.borderSubtle }]}>
                <Text style={[styles.linkBoxTitle, { color: colors.text }]}>Link to a Coach</Text>
                <Text style={[styles.linkBoxSub, { color: colors.textSecondary }]}>Enter the invite code provided by your trainer.</Text>
                
                <View style={styles.inputRow}>
                  <View
                    style={[
                      styles.lockedInputContainer,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.borderSubtle,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.prefixBadge,
                        {
                          backgroundColor: isDark
                            ? "rgba(74, 222, 128, 0.12)"
                            : "rgba(16, 185, 129, 0.08)",
                          borderRightColor: colors.borderSubtle,
                        },
                      ]}
                    >
                      <Text style={[styles.prefixText, { color: colors.primary }]}>
                        KL-
                      </Text>
                    </View>
                    <TextInput
                      style={[styles.lockedInput, { color: colors.text }]}
                      placeholder="XXXXXX"
                      placeholderTextColor={colors.textMuted}
                      value={inviteCode}
                      onChangeText={(text) => {
                        const clean = text
                          .replace(/^KL-/i, "")
                          .replace(/[^A-Za-z0-9]/g, "")
                          .toUpperCase()
                          .slice(0, 6);
                        setInviteCode(clean);
                      }}
                      autoCapitalize="characters"
                      autoCorrect={false}
                      maxLength={6}
                    />
                  </View>
                  <TouchableOpacity 
                    style={[styles.submitBtn, { backgroundColor: colors.primary }]}
                    onPress={handleLinkCoach}
                    disabled={isLinking}
                    activeOpacity={0.7}
                  >
                    {isLinking ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.submitBtnText}>Submit</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, { backgroundColor: isDark ? "rgba(74, 222, 128, 0.15)" : "rgba(74, 222, 128, 0.12)" }]}>
              <Ionicons name="log-out-outline" size={18} color={colors.primary} />
            </View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Session</Text>
          </View>
          <TouchableOpacity style={[styles.safeBtn, { backgroundColor: isDark ? "#1e293b" : "#f1f5f9", borderColor: colors.borderSubtle }]} onPress={handleSignOut} activeOpacity={0.7}>
            <Ionicons name="log-out-outline" size={18} color={colors.destructive} style={{ marginRight: 8 }} />
            <Text style={[styles.safeBtnText, { color: colors.destructive }]}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View
          className="bg-white dark:bg-red-950/20 border-red-500/30 dark:border-red-500/50"
          style={[styles.card, { borderWidth: 1.5 }]}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, { backgroundColor: isDark ? "rgba(244, 63, 94, 0.15)" : "rgba(239, 68, 68, 0.1)" }]}>
              <Ionicons name="warning-outline" size={18} color={colors.destructive} />
            </View>
            <Text style={[styles.cardTitle, { color: colors.destructive }]}>Danger Zone</Text>
          </View>
          <Text style={[styles.dangerSub, { color: colors.textSecondary }]}>
            Your account is scheduled for deletion in 3 days. Sign in before then to cancel.
          </Text>
          <TouchableOpacity style={[styles.deleteBtn, { backgroundColor: colors.destructiveBg }]} onPress={handleDeleteAccount} disabled={isDeleting} activeOpacity={0.7}>
            {isDeleting ? <ActivityIndicator size="small" color={colors.destructive} /> : (
              <>
                <Ionicons name="trash-outline" size={16} color={colors.destructive} style={{ marginRight: 6 }} />
                <Text style={[styles.deleteBtnText, { color: colors.destructive }]}>Delete Account</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  backBtn: { width: 38, height: 38, borderRadius: 19, justifyContent: "center", alignItems: "center" },
  headerTitle: { fontSize: 17, fontWeight: "800", letterSpacing: -0.2 },
  scrollContent: { padding: 18, gap: 16, paddingBottom: 40 },
  card: { borderRadius: 24, borderWidth: 1, padding: 18, elevation: 2 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 },
  iconCircle: { width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  cardTitle: { fontSize: 16, fontWeight: "800", letterSpacing: -0.2 },
  coachBox: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 14, borderWidth: 1, gap: 12 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  coachTitle: { fontSize: 14, fontWeight: "700" },
  coachSub: { fontSize: 12, marginTop: 2, lineHeight: 18 },
  linkBox: { padding: 16, borderRadius: 14, borderWidth: 1, gap: 10 },
  linkBoxTitle: { fontSize: 14, fontWeight: "700" },
  linkBoxSub: { fontSize: 13, lineHeight: 18, marginBottom: 4 },
  inputRow: { flexDirection: "row", gap: 8 },
  lockedInputContainer: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  prefixBadge: {
    paddingHorizontal: 12,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
  },
  prefixText: {
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  lockedInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 12,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  input: { flex: 1, height: 44, borderRadius: 10, borderWidth: 1, paddingHorizontal: 14, fontSize: 15, fontWeight: "600" },
  submitBtn: { height: 44, paddingHorizontal: 16, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  submitBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  safeBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 12, borderRadius: 14, borderWidth: 1 },
  safeBtnText: { fontSize: 14, fontWeight: "700" },
  unlinkBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 12, borderRadius: 14, borderWidth: 1 },
  unlinkBtnText: { fontSize: 14, fontWeight: "700" },
  dangerSub: { fontSize: 13, lineHeight: 19, marginBottom: 16 },
  deleteBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 13, borderRadius: 14 },
  deleteBtnText: { fontSize: 14, fontWeight: "700" },
});
