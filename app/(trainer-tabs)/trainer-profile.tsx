import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../ctx/ThemeContext';
import { useAuth } from '../../ctx/AuthContext';

export default function TrainerProfileScreen() {
  const { colors } = useTheme();
  const { profile, signOut } = useAuth();

  const handleInviteClient = async () => {
    if (!profile?.id) return;
    const inviteUrl = `https://fitnessapp.com/signup?coach_id=${profile.id}`;
    const message = `Join my coaching roster on PerformanceArchive: ${inviteUrl}`;
    try {
      await Share.share({
        message,
        url: inviteUrl,
        title: 'Join my coaching roster',
      });
    } catch (error: any) {
      console.error('Error sharing invite:', error.message);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Trainer Profile</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Account settings and credentials
          </Text>
        </View>

        <View style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.avatarCircle, { backgroundColor: 'rgba(74, 222, 128, 0.15)', borderColor: colors.primary }]}>
            <Ionicons name="person" size={36} color={colors.primary} />
          </View>
          <Text style={[styles.name, { color: colors.text }]}>
            {profile?.full_name || 'Coach'}
          </Text>
          <View style={[styles.roleBadge, { backgroundColor: 'rgba(74, 222, 128, 0.15)', borderColor: colors.primary }]}>
            <Ionicons name="shield-checkmark" size={12} color={colors.primaryText} />
            <Text style={[styles.roleBadgeText, { color: colors.primaryText }]}>Certified Trainer</Text>
          </View>
          <Text style={[styles.idText, { color: colors.textMuted }]}>
            Coach ID: {profile?.id || 'Unknown'}
          </Text>
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={handleInviteClient}
            activeOpacity={0.8}
          >
            <Ionicons name="share-social-outline" size={20} color="#020617" />
            <Text style={styles.actionButtonText}>Invite Client</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.signOutButton, { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)' }]}
            onPress={signOut}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  profileCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  idText: {
    fontSize: 12,
    fontFamily: 'Courier',
  },
  section: {
    marginTop: 8,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    paddingVertical: 14,
  },
  actionButtonText: {
    color: '#020617',
    fontSize: 15,
    fontWeight: '700',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
  },
  signOutText: {
    color: '#ef4444',
    fontSize: 15,
    fontWeight: '700',
  },
});
