import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { supabase } from '../lib/supabase';
import { Profile } from '../ctx/AuthContext';
import { useTheme } from '../ctx/ThemeContext';

export interface ActivityLevelOption {
  id: string;
  title: string;
  description: string;
  multiplier: number;
  icon: keyof typeof Ionicons.glyphMap;
}

export const ACTIVITY_LEVEL_OPTIONS: ActivityLevelOption[] = [
  {
    id: 'sedentary',
    title: 'Sedentary',
    description: 'Little or no exercise / desk job.',
    multiplier: 1.2,
    icon: 'bed-outline',
  },
  {
    id: 'light',
    title: 'Lightly Active',
    description: 'Light exercise 1-3 days/week.',
    multiplier: 1.375,
    icon: 'walk-outline',
  },
  {
    id: 'active',
    title: 'Moderately Active',
    description: 'Moderate exercise 3-5 days/week.',
    multiplier: 1.55,
    icon: 'barbell-outline',
  },
  {
    id: 'athlete',
    title: 'Very Active',
    description: 'Hard exercise 6-7 days/week.',
    multiplier: 1.725,
    icon: 'flame-outline',
  },
  {
    id: 'extra_active',
    title: 'Extra Active',
    description: 'Very hard exercise & physical job.',
    multiplier: 1.9,
    icon: 'flash-outline',
  },
];

interface ActivityLevelSelectorProps {
  visible: boolean;
  currentLevel?: string | null;
  profile: Profile | null;
  userId?: string;
  autoSave?: boolean;
  onClose: () => void;
  onSuccess: (newLevel: string, calculatedMacros: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  }) => void;
}

export function recalculateMacrosForActivity(
  profile: Profile | null,
  activityMultiplier: number
) {
  const weightKg = Number(profile?.weight) || 75;
  const heightCm = Number(profile?.height) || 175;
  const age = Number(profile?.age) || 30;
  const sex = (profile?.sex || '').toLowerCase();

  let bmr: number;
  if (sex === 'male') {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else if (sex === 'female') {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 78;
  }

  let tdee = Math.round(bmr * activityMultiplier);

  const goals = profile?.goals || [];
  const goalStr = goals.join(' ').toLowerCase();

  if (goalStr.includes('lose') || goalStr.includes('fat')) {
    tdee = Math.max(1200, tdee - 400);
  } else if (goalStr.includes('build') || goalStr.includes('muscle') || goalStr.includes('strength')) {
    tdee = tdee + 300;
  }

  const protein = Math.round(Math.max(110, Math.min(260, weightKg * 2.0)));
  const proteinKcal = protein * 4;
  const fats = Math.round(Math.max(45, (tdee * 0.25) / 9));
  const fatsKcal = fats * 9;
  const carbs = Math.round(Math.max(60, (tdee - proteinKcal - fatsKcal) / 4));

  return { calories: tdee, protein, carbs, fats };
}

export function ActivityLevelSelector({
  visible,
  currentLevel,
  profile,
  userId,
  autoSave = false,
  onClose,
  onSuccess,
}: ActivityLevelSelectorProps) {
  const { colors, isDark } = useTheme();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const normalizedCurrent = (currentLevel || '').toLowerCase();

  const handleSelect = async (option: ActivityLevelOption) => {
    if (updatingId) return;

    const calculated = recalculateMacrosForActivity(profile, option.multiplier);

    if (!autoSave || !userId) {
      onSuccess(option.id, calculated);
      onClose();
      return;
    }

    setUpdatingId(option.id);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          activity_level: option.id,
          target_calories: calculated.calories,
          target_protein: calculated.protein,
          target_carbs: calculated.carbs,
          target_fats: calculated.fats,
        })
        .eq('id', userId);

      if (error) throw error;

      onSuccess(option.id, calculated);
      onClose();
    } catch (err: any) {
      console.error('Error updating activity level:', err);
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: err?.message || 'Could not update your activity level.',
      });
    } finally {
      setUpdatingId(null);
    }
  };
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={[styles.sheetContainer, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
              <View style={styles.handleContainer}>
                <View style={[styles.handleBar, { backgroundColor: isDark ? '#334155' : '#cbd5e1' }]} />
              </View>

              <View style={styles.header}>
                <View style={styles.headerTitleRow}>
                  <View style={[styles.iconCircle, { backgroundColor: isDark ? 'rgba(74, 222, 128, 0.15)' : 'rgba(74, 222, 128, 0.12)' }]}>
                    <Ionicons name="fitness-outline" size={20} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.title, { color: colors.text }]}>Select Activity Level</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                      Calibrates daily energy expenditure & macro blueprint.
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={onClose}
                  style={[styles.closeButton, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
                {ACTIVITY_LEVEL_OPTIONS.map((item) => {
                  const isSelected = normalizedCurrent === item.id ||
                    (normalizedCurrent === 'moderately active' && item.id === 'active') ||
                    (normalizedCurrent === 'very active' && item.id === 'athlete');
                  const isItemUpdating = updatingId === item.id;

                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.optionCard,
                        {
                          backgroundColor: isSelected
                            ? (isDark ? 'rgba(74, 222, 128, 0.12)' : 'rgba(74, 222, 128, 0.08)')
                            : (isDark ? '#020617' : '#f8fafc'),
                          borderColor: isSelected ? colors.primary : colors.borderSubtle,
                        },
                      ]}
                      onPress={() => handleSelect(item)}
                      disabled={Boolean(updatingId)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.optionLeft}>
                        <View style={[styles.optionIconBox, { backgroundColor: isSelected ? colors.primary : (isDark ? '#1e293b' : '#e2e8f0') }]}>
                          <Ionicons name={item.icon} size={20} color={isSelected ? '#ffffff' : colors.textSecondary} />
                        </View>
                        <View style={styles.optionTextContainer}>
                          <Text style={[styles.optionTitle, { color: isSelected ? colors.primary : colors.text }]}>
                            {item.title}
                          </Text>
                          <Text style={[styles.optionDesc, { color: colors.textSecondary }]}>
                            {item.description}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.optionRight}>
                        {isItemUpdating ? (
                          <ActivityIndicator size="small" color={colors.primary} />
                        ) : isSelected ? (
                          <View style={[styles.checkCircle, { backgroundColor: colors.primary }]}>
                            <Ionicons name="checkmark" size={14} color="#ffffff" />
                          </View>
                        ) : (
                          <View style={[styles.unselectedRing, { borderColor: colors.border }]} />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 36,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 20,
  },
  handleContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  handleBar: {
    width: 44,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(148, 163, 184, 0.2)',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  listContent: {
    gap: 10,
    paddingBottom: 16,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  optionIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  optionDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  optionRight: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unselectedRing: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
  },
});


