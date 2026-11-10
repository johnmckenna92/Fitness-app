import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { Bell } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AppState,
  AppStateStatus,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import WidgetRenderer from "../../components/home/WidgetRenderer";
import { useAuth } from "../../ctx/AuthContext";
import { useTheme } from "../../ctx/ThemeContext";
import { useAppStore } from "../../store/useAppStore";

export default function CommandCenterScreen() {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<React.ElementRef<typeof ScrollView>>(null);
  const { profile } = useAuth();
  const { colors } = useTheme();
  const { fetchDynamicConfig, syncHealth, isLoadingConfig } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
      fetchDynamicConfig(profile?.trainer_id);
      if (profile?.id) {
        syncHealth(profile.id);
      }
    }, [profile, fetchDynamicConfig, syncHealth]),
  );

  useEffect(() => {
    fetchDynamicConfig(profile?.trainer_id);
    if (profile?.id) {
      syncHealth(profile.id);
    }

    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        if (nextAppState === "active") {
          fetchDynamicConfig(profile?.trainer_id);
          if (profile?.id) {
            syncHealth(profile.id);
          }
        }
      },
    );

    return () => {
      subscription.remove();
    };
  }, [profile, fetchDynamicConfig, syncHealth]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchDynamicConfig(profile?.trainer_id),
      profile?.id ? syncHealth(profile.id) : Promise.resolve(),
    ]);
    setRefreshing(false);
  };

  const clientName = profile?.full_name
    ? profile.full_name.split(" ")[0]
    : "Athlete";

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, backgroundColor: colors.background },
      ]}
    >
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerSubtitle, { color: colors.primaryText }]}>
            COMMAND CENTER
          </Text>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Welcome, {clientName}
          </Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {}}
            className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 items-center justify-center mr-2"
          >
            <Bell size={18} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push("/chat" as any)}
            className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 items-center justify-center mr-2"
          >
            <Ionicons name="chatbubbles-outline" size={20} color="#10b981" />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push("/(tabs)/profile" as any)}
            className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 items-center justify-center"
          >
            <Ionicons name="person-outline" size={18} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Dynamic Widget Registry Engine */}
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || isLoadingConfig}
            onRefresh={onRefresh}
            tintColor="#10b981"
          />
        }
      >
        <WidgetRenderer />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 16,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#10b981",
    letterSpacing: 1.5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#f8fafc",
    marginTop: 2,
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 48,
  },
});
