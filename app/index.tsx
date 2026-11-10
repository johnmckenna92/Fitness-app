import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../ctx/AuthContext';
import { useTheme } from '../ctx/ThemeContext';

export const BIOMETRICS_STORAGE_KEY = '@app_prefs_biometrics_enabled';

export default function WelcomeBiometricsScreen() {
  const { session, profile, role, isLoading, isProLoading } = useAuth();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const [checkingPref, setCheckingPref] = useState(true);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function checkState() {
      try {
        const pref = await AsyncStorage.getItem(BIOMETRICS_STORAGE_KEY);
        if (!isMounted) return;

        // If the user already made a biometrics choice in a previous session,
        // direct them based on role and derived onboarding completeness.
        if (pref !== null) {
          const userRole = role ?? profile?.role ?? 'client';
          if (userRole === 'trainer') {
            router.replace('/(trainer-tabs)' as any);
            return;
          }

          const hasHeight = profile?.height !== null && profile?.height !== undefined;
          const hasWeight = profile?.weight !== null && profile?.weight !== undefined;
          const hasGoals = Array.isArray(profile?.goals) && profile?.goals.length > 0;
          const isOnboardingCompleted = Boolean(hasHeight && hasWeight && hasGoals);

          const isProfileIncomplete = !isOnboardingCompleted;

          if (isProfileIncomplete) {
            router.replace('/(onboarding)' as any);
          } else {
            router.replace('/(tabs)');
          }
          return;
        }

        setCheckingPref(false);
      } catch (err) {
        console.warn('[WelcomeBiometrics] error:', err);
        if (isMounted) setCheckingPref(false);
      }
    }

    if (!isLoading && !isProLoading && session) {
      checkState();
    } else if (!isLoading && !session) {
      router.replace('/(auth)/login');
    }

    return () => {
      isMounted = false;
    };
  }, [isLoading, isProLoading, session, profile, role]);

  const routeClientAfterBiometrics = () => {
    const hasHeight = profile?.height !== null && profile?.height !== undefined;
    const hasWeight = profile?.weight !== null && profile?.weight !== undefined;
    const hasGoals = Array.isArray(profile?.goals) && profile?.goals.length > 0;
    const isOnboardingCompleted = Boolean(hasHeight && hasWeight && hasGoals);

    const isProfileIncomplete = !isOnboardingCompleted;

    if (isProfileIncomplete) {
      router.replace('/(onboarding)' as any);
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleContinue = async () => {
    setSaving(true);
    try {
      // Save explicit opt-in / opt-out preference
      await AsyncStorage.setItem(BIOMETRICS_STORAGE_KEY, biometricsEnabled ? 'true' : 'false');

      const userRole = role ?? profile?.role ?? 'client';
      if (userRole === 'trainer') {
        router.replace('/(trainer-tabs)' as any);
      } else {
        routeClientAfterBiometrics();
      }
    } catch (err) {
      console.warn('[WelcomeBiometrics] Save error:', err);
      const userRole = role ?? profile?.role ?? 'client';
      if (userRole === 'trainer') {
        router.replace('/(trainer-tabs)' as any);
      } else {
        routeClientAfterBiometrics();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = async () => {
    setSaving(true);
    try {
      // Skipped means explicitly not enabled; strictly fallback to password auth
      await AsyncStorage.setItem(BIOMETRICS_STORAGE_KEY, 'false');
      const userRole = role ?? profile?.role ?? 'client';
      if (userRole === 'trainer') {
        router.replace('/(trainer-tabs)' as any);
      } else {
        routeClientAfterBiometrics();
      }
    } catch (err) {
      console.warn('[WelcomeBiometrics] Skip error:', err);
      const userRole = role ?? profile?.role ?? 'client';
      if (userRole === 'trainer') {
        router.replace('/(trainer-tabs)' as any);
      } else {
        routeClientAfterBiometrics();
      }
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || checkingPref) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Derive user name for the greeting
  const displayName =
    profile?.full_name ||
    (session?.user?.user_metadata?.full_name as string) ||
    session?.user?.email?.split('@')[0] ||
    'Athlete';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.content, { paddingBottom: insets.bottom + 20 }]}>
        {/* Verification Success Badge */}
        <View style={styles.badgeContainer}>
          <View style={[styles.badge, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.15)', borderColor: isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.4)' }]}>
            <Ionicons name="shield-checkmark" size={18} color="#10b981" />
            <Text style={styles.badgeText}>Account Verified</Text>
          </View>
        </View>

        {/* Welcome Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Account Verified.</Text>
          <Text style={[styles.welcomeName, { color: colors.primary }]}>Welcome, {displayName}.</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Your fitness vault is ready. Let&apos;s make sure it&apos;s defended with enterprise-grade security.
          </Text>
        </View>

        {/* Biometrics Card */}
        <View style={[styles.biometricsCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
          <View style={[styles.iconCircle, { backgroundColor: isDark ? 'rgba(74, 222, 128, 0.12)' : 'rgba(74, 222, 128, 0.15)', borderColor: isDark ? 'rgba(74, 222, 128, 0.3)' : 'rgba(74, 222, 128, 0.4)' }]}>
            <Ionicons
              name={Platform.OS === 'ios' ? 'scan' : 'finger-print'}
              size={40}
              color={colors.primary}
            />
          </View>

          <Text style={[styles.cardTitle, { color: colors.text }]}>Biometric Authentication</Text>
          <Text style={[styles.cardPrompt, { color: colors.primary }]}>
            Enable Biometrics for faster login?
          </Text>
          <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
            Use Face ID, Touch ID, or your biometric sensor to protect your nutrition logs and private PT training blueprints.
          </Text>

          {/* Toggle Switch Row */}
          <View style={[styles.toggleRow, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <View style={styles.toggleTextGroup}>
              <Text style={[styles.toggleLabel, { color: colors.text }]}>Enable Biometric Lock</Text>
              <Text style={[styles.toggleStatus, { color: colors.textMuted }]}>
                {biometricsEnabled ? 'Enabled on app resume' : 'Disabled (Passcode/Manual)'}
              </Text>
            </View>
            <Switch
              value={biometricsEnabled}
              onValueChange={setBiometricsEnabled}
              trackColor={{ false: isDark ? '#262626' : '#cbd5e1', true: colors.primary }}
              thumbColor={biometricsEnabled ? '#ffffff' : '#64748b'}
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary }, saving && styles.buttonDisabled]}
            onPress={handleContinue}
            disabled={saving}
            activeOpacity={0.8}
          >
            {saving ? (
              <ActivityIndicator color="#020617" />
            ) : (
              <>
                <Text style={styles.primaryButtonText}>Continue</Text>
                <Ionicons name="arrow-forward" size={18} color="#020617" style={{ marginLeft: 6 }} />
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            disabled={saving}
            activeOpacity={0.7}
          >
            <Text style={[styles.skipButtonText, { color: colors.textSecondary }]}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
    justifyContent: 'center',
  },
  badgeContainer: {
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    color: '#10b981',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  header: {
    marginBottom: 28,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  welcomeName: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  biometricsCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 32,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  cardPrompt: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  toggleTextGroup: {
    flex: 1,
    marginRight: 12,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  toggleStatus: {
    fontSize: 12,
    marginTop: 2,
  },
  buttonGroup: {
    gap: 12,
  },
  primaryButton: {
    borderRadius: 14,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#0a0a0a',
    fontSize: 16,
    fontWeight: '700',
  },
  skipButton: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
