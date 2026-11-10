import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../ctx/ThemeContext";

interface PersonalDetailsCardProps {
  avatarUrl: string | null;
  isProUser: boolean;
  isUpdatingAvatar: boolean;
  onEditAvatar: () => void;
  fullName: string;
  onFullNameChange: (val: string) => void;
  email: string;
  age: string;
  onAgeChange: (val: string) => void;
  sex: string;
  onSexChange: (val: string) => void;
  height: string;
  onHeightChange: (val: string) => void;
  weight: string;
  onWeightChange: (val: string) => void;
  activityLevel: string;
  onOpenActivitySelector: () => void;
  unitSystem?: "metric" | "imperial";
}

export function PersonalDetailsCard({
  avatarUrl,
  isProUser,
  isUpdatingAvatar,
  onEditAvatar,
  fullName,
  onFullNameChange,
  email,
  age,
  onAgeChange,
  sex,
  onSexChange,
  height,
  onHeightChange,
  weight,
  onWeightChange,
  activityLevel,
  onOpenActivitySelector,
  unitSystem = "metric",
}: PersonalDetailsCardProps) {
  const { colors, isDark } = useTheme();

  const formatActivity = (lvl?: string | null) => {
    if (!lvl) return "Sedentary";
    const map: Record<string, string> = {
      sedentary: "Sedentary",
      light: "Light",
      active: "Moderate",
      athlete: "Very Active",
      extra_active: "Extra Active",
    };
    return map[lvl.toLowerCase()] || lvl;
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <View style={[styles.iconCircle, { backgroundColor: isDark ? "rgba(74, 222, 128, 0.15)" : "rgba(74, 222, 128, 0.12)" }]}>
            <Ionicons name="person-outline" size={18} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Personal Details & Biometrics</Text>
        </View>

        <View style={[styles.tierPill, { backgroundColor: isProUser ? (isDark ? "rgba(74, 222, 128, 0.15)" : "rgba(74, 222, 128, 0.12)") : (isDark ? "#1e293b" : "#f1f5f9"), borderColor: isProUser ? colors.primary : colors.borderSubtle }]}>
          <Ionicons name={isProUser ? "star" : "shield-checkmark-outline"} size={11} color={isProUser ? colors.primary : colors.textSecondary} style={{ marginRight: 4 }} />
          <Text style={[styles.tierPillText, { color: isProUser ? colors.primary : colors.textSecondary }]}>{isProUser ? "PRO" : "FREE"}</Text>
        </View>
      </View>

      <View style={styles.identityRow}>
        <View style={styles.avatarWrapper}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} contentFit="cover" cachePolicy="memory-disk" transition={200} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: isDark ? "#1e293b" : "#e2e8f0" }]}>
              <Ionicons name="person" size={32} color={colors.textSecondary} />
            </View>
          )}
          <TouchableOpacity style={[styles.avatarBadge, { backgroundColor: colors.primary, borderColor: colors.card }]} onPress={onEditAvatar} disabled={isUpdatingAvatar} activeOpacity={0.8}>
            {isUpdatingAvatar ? <ActivityIndicator size="small" color="#ffffff" /> : <Ionicons name="camera" size={12} color="#ffffff" />}
          </TouchableOpacity>
        </View>

        <View style={styles.identityDetails}>
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>DISPLAY NAME</Text>
          <TextInput
            style={[styles.input, { backgroundColor: isDark ? "#18181b" : "#f4f4f5", borderColor: isDark ? "#27272a" : "#e4e4e7", color: colors.text }]}
            value={fullName}
            onChangeText={onFullNameChange}
            placeholder="Your name"
            placeholderTextColor={colors.textMuted}
          />
          <Text style={[styles.emailText, { color: colors.textMuted }]} numberOfLines={1}>{email}</Text>
        </View>
      </View>
      <View style={styles.divider} />

      <View style={styles.rowInputs}>
        <View style={styles.inputCol}>
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
            WEIGHT ({unitSystem === "imperial" ? "LBS" : "KG"})
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: isDark ? "#18181b" : "#f4f4f5", borderColor: isDark ? "#27272a" : "#e4e4e7", color: colors.text }]}
            value={weight}
            onChangeText={onWeightChange}
            keyboardType="numeric"
            placeholder={unitSystem === "imperial" ? "165" : "75"}
            placeholderTextColor={colors.textMuted}
          />
        </View>
        <View style={styles.inputCol}>
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
            HEIGHT ({unitSystem === "imperial" ? "INCHES" : "CM"})
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: isDark ? "#18181b" : "#f4f4f5", borderColor: isDark ? "#27272a" : "#e4e4e7", color: colors.text }]}
            value={height}
            onChangeText={onHeightChange}
            keyboardType="numeric"
            placeholder={unitSystem === "imperial" ? "69" : "175"}
            placeholderTextColor={colors.textMuted}
          />
        </View>
      </View>

      <View style={[styles.rowInputs, { marginTop: 10 }]}>
        <View style={{ width: 85 }}>
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>AGE</Text>
          <TextInput
            style={[styles.input, { backgroundColor: isDark ? "#18181b" : "#f4f4f5", borderColor: isDark ? "#27272a" : "#e4e4e7", color: colors.text }]}
            value={age}
            onChangeText={onAgeChange}
            keyboardType="numeric"
            placeholder="28"
            placeholderTextColor={colors.textMuted}
          />
        </View>
        <View style={styles.inputCol}>
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>SEX / GENDER</Text>
          <View style={[styles.genderRow, { backgroundColor: isDark ? "#020617" : "#f8fafc", borderColor: colors.borderSubtle }]}>
            {(["male", "female", "other"] as const).map((opt) => {
              const isSelected = (sex || "").toLowerCase() === opt;
              const label = opt === "male" ? "Male" : opt === "female" ? "Female" : "Other";
              return (
                <TouchableOpacity
                  key={opt}
                  style={[
                    styles.genderBtn,
                    isSelected && [styles.genderBtnActive, { backgroundColor: isDark ? "#1e293b" : "#ffffff" }],
                  ]}
                  onPress={() => onSexChange(opt)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.genderBtnText,
                      {
                        color: isSelected ? colors.primary : colors.textSecondary,
                        fontWeight: isSelected ? "700" : "500",
                      },
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      <View style={styles.activitySection}>
        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>ACTIVITY LEVEL</Text>
        <TouchableOpacity
          style={[styles.activitySelectorBtn, { backgroundColor: isDark ? "rgba(74, 222, 128, 0.08)" : "rgba(74, 222, 128, 0.06)", borderColor: colors.primary }]}
          onPress={onOpenActivitySelector}
          activeOpacity={0.7}
        >
          <View style={styles.activityInfo}>
            <Ionicons name="flash-outline" size={16} color={colors.primaryText} />
            <Text style={[styles.activityValue, { color: colors.text }]}>{formatActivity(activityLevel)}</Text>
          </View>
          <View style={styles.changeBadge}>
            <Text style={[styles.changeText, { color: colors.primaryText }]}>Change</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.primaryText} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 24, borderWidth: 1, padding: 18, elevation: 3 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  titleGroup: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  iconCircle: { width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 16, fontWeight: "800", letterSpacing: -0.2, flexShrink: 1 },
  tierPill: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  tierPillText: { fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  identityRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  avatarWrapper: { position: "relative" },
  avatarImage: { width: 68, height: 68, borderRadius: 34 },
  avatarPlaceholder: { width: 68, height: 68, borderRadius: 34, justifyContent: "center", alignItems: "center" },
  avatarBadge: { position: "absolute", bottom: -2, right: -2, width: 24, height: 24, borderRadius: 12, borderWidth: 2, justifyContent: "center", alignItems: "center" },
  identityDetails: { flex: 1 },
  inputLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 0.6, marginBottom: 5 },
  input: { height: 40, borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, fontSize: 14, fontWeight: "600" },
  emailText: { fontSize: 11, marginTop: 4, fontWeight: "500" },
  divider: { height: 1, backgroundColor: "rgba(148, 163, 184, 0.15)", marginVertical: 14 },
  rowInputs: { flexDirection: "row", gap: 10 },
  inputCol: { flex: 1 },
  activitySection: { marginTop: 12 },
  activitySelectorBtn: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 11, borderRadius: 14, borderWidth: 1.5 },
  activityInfo: { flexDirection: "row", alignItems: "center", gap: 8 },
  activityValue: { fontSize: 14, fontWeight: "700" },
  changeBadge: { flexDirection: "row", alignItems: "center", gap: 2 },
  changeText: { fontSize: 12, fontWeight: "700" },
  genderRow: { flexDirection: "row", borderRadius: 12, borderWidth: 1, padding: 3, height: 40, alignItems: "center" },
  genderBtn: { flex: 1, height: "100%", justifyContent: "center", alignItems: "center", borderRadius: 9 },
  genderBtnActive: { shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 },
  genderBtnText: { fontSize: 12 },
});
