import { useAuth } from '../ctx/AuthContext';
import { SubscriptionTier, getTierLimits, SubscriptionTierConfig } from '../constants/subscriptions';

export interface EntitlementsResult {
  hasProAccess: boolean;
  isTrainerLinked: boolean;
  tier: SubscriptionTier;
  limits: SubscriptionTierConfig;
  shouldShowPaywall: (featureRequiredTier?: SubscriptionTier) => boolean;
  getLimitReachedMessage: (limitType?: 'swipes' | 'recipes' | 'general', count?: number) => string;
}

/**
 * Hook to govern paywall bypass and feature entitlements for clients.
 * When profile.trainer_id is present, the client automatically inherits Pro access,
 * paywall checks are bypassed (return true / false for showing upsells), and neutral
 * messaging is provided when daily/weekly limits are hit.
 */
export function useEntitlements(): EntitlementsResult {
  const { profile, isPro } = useAuth();

  const isTrainerLinked = Boolean(profile?.trainer_id);

  // Trainer-linked clients automatically inherit Pro access and bypass consumer paywalls
  const hasProAccess = Boolean(
    isPro ||
    profile?.is_pro ||
    profile?.subscription_status === 'pro' ||
    profile?.subscription_status === 'athlete' ||
    isTrainerLinked
  );

  // Effective tier calculation: trainer-linked users are at least 'pro'
  const tier: SubscriptionTier = isTrainerLinked && profile?.subscription_status !== 'athlete'
    ? 'pro'
    : ((profile?.subscription_status || 'free').toLowerCase() as SubscriptionTier);

  const limits = getTierLimits(tier);

  /**
   * Determine whether a paywall or upsell should be displayed.
   * If profile.trainer_id is present, this always returns false.
   */
  const shouldShowPaywall = (featureRequiredTier: SubscriptionTier = 'pro'): boolean => {
    if (isTrainerLinked) return false;
    if (featureRequiredTier === 'athlete') {
      return tier !== 'athlete';
    }
    return !hasProAccess;
  };

  /**
   * Neutral fallback notification for trainer-linked clients vs upsell text for standalone users.
   */
  const getLimitReachedMessage = (
    limitType: 'swipes' | 'recipes' | 'general' = 'general',
    count?: number
  ): string => {
    if (isTrainerLinked) {
      return 'Daily limit reached. Check back tomorrow or contact your coach.';
    }
    if (limitType === 'recipes' && count !== undefined) {
      return `You have reached your weekly limit of ${count} recipes added to your shopping list. Upgrade your plan to expand your grocery capacity!`;
    }
    if (limitType === 'swipes') {
      return 'Daily Limit Reached. Come back tomorrow to load more, or Upgrade for higher limits.';
    }
    return 'Daily limit reached. Upgrade for higher limits.';
  };

  return {
    hasProAccess,
    isTrainerLinked,
    tier,
    limits,
    shouldShowPaywall,
    getLimitReachedMessage,
  };
}
