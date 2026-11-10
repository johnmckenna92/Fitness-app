import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../lib/supabase";
import { fetchLiveWearableData, WearableSyncResult } from "./wearableSync";

export type StepsRAGStatus = "red" | "amber" | "green";

const LOCAL_STEPS_STORAGE_KEY = "@kineticlab_local_steps_cache";

/**
 * Evaluates raw steps on-device against target.
 * KineticLab Zero-Medical Compliance: Raw values are NEVER sent to the cloud.
 * Target default: Green >= 10,000 (or target), Amber >= 5,000 (50%), Red < 5,000.
 * Time-Decay Logic: If current device time is past 20:00 (8:00 PM) and steps < 80% of target,
 * status must evaluate as 'red', overriding standard thresholds.
 */
export function calculateStepsRAG(steps: number, target: number = 10000): StepsRAGStatus {
  const safeTarget = target > 0 ? target : 10000;

  // Time-decay modifier: past 20:00 (8:00 PM) and steps < 80% of target => 'red'
  const currentHour = new Date().getHours();
  if (currentHour >= 20 && steps < safeTarget * 0.8) {
    return "red";
  }

  if (steps >= safeTarget) {
    return "green";
  }
  if (steps >= safeTarget * 0.5) {
    return "amber";
  }
  return "red";
}

/**
 * Local device extraction utility.
 * In production builds on iOS/Android, this hooks into native HealthKit or Health Connect.
 * If HealthKit/Google Fit permissions fail or return null, default strictly to 0.
 * Strictly zero mock data.
 */
export async function getLocalDeviceSteps(): Promise<{ steps: number; calories: number; error?: string }> {
  try {
    const liveData: WearableSyncResult = await fetchLiveWearableData();

    // Cache locally on device strictly for offline / fast read
    if (liveData.steps > 0) {
      const todayStr = new Date().toISOString().split("T")[0];
      await AsyncStorage.setItem(`${LOCAL_STEPS_STORAGE_KEY}_${todayStr}`, liveData.steps.toString());
    }

    return {
      steps: liveData.steps || 0,
      calories: liveData.calories || 0,
      error: liveData.error,
    };
  } catch (err: any) {
    console.warn("[HealthSync] Failed to read wearable steps:", err);
    return {
      steps: 0,
      calories: 0,
      error: err?.message || "Failed to read device health data",
    };
  }
}

/**
 * Records or simulates locally updated steps on device.
 * Stores strictly on device storage.
 */
export async function setLocalDeviceSteps(steps: number): Promise<void> {
  const todayStr = new Date().toISOString().split("T")[0];
  await AsyncStorage.setItem(`${LOCAL_STEPS_STORAGE_KEY}_${todayStr}`, Math.max(0, steps).toString());
}

/**
 * Zero-Medical-Data Health Sync.
 * 1. Reads steps from device storage / wearable.
 * 2. Computes RAG status locally on device.
 * 3. Syncs ONLY the abstract string RAG status ('red' | 'amber' | 'green') to Supabase.
 * 4. Raw step counts or calories are NEVER sent to the cloud.
 */
export async function syncHealthRAGToCloud(
  userId: string,
  targetSteps: number = 10000
): Promise<{ rag: StepsRAGStatus; steps: number; error?: string }> {
  const { steps: localSteps, error: syncError } = await getLocalDeviceSteps();
  const ragStatus = calculateStepsRAG(localSteps, targetSteps);
  const todayDate = new Date().toISOString().split("T")[0];

  try {
    const { error: cloudError } = await supabase.from("client_health_metrics").upsert(
      {
        user_id: userId,
        date: todayDate,
        steps_rag: ragStatus,
        synced_at: new Date().toISOString(),
      },
      { onConflict: "user_id,date" }
    );

    if (cloudError) {
      console.warn("[HealthSync] Cloud RAG sync warning:", cloudError.message);
    }
  } catch (err) {
    console.error("[HealthSync] Failed to sync RAG status:", err);
  }

  return { rag: ragStatus, steps: localSteps, error: syncError };
}


