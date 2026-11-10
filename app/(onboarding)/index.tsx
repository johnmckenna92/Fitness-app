import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../ctx/AuthContext';
import { validateImageSafety } from '../../lib/gemini';
import { uploadAvatar } from '../../lib/storage';
import { SexOption, useOnboarding } from '../../ctx/OnboardingContext';
import { setIsIntentionalBackground } from '../_layout';
import { showAppAlert } from '../../components/CustomAlert';
import { useTheme } from '../../ctx/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function IdentityScreen() {
  const router = useRouter();
  const { session, profile, suppressLockForPicker } = useAuth();
  const { data, updateData } = useOnboarding();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const initialFirst = data.firstName || (profile?.full_name ? profile.full_name.trim().split(/\s+/)[0] || '' : '');
  const initialLast = data.lastName || (profile?.full_name ? profile.full_name.trim().split(/\s+/).slice(1).join(' ') || '' : '');

  const [firstName, setFirstName] = useState(initialFirst);
  const [lastName, setLastName] = useState(initialLast);
  const [age, setAge] = useState(data.age);
  const [sex, setSex] = useState<SexOption>(data.sex);
  const [avatarUrl, setAvatarUrl] = useState(data.avatarUrl);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const processImageResult = async (result: ImagePicker.ImagePickerResult) => {
    if (result.canceled || !result.assets || result.assets.length === 0) {
      return;
    }

    setIsUploadingImage(true);
    try {
      const asset = result.assets[0];

      const manipResult = await ImageManipulator.manipulateAsync(
        asset.uri,
        [{ resize: { width: 500, height: 500 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );

      if (!manipResult.base64) {
        throw new Error('Could not process compressed image data.');
      }

      const safety = await validateImageSafety(manipResult.base64);
      if (!safety.isSafe) {
        Toast.show({
          type: 'error',
          text1: 'Image Inappropriate',
          text2: safety.reason || 'This photo does not meet safety guidelines.',
        });
        return;
      }

      const userId = session?.user?.id || 'temp_user';
      const uploadedUrl = await uploadAvatar(userId, manipResult.base64, 'image/jpeg');

      if (uploadedUrl) {
        setAvatarUrl(uploadedUrl);
        updateData({ avatarUrl: uploadedUrl });
        Toast.show({
          type: 'success',
          text1: 'Avatar Uploaded',
          text2: 'Your profile picture has been saved.',
        });
      }
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Upload Failed',
        text2: err?.message || 'Failed to process image.',
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handlePickImage = () => {
    showAppAlert('Profile Picture', 'Choose an option', [
      {
        text: 'Take a Photo',
        onPress: async () => {
          try {
            suppressLockForPicker();
            setIsIntentionalBackground(true);
            const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
            if (!permissionResult.granted) {
              Toast.show({
                type: 'error',
                text1: 'Permission Denied',
                text2: 'Camera permission is required to take a photo.',
              });
              return;
            }

            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.7,
            });

            await processImageResult(result);
          } catch (err: any) {
            Toast.show({
              type: 'error',
              text1: 'Camera Error',
              text2: err?.message || 'Failed to capture photo.',
            });
          }
        },
      },
      {
        text: 'Choose from Gallery',
        onPress: async () => {
          try {
            suppressLockForPicker();
            setIsIntentionalBackground(true);
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permissionResult.granted) {
              Toast.show({
                type: 'error',
                text1: 'Permission Denied',
                text2: 'Camera roll permission is required to upload an avatar.',
              });
              return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.7,
            });

            await processImageResult(result);
          } catch (err: any) {
            Toast.show({
              type: 'error',
              text1: 'Upload Failed',
              text2: err?.message || 'Failed to select image.',
            });
          }
        },
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]);
  };

  const handleNext = () => {
    if (!firstName.trim()) {
      Toast.show({ type: 'error', text1: 'Required', text2: 'Please enter your first name.' });
      return;
    }
    if (!age || parseInt(age, 10) <= 0 || parseInt(age, 10) > 120) {
      Toast.show({ type: 'error', text1: 'Invalid Age', text2: 'Please enter a valid age (1-120).' });
      return;
    }
    if (!sex) {
      Toast.show({ type: 'error', text1: 'Select Sex', text2: 'Required for metabolic BMR calculation.' });
      return;
    }

    updateData({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      age: age.trim(),
      sex,
      avatarUrl,
    });
    router.push('/(onboarding)/metrics' as any);
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
          <Text style={[styles.title, { color: colors.text }]}>Who Are You?</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Personalize your coaching profile with your core identity and photo.
          </Text>
        </View>

        {/* Profile Picture Upload */}
        <View style={styles.avatarSection}>
          <TouchableOpacity
            style={styles.avatarButton}
            onPress={handlePickImage}
            disabled={isUploadingImage}
            activeOpacity={0.8}
          >
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="camera-outline" size={32} color="#4ade80" />
                <Text style={styles.avatarPlaceholderText}>Add Photo</Text>
              </View>
            )}

            {isUploadingImage && (
              <View style={styles.avatarOverlay}>
                <ActivityIndicator size="small" color="#f8fafc" />
              </View>
            )}

            <View style={styles.cameraBadge}>
              <Ionicons name="cloud-upload" size={13} color="#020617" />
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarCaption}>
            Tap to upload avatar to Supabase Storage
          </Text>
        </View>

        {/* Form Inputs */}
        <View style={styles.form}>
          <View style={styles.nameRow}>
            <View style={styles.inputGroupFlex}>
              <Text style={[styles.label, { color: colors.text }]}>First Name *</Text>
              <TextInput
                className="bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800" style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Alex"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroupFlex}>
              <Text style={[styles.label, { color: colors.text }]}>Last Name</Text>
              <TextInput
                className="bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800" style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Smith"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Age *</Text>
            <TextInput
              className="bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800" style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
              value={age}
              onChangeText={(text) => setAge(text.replace(/[^0-9]/g, ''))}
              placeholder="28"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              maxLength={3}
            />
          </View>

          {/* Biological Sex Selector */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Biological Sex *</Text>
            <Text style={[styles.fieldNote, { color: colors.textMuted }]}>
              Required for basal metabolic rate (BMR) calculations.
            </Text>
            <View style={styles.sexSelector}>
              {(['male', 'female', 'other'] as SexOption[]).map((option) => {
                const isSelected = sex === option;
                const label = option.charAt(0).toUpperCase() + option.slice(1);
                return (
                  <TouchableOpacity
                    key={option}
                    style={[styles.sexButton, { backgroundColor: isSelected ? colors.primary : colors.inputBg, borderColor: isSelected ? colors.primary : colors.border }]}
                    onPress={() => setSex(option)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={
                        option === 'male'
                          ? 'male'
                          : option === 'female'
                          ? 'female'
                          : 'person'
                      }
                      size={18}
                      color={isSelected ? '#0a0a0a' : colors.textMuted}
                    />
                    <Text
                      style={[styles.sexButtonText, { color: isSelected ? '#0a0a0a' : colors.textSecondary }]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryBtnText}>Continue to Metrics</Text>
          <Ionicons name="arrow-forward" size={18} color="#020617" />
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  scrollContent: { flexGrow: 1, padding: 24, paddingBottom: 48 },
  header: { marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '800', color: '#f8fafc', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#94a3b8', lineHeight: 22 },
  avatarSection: { alignItems: 'center', marginBottom: 24 },
  avatarButton: {
    position: 'relative',
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: '#0f172a',
    borderWidth: 2,
    borderColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%', borderRadius: 52 },
  avatarPlaceholder: { alignItems: 'center', gap: 4 },
  avatarPlaceholderText: { fontSize: 11, fontWeight: '700', color: '#4ade80' },
  avatarOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(2, 6, 23, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 3,
    right: 3,
    backgroundColor: '#4ade80',
    borderRadius: 13,
    width: 26,
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0a0a0a',
  },
  avatarCaption: { fontSize: 12, color: '#64748b', marginTop: 8 },
  form: { gap: 18, marginBottom: 28 },
  nameRow: { flexDirection: 'row', gap: 12 },
  inputGroupFlex: { flex: 1, gap: 6 },
  inputGroup: { gap: 6 },
  label: { fontSize: 14, fontWeight: '600', color: '#cbd5e1' },
  fieldNote: { fontSize: 12, color: '#64748b' },
  input: {
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#262626',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#f8fafc',
    fontSize: 16,
  },
  sexSelector: { flexDirection: 'row', gap: 10, marginTop: 4 },
  sexButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: '#262626',
    borderRadius: 12,
    paddingVertical: 14,
  },
  sexButtonActive: { backgroundColor: '#4ade80', borderColor: '#4ade80' },
  sexButtonText: { fontSize: 14, fontWeight: '600', color: '#94a3b8' },
  sexButtonTextActive: { color: '#0a0a0a', fontWeight: '700' },
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
});



