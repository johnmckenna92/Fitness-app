import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { CustomAlert } from '../../components/CustomAlert';
import { supabase } from '../../lib/supabase';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
  });

  const handleAlertClose = () => {
    const callback = alertConfig.onConfirm;
    setAlertConfig({ visible: false, title: '', message: '' });
    if (callback) callback();
  };

  const handleRegister = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Please enter both email and password.',
      });
      return;
    }

    if (password.length < 6) {
      Toast.show({
        type: 'error',
        text1: 'Weak Password',
        text2: 'Password must be at least 6 characters long.',
      });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Password Mismatch',
        text2: 'Passwords do not match.',
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
      });

      if (error) {
        setAlertConfig({
          visible: true,
          title: 'Registration Failed',
          message: error.message || 'Failed to create account.',
        });
        setLoading(false);
        return;
      }

      // Native email verification: if session is not immediately returned
      if (data?.user && !data?.session) {
        setLoading(false);
        setAlertConfig({
          visible: true,
          title: 'Verify Your Email',
          message:
            'A verification email has been sent. Please confirm your email before logging in.',
          onConfirm: () => router.replace('/auth/login'),
        });
        return;
      }

      setLoading(false);
      router.replace('/');
    } catch (err: any) {
      setLoading(false);
      setAlertConfig({
        visible: true,
        title: 'Registration Failed',
        message: err?.message || 'An unexpected error occurred.',
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Enter your email and password to begin</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="athlete@example.com"
              placeholderTextColor="#64748b"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Minimum 6 characters"
              placeholderTextColor="#64748b"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Re-enter password"
              placeholderTextColor="#64748b"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#020617" />
            ) : (
              <Text style={styles.buttonText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.replace('/auth/login')}>
              <Text style={styles.linkText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>

        <CustomAlert
          visible={alertConfig.visible}
          title={alertConfig.title}
          message={alertConfig.message}
          onClose={handleAlertClose}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  header: { marginBottom: 32 },
  title: { fontSize: 30, fontWeight: 'bold', color: '#f8fafc', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#94a3b8', lineHeight: 22 },
  form: { gap: 18 },
  inputGroup: { gap: 6 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#94a3b8' },
  input: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#f8fafc',
    fontSize: 15,
  },
  button: {
    backgroundColor: '#818cf8',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#020617', fontSize: 16, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 18 },
  footerText: { color: '#94a3b8', fontSize: 14 },
  linkText: { color: '#818cf8', fontSize: 14, fontWeight: '600' },
});
