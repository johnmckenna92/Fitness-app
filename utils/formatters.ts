/**
 * Utilities for formatting durations and calculating per-serving nutrition values.
 */

/**
 * Parse an ISO 8601 duration or raw numeric string into integer minutes.
 */
export function parseDurationToMinutes(duration?: string | null): number {
  if (!duration || typeof duration !== "string") return 0;
  const str = duration.trim();
  if (!str) return 0;

  if (/^P/i.test(str)) {
    const timePart = str.includes("T") ? str.split(/T/i)[1] : str.slice(1);
    const hoursMatch = timePart.match(/(\d+)\s*H/i);
    const minutesMatch = timePart.match(/(\d+)\s*M/i);
    const secondsMatch = timePart.match(/(\d+)\s*S/i);

    const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
    const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;
    const seconds = secondsMatch ? parseInt(secondsMatch[1], 10) : 0;

    return hours * 60 + minutes + Math.round(seconds / 60);
  }

  if (/^\d+$/.test(str)) {
    return parseInt(str, 10);
  }

  return 0;
}

/**
 * Combines prep time and cook time into an accurate total duration string.
 * Falls back to total_time or default 20m.
 */
export function getCombinedTotalTime(
  prepTime?: string | null,
  cookTime?: string | null,
  totalTime?: string | null
): string {
  const prepMins = parseDurationToMinutes(prepTime);
  const cookMins = parseDurationToMinutes(cookTime);
  const combinedMins = prepMins + cookMins;

  const finalMins =
    combinedMins > 0
      ? combinedMins
      : parseDurationToMinutes(totalTime) || 20;

  if (finalMins >= 60) {
    const h = Math.floor(finalMins / 60);
    const m = finalMins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  return `${finalMins}m`;
}

/**
 * Parse an ISO 8601 duration or raw duration string into human-readable format.
 */
export function formatDuration(duration?: string | null): string {
  if (!duration || typeof duration !== "string") return "15m";
  const str = duration.trim();
  if (!str) return "15m";

  const mins = parseDurationToMinutes(str);
  if (mins === 0) {
    return !/^P/i.test(str) ? str : "15m";
  }

  if (mins >= 60) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }

  return `${mins}m`;
}

/**
 * Compute per-serving rounded macros based on servings count.
 * Safe fallback: If servings is 0, negative, or undefined, defaults to 1.
 */
export function getMacrosPerServing(recipe?: {
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  servings?: number;
} | null) {
  const rawServings = Number(recipe?.servings);
  const servings = !isNaN(rawServings) && rawServings > 0 ? Math.round(rawServings) : 1;

  return {
    calories: Math.round((Number(recipe?.calories) || 0) / servings),
    protein: Math.round((Number(recipe?.protein) || 0) / servings),
    carbs: Math.round((Number(recipe?.carbs) || 0) / servings),
    fats: Math.round((Number(recipe?.fats) || 0) / servings),
    servings,
  };
}
