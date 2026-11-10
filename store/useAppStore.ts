import { create } from "zustand";
import { AppState as RNAppState, AppStateStatus } from "react-native";
import { supabase } from "../lib/supabase";
import { StepsRAGStatus, syncHealthRAGToCloud } from "../utils/healthSync";

export interface UIWidgetConfig {
  id: string;
  type: "MacrosWidget" | "StepsRAGWidget" | "CookingModeBanner" | "RecentMealsWidget";
  order: number;
  visible: boolean;
  props: Record<string, any>;
  requiredAddon?: string;
}

export const DEFAULT_HOME_LAYOUT: UIWidgetConfig[] = [
  {
    id: "macros_summary",
    type: "MacrosWidget",
    order: 0,
    visible: true,
    props: { showRemaining: true },
  },
  {
    id: "steps_rag_card",
    type: "StepsRAGWidget",
    order: 1,
    visible: true,
    props: { colorScheme: "traffic" },
  },
  {
    id: "cooking_mode_banner",
    type: "CookingModeBanner",
    order: 2,
    visible: true,
    props: {},
    requiredAddon: "cooking_mode",
  },
  {
    id: "recent_meals",
    type: "RecentMealsWidget",
    order: 3,
    visible: true,
    props: { maxItems: 4 },
  },
];

interface AppState {
  homeLayout: UIWidgetConfig[];
  trainerAddOns: string[];
  stepsRAG: StepsRAGStatus | null;
  localSteps: number;
  isLoadingConfig: boolean;
  isSyncingHealth: boolean;
  healthSyncError: string | null;
  error: string | null;
  currentTrainerId: string | null;

  fetchDynamicConfig: (trainerId?: string | null) => Promise<void>;
  syncHealth: (userId: string, targetSteps?: number) => Promise<void>;
  setLocalSteps: (steps: number) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  homeLayout: DEFAULT_HOME_LAYOUT,
  trainerAddOns: [],
  stepsRAG: null,
  localSteps: 0,
  isLoadingConfig: false,
  isSyncingHealth: false,
  healthSyncError: null,
  error: null,
  currentTrainerId: null,

  fetchDynamicConfig: async (trainerId?: string | null) => {
    const effectiveTrainerId = trainerId !== undefined ? (trainerId ?? null) : get().currentTrainerId;
    set({ currentTrainerId: effectiveTrainerId, isLoadingConfig: true, error: null });

    // If client has no trainer assigned, use the default layout immediately
    if (!effectiveTrainerId) {
      set({
        homeLayout: DEFAULT_HOME_LAYOUT,
        trainerAddOns: [],
        isLoadingConfig: false,
      });
      return;
    }

    try {
      // 1. Fetch trainer UI layout config
      const { data: configData, error: configError } = await supabase
        .from("trainer_ui_configs")
        .select("home_layout")
        .eq("trainer_id", effectiveTrainerId)
        .maybeSingle();

      if (configError) throw configError;

      // 2. Fetch trainer license add-ons
      const { data: licenseData, error: licenseError } = await supabase
        .from("trainer_licenses")
        .select("add_ons")
        .eq("trainer_id", effectiveTrainerId)
        .maybeSingle();

      if (licenseError) throw licenseError;

      // Parse and order layout
      let parsedLayout: UIWidgetConfig[] = DEFAULT_HOME_LAYOUT;
      if (configData?.home_layout && Array.isArray(configData.home_layout) && configData.home_layout.length > 0) {
        parsedLayout = (configData.home_layout as unknown as UIWidgetConfig[])
          .slice()
          .sort((a, b) => a.order - b.order);
      }

      const addOns = Array.isArray(licenseData?.add_ons)
        ? (licenseData.add_ons as unknown as string[])
        : [];

      set({
        homeLayout: parsedLayout,
        trainerAddOns: addOns,
        isLoadingConfig: false,
      });
    } catch (err: any) {
      console.warn("[useAppStore] Config sync fallback to default:", err?.message);
      set({
        homeLayout: DEFAULT_HOME_LAYOUT,
        trainerAddOns: [],
        error: err?.message ?? "Failed to load custom trainer dashboard config",
        isLoadingConfig: false,
      });
    }
  },

  syncHealth: async (userId: string, targetSteps: number = 10000) => {
    set({ isSyncingHealth: true, healthSyncError: null });
    try {
      const { rag, steps, error } = await syncHealthRAGToCloud(userId, targetSteps);
      set({
        stepsRAG: rag,
        localSteps: steps,
        isSyncingHealth: false,
        healthSyncError: error ?? null,
      });
    } catch (err: any) {
      console.error("[useAppStore] Health sync error:", err);
      set({
        isSyncingHealth: false,
        healthSyncError: err?.message || "Health sync failed",
      });
    }
  },

  setLocalSteps: (steps: number) => {
    set({ localSteps: steps });
  },
}));

// Automatically trigger fetchDynamicConfig when app returns to active foreground
if (typeof RNAppState !== "undefined" && RNAppState.addEventListener) {
  RNAppState.addEventListener("change", (nextAppState: AppStateStatus) => {
    if (nextAppState === "active") {
      const state = useAppStore.getState();
      state.fetchDynamicConfig(state.currentTrainerId);
    }
  });
}

