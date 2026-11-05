import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useRef } from "react";
import {
  Animated,
  Dimensions,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Recipe } from "../types/recipe";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

export interface RecipeSwipeCardProps {
  recipe: Recipe;
  isTopCard: boolean;
  onSwipeRight: (recipe: Recipe) => void;
  onSwipeLeft: (recipe: Recipe) => void;
  onAddToProtocol?: (recipe: Recipe) => void;
}

export function RecipeSwipeCard({
  recipe,
  isTopCard,
  onSwipeRight,
  onSwipeLeft,
  onAddToProtocol,
}: RecipeSwipeCardProps) {
  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
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
    })
  ).current;

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
  const heroImage = (recipe.images && recipe.images.length > 0) ? recipe.images[0] : recipe.image_url;

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
      <View style={styles.card}>
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
          <View style={styles.heroVisual}>
            {heroImage ? (
              <Image
                source={{ uri: heroImage }}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={150}
              />
            ) : (
              <View style={styles.iconCircle}>
                <Ionicons name="flame-outline" size={36} color="#818cf8" />
              </View>
            )}
            <View style={styles.heroOverlay}>
              <View style={styles.macroPillHeader}>
                <Ionicons name="time-outline" size={14} color="#94a3b8" />
                <Text style={styles.cookTimeText}>
                  {recipe.cook_time ? `${recipe.cook_time}` : "Fast"}
                </Text>
              </View>
              <View style={styles.macroPillHeader}>
                <Ionicons name="nutrition-outline" size={14} color="#818cf8" />
                <Text style={[styles.cookTimeText, { color: "#818cf8", fontWeight: "700" }]}>
                  {rawIngredients.length} Ings
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.body}>
            <Text style={styles.title} numberOfLines={2}>
              {recipe.title}
            </Text>

            <View style={styles.macrosRow}>
              <View style={styles.macroBox}>
                <Text style={styles.macroVal}>{Math.round(recipe.calories || 0)}</Text>
                <Text style={styles.macroLbl}>CALS</Text>
              </View>
              <View style={[styles.macroBox, styles.proteinBox]}>
                <Text style={[styles.macroVal, styles.proteinVal]}>{Math.round(recipe.protein || 0)}g</Text>
                <Text style={[styles.macroLbl, styles.proteinLbl]}>PROTEIN</Text>
              </View>
              <View style={styles.macroBox}>
                <Text style={styles.macroVal}>{Math.round(recipe.carbs || 0)}g</Text>
                <Text style={styles.macroLbl}>CARBS</Text>
              </View>
              <View style={styles.macroBox}>
                <Text style={styles.macroVal}>{Math.round(recipe.fats || 0)}g</Text>
                <Text style={styles.macroLbl}>FATS</Text>
              </View>
            </View>

            {rawTags.length > 0 && (
              <View style={styles.tagsContainer}>
                {rawTags.map((t, idx) => (
                  <View key={idx} style={styles.tag}>
                    <Text style={styles.tagText}>#{t}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.ingredientsBox}>
              <Text style={styles.ingredientsTitle}>KEY INGREDIENTS</Text>
              <Text style={styles.ingredientsList} numberOfLines={2}>
                {rawIngredients.join(" • ") || "Whole-food ingredients"}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.passBtn]}
            onPress={handleManualDislike}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={26} color="#ef4444" />
          </TouchableOpacity>

          {onAddToProtocol && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.protocolBtn]}
              onPress={() => onAddToProtocol(recipe)}
              activeOpacity={0.8}
            >
              <Ionicons name="cart-outline" size={20} color="#818cf8" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.actionBtn, styles.likeBtn]}
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
    backgroundColor: "#0f172a",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#1e293b",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
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
    backgroundColor: "#020617",
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(129, 140, 248, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(129, 140, 248, 0.3)",
    justifyContent: "center",
    alignItems: "center",
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
    color: "#f8fafc",
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
    backgroundColor: "#020617",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1e293b",
    paddingVertical: 8,
    alignItems: "center",
  },
  proteinBox: {
    borderColor: "rgba(129, 140, 248, 0.4)",
    backgroundColor: "rgba(129, 140, 248, 0.08)",
  },
  macroVal: {
    fontSize: 15,
    fontWeight: "900",
    color: "#f8fafc",
  },
  proteinVal: {
    color: "#818cf8",
  },
  macroLbl: {
    fontSize: 8,
    fontWeight: "800",
    color: "#64748b",
    marginTop: 2,
    letterSpacing: 0.5,
  },
  proteinLbl: {
    color: "#818cf8",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginVertical: 4,
  },
  tag: {
    backgroundColor: "rgba(129, 140, 248, 0.12)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(129, 140, 248, 0.25)",
  },
  tagText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#818cf8",
  },
  ingredientsBox: {
    backgroundColor: "#020617",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  ingredientsTitle: {
    fontSize: 8,
    fontWeight: "800",
    color: "#64748b",
    letterSpacing: 1,
    marginBottom: 4,
  },
  ingredientsList: {
    fontSize: 11,
    color: "#cbd5e1",
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
    borderTopColor: "#1e293b",
    backgroundColor: "#0f172a",
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
    backgroundColor: "rgba(129, 140, 248, 0.12)",
    borderColor: "rgba(129, 140, 248, 0.3)",
  },
});

