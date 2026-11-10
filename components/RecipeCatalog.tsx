import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { memo } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../ctx/ThemeContext";
import { Recipe } from "../types/database";
import { getCombinedTotalTime, getMacrosPerServing } from "../utils/formatters";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const TOTAL_PADDING = 32;
const ITEM_WIDTH = SCREEN_WIDTH - TOTAL_PADDING;

export interface RecipeCatalogProps {
  recipes: Recipe[];
  onAddToProtocol: (recipe: Recipe) => void;
  onEndReached?: () => void;
  isFetchingMore?: boolean;
  ListHeaderComponent?: React.JSX.Element | undefined;
  ListEmptyComponent?: React.JSX.Element | undefined;
  refreshing?: boolean;
  onRefresh?: () => void;
  refreshControl?: React.ReactElement;
}

const RecipeGridItem = memo(function RecipeGridItem({
  recipe,
  onAddToProtocol,
}: {
  recipe: Recipe;
  onAddToProtocol: (recipe: Recipe) => void;
}) {
  const { colors, isDark } = useTheme();
  const rawCover = recipe.images && recipe.images.length > 0 ? recipe.images[0] : recipe.image_url;
  const coverImage = typeof rawCover === "string" && rawCover.trim().length > 0 ? rawCover.trim() : null;
  const timeFormatted = getCombinedTotalTime(recipe.prep_time, recipe.cook_time, recipe.total_time);
  const { calories, protein } = getMacrosPerServing(recipe);
  const actionTextColor = isDark ? colors.background : colors.text;

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
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => router.push(`/recipe/${recipe.id}` as any)}
      >
        <View style={[styles.imageContainer, { backgroundColor: colors.surfaceSubtle }]}>
          {coverImage ? (
            <Image
              source={{ uri: coverImage }}
              style={styles.thumbnail}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={150}
            />
          ) : (
            <View style={[styles.fallbackThumb, { backgroundColor: colors.surfaceSubtle }]}>
              <Ionicons name="fast-food-outline" size={40} color={colors.textMuted} />
            </View>
          )}

          {Boolean(timeFormatted) && (
            <View style={styles.cookTimeTag}>
              <Ionicons name="time-outline" size={12} color={colors.text} />
              <Text style={[styles.cookTimeTagText, { color: colors.text }]}>{timeFormatted}</Text>
            </View>
          )}
        </View>

        <View style={styles.cardContent}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
            {recipe.title}
          </Text>

          <View style={styles.bottomRow}>
            <View style={styles.macroRow}>
              <View
                style={[
                  styles.macroPill,
                  {
                    backgroundColor: colors.surfaceSubtle,
                    borderColor: colors.borderSubtle,
                  },
                ]}
              >
                <Text style={[styles.macroVal, { color: colors.text }]}>{calories}</Text>
                <Text style={[styles.macroLbl, { color: colors.textMuted }]}>CAL / SERV</Text>
              </View>
              <View
                style={[
                  styles.macroPill,
                  styles.proteinPill,
                  {
                    backgroundColor: isDark ? "rgba(74, 222, 128, 0.12)" : "rgba(74, 222, 128, 0.1)",
                    borderColor: isDark ? "rgba(74, 222, 128, 0.3)" : "rgba(74, 222, 128, 0.25)",
                  },
                ]}
              >
                <Text style={[styles.macroVal, { color: colors.primaryText }]}>{protein}g</Text>
                <Text style={[styles.macroLbl, { color: colors.primaryText }]}>PRO</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.tint || colors.primary }]}
              activeOpacity={0.8}
              onPress={() => onAddToProtocol(recipe)}
            >
              <Ionicons name="add" size={16} color={actionTextColor} />
              <Text style={[styles.actionBtnText, { color: actionTextColor }]}>Add to List</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
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
  refreshing = false,
  onRefresh,
  refreshControl,
}: RecipeCatalogProps) {
  const { colors } = useTheme();
  const themeAccent = colors.tint || colors.primary;

  const resolvedRefreshControl =
    refreshControl ??
    (onRefresh ? (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        tintColor={themeAccent}
        colors={[themeAccent]}
      />
    ) : undefined);

  return (
    <FlatList
      data={recipes}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => (
        <RecipeGridItem recipe={item} onAddToProtocol={onAddToProtocol} />
      )}
      contentContainerStyle={[
        styles.listContainer,
        recipes.length === 0 && styles.emptyListContainer,
      ]}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      initialNumToRender={6}
      maxToRenderPerBatch={8}
      windowSize={5}
      removeClippedSubviews={Platform.OS !== "web"}
      showsVerticalScrollIndicator={false}
      refreshControl={resolvedRefreshControl}
      ListHeaderComponent={ListHeaderComponent ?? undefined}
      ListEmptyComponent={ListEmptyComponent ?? undefined}
      ListFooterComponent={
        isFetchingMore ? (
          <View style={styles.footerLoader}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : undefined
      }
    />
  );
}

const styles = StyleSheet.create({
  listContainer: { paddingHorizontal: 16, paddingBottom: 40 },
  emptyListContainer: { flexGrow: 1, justifyContent: "center" },
  card: {
    width: ITEM_WIDTH,
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
  imageContainer: { width: "100%", height: 190, position: "relative" },
  thumbnail: { width: "100%", height: "100%" },
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
  cookTimeTagText: { fontSize: 11, fontWeight: "700" },
  cardContent: { padding: 16 },
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
  macroRow: { flexDirection: "row", gap: 8, flex: 1 },
  macroPill: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    flex: 1,
  },
  macroVal: { fontSize: 13, fontWeight: "800" },
  macroLbl: { fontSize: 8, fontWeight: "700", marginTop: 2, letterSpacing: 0.3 },
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
  actionBtnText: { fontSize: 12, fontWeight: "800", letterSpacing: 0.3 },
  footerLoader: { paddingVertical: 20, alignItems: "center" },
});
