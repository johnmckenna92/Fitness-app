import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { useAuth } from "../ctx/AuthContext";
import { useTheme } from "../ctx/ThemeContext";
import { supabase } from "../lib/supabase";

export default function LockScreen() {
  const router = useRouter();
  const { session, refreshProfile, signOut } = useAuth();
  const { colors, isDark } = useTheme();
  const [isReactivating, setIsReactivating] = useState(false);

  const handleReactivate = async () => {
    if (!session?.user?.id) return;
    setIsReactivating(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          account_status: "active",
          trainer_id: null,
          subscription_tier: "free",
          subscription_status: "free",
          is_pro: false,
        } as any)
        .eq("id", session.user.id);

      if (error) {
        throw error;
      }

      await refreshProfile();

      Toast.show({
        type: "success",
        text1: "Account Reactivated",
        text2: "Standalone free tier active. All your historical logs are preserved.",
      });

      router.replace("/(tabs)");
    } catch (err: any) {
      console.error("[LockScreen] Reactivation error:", err);
      Toast.show({
        type: "error",
        text1: "Reactivation Failed",
        text2: err?.message || "Please check your network and try again.",
      });
    } finally {
      setIsReactivating(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.modalCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.cardBorder,
          },
        ]}
      >
        <View
          style={[
            styles.iconWrapper,
            {
              backgroundColor: isDark
                ? "rgba(239, 68, 68, 0.15)"
                : "rgba(239, 68, 68, 0.1)",
              borderColor: "rgba(239, 68, 68, 0.3)",
            },
          ]}
        >
          <Ionicons name="lock-closed" size={36} color={colors.destructive} />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>
          Account Status Notice
        </Text>

        <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
          Your account was locked by your trainer. To reactivate a standalone
          version, click here.
        </Text>

        <TouchableOpacity
          style={[
            styles.reactivateButton,
            { backgroundColor: colors.primary },
            isReactivating && { opacity: 0.7 },
          ]}
          onPress={handleReactivate}
          disabled={isReactivating}
          activeOpacity={0.8}
        >
          {isReactivating ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <View style={styles.buttonInner}>
              <Ionicons
                name="refresh-outline"
                size={18}
                color="#ffffff"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.buttonText}>Click Here to Reactivate</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.signOutButton, { borderColor: colors.borderSubtle }]}
          onPress={signOut}
          activeOpacity={0.7}
        >
          <Ionicons
            name="log-out-outline"
            size={16}
            color={colors.textMuted}
            style={{ marginRight: 6 }}
          />
          <Text style={[styles.signOutText, { color: colors.textMuted }]}>
            Sign Out
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 24,
    borderWidth: 1,
    padding: 28,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  iconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.3,
    marginBottom: 12,
    textAlign: "center",
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 24,
  },
  reactivateButton: {
    width: "100%",
    height: 50,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  buttonInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  signOutText: {
    fontSize: 13,
    fontWeight: "600",
  },
});

