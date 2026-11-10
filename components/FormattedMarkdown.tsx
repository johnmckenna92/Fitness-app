import React, { useMemo } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import Markdown from "react-native-markdown-display";
import { useTheme } from "../ctx/ThemeContext";

interface FormattedMarkdownProps {
  children: string;
  style?: ViewStyle;
}

export function FormattedMarkdown({ children, style }: FormattedMarkdownProps) {
  const { colors, isDark } = useTheme();

  const markdownStyles = useMemo(() => {
    return StyleSheet.create({
      body: {
        color: colors.text,
        fontSize: 15,
        lineHeight: 23,
      },
      heading1: {
        color: colors.primaryText,
        fontSize: 22,
        fontWeight: "800",
        marginTop: 18,
        marginBottom: 8,
        letterSpacing: -0.3,
      },
      heading2: {
        color: colors.primaryText,
        fontSize: 18,
        fontWeight: "700",
        marginTop: 16,
        marginBottom: 8,
        letterSpacing: -0.2,
      },
      heading3: {
        color: colors.primaryText,
        fontSize: 16,
        fontWeight: "700",
        marginTop: 14,
        marginBottom: 6,
      },
      paragraph: {
        color: colors.text,
        marginTop: 4,
        marginBottom: 8,
        lineHeight: 22,
      },
      text: {
        color: colors.text,
      },
      strong: {
        color: isDark ? "#ffffff" : "#0f172a",
        fontWeight: "800",
      },
      em: {
        color: colors.textSecondary,
        fontStyle: "italic",
      },
      bullet_list: {
        marginVertical: 4,
      },
      bullet_list_icon: {
        color: colors.primaryText,
        marginLeft: 4,
        marginRight: 8,
      },
      bullet_list_content: {
        flex: 1,
        color: colors.text,
      },
      ordered_list: {
        marginVertical: 4,
      },
      ordered_list_icon: {
        color: colors.primaryText,
        marginLeft: 4,
        marginRight: 8,
      },
      list_item: {
        flexDirection: "row",
        justifyContent: "flex-start",
        marginVertical: 3,
      },
      code_inline: {
        backgroundColor: colors.surfaceSubtle,
        color: colors.primaryText,
        borderWidth: 1,
        borderColor: colors.borderSubtle,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
        fontSize: 13,
      },
      code_block: {
        backgroundColor: colors.surfaceSubtle,
        borderColor: colors.cardBorder,
        borderWidth: 1,
        borderRadius: 10,
        padding: 12,
        color: colors.text,
        marginVertical: 8,
      },
      fence: {
        backgroundColor: colors.surfaceSubtle,
        borderColor: colors.cardBorder,
        borderWidth: 1,
        borderRadius: 10,
        padding: 12,
        color: colors.text,
        marginVertical: 8,
      },
      blockquote: {
        backgroundColor: colors.surfaceSubtle,
        borderLeftColor: colors.primary,
        borderLeftWidth: 4,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 4,
        marginVertical: 8,
      },
      hr: {
        backgroundColor: colors.borderSubtle,
        height: 1,
        marginVertical: 14,
      },
      table: {
        borderWidth: 1,
        borderColor: colors.borderSubtle,
        borderRadius: 8,
        marginVertical: 8,
        overflow: "hidden",
      },
      th: {
        backgroundColor: colors.surfaceSubtle,
        padding: 8,
        color: colors.primaryText,
        fontWeight: "bold",
      },
      td: {
        padding: 8,
        borderColor: colors.borderSubtle,
        color: colors.text,
      },
      link: {
        color: colors.primaryText,
        textDecorationLine: "underline",
      },
    });
  }, [colors, isDark]);

  if (!children || typeof children !== "string") {
    return null;
  }

  return (
    <View style={style}>
      <Markdown style={markdownStyles}>{children}</Markdown>
    </View>
  );
}
