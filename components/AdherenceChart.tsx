import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export interface HistoricalDay {
  day: string;
  adherenceRate: number;
}

interface AdherenceChartProps {
  data: HistoricalDay[];
  isPro: boolean;
  onUnlock: () => void;
}

export function AdherenceChart({ data, isPro, onUnlock }: AdherenceChartProps) {
  return (
    <View style={styles.chartWrapper}>
      <View style={styles.chartContainer}>
        <View style={styles.chartLegend}>
          <View style={styles.legendItem}>
            <View style={styles.legendDot} />
            <Text style={styles.legendText}>Adherence Rate (%)</Text>
          </View>
          <Text style={styles.adherenceAverage}>AVG 96.1% FIDELITY</Text>
        </View>

        <View style={styles.barsArea}>
          {data.map((item, index) => {
            const heightPercent = Math.min(100, Math.max(12, item.adherenceRate));
            return (
              <View key={index} style={styles.barColumn}>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { height: `${heightPercent}%` }]} />
                </View>
                <Text style={styles.barDayText}>{item.day}</Text>
                <Text style={styles.barValText}>{item.adherenceRate}%</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.chartFooter}>
          <Text style={styles.chartFooterText}>
            Adherence threshold calculated against live protocol variances.
          </Text>
        </View>
      </View>

      {!isPro && (
        <View style={styles.lockOverlay}>
          <View style={styles.lockContent}>
            <View style={styles.lockIconContainer}>
              <Ionicons name="lock-closed" size={22} color="#818cf8" />
            </View>
            <Text style={styles.lockTitle}>HISTORICAL TELEMETRY LOCKED</Text>
            <Text style={styles.lockMessage}>
              7-day trend adherence telemetry is reserved for Pro Protocol tier subscribers.
            </Text>
            <TouchableOpacity style={styles.unlockButton} onPress={onUnlock} activeOpacity={0.8}>
              <Text style={styles.unlockButtonText}>UNLOCK 7-DAY TELEMETRY</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  chartWrapper: {
    position: "relative",
    marginHorizontal: 16,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#1e293b",
    backgroundColor: "#0f172a",
  },
  chartContainer: { padding: 16 },
  chartLegend: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#818cf8" },
  legendText: { fontSize: 11, fontWeight: "600", color: "#94a3b8" },
  adherenceAverage: { fontSize: 11, fontWeight: "700", color: "#10b981" },
  barsArea: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", height: 110, paddingVertical: 4 },
  barColumn: { alignItems: "center", flex: 1 },
  barTrack: {
    width: 14,
    height: 80,
    backgroundColor: "#020617",
    borderRadius: 6,
    justifyContent: "flex-end",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  barFill: { backgroundColor: "#818cf8", width: "100%", borderRadius: 6 },
  barDayText: { fontSize: 10, fontWeight: "700", color: "#94a3b8", marginTop: 6 },
  barValText: { fontSize: 9, fontWeight: "600", color: "#64748b", marginTop: 2 },
  chartFooter: { borderTopWidth: 1, borderTopColor: "#1e293b", paddingTop: 10, marginTop: 12 },
  chartFooterText: { fontSize: 10, color: "#64748b", textAlign: "center" },
  lockOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(2, 6, 23, 0.94)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  lockContent: { alignItems: "center", maxWidth: 280 },
  lockIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(129, 140, 248, 0.15)",
    borderWidth: 1,
    borderColor: "#818cf8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  lockTitle: { fontSize: 12, fontWeight: "800", color: "#f8fafc", letterSpacing: 0.8, marginBottom: 4, textAlign: "center" },
  lockMessage: { fontSize: 10, lineHeight: 15, color: "#94a3b8", textAlign: "center", marginBottom: 12 },
  unlockButton: { backgroundColor: "#818cf8", paddingVertical: 8, paddingHorizontal: 14, borderRadius: 6 },
  unlockButtonText: { color: "#020617", fontSize: 11, fontWeight: "800", letterSpacing: 0.5 },
});
