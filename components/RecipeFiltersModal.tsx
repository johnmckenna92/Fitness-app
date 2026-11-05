import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export interface FilterState {
  selectedTag: string | null;
  simplicitySort: boolean;
  under30Mins: boolean;
}

interface Props {
  visible: boolean;
  filters: FilterState;
  onClose: () => void;
  onApply: (f: FilterState) => void;
  onReset: () => void;
}

const TAGS = ["high-protein", "beef", "chicken", "vegan", "vegetarian", "low-carb", "keto"];

export function RecipeFiltersModal({ visible, filters, onClose, onApply, onReset }: Props) {
  const [local, setLocal] = useState<FilterState>(filters);

  useEffect(() => {
    setLocal(filters);
  }, [filters, visible]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.overlay}>
        <Pressable style={s.backdrop} onPress={onClose} />
        <View style={s.sheet}>
          <View style={s.header}>
            <View>
              <Text style={s.sub}>FILTER PARAMETERS</Text>
              <Text style={s.title}>Catalog Filters</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          <ScrollView style={s.body}>
            <TouchableOpacity
              style={[s.row, local.simplicitySort && s.rowActive]}
              onPress={() => setLocal((p) => ({ ...p, simplicitySort: !p.simplicitySort }))}
            >
              <Text style={s.rowTitle}>Sort by Fewest Ingredients</Text>
              <Ionicons name={local.simplicitySort ? "checkbox" : "square-outline"} size={20} color="#818cf8" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.row, local.under30Mins && s.rowActive]}
              onPress={() => setLocal((p) => ({ ...p, under30Mins: !p.under30Mins }))}
            >
              <Text style={s.rowTitle}>Under 30 Minutes Prep</Text>
              <Ionicons name={local.under30Mins ? "checkbox" : "square-outline"} size={20} color="#818cf8" />
            </TouchableOpacity>

            <Text style={s.sec}>TAGS</Text>
            <View style={s.tagWrap}>
              {TAGS.map((t) => {
                const active = local.selectedTag === t;
                return (
                  <TouchableOpacity
                    key={t}
                    style={[s.pill, active && s.pillActive]}
                    onPress={() => setLocal((p) => ({ ...p, selectedTag: p.selectedTag === t ? null : t }))}
                  >
                    <Text style={[s.pillText, active && s.pillTextActive]}>{t.toUpperCase()}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          <View style={s.footer}>
            <TouchableOpacity style={s.resetBtn} onPress={() => { onReset(); onClose(); }}>
              <Text style={s.resetText}>RESET</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.applyBtn} onPress={() => { onApply(local); onClose(); }}>
              <Text style={s.applyText}>APPLY</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.75)", justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFill },
  sheet: { backgroundColor: "#0f172a", borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  sub: { fontSize: 9, fontWeight: "800", color: "#818cf8" },
  title: { fontSize: 16, fontWeight: "800", color: "#f8fafc" },
  body: { maxHeight: 360 },
  sec: { fontSize: 9, fontWeight: "800", color: "#94a3b8", marginTop: 10, marginBottom: 6 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#020617", padding: 12, borderRadius: 8, marginBottom: 8 },
  rowActive: { borderColor: "#818cf8", borderWidth: 1 },
  rowTitle: { fontSize: 12, fontWeight: "700", color: "#f8fafc" },
  tagWrap: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  pill: { backgroundColor: "#020617", paddingVertical: 5, paddingHorizontal: 9, borderRadius: 6 },
  pillActive: { backgroundColor: "#818cf8" },
  pillText: { fontSize: 9, fontWeight: "700", color: "#94a3b8" },
  pillTextActive: { color: "#020617" },
  footer: { flexDirection: "row", gap: 8, marginTop: 12 },
  resetBtn: { flex: 1, backgroundColor: "#020617", padding: 12, borderRadius: 6, alignItems: "center" },
  resetText: { fontSize: 10, fontWeight: "800", color: "#94a3b8" },
  applyBtn: { flex: 2, backgroundColor: "#818cf8", padding: 12, borderRadius: 6, alignItems: "center" },
  applyText: { fontSize: 10, fontWeight: "800", color: "#020617" },
});
