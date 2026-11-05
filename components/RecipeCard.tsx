import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Recipe } from "../types/database";

interface RecipeCardProps {
  recipe: Recipe;
  onAddToProtocol: (recipe: Recipe) => void;
}

export function RecipeCard({ recipe, onAddToProtocol }: RecipeCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {recipe.title}
        </Text>
        <View style={styles.macroRow}>
          <View style={styles.macroPill}>
            <Text style={styles.macroValue}>{recipe.calories}</Text>
            <Text style={styles.macroLabel}>CALS</Text>
          </View>
          <View style={[styles.macroPill, styles.proteinPill]}>
            <Text style={[styles.macroValue, styles.proteinValue]}>{recipe.protein}g</Text>
            <Text style={[styles.macroLabel, styles.proteinLabel]}>PROTEIN</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.addButton}
        activeOpacity={0.8}
        onPress={() => onAddToProtocol(recipe)}
      >
        <Ionicons name="add" size={16} color="#020617" />
        <Text style={styles.addButtonText}>ADD TO PROTOCOL</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 6,
    backgroundColor: "#0f172a",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
    padding: 12,
    justifyContent: "space-between",
    minHeight: 150,
  },
  content: {
    marginBottom: 10,
  },
  title: {
    fontSize: 13,
    fontWeight: "700",
    color: "#f8fafc",
    lineHeight: 18,
    marginBottom: 10,
    minHeight: 36,
  },
  macroRow: {
    flexDirection: "row",
    gap: 6,
  },
  macroPill: {
    flex: 1,
    backgroundColor: "#020617",
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 6,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  macroValue: {
    fontSize: 12,
    fontWeight: "800",
    color: "#f8fafc",
  },
  macroLabel: {
    fontSize: 8,
    fontWeight: "700",
    color: "#64748b",
    letterSpacing: 0.5,
  },
  proteinPill: {
    borderColor: "rgba(129, 140, 248, 0.3)",
    backgroundColor: "rgba(129, 140, 248, 0.08)",
  },
  proteinValue: {
    color: "#818cf8",
  },
  proteinLabel: {
    color: "#818cf8",
  },
  addButton: {
    backgroundColor: "#818cf8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 7,
    borderRadius: 6,
    gap: 4,
  },
  addButtonText: {
    color: "#020617",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});
