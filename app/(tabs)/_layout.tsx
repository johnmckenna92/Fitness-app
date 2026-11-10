import { Ionicons } from "@expo/vector-icons";
import { Tabs, router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { showAppAlert } from "../../components/CustomAlert";
import { useAuth } from "../../ctx/AuthContext";
import { useTheme } from "../../ctx/ThemeContext";
import { getProfileDirtyState, resetProfileDirtyState } from "../../utils/profileDirtyState";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { role, signOut } = useAuth();

  // Mobile Dashboard Access Gate: strictly client-only (trainers use the web)
  if (role === "trainer") {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: "center", alignItems: "center", padding: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.text, textAlign: "center", marginBottom: 12 }}>
          Trainer Web Portal Access
        </Text>
        <Text style={{ fontSize: 14, color: colors.textSecondary ?? "#94a3b8", textAlign: "center", lineHeight: 20, marginBottom: 24 }}>
          Trainers must access the KineticLab Web Admin Dashboard to manage clients and configure home layouts. The mobile dashboard is reserved for client accounts.
        </Text>
        <TouchableOpacity
          onPress={() => signOut()}
          style={{ backgroundColor: colors.primary, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 }}
        >
          <Text style={{ color: "#000", fontWeight: "bold" }}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    );
  }


  return (
    <Tabs
      screenListeners={{
        tabPress: (e) => {
          const targetKey = e.target ?? "";
          if (getProfileDirtyState() && !targetKey.startsWith("profile")) {
            e.preventDefault();
            showAppAlert(
              "Discard unsaved changes?",
              "You have unsaved changes on your profile. Are you sure you want to discard them?",
              [
                { text: "Keep Editing", style: "cancel" },
                {
                  text: "Discard & Leave",
                  style: "destructive",
                  onPress: () => {
                    resetProfileDirtyState();
                    const routeName = targetKey.split("-")[0];
                    if (routeName === "index") {
                      router.push("/(tabs)");
                    } else if (routeName) {
                      router.push(`/(tabs)/${routeName}` as any);
                    }
                  },
                },
              ]
            );
          }
        },
      }}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background },
        tabBarStyle: {
          backgroundColor: colors?.tabBar ?? "#0a0a0a",
          borderTopColor: colors?.tabBarBorder ?? "#262626",
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors?.primary ?? "#4ade80",
        tabBarInactiveTintColor: colors?.textMuted ?? "#64748b",
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
        name="log-food"
        options={{
          title: "Log Food",
          tabBarStyle: { display: "none" },
          tabBarLabel: () => null,
          tabBarIcon: () => (
            <View
              style={{
                position: "absolute",
                top: -22,
                backgroundColor: colors?.primary ?? "#4ade80",
                width: 54,
                height: 54,
                borderRadius: 27,
                justifyContent: "center",
                alignItems: "center",
                shadowColor: colors?.primary ?? "#4ade80",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 8,
                elevation: 6,
                borderWidth: 3,
                borderColor: colors?.tabBar ?? "#0a0a0a",
              }}
            >
              <Ionicons name="add" size={30} color="#0a0a0a" />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="shopping-list"
        options={{
          title: "Shopping List",
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
              name={focused ? "person" : "person-outline"}
              size={22}
              color={color as string}
            />
          ),
        }}
      />
    </Tabs>
  );
}
