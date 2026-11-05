import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import {
  cmToFeetInches,
  feetInchesToCm,
  HeightInputState,
  HeightUnit,
  kgToLbs,
  lbsToKg,
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
    const currentVal = parseFloat(weightState.value);
    if (!isNaN(currentVal) && currentVal > 0) {
      const converted = newUnit === 'kg' ? lbsToKg(currentVal) : kgToLbs(currentVal);
      setWeightState({ unit: newUnit, value: converted > 0 ? converted.toString() : '' });
    } else {
      setWeightState((prev) => ({ ...prev, unit: newUnit }));
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
                style={styles.input}
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
                style={styles.input}
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
              style={styles.input}
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

        <View style={styles.singleInputContainer}>
          <TextInput
            style={styles.input}
            value={weightState.value}
            onChangeText={(text) => setWeightState((p) => ({ ...p, value: text.replace(/[^0-9.]/g, '') }))}
            placeholder={weightState.unit === 'kg' ? '60.0' : '132.0'}
            placeholderTextColor="#475569"
            keyboardType="decimal-pad"
            maxLength={6}
          />
          <Text style={styles.unitSuffix}>{weightState.unit}</Text>
        </View>
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
    backgroundColor: '#020617',
    borderRadius: 8,
    padding: 3,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  toggleBtn: { paddingVertical: 5, paddingHorizontal: 10, borderRadius: 6 },
  toggleBtnActive: { backgroundColor: '#818cf8' },
  toggleBtnText: { fontSize: 12, fontWeight: '600', color: '#94a3b8' },
  toggleBtnTextActive: { color: '#020617', fontWeight: '700' },
  rowInputs: { flexDirection: 'row', gap: 12 },
  splitInputContainer: { flex: 1, position: 'relative', justifyContent: 'center' },
  singleInputContainer: { position: 'relative', justifyContent: 'center' },
  input: {
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#334155',
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
