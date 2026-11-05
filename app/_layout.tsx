import React, { useEffect } from 'react';
import { Stack, router, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../ctx/AuthContext';
import { StatusBar } from 'expo-status-bar';

function RootLayoutNav() {
  const { session, isLocked, isLoading } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const isModal = segments[0] === 'profile' || segments[0] === 'pricing';
    if (isModal) return;

    const rootSegment = segments[0];
    const inAuthGroup = rootSegment === 'auth';

    // 1. Kick unauthenticated users to login if not already in auth flow
    if (!session) {
      if (!inAuthGroup) {
        router.replace('/auth/login');
      }
      return;
    }

    // 2. Lock screen guard for authenticated users
    if (isLocked) {
      if (rootSegment !== 'lock') {
        router.replace('/lock');
      }
      return;
    }

    // 3. Authenticated users are ONLY redirected to recipes if actively trying to access auth screens
    if (inAuthGroup) {
      router.replace('/(tabs)/recipes');
    }
  }, [session, isLocked, isLoading, segments]);

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#020617' } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="onboarding" />
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
          name="profile" 
          options={{ 
            headerShown: true, 
            title: 'Profile & Targets',
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
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

