import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

export function RecipeCardSkeleton() {
  const opacity = useRef(new Animated.Value(0.3)).current;

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
    <View style={styles.card}>
      <Animated.View style={[styles.titleLine, { opacity }]} />
      <Animated.View style={[styles.titleLineShort, { opacity }]} />
      <View style={styles.macroRow}>
        <Animated.View style={[styles.pill, { opacity }]} />
        <Animated.View style={[styles.pill, { opacity }]} />
      </View>
      <Animated.View style={[styles.button, { opacity }]} />
    </View>
  );
}

export function RecipeCatalogSkeleton({ count = 8 }: { count?: number }) {
  return (
    <View style={styles.grid}>
      {Array.from({ length: count }).map((_, i) => (
        <RecipeCardSkeleton key={i} />
      ))}
    </View>
  );
}

export function RecipeSwipeSkeleton() {
  const opacity = useRef(new Animated.Value(0.3)).current;

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
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 6,
  },
  card: {
    width: "47%",
    margin: 6,
    backgroundColor: "#0f172a",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
    padding: 12,
    minHeight: 150,
    justifyContent: "space-between",
  },
  titleLine: {
    height: 14,
    backgroundColor: "#1e293b",
    borderRadius: 4,
    width: "90%",
    marginBottom: 6,
  },
  titleLineShort: {
    height: 14,
    backgroundColor: "#1e293b",
    borderRadius: 4,
    width: "60%",
    marginBottom: 12,
  },
  macroRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 12,
  },
  pill: {
    flex: 1,
    height: 28,
    backgroundColor: "#020617",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  button: {
    height: 30,
    backgroundColor: "#1e293b",
    borderRadius: 6,
  },
  swipeContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
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
