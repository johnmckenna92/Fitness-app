import React, { createContext, useContext, useState } from 'react';
import { HeightInputState, WeightInputState } from '../utils/conversions';

export type ActivityLevel = 'sedentary' | 'light' | 'active' | 'athlete' | '';
export type SexOption = 'male' | 'female' | 'other' | '';

export interface OnboardingData {
  // Step 1: Identity
  firstName: string;
  lastName: string;
  age: string;
  sex: SexOption;
  avatarUrl: string;

  // Step 2: Metrics
  heightState: HeightInputState;
  weightState: WeightInputState;
  activityLevel: ActivityLevel;

  // Step 3: Nutrition & PT Plan
  goals: string[];
  dietaryPreferences: string;
  targetCalories: string;
  targetProtein: string;
  targetCarbs: string;
  targetFats: string;
  mealsPerDay: string;
  ptNotes: string;
}

interface OnboardingContextValue {
  data: OnboardingData;
  updateData: (fields: Partial<OnboardingData>) => void;
  resetData: () => void;
}

const initialData: OnboardingData = {
  firstName: '',
  lastName: '',
  age: '',
  sex: '',
  avatarUrl: '',
  heightState: {
    unit: 'ft',
    cm: '',
    feet: '5',
    inches: '10',
  },
  weightState: {
    unit: 'st',
    value: '',
    stone: '11',
    pounds: '4',
  },
  activityLevel: 'active',
  goals: ['Build Muscle'],
  dietaryPreferences: '',
  targetCalories: '',
  targetProtein: '',
  targetCarbs: '',
  targetFats: '',
  mealsPerDay: '4',
  ptNotes: '',
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<OnboardingData>(initialData);

  const updateData = (fields: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...fields }));
  };

  const resetData = () => {
    setData(initialData);
  };

  return (
    <OnboardingContext.Provider value={{ data, updateData, resetData }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
