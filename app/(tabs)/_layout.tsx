import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#020617",
          borderTopColor: "#1e293b",
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 8,
        },
        tabBarActiveTintColor: "#818cf8",
        tabBarInactiveTintColor: "#64748b",
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "700",
          letterSpacing: 0.3,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={22}
              color={color as string}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="recipes"
        options={{
          title: "Recipes",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "restaurant" : "restaurant-outline"}
              size={22}
              color={color as string}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="supply-chain"
        options={{
          title: "Supply Chain",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "cart" : "cart-outline"}
              size={22}
              color={color as string}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person-circle" : "person-circle-outline"}
              size={22}
              color={color as string}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="ExecutionHub.styles"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="SupplyChain.styles"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}



