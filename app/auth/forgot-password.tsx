import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const handleResetPassword = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      Alert.alert('Error', 'Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
        redirectTo: 'fitnessapp://update-password',
      });
      setLoading(false);

      if (error) {
        Alert.alert('Error', error.message);
        return;
      }

      setSubmittedEmail(trimmed);
      setIsSubmitted(true);
      Alert.alert(
        'Check Your Inbox',
        `A password reset link has been sent to ${trimmed}. Please check your inbox and tap the link to reset your password.`,
        [{ text: 'OK' }]
      );
    } catch (err: any) {
      setLoading(false);
      Alert.alert('Error', err?.message || 'Failed to send reset link.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.kb}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/auth/login')}>
            <Ionicons name="arrow-back" size={24} color="#f8fafc" />
          </TouchableOpacity>

          <View style={styles.content}>
            {isSubmitted ? (
              <View style={styles.successBox}>
                <View style={styles.iconCircle}>
                  <Ionicons name="mail-unread-outline" size={36} color="#818cf8" />
                </View>
                <Text style={styles.title}>Check Your Inbox</Text>
                <Text style={styles.subtitle}>A password reset link has been sent to:</Text>
                <Text style={styles.emailHighlight}>{submittedEmail}</Text>
                <Text style={styles.infoText}>
                  Please check your inbox (and spam folder) and click the link to update your password.
                </Text>
                <TouchableOpacity style={styles.btn} onPress={() => router.replace('/auth/login')}>
                  <Text style={styles.btnText}>Back to Sign In</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secBtn} onPress={() => setIsSubmitted(false)}>
                  <Text style={styles.secBtnText}>Try another email</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Text style={styles.title}>Reset Password</Text>
                <Text style={styles.subtitle}>
                  Enter your email address and we'll send you a link to reset your password.
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#64748b"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                  editable={!loading}
                />
                <TouchableOpacity style={styles.btn} onPress={handleResetPassword} disabled={loading}>
                  {loading ? <ActivityIndicator color="#020617" /> : <Text style={styles.btnText}>Send Reset Link</Text>}
                </TouchableOpacity>
                <View style={styles.footer}>
                  <Text style={styles.footerText}>Remember your password? </Text>
                  <TouchableOpacity onPress={() => router.replace('/auth/login')}>
                    <Text style={styles.linkText}>Sign In</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  kb: { flex: 1 },
  scroll: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  content: { flex: 1, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#f8fafc', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#94a3b8', lineHeight: 22, marginBottom: 24 },
  input: {
    backgroundColor: '#0f172a',
    borderColor: '#1e293b',
    borderWidth: 1,
    borderRadius: 8,
    color: '#f8fafc',
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  btn: {
    backgroundColor: '#818cf8',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  btnText: { color: '#020617', fontSize: 16, fontWeight: 'bold' },
  secBtn: { padding: 14, alignItems: 'center', marginTop: 8 },
  secBtnText: { color: '#94a3b8', fontSize: 14, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  footerText: { color: '#94a3b8', fontSize: 14 },
  linkText: { color: '#818cf8', fontSize: 14, fontWeight: '600' },
  successBox: { alignItems: 'center', paddingVertical: 16 },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#0f172a',
    borderWidth: 2,
    borderColor: '#818cf8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emailHighlight: { fontSize: 16, fontWeight: '700', color: '#818cf8', marginBottom: 16, textAlign: 'center' },
  infoText: { color: '#94a3b8', fontSize: 14, lineHeight: 20, textAlign: 'center', marginBottom: 24 },
});
