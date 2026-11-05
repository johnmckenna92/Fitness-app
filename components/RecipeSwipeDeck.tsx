import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useEffect, useMemo, useState } from "react";
import {
  Animated,
  Dimensions,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../lib/supabase";
import { Recipe } from "../types/recipe";
import { formatDuration, getMacrosPerServing } from "../utils/formatters";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.28;

export interface RecipeSwipeDeckProps {
  recipes: Recipe[];
  onSwipeRight: (recipe: Recipe) => void;
  onSwipeLeft: (recipe: Recipe) => void;
  onAddToProtocol?: (recipe: Recipe) => void;
  onDeckEmpty?: () => void;
}

export function RecipeSwipeDeck({
  recipes,
  onSwipeRight,
  onSwipeLeft,
  onAddToProtocol,
  onDeckEmpty,
}: RecipeSwipeDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Silently cache the next 3 images into RAM using Image.prefetch
  useEffect(() => {
    if (!recipes || recipes.length === 0) return;

    const nextBatch = recipes
      .slice(currentIndex + 1, currentIndex + 4)
      .map((r) => (r.images && r.images.length > 0 ? r.images[0] : r.image_url))
      .filter((url): url is string => Boolean(url && url.trim().length > 0));

    if (nextBatch.length > 0) {
      Image.prefetch(nextBatch, "memory-disk").catch((err) => {
        console.warn("[RecipeSwipeDeck] Prefetch error:", err);
      });
    }

    if (currentIndex >= recipes.length && onDeckEmpty) {
      onDeckEmpty();
    }
  }, [currentIndex, recipes, onDeckEmpty]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [recipes]);

  const pan = useMemo(() => new Animated.ValueXY(), []);

  // Supabase preference recording engine on Swipe Right
  const triggerSwipeRightEngine = async (recipe: Recipe) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      if (userId) {
        await supabase.from("user_preferences").upsert({
          user_id: userId,
          liked_recipe_ids: [recipe.id],
          liked_tags: recipe.tags || [],
          look_alike_dictionary: {
            avgCalories: recipe.calories || 0,
            avgProtein: recipe.protein || 0,
            preferredTags: recipe.tags || [],
            preferredIngredients: recipe.ingredients || [],
          },
          updated_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn("[RecipeSwipeDeck] user_preferences insert:", err);
    }
    onSwipeRight(recipe);
  };

  const triggerSwipeLeftEngine = (recipe: Recipe) => {
    onSwipeLeft(recipe);
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 6 || Math.abs(g.dy) > 6,
        onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
          useNativeDriver: false,
        }),
        onPanResponderRelease: (_, g) => {
          const cur = recipes[currentIndex];
          if (!cur) return;

          if (g.dx > SWIPE_THRESHOLD || g.vx > 0.75) {
            Animated.timing(pan, {
              toValue: { x: SCREEN_WIDTH + 150, y: g.dy },
              duration: 220,
              useNativeDriver: false,
            }).start(() => {
              triggerSwipeRightEngine(cur);
              pan.setValue({ x: 0, y: 0 });
              setCurrentIndex((p) => p + 1);
            });
          } else if (g.dx < -SWIPE_THRESHOLD || g.vx < -0.75) {
            Animated.timing(pan, {
              toValue: { x: -SCREEN_WIDTH - 150, y: g.dy },
              duration: 220,
              useNativeDriver: false,
            }).start(() => {
              triggerSwipeLeftEngine(cur);
              pan.setValue({ x: 0, y: 0 });
              setCurrentIndex((p) => p + 1);
            });
          } else {
            Animated.spring(pan, {
              toValue: { x: 0, y: 0 },
              friction: 6,
              tension: 40,
              useNativeDriver: false,
            }).start();
          }
        },
      }),
    [currentIndex, recipes, onSwipeRight, onSwipeLeft, pan]
  );

  const handleManualAction = (action: "like" | "dislike") => {
    const cur = recipes[currentIndex];
    if (!cur) return;

    const toX = action === "like" ? SCREEN_WIDTH + 150 : -SCREEN_WIDTH - 150;
    Animated.timing(pan, {
      toValue: { x: toX, y: 0 },
      duration: 220,
      useNativeDriver: false,
    }).start(() => {
      if (action === "like") triggerSwipeRightEngine(cur);
      else triggerSwipeLeftEngine(cur);
      pan.setValue({ x: 0, y: 0 });
      setCurrentIndex((p) => p + 1);
    });
  };

  const rotate = pan.x.interpolate({
    inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
    outputRange: ["-22deg", "0deg", "22deg"],
  });

  const likeOpacity = pan.x.interpolate({
    inputRange: [20, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const dislikeOpacity = pan.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD, -20],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  if (!recipes || currentIndex >= recipes.length) return null;
  const visibleCards = recipes.slice(currentIndex, currentIndex + 3);

  return (
    <View style={styles.container}>
      {visibleCards
        .map((recipe, idx) => {
          if (idx === 0) {
            return (
              <Animated.View
                key={String(recipe.id)}
                style={[
                  styles.cardContainer,
                  styles.topCard,
                  { transform: [{ translateX: pan.x }, { translateY: pan.y }, { rotate }] },
                ]}
                {...panResponder.panHandlers}
              >
                <CardContent recipe={recipe} likeOpacity={likeOpacity} dislikeOpacity={dislikeOpacity} />
              </Animated.View>
            );
          }
          const scale = 1 - idx * 0.04;
          const translateY = idx * 10;
          return (
            <View
              key={String(recipe.id)}
              style={[styles.cardContainer, styles.bgCard, { transform: [{ scale }, { translateY }], zIndex: -idx }]}
            >
              <CardContent recipe={recipe} isBackground />
            </View>
          );
        })
        .reverse()}

      <View style={styles.controlsRow}>
        <TouchableOpacity style={[styles.actionBtn, styles.dislikeBtn]} onPress={() => handleManualAction("dislike")}>
          <Ionicons name="close" size={26} color="#f43f5e" />
        </TouchableOpacity>
        {onAddToProtocol && (
          <TouchableOpacity style={[styles.actionBtn, styles.protocolBtn]} onPress={() => onAddToProtocol(recipes[currentIndex])}>
            <Ionicons name="bookmark-outline" size={22} color="#818cf8" />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.actionBtn, styles.likeBtn]} onPress={() => handleManualAction("like")}>
          <Ionicons name="heart" size={26} color="#10b981" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function CardContent({
  recipe,
  likeOpacity,
  dislikeOpacity,
  isBackground = false,
}: {
  recipe: Recipe;
  likeOpacity?: Animated.AnimatedInterpolation<number>;
  dislikeOpacity?: Animated.AnimatedInterpolation<number>;
  isBackground?: boolean;
}) {
  const coverImage = (recipe.images && recipe.images.length > 0) ? recipe.images[0] : recipe.image_url;
  const rawTags = (recipe.tags || []).slice(0, 3);
  const timeFormatted = formatDuration(recipe.cook_time);
  const { calories, protein, carbs, fats } = getMacrosPerServing(recipe);

  return (
    <View style={styles.cardInner}>
      {likeOpacity && (
        <Animated.View style={[styles.badge, styles.likeBadge, { opacity: likeOpacity }]}>
          <Text style={styles.likeBadgeText}>LIKE</Text>
        </Animated.View>
      )}

      {dislikeOpacity && (
        <Animated.View style={[styles.badge, styles.dislikeBadge, { opacity: dislikeOpacity }]}>
          <Text style={styles.dislikeBadgeText}>PASS</Text>
        </Animated.View>
      )}

      {/* Hardware-Accelerated expo-image bound to recipe.images[0] */}
      <View style={styles.imageWrapper}>
        {coverImage ? (
          <Image
            source={{ uri: coverImage }}
            style={styles.heroImage}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={180}
            priority={isBackground ? "low" : "high"}
          />
        ) : (
          <View style={styles.fallbackImage}>
            <Ionicons name="restaurant-outline" size={54} color="#475569" />
          </View>
        )}

        <View style={styles.imageOverlay}>
          <View style={styles.timeBadge}>
            <Ionicons name="time-outline" size={13} color="#f8fafc" />
            <Text style={styles.timeText}>{timeFormatted}</Text>
          </View>
          <View style={[styles.timeBadge, styles.proteinBadge]}>
            <Ionicons name="flame" size={13} color="#818cf8" />
            <Text style={[styles.timeText, { color: "#818cf8", fontWeight: "800" }]}>
              {protein}g PRO
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.infoBody}>
        <Text style={styles.recipeTitle} numberOfLines={2}>
          {recipe.title}
        </Text>

        <View style={styles.macrosGrid}>
          <View style={styles.macroCol}>
            <Text style={styles.macroNum}>{calories}</Text>
            <Text style={styles.macroName}>KCAL/SERV</Text>
          </View>
          <View style={styles.macroDivider} />
          <View style={styles.macroCol}>
            <Text style={[styles.macroNum, { color: "#818cf8" }]}>{protein}g</Text>
            <Text style={[styles.macroName, { color: "#818cf8" }]}>PROTEIN</Text>
          </View>
          <View style={styles.macroDivider} />
          <View style={styles.macroCol}>
            <Text style={styles.macroNum}>{carbs}g</Text>
            <Text style={styles.macroName}>CARBS</Text>
          </View>
          <View style={styles.macroDivider} />
          <View style={styles.macroCol}>
            <Text style={styles.macroNum}>{fats}g</Text>
            <Text style={styles.macroName}>FATS</Text>
          </View>
        </View>

        {rawTags.length > 0 && (
          <View style={styles.tagsContainer}>
            {rawTags.map((tag, idx) => (
              <View key={idx} style={styles.tagPill}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 20,
  },
  cardContainer: {
    position: "absolute",
    width: SCREEN_WIDTH - 28,
    height: 480,
    borderRadius: 20,
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#1e293b",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 10,
    overflow: "hidden",
  },
  topCard: { zIndex: 10 },
  bgCard: { zIndex: 1 },
  cardInner: { flex: 1, backgroundColor: "#0f172a" },
  imageWrapper: { width: "100%", height: 260, backgroundColor: "#1e293b", position: "relative" },
  heroImage: { width: "100%", height: "100%" },
  fallbackImage: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#020617",
  },
  imageOverlay: { position: "absolute", bottom: 12, left: 12, right: 12, flexDirection: "row", gap: 8 },
  timeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(2, 6, 23, 0.8)",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  proteinBadge: { borderColor: "rgba(129, 140, 248, 0.4)" },
  timeText: { color: "#f8fafc", fontSize: 12, fontWeight: "700" },
  infoBody: { flex: 1, padding: 16, justifyContent: "space-between" },
  recipeTitle: { color: "#f8fafc", fontSize: 18, fontWeight: "800", letterSpacing: -0.3, lineHeight: 23 },
  macrosGrid: {
    flexDirection: "row",
    backgroundColor: "#020617",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "space-around",
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  macroCol: { alignItems: "center", flex: 1 },
  macroDivider: { width: 1, height: 24, backgroundColor: "#1e293b" },
  macroNum: { color: "#f8fafc", fontSize: 14, fontWeight: "800" },
  macroName: { color: "#64748b", fontSize: 9, fontWeight: "700", marginTop: 2, letterSpacing: 0.5 },
  tagsContainer: { flexDirection: "row", gap: 6, flexWrap: "wrap", marginTop: 4 },
  tagPill: { backgroundColor: "#1e293b", paddingVertical: 3, paddingHorizontal: 8, borderRadius: 6 },
  tagText: { color: "#94a3b8", fontSize: 11, fontWeight: "600" },
  badge: {
    position: "absolute",
    top: 24,
    zIndex: 99,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 3,
  },
  likeBadge: {
    left: 24,
    borderColor: "#10b981",
    backgroundColor: "rgba(2, 6, 23, 0.85)",
    transform: [{ rotate: "-15deg" }],
  },
  likeBadgeText: { color: "#10b981", fontSize: 20, fontWeight: "900", letterSpacing: 1.5 },
  dislikeBadge: {
    right: 24,
    borderColor: "#f43f5e",
    backgroundColor: "rgba(2, 6, 23, 0.85)",
    transform: [{ rotate: "15deg" }],
  },
  dislikeBadgeText: { color: "#f43f5e", fontSize: 20, fontWeight: "900", letterSpacing: 1.5 },
  controlsRow: {
    position: "absolute",
    bottom: -15,
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    zIndex: 20,
  },
  actionBtn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#0f172a",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  dislikeBtn: { borderColor: "rgba(244, 63, 94, 0.4)" },
  protocolBtn: { width: 48, height: 48, borderRadius: 24, borderColor: "rgba(129, 140, 248, 0.4)" },
  likeBtn: { borderColor: "rgba(16, 185, 129, 0.4)" },
});

