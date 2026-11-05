import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';
import * as LocalAuthentication from 'expo-local-authentication';

export interface Profile {
  id: string;
  full_name: string;
  target_calories: number;
  target_protein: number;
  target_carbs: number;
  target_fats: number;
  meals_per_day: number;
  subscription_status: 'free' | 'pro';
  is_pro?: boolean;
  pt_notes: string | null;
  avatar_url?: string | null;
  goals?: string[] | null;
  height?: number | null; // Standardized in cm
  weight?: number | null; // Standardized in kg
  macro_variance?: number;
}

export interface DailyTargets {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  target_calories: number;
  target_protein: number;
  target_carbs: number;
  target_fats: number;
}

export function getDailyTargets(
  profile: Profile | null | undefined,
  isTrainingDay: boolean,
): DailyTargets {
  const baseCalories = profile?.target_calories || 2200;
  const baseCarbs = profile?.target_carbs || 200;
  const baseProtein = profile?.target_protein || 140;
  const baseFats = profile?.target_fats || 65;

  let carbs: number;
  let calories: number;

  if (!isTrainingDay) {
    carbs = Math.round(baseCarbs * 0.8);
    calories = Math.round(baseCalories - (baseCarbs * 0.2 * 4));
  } else {
    carbs = Math.round(baseCarbs * 1.15);
    calories = Math.round(baseCalories + (baseCarbs * 0.15 * 4));
  }

  return {
    calories,
    carbs,
    protein: baseProtein,
    fats: baseFats,
    target_calories: calories,
    target_carbs: carbs,
    target_protein: baseProtein,
    target_fats: baseFats,
  };
}

export interface AuthContextProps {
  session: Session | null;
  profile: Profile | null;
  macro_variance: number;
  isPro: boolean;
  isProLoading: boolean;
  isLocked: boolean;
  isLoading: boolean;
  isTrainingDay: boolean;
  setIsTrainingDay: React.Dispatch<React.SetStateAction<boolean>>;
  unlock: () => Promise<void>;
  suppressLockForPicker: () => void;
  refreshProfile: () => Promise<void>;
  checkProStatus: (userId?: string) => Promise<boolean>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isPro, setIsPro] = useState<boolean>(false);
  const [isProLoading, setIsProLoading] = useState<boolean>(true);
  const [isLocked, setIsLocked] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isPickerSuppressed, setIsPickerSuppressed] = useState(false);
  const [isTrainingDay, setIsTrainingDay] = useState<boolean>(true);
  const appState = useRef(AppState.currentState);

  const checkProStatus = async (userId?: string): Promise<boolean> => {
    const targetId = userId || session?.user?.id;
    if (!targetId) {
      setIsPro(false);
      setIsProLoading(false);
      return false;
    }

    setIsProLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_pro')
        .eq('id', targetId)
        .single();

      if (error) {
        console.error('Error fetching is_pro status:', error);
        return false;
      }

      const proStatus = !!data?.is_pro;
      setIsPro(proStatus);
      return proStatus;
    } catch (err) {
      console.error('Unexpected error checking pro status:', err);
      return false;
    } finally {
      setIsProLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (!session?.user) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (!error && data) {
        setProfile(data);
        if (typeof data.is_pro === 'boolean') {
          setIsPro(data.is_pro);
        } else if (data.subscription_status === 'pro') {
          setIsPro(true);
        }
      }
    } catch (err) {
      console.error('Error refreshing profile:', err);
    }
  };

  const unlock = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      
      if (!hasHardware || !isEnrolled) {
        setIsLocked(false);
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock App',
        fallbackLabel: 'Use Passcode'
      });

      if (result.success) {
        setIsLocked(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const suppressLockForPicker = () => {
    setIsPickerSuppressed(true);
    setTimeout(() => setIsPickerSuppressed(false), 15000); // 15s grace period
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    setIsPro(false);
    setIsProLoading(false);
    setIsLocked(false);
  };

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (
        appState.current?.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        if (session && !isPickerSuppressed) {
          setIsLocked(true);
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [session, isPickerSuppressed]);

  useEffect(() => {
    let isMounted = true;

    const handleSessionChange = async (newSession: Session | null) => {
      setSession(newSession);

      if (newSession?.user) {
        setIsProLoading(true);
        try {
          // Immediately execute supabase.from('profiles').select('is_pro').eq('id', session.user.id).single()
          const { data, error } = await supabase
            .from('profiles')
            .select('is_pro')
            .eq('id', newSession.user.id)
            .single();

          if (isMounted) {
            if (!error && data) {
              setIsPro(!!data.is_pro);
            } else {
              setIsPro(false);
            }
          }

          // Hydrate full profile
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', newSession.user.id)
            .single();

          if (isMounted && profileData) {
            setProfile(profileData);
            if (typeof profileData.is_pro === 'boolean') {
              setIsPro(profileData.is_pro);
            }
          }
        } catch (e) {
          console.error('Error fetching pro status on session change:', e);
          if (isMounted) setIsPro(false);
        } finally {
          if (isMounted) {
            setIsProLoading(false);
          }
        }
      } else {
        if (isMounted) {
          setProfile(null);
          setIsPro(false);
          setIsProLoading(false);
          setIsLocked(false);
        }
      }
    };

    // Initial session hydration: ensure is_pro is fetched before completing initial load
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      await handleSessionChange(session);
      if (!session && isMounted) {
        setIsLocked(false);
      }
      if (isMounted) {
        setIsLoading(false);
      }
    });

    // Auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      await handleSessionChange(session);
      if (session && isMounted) {
        setIsLocked(false); // Crucial: Prevent loop on sign in
      }
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        profile,
        macro_variance: profile?.macro_variance ?? 20,
        isPro,
        isProLoading,
        isLocked,
        isLoading,
        isTrainingDay,
        setIsTrainingDay,
        unlock,
        suppressLockForPicker,
        refreshProfile,
        checkProStatus,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
