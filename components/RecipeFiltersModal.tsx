import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../ctx/ThemeContext";

export interface FilterState {
  selectedTag: string | null;
  simplicitySort: boolean;
  under30Mins: boolean;
  sortByProtein?: boolean;
  dietaryPreference?: string | null;
}

interface Props {
  visible: boolean;
  filters: FilterState;
  onClose: () => void;
  onApply: (f: FilterState) => void;
  onReset: () => void;
}

const TAG_GROUPS = {
  proteins: ["chicken", "beef", "salmon", "turkey", "eggs", "tofu"],
  meals: ["breakfast", "lunch", "dinner", "snack"],
  cuisines: ["asian", "mediterranean", "mexican", "italian"],
};

const DIETARY = [
  "high-protein",
  "low-carb",
  "keto",
  "vegetarian",
  "vegan",
  "pescatarian",
  "gluten-free",
  "dairy-free",
];

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const MODAL_WIDTH = Math.min(SCREEN_WIDTH - 32, 420);

export function RecipeFiltersModal({ visible, filters, onClose, onApply, onReset }: Props) {
  const { colors, isDark } = useTheme();
  const [local, setLocal] = useState<FilterState>(filters);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setLocal(filters);
  }, [filters, visible]);

  const updateLocalState = useCallback(
    (updater: (prev: FilterState) => FilterState) => {
      setLocal((prev) => {
        const next = updater(prev);
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(() => {
          onApply(next);
        }, 400);
        return next;
      });
    },
    [onApply]
  );

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleApplyNow = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    onApply(local);
    onClose();
  };

  const handleResetNow = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    const resetFilters: FilterState = {
      selectedTag: null,
      simplicitySort: false,
      under30Mins: false,
      sortByProtein: false,
      dietaryPreference: null,
    };
    setLocal(resetFilters);
    onReset();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.overlay}>
        <Pressable style={s.backdrop} onPress={onClose} />
        <View
          style={[
            s.modalCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.cardBorder,
            },
          ]}
        >
          {/* Header */}
          <View style={[s.header, { borderBottomColor: colors.borderSubtle }]}>
            <View>
              <Text style={[s.badge, { color: colors.primaryText }]}>PREFERENCES & DISCOVERY</Text>
              <Text style={[s.title, { color: colors.text }]}>Recipe Filters</Text>
            </View>
            <TouchableOpacity
              style={[s.closeBtn, { backgroundColor: colors.surfaceSubtle }]}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={s.body}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={s.scrollContent}
          >
            {/* Quick Presets Section */}
            <Text style={[s.sec, { color: colors.textSecondary }]}>SMART OPTIMIZATIONS</Text>
            <View style={s.toggleGroup}>
              <TouchableOpacity
                style={[
                  s.row,
                  { backgroundColor: colors.card, borderColor: colors.cardBorder },
                  local.under30Mins && {
                    borderColor: colors.primary,
                    backgroundColor: isDark ? "rgba(74, 222, 128, 0.08)" : "rgba(74, 222, 128, 0.08)",
                  },
                ]}
                activeOpacity={0.7}
                onPress={() =>
                  updateLocalState((p) => ({ ...p, under30Mins: !p.under30Mins }))
                }
              >
                <View style={s.rowTextWrap}>
                  <Text style={[s.rowTitle, { color: colors.text }]}>Under 30 Minutes Prep</Text>
                  <Text style={[s.rowSub, { color: colors.textSecondary }]}>
                    Prioritizes rapid, weekday-friendly meals
                  </Text>
                </View>
                <Ionicons
                  name={local.under30Mins ? "checkbox" : "square-outline"}
                  size={22}
                  color={local.under30Mins ? colors.primary : colors.textMuted}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  s.row,
                  { backgroundColor: colors.card, borderColor: colors.cardBorder },
                  local.simplicitySort && {
                    borderColor: colors.primary,
                    backgroundColor: isDark ? "rgba(74, 222, 128, 0.08)" : "rgba(74, 222, 128, 0.08)",
                  },
                ]}
                activeOpacity={0.7}
                onPress={() =>
                  updateLocalState((p) => ({ ...p, simplicitySort: !p.simplicitySort }))
                }
              >
                <View style={s.rowTextWrap}>
                  <Text style={[s.rowTitle, { color: colors.text }]}>Fewest Ingredients First</Text>
                  <Text style={[s.rowSub, { color: colors.textSecondary }]}>
                    Clean, minimalist shopping lists
                  </Text>
                </View>
                <Ionicons
                  name={local.simplicitySort ? "checkbox" : "square-outline"}
                  size={22}
                  color={local.simplicitySort ? colors.primary : colors.textMuted}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  s.row,
                  { backgroundColor: colors.card, borderColor: colors.cardBorder },
                  local.sortByProtein && {
                    borderColor: colors.primary,
                    backgroundColor: isDark ? "rgba(74, 222, 128, 0.08)" : "rgba(74, 222, 128, 0.08)",
                  },
                ]}
                activeOpacity={0.7}
                onPress={() =>
                  updateLocalState((p) => ({ ...p, sortByProtein: !p.sortByProtein }))
                }
              >
                <View style={s.rowTextWrap}>
                  <Text style={[s.rowTitle, { color: colors.text }]}>Maximize Protein Density</Text>
                  <Text style={[s.rowSub, { color: colors.textSecondary }]}>
                    Sorts highest protein ratio first
                  </Text>
                </View>
                <Ionicons
                  name={local.sortByProtein ? "checkbox" : "square-outline"}
                  size={22}
                  color={local.sortByProtein ? colors.primary : colors.textMuted}
                />
              </TouchableOpacity>
            </View>

            {/* Dietary Protocols */}
            <Text style={[s.sec, { color: colors.textSecondary }]}>DIETARY PROTOCOL</Text>
            <View style={s.tagWrap}>
              {DIETARY.map((d) => {
                const isSelected = local.dietaryPreference === d;
                return (
                  <TouchableOpacity
                    key={d}
                    style={[
                      s.pill,
                      { backgroundColor: colors.card, borderColor: colors.cardBorder },
                      isSelected && { backgroundColor: colors.primary, borderColor: colors.primary },
                    ]}
                    activeOpacity={0.7}
                    onPress={() =>
                      updateLocalState((p) => ({
                        ...p,
                        dietaryPreference: isSelected ? null : d,
                      }))
                    }
                  >
                    <Text
                      style={[
                        s.pillText,
                        { color: colors.textSecondary },
                        isSelected && { color: "#0a0a0a", fontWeight: "800" },
                      ]}
                    >
                      {d.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Protein & Ingredient Tags */}
            <Text style={[s.sec, { color: colors.textSecondary }]}>PRIMARY PROTEIN</Text>
            <View style={s.tagWrap}>
              {TAG_GROUPS.proteins.map((t) => {
                const isSelected = local.selectedTag === t;
                return (
                  <TouchableOpacity
                    key={t}
                    style={[
                      s.pill,
                      { backgroundColor: colors.card, borderColor: colors.cardBorder },
                      isSelected && { backgroundColor: colors.primary, borderColor: colors.primary },
                    ]}
                    activeOpacity={0.7}
                    onPress={() =>
                      updateLocalState((p) => ({
                        ...p,
                        selectedTag: isSelected ? null : t,
                      }))
                    }
                  >
                    <Text
                      style={[
                        s.pillText,
                        { color: colors.textSecondary },
                        isSelected && { color: "#0a0a0a", fontWeight: "800" },
                      ]}
                    >
                      {t.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Meal Types */}
            <Text style={[s.sec, { color: colors.textSecondary }]}>MEAL TYPE</Text>
            <View style={s.tagWrap}>
              {TAG_GROUPS.meals.map((t) => {
                const isSelected = local.selectedTag === t;
                return (
                  <TouchableOpacity
                    key={t}
                    style={[
                      s.pill,
                      { backgroundColor: colors.card, borderColor: colors.cardBorder },
                      isSelected && { backgroundColor: colors.primary, borderColor: colors.primary },
                    ]}
                    activeOpacity={0.7}
                    onPress={() =>
                      updateLocalState((p) => ({
                        ...p,
                        selectedTag: isSelected ? null : t,
                      }))
                    }
                  >
                    <Text
                      style={[
                        s.pillText,
                        { color: colors.textSecondary },
                        isSelected && { color: "#0a0a0a", fontWeight: "800" },
                      ]}
                    >
                      {t.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Action Footer */}
          <View style={[s.footer, { borderTopColor: colors.borderSubtle }]}>
            <TouchableOpacity
              style={[
                s.resetBtn,
                { backgroundColor: colors.surfaceSubtle, borderColor: colors.cardBorder },
              ]}
              activeOpacity={0.8}
              onPress={handleResetNow}
            >
              <Text style={[s.resetText, { color: colors.textSecondary }]}>RESET ALL</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.applyBtn, { backgroundColor: colors.primary }]}
              activeOpacity={0.8}
              onPress={handleApplyNow}
            >
              <Text style={s.applyText}>DONE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  modalCard: {
    width: MODAL_WIDTH,
    maxHeight: "85%",
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  badge: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
  },
  body: {
    maxHeight: 420,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  sec: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginTop: 14,
    marginBottom: 8,
  },
  toggleGroup: {
    gap: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  rowTextWrap: {
    flex: 1,
    paddingRight: 10,
  },
  rowTitle: {
    fontSize: 13,
    fontWeight: "700",
  },
  rowSub: {
    fontSize: 10,
    fontWeight: "500",
    marginTop: 2,
  },
  tagWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pill: {
    paddingVertical: 7,
    paddingHorizontal: 11,
    borderRadius: 8,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  footer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  resetBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  resetText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  applyBtn: {
    flex: 2,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  applyText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0a0a0a",
    letterSpacing: 0.5,
  },
});
