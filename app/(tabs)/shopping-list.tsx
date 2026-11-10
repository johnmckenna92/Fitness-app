import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CustomAlert, showAppAlert } from "../../components/CustomAlert";
import { useAuth } from "../../ctx/AuthContext";
import { useTheme } from "../../ctx/ThemeContext";
import { AisleGroup, optimizeShoppingList } from "../../lib/gemini";
import {
  ArchivedShoppingList,
  clearShoppingList,
  deleteArchivedShoppingList,
  getArchivedShoppingLists,
  loadShoppingList,
  saveShoppingList,
} from "../../services/shoppingListService";
import { ChecklistSection } from "../../types/database";

export default function ShoppingListScreen() {
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const { colors } = useTheme();
  const userId = profile?.id;

  const [raw, setRaw] = useState<string[]>([]);
  const [sections, setSections] = useState<ChecklistSection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
    const [alert, setAlert] = useState({ visible: false, title: "", message: "" });
  const [historyVisible, setHistoryVisible] = useState(false);
  const [archivedLists, setArchivedLists] = useState<ArchivedShoppingList[]>([]);
  const [selectedArchive, setSelectedArchive] = useState<ArchivedShoppingList | null>(null);

  const loadList = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await loadShoppingList(userId);
      setRaw(result.rawIngredients);
      setSections(result.sections);
          } catch (err) {
      console.warn("[shopping-list] Failed to load list:", err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const loadHistory = async () => {
    const list = await getArchivedShoppingLists(userId);
    setArchivedLists(list);
    setHistoryVisible(true);
  };

  const handleRestoreArchive = async (archive: ArchivedShoppingList) => {
    const uncheckSections = (archive.sections || []).map((sec) => ({
      ...sec,
      data: (sec.data || []).map((item) => ({
        ...item,
        checked: false,
        ...(item as any).is_checked !== undefined ? { is_checked: false } : {},
      })),
    }));

    setRaw(archive.rawIngredients || []);
    setSections(uncheckSections);
    await saveShoppingList(archive.rawIngredients || [], uncheckSections, userId);
    setHistoryVisible(false);
    setSelectedArchive(null);
    setAlert({
      visible: true,
      title: "LIST RESTORED",
      message: `Restored ${archive.title} with ${archive.totalItems} grocery items.`,
    });
  };

  const handleDeleteArchive = async (id: string) => {
    await deleteArchivedShoppingList(id, userId);
    const updated = await getArchivedShoppingLists(userId);
    setArchivedLists(updated);
    if (selectedArchive?.id === id) {
      setSelectedArchive(null);
    }
  };

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    loadList();
  }, [loadList]);

  const handleOptimize = async () => {
    if (raw.length === 0) {
      setAlert({
        visible: true,
        title: "LIST EMPTY",
        message: "No ingredients queued. Add recipes to your list from the Recipes tab.",
      });
      return;
    }

    setIsOptimizing(true);
    try {
      const aisleGroups: AisleGroup[] = await optimizeShoppingList(raw);
      const newSections: ChecklistSection[] = aisleGroups.map((group, gIdx) => ({
        aisle: group.aisle,
        data: group.items.map((item, idx) => ({
          id: `${gIdx}-${idx}-${item}`,
          text: item,
          checked: false,
        })),
      }));
      setSections(newSections);
      await saveShoppingList(raw, newSections, userId);
          } catch (err: any) {
      setAlert({
        visible: true,
        title: "OPTIMIZATION FAILED",
        message: err?.message || "Failed to organize grocery packet sizes.",
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const toggleItem = async (itemId: string) => {
    const updated = sections.map((section) => ({
      ...section,
      data: section.data.map((item) =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      ),
    }));
    setSections(updated);
    await saveShoppingList(raw, updated, userId);
  };

  const executeClear = async () => {
    await clearShoppingList(userId, raw, sections);
    setRaw([]);
    setSections([]);
        setAlert({
      visible: true,
      title: "LIST ARCHIVED & RESET",
      message: "Your active shopping list has been archived to history and reset.",
    });
  };

  const confirmClear = () => {
    showAppAlert(
      "Clear Shopping List",
      "Are you sure you want to archive your current checklist and clear the active view? You can revisit it anytime under History.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Archive & Clear", style: "destructive", onPress: executeClear },
      ]
    );
  };

  const allItems = sections.flatMap((sec) => sec.data);
  const checkedCount = allItems.filter((it) => it.checked).length;
  const totalCount = allItems.length;
  const progressPercent = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View>
          <View style={styles.titleRow}>
            <Text style={[styles.subtitle, { color: colors.primaryText }]}>SMART GROCERY LIST</Text>
            
          </View>
          <Text style={styles.title} className="text-zinc-900 dark:text-white">Shopping List</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <TouchableOpacity
            style={styles.historyBtn}
            className="bg-emerald-50 dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-500/40"
            onPress={loadHistory}
            activeOpacity={0.7}
          >
            <Ionicons name="time-outline" size={16} color={colors.primaryText} />
            <Text style={styles.historyBtnText} className="text-emerald-700 dark:text-emerald-400">HISTORY</Text>
          </TouchableOpacity>
          {(totalCount > 0 || raw.length > 0) && (
            <TouchableOpacity style={styles.clearBtn} className="bg-red-50 dark:bg-zinc-900 border border-red-200 dark:border-red-900/50" onPress={confirmClear}>
              <Text style={styles.clearBtnText}>CLEAR</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.statusCard} className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm">
        <View style={styles.statusRow}>
          <Text style={styles.statusKey} className="text-zinc-600 dark:text-zinc-100 font-bold">
            {totalCount > 0 ? "CHECKLIST PROGRESS" : "QUEUED INGREDIENTS"}
          </Text>
          <Text style={styles.statusVal} className="text-zinc-900 dark:text-white">
            {totalCount > 0
              ? `${checkedCount} / ${totalCount} TICKED`
              : `${raw.length} items`}
          </Text>
        </View>

        {totalCount > 0 && (
          <View style={styles.progressBarTrack} className="bg-zinc-200 dark:bg-zinc-800">
            <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
          </View>
        )}

        <TouchableOpacity
          style={[styles.optimizeBtn, (isOptimizing || raw.length === 0) && styles.optimizeBtnDisabled]}
          className="bg-[#4ade80]"
          onPress={handleOptimize}
          disabled={isOptimizing || raw.length === 0}
        >
          {isOptimizing ? (
            <ActivityIndicator size="small" color="#0a0a0a" />
          ) : (
            <Ionicons name="cart" size={16} color="#0a0a0a" />
          )}
          <Text style={styles.optimizeBtnText} className="text-[#0a0a0a]">
            {isOptimizing ? "OPTIMIZING PACKETS..." : "OPTIMIZE SUPERMARKET PACKETS"}
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.mid}><ActivityIndicator size="large" color="#4ade80" /></View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderSectionHeader={({ section: { aisle } }) => (
            <View style={styles.aisleHeader}>
              <Text style={[styles.aisleHeaderText, { color: colors.primaryText }]}>{aisle}</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.checkRow, item.checked && styles.checkRowDone]}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
              onPress={() => toggleItem(item.id)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={item.checked ? "checkbox" : "square-outline"}
                size={22}
                color={item.checked ? "#10b981" : colors.primaryText}
              />
              <Text
                style={[styles.checkText, item.checked && styles.checkTextDone]}
                className={item.checked ? "text-zinc-400 dark:text-zinc-500" : "text-zinc-900 dark:text-white"}
              >
                {item.text}
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="cart-outline" size={44} color="#64748b" />
              <Text style={styles.emptyT} className="text-zinc-800 dark:text-zinc-200">SHOPPING LIST IS EMPTY</Text>
              <Text style={styles.emptySub} className="text-zinc-500 dark:text-zinc-400">
                Tap &quot;+ Add to List&quot; on any meal in Recipe Discovery, then tap &quot;OPTIMIZE SUPERMARKET PACKETS&quot; to create your organized aisle checklist.
              </Text>
            </View>
          }
        />
      )}

      {/* HISTORY MODAL */}
      <Modal
        visible={historyVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setHistoryVisible(false);
          setSelectedArchive(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View
            style={styles.modalContent}
            className="bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800"
          >
            <View
              style={styles.modalHeader}
              className="border-b border-zinc-200 dark:border-zinc-800"
            >
              <View>
                <Text style={styles.modalTitle} className="text-zinc-900 dark:text-white">Past Shopping Lists</Text>
                <Text style={styles.modalSubtitle} className="text-zinc-500 dark:text-zinc-400">
                  Revisit previous weeks and past grocery checklists
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setHistoryVisible(false);
                  setSelectedArchive(null);
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={24} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {archivedLists.length === 0 ? (
              <View style={styles.emptyHistory}>
                <Ionicons name="time-outline" size={40} color="#334155" />
                <Text style={styles.emptyHistoryText}>No past shopping lists yet</Text>
                <Text style={styles.emptyHistorySub}>
                  When you clear your active checklist, it will be automatically archived here for future reference.
                </Text>
              </View>
            ) : (
              <FlatList
                data={archivedLists}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
                renderItem={({ item }) => {
                  const isExpanded = selectedArchive?.id === item.id;
                  const allArchiveItems = item.sections.flatMap((s) => s.data);

                  return (
                    <View style={styles.archiveCard}>
                      <TouchableOpacity
                        style={styles.archiveCardHeader}
                        activeOpacity={0.7}
                        onPress={() =>
                          setSelectedArchive(isExpanded ? null : item)
                        }
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={styles.archiveTitle}>{item.title}</Text>
                          <Text style={styles.archiveMeta}>
                            {item.totalItems} items · {item.adherenceRate}% completed
                          </Text>
                        </View>
                        <Ionicons
                          name={isExpanded ? "chevron-up" : "chevron-down"}
                          size={18}
                          color="#94a3b8"
                        />
                      </TouchableOpacity>

                      {isExpanded && (
                        <View style={styles.archiveExpanded}>
                          <View style={styles.archiveItemsList}>
                            {allArchiveItems.length > 0 ? (
                              allArchiveItems.map((grocery, idx) => (
                                <View key={`${grocery.id}-${idx}`} style={styles.archiveItemRow}>
                                  <Ionicons
                                    name={grocery.checked ? "checkmark-circle" : "ellipse-outline"}
                                    size={14}
                                    color={grocery.checked ? "#10b981" : "#64748b"}
                                  />
                                  <Text
                                    style={[
                                      styles.archiveItemText,
                                      grocery.checked && styles.archiveItemDone,
                                    ]}
                                  >
                                    {grocery.text}
                                  </Text>
                                </View>
                              ))
                            ) : (
                              item.rawIngredients.map((rawIt, idx) => (
                                <Text key={idx} style={styles.archiveItemText}>
                                  • {rawIt}
                                </Text>
                              ))
                            )}
                          </View>

                          <View style={styles.archiveActions}>
                            <TouchableOpacity
                              style={styles.restoreBtn}
                              onPress={() => handleRestoreArchive(item)}
                            >
                              <Ionicons name="refresh-outline" size={14} color="#020617" />
                              <Text style={styles.restoreBtnText}>Restore to Active</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={styles.deleteArchiveBtn}
                              onPress={() => handleDeleteArchive(item.id)}
                            >
                              <Ionicons name="trash-outline" size={14} color="#ef4444" />
                            </TouchableOpacity>
                          </View>
                        </View>
                      )}
                    </View>
                  );
                }}
              />
            )}
          </View>
        </View>
      </Modal>

      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        buttonText="ACKNOWLEDGE"
        onClose={() => setAlert({ visible: false, title: "", message: "" })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#262626",
  },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  syncBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#171717",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#262626",
  },
  syncText: { fontSize: 9, fontWeight: "800", letterSpacing: 0.5 },
  subtitle: { fontSize: 10, fontWeight: "800", color: "#4ade80", letterSpacing: 1 },
  title: { fontSize: 22, fontWeight: "800", marginTop: 2 },
  clearBtn: { borderWidth: 1, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  clearBtnText: { fontSize: 11, fontWeight: "700", color: "#ef4444" },
  statusCard: {
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 10,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  statusRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  statusKey: { fontSize: 11, fontWeight: "800", letterSpacing: 0.5 },
  statusVal: { fontSize: 15, fontWeight: "900" },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#10b981",
    borderRadius: 3,
  },
  optimizeBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  optimizeBtnDisabled: { opacity: 0.4 },
  optimizeBtnText: { fontSize: 12, fontWeight: "800", letterSpacing: 0.5 },
  list: { paddingHorizontal: 16, paddingBottom: 40, paddingTop: 4 },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  checkRowDone: { opacity: 0.45 },
  checkText: { fontSize: 14, fontWeight: "600", flex: 1, lineHeight: 20 },
  checkTextDone: { textDecorationLine: "line-through" },
  empty: { alignItems: "center", marginTop: 48, paddingHorizontal: 28 },
  emptyT: { fontSize: 14, fontWeight: "800", marginTop: 14, letterSpacing: 0.8 },
  emptySub: { fontSize: 13, textAlign: "center", marginTop: 6, lineHeight: 18 },
  aisleHeader: {
    paddingVertical: 8,
    marginTop: 12,
    marginBottom: 4,
  },
  aisleHeaderText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#4ade80",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  mid: { flex: 1, justifyContent: "center", alignItems: "center" },
  historyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  historyBtnText: { fontSize: 11, fontWeight: "700" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    maxHeight: "85%",
    padding: 20,
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 18, fontWeight: "800" },

  modalSubtitle: { fontSize: 12, color: "#94a3b8", marginTop: 2 },
  emptyHistory: {
    paddingVertical: 48,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  emptyHistoryText: { fontSize: 15, fontWeight: "700", color: "#f8fafc" },
  emptyHistorySub: {
    fontSize: 13,
    color: "#64748b",
    textAlign: "center",
    paddingHorizontal: 24,
    lineHeight: 18,
  },
  archiveCard: {
    backgroundColor: "#171717",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#262626",
    marginBottom: 12,
    overflow: "hidden",
  },
  archiveCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
  },
  archiveTitle: { fontSize: 14, fontWeight: "700", color: "#f8fafc" },
  archiveMeta: { fontSize: 12, color: "#94a3b8", marginTop: 2 },
  archiveExpanded: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: "#262626",
  },
  archiveItemsList: { paddingVertical: 10, gap: 6 },
  archiveItemRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  archiveItemText: { fontSize: 13, color: "#f8fafc" },
  archiveItemDone: { textDecorationLine: "line-through", color: "#64748b" },
  archiveActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#262626",
  },
  restoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#4ade80",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  restoreBtnText: { color: "#0a0a0a", fontSize: 12, fontWeight: "800" },
  deleteArchiveBtn: { padding: 8 },
});
