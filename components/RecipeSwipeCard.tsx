import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Animated,
  Dimensions,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { UnifiedRecipe } from "../types/recipe";
import { useTheme } from "../ctx/ThemeContext";

function resolveSecureHero(recipe: UnifiedRecipe): string | null {
  const candidate =
    recipe.image_url ||
    (recipe.images && recipe.images.length > 0 ? recipe.images[0] : null) ||
    (recipe as any).recipe_image ||
    (recipe as any).recipe_images?.recipe_image;

  let urlStr: string | null = null;
  if (typeof candidate === "string") {
    urlStr = candidate;
  } else if (candidate && typeof candidate === "object") {
    urlStr = candidate.image_url || candidate.url || candidate.value || null;
  }

  if (!urlStr) return null;
  const trimmed = urlStr.trim();
  if (trimmed.length === 0) return null;
  if (trimmed.startsWith("http://")) return "https://" + trimmed.slice(7);
  if (trimmed.startsWith("//")) return "https:" + trimmed;
  return trimmed;
}

const SCREEN_WIDTH = Dimensions.get("window").width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

export interface RecipeSwipeCardProps {
  recipe: UnifiedRecipe;
  isTopCard: boolean;
  onSwipeRight: (recipe: UnifiedRecipe) => void;
  onSwipeLeft: (recipe: UnifiedRecipe) => void;
  onAddToProtocol?: (recipe: UnifiedRecipe) => void;
}

export function RecipeSwipeCard({
  recipe,
  isTopCard,
  onSwipeRight,
  onSwipeLeft,
  onAddToProtocol,
}: RecipeSwipeCardProps) {
  const { colors } = useTheme();
  const [pan] = useState(() => new Animated.ValueXY());

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => isTopCard,
        onMoveShouldSetPanResponder: (_, gesture) => {
          return isTopCard && (Math.abs(gesture.dx) > 5 || Math.abs(gesture.dy) > 5);
        },
        onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
          useNativeDriver: false,
        }),
        onPanResponderRelease: (_, gesture) => {
          if (!isTopCard) return;

          if (gesture.dx > SWIPE_THRESHOLD || gesture.vx > 0.8) {
            Animated.timing(pan, {
              toValue: { x: SCREEN_WIDTH + 100, y: gesture.dy },
              duration: 250,
              useNativeDriver: false,
            }).start(() => {
              onSwipeRight(recipe);
              pan.setValue({ x: 0, y: 0 });
            });
          } else if (gesture.dx < -SWIPE_THRESHOLD || gesture.vx < -0.8) {
            Animated.timing(pan, {
              toValue: { x: -SCREEN_WIDTH - 100, y: gesture.dy },
              duration: 250,
              useNativeDriver: false,
            }).start(() => {
              onSwipeLeft(recipe);
              pan.setValue({ x: 0, y: 0 });
            });
          } else {
            Animated.spring(pan, {
              toValue: { x: 0, y: 0 },
              friction: 5,
              tension: 40,
              useNativeDriver: false,
            }).start();
          }
        },
      }),
    [isTopCard, onSwipeLeft, onSwipeRight, pan, recipe]
  );

  const rotate = pan.x.interpolate({
    inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
    outputRange: ["-25deg", "0deg", "25deg"],
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

  const rawTags: string[] = (recipe.tags || []).slice(0, 4);
  const rawIngredients: string[] = (recipe.ingredients || []).slice(0, 5);
  const heroImage = resolveSecureHero(recipe);
  const [failedUri, setFailedUri] = useState<string | null>(null);
  const hasImageError = Boolean(heroImage && failedUri === heroImage);
  const title = recipe.title || recipe.name || "Untitled Meal";
  const cookTime = recipe.cook_time ? `${recipe.cook_time}` : recipe.prep_time ? `${recipe.prep_time}m` : "Fast";

  const animatedStyle = isTopCard
    ? { transform: [{ translateX: pan.x }, { translateY: pan.y }, { rotate }] }
    : {};

  const handleManualLike = () => {
    Animated.timing(pan, {
      toValue: { x: SCREEN_WIDTH + 100, y: 0 },
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      onSwipeRight(recipe);
      pan.setValue({ x: 0, y: 0 });
    });
  };

  const handleManualDislike = () => {
    Animated.timing(pan, {
      toValue: { x: -SCREEN_WIDTH - 100, y: 0 },
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      onSwipeLeft(recipe);
      pan.setValue({ x: 0, y: 0 });
    });
  };

  return (
    <Animated.View
      style={[styles.cardContainer, animatedStyle]}
      {...(isTopCard ? panResponder.panHandlers : {})}
    >
      <View
        style={styles.card}
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
      >
        <Animated.View style={[styles.badge, styles.likeBadge, { opacity: likeOpacity }]}>
          <Text style={styles.likeBadgeText}>LIKE</Text>
        </Animated.View>
        <Animated.View style={[styles.badge, styles.dislikeBadge, { opacity: dislikeOpacity }]}>
          <Text style={styles.dislikeBadgeText}>PASS</Text>
        </Animated.View>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push(`/recipe/${recipe.id}` as any)}
          style={{ flex: 1 }}
        >
          <View style={styles.heroVisual} className="bg-zinc-100 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
            {heroImage && !hasImageError ? (
              <Image
                source={{ uri: heroImage }}
                style={styles.heroImage}
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={150}
                onError={() => {
                  if (heroImage) setFailedUri(heroImage);
                }}
              />
            ) : (
              <View style={styles.fallbackVisual} className="bg-zinc-100 dark:bg-zinc-950">
                <Ionicons name="fast-food-outline" size={48} color="#64748b" />
              </View>
            )}
            <View style={styles.heroOverlay}>
              <View style={styles.macroPillHeader} className="bg-black/60 border border-white/20">
                <Ionicons name="time-outline" size={14} color="#94a3b8" />
                <Text style={styles.cookTimeText}>
                  {cookTime}
                </Text>
              </View>
              <View style={styles.macroPillHeader} className="bg-black/60 border border-white/20">
                <Ionicons name="nutrition-outline" size={14} color="#4ade80" />
                <Text style={[styles.cookTimeText, { color: "#4ade80", fontWeight: "700" }]}>
                  {rawIngredients.length} Ings
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.body}>
            <Text
              style={styles.title}
              className="text-zinc-900 dark:text-white"
              numberOfLines={2}
            >
              {title}
            </Text>

            <View style={styles.macrosRow}>
              <View style={styles.macroBox} className="bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                <Text style={styles.macroVal} className="text-zinc-900 dark:text-zinc-100">{Math.round(recipe.calories || 0)}</Text>
                <Text style={styles.macroLbl} className="text-zinc-500 dark:text-zinc-400">CALS</Text>
              </View>
              <View style={[styles.macroBox, styles.proteinBox]} className="border border-emerald-300 dark:border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/30">
                <Text style={[styles.macroVal, styles.proteinVal]} className="text-emerald-700 dark:text-emerald-400">{Math.round(recipe.protein || 0)}g</Text>
                <Text style={[styles.macroLbl, styles.proteinLbl]} className="text-emerald-700 dark:text-emerald-400">PROTEIN</Text>
              </View>
              <View style={styles.macroBox} className="bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                <Text style={styles.macroVal} className="text-zinc-900 dark:text-zinc-100">{Math.round(recipe.carbs || 0)}g</Text>
                <Text style={styles.macroLbl} className="text-zinc-500 dark:text-zinc-400">CARBS</Text>
              </View>
              <View style={styles.macroBox} className="bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                <Text style={styles.macroVal} className="text-zinc-900 dark:text-zinc-100">{Math.round(recipe.fats || 0)}g</Text>
                <Text style={styles.macroLbl} className="text-zinc-500 dark:text-zinc-400">FATS</Text>
              </View>
            </View>

            {rawTags.length > 0 && (
              <View style={styles.tagsContainer}>
                {rawTags.map((t, idx) => (
                  <View key={idx} style={styles.tag} className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                    <Text style={styles.tagText} className="text-zinc-600 dark:text-zinc-300">#{t}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.ingredientsBox} className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
              <Text style={styles.ingredientsTitle} className="text-zinc-500 dark:text-zinc-400">KEY INGREDIENTS</Text>
              <Text style={styles.ingredientsList} className="text-zinc-700 dark:text-zinc-300" numberOfLines={2}>
                {rawIngredients.join(" • ") || "Whole-food ingredients"}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.actionsRow} className="bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
          <TouchableOpacity
            style={[styles.actionBtn, styles.passBtn]}
            className="bg-red-50 dark:bg-zinc-950 border border-red-200 dark:border-red-900/50"
            onPress={handleManualDislike}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={26} color="#ef4444" />
          </TouchableOpacity>

          {onAddToProtocol && (
            <TouchableOpacity
              style={styles.addToListBtn}
              className="bg-emerald-50 dark:bg-zinc-950 border border-emerald-200 dark:border-emerald-500/40"
              onPress={() => onAddToProtocol(recipe)}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={16} color={colors.primaryText} />
              <Text style={styles.addToListText} className="text-emerald-700 dark:text-emerald-400">Add to List</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.actionBtn, styles.likeBtn]}
            className="bg-emerald-50 dark:bg-zinc-950 border border-emerald-200 dark:border-emerald-900/50"
            onPress={handleManualLike}
            activeOpacity={0.8}
          >
            <Ionicons name="heart" size={26} color="#10b981" />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}


const styles = StyleSheet.create({
  cardContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    height: "92%",
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    justifyContent: "space-between",
  },

  badge: {
    position: "absolute",
    top: 24,
    zIndex: 99,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 3,
  },
  likeBadge: {
    right: 24,
    borderColor: "#10b981",
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    transform: [{ rotate: "15deg" }],
  },
  likeBadgeText: {
    color: "#10b981",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 2,
  },
  dislikeBadge: {
    left: 24,
    borderColor: "#ef4444",
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    transform: [{ rotate: "-15deg" }],
  },
  dislikeBadgeText: {
    color: "#ef4444",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 2,
  },
  heroVisual: {
    height: 160,
    backgroundColor: "#1A1A1A",
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
    position: "relative",
    overflow: "hidden",
  },
  heroImage: {
    ...StyleSheet.absoluteFill,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fallbackVisual: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#1A1A1A",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  heroOverlay: {
    position: "absolute",
    bottom: 10,
    left: 14,
    right: 14,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  macroPillHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1e293b",
    gap: 4,
  },
  cookTimeText: {
    fontSize: 11,
    color: "#94a3b8",
    fontWeight: "600",
  },
  body: {
    flex: 1,
    padding: 16,
    justifyContent: "space-around",
  },
  title: {
    fontSize: 19,
    fontWeight: "800",
    lineHeight: 24,
    textTransform: "capitalize",
  },
  macrosRow: {
    flexDirection: "row",
    gap: 8,
    marginVertical: 6,
  },
  macroBox: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 8,
    alignItems: "center",
  },
  proteinBox: {},
  macroVal: {
    fontSize: 15,
    fontWeight: "900",
  },
  proteinVal: {},
  macroLbl: {
    fontSize: 8,
    fontWeight: "800",
    marginTop: 2,
    letterSpacing: 0.5,
  },
  proteinLbl: {},
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginVertical: 4,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 10,
    fontWeight: "700",
  },
  ingredientsBox: {
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
  },
  ingredientsTitle: {
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 4,
  },
  ingredientsList: {
    fontSize: 11,
    lineHeight: 16,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    gap: 24,
    borderTopWidth: 1,
  },

  actionBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  passBtn: {
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    borderColor: "rgba(239, 68, 68, 0.35)",
  },
  likeBtn: {
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    borderColor: "rgba(16, 185, 129, 0.35)",
  },
  protocolBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(74, 222, 128, 0.12)",
    borderColor: "rgba(74, 222, 128, 0.3)",
  },
  addToListBtn: {
    height: 48,
    paddingHorizontal: 14,
    borderRadius: 24,
    backgroundColor: "rgba(74, 222, 128, 0.12)",
    borderWidth: 1.5,
    borderColor: "#4ade80",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  addToListText: {
    color: "#4ade80",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});

