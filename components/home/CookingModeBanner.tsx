import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAppStore } from "../../store/useAppStore";
import { useTheme } from "../../ctx/ThemeContext";

export default function CookingModeBanner() {
  const { trainerAddOns } = useAppStore();
  const { isDark } = useTheme();

  // Strict Add-on Gate: Check if trainer's license includes "cooking_mode"
  if (!trainerAddOns.includes("cooking_mode")) {
    return null;
  }

  return (
    <View className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm">
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <Text style={styles.icon}>🍳</Text>
          <Text className="text-xs font-extrabold text-zinc-500 dark:text-zinc-400 tracking-wider uppercase">
            Interactive Cooking Mode
          </Text>
        </View>

        <View className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/50">
          <Text className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase">
            PREMIUM
          </Text>
        </View>
      </View>

      <View style={styles.contentBox}>
        <Text className="text-sm text-zinc-600 dark:text-zinc-400 leading-5">
          Hands-free step audio, ingredient timers, and awake display.
        </Text>
      </View>

      <TouchableOpacity
        className="mt-4 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl py-3 px-4 flex-row justify-center items-center active:opacity-75"
        onPress={() => router.push("/(tabs)/recipes" as any)}
        activeOpacity={0.8}
      >
        <Ionicons
          name="flame"
          size={16}
          color={isDark ? "#34d399" : "#15803d"}
          style={{ marginRight: 8 }}
        />
        <Text className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
          Try it out
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  icon: {
    fontSize: 16,
  },
  contentBox: {
    marginTop: 12,
  },
});

