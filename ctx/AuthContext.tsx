import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';
import * as LocalAuthentication from 'expo-local-authentication';

interface Profile {
  id: string;
  full_name: string;
  target_calories: number;
  target_protein: number;
  target_carbs: number;
  target_fats: number;
  meals_per_day: number;
  subscription_status: 'free' | 'pro';
  pt_notes: string | null;
}

interface AuthContextProps {
  session: Session | null;
  profile: Profile | null;
  isLocked: boolean;
  isLoading: boolean;
  unlock: () => Promise<void>;
  suppressLockForPicker: () => void;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLocked, setIsLocked] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isPickerSuppressed, setIsPickerSuppressed] = useState(false);
  const appState = useRef(AppState.currentState);

  const refreshProfile = async () => {
    if (!session?.user) return;
    const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
    if (data) setProfile(data);
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
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        refreshProfile();
      } else {
        setIsLocked(false);
      }
      setIsLoading(false);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        refreshProfile();
        setIsLocked(false); // Crucial: Prevent loop on sign in
      } else {
        setIsLocked(false);
      }
    });
  }, []);

  return (
    <AuthContext.Provider value={{ session, profile, isLocked, isLoading, unlock, suppressLockForPicker, refreshProfile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
