import AsyncStorage from "@react-native-async-storage/async-storage";
import { SUBSCRIPTION_TIERS, SubscriptionTier, getTierLimits } from "../constants/subscriptions";
import { supabase } from "../lib/supabase";

export interface SwipeLimitStatus {
  allowed: boolean;
  swipesToday: number;
  limit: number;
  remaining: number;
  tier: SubscriptionTier;
}

export function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

export async function getDailySwipeStatus(
  userId: string | null | undefined,
  currentTier?: SubscriptionTier | string | null,
  trainerId?: string | null
): Promise<SwipeLimitStatus> {
  let isTrainerLinked = Boolean(trainerId);
  let resolvedTier = (currentTier || "free").toLowerCase() as SubscriptionTier;

  let swipesToday = 0;
  let lastSwipeDate: string | null = null;
  const today = getTodayDateString();

  if (userId) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("swipes_today, last_swipe_date, trainer_id, subscription_status")
        .eq("id", userId)
        .single();

      if (!error && data) {
        lastSwipeDate = data.last_swipe_date || null;
        swipesToday = lastSwipeDate === today ? (data.swipes_today || 0) : 0;
        if (data.trainer_id) {
          isTrainerLinked = true;
        }
        if (!currentTier && data.subscription_status) {
          resolvedTier = data.subscription_status.toLowerCase() as SubscriptionTier;
        }
      } else {
        // Fallback to AsyncStorage if database field missing or offline
        const localKey = `@daily_swipes_${userId}_${today}`;
        const raw = await AsyncStorage.getItem(localKey);
        swipesToday = raw ? parseInt(raw, 10) : 0;
      }
    } catch {
      const localKey = `@daily_swipes_${userId}_${today}`;
      const raw = await AsyncStorage.getItem(localKey);
      swipesToday = raw ? parseInt(raw, 10) : 0;
    }
  }

  // Trainer-linked clients inherit at least Pro tier limit
  const tier: SubscriptionTier = isTrainerLinked && resolvedTier !== "athlete" ? "pro" : resolvedTier;
  const tierConfig = getTierLimits(tier);
  const limit = tierConfig.maxCatalogSwipesDaily;

  // Free tier has 0 catalog swipes allowed (only 10 onboarding swipes)
  if (limit === 0) {
    return {
      allowed: false,
      swipesToday: 0,
      limit: 0,
      remaining: 0,
      tier,
    };
  }

  const remaining = Math.max(0, limit - swipesToday);
  const allowed = swipesToday < limit;

  return {
    allowed,
    swipesToday,
    limit,
    remaining,
    tier,
  };
}

export async function recordDailySwipe(
  userId: string | null | undefined,
  currentTier?: SubscriptionTier | string | null,
  trainerId?: string | null
): Promise<SwipeLimitStatus> {
  const currentStatus = await getDailySwipeStatus(userId, currentTier, trainerId);
  if (!currentStatus.allowed) {
    return currentStatus;
  }

  const today = getTodayDateString();
  const newSwipesToday = currentStatus.swipesToday + 1;
  const remaining = Math.max(0, currentStatus.limit - newSwipesToday);
  const allowed = newSwipesToday < currentStatus.limit;

  if (userId) {
    try {
      await supabase
        .from("profiles")
        .update({
          swipes_today: newSwipesToday,
          last_swipe_date: today,
        })
        .eq("id", userId);

      const localKey = `@daily_swipes_${userId}_${today}`;
      await AsyncStorage.setItem(localKey, String(newSwipesToday));
    } catch (err) {
      console.warn("[subscriptionService] Error updating swipes_today in profile:", err);
      const localKey = `@daily_swipes_${userId}_${today}`;
      await AsyncStorage.setItem(localKey, String(newSwipesToday));
    }
  }

  return {
    allowed,
    swipesToday: newSwipesToday,
    limit: currentStatus.limit,
    remaining,
    tier: currentStatus.tier,
  };
}

export async function upgradeSubscriptionTier(
  userId: string,
  tier: "pro" | "athlete"
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({
        subscription_status: tier,
        is_pro: true,
      })
      .eq("id", userId);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to upgrade subscription" };
  }
}
