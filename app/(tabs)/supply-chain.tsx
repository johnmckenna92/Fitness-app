import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CustomAlert } from "../../components/CustomAlert";
import { optimizeSupplyChain } from "../../lib/gemini";
import { PROTOCOL_STORAGE_KEY } from "./recipes";
import { styles } from "./SupplyChain.styles";

const SUPPLY_CHAIN_CHECKLIST_KEY = "@protocol_supply_chain_checklist";

interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export default function SupplyChainScreen() {
  const insets = useSafeAreaInsets();
  const [raw, setRaw] = useState<string[]>([]);
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [alert, setAlert] = useState({ visible: false, title: "", message: "" });

  const loadProtocol = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await AsyncStorage.getItem(PROTOCOL_STORAGE_KEY);
      setRaw(data ? JSON.parse(data) : []);
      const saved = await AsyncStorage.getItem(SUPPLY_CHAIN_CHECKLIST_KEY);
      if (saved) setItems(JSON.parse(saved));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProtocol();
  }, [loadProtocol]);

  const handleOptimize = async () => {
    if (raw.length === 0) {
      setAlert({
        visible: true,
        title: "PROTOCOL EMPTY",
        message: "No ingredients queued. Add recipes to the protocol from Discovery.",
      });
      return;
    }

    setIsOptimizing(true);
    try {
      const normalized = await optimizeSupplyChain(raw);
      const list: ChecklistItem[] = normalized.map((text, idx) => ({
        id: `${idx}-${text}`,
        text,
        checked: false,
      }));
      setItems(list);
      await AsyncStorage.setItem(SUPPLY_CHAIN_CHECKLIST_KEY, JSON.stringify(list));
    } catch (err: any) {
      setAlert({
        visible: true,
        title: "OPTIMIZATION FAILED",
        message: err?.message || "Failed to collate supermarket packet sizes.",
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const toggleItem = async (id: string) => {
    const updated = items.map((it) => (it.id === id ? { ...it, checked: !it.checked } : it));
    setItems(updated);
    await AsyncStorage.setItem(SUPPLY_CHAIN_CHECKLIST_KEY, JSON.stringify(updated));
  };

  const handleClear = async () => {
    await AsyncStorage.removeItem(PROTOCOL_STORAGE_KEY);
    await AsyncStorage.removeItem(SUPPLY_CHAIN_CHECKLIST_KEY);
    setRaw([]);
    setItems([]);
    setAlert({
      visible: true,
      title: "PROTOCOL CLEARED",
      message: "Weekly supply chain inventory reset to zero.",
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.subtitle}>INVENTORY TELEMETRY</Text>
          <Text style={styles.title}>Supply Chain</Text>
        </View>
        {items.length > 0 && (
          <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
            <Text style={styles.clearBtnText}>RESET</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.statusCard}>
        <View style={styles.statusRow}>
          <Text style={styles.statusKey}>RAW INGREDIENTS COMMITTED</Text>
          <Text style={styles.statusVal}>{raw.length}</Text>
        </View>
        <TouchableOpacity
          style={[styles.optimizeBtn, (isOptimizing || raw.length === 0) && styles.optimizeBtnDisabled]}
          onPress={handleOptimize}
          disabled={isOptimizing || raw.length === 0}
        >
          {isOptimizing ? (
            <ActivityIndicator size="small" color="#020617" />
          ) : (
            <Ionicons name="sparkles" size={16} color="#020617" />
          )}
          <Text style={styles.optimizeBtnText}>
            {isOptimizing ? "COLLATING INVENTORY..." : "OPTIMIZE SUPERMARKET PACKETS"}
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.mid}><ActivityIndicator size="large" color="#818cf8" /></View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.checkRow, item.checked && styles.checkRowDone]}
              onPress={() => toggleItem(item.id)}
            >
              <Ionicons
                name={item.checked ? "checkbox" : "square-outline"}
                size={22}
                color={item.checked ? "#818cf8" : "#64748b"}
              />
              <Text style={[styles.checkText, item.checked && styles.checkTextDone]}>
                {item.text}
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="cart-outline" size={40} color="#334155" />
              <Text style={styles.emptyT}>NO SUPPLY CHAIN DATA</Text>
              <Text style={styles.emptySub}>
                Add recipes to your protocol from Recipe Discovery, then run the packet optimization.
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
