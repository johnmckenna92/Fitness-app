import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../ctx/AuthContext';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types/database.types';
import { standardizeHeight, standardizeWeight } from '../../utils/conversions';
import { useOnboarding } from '../../ctx/OnboardingContext';
import { useTheme } from '../../ctx/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { setIsIntentionalBackground } from '../_layout';
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

const GOAL_OPTIONS = [
  { id: 'Build Muscle', title: 'Build Muscle', desc: 'Hypertrophy & progressive overload' },
  { id: 'Lose Fat', title: 'Lose Fat', desc: 'Caloric deficit & fat loss' },
  { id: 'Recomp', title: 'Recomposition', desc: 'Maintain weight while dropping fat' },
];

export default function NutritionScreen() {
  const router = useRouter();
  const { session, profile, isPro, refreshProfile, suppressLockForPicker, role } = useAuth();
  const { data } = useOnboarding();

  const isTrainer = role === 'trainer' || profile?.role === 'trainer';
  const isTrainerLinked = Boolean(profile?.trainer_id);
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const [goals, setGoals] = useState<string[]>(data.goals);
  const [dietaryPreferences, setDietaryPreferences] = useState(data.dietaryPreferences);
  const [targetCalories, setTargetCalories] = useState(data.targetCalories);
  const [targetProtein, setTargetProtein] = useState(data.targetProtein);
  const [targetCarbs, setTargetCarbs] = useState(data.targetCarbs);
  const [targetFats, setTargetFats] = useState(data.targetFats);
  const [mealsPerDay, setMealsPerDay] = useState(data.mealsPerDay || '4');
  const [ptNotes, setPtNotes] = useState(data.ptNotes || '');

  const [isExtractingPT, setIsExtractingPT] = useState(false);
  const [extractedSuccess, setExtractedSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPaywallVisible, setIsPaywallVisible] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'yearly' | 'monthly'>('yearly');
  const [isSubscribing, setIsSubscribing] = useState(false);

  const toggleGoal = (goalId: string) => {
    setGoals((prev) =>
      prev.includes(goalId) ? prev.filter((g) => g !== goalId) : [...prev, goalId]
    );
  };

  const handleProFeaturePress = async () => {
    const hasProAccess = Boolean(
      isPro ||
      profile?.is_pro ||
      profile?.subscription_status === 'pro' ||
      profile?.trainer_id
    );

    if (!hasProAccess) {
      setIsPaywallVisible(true);
      return;
    }

    try {
      suppressLockForPicker();
      setIsIntentionalBackground(true);
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
      });

      if (pickerResult.canceled || !pickerResult.assets || pickerResult.assets.length === 0) {
        return;
      }

      setIsExtractingPT(true);
      const asset = pickerResult.assets[0];

      const manipResult = await ImageManipulator.manipulateAsync(
        asset.uri,
        [{ resize: { width: 1200 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );

      if (!manipResult.base64) {
        throw new Error('Could not process document image.');
      }

      // Route external AI call strictly through Supabase Edge Function
      const { data: edgeData, error: edgeError } = await supabase.functions.invoke('pt-plan', {
        body: {
          imageBase64: manipResult.base64,
          mimeType: 'image/jpeg',
          goals: goals.length > 0 ? goals : ['Build Muscle'],
        },
      });

      if (edgeError) throw edgeError;

      if (edgeData) {
        if (edgeData.calories) setTargetCalories(edgeData.calories.toString());
        if (edgeData.protein) setTargetProtein(edgeData.protein.toString());
        if (edgeData.carbs) setTargetCarbs(edgeData.carbs.toString());
        if (edgeData.fats) setTargetFats(edgeData.fats.toString());
        if (edgeData.meals_per_day) setMealsPerDay(edgeData.meals_per_day.toString());
        const extractedNotes = edgeData.pt_notes || edgeData.protocol_notes || edgeData.notes;
        if (extractedNotes) setPtNotes(extractedNotes);

        setExtractedSuccess(true);
        Toast.show({
          type: 'success',
          text1: 'Targets Extracted!',
          text2: 'AI extracted your coach targets.',
        });
      }
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Extraction Failed',
        text2: err?.message || 'Could not parse document. Enter targets manually.',
      });
    } finally {
      setIsExtractingPT(false);
    }
  };

  const handleSubscribe = async () => {
    if (!session?.user?.id) {
      Toast.show({
        type: 'error',
        text1: 'Authentication Required',
        text2: 'Please log in to upgrade your subscription.',
      });
      return;
    }

    try {
      setIsSubscribing(true);
      const { error } = await supabase
        .from('profiles')
        .update({ subscription_status: 'pro', is_pro: true })
        .eq('id', session.user.id);

      if (error) throw error;

      await refreshProfile();
      Toast.show({
        type: 'success',
        text1: 'Upgrade Successful',
        text2: 'Welcome to Pro! You now have full access to OCR extraction.',
      });
      setIsPaywallVisible(false);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Subscription Failed',
        text2: error?.message || 'An error occurred while upgrading to Pro. Please try again.',
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleCompleteSetup = async () => {
    if (!session?.user) {
      Toast.show({ type: 'error', text1: 'Auth Error', text2: 'Please log in again.' });
      return;
    }
    if (goals.length === 0) {
      Toast.show({ type: 'error', text1: 'Select a Goal', text2: 'Pick at least one fitness goal.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const stdHeightCm = standardizeHeight(data.heightState);
      const stdWeightKg = standardizeWeight(data.weightState);
      const parsedCalories = parseInt(targetCalories, 10) || 2200;
      const parsedProtein = parseInt(targetProtein, 10) || 140;
      const parsedCarbs = parseInt(targetCarbs, 10) || 200;
      const parsedFats = parseInt(targetFats, 10) || 65;
      const parsedMeals = parseInt(mealsPerDay, 10) || 4;
      const fullName = `${data.firstName} ${data.lastName}`.trim();
      const parsedAge = data.age ? parseInt(data.age, 10) : null;

            const updatePayload: ProfileUpdate = {
        full_name: fullName || undefined,
        height: stdHeightCm,
        weight: stdWeightKg,
        age: parsedAge,
        sex: data.sex || null,
        activity_level: data.activityLevel || null,
        goals,
        avatar_url: data.avatarUrl || undefined,
        pt_notes: ptNotes.trim() || null,
      };

      if (!isTrainerLinked) {
        updatePayload.target_calories = parsedCalories;
        updatePayload.target_protein = parsedProtein;
        updatePayload.target_carbs = parsedCarbs;
        updatePayload.target_fats = parsedFats;
        updatePayload.meals_per_day = parsedMeals;
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update(updatePayload)
        .eq('id', session.user.id);

      if (profileError) throw profileError;

      await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          age: parsedAge,
          sex: data.sex,
          activity_level: data.activityLevel,
          dietary_preferences: dietaryPreferences.trim(),
        },
      });

      await refreshProfile();
      Toast.show({ type: 'success', text1: 'Profile Saved', text2: 'Time to calibrate your taste profile.' });
      router.push('/(onboarding)/taste-profile');
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Setup Error', text2: err?.message || 'Failed to persist settings.' });
    } finally {
      setIsSubmitting(false);
    }
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
          <Text style={[styles.title, { color: colors.text }]}>Nutrition & PT Plan</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Define targets or let our Pro Edge AI automatically extract them from your PT plan.
          </Text>
        </View>

        {/* Goals Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Primary Fitness Goals *</Text>
          <View style={styles.goalsList}>
            {GOAL_OPTIONS.map((goal) => {
              const isSelected = goals.includes(goal.id);
              return (
                <TouchableOpacity
                  key={goal.id}
                  style={[styles.goalCard, { backgroundColor: isSelected ? (isDark ? 'rgba(74, 222, 128, 0.08)' : 'rgba(74, 222, 128, 0.12)') : colors.surface, borderColor: isSelected ? colors.primary : colors.cardBorder }]}
                  onPress={() => toggleGoal(goal.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.goalTextContainer}>
                    <Text style={[styles.goalTitle, { color: isSelected ? colors.primary : colors.text }]}>
                      {goal.title}
                    </Text>
                    <Text style={[styles.goalDesc, { color: colors.textSecondary }]}>{goal.desc}</Text>
                  </View>
                  <Ionicons
                    name={isSelected ? 'checkbox' : 'square-outline'}
                    size={22}
                    color={isSelected ? '#4ade80' : '#475569'}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

                {isTrainerLinked ? (
          <View style={[styles.trainerCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
            <View style={styles.trainerHeaderRow}>
              <View style={[styles.trainerIconCircle, { backgroundColor: 'rgba(74, 222, 128, 0.15)' }]}>
                <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.trainerCardTitle, { color: colors.text }]}>Coach-Managed Nutrition</Text>
                <Text style={[styles.trainerCardBadge, { color: colors.primary }]}>INVITED BY TRAINER</Text>
              </View>
            </View>
            <Text style={[styles.trainerCardDesc, { color: colors.textSecondary }]}>
              Your calorie targets, macronutrient split, and nutrition blueprints are managed exclusively by your coach. Macro collection is bypassed.
            </Text>
          </View>
        ) : (
          <>
            {/* Dietary Preferences Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Dietary Preferences & Exclusions</Text>
              <Text style={[styles.fieldNote, { color: colors.textSecondary }]}>
                Allergies, preferences, or religious requirements (e.g., Halal, Vegetarian, Nut-Free).
              </Text>
              <TextInput
                className="bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800" style={[styles.textArea, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                value={dietaryPreferences}
                onChangeText={setDietaryPreferences}
                placeholder="e.g., Halal, Vegetarian, no shellfish, dairy-sensitive..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                maxLength={255}
              />
            </View>

            {/* Pro Feature Gate Block - Strictly coach-side feature */}
            {isTrainer && (
              <View style={styles.proCard}>
                <View style={styles.proHeaderRow}>
                  <View style={styles.proBadge}>
                    <Text style={styles.proBadgeText}>PRO FEATURE</Text>
                  </View>
                  <Ionicons name="star" size={18} color="#fbbf24" />
                </View>

                <Text style={styles.proTitle}>Upload PT Plan for AI Macro Extraction</Text>
                <Text style={styles.proSubtitle}>
                  Have a plan from your coach? Our zero-trust Edge AI parses your exact targets.
                </Text>

                {extractedSuccess && (
                  <View style={styles.successBanner}>
                    <Ionicons name="checkmark-circle" size={16} color="#34d399" />
                    <Text style={styles.successBannerText}>Targets populated from coach document!</Text>
                  </View>
                )}

                <TouchableOpacity
                  style={[styles.proButton, isExtractingPT && styles.proButtonDisabled]}
                  onPress={handleProFeaturePress}
                  disabled={isExtractingPT}
                  activeOpacity={0.8}
                >
                  {isExtractingPT ? (
                    <ActivityIndicator color="#020617" size="small" />
                  ) : (
                    <>
                      <Ionicons name="document-text" size={18} color="#020617" />
                      <Text style={styles.proButtonText}>
                        {extractedSuccess ? 'Re-upload Coach Plan' : 'Upload Coach Document'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* Macro Targets Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Daily Targets (Manual or Extracted)</Text>
              <View style={styles.macrosGrid}>
                <View style={[styles.macroBox, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
                  <Text style={[styles.macroLabel, { color: colors.textSecondary }]}>Calories</Text>
                  <TextInput
                    className="bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800" style={[styles.macroInput, { color: colors.text }]}
                    value={targetCalories}
                    onChangeText={setTargetCalories}
                    placeholder="2200"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                  />
                  <Text style={[styles.macroSuffix, { color: colors.textMuted }]}>kcal</Text>
                </View>

                <View style={[styles.macroBox, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
                  <Text style={[styles.macroLabel, { color: colors.textSecondary }]}>Protein</Text>
                  <TextInput
                    className="bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800" style={[styles.macroInput, { color: colors.text }]}
                    value={targetProtein}
                    onChangeText={setTargetProtein}
                    placeholder="140"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                  />
                  <Text style={[styles.macroSuffix, { color: colors.textMuted }]}>g</Text>
                </View>

                <View style={[styles.macroBox, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
                  <Text style={[styles.macroLabel, { color: colors.textSecondary }]}>Carbs</Text>
                  <TextInput
                    className="bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800" style={[styles.macroInput, { color: colors.text }]}
                    value={targetCarbs}
                    onChangeText={setTargetCarbs}
                    placeholder="200"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                  />
                  <Text style={[styles.macroSuffix, { color: colors.textMuted }]}>g</Text>
                </View>

                <View style={[styles.macroBox, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
                  <Text style={[styles.macroLabel, { color: colors.textSecondary }]}>Fats</Text>
                  <TextInput
                    className="bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800" style={[styles.macroInput, { color: colors.text }]}
                    value={targetFats}
                    onChangeText={setTargetFats}
                    placeholder="65"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                  />
                  <Text style={[styles.macroSuffix, { color: colors.textMuted }]}>g</Text>
                </View>
              </View>
            </View>
          </>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.secondaryBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.back()}
            disabled={isSubmitting}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={18} color="#94a3b8" />
            <Text style={styles.secondaryBtnText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryBtn, { flex: 2 }]}
            onPress={handleCompleteSetup}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#020617" size="small" />
            ) : (
              <>
                <Text style={styles.primaryBtnText}>Complete Setup</Text>
                <Ionicons name="checkmark-done" size={20} color="#020617" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* State-Preserving Inline Paywall Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isPaywallVisible}
        onRequestClose={() => setIsPaywallVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.proPill}>
                <Text style={styles.proPillText}>PRO UNLOCK</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsPaywallVisible(false)}
                style={styles.modalCloseBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={22} color="#f8fafc" />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollBody}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.modalTitle}>Supercharge Your Fitness Hub</Text>
              <Text style={styles.modalSubtitle}>
                Unlock automated OCR document extraction, real-time diet scanning, and AI coaching.
              </Text>

              <View style={styles.modalFeatures}>
                <View style={styles.modalFeatureItem}>
                  <View style={styles.checkContainer}>
                    <Ionicons name="checkmark-sharp" size={15} color="#22c55e" />
                  </View>
                  <View style={styles.featureTextContainer}>
                    <Text style={styles.modalFeatureTitle}>Instant PT Plan OCR</Text>
                    <Text style={styles.modalFeatureDesc}>Scan PDFs & photos to auto-populate targets</Text>
                  </View>
                </View>
                <View style={styles.modalFeatureItem}>
                  <View style={styles.checkContainer}>
                    <Ionicons name="checkmark-sharp" size={15} color="#22c55e" />
                  </View>
                  <View style={styles.featureTextContainer}>
                    <Text style={styles.modalFeatureTitle}>Multimodal AI Diet Checker</Text>
                    <Text style={styles.modalFeatureDesc}>Real-time camera feedback against your macros</Text>
                  </View>
                </View>
                <View style={styles.modalFeatureItem}>
                  <View style={styles.checkContainer}>
                    <Ionicons name="checkmark-sharp" size={15} color="#22c55e" />
                  </View>
                  <View style={styles.featureTextContainer}>
                    <Text style={styles.modalFeatureTitle}>AI PT Coach Chat</Text>
                    <Text style={styles.modalFeatureDesc}>24/7 hyper-personalized sports nutrition advice</Text>
                  </View>
                </View>
              </View>

              <View style={styles.plansContainer}>
                <TouchableOpacity
                  style={[styles.planCard, selectedPlan === 'yearly' && styles.planCardSelected]}
                  onPress={() => setSelectedPlan('yearly')}
                  activeOpacity={0.8}
                >
                  <View style={styles.badgeContainer}>
                    <Text style={styles.badgeText}>SAVE 37%</Text>
                  </View>
                  <View style={styles.planHeader}>
                    <View style={styles.radioOuter}>
                      {selectedPlan === 'yearly' && <View style={styles.radioInner} />}
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.planTitle}>Annual Pass</Text>
                      <Text style={styles.planSubtitle}>Equivalent to £4.99/mo</Text>
                    </View>
                    <View style={styles.priceContainer}>
                      <Text style={styles.planPrice}>£59.99</Text>
                      <Text style={styles.planPeriod}>/year</Text>
                    </View>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.planCard, selectedPlan === 'monthly' && styles.planCardSelected]}
                  onPress={() => setSelectedPlan('monthly')}
                  activeOpacity={0.8}
                >
                  <View style={styles.planHeader}>
                    <View style={styles.radioOuter}>
                      {selectedPlan === 'monthly' && <View style={styles.radioInner} />}
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.planTitle}>Monthly Pass</Text>
                      <Text style={styles.planSubtitle}>Billed monthly. Cancel anytime.</Text>
                    </View>
                    <View style={styles.priceContainer}>
                      <Text style={styles.planPrice}>£7.99</Text>
                      <Text style={styles.planPeriod}>/month</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.modalCtaBtn, isSubscribing && styles.modalCtaBtnDisabled]}
                onPress={handleSubscribe}
                disabled={isSubscribing}
                activeOpacity={0.8}
              >
                {isSubscribing ? (
                  <ActivityIndicator color="#020617" size="small" />
                ) : (
                  <Text style={styles.modalCtaText}>
                    Upgrade Now - {selectedPlan === 'yearly' ? '£59.99/yr' : '£7.99/mo'}
                  </Text>
                )}
              </TouchableOpacity>
              <Text style={styles.disclaimerText}>Cancel anytime. Instant Pro access.</Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  scrollContent: { flexGrow: 1, padding: 24, paddingBottom: 48, gap: 24 },
  header: { marginBottom: 4 },
  title: { fontSize: 28, fontWeight: '800', color: '#f8fafc', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#94a3b8', lineHeight: 22 },
  trainerCard: {
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 18,
    gap: 12,
  },
  trainerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  trainerIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trainerCardTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  trainerCardBadge: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  trainerCardDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  section: { gap: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#f8fafc' },
  fieldNote: { fontSize: 13, color: '#94a3b8', marginTop: -4 },
  goalsList: { gap: 10 },
  goalCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderWidth: 1.5,
    borderColor: '#1e293b',
    borderRadius: 14,
    padding: 16,
  },
  goalCardSelected: {
    borderColor: '#4ade80',
    backgroundColor: 'rgba(74, 222, 128, 0.08)',
  },
  goalTextContainer: { flex: 1, paddingRight: 12 },
  goalTitle: { fontSize: 16, fontWeight: '700', color: '#f8fafc', marginBottom: 2 },
  goalTitleSelected: { color: '#4ade80' },
  goalDesc: { fontSize: 13, color: '#94a3b8' },
  textArea: {
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#262626',
    borderRadius: 12,
    padding: 16,
    color: '#f8fafc',
    fontSize: 15,
    minHeight: 80,
  },
  proCard: {
    backgroundColor: 'rgba(74, 222, 128, 0.08)',
    borderWidth: 1.5,
    borderColor: '#4ade80',
    borderRadius: 16,
    padding: 18,
    gap: 10,
  },
  proHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  proBadge: {
    backgroundColor: '#4ade80',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  proBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0a0a0a',
    letterSpacing: 1,
  },
  proTitle: { fontSize: 17, fontWeight: '800', color: '#f8fafc' },
  proSubtitle: { fontSize: 13, color: '#cbd5e1', lineHeight: 19 },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(52, 211, 153, 0.12)',
    borderWidth: 1,
    borderColor: '#34d399',
    borderRadius: 8,
    padding: 10,
  },
  successBannerText: { fontSize: 12, fontWeight: '600', color: '#34d399' },
  proButton: {
    backgroundColor: '#fbbf24',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  proButtonDisabled: { opacity: 0.6 },
  proButtonText: { fontSize: 15, fontWeight: '700', color: '#020617' },
  macrosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  macroBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 12,
    padding: 12,
    position: 'relative',
  },
  macroLabel: { fontSize: 12, fontWeight: '600', color: '#94a3b8', marginBottom: 4 },
  macroInput: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '700',
    paddingVertical: 4,
  },
  macroSuffix: {
    position: 'absolute',
    right: 12,
    bottom: 14,
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
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
  primaryBtnText: { fontSize: 16, fontWeight: '700', color: '#0a0a0a' },
  secondaryBtn: {
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#262626',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  secondaryBtnText: { fontSize: 15, fontWeight: '600', color: '#94a3b8' },
  // Inline Paywall Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0b1120',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  proPill: {
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4ade80',
  },
  proPillText: {
    color: '#4ade80',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  modalScrollBody: {
    paddingBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#f8fafc',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  modalFeatures: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 20,
    gap: 14,
  },
  modalFeatureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkContainer: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderWidth: 1,
    borderColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  featureTextContainer: {
    flex: 1,
  },
  modalFeatureTitle: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  modalFeatureDesc: {
    color: '#94a3b8',
    fontSize: 12,
  },
  plansContainer: {
    gap: 12,
    marginBottom: 20,
  },
  planCard: {
    backgroundColor: '#171717',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#262626',
    position: 'relative',
  },
  planCardSelected: {
    borderColor: '#4ade80',
    backgroundColor: 'rgba(74, 222, 128, 0.06)',
  },
  badgeContainer: {
    position: 'absolute',
    top: -10,
    right: 14,
    backgroundColor: '#4ade80',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    color: '#0a0a0a',
    fontSize: 10,
    fontWeight: '800',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#4ade80',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4ade80',
  },
  planTitle: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '700',
  },
  planSubtitle: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 2,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  planPrice: {
    color: '#f8fafc',
    fontSize: 17,
    fontWeight: '700',
  },
  planPeriod: {
    color: '#94a3b8',
    fontSize: 11,
  },
  modalCtaBtn: {
    backgroundColor: '#4ade80',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  modalCtaBtnDisabled: {
    opacity: 0.7,
  },
  modalCtaText: {
    color: '#0a0a0a',
    fontSize: 16,
    fontWeight: '700',
  },
  disclaimerText: {
    color: '#64748b',
    fontSize: 12,
    textAlign: 'center',
  },
});









