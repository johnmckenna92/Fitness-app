import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../ctx/ThemeContext";
import { Recipe } from "../types/database";
import { getCombinedTotalTime, getMacrosPerServing } from "../utils/formatters";

interface RecipeCardProps {
  recipe: Recipe;
  onAddToProtocol: (recipe: Recipe) => void;
}

function resolveSecureCover(recipe: Recipe): string | null {
  const candidate =
    (recipe.images && recipe.images.length > 0 ? recipe.images[0] : null) ||
    recipe.image_url ||
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

export function RecipeCard({ recipe, onAddToProtocol }: RecipeCardProps) {
  const { colors } = useTheme();
  const { calories, protein } = getMacrosPerServing(recipe);
  const coverImage = resolveSecureCover(recipe);
  const [failedUri, setFailedUri] = useState<string | null>(null);
  const hasImageError = Boolean(coverImage && failedUri === coverImage);
  const timeFormatted = getCombinedTotalTime(recipe.prep_time, recipe.cook_time, recipe.total_time);

  return (
    <View
      style={styles.card}
      className="w-full rounded-2xl border bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 overflow-hidden mb-4 shadow-sm"
    >
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => router.push(`/recipe/${recipe.id}` as any)}
      >
        <View style={styles.imageContainer} className="bg-zinc-100 dark:bg-zinc-800 w-full h-[190px] relative">
          {coverImage && !hasImageError ? (
            <Image
              source={{ uri: coverImage }}
              style={styles.thumbnail}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={150}
              onError={() => {
                if (coverImage) setFailedUri(coverImage);
              }}
            />
          ) : (
            <View style={styles.fallbackThumb} className="w-full h-full items-center justify-center bg-zinc-100 dark:bg-zinc-800">
              <Ionicons name="fast-food-outline" size={40} color={colors.textMuted} />
            </View>
          )}

          {Boolean(timeFormatted) && (
            <View style={styles.cookTimeTag} className="absolute bottom-2.5 left-2.5 flex-row items-center gap-1 bg-black/75 py-1 px-2 rounded-lg">
              <Ionicons name="time-outline" size={12} color="#ffffff" />
              <Text style={styles.cookTimeTagText} className="text-white text-[11px] font-bold">{timeFormatted}</Text>
            </View>
          )}
        </View>

        <View style={styles.cardContent} className="p-4">
          <Text style={styles.title} className="text-base font-extrabold text-zinc-900 dark:text-white leading-snug mb-3" numberOfLines={2}>
            {recipe.title}
          </Text>

          <View style={styles.bottomRow} className="flex-row items-center justify-between gap-3">
            <View style={styles.macroRow} className="flex-row gap-2 flex-1">
              <View
                style={styles.macroPill}
                className="bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 rounded-lg py-1.5 px-2.5 items-center flex-1"
              >
                <Text style={styles.macroVal} className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100">{calories}</Text>
                <Text style={styles.macroLbl} className="text-[8px] font-bold text-zinc-500 dark:text-zinc-400 mt-0.5 tracking-wider">CAL / SERV</Text>
              </View>
              <View
                style={[styles.macroPill, styles.proteinPill]}
                className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 rounded-lg py-1.5 px-2.5 items-center flex-1"
              >
                <Text style={styles.macroVal} className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400">{protein}g</Text>
                <Text style={styles.macroLbl} className="text-[8px] font-bold text-emerald-700 dark:text-emerald-400 mt-0.5 tracking-wider">PRO</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.actionBtn}
              className="flex-row items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-xl bg-[#4ade80] active:opacity-80"
              activeOpacity={0.8}
              onPress={() => onAddToProtocol(recipe)}
            >
              <Ionicons name="add" size={16} color="#0a0a0a" />
              <Text style={styles.actionBtnText} className="text-[#0a0a0a] text-xs font-extrabold tracking-wide">Add to List</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    width: "100%",
    height: 190,
    position: "relative",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  fallbackThumb: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  cookTimeTag: {
    position: "absolute",
    bottom: 10,
    left: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(2, 6, 23, 0.75)",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  cookTimeTagText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
  },
  cardContent: {
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 22,
    marginBottom: 12,
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
  macroPill: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    flex: 1,
  },
  macroVal: {
    fontSize: 13,
    fontWeight: "800",
  },
  macroLbl: {
    fontSize: 8,
    fontWeight: "700",
    marginTop: 2,
    letterSpacing: 0.3,
  },
  proteinPill: {},
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  actionBtnText: {
    color: "#0a0a0a",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});
