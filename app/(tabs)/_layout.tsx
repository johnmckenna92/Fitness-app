import { Ionicons } from "@expo/vector-icons";
import { Tabs, router } from "expo-router";
import React, { useCallback } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

export default function TabLayout() {
  const renderHeaderRight = useCallback(
    () => (
      <TouchableOpacity
        onPress={() => {
          router.push("/profile");
        }}
        style={styles.headerIcon}
        activeOpacity={0.7}
      >
        <Ionicons name="person-circle-outline" size={28} color="#818cf8" />
      </TouchableOpacity>
    ),
    [],
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: "#0f172a",
          borderBottomWidth: 1,
          borderBottomColor: "#1e293b",
        },
        headerTintColor: "#f8fafc",
        tabBarStyle: {
          backgroundColor: "#0f172a",
          borderTopColor: "#1e293b",
        },
        tabBarActiveTintColor: "#818cf8",
        tabBarInactiveTintColor: "#64748b" as string,
        headerRight: renderHeaderRight,
      }}
    >
      <Tabs.Screen
        name="scanner"
        options={{
          title: "Scanner",
          tabBarIcon: ({ color }) => (
            <Ionicons name="scan" size={24} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="recipes"
        options={{
          title: "Recipes",
          tabBarIcon: ({ color }) => (
            <Ionicons
              name="restaurant-outline"
              size={24}
              color={color as string}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Coach",
          tabBarIcon: ({ color }) => (
            <Ionicons
              name="chatbubbles-outline"
              size={24}
              color={color as string}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerIcon: {
    marginRight: 16,
  },
});

