import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { UnifiedRecipe } from "../types/recipe";
import { formatDuration, getMacrosPerServing } from "../utils/formatters";
import { useTheme } from "../ctx/ThemeContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.28;

export interface RecipeSwipeDeckProps {
  recipes: UnifiedRecipe[];
  onSwipeRight: (recipe: UnifiedRecipe) => void;
  onSwipeLeft: (recipe: UnifiedRecipe) => void;
  onAddToProtocol?: (recipe: UnifiedRecipe) => void;
  onDeckEmpty?: () => void;
}

export function RecipeSwipeDeck({
  recipes,
  onSwipeRight,
  onSwipeLeft,
  onAddToProtocol,
  onDeckEmpty,
}: RecipeSwipeDeckProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const hasFiredEmptyRef = useRef(false);

  useEffect(() => {
    hasFiredEmptyRef.current = false;
  }, [recipes]);

  // Silently cache the next 3 images into RAM using Image.prefetch
  useEffect(() => {
    if (!recipes || recipes.length === 0) return;

    const nextBatch = recipes
      .slice(currentIndex + 1, currentIndex + 4)
      .map((r) => r.image_url || (r.images && r.images.length > 0 ? r.images[0] : null))
      .filter((url): url is string => Boolean(url && url.trim().length > 0));

    if (nextBatch.length > 0) {
      Image.prefetch(nextBatch, "memory-disk").catch((err) => {
        console.warn("[RecipeSwipeDeck] Prefetch error:", err);
      });
    }

    if (recipes.length > 0 && currentIndex >= recipes.length && onDeckEmpty && !hasFiredEmptyRef.current) {
      hasFiredEmptyRef.current = true;
      onDeckEmpty();
    }
  }, [currentIndex, recipes, onDeckEmpty]);

  const [prevRecipes, setPrevRecipes] = useState(recipes);
  if (recipes !== prevRecipes) {
    setPrevRecipes(recipes);
    setCurrentIndex(0);
  }

  const pan = useMemo(() => new Animated.ValueXY(), []);

  // Swipe engine delegates directly to parent handler which runs the unified EMA preference engine
  const triggerSwipeRightEngine = useCallback(
    (recipe: UnifiedRecipe) => {
      onSwipeRight(recipe);
    },
    [onSwipeRight]
  );

  const triggerSwipeLeftEngine = useCallback(
    (recipe: UnifiedRecipe) => {
      onSwipeLeft(recipe);
    },
    [onSwipeLeft]
  );

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
              setCurrentIndex((p) => p + 1);
              requestAnimationFrame(() => {
                pan.setValue({ x: 0, y: 0 });
              });
            });
          } else if (g.dx < -SWIPE_THRESHOLD || g.vx < -0.75) {
            Animated.timing(pan, {
              toValue: { x: -SCREEN_WIDTH - 150, y: g.dy },
              duration: 220,
              useNativeDriver: false,
            }).start(() => {
              triggerSwipeLeftEngine(cur);
              setCurrentIndex((p) => p + 1);
              requestAnimationFrame(() => {
                pan.setValue({ x: 0, y: 0 });
              });
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
    [currentIndex, recipes, triggerSwipeRightEngine, triggerSwipeLeftEngine, pan]
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
      setCurrentIndex((p) => p + 1);
      requestAnimationFrame(() => {
        pan.setValue({ x: 0, y: 0 });
      });
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
    <View style={[styles.deckContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
      <View style={styles.cardArea}>
        {visibleCards
          .map((recipe, idx) => {
            const isTop = idx === 0;
            const scale = 1 - idx * 0.04;
            const translateY = idx * 10;
            return (
              <Animated.View
                key={String(recipe.id)}
                style={[
                  styles.cardContainer,
                  isTop ? styles.topCard : styles.bgCard,
                  {
                    transform: isTop
                      ? [{ translateX: pan.x }, { translateY: pan.y }, { rotate }]
                      : [{ scale }, { translateY }],
                    zIndex: -idx,
                  },
                ]}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                {...(isTop ? panResponder.panHandlers : {})}
              >
                <CardContent
                  recipe={recipe}
                  likeOpacity={isTop ? likeOpacity : undefined}
                  dislikeOpacity={isTop ? dislikeOpacity : undefined}
                  isBackground={!isTop}
                />
              </Animated.View>
            );
          })
          .reverse()}
      </View>

      <View style={styles.controlsRow}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.dislikeBtn]}
          className="bg-red-50 dark:bg-zinc-900 border border-red-200 dark:border-red-900/50"
          onPress={() => handleManualAction("dislike")}
        >
          <Ionicons name="close" size={26} color="#f43f5e" />
        </TouchableOpacity>
        {onAddToProtocol && (
          <TouchableOpacity
            style={styles.addToListBtn}
            className="bg-emerald-50 dark:bg-zinc-900 border border-emerald-300 dark:border-emerald-500/40"
            onPress={() => onAddToProtocol(recipes[currentIndex])}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={16} color={colors.primaryText} />
            <Text style={styles.addToListText} className="text-emerald-700 dark:text-emerald-400 font-bold">Add to List</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.actionBtn, styles.likeBtn]}
          className="bg-emerald-50 dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-900/50"
          onPress={() => handleManualAction("like")}
        >
          <Ionicons name="heart" size={26} color="#10b981" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function resolveSecureDeckCover(recipe: UnifiedRecipe): string | null {
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

function CardContent({
  recipe,
  likeOpacity,
  dislikeOpacity,
  isBackground = false,
}: {
  recipe: UnifiedRecipe;
  likeOpacity?: Animated.AnimatedInterpolation<number>;
  dislikeOpacity?: Animated.AnimatedInterpolation<number>;
  isBackground?: boolean;
}) {
  const coverImage = resolveSecureDeckCover(recipe);
  const [failedUri, setFailedUri] = useState<string | null>(null);
  const hasImageError = Boolean(coverImage && failedUri === coverImage);
  const rawTags = (recipe.tags || []).slice(0, 3);
  const timeFormatted = recipe.cook_time
    ? formatDuration(recipe.cook_time)
    : recipe.prep_time
    ? typeof recipe.prep_time === "number"
      ? `${recipe.prep_time}m`
      : formatDuration(recipe.prep_time)
    : "15m";
  const title = recipe.title || recipe.name || "Untitled Meal";
  const { calories, protein, carbs, fats } = getMacrosPerServing(recipe);

  return (
    <View style={styles.cardInner} className="bg-white dark:bg-zinc-900">
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
        {coverImage && !hasImageError ? (
          <Image
            source={{ uri: coverImage }}
            style={styles.heroImage}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={180}
            priority={isBackground ? "low" : "high"}
            onError={() => {
              if (coverImage) setFailedUri(coverImage);
            }}
          />
        ) : (
          <View style={styles.fallbackImage} className="bg-zinc-100 dark:bg-zinc-950">
            <Ionicons name="fast-food-outline" size={54} color="#64748b" />
          </View>
        )}

        <View style={styles.imageOverlay}>
          <View style={styles.timeBadge}>
            <Ionicons name="time-outline" size={13} color="#f8fafc" />
            <Text style={styles.timeText}>{timeFormatted}</Text>
          </View>
          <View style={[styles.timeBadge, styles.proteinBadge]}>
            <Ionicons name="flame" size={13} color="#4ade80" />
            <Text style={[styles.timeText, { color: "#4ade80", fontWeight: "800" }]}>
              {protein}g PRO
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.infoBody}>
        <Text style={styles.recipeTitle} className="text-zinc-900 dark:text-white" numberOfLines={2}>
          {title}
        </Text>

        <View style={styles.macrosGrid} className="bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
          <View style={styles.macroCol}>
            <Text style={styles.macroNum} className="text-zinc-900 dark:text-zinc-100">{calories}</Text>
            <Text style={styles.macroName} className="text-zinc-500 dark:text-zinc-400">KCAL/SERV</Text>
          </View>
          <View style={styles.macroDivider} className="bg-zinc-300 dark:bg-zinc-800" />
          <View style={styles.macroCol}>
            <Text style={[styles.macroNum, { color: "#4ade80" }]}>{protein}g</Text>
            <Text style={[styles.macroName, { color: "#4ade80" }]}>PROTEIN</Text>
          </View>
          <View style={styles.macroDivider} className="bg-zinc-300 dark:bg-zinc-800" />
          <View style={styles.macroCol}>
            <Text style={styles.macroNum} className="text-zinc-900 dark:text-zinc-100">{carbs}g</Text>
            <Text style={styles.macroName} className="text-zinc-500 dark:text-zinc-400">CARBS</Text>
          </View>
          <View style={styles.macroDivider} className="bg-zinc-300 dark:bg-zinc-800" />
          <View style={styles.macroCol}>
            <Text style={styles.macroNum} className="text-zinc-900 dark:text-zinc-100">{fats}g</Text>
            <Text style={styles.macroName} className="text-zinc-500 dark:text-zinc-400">FATS</Text>
          </View>
        </View>

        {rawTags.length > 0 && (
          <View style={styles.tagsContainer}>
            {rawTags.map((tag, idx) => (
              <View key={idx} style={styles.tagPill} className="bg-emerald-50 dark:bg-zinc-800 border border-emerald-200 dark:border-zinc-700">
                <Text style={styles.tagText} className="text-emerald-700 dark:text-emerald-400">#{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  deckContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardArea: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  cardContainer: {
    position: "absolute",
    width: SCREEN_WIDTH - 28,
    height: "92%",
    maxHeight: 480,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 10,
    overflow: "hidden",
  },
  topCard: { zIndex: 10 },
  bgCard: { zIndex: 1 },
  cardInner: { flex: 1 },
  imageWrapper: { width: "100%", height: 260, backgroundColor: "#1A1A1A", position: "relative" },
  heroImage: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  fallbackImage: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
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
  proteinBadge: { borderColor: "rgba(74, 222, 128, 0.4)" },
  timeText: { color: "#f8fafc", fontSize: 12, fontWeight: "700" },
  infoBody: { flex: 1, padding: 16, justifyContent: "space-between" },
  recipeTitle: { fontSize: 18, fontWeight: "800", letterSpacing: -0.3, lineHeight: 23 },
  macrosGrid: {
    flexDirection: "row",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "space-around",
    borderWidth: 1,
  },
  macroCol: { alignItems: "center", flex: 1 },
  macroDivider: { width: 1, height: 24 },
  macroNum: { fontSize: 14, fontWeight: "800" },
  macroName: { fontSize: 9, fontWeight: "700", marginTop: 2, letterSpacing: 0.5 },
  tagsContainer: { flexDirection: "row", gap: 6, flexWrap: "wrap", marginTop: 4 },
  tagPill: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: 6 },
  tagText: { fontSize: 11, fontWeight: "600" },
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    paddingTop: 8,
    paddingBottom: 8,
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
  protocolBtn: { width: 48, height: 48, borderRadius: 24, borderColor: "rgba(74, 222, 128, 0.4)" },
  addToListBtn: {
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 24,
    backgroundColor: "rgba(74, 222, 128, 0.12)",
    borderWidth: 1.5,
    borderColor: "#4ade80",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  addToListText: {
    color: "#4ade80",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  likeBtn: { borderColor: "rgba(16, 185, 129, 0.4)" },
});

