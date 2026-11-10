import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { RecipeSwipeDeck } from "../../components/RecipeSwipeDeck";
import { fetchSwipeDeck, recordRecipeSwipe } from "../../services/recipeService";
import { UnifiedRecipe } from "../../types/database";
import { useTheme } from "../../ctx/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../ctx/AuthContext";

const TARGET_SWIPES = 10;

export default function TasteProfileScreen() {
  const router = useRouter();
  const { session, refreshProfile } = useAuth();
  const [recipes, setRecipes] = useState<UnifiedRecipe[]>([]);
  const [swipedCount, setSwipedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isFinishing, setIsFinishing] = useState(false);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    let isMounted = true;
    async function loadDiverseDeck() {
      try {
        setIsLoading(true);
        const deck = await fetchSwipeDeck(TARGET_SWIPES);
        if (isMounted) {
          setRecipes(deck.slice(0, TARGET_SWIPES));
        }
      } catch (err) {
        console.error("[taste-profile] Failed to load calibration deck:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadDiverseDeck();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSwipe = async (recipe: UnifiedRecipe, action: "like" | "dislike") => {
    await recordRecipeSwipe(recipe, action);
    const nextCount = swipedCount + 1;
    setSwipedCount(nextCount);
    if (nextCount >= TARGET_SWIPES || nextCount >= recipes.length) {
      completeTasteCalibration();
    }
  };

  const completeTasteCalibration = () => {
    setIsFinishing(true);
    if (session?.user?.id) { void (async () => { await refreshProfile(); })(); }
    setTimeout(() => {
      router.replace("/(tabs)");
    }, 700);
  };

  if (isLoading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#4ade80" />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Curating your calibration deck...</Text>
      </View>
    );
  }

  if (isFinishing) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <View style={styles.checkmarkCircle}>
          <Ionicons name="checkmark-sharp" size={40} color="#10b981" />
        </View>
        <Text style={[styles.finishingTitle, { color: colors.text }]}>Taste Profile Calibrated</Text>
        <Text style={[styles.finishingSub, { color: colors.textSecondary }]}>Synthesizing macro engine and catalog preferences...</Text>
      </View>
    );
  }

  const remaining = Math.max(0, TARGET_SWIPES - swipedCount);
  const progressRatio = Math.min(1, swipedCount / TARGET_SWIPES);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingBottom: insets.bottom + 16 }]}>
      <View style={styles.header}>
        <Text style={styles.badge}>TASTE CALIBRATION</Text>
        <Text style={[styles.title, { color: colors.text }]}>Train Your Engine</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Swipe right if this fits your palate, left to discard. {remaining} swipe
          {remaining === 1 ? "" : "s"} remaining.
        </Text>

        <View style={styles.counterRow}>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progressRatio * 100}%` }]} />
          </View>
          <Text style={styles.counterText}>
            {swipedCount}/{TARGET_SWIPES}
          </Text>
        </View>
      </View>

      <View style={styles.deckContainer}>
        {recipes.length > 0 && swipedCount < recipes.length ? (
          <RecipeSwipeDeck
            recipes={recipes}
            onSwipeRight={(r) => handleSwipe(r, "like")}
            onSwipeLeft={(r) => handleSwipe(r, "dislike")}
            onDeckEmpty={completeTasteCalibration}
          />
        ) : (
          <View style={styles.fallbackEmpty}>
            <Text style={[styles.fallbackText, { color: colors.text }]}>All meals calibrated!</Text>
            <TouchableOpacity style={styles.continueBtn} onPress={() => router.replace("/(tabs)")}>
              <Text style={styles.continueBtnText}>Continue to Dashboard</Text>
              <Ionicons name="arrow-forward" size={16} color="#020617" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },
  centerContainer: {
    flex: 1,
    backgroundColor: "#020617",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  loadingText: {
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 16,
  },
  checkmarkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    borderWidth: 2,
    borderColor: "#10b981",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  finishingTitle: {
    color: "#f8fafc",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
  },
  finishingSub: {
    color: "#94a3b8",
    fontSize: 13,
    textAlign: "center",
    maxWidth: 280,
    lineHeight: 18,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
  badge: {
    fontSize: 10,
    fontWeight: "800",
    color: "#4ade80",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    color: "#f8fafc",
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: "#94a3b8",
    marginTop: 4,
    lineHeight: 18,
  },
  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 12,
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: "#262626",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#4ade80",
    borderRadius: 3,
  },
  counterText: {
    color: "#4ade80",
    fontSize: 12,
    fontWeight: "800",
    minWidth: 36,
    textAlign: "right",
  },
  deckContainer: {
    flex: 1,
    position: "relative",
  },
  fallbackEmpty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  fallbackText: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 16,
  },
  continueBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4ade80",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  continueBtnText: {
    color: "#0a0a0a",
    fontSize: 14,
    fontWeight: "800",
  },
});




