import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../../ctx/AuthContext";
import { useTheme } from "../../ctx/ThemeContext";
import { getSecureAvatarUrl } from "../../lib/storage";

export default function MeetCoachWidget() {
  const router = useRouter();
  const { profile } = useAuth();
  const { colors, isDark } = useTheme();
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const rawTrainer = profile?.trainer;
  const trainer = Array.isArray(rawTrainer) ? rawTrainer[0] : rawTrainer;

  useEffect(() => {
    let isMounted = true;
    async function resolveAvatar() {
      if (trainer?.avatar_url) {
        try {
          const secure = await getSecureAvatarUrl(trainer.avatar_url);
          if (isMounted) setAvatarUri(secure || trainer.avatar_url);
        } catch {
          if (isMounted) setAvatarUri(trainer.avatar_url);
        }
      } else {
        if (isMounted) setAvatarUri(null);
      }
    }
    resolveAvatar();
    return () => {
      isMounted = false;
    };
  }, [trainer?.avatar_url]);

  // Only render if a coach is linked
  if (!profile?.trainer_id && !trainer) {
    return null;
  }

  const coachName = trainer?.full_name || "Your Coach";
  const coachBio = trainer?.trainer_bio || "Your dedicated fitness & nutrition expert";

  return (
    <View
      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm"
      style={styles.card}
    >
      <View style={styles.headerRow}>
        <View style={styles.avatarWrapper}>
          {avatarUri ? (
            <Image
              source={{ uri: avatarUri }}
              style={styles.avatar}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View
              className="bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800/50"
              style={styles.avatarFallback}
            >
              <Ionicons
                name="person"
                size={24}
                color={isDark ? "#34d399" : "#15803d"}
              />
            </View>
          )}
          <View
            style={[
              styles.onlineBadge,
              { backgroundColor: colors.success, borderColor: colors.card },
            ]}
          />
        </View>

        <View style={styles.textContainer}>
          <View style={styles.tagRow}>
            <Text className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Assigned Coach
            </Text>
          </View>
          <Text
            className="text-lg font-black text-zinc-900 dark:text-zinc-100"
            numberOfLines={1}
          >
            {coachName}
          </Text>
          <Text
            className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5"
            numberOfLines={1}
          >
            {coachBio}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        className="mt-4 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl py-3 px-4 flex-row justify-center items-center active:opacity-75"
        onPress={() => router.push("/chat")}
        activeOpacity={0.8}
      >
        <Ionicons
          name="chatbubble-ellipses"
          size={16}
          color={isDark ? "#34d399" : "#15803d"}
          style={{ marginRight: 8 }}
        />
        <Text className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
          Message Coach
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarWrapper: {
    position: "relative",
    marginRight: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarFallback: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  onlineBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  textContainer: {
    flex: 1,
  },
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
});
