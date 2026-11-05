import React, { useState, useEffect } from 'react';
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
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { supabase } from '../../lib/supabase';

export default function UpdatePasswordScreen() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const localParams = useLocalSearchParams();

  useEffect(() => {
    const handleUrl = async (urlString: string | null) => {
      if (!urlString) return;
      try {
        const hashIdx = urlString.indexOf('#');
        const queryIdx = urlString.indexOf('?');
        const params: Record<string, string> = {};

        if (queryIdx !== -1) {
          const queryPart = hashIdx !== -1 && hashIdx > queryIdx
            ? urlString.substring(queryIdx + 1, hashIdx)
            : urlString.substring(queryIdx + 1);
          new URLSearchParams(queryPart).forEach((v, k) => { params[k] = v; });
        }
        if (hashIdx !== -1) {
          new URLSearchParams(urlString.substring(hashIdx + 1)).forEach((v, k) => { params[k] = v; });
        }

        if (params.error || params.error_description) {
          const msg = params.error_description
            ? decodeURIComponent(params.error_description.replace(/\+/g, ' '))
            : (params.error || 'The reset link is invalid or has expired.');
          Alert.alert('Link Expired or Invalid', msg, [
            { text: 'Request New Link', onPress: () => router.replace('/auth/forgot-password') }
          ]);
          return;
        }

        if (params.access_token && params.refresh_token) {
          await supabase.auth.setSession({
            access_token: params.access_token,
            refresh_token: params.refresh_token,
          });
        } else if (params.code) {
          await supabase.auth.exchangeCodeForSession(params.code);
        }
      } catch (err: any) {
        console.error('Error handling reset url tokens:', err);
      }
    };

    Linking.getInitialURL().then(handleUrl);
    const sub = Linking.addEventListener('url', (e) => handleUrl(e.url));
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (localParams.code && typeof localParams.code === 'string') {
      supabase.auth.exchangeCodeForSession(localParams.code).catch((err) => {
        console.error('exchangeCodeForSession error:', err);
      });
    }
  }, [localParams.code]);

  const handleUpdatePassword = async () => {
    if (!newPassword.trim()) {
      Alert.alert('Error', 'Please enter a new password.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match. Please verify your new password.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      setLoading(false);

      if (error) {
        Alert.alert('Update Failed', error.message);
        return;
      }

      await supabase.auth.signOut();
      Alert.alert(
        'Password Updated',
        'Your password has been successfully updated. Please sign in with your new password.',
        [{ text: 'Sign In', onPress: () => router.replace('/auth/login') }]
      );
    } catch (err: any) {
      setLoading(false);
      Alert.alert('Error', err?.message || 'Failed to update password.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.kb}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            <View style={styles.iconCircle}>
              <Ionicons name="key-outline" size={36} color="#818cf8" />
            </View>
            <Text style={styles.title}>Update Password</Text>
            <Text style={styles.subtitle}>Enter and confirm your new password below.</Text>

            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="New Password"
                placeholderTextColor="#64748b"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Confirm New Password"
                placeholderTextColor="#64748b"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            <TouchableOpacity style={styles.btn} onPress={handleUpdatePassword} disabled={loading}>
              {loading ? <ActivityIndicator color="#020617" /> : <Text style={styles.btnText}>Update Password</Text>}
            </TouchableOpacity>

            <View style={styles.footer}>
              <TouchableOpacity onPress={() => router.replace('/auth/login')}>
                <Text style={styles.linkText}>Back to Sign In</Text>
              </TouchableOpacity>
            </View>
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
  content: { flex: 1, justifyContent: 'center' },
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
    alignSelf: 'center',
  },
  title: { fontSize: 28, fontWeight: 'bold', color: '#f8fafc', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 15, color: '#94a3b8', lineHeight: 22, marginBottom: 28, textAlign: 'center' },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderColor: '#1e293b',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    color: '#f8fafc',
    paddingVertical: 16,
    fontSize: 16,
  },
  eyeBtn: { padding: 4 },
  btn: {
    backgroundColor: '#818cf8',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  btnText: { color: '#020617', fontSize: 16, fontWeight: 'bold' },
  footer: { alignItems: 'center', marginTop: 24 },
  linkText: { color: '#818cf8', fontSize: 14, fontWeight: '600' },
});

