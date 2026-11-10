import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme, ThemeMode } from "../../ctx/ThemeContext";

interface AppSettingsCardProps {
  unitSystem: "metric" | "imperial";
  onToggleUnitSystem: (system: "metric" | "imperial") => void;
}

export function AppSettingsCard({
  unitSystem,
  onToggleUnitSystem,
}: AppSettingsCardProps) {
  const { theme, setTheme, colors, isDark } = useTheme();

  const themeSegments: { id: ThemeMode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { id: "light", label: "Light", icon: "sunny-outline" },
    { id: "dark", label: "Dark", icon: "moon-outline" },
    { id: "system", label: "Auto", icon: "hardware-chip-outline" },
  ];

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <View style={styles.header}>
        <View style={styles.titleGroup}>
          <View style={[styles.iconCircle, { backgroundColor: isDark ? "rgba(74, 222, 128, 0.15)" : "rgba(74, 222, 128, 0.12)" }]}>
            <Ionicons name="settings-outline" size={18} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>App Settings</Text>
        </View>
      </View>

      <Text style={[styles.label, { color: colors.textSecondary }]}>INTERFACE THEME</Text>
      <View style={[styles.segmentedControl, { backgroundColor: isDark ? "#020617" : "#f1f5f9", borderColor: colors.borderSubtle }]}>
        {themeSegments.map((item) => {
          const isSelected = theme === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.segmentBtn,
                isSelected && [styles.segmentBtnActive, { backgroundColor: colors.card }],
              ]}
              onPress={() => setTheme(item.id)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={item.icon}
                size={15}
                color={isSelected ? colors.primary : colors.textSecondary}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.segmentText,
                  {
                    color: isSelected ? colors.primary : colors.textSecondary,
                    fontWeight: isSelected ? "700" : "500",
                  },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.divider} />

      <Text style={[styles.label, { color: colors.textSecondary }]}>MEASUREMENT UNITS</Text>
      <View style={[styles.segmentedControl, { backgroundColor: isDark ? "#020617" : "#f1f5f9", borderColor: colors.borderSubtle }]}>
        <TouchableOpacity
          style={[
            styles.segmentBtn,
            unitSystem === "metric" && [styles.segmentBtnActive, { backgroundColor: colors.card }],
          ]}
          onPress={() => onToggleUnitSystem("metric")}
          activeOpacity={0.8}
        >
          <Ionicons
            name="barbell-outline"
            size={15}
            color={unitSystem === "metric" ? colors.primary : colors.textSecondary}
            style={{ marginRight: 6 }}
          />
          <Text
            style={[
              styles.segmentText,
              {
                color: unitSystem === "metric" ? colors.primary : colors.textSecondary,
                fontWeight: unitSystem === "metric" ? "700" : "500",
              },
            ]}
          >
            Metric (kg, cm)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.segmentBtn,
            unitSystem === "imperial" && [styles.segmentBtnActive, { backgroundColor: colors.card }],
          ]}
          onPress={() => onToggleUnitSystem("imperial")}
          activeOpacity={0.8}
        >
          <Ionicons
            name="speedometer-outline"
            size={15}
            color={unitSystem === "imperial" ? colors.primary : colors.textSecondary}
            style={{ marginRight: 6 }}
          />
          <Text
            style={[
              styles.segmentText,
              {
                color: unitSystem === "imperial" ? colors.primary : colors.textSecondary,
                fontWeight: unitSystem === "imperial" ? "700" : "500",
              },
            ]}
          >
            Imperial (lbs, in)
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 24, borderWidth: 1, padding: 18, elevation: 3 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  titleGroup: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconCircle: { width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 16, fontWeight: "800", letterSpacing: -0.2 },
  label: { fontSize: 10, fontWeight: "800", letterSpacing: 0.6, marginBottom: 8 },
  segmentedControl: { flexDirection: "row", borderRadius: 14, borderWidth: 1, padding: 4, marginBottom: 6 },
  segmentBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 8, borderRadius: 10 },
  segmentBtnActive: { shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  segmentText: { fontSize: 13 },
  divider: { height: 1, backgroundColor: "rgba(148, 163, 184, 0.15)", marginVertical: 14 },
});
