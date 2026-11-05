import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { memo } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Recipe } from "../types/database";
import { getCombinedTotalTime, getMacrosPerServing } from "../utils/formatters";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const NUM_COLUMNS = 2;
const CARD_GAP = 10;
const TOTAL_PADDING = 32;
const ITEM_WIDTH = (SCREEN_WIDTH - TOTAL_PADDING - CARD_GAP) / NUM_COLUMNS;

export interface RecipeCatalogProps {
  recipes: Recipe[];
  onAddToProtocol: (recipe: Recipe) => void;
  onEndReached?: () => void;
  isFetchingMore?: boolean;
  ListHeaderComponent?: React.JSX.Element | undefined;
  ListEmptyComponent?: React.JSX.Element | undefined;
}

const RecipeGridItem = memo(function RecipeGridItem({
  recipe,
  onAddToProtocol,
}: {
  recipe: Recipe;
  onAddToProtocol: (recipe: Recipe) => void;
}) {
  const coverImage = (recipe.images && recipe.images.length > 0) ? recipe.images[0] : recipe.image_url;
  const timeFormatted = getCombinedTotalTime(recipe.prep_time, recipe.cook_time, recipe.total_time);
  const { calories, protein } = getMacrosPerServing(recipe);

  return (
    <View style={styles.card}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => router.push(`/recipe/${recipe.id}` as any)}
      >
        <View style={styles.imageContainer}>
          {coverImage ? (
            <Image
              source={{ uri: coverImage }}
              style={styles.thumbnail}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={150}
            />
          ) : (
            <View style={styles.fallbackThumb}>
              <Ionicons name="fast-food-outline" size={28} color="#475569" />
            </View>
          )}

          {Boolean(timeFormatted) && (
            <View style={styles.cookTimeTag}>
              <Ionicons name="time-outline" size={10} color="#f8fafc" />
              <Text style={styles.cookTimeTagText}>{timeFormatted}</Text>
            </View>
          )}
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.title} numberOfLines={2}>
            {recipe.title}
          </Text>

          <View style={styles.macroRow}>
            <View style={styles.macroPill}>
              <Text style={styles.macroVal}>{calories}</Text>
              <Text style={styles.macroLbl}>CAL / SERV</Text>
            </View>
            <View style={[styles.macroPill, styles.proteinPill]}>
              <Text style={[styles.macroVal, styles.proteinVal]}>
                {protein}g
              </Text>
              <Text style={[styles.macroLbl, styles.proteinLbl]}>PRO</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      <View style={{ paddingHorizontal: 10, paddingBottom: 10 }}>
        <TouchableOpacity
          style={styles.actionBtn}
          activeOpacity={0.8}
          onPress={() => onAddToProtocol(recipe)}
        >
          <Ionicons name="add" size={14} color="#020617" />
          <Text style={styles.actionBtnText}>Add to List</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

export function RecipeCatalog({
  recipes,
  onAddToProtocol,
  onEndReached,
  isFetchingMore = false,
  ListHeaderComponent,
  ListEmptyComponent,
}: RecipeCatalogProps) {
  return (
    <FlatList
      data={recipes}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => (
        <RecipeGridItem recipe={item} onAddToProtocol={onAddToProtocol} />
      )}
      numColumns={NUM_COLUMNS}
      columnWrapperStyle={styles.columnWrapper}
      contentContainerStyle={styles.listContainer}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      initialNumToRender={8}
      maxToRenderPerBatch={10}
      windowSize={5}
      removeClippedSubviews={Platform.OS !== "web"}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={ListHeaderComponent ?? undefined}
      ListEmptyComponent={ListEmptyComponent ?? undefined}
      ListFooterComponent={
        isFetchingMore ? (
          <View style={styles.footerLoader}>
            <ActivityIndicator size="small" color="#818cf8" />
          </View>
        ) : undefined
      }
    />
  );
}

const styles = StyleSheet.create({
  listContainer: { paddingHorizontal: 16, paddingBottom: 40 },
  columnWrapper: { justifyContent: "space-between", marginBottom: 12 },
  card: {
    width: ITEM_WIDTH,
    backgroundColor: "#0f172a",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1e293b",
    overflow: "hidden",
    justifyContent: "space-between",
  },
  imageContainer: { width: "100%", height: 110, backgroundColor: "#1e293b", position: "relative" },
  thumbnail: { width: "100%", height: "100%" },
  fallbackThumb: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#020617",
  },
  cookTimeTag: {
    position: "absolute",
    bottom: 6,
    left: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(2, 6, 23, 0.75)",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  cookTimeTagText: { color: "#f8fafc", fontSize: 9, fontWeight: "700" },
  cardContent: { padding: 10, flex: 1, justifyContent: "space-between" },
  title: {
    fontSize: 12,
    fontWeight: "700",
    color: "#f8fafc",
    lineHeight: 16,
    marginBottom: 8,
    minHeight: 32,
  },
  macroRow: { flexDirection: "row", gap: 6, marginBottom: 10 },
  macroPill: {
    flex: 1,
    backgroundColor: "#020617",
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  macroVal: { fontSize: 11, fontWeight: "800", color: "#f8fafc" },
  macroLbl: { fontSize: 7, fontWeight: "700", color: "#64748b" },
  proteinPill: {
    borderColor: "rgba(129, 140, 248, 0.3)",
    backgroundColor: "rgba(129, 140, 248, 0.08)",
  },
  proteinVal: { color: "#818cf8" },
  proteinLbl: { color: "#818cf8" },
  actionBtn: {
    backgroundColor: "#818cf8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionBtnText: { color: "#020617", fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  footerLoader: { paddingVertical: 20, alignItems: "center" },
});
