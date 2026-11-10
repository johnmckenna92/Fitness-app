import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { HybridMetricInput } from '../../components/HybridMetricInput';
import {
  HeightInputState,
  standardizeHeight,
  standardizeWeight,
  WeightInputState,
} from '../../utils/conversions';
import { ActivityLevel, useOnboarding } from '../../ctx/OnboardingContext';
import { useTheme } from '../../ctx/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ACTIVITY_LEVELS: {
  id: ActivityLevel;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    id: 'sedentary',
    title: 'Sedentary',
    subtitle: 'Desk job, little to no regular exercise or intentional movement.',
    icon: 'bed-outline',
  },
  {
    id: 'light',
    title: 'Lightly Active',
    subtitle: 'Light exercise, walking, or sports 1–3 days per week.',
    icon: 'walk-outline',
  },
  {
    id: 'active',
    title: 'Moderately Active',
    subtitle: 'Moderate gym workouts or training 3–5 days per week.',
    icon: 'barbell-outline',
  },
  {
    id: 'athlete',
    title: 'Athlete / Very Active',
    subtitle: 'Heavy daily workouts, physical labor, or competitive athletic training.',
    icon: 'flame-outline',
  },
];

export default function MetricsScreen() {
  const router = useRouter();
  const { data, updateData } = useOnboarding();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const [heightState, setHeightState] = useState<HeightInputState>(data.heightState);
  const [weightState, setWeightState] = useState<WeightInputState>(data.weightState);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(data.activityLevel);

  const handleNext = () => {
    const stdH = standardizeHeight(heightState);
    const stdW = standardizeWeight(weightState);

    if (stdH <= 0 || isNaN(stdH)) {
      Toast.show({ type: 'error', text1: 'Invalid Height', text2: 'Please enter a valid height.' });
      return;
    }
    if (stdW <= 0 || isNaN(stdW)) {
      Toast.show({ type: 'error', text1: 'Invalid Weight', text2: 'Please enter a valid weight.' });
      return;
    }
    if (!activityLevel) {
      Toast.show({ type: 'error', text1: 'Select Activity Level', text2: 'Required for calculations.' });
      return;
    }

    updateData({ heightState, weightState, activityLevel });
    router.push('/(onboarding)/nutrition' as any);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Body Metrics & Activity</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Strict hybrid inputs convert seamlessly between UK Stone/Pounds, lbs, and Metric.
          </Text>
        </View>

        <HybridMetricInput
          heightState={heightState}
          setHeightState={setHeightState}
          weightState={weightState}
          setWeightState={setWeightState}
        />

        <View style={styles.activitySection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Activity Level</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Select the tier that best matches your baseline weekly movement.
          </Text>

          <View style={styles.activityCardsList}>
            {ACTIVITY_LEVELS.map((item) => {
              const isSelected = activityLevel === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.activityCard, { backgroundColor: isSelected ? (isDark ? 'rgba(74, 222, 128, 0.08)' : 'rgba(74, 222, 128, 0.12)') : colors.surface, borderColor: isSelected ? colors.primary : colors.cardBorder }]}
                  onPress={() => setActivityLevel(item.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.cardHeaderRow}>
                    <View style={styles.iconTitleRow}>
                      <View style={[styles.activityIconCircle, isSelected && styles.activityIconCircleSelected]}>
                        <Ionicons
                          name={item.icon}
                          size={18}
                          color={isSelected ? '#0a0a0a' : '#4ade80'}
                        />
                      </View>
                      <Text style={[styles.activityTitle, { color: isSelected ? colors.primary : colors.text }]}>
                        {item.title}
                      </Text>
                    </View>
                    <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                      {isSelected && <View style={styles.radioDot} />}
                    </View>
                  </View>
                  <Text style={[styles.activityDesc, { color: isSelected ? colors.text : colors.textSecondary }]}>
                    {item.subtitle}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={18} color="#94a3b8" />
            <Text style={styles.secondaryBtnText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryBtn, { flex: 2 }]}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryBtnText}>Continue to Nutrition</Text>
            <Ionicons name="arrow-forward" size={18} color="#020617" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  scrollContent: { flexGrow: 1, padding: 24, paddingBottom: 48, gap: 24 },
  header: { marginBottom: 4 },
  title: { fontSize: 28, fontWeight: '800', color: '#f8fafc', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#94a3b8', lineHeight: 22 },
  activitySection: { gap: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#f8fafc' },
  sectionSubtitle: { fontSize: 13, color: '#94a3b8', marginTop: -4 },
  activityCardsList: { gap: 12, marginTop: 4 },
  activityCard: {
    backgroundColor: '#0f172a',
    borderWidth: 1.5,
    borderColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  activityCardSelected: {
    borderColor: '#4ade80',
    backgroundColor: 'rgba(74, 222, 128, 0.08)',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activityIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityIconCircleSelected: {
    backgroundColor: '#4ade80',
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f8fafc',
  },
  activityTitleSelected: {
    color: '#4ade80',
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    borderColor: '#4ade80',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4ade80',
  },
  activityDesc: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 18,
  },
  activityDescSelected: {
    color: '#cbd5e1',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  primaryBtn: {
    backgroundColor: '#4ade80',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0a0a0a',
  },
  secondaryBtn: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#94a3b8',
  },
});

