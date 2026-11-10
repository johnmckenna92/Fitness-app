/**
 * Body Metric Conversion Utilities
 * Standardizes imperial, UK hybrid (Stone/Pounds), and metric body measurements
 * strictly to Metric (cm & kg) for uniform AI coaching algorithms and Supabase database persistence.
 */

// Exact conversion constants
export const CM_PER_INCH = 2.54;
export const INCHES_PER_FOOT = 12;
export const LBS_PER_KG = 2.20462262185;
export const KG_PER_LB = 0.45359237;
export const LBS_PER_STONE = 14;

/**
 * Converts feet and inches to centimeters.
 * Example: 5 ft 5 in -> 165.1 cm
 */
export function feetInchesToCm(feet: number, inches: number): number {
  const safeFeet = Math.max(0, feet || 0);
  const safeInches = Math.max(0, inches || 0);
  const totalInches = safeFeet * INCHES_PER_FOOT + safeInches;
  const cm = totalInches * CM_PER_INCH;
  return Math.round(cm * 10) / 10;
}

/**
 * Converts centimeters to feet and rounded inches.
 * Example: 165.1 cm -> { feet: 5, inches: 5 }
 */
export function cmToFeetInches(cm: number): { feet: number; inches: number } {
  if (!cm || cm <= 0) return { feet: 0, inches: 0 };
  const totalInches = Math.round(cm / CM_PER_INCH);
  const feet = Math.floor(totalInches / INCHES_PER_FOOT);
  const inches = totalInches % INCHES_PER_FOOT;
  return { feet, inches };
}

/**
 * Converts pounds to kilograms.
 * Example: 150 lbs -> 68.0 kg
 */
export function lbsToKg(lbs: number): number {
  if (!lbs || lbs <= 0) return 0;
  const kg = lbs * KG_PER_LB;
  return Math.round(kg * 10) / 10;
}

/**
 * Converts kilograms to pounds.
 * Example: 68 kg -> 150 lbs
 */
export function kgToLbs(kg: number): number {
  if (!kg || kg <= 0) return 0;
  const lbs = kg * LBS_PER_KG;
  return Math.round(lbs * 10) / 10;
}

/**
 * Converts Stone and Pounds to kilograms.
 * Example: 11 st 4 lbs -> 71.7 kg
 */
export function stoneLbsToKg(stone: number, pounds: number): number {
  const safeStone = Math.max(0, stone || 0);
  const safePounds = Math.max(0, pounds || 0);
  const totalLbs = safeStone * LBS_PER_STONE + safePounds;
  return lbsToKg(totalLbs);
}

/**
 * Converts kilograms to Stone and rounded Pounds.
 * Example: 71.7 kg -> { stone: 11, pounds: 4 }
 */
export function kgToStoneLbs(kg: number): { stone: number; pounds: number } {
  if (!kg || kg <= 0) return { stone: 0, pounds: 0 };
  const totalLbs = Math.round(kg * LBS_PER_KG);
  const stone = Math.floor(totalLbs / LBS_PER_STONE);
  const pounds = Math.round(totalLbs % LBS_PER_STONE);
  return { stone, pounds };
}

export type HeightUnit = 'ft' | 'cm';
export type WeightUnit = 'st' | 'kg' | 'lbs';

export interface HeightInputState {
  unit: HeightUnit;
  cm: string;
  feet: string;
  inches: string;
}

export interface WeightInputState {
  unit: WeightUnit;
  value: string; // Used for kg or lbs
  stone?: string; // Used for st
  pounds?: string; // Used for st
}

/**
 * Standardizes any height input representation to numeric centimeters (cm).
 */
export function standardizeHeight(state: HeightInputState): number {
  if (state.unit === 'cm') {
    const parsed = parseFloat(state.cm);
    return isNaN(parsed) ? 0 : Math.round(parsed * 10) / 10;
  }
  const feet = parseInt(state.feet, 10) || 0;
  const inches = parseFloat(state.inches) || 0;
  return feetInchesToCm(feet, inches);
}

/**
 * Standardizes any weight input representation to numeric kilograms (kg).
 */
export function standardizeWeight(state: WeightInputState): number {
  if (state.unit === 'st') {
    const stone = parseInt(state.stone || '0', 10) || 0;
    const pounds = parseFloat(state.pounds || '0') || 0;
    return stoneLbsToKg(stone, pounds);
  }
  const parsed = parseFloat(state.value);
  if (isNaN(parsed) || parsed <= 0) return 0;
  if (state.unit === 'kg') {
    return Math.round(parsed * 10) / 10;
  }
  return lbsToKg(parsed);
}

