import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SectionList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CustomAlert } from "../../components/CustomAlert";
import { AisleGroup, optimizeSupplyChain } from "../../lib/gemini";
import { PROTOCOL_STORAGE_KEY } from "./recipes";
import { styles } from "./SupplyChain.styles";

const SHOPPING_LIST_CHECKLIST_KEY = "@shopping_list_checklist_v2";

interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

interface ChecklistSection {
  aisle: string;
  data: ChecklistItem[];
}

export default function ShoppingListScreen() {
  const insets = useSafeAreaInsets();
  const [raw, setRaw] = useState<string[]>([]);
  const [sections, setSections] = useState<ChecklistSection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [alert, setAlert] = useState({ visible: false, title: "", message: "" });

  const loadList = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await AsyncStorage.getItem(PROTOCOL_STORAGE_KEY);
      setRaw(data ? JSON.parse(data) : []);
      const saved = await AsyncStorage.getItem(SHOPPING_LIST_CHECKLIST_KEY);
      if (saved) {
        setSections(JSON.parse(saved));
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
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
      const aisleGroups: AisleGroup[] = await optimizeSupplyChain(raw);
      const newSections: ChecklistSection[] = aisleGroups.map((group, gIdx) => ({
        aisle: group.aisle,
        data: group.items.map((item, idx) => ({
          id: `${gIdx}-${idx}-${item}`,
          text: item,
          checked: false,
        })),
      }));
      setSections(newSections);
      await AsyncStorage.setItem(SHOPPING_LIST_CHECKLIST_KEY, JSON.stringify(newSections));
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
    await AsyncStorage.setItem(SHOPPING_LIST_CHECKLIST_KEY, JSON.stringify(updated));
  };

  const executeClear = async () => {
    await AsyncStorage.removeItem(PROTOCOL_STORAGE_KEY);
    await AsyncStorage.removeItem(SHOPPING_LIST_CHECKLIST_KEY);
    setRaw([]);
    setSections([]);
    setAlert({
      visible: true,
      title: "LIST CLEARED",
      message: "Your shopping list has been reset.",
    });
  };

  const confirmClear = () => {
    Alert.alert(
      "Clear Shopping List",
      "Are you sure you want to clear your queued ingredients and grocery checklist? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Clear All", style: "destructive", onPress: executeClear },
      ]
    );
  };

  const allItems = sections.flatMap((sec) => sec.data);
  const checkedCount = allItems.filter((it) => it.checked).length;
  const totalCount = allItems.length;
  const progressPercent = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.subtitle}>SMART GROCERY LIST</Text>
          <Text style={styles.title}>Shopping List</Text>
        </View>
        {(totalCount > 0 || raw.length > 0) && (
          <TouchableOpacity style={styles.clearBtn} onPress={confirmClear}>
            <Text style={styles.clearBtnText}>CLEAR ALL</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.statusCard}>
        <View style={styles.statusRow}>
          <Text style={styles.statusKey}>
            {totalCount > 0 ? "CHECKLIST PROGRESS" : "QUEUED INGREDIENTS"}
          </Text>
          <Text style={styles.statusVal}>
            {totalCount > 0
              ? `${checkedCount} / ${totalCount} TICKED`
              : `${raw.length} items`}
          </Text>
        </View>

        {totalCount > 0 && (
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
          </View>
        )}

        <TouchableOpacity
          style={[styles.optimizeBtn, (isOptimizing || raw.length === 0) && styles.optimizeBtnDisabled]}
          onPress={handleOptimize}
          disabled={isOptimizing || raw.length === 0}
        >
          {isOptimizing ? (
            <ActivityIndicator size="small" color="#020617" />
          ) : (
            <Ionicons name="cart" size={16} color="#020617" />
          )}
          <Text style={styles.optimizeBtnText}>
            {isOptimizing ? "OPTIMIZING PACKETS..." : "OPTIMIZE SUPERMARKET PACKETS"}
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.mid}><ActivityIndicator size="large" color="#818cf8" /></View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderSectionHeader={({ section: { aisle } }) => (
            <View style={styles.aisleHeader}>
              <Text style={styles.aisleHeaderText}>{aisle}</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.checkRow, item.checked && styles.checkRowDone]}
              onPress={() => toggleItem(item.id)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={item.checked ? "checkbox" : "square-outline"}
                size={22}
                color={item.checked ? "#10b981" : "#818cf8"}
              />
              <Text style={[styles.checkText, item.checked && styles.checkTextDone]}>
                {item.text}
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="cart-outline" size={44} color="#334155" />
              <Text style={styles.emptyT}>SHOPPING LIST IS EMPTY</Text>
              <Text style={styles.emptySub}>
                Tap "+ Add to List" on any meal in Recipe Discovery, then tap "OPTIMIZE SUPERMARKET PACKETS" to create your organized aisle checklist.
              </Text>
            </View>
          }
        />
      )}

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
