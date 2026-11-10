import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Profile, useAuth } from "../../ctx/AuthContext";
import { useTheme } from "../../ctx/ThemeContext";
import { getSecureAvatarUrl } from "../../lib/storage";
import { supabase } from "../../lib/supabase";

export default function TrainerBioScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const { profile: authProfile, refreshProfile } = useAuth();
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [trainer, setTrainer] = useState<Profile | null>(null);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const hasRefreshedRef = useRef(false);

  // 1. FIX THE ROUTING & ID RESOLUTION
  // Extract and strictly sanitize trainer ID parameter (handling arrays and stringified undefined/null)
  const rawId = params.id;
  const paramId = Array.isArray(rawId) ? rawId[0] : rawId;
  const validParamId =
    paramId &&
    typeof paramId === "string" &&
    paramId.trim() !== "" &&
    paramId.trim().toLowerCase() !== "undefined" &&
    paramId.trim().toLowerCase() !== "null"
      ? paramId.trim()
      : null;

  // Strict logic to aggressively fall back to the authenticated user's cached profile:
  const resolvedId = validParamId ? validParamId : authProfile?.trainer_id;

  // 3. REFRESH LOCAL STATE
  // If the user's useAuth() profile hasn't synced their trainer_id properly, ensure the component has a way to safely read the most up-to-date state
  useEffect(() => {
    if (!validParamId && !authProfile?.trainer_id && !hasRefreshedRef.current) {
      hasRefreshedRef.current = true;
      (async () => {
        try {
          if (refreshProfile) {
            await refreshProfile();
          }
        } catch (err) {
          console.warn("Failed refreshing profile trainer_id:", err);
        }
      })();
    }
  }, [validParamId, authProfile?.trainer_id, refreshProfile]);

  // 2. REWRITE THE SUPABASE QUERY
  useEffect(() => {
    let isMounted = true;

    async function loadTrainerProfile() {
      // If resolvedId is ultimately null/undefined, gracefully render "No trainer assigned", bypassing query
      if (!resolvedId) {
        if (isMounted) {
          setTrainer(null);
          setLoading(false);
        }
        return;
      }

      if (isMounted) setLoading(true);

      try {
        let { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", resolvedId)
          .maybeSingle();

        // Stale token recovery: If no data returned (RLS filtered out stale resolvedId),
        // fetch the fresh trainer_id from profiles directly for the authenticated user
        if (!error && !data) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user?.id) {
            const { data: freshUser } = await supabase
              .from("profiles")
              .select("trainer_id")
              .eq("id", session.user.id)
              .maybeSingle();

            if (freshUser?.trainer_id && freshUser.trainer_id !== resolvedId) {
              const retry = await supabase
                .from("profiles")
                .select("*")
                .eq("id", freshUser.trainer_id)
                .maybeSingle();

              data = retry.data;
              error = retry.error;

              if (refreshProfile) {
                refreshProfile().catch(() => {});
              }
            }
          }
        }

        if (error) {
          console.error("Error loading trainer profile from Supabase:", error);
          if (isMounted) setTrainer(null);
        } else if (data) {
          if (isMounted) {
            setTrainer(data as Profile);
          }
          if (data.avatar_url) {
            const secureUrl = await getSecureAvatarUrl(data.avatar_url);
            if (isMounted) {
              setAvatarUri(secureUrl || data.avatar_url);
            }
          }
        } else {
          if (isMounted) setTrainer(null);
        }
      } catch (e) {
        console.error("Error loading trainer profile:", e);
        if (isMounted) setTrainer(null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadTrainerProfile();

    return () => {
      isMounted = false;
    };
  }, [resolvedId, refreshProfile]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <View style={[styles.header, { borderBottomColor: colors.borderSubtle }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: colors.surfaceSubtle }]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>
          Coach Profile
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : !resolvedId ? (
        <View style={styles.center}>
          <Ionicons
            name="person-outline"
            size={44}
            color={colors.textMuted}
            style={{ marginBottom: 12 }}
          />
          <Text style={{ color: colors.textMuted, fontSize: 16 }}>
            No trainer assigned.
          </Text>
        </View>
      ) : !trainer ? (
        <View style={styles.center}>
          <Ionicons
            name="alert-circle-outline"
            size={44}
            color={colors.textMuted}
            style={{ marginBottom: 12 }}
          />
          <Text style={{ color: colors.textMuted, fontSize: 16 }}>
            Coach not found.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View
            style={[
              styles.heroCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri }}
                style={styles.avatar}
                contentFit="cover"
              />
            ) : (
              <View
                style={[
                  styles.avatar,
                  styles.avatarFallback,
                  { backgroundColor: colors.surfaceSubtle },
                ]}
              >
                <Text
                  style={[styles.fallbackText, { color: colors.primaryText }]}
                >
                  {(trainer.full_name || "T").charAt(0).toUpperCase()}
                </Text>
              </View>
            )}

            <View
              style={[
                styles.badge,
                {
                  backgroundColor: isDark
                    ? "rgba(16, 185, 129, 0.15)"
                    : "rgba(16, 185, 129, 0.1)",
                },
              ]}
            >
              <Ionicons
                name="shield-checkmark"
                size={14}
                color={colors.success}
                style={{ marginRight: 4 }}
              />
              <Text
                style={{
                  color: colors.success,
                  fontSize: 11,
                  fontWeight: "800",
                }}
              >
                ASSIGNED COACH
              </Text>
            </View>

            <Text style={[styles.trainerName, { color: colors.text }]}>
              {trainer.full_name || "Coach"}
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 14 }}>
              Personal Trainer & Nutritionist
            </Text>
          </View>

          <View
            style={[
              styles.card,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
            ]}
          >
            <View style={styles.cardHeader}>
              <Ionicons
                name="person-outline"
                size={18}
                color={colors.primary}
                style={{ marginRight: 8 }}
              />
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                About Your Coach
              </Text>
            </View>
            <Text style={[styles.bioText, { color: colors.textSecondary }]}>
              {trainer.trainer_bio?.trim()
                ? trainer.trainer_bio
                : "Passionate about precision nutrition and strength development. Dedicated to helping clients achieve their goals through structured protocols."}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.chatBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/chat")}
            activeOpacity={0.8}
          >
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={18}
              color="#ffffff"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.chatBtnText}>Message AI Assistant</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 18, fontWeight: "700" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { padding: 20 },
  heroCard: {
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    marginBottom: 16,
  },
  avatar: { width: 96, height: 96, borderRadius: 48, marginBottom: 14 },
  avatarFallback: { alignItems: "center", justifyContent: "center" },
  fallbackText: { fontSize: 36, fontWeight: "800" },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },
  trainerName: { fontSize: 22, fontWeight: "800", marginBottom: 4 },
  card: { borderRadius: 18, borderWidth: 1, padding: 20, marginBottom: 16 },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: "700" },
  bioText: { fontSize: 15, lineHeight: 22 },
  chatBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 4,
    marginBottom: 32,
  },
  chatBtnText: { color: "#ffffff", fontSize: 15, fontWeight: "700" },
});
