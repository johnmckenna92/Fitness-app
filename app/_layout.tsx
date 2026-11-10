import '../global.css';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  AppStateStatus,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Stack, router, useSegments, useRootNavigationState } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../ctx/AuthContext';
import { ThemeProvider, useTheme } from '../ctx/ThemeContext';
import { StatusBar } from 'expo-status-bar';
import Toast, { BaseToast, ErrorToast, ToastConfig } from 'react-native-toast-message';
import { GlobalAlert } from '../components/CustomAlert';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

export { ErrorBoundary } from 'expo-router';

export let isIntentionalBackground = false;
export const setIsIntentionalBackground = (value: boolean) => {
  isIntentionalBackground = value;
};

const createToastConfig = (colors: any, isDark: boolean): ToastConfig => ({
  success: (props) => (
    <BaseToast
      {...props}
      style={{
        backgroundColor: colors.surface,
        borderLeftColor: colors.primary,
        borderLeftWidth: 6,
        borderColor: colors.cardBorder,
        borderWidth: 1,
        borderRadius: 14,
        height: 'auto',
        minHeight: 64,
        paddingVertical: 12,
        width: '92%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDark ? 0.35 : 0.12,
        shadowRadius: 8,
        elevation: 6,
      }}
      contentContainerStyle={{
        paddingLeft: 12,
        paddingRight: 16,
      }}
      text1Style={{
        fontSize: 15,
        fontWeight: '700',
        color: colors.text,
      }}
      text2Style={{
        fontSize: 13,
        color: colors.textSecondary,
        marginTop: 2,
        lineHeight: 18,
      }}
      text1NumberOfLines={2}
      text2NumberOfLines={0}
      renderLeadingIcon={() => (
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: colors.surfaceSubtle,
            borderWidth: 1,
            borderColor: colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: 14,
          }}
        >
          <Ionicons name="checkmark" size={18} color={colors.primary} />
        </View>
      )}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={{
        backgroundColor: colors.surface,
        borderLeftColor: colors.destructive,
        borderLeftWidth: 6,
        borderColor: colors.cardBorder,
        borderWidth: 1,
        borderRadius: 14,
        height: 'auto',
        minHeight: 64,
        paddingVertical: 12,
        width: '92%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDark ? 0.35 : 0.12,
        shadowRadius: 8,
        elevation: 6,
      }}
      contentContainerStyle={{
        paddingLeft: 12,
        paddingRight: 16,
      }}
      text1Style={{
        fontSize: 15,
        fontWeight: '700',
        color: colors.text,
      }}
      text2Style={{
        fontSize: 13,
        color: colors.textSecondary,
        marginTop: 2,
        lineHeight: 18,
      }}
      text1NumberOfLines={2}
      text2NumberOfLines={0}
      renderLeadingIcon={() => (
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: colors.surfaceSubtle,
            borderWidth: 1,
            borderColor: colors.destructive,
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: 14,
          }}
        >
          <Ionicons name="alert-circle-outline" size={18} color={colors.destructive} />
        </View>
      )}
    />
  ),
  info: (props) => (
    <BaseToast
      {...props}
      style={{
        backgroundColor: colors.surface,
        borderLeftColor: colors.primary,
        borderLeftWidth: 6,
        borderColor: colors.cardBorder,
        borderWidth: 1,
        borderRadius: 14,
        height: 'auto',
        minHeight: 64,
        paddingVertical: 12,
        width: '92%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDark ? 0.35 : 0.12,
        shadowRadius: 8,
        elevation: 6,
      }}
      contentContainerStyle={{
        paddingLeft: 12,
        paddingRight: 16,
      }}
      text1Style={{
        fontSize: 15,
        fontWeight: '700',
        color: colors.text,
      }}
      text2Style={{
        fontSize: 13,
        color: colors.textSecondary,
        marginTop: 2,
        lineHeight: 18,
      }}
      text1NumberOfLines={2}
      text2NumberOfLines={0}
      renderLeadingIcon={() => (
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: colors.surfaceSubtle,
            borderWidth: 1,
            borderColor: colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: 14,
          }}
        >
          <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
        </View>
      )}
    />
  ),
});

function RootLayoutNav() {
  const { session, profile, role, isLocked, isLoading, isProLoading, unlock, signOut, isPickerSuppressed } = useAuth();
  const segments = useSegments();
  const rootNavigationState = useRootNavigationState();
  const appState = useRef(AppState.currentState);
  const isAuthenticating = useRef(false);
  const [isAuthenticatingUi, setIsAuthenticatingUi] = useState(false);
  const hasVerifiedSession = useRef(false);

  const authenticateBiometrics = useCallback(async () => {
    if (isAuthenticating.current) return;
    isAuthenticating.current = true;
    setIsAuthenticatingUi(true);
    try {
      const biometricsPref = await AsyncStorage.getItem('@app_prefs_biometrics_enabled');
      if (biometricsPref !== 'true') {
        await unlock();
        return;
      }

      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        await unlock();
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access your plan',
        fallbackLabel: 'Use Device Passcode',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      if (result.success) {
        await unlock();
      }
    } catch (e) {
      console.warn('[RootLayout] Biometrics error:', e);
    } finally {
      // Explicitly re-enable the UI button with a fresh onPress trigger
      isAuthenticating.current = false;
      setIsAuthenticatingUi(false);
    }
  }, [unlock]);

  // AppState listener: when active, trigger LocalAuthentication.authenticateAsync() unless suppressed
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (
        appState.current?.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        if (isIntentionalBackground || isPickerSuppressed) {
          setIsIntentionalBackground(false);
        } else if (session) {
          if (isAuthenticating.current) return;
          authenticateBiometrics();
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [session, authenticateBiometrics, isPickerSuppressed]);

  useEffect(() => {
    if (isLoading || !rootNavigationState?.key) return;

    // Explicitly wait for profile hydration to complete before executing session routing,
    // preventing race conditions where profile is null or updating upon initial login.
    if (session && (isProLoading || !profile)) return;

    const verifySessionAndRoute = async () => {
      const rootSegment = segments[0] as string | undefined;
      const inAuthGroup = rootSegment === '(auth)' || rootSegment === 'auth';
      const isUpdatePassword =
        (inAuthGroup && (segments[1] as string) === 'update-password') ||
        rootSegment === 'update-password';
      const inOnboarding =
        rootSegment === 'onboarding' || rootSegment === '(onboarding)';
      const inClientTabs = rootSegment === '(tabs)' || rootSegment === 'tabs';
      const inTrainerTabs =
        rootSegment === '(trainer-tabs)' || rootSegment === 'trainer-tabs';
      const isRoot = !rootSegment || (rootSegment as string) === 'index';

      // 1. Kick unauthenticated users to login if not already in auth flow
      if (!session) {
        hasVerifiedSession.current = false;
        if (!inAuthGroup && !isUpdatePassword) {
          router.replace('/(auth)/login');
        }
        return;
      }

      // 1b. STRICT AUTH INTERCEPTOR: Validate local session against Supabase backend
      if (session && !hasVerifiedSession.current) {
        const { data: userData, error } = await supabase.auth.getUser();
        if (error || !userData?.user) {
          console.warn('[RootLayout] Dead session detected. Kicking out.');
          await signOut();
          router.replace('/(auth)/login');
          return;
        }
        hasVerifiedSession.current = true;
      }

      const userRole = role ?? profile?.role ?? 'client';

      // 1c. Account Locking Interceptor: If account was revoked by trainer, lock out of main app
      const isLockedByTrainer =
        profile?.account_status === 'locked_trainer_revoked' ||
        profile?.account_status === 'inactive';
      const inLockScreen = rootSegment === 'lock';

      if (isLockedByTrainer) {
        if (!inLockScreen) {
          router.replace('/lock');
        }
        return;
      } else if (inLockScreen) {
        router.replace('/(tabs)');
        return;
      }

      // 2. Dynamic RBAC Routing Interceptor
      if (userRole === 'trainer') {
        // Trainer boundary:
        // - Block from auth group (except update-password)
        // - Block from client onboarding and client tabs
        if (inAuthGroup) {
          if (segments[1] === 'update-password') {
            return;
          }
          router.replace('/(trainer-tabs)' as any);
          return;
        }

        if (inClientTabs || inOnboarding) {
          router.replace('/(trainer-tabs)' as any);
          return;
        }
      } else {
        // Client boundary:
        // - Block from trainer tabs
        if (inTrainerTabs) {
          router.replace('/(tabs)');
          return;
        }

        // Post-Login Gatekeeper for clients:
        // Client must strictly pass onboarding gates: height, weight, and goals must be populated.
        const hasHeight = profile?.height !== null && profile?.height !== undefined;
        const hasWeight = profile?.weight !== null && profile?.weight !== undefined;
        const hasGoals = Array.isArray(profile?.goals) && profile?.goals.length > 0;
        const isOnboardingCompleted = Boolean(hasHeight && hasWeight && hasGoals);

        const isProfileIncomplete = !isOnboardingCompleted;

        if (isProfileIncomplete) {
          if (!inOnboarding && !isUpdatePassword && !isRoot) {
            router.replace('/(onboarding)' as any);
          }
          return;
        }

        // Notice: Do NOT auto-redirect out of inOnboarding here.
        // The Taste Profile gate is mandatory and completes by calling router.replace('/(tabs)')
        // after the 10-card deck calibration is swiped.

        // Authenticated client routed out of auth screens
        if (inAuthGroup) {
          if (segments[1] === 'update-password') {
            return;
          }
          router.replace('/');
          return;
        }
      }

      // Notice: app/index.tsx handles Welcome & Biometrics gate and routing to /(onboarding) or /(tabs) / /(trainer-tabs)
    };

    verifySessionAndRoute();
  }, [session, profile, role, isLoading, isProLoading, segments, rootNavigationState?.key, signOut]);

  const { effectiveTheme, colors } = useTheme();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <StatusBar style={effectiveTheme === 'dark' ? 'light' : 'dark'} />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={effectiveTheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(trainer-tabs)" />
        <Stack.Screen name="recipe/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="update-password" />
        <Stack.Screen name="account-security" options={{ headerShown: false }} />
        <Stack.Screen 
          name="(onboarding)" 
          options={{ 
            gestureEnabled: false,
            headerShown: false,
          }} 
        />
        <Stack.Screen name="pricing" options={{ presentation: 'modal' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        <Stack.Screen 
          name="scanner" 
          options={{ 
            headerShown: true, 
            title: 'Ingredient Scanner',
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.text,
            presentation: 'modal'
          }} 
        />
        <Stack.Screen 
          name="fix-meal" 
          options={{ 
            headerShown: true, 
            title: 'Fix My Meal',
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.text,
            presentation: 'modal'
          }} 
        />
        <Stack.Screen 
          name="chat" 
          options={{ 
            headerShown: true, 
            title: 'AI PT Coach',
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.text,
            presentation: 'modal'
          }} 
        />
        <Stack.Screen
          name="lock"
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="trainer/[id]"
          options={{
            headerShown: false,
          }}
        />

      </Stack>

      {/* Root Biometric Lock Modal */}
      <Modal
        visible={Boolean(session && isLocked)}
        animationType="fade"
        transparent={false}
        statusBarTranslucent
        onRequestClose={() => {}}
      >
        <View style={lockModalStyles.container}>
          <StatusBar style="light" />
          <View style={lockModalStyles.content}>
            <View style={lockModalStyles.iconContainer}>
              <Ionicons name="finger-print" size={56} color="#4ade80" />
            </View>
            <Text style={lockModalStyles.title}>App Locked</Text>
            <Text style={lockModalStyles.subtitle}>
              Verify your identity to access your workouts and nutritional blueprints.
            </Text>

            <TouchableOpacity
              style={[
                lockModalStyles.primaryButton,
                isAuthenticatingUi && lockModalStyles.buttonDisabled,
              ]}
              onPress={authenticateBiometrics}
              disabled={isAuthenticatingUi}
              activeOpacity={0.8}
            >
              {isAuthenticatingUi ? (
                <ActivityIndicator size="small" color="#0a0a0a" />
              ) : (
                <>
                  <Ionicons name="scan" size={20} color="#0a0a0a" style={{ marginRight: 8 }} />
                  <Text style={lockModalStyles.primaryButtonText}>Unlock Now</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={lockModalStyles.secondaryButton}
              onPress={signOut}
              activeOpacity={0.7}
            >
              <Text style={lockModalStyles.secondaryButtonText}>Sign Out Instead</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const lockModalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    maxWidth: 380,
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 36,
  },
  primaryButton: {
    backgroundColor: '#4ade80',
    flexDirection: 'row',
    height: 52,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#4ade80',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: '#0a0a0a',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    height: 48,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#f43f5e',
    fontSize: 15,
    fontWeight: '600',
  },
});

function RootLayoutInner() {
  const { colors, isDark } = useTheme();
  const toastConfig = React.useMemo(() => createToastConfig(colors, isDark), [colors, isDark]);

  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: colors.background }}>
      <AuthProvider>
        <RootLayoutNav />
        <Toast config={toastConfig} topOffset={45} bottomOffset={90} />
        <GlobalAlert />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutInner />
    </ThemeProvider>
  );
}





