import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { HybridMetricInput } from '../../components/HybridMetricInput';
import { useAuth } from '../../ctx/AuthContext';
import { supabase } from '../../lib/supabase';
import {
  HeightInputState,
  WeightInputState,
  standardizeHeight,
  standardizeWeight,
} from '../../utils/conversions';

const GOAL_OPTIONS = [
  'Build Muscle',
  'Lose Fat',
  'Recomp',
  'Increase Strength',
  'Improve Endurance',
  'Maintenance',
];

export default function OnboardingWizard() {
  const { session, refreshProfile } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);

  const [heightState, setHeightState] = useState<HeightInputState>({
    unit: 'ft',
    cm: '',
    feet: '5',
    inches: '10',
  });

  const [weightState, setWeightState] = useState<WeightInputState>({
    unit: 'lbs',
    value: '165',
  });

  const [selectedGoals, setSelectedGoals] = useState<string[]>(['Build Muscle']);

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const handleNext = () => {
    const stdH = standardizeHeight(heightState);
    const stdW = standardizeWeight(weightState);

    if (stdH <= 0 || isNaN(stdH)) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Height',
        text2: 'Please enter a valid height measurement.',
      });
      return;
    }

    if (stdW <= 0 || isNaN(stdW)) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Weight',
        text2: 'Please enter a valid weight measurement.',
      });
      return;
    }

    setStep(2);
  };

  const handleComplete = async () => {
    if (!session?.user) {
      Toast.show({
        type: 'error',
        text1: 'Authentication Error',
        text2: 'User session not found. Please log in again.',
      });
      return;
    }

    if (selectedGoals.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Select a Goal',
        text2: 'Please choose at least one primary fitness goal.',
      });
      return;
    }

    setLoading(true);

    try {
      const standardizedHeightCm = standardizeHeight(heightState);
      const standardizedWeightKg = standardizeWeight(weightState);

      const { error } = await supabase
        .from('profiles')
        .update({
          height: standardizedHeightCm,
          weight: standardizedWeightKg,
          goals: selectedGoals,
        })
        .eq('id', session.user.id);

      if (error) {
        throw error;
      }

      await refreshProfile();

      Toast.show({
        type: 'success',
        text1: 'Welcome Aboard!',
        text2: 'Your personalized profile is configured.',
      });
    } catch (err: any) {
      console.error('Failed to complete onboarding:', err);
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: err?.message || 'Could not save your metrics. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.indicatorRow}>
              <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]} />
              <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
              <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]} />
            </View>
            <Text style={styles.stepBadge}>STEP {step} OF 2</Text>
            <Text style={styles.title}>
              {step === 1 ? 'Body Metrics' : 'Fitness Goals'}
            </Text>
            <Text style={styles.subtitle}>
              {step === 1
                ? 'Mix & match imperial or metric. We standardize everything automatically for precision coaching.'
                : 'Choose one or more objectives so we can tailor your nutrition and training plan.'}
            </Text>
          </View>

          {step === 1 && (
            <View style={styles.stepContent}>
              <HybridMetricInput
                heightState={heightState}
                setHeightState={setHeightState}
                weightState={weightState}
                setWeightState={setWeightState}
              />

              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={handleNext}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryBtnText}>Continue to Goals</Text>
                <Ionicons name="arrow-forward" size={18} color="#020617" />
              </TouchableOpacity>
            </View>
          )}

          {step === 2 && (
            <View style={styles.stepContent}>
              <View style={styles.goalsGrid}>
                {GOAL_OPTIONS.map((goal) => {
                  const isSelected = selectedGoals.includes(goal);
                  return (
                    <TouchableOpacity
                      key={goal}
                      style={[
                        styles.goalChip,
                        isSelected && styles.goalChipSelected,
                      ]}
                      onPress={() => toggleGoal(goal)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                        size={18}
                        color={isSelected ? '#020617' : '#94a3b8'}
                      />
                      <Text
                        style={[
                          styles.goalChipText,
                          isSelected && styles.goalChipTextSelected,
                        ]}
                      >
                        {goal}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.secondaryBtn}
                  onPress={() => setStep(1)}
                  disabled={loading}
                >
                  <Ionicons name="arrow-back" size={18} color="#94a3b8" />
                  <Text style={styles.secondaryBtnText}>Back</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.primaryBtn, { flex: 2 }]}
                  onPress={handleComplete}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#020617" />
                  ) : (
                    <>
                      <Text style={styles.primaryBtnText}>Complete Setup</Text>
                      <Ionicons name="checkmark-done" size={20} color="#020617" />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#020617' },
  scrollContent: { padding: 24, paddingBottom: 48 },
  header: { marginBottom: 28 },
  indicatorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  stepDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#1e293b' },
  stepDotActive: { backgroundColor: '#818cf8', width: 12, height: 12, borderRadius: 6 },
  stepLine: { flex: 1, height: 2, backgroundColor: '#1e293b', marginHorizontal: 8 },
  stepLineActive: { backgroundColor: '#818cf8' },
  stepBadge: { fontSize: 11, fontWeight: '800', color: '#818cf8', letterSpacing: 1.5, marginBottom: 6 },
  title: { fontSize: 30, fontWeight: '800', color: '#f8fafc', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#94a3b8', lineHeight: 22 },
  stepContent: { gap: 24 },
  goalsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  goalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    width: '48%',
  },
  goalChipSelected: { backgroundColor: '#818cf8', borderColor: '#818cf8' },
  goalChipText: { fontSize: 13, fontWeight: '600', color: '#94a3b8' },
  goalChipTextSelected: { color: '#020617', fontWeight: '700' },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  primaryBtn: {
    backgroundColor: '#818cf8',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryBtnText: { fontSize: 16, fontWeight: '700', color: '#020617' },
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
  secondaryBtnText: { fontSize: 15, fontWeight: '600', color: '#94a3b8' },
});

