export type SubscriptionTier = 'free' | 'pro' | 'athlete';

export interface SubscriptionTierConfig {
  name: string;
  maxCatalogSwipesDaily: number;
  maxShoppingListWeekly: number;
  canUploadPtPlan: boolean;
  hasTimeOfDaySort: boolean;
  hasDeepAnalytics: boolean;
  priceMonthly: number;
}

export const SUBSCRIPTION_TIERS: Record<SubscriptionTier, SubscriptionTierConfig> = {
  free: {
    name: 'Free',
    maxCatalogSwipesDaily: 0,
    maxShoppingListWeekly: 2,
    canUploadPtPlan: false,
    hasTimeOfDaySort: false,
    hasDeepAnalytics: false,
    priceMonthly: 0,
  },
  pro: {
    name: 'Pro',
    maxCatalogSwipesDaily: 5,
    maxShoppingListWeekly: 15,
    canUploadPtPlan: true,
    hasTimeOfDaySort: true,
    hasDeepAnalytics: false,
    priceMonthly: 14.99,
  },
  athlete: {
    name: 'Athlete',
    maxCatalogSwipesDaily: 20,
    maxShoppingListWeekly: Infinity,
    canUploadPtPlan: true,
    hasTimeOfDaySort: true,
    hasDeepAnalytics: true,
    priceMonthly: 29.99,
  },
};

export function getTierLimits(tier: string | null | undefined): SubscriptionTierConfig {
  const normalized = (tier || 'free').toLowerCase() as SubscriptionTier;
  return SUBSCRIPTION_TIERS[normalized] || SUBSCRIPTION_TIERS.free;
}
