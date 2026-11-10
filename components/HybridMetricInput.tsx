import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import {
  cmToFeetInches,
  feetInchesToCm,
  HeightInputState,
  HeightUnit,
  kgToLbs,
  kgToStoneLbs,
  lbsToKg,
  stoneLbsToKg,
  WeightInputState,
  WeightUnit,
} from '../utils/conversions';

export interface HybridMetricInputProps {
  heightState: HeightInputState;
  setHeightState: React.Dispatch<React.SetStateAction<HeightInputState>>;
  weightState: WeightInputState;
  setWeightState: React.Dispatch<React.SetStateAction<WeightInputState>>;
}

export function HybridMetricInput({
  heightState,
  setHeightState,
  weightState,
  setWeightState,
}: HybridMetricInputProps) {
  const handleHeightUnitToggle = (newUnit: HeightUnit) => {
    if (newUnit === heightState.unit) return;
    if (newUnit === 'cm') {
      const ft = parseInt(heightState.feet, 10) || 0;
      const inch = parseFloat(heightState.inches) || 0;
      const cmVal = (ft > 0 || inch > 0) ? feetInchesToCm(ft, inch) : 0;
      setHeightState((prev) => ({
        ...prev,
        unit: 'cm',
        cm: cmVal > 0 ? cmVal.toString() : prev.cm,
      }));
    } else {
      const cmVal = parseFloat(heightState.cm) || 0;
      if (cmVal > 0) {
        const { feet, inches } = cmToFeetInches(cmVal);
        setHeightState((prev) => ({
          ...prev,
          unit: 'ft',
          feet: feet > 0 ? feet.toString() : '',
          inches: inches >= 0 ? inches.toString() : '',
        }));
      } else {
        setHeightState((prev) => ({ ...prev, unit: 'ft' }));
      }
    }
  };

  const handleWeightUnitToggle = (newUnit: WeightUnit) => {
    if (newUnit === weightState.unit) return;

    let currentKg = 0;
    if (weightState.unit === 'st') {
      const st = parseInt(weightState.stone || '0', 10) || 0;
      const lbs = parseFloat(weightState.pounds || '0') || 0;
      if (st > 0 || lbs > 0) {
        currentKg = stoneLbsToKg(st, lbs);
      }
    } else {
      const val = parseFloat(weightState.value);
      if (!isNaN(val) && val > 0) {
        currentKg = weightState.unit === 'kg' ? val : lbsToKg(val);
      }
    }

    if (currentKg <= 0) {
      setWeightState((prev) => ({ ...prev, unit: newUnit }));
      return;
    }

    if (newUnit === 'st') {
      const { stone, pounds } = kgToStoneLbs(currentKg);
      setWeightState({
        unit: 'st',
        value: '',
        stone: stone > 0 ? stone.toString() : '',
        pounds: pounds >= 0 ? pounds.toString() : '',
      });
    } else if (newUnit === 'kg') {
      setWeightState({
        unit: 'kg',
        value: (Math.round(currentKg * 10) / 10).toString(),
        stone: '',
        pounds: '',
      });
    } else {
      const lbsVal = kgToLbs(currentKg);
      setWeightState({
        unit: 'lbs',
        value: (Math.round(lbsVal * 10) / 10).toString(),
        stone: '',
        pounds: '',
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Height Section */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Height</Text>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={[styles.toggleBtn, heightState.unit === 'ft' && styles.toggleBtnActive]}
              onPress={() => handleHeightUnitToggle('ft')}
            >
              <Text style={[styles.toggleBtnText, heightState.unit === 'ft' && styles.toggleBtnTextActive]}>
                ft / in
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              style={[styles.toggleBtn, heightState.unit === 'cm' && styles.toggleBtnActive]}
              onPress={() => handleHeightUnitToggle('cm')}
            >
              <Text style={[styles.toggleBtnText, heightState.unit === 'cm' && styles.toggleBtnTextActive]}>
                cm
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {heightState.unit === 'ft' ? (
          <View style={styles.rowInputs}>
            <View style={styles.splitInputContainer}>
              <TextInput
                className="bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800" style={styles.input}
                value={heightState.feet}
                onChangeText={(text) => setHeightState((p) => ({ ...p, feet: text.replace(/[^0-9]/g, '') }))}
                placeholder="5"
                placeholderTextColor="#475569"
                keyboardType="numeric"
                maxLength={2}
              />
              <Text style={styles.unitSuffix}>ft</Text>
            </View>
            <View style={styles.splitInputContainer}>
              <TextInput
                className="bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800" style={styles.input}
                value={heightState.inches}
                onChangeText={(text) => setHeightState((p) => ({ ...p, inches: text.replace(/[^0-9.]/g, '') }))}
                placeholder="5"
                placeholderTextColor="#475569"
                keyboardType="decimal-pad"
                maxLength={4}
              />
              <Text style={styles.unitSuffix}>in</Text>
            </View>
          </View>
        ) : (
          <View style={styles.singleInputContainer}>
            <TextInput
              className="bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800" style={styles.input}
              value={heightState.cm}
              onChangeText={(text) => setHeightState((p) => ({ ...p, cm: text.replace(/[^0-9.]/g, '') }))}
              placeholder="165.1"
              placeholderTextColor="#475569"
              keyboardType="decimal-pad"
              maxLength={5}
            />
            <Text style={styles.unitSuffix}>cm</Text>
          </View>
        )}
      </View>

      {/* Weight Section */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Weight</Text>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={[styles.toggleBtn, weightState.unit === 'st' && styles.toggleBtnActive]}
              onPress={() => handleWeightUnitToggle('st')}
            >
              <Text style={[styles.toggleBtnText, weightState.unit === 'st' && styles.toggleBtnTextActive]}>
                st / lbs
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              style={[styles.toggleBtn, weightState.unit === 'kg' && styles.toggleBtnActive]}
              onPress={() => handleWeightUnitToggle('kg')}
            >
              <Text style={[styles.toggleBtnText, weightState.unit === 'kg' && styles.toggleBtnTextActive]}>
                kg
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              style={[styles.toggleBtn, weightState.unit === 'lbs' && styles.toggleBtnActive]}
              onPress={() => handleWeightUnitToggle('lbs')}
            >
              <Text style={[styles.toggleBtnText, weightState.unit === 'lbs' && styles.toggleBtnTextActive]}>
                lbs
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {weightState.unit === 'st' ? (
          <View style={styles.rowInputs}>
            <View style={styles.splitInputContainer}>
              <TextInput
                className="bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800" style={styles.input}
                value={weightState.stone || ''}
                onChangeText={(text) => setWeightState((p) => ({ ...p, stone: text.replace(/[^0-9]/g, '') }))}
                placeholder="11"
                placeholderTextColor="#475569"
                keyboardType="numeric"
                maxLength={3}
              />
              <Text style={styles.unitSuffix}>st</Text>
            </View>
            <View style={styles.splitInputContainer}>
              <TextInput
                className="bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800" style={styles.input}
                value={weightState.pounds || ''}
                onChangeText={(text) => setWeightState((p) => ({ ...p, pounds: text.replace(/[^0-9.]/g, '') }))}
                placeholder="4"
                placeholderTextColor="#475569"
                keyboardType="decimal-pad"
                maxLength={4}
              />
              <Text style={styles.unitSuffix}>lbs</Text>
            </View>
          </View>
        ) : (
          <View style={styles.singleInputContainer}>
            <TextInput
              className="bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800" style={styles.input}
              value={weightState.value}
              onChangeText={(text) => setWeightState((p) => ({ ...p, value: text.replace(/[^0-9.]/g, '') }))}
              placeholder={weightState.unit === 'kg' ? '70.0' : '155.0'}
              placeholderTextColor="#475569"
              keyboardType="decimal-pad"
              maxLength={6}
            />
            <Text style={styles.unitSuffix}>{weightState.unit}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16, width: '100%' },
  sectionCard: {
    backgroundColor: '#0f172a',
    borderColor: '#1e293b',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#f8fafc' },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#0a0a0a',
    borderRadius: 8,
    padding: 3,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  toggleBtn: { paddingVertical: 5, paddingHorizontal: 10, borderRadius: 6 },
  toggleBtnActive: { backgroundColor: '#4ade80' },
  toggleBtnText: { fontSize: 12, fontWeight: '600', color: '#94a3b8' },
  toggleBtnTextActive: { color: '#0a0a0a', fontWeight: '700' },
  rowInputs: { flexDirection: 'row', gap: 12 },
  splitInputContainer: { flex: 1, position: 'relative', justifyContent: 'center' },
  singleInputContainer: { position: 'relative', justifyContent: 'center' },
  input: {
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '600',
  },
  unitSuffix: {
    position: 'absolute',
    right: 14,
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
});
