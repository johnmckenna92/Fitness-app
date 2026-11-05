import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack, router, useSegments, useRootNavigationState } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../ctx/AuthContext';
import { StatusBar } from 'expo-status-bar';
import Toast, { BaseToast, ErrorToast, ToastConfig } from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';

const toastConfig: ToastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{
        backgroundColor: '#0f172a',
        borderLeftColor: '#818cf8',
        borderLeftWidth: 6,
        borderColor: '#1e293b',
        borderWidth: 1,
        borderRadius: 12,
        height: 'auto',
        minHeight: 64,
        paddingVertical: 12,
        width: '92%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
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
        color: '#f8fafc',
      }}
      text2Style={{
        fontSize: 13,
        color: '#94a3b8',
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
            backgroundColor: '#020617',
            borderWidth: 1,
            borderColor: '#818cf8',
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: 14,
          }}
        >
          <Ionicons name="checkmark" size={18} color="#818cf8" />
        </View>
      )}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={{
        backgroundColor: '#0f172a',
        borderLeftColor: '#ef4444',
        borderLeftWidth: 6,
        borderColor: '#1e293b',
        borderWidth: 1,
        borderRadius: 12,
        height: 'auto',
        minHeight: 64,
        paddingVertical: 12,
        width: '92%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
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
        color: '#f8fafc',
      }}
      text2Style={{
        fontSize: 13,
        color: '#94a3b8',
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
            backgroundColor: '#020617',
            borderWidth: 1,
            borderColor: '#ef4444',
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: 14,
          }}
        >
          <Ionicons name="alert-circle-outline" size={18} color="#ef4444" />
        </View>
      )}
    />
  ),
  info: (props) => (
    <BaseToast
      {...props}
      style={{
        backgroundColor: '#0f172a',
        borderLeftColor: '#818cf8',
        borderLeftWidth: 6,
        borderColor: '#1e293b',
        borderWidth: 1,
        borderRadius: 12,
        height: 'auto',
        minHeight: 64,
        paddingVertical: 12,
        width: '92%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
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
        color: '#f8fafc',
      }}
      text2Style={{
        fontSize: 13,
        color: '#94a3b8',
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
            backgroundColor: '#020617',
            borderWidth: 1,
            borderColor: '#818cf8',
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: 14,
          }}
        >
          <Ionicons name="information-circle-outline" size={18} color="#818cf8" />
        </View>
      )}
    />
  ),
};

function RootLayoutNav() {
  const { session, profile, isLocked, isLoading } = useAuth();
  const segments = useSegments();
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    if (isLoading || !rootNavigationState?.key) return;

    const rootSegment = segments[0];
    const inAuthGroup = rootSegment === 'auth';
    const isUpdatePassword = (inAuthGroup && segments[1] === 'update-password') || rootSegment === 'update-password';
    const inOnboarding = rootSegment === 'onboarding';

    // 1. Kick unauthenticated users to login if not already in auth flow
    if (!session) {
      if (!inAuthGroup && !isUpdatePassword) {
        router.replace('/auth/login');
      }
      return;
    }

    // 2. Lock screen guard for authenticated users
    if (isLocked) {
      if (rootSegment !== 'lock' && !isUpdatePassword) {
        router.replace('/lock');
      }
      return;
    }

    // 3. Post-Login Gatekeeper: Check Supabase profiles table for height, weight, and goals
    // If height, weight, or goals are null/empty, FORCE redirect user to dedicated (onboarding) modal stack.
    // They cannot view the main app tabs until this wizard is completed.
    const isProfileIncomplete =
      !profile ||
      profile.height === null ||
      profile.height === undefined ||
      profile.weight === null ||
      profile.weight === undefined ||
      !profile.goals ||
      (Array.isArray(profile.goals) && profile.goals.length === 0);

    if (isProfileIncomplete) {
      if (!inOnboarding && !isUpdatePassword) {
        router.replace('/onboarding' as any);
      }
      return;
    }

    // 4. Completed onboarding but still inside onboarding flow -> redirect to tabs
    if (inOnboarding) {
      router.replace('/(tabs)');
      return;
    }

    // 5. Authenticated users are routed to dashboard if actively trying to access auth screens
    if (inAuthGroup) {
      if (segments[1] === 'update-password') {
        return;
      }
      router.replace('/(tabs)');
      return;
    }

    // 6. Authenticated user with complete profile on root index -> redirect to tabs
    if (!rootSegment || (rootSegment as string) === 'index') {
      router.replace('/(tabs)');
      return;
    }
  }, [session, profile, isLocked, isLoading, segments, rootNavigationState?.key]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#020617', justifyContent: 'center', alignItems: 'center' }}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#818cf8" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#020617' } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="recipe/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="auth" />
        <Stack.Screen name="update-password" />
        <Stack.Screen 
          name="onboarding" 
          options={{ 
            presentation: 'fullScreenModal',
            gestureEnabled: false,
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="lock" 
          options={{ 
            presentation: 'fullScreenModal', 
            animation: 'fade',
            gestureEnabled: false,
            headerLeft: () => null,
          }} 
        />
        <Stack.Screen name="pricing" options={{ presentation: 'modal' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        <Stack.Screen 
          name="scanner" 
          options={{ 
            headerShown: true, 
            title: 'Ingredient Scanner',
            headerStyle: { backgroundColor: '#0f172a' },
            headerTintColor: '#f8fafc',
            presentation: 'modal'
          }} 
        />
        <Stack.Screen 
          name="fix-meal" 
          options={{ 
            headerShown: true, 
            title: 'Fix My Meal',
            headerStyle: { backgroundColor: '#0f172a' },
            headerTintColor: '#f8fafc',
            presentation: 'modal'
          }} 
        />
        <Stack.Screen 
          name="chat" 
          options={{ 
            headerShown: true, 
            title: 'AI PT Coach',
            headerStyle: { backgroundColor: '#0f172a' },
            headerTintColor: '#f8fafc',
            presentation: 'modal'
          }} 
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: '#020617' }}>
      <AuthProvider>
        <RootLayoutNav />
        <Toast config={toastConfig} />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

