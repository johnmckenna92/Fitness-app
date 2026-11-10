import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SearchX, ServerCrash } from "lucide-react-native";
import { useTheme } from "../ctx/ThemeContext";

export interface EmptyStateProps {
  icon?: "SearchX" | "ServerCrash";
  title?: string;
  subtext?: string;
  onRetry?: () => void;
  buttonText?: string;
}

export function EmptyState({
  icon = "SearchX",
  title = "No Meals Found",
  subtext = "Pull down to refresh or check back soon.",
  onRetry,
  buttonText = "Try Again",
}: EmptyStateProps) {
  const { colors, isDark } = useTheme();

  const IconComponent = icon === "ServerCrash" ? ServerCrash : SearchX;
  const buttonTextColor = isDark ? colors.background : colors.text;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.iconWrapper, { backgroundColor: colors.surfaceSubtle }]}>
        <IconComponent size={44} color={colors.textMuted} strokeWidth={1.75} />
      </View>

      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.subtext, { color: colors.textMuted }]}>{subtext}</Text>

      {onRetry ? (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.tint || colors.primary }]}
          activeOpacity={0.8}
          onPress={onRetry}
        >
          <Text style={[styles.buttonText, { color: buttonTextColor }]}>
            {buttonText}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingVertical: 56,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  subtext: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 24,
    maxWidth: 280,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});
