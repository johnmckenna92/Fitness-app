import { Platform } from "react-native";

export interface WearableSyncResult {
  steps: number;
  calories: number;
  error?: string;
}

/**
 * Requests permissions and fetches today's live steps and active calories.
 * Zero mock data: defaults strictly to 0 on null/failure.
 */
export async function fetchLiveWearableData(): Promise<WearableSyncResult> {
  if (Platform.OS === "ios") {
    return fetchAppleHealthData();
  }
  if (Platform.OS === "android") {
    return fetchHealthConnectData();
  }
  return { steps: 0, calories: 0, error: "Wearable sync not supported on this platform." };
}

async function fetchAppleHealthData(): Promise<WearableSyncResult> {
  return new Promise<WearableSyncResult>((resolve) => {
    let AppleHealthKit: any;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      AppleHealthKit = require("react-native-health").default || require("react-native-health");
    } catch (err: any) {
      return resolve({
        steps: 0,
        calories: 0,
        error: "HealthKit module unavailable: " + (err?.message || "Not installed"),
      });
    }

    if (!AppleHealthKit || typeof AppleHealthKit.initHealthKit !== "function") {
      return resolve({ steps: 0, calories: 0, error: "HealthKit unavailable." });
    }

    const permissions = {
      permissions: {
        read: [
          AppleHealthKit.Constants?.Permissions?.StepCount || "Steps",
          AppleHealthKit.Constants?.Permissions?.ActiveEnergyBurned || "ActiveEnergyBurned",
        ],
        write: [],
      },
    };

    AppleHealthKit.initHealthKit(permissions, (initErr: string | null) => {
      if (initErr) {
        return resolve({ steps: 0, calories: 0, error: `HealthKit permission error: ${initErr}` });
      }

      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

      AppleHealthKit.getStepCount({ date: startOfDay.toISOString(), includeManuallyAdded: true }, (stepErr: string | null, res: any) => {
        const rawSteps = stepErr || !res || typeof res.value !== "number" ? 0 : res.value;
        const steps = Math.max(0, Math.round(rawSteps));

        AppleHealthKit.getActiveEnergyBurned({ startDate: startOfDay.toISOString(), endDate: now.toISOString() }, (calsErr: string | null, calsRes: any) => {
          let calories = 0;
          if (!calsErr && Array.isArray(calsRes)) {
            calories = calsRes.reduce((sum: number, it: any) => sum + (typeof it?.value === "number" ? it.value : 0), 0);
          } else if (!calsErr && calsRes && typeof calsRes.value === "number") {
            calories = calsRes.value;
          }

          resolve({
            steps,
            calories: Math.max(0, Math.round(calories)),
            error: stepErr || calsErr ? `HealthKit read error: ${stepErr || calsErr}` : undefined,
          });
        });
      });
    });
  });
}

async function fetchHealthConnectData(): Promise<WearableSyncResult> {
  try {
    let healthConnect: any;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      healthConnect = require("react-native-health-connect");
    } catch (err: any) {
      return { steps: 0, calories: 0, error: "Health Connect unavailable: " + (err?.message || "Not installed") };
    }

    const { initialize, requestPermission, readRecords } = healthConnect;
    if (!initialize || !requestPermission || !readRecords) {
      return { steps: 0, calories: 0, error: "Health Connect APIs unavailable." };
    }

    const isInitialized = await initialize();
    if (!isInitialized) {
      return { steps: 0, calories: 0, error: "Failed to initialize Health Connect." };
    }

    const granted = await requestPermission([
      { accessType: "read", recordType: "Steps" },
      { accessType: "read", recordType: "ActiveCaloriesBurned" },
    ]);

    if (!granted || (Array.isArray(granted) && granted.length === 0)) {
      return { steps: 0, calories: 0, error: "Health Connect permissions denied." };
    }

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const timeRangeFilter = {
      operator: "between" as const,
      startTime: startOfDay.toISOString(),
      endTime: now.toISOString(),
    };

    let steps = 0;
    try {
      const res = await readRecords("Steps", { timeRangeFilter });
      const records = res?.records || res?.result || [];
      if (Array.isArray(records)) {
        steps = records.reduce((acc: number, it: any) => acc + (typeof it?.count === "number" ? it.count : 0), 0);
      }
    } catch (e: any) {
      console.warn("[wearableSync] Steps read error:", e);
    }

    let calories = 0;
    try {
      const res = await readRecords("ActiveCaloriesBurned", { timeRangeFilter });
      const records = res?.records || res?.result || [];
      if (Array.isArray(records)) {
        calories = records.reduce((acc: number, it: any) => {
          const kcal = typeof it?.energy?.inKilocalories === "number"
            ? it.energy.inKilocalories
            : typeof it?.energy?.inCalories === "number"
            ? it.energy.inCalories / 1000
            : 0;
          return acc + kcal;
        }, 0);
      }
    } catch (e: any) {
      console.warn("[wearableSync] Calories read error:", e);
    }

    return {
      steps: Math.max(0, Math.round(steps)),
      calories: Math.max(0, Math.round(calories)),
    };
  } catch (err: any) {
    return { steps: 0, calories: 0, error: err?.message || "Health Connect sync failed." };
  }
}
