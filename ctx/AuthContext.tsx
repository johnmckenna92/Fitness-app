import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';

export interface TrainerProfile {
  id?: string;
  full_name: string | null;
  avatar_url: string | null;
  trainer_bio?: string | null;
  role?: string | null;
}

export interface Profile {
  id: string;
  full_name: string | null;
  target_calories: number | null;
  target_protein: number | null;
  target_carbs: number | null;
  target_fats: number | null;
  meals_per_day: number | null;
  subscription_status: 'free' | 'pro' | 'athlete' | string | null;
  subscription_tier?: string | null;
  stripe_customer_id?: string | null;
  role?: 'client' | 'trainer' | null;
  is_pro?: boolean | null;
  pt_notes: string | null;
  protocol_notes?: string | null;
  avatar_url?: string | null;
  trainer_id?: string | null;
  trainer?: TrainerProfile | null;
  trainer_bio?: string | null;
  account_status?: 'active' | 'locked_trainer_revoked' | 'inactive' | string | null;
  client_state?: 'active' | 'frozen' | 'deactivated' | string | null;

  goals?: string[] | null;
  height?: number | null; // Standardized in cm
  weight?: number | null; // Standardized in kg
  macro_variance?: number | null;
  age?: number | null;
  sex?: string | null;
  activity_level?: string | null;
  swipes_today?: number | null;
  last_swipe_date?: string | null;
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
  role: 'client' | 'trainer' | null;
  macro_variance: number;
  isPro: boolean;
  isProLoading: boolean;
  isLocked: boolean;
  isLoading: boolean;
  isTrainingDay: boolean;
  setIsTrainingDay: React.Dispatch<React.SetStateAction<boolean>>;
  unlock: () => Promise<void>;
  suppressLockForPicker: () => void;
  isPickerSuppressed: boolean;
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
        .select('is_pro, trainer_id, subscription_status')
        .eq('id', targetId)
        .single();

      if (error) {
        console.error('Error fetching is_pro status:', error);
        return false;
      }

      const proStatus = Boolean(data?.is_pro || data?.subscription_status === 'pro' || data?.trainer_id);
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
        .select('*, trainer:trainer_id(id, full_name, avatar_url, trainer_bio)')
        .eq('id', session.user.id)
        .single();

      if (!error && data) {
        const unwrappedTrainer = Array.isArray((data as any)?.trainer) ? (data as any).trainer[0] : (data as any)?.trainer;
        setProfile({ ...data, trainer: unwrappedTrainer } as unknown as Profile);
        const proStatus = Boolean(data.is_pro || data.subscription_status === 'pro' || data.trainer_id);
        setIsPro(proStatus);
      }
    } catch (err) {
      console.error('Error refreshing profile:', err);
    }
  };

  const unlock = async () => {
    setIsLocked(false);
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
          // Immediately execute supabase.from('profiles').select('is_pro, trainer_id, subscription_status').eq('id', newSession.user.id).single()
          const { data, error } = await supabase
            .from('profiles')
            .select('is_pro, trainer_id, subscription_status')
            .eq('id', newSession.user.id)
            .single();

          if (isMounted) {
            if (!error && data) {
              setIsPro(Boolean(data.is_pro || data.subscription_status === 'pro' || data.trainer_id));
            } else {
              setIsPro(false);
            }
          }

          // Hydrate full profile
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*, trainer:trainer_id(id, full_name, avatar_url, trainer_bio)')
            .eq('id', newSession.user.id)
            .single();

          if (isMounted && profileData) {
            const unwrappedTrainer = Array.isArray((profileData as any)?.trainer) ? (profileData as any).trainer[0] : (profileData as any)?.trainer;
            setProfile({ ...profileData, trainer: unwrappedTrainer } as unknown as Profile);
            setIsPro(Boolean(profileData.is_pro || (profileData as any).subscription_status === 'pro' || profileData.trainer_id));
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
        role: profile?.role ?? null,
        macro_variance: profile?.macro_variance ?? 20,
        isPro,
        isProLoading,
        isLocked,
        isLoading,
        isTrainingDay,
        setIsTrainingDay,
        unlock,
        suppressLockForPicker,
        isPickerSuppressed,
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

