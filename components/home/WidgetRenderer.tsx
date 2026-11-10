import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { UIWidgetConfig, useAppStore } from "../../store/useAppStore";
import CookingModeBanner from "./CookingModeBanner";
import MacrosWidget from "./MacrosWidget";
import MeetCoachWidget from "./MeetCoachWidget";
import NotesFromCoachWidget from "./NotesFromCoachWidget"; // <-- Add this exact line
import RecentMealsWidget from "./RecentMealsWidget";
import StepsRAGWidget from "./StepsRAGWidget";

const WIDGET_REGISTRY: Record<string, React.FC<any>> = {
  MacrosWidget,
  StepsRAGWidget,
  CookingModeBanner,
  RecentMealsWidget,
  MeetCoachWidget,
  NotesFromCoachWidget,
};

interface ErrorBoundaryProps {
  children: React.ReactNode;
  widgetId: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class WidgetErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    console.warn(
      `[WidgetErrorBoundary] Error in widget ${this.props.widgetId}:`,
      error,
    );
  }

  render() {
    if (this.state.hasError) {
      return (
        <View className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 my-2">
          <Text className="text-xs font-semibold text-red-500">
            Widget &quot;{this.props.widgetId}&quot; is temporarily unavailable.
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function WidgetRenderer() {
  const { homeLayout, trainerAddOns, isLoadingConfig } = useAppStore();

  if (isLoadingConfig && (!homeLayout || homeLayout.length === 0)) {
    return (
      <View style={styles.centerContainer}>
        <Text className="text-xs text-zinc-400 font-medium">
          Loading command center...
        </Text>
      </View>
    );
  }

  const sortedWidgets = (homeLayout || [])
    .filter((w: UIWidgetConfig) => w.visible)
    .sort((a: UIWidgetConfig, b: UIWidgetConfig) => a.order - b.order);

  return (
    <View style={styles.container}>
      {sortedWidgets.map((widget: UIWidgetConfig) => {
        // Modular License Gating
        if (
          widget.requiredAddon &&
          !trainerAddOns.includes(widget.requiredAddon)
        ) {
          return null;
        }

        const WidgetComponent = WIDGET_REGISTRY[widget.type];
        if (!WidgetComponent) {
          console.warn(`[WidgetRenderer] Unknown widget type: ${widget.type}`);
          return null;
        }

        return (
          <WidgetErrorBoundary key={widget.id} widgetId={widget.id}>
            <View style={styles.widgetWrapper}>
              <WidgetComponent {...(widget.props || {})} />
            </View>
          </WidgetErrorBoundary>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  widgetWrapper: {
    width: "100%",
  },
  centerContainer: {
    paddingVertical: 32,
    alignItems: "center",
  },
});
