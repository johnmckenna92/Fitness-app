import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useAuth } from "../ctx/AuthContext";
import { useTheme } from "../ctx/ThemeContext";
import { fixMyMeal } from "../lib/gemini";
import { FormattedMarkdown } from "../components/FormattedMarkdown";

const SAMPLE_MEALS = [
  "2 slices pepperoni pizza & cola",
  "Double cheeseburger and large fries",
  "Creamy chicken & bacon pasta",
  "Cheese & ham toastie with crisps",
];

export default function FixMealScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile, isPro } = useAuth();
  const { colors } = useTheme();
  const scrollViewRef = useRef<React.ElementRef<typeof ScrollView>>(null);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const isProUser = Boolean(
    isPro || profile?.is_pro || profile?.subscription_status === "pro",
  );

  const handleSelectSample = (sample: string) => {
    setInput(sample);
  };

  const handleClear = () => {
    setInput("");
    setResult(null);
  };

  const handleSubmit = async () => {
    Keyboard.dismiss();

    if (!isProUser) {
      Toast.show({
        type: "info",
        text1: "Pro Feature",
        text2: "Upgrade to Pro to unlock AI Meal Re-engineering.",
      });
      router.push("/pricing");
      return;
    }

    const trimmed = input.trim();
    if (!trimmed) {
      Toast.show({
        type: "error",
        text1: "Input Required",
        text2: "Please enter a meal idea you'd like to fix.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fixMyMeal(trimmed);
      setResult(response);
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: 240, animated: true });
      }, 150);
    } catch (err: any) {
      console.error("Fix meal error:", err);
      Toast.show({
        type: "error",
        text1: "Failed to Fix Meal",
        text2: err?.message || "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.keyboardContainer, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 0}
    >
      <ScrollView
        ref={scrollViewRef}
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: Math.max(insets.bottom + 24, 40) },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header Hero */}
        <View style={styles.headerSection}>
          <View style={styles.titleRow}>
            <View style={[styles.iconBadge, { backgroundColor: colors.surfaceSubtle, borderColor: colors.cardBorder }]}>
              <Ionicons name="restaurant" size={20} color={colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Fix My Meal</Text>
            {isProUser ? (
              <View style={[styles.proActivePill, { backgroundColor: colors.surfaceSubtle, borderColor: colors.primary }]}>
                <Text style={[styles.proActivePillText, { color: colors.primaryText }]}>PRO</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.proLockedPill}
                onPress={() => router.push("/pricing")}
                activeOpacity={0.7}
              >
                <Ionicons name="lock-closed" size={12} color="#f59e0b" />
                <Text style={styles.proLockedPillText}>PRO ONLY</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Craving something high-calorie? Re-engineer it for maximum protein,
            ideal macros, and under 20 mins prep.
          </Text>
        </View>

        {/* Input Card */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="fast-food-outline" size={18} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>What do you want to eat?</Text>
          </View>

          {/* Quick suggestions */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipsScroll}
            contentContainerStyle={styles.chipsContainer}
          >
            {SAMPLE_MEALS.map((sample, idx) => {
              const isSelected = input === sample;
              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.surfaceSubtle,
                      borderColor: isSelected ? colors.primary : colors.borderSubtle,
                    },
                  ]}
                  onPress={() => handleSelectSample(sample)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: isSelected ? "#ffffff" : colors.textSecondary },
                    ]}
                  >
                    {sample}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Multiline TextInput */}
          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: colors.inputBg,
                borderColor: colors.inputBorder,
              },
            ]}
          >
            <TextInput
              style={[styles.textInput, { color: colors.text }]}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholder="e.g. 2 slices of pepperoni pizza with garlic dip and a sugary soda..."
              placeholderTextColor={colors.textMuted}
              value={input}
              onChangeText={setInput}
              editable={!isLoading}
              maxLength={500}
            />
            {input.length > 0 && !isLoading && (
              <TouchableOpacity
                style={styles.inputClearButton}
                onPress={() => setInput("")}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close-circle" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Submit / Pro-Gated Button */}
          {isProUser ? (
            <TouchableOpacity
              style={[
                styles.submitButton,
                { backgroundColor: colors.primary },
                (isLoading || input.trim().length === 0) &&
                  styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isLoading || input.trim().length === 0}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <>
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text style={[styles.submitButtonText, { color: "#ffffff" }]}>
                    Re-Engineering Meal...
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons name="restaurant" size={18} color="#ffffff" />
                  <Text style={[styles.submitButtonText, { color: "#ffffff" }]}>Fix My Meal</Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.proGateButton}
              onPress={handleSubmit}
              activeOpacity={0.85}
            >
              <View style={styles.proGateIconCircle}>
                <Ionicons name="lock-closed" size={16} color="#020617" />
              </View>
              <Text style={styles.proGateButtonText}>
                Unlock with Pro to Fix Meal
              </Text>
            </TouchableOpacity>
          )}

          {!isProUser && (
            <View style={styles.proHintRow}>
              <Ionicons
                name="information-circle-outline"
                size={14}
                color={colors.textMuted}
              />
              <Text style={[styles.proHintText, { color: colors.textMuted }]}>
                Pro unlocks unlimited AI Sports Nutritionist fixes.
              </Text>
            </View>
          )}
        </View>

        {/* Loading Indicator */}
        {isLoading && (
          <View style={[styles.loadingCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingTitle, { color: colors.text }]}>Re-engineering Your Meal</Text>
            <Text style={[styles.loadingSubtitle, { color: colors.textSecondary }]}>
              Maximizing protein & dialing in macros under 20 mins prep...
            </Text>
          </View>
        )}

        {/* Results Card */}
        {result && !isLoading && (
          <View style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.resultHeader}>
              <View style={styles.resultTitleGroup}>
                <View style={[styles.resultIconCircle, { backgroundColor: colors.surfaceSubtle }]}>
                  <Ionicons name="checkmark-done" size={16} color={colors.primary} />
                </View>
                <Text style={[styles.resultTitle, { color: colors.text }]}>Nutritionist Breakdown</Text>
              </View>
              <TouchableOpacity
                onPress={handleClear}
                style={[styles.resetButton, { backgroundColor: colors.surfaceSubtle, borderColor: colors.borderSubtle }]}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={16} color={colors.destructive} />
                <Text style={[styles.resetButtonText, { color: colors.destructive }]}>Reset</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.markdownWrapper}>
              <FormattedMarkdown>{result}</FormattedMarkdown>
            </View>

            <TouchableOpacity
              style={[
                styles.actionAgainButton,
                {
                  backgroundColor: colors.surfaceSubtle,
                  borderColor: colors.cardBorder,
                },
              ]}
              onPress={() => {
                setInput("");
                setResult(null);
                scrollViewRef.current?.scrollTo({ y: 0, animated: true });
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="refresh" size={16} color={colors.primaryText} />
              <Text style={[styles.actionAgainButtonText, { color: colors.primaryText }]}>Fix Another Meal</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: "#020617",
  },
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  headerSection: {
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#1e1b4b",
    borderWidth: 1,
    borderColor: "#4338ca",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: "#f8fafc",
    fontSize: 24,
    fontWeight: "bold",
  },
  proActivePill: {
    backgroundColor: "rgba(74, 222, 128, 0.15)",
    borderColor: "#4ade80",
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  proActivePillText: {
    color: "#4ade80",
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  proLockedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#451a03",
    borderColor: "#f59e0b",
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  proLockedPillText: {
    color: "#f59e0b",
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  card: {
    backgroundColor: "#0f172a",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
    padding: 16,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "600",
  },
  chipsScroll: {
    marginBottom: 14,
  },
  chipsContainer: {
    gap: 8,
  },
  chip: {
    backgroundColor: "#1e293b",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#334155",
  },
  chipActive: {
    backgroundColor: "rgba(74, 222, 128, 0.15)",
    borderColor: "#4ade80",
  },
  chipText: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "500",
  },
  chipTextActive: {
    color: "#4ade80",
  },
  inputWrapper: {
    position: "relative",
    marginBottom: 16,
  },
  textInput: {
    backgroundColor: "#0a0a0a",
    color: "#f8fafc",
    borderWidth: 1,
    borderColor: "#404040",
    borderRadius: 12,
    padding: 14,
    paddingRight: 36,
    fontSize: 15,
    minHeight: 110,
    lineHeight: 22,
  },
  inputClearButton: {
    position: "absolute",
    right: 12,
    top: 12,
  },
  submitButton: {
    flexDirection: "row",
    backgroundColor: "#4ade80",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: "#0a0a0a",
    fontSize: 16,
    fontWeight: "bold",
  },
  proGateButton: {
    flexDirection: "row",
    backgroundColor: "#f59e0b",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  proGateIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(2, 6, 23, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  proGateButtonText: {
    color: "#020617",
    fontSize: 15,
    fontWeight: "bold",
  },
  proHintRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    justifyContent: "center",
  },
  proHintText: {
    color: "#94a3b8",
    fontSize: 12,
  },
  loadingCard: {
    backgroundColor: "#0f172a",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  loadingTitle: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 14,
  },
  loadingSubtitle: {
    color: "#94a3b8",
    fontSize: 13,
    marginTop: 4,
    textAlign: "center",
    lineHeight: 18,
  },
  resultCard: {
    backgroundColor: "#0f172a",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
    padding: 18,
    marginBottom: 24,
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
    paddingBottom: 12,
    marginBottom: 14,
  },
  resultTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  resultIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#1e1b4b",
    borderWidth: 1,
    borderColor: "#4338ca",
    alignItems: "center",
    justifyContent: "center",
  },
  resultTitle: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "bold",
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: "#1e293b",
  },
  resetButtonText: {
    color: "#94a3b8",
    fontSize: 12,
  },
  markdownWrapper: {
    marginTop: 4,
  },
  actionAgainButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 18,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#4ade80",
    borderRadius: 10,
    backgroundColor: "rgba(74, 222, 128, 0.12)",
  },
  actionAgainButtonText: {
    color: "#4ade80",
    fontSize: 14,
    fontWeight: "600",
  },
});

