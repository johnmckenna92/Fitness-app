import React, { useEffect, useState } from "react";
import { Animated, Dimensions, ScrollView, StyleSheet, View } from "react-native";
import { useTheme } from "../ctx/ThemeContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const TOTAL_PADDING = 32;
const ITEM_WIDTH = SCREEN_WIDTH - TOTAL_PADDING;

export function RecipeCardSkeleton() {
  const { colors } = useTheme();
  const [opacity] = useState(() => new Animated.Value(0.3));

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.imagePlaceholder,
          { backgroundColor: colors.surfaceSubtle, opacity },
        ]}
      />
      <View style={styles.cardContent}>
        <Animated.View
          style={[
            styles.titleLine,
            { backgroundColor: colors.surfaceSubtle, opacity },
          ]}
        />
        <Animated.View
          style={[
            styles.titleLineShort,
            { backgroundColor: colors.surfaceSubtle, opacity },
          ]}
        />
        <View style={styles.bottomRow}>
          <View style={styles.macroRow}>
            <Animated.View
              style={[
                styles.pill,
                {
                  backgroundColor: colors.surfaceSubtle,
                  borderColor: colors.borderSubtle,
                  opacity,
                },
              ]}
            />
            <Animated.View
              style={[
                styles.pill,
                {
                  backgroundColor: colors.surfaceSubtle,
                  borderColor: colors.borderSubtle,
                  opacity,
                },
              ]}
            />
          </View>
          <Animated.View
            style={[
              styles.button,
              { backgroundColor: colors.surfaceSubtle, opacity },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

export function RecipeCatalogSkeleton({ count = 4 }: { count?: number }) {
  return (
    <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
      {Array.from({ length: count }).map((_, i) => (
        <RecipeCardSkeleton key={i} />
      ))}
    </ScrollView>
  );
}

export function RecipeSwipeSkeleton() {
  const [opacity] = useState(() => new Animated.Value(0.3));

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <View style={styles.swipeContainer}>
      <View style={styles.swipeCard}>
        <Animated.View style={[styles.swipeHero, { opacity }]} />
        <View style={styles.swipeBody}>
          <Animated.View style={[styles.swipeTitle, { opacity }]} />
          <Animated.View style={[styles.swipeTitleShort, { opacity }]} />
          <View style={styles.swipeMacros}>
            <Animated.View style={[styles.swipeMacroBox, { opacity }]} />
            <Animated.View style={[styles.swipeMacroBox, { opacity }]} />
            <Animated.View style={[styles.swipeMacroBox, { opacity }]} />
            <Animated.View style={[styles.swipeMacroBox, { opacity }]} />
          </View>
          <Animated.View style={[styles.swipeIngBox, { opacity }]} />
        </View>
        <View style={styles.swipeActions}>
          <Animated.View style={[styles.swipeActionBtn, { opacity }]} />
          <Animated.View style={[styles.swipeActionBtn, { opacity }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  card: {
    width: ITEM_WIDTH,
    backgroundColor: "#0f172a",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#1e293b",
    marginBottom: 16,
    overflow: "hidden",
  },
  imagePlaceholder: {
    width: "100%",
    height: 190,
    backgroundColor: "#1e293b",
  },
  cardContent: {
    padding: 14,
  },
  titleLine: {
    height: 16,
    backgroundColor: "#1e293b",
    borderRadius: 4,
    width: "80%",
    marginBottom: 8,
  },
  titleLineShort: {
    height: 16,
    backgroundColor: "#1e293b",
    borderRadius: 4,
    width: "50%",
    marginBottom: 14,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  macroRow: {
    flexDirection: "row",
    gap: 8,
    flex: 1,
  },
  pill: {
    flex: 1,
    height: 38,
    backgroundColor: "#020617",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  button: {
    width: 110,
    height: 38,
    backgroundColor: "#1e293b",
    borderRadius: 10,
  },
  swipeContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    paddingTop: 24,
  },
  swipeCard: {
    width: "100%",
    maxWidth: 380,
    height: "92%",
    backgroundColor: "#0f172a",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#1e293b",
    overflow: "hidden",
    justifyContent: "space-between",
  },
  swipeHero: {
    height: 160,
    backgroundColor: "#020617",
  },
  swipeBody: {
    padding: 16,
    gap: 12,
  },
  swipeTitle: {
    height: 22,
    backgroundColor: "#1e293b",
    borderRadius: 6,
    width: "80%",
  },
  swipeTitleShort: {
    height: 22,
    backgroundColor: "#1e293b",
    borderRadius: 6,
    width: "50%",
  },
  swipeMacros: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  swipeMacroBox: {
    flex: 1,
    height: 48,
    backgroundColor: "#020617",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  swipeIngBox: {
    height: 50,
    backgroundColor: "#020617",
    borderRadius: 10,
    marginTop: 8,
  },
  swipeActions: {
    flexDirection: "row",
    justifyContent: "center",
    padding: 16,
    gap: 24,
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
  },
  swipeActionBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#1e293b",
  },
});
