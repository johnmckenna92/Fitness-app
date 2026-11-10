import React, { useMemo, useState } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { supabase } from '../../lib/supabase';

export default function SignupScreen() {
  const params = useLocalSearchParams<{ coach_id?: string }>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [manualInviteCode, setManualInviteCode] = useState<string | null>(null);
  const inviteCode = manualInviteCode !== null ? manualInviteCode : (params.coach_id || '');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');



  const passwordCriteria = useMemo(() => ({
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  }), [password]);

  const strengthScore = useMemo(() => {
    let score = 0;
    if (passwordCriteria.minLength) score += 1;
    if (passwordCriteria.hasUpper && passwordCriteria.hasLower) score += 1;
    if (passwordCriteria.hasNumber) score += 1;
    return score;
  }, [passwordCriteria]);

  const strengthLabel = useMemo(() => {
    if (!password) return { label: '', color: '#475569' };
    if (strengthScore <= 1) return { label: 'Weak', color: '#ef4444' };
    if (strengthScore === 2) return { label: 'Moderate', color: '#f59e0b' };
    return { label: 'Strong', color: '#10b981' };
  }, [password, strengthScore]);

  const passwordsMatch = useMemo(() => {
    return password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;
  }, [password, confirmPassword]);

  const isFormValid = useMemo(() => {
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    return isEmailValid && passwordCriteria.minLength && passwordsMatch && !loading;
  }, [email, passwordCriteria.minLength, passwordsMatch, loading]);

  const handleSignUp = async () => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanInviteCode = inviteCode.trim();

    if (!cleanEmail || !password || !confirmPassword) {
      Toast.show({ type: 'error', text1: 'Missing Fields', text2: 'Please fill all fields.' });
      return;
    }
    if (!passwordsMatch) {
      Toast.show({ type: 'error', text1: 'Mismatch', text2: 'Passwords do not match.' });
      return;
    }
    if (!passwordCriteria.minLength) {
      Toast.show({ type: 'error', text1: 'Weak Password', text2: 'Must be at least 8 characters.' });
      return;
    }

    setLoading(true);

    let extractedTrainerId: string | undefined = undefined;

    // 1. Lookup & Validate Invite Code
    if (cleanInviteCode) {
      try {
        const { data: inviteData, error: inviteError } = await supabase
          .from('trainer_invites')
          .select('id, trainer_id, expires_at, status')
          .eq('invite_code', cleanInviteCode)
          .eq('status', 'active')
          .maybeSingle();

        const isExpired = inviteData?.expires_at
          ? new Date(inviteData.expires_at) <= new Date()
          : false;

        // 2. Handle Invalid / Expired / Already Used
        if (inviteError || !inviteData || isExpired) {
          setLoading(false);
          Toast.show({
            type: 'error',
            text1: 'Invalid Code',
            text2: 'Invalid or expired invite code.',
          });
          return;
        }

        // 3. Extract Trainer UUID
        extractedTrainerId = inviteData.trainer_id;
      } catch {
        setLoading(false);
        Toast.show({
          type: 'error',
          text1: 'Invalid Code',
          text2: 'Invalid or expired invite code.',
        });
        return;
      }
    }

    try {
      // 4. Create Profile: Inject extracted UUID into trainer_id
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: extractedTrainerId ? { trainer_id: extractedTrainerId } : undefined,
        },
      });

      if (error) {
        setLoading(false);
        Toast.show({ type: 'error', text1: 'Signup Failed', text2: error.message });
        return;
      }

      // 5. Consume Invite & Ensure profile trainer_id linkage
      if (data?.user?.id && cleanInviteCode) {
        try {
          // Attempt atomic RPC first for transaction safety & RLS bypass
          const { error: rpcError } = await supabase.rpc('consume_trainer_invite', {
            p_invite_code: cleanInviteCode,
            p_user_id: data.user.id,
          });

          if (rpcError) {
            // Fallback to direct client-side updates if RPC is not yet applied
            if (extractedTrainerId) {
              await supabase
                .from('profiles')
                .update({ trainer_id: extractedTrainerId })
                .eq('id', data.user.id);
            }

            await supabase
              .from('trainer_invites')
              .update({
                status: 'used',
                used_by_id: data.user.id,
                used_at: new Date().toISOString(),
              })
              .eq('invite_code', cleanInviteCode);
          }

          Toast.show({
            type: 'success',
            text1: 'Coach Linked',
            text2: 'Successfully linked to your coach!',
          });
        } catch (linkErr) {
          console.warn('Error during coach linking or invite consumption:', linkErr);
        }
      }

      setLoading(false);
      setRegisteredEmail(cleanEmail);
      setIsSuccess(true);
    } catch (err: any) {
      setLoading(false);
      Toast.show({ type: 'error', text1: 'Error', text2: err?.message || 'Signup failed.' });
    }
  };

  if (isSuccess) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContainer}>
          <View style={styles.successIconOuter}>
            <Ionicons name="mail-open-outline" size={44} color="#4ade80" />
          </View>
          <Text style={styles.successTitle}>Verify Your Email</Text>
          <Text style={styles.successSubtitle}>We&apos;ve sent a verification link to:</Text>
          <Text style={styles.emailHighlight}>{registeredEmail}</Text>
          <Text style={styles.successInfo}>
            Please check your email and click the confirmation link to activate your account.
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.replace('/(auth)/login')}
          >
            <Text style={styles.primaryButtonText}>Go to Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Enter email and password to begin</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                className="bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800" style={styles.input}
                placeholder="name@example.com"
                placeholderTextColor="#64748b"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  className="bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800" style={styles.inputFlex}
                  placeholder="Min. 8 characters"
                  placeholderTextColor="#64748b"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  editable={!loading}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#94a3b8" />
                </TouchableOpacity>
              </View>
              {password.length > 0 && (
                <View style={styles.strengthContainer}>
                  <View style={styles.strengthBarRow}>
                    <View style={[styles.strengthBar, strengthScore >= 1 && { backgroundColor: strengthLabel.color }]} />
                    <View style={[styles.strengthBar, strengthScore >= 2 && { backgroundColor: strengthLabel.color }]} />
                    <View style={[styles.strengthBar, strengthScore >= 3 && { backgroundColor: strengthLabel.color }]} />
                  </View>
                  <Text style={[styles.strengthText, { color: strengthLabel.color }]}>Strength: {strengthLabel.label}</Text>
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                {confirmPassword.length > 0 && (
                  <Text style={[styles.matchText, { color: passwordsMatch ? '#10b981' : '#ef4444' }]}>
                    {passwordsMatch ? '✓ Match' : '✕ No match'}
                  </Text>
                )}
              </View>
              <View style={[styles.inputWrapper, confirmPassword.length > 0 && (passwordsMatch ? styles.validBorder : styles.invalidBorder)]}>
                <TextInput
                  className="bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800" style={styles.inputFlex}
                  placeholder="Confirm your password"
                  placeholderTextColor="#64748b"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  editable={!loading}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#94a3b8" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>Coach Invite Code (Optional)</Text>
                {inviteCode.trim().length > 0 && (
                  <Text style={[styles.matchText, { color: '#4ade80' }]}>Code Attached</Text>
                )}
              </View>
              <TextInput
                className="bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800" style={styles.input}
                placeholder="Paste coach ID (optional)"
                placeholderTextColor="#64748b"
                value={inviteCode}
                onChangeText={setManualInviteCode}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, (!isFormValid || loading) && styles.primaryButtonDisabled]}
              onPress={handleSignUp}
              disabled={!isFormValid || loading}
              activeOpacity={0.8}
            >
              {loading ? <ActivityIndicator color="#0a0a0a" /> : <Text style={styles.primaryButtonText}>Sign Up</Text>}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
                <Text style={styles.linkText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 32, paddingBottom: 40, justifyContent: 'center', minHeight: '100%' },
  header: { marginBottom: 28 },
  title: { fontSize: 30, fontWeight: '800', color: '#f8fafc', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#94a3b8' },
  form: { gap: 20 },
  inputGroup: { gap: 6 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#94a3b8' },
  input: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    color: '#f8fafc',
    fontSize: 15,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
  },
  inputFlex: { flex: 1, color: '#f8fafc', fontSize: 15, height: '100%' },
  validBorder: { borderColor: '#10b981' },
  invalidBorder: { borderColor: '#ef4444' },
  strengthContainer: { marginTop: 6, gap: 4 },
  strengthBarRow: { flexDirection: 'row', gap: 6 },
  strengthBar: { flex: 1, height: 4, backgroundColor: '#262626', borderRadius: 2 },
  strengthText: { fontSize: 12, fontWeight: '600', alignSelf: 'flex-end' },
  matchText: { fontSize: 12, fontWeight: '600' },
  primaryButton: {
    backgroundColor: '#4ade80',
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  primaryButtonDisabled: { opacity: 0.45 },
  primaryButtonText: { color: '#0a0a0a', fontSize: 16, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 14 },
  footerText: { color: '#94a3b8', fontSize: 14 },
  linkText: { color: '#4ade80', fontSize: 14, fontWeight: '600' },
  successContainer: { flex: 1, paddingHorizontal: 28, justifyContent: 'center', alignItems: 'center' },
  successIconOuter: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: { fontSize: 26, fontWeight: '800', color: '#f8fafc', marginBottom: 10, textAlign: 'center' },
  successSubtitle: { fontSize: 15, color: '#94a3b8', textAlign: 'center', marginBottom: 6 },
  emailHighlight: { fontSize: 16, fontWeight: '700', color: '#4ade80', marginBottom: 16, textAlign: 'center' },
  successInfo: { color: '#94a3b8', fontSize: 14, lineHeight: 22, textAlign: 'center', marginBottom: 32 },
});
