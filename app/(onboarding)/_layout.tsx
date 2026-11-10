import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, usePathname } from 'expo-router';
import { OnboardingProvider } from '../../ctx/OnboardingContext';
import { useTheme } from '../../ctx/ThemeContext';

function ProgressBar() {
  const pathname = usePathname();
  const { colors, isDark } = useTheme();

  let progressPercent = 25;
  let stepLabel = '1 of 4: Identity';

  if (pathname.includes('taste-profile')) {
    progressPercent = 100;
    stepLabel = '4 of 4: Taste Profile';
  } else if (pathname.includes('nutrition')) {
    progressPercent = 75;
    stepLabel = '3 of 4: Nutrition & Plan';
  } else if (pathname.includes('metrics')) {
    progressPercent = 50;
    stepLabel = '2 of 4: Hybrid Metrics';
  }

  return (
    <View style={[styles.progressContainer, { backgroundColor: colors.background, borderBottomColor: colors.borderSubtle }]}>
      <View style={styles.progressLabelRow}>
        <Text style={[styles.stepBadge, { color: colors.primary }]}>STEP {stepLabel.toUpperCase()}</Text>
        <Text style={[styles.percentText, { color: colors.textMuted }]}>{progressPercent}%</Text>
      </View>
      <View style={[styles.track, { backgroundColor: isDark ? '#262626' : '#e2e8f0' }]}>
        <View style={[styles.fill, { width: `${progressPercent}%`, backgroundColor: colors.primary }]} />
      </View>
    </View>
  );
}

export default function OnboardingLayout() {
  const { colors } = useTheme();

  return (
    <OnboardingProvider>
      <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <ProgressBar />
        <View style={[styles.stackContainer, { backgroundColor: colors.background }]}>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
              contentStyle: { backgroundColor: colors.background },
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="metrics" />
            <Stack.Screen name="nutrition" />
            <Stack.Screen name="taste-profile" />
          </Stack>
        </View>
      </SafeAreaView>
    </OnboardingProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepBadge: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  percentText: {
    fontSize: 13,
    fontWeight: '700',
  },
  track: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
  stackContainer: {
    flex: 1,
  },
});
