import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useTheme } from '../../ctx/ThemeContext';
import { useAuth, Profile } from '../../ctx/AuthContext';
import { supabase } from '../../lib/supabase';
import { DailyLog } from '../../types/database';
import { ClientCard, calculateClientRAG } from '../../components/trainer/ClientCard';

export default function TrainerRosterScreen() {
  const { colors } = useTheme();
  const { session, profile: trainerProfile } = useAuth();
  const [clients, setClients] = useState<Profile[]>([]);
  const [logsByClient, setLogsByClient] = useState<Record<string, DailyLog[]>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const trainerId = session?.user?.id || trainerProfile?.id;

  const fetchRosterData = useCallback(async () => {
    if (!trainerId) {
      setLoading(false);
      return;
    }

    try {
      const { data: clientsData, error: clientsError } = await supabase
        .from('profiles')
        .select('*')
        .eq('trainer_id', trainerId)
        .order('full_name', { ascending: true });

      if (clientsError) {
        console.error('Error fetching clients:', clientsError);
        return;
      }

      const clientList = (clientsData as Profile[]) || [];
      setClients(clientList);

      if (clientList.length === 0) {
        setLogsByClient({});
        return;
      }

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const clientIds = clientList.map((c) => c.id);

      const { data: logsData, error: logsError } = await supabase
        .from('daily_logs')
        .select('*')
        .in('user_id', clientIds)
        .gte('logged_at', todayStart.toISOString())
        .lte('logged_at', todayEnd.toISOString());

      if (logsError) {
        console.error('Error fetching daily logs:', logsError);
        return;
      }

      const logsMap: Record<string, DailyLog[]> = {};
      clientList.forEach((c) => {
        logsMap[c.id] = [];
      });

      ((logsData as DailyLog[]) || []).forEach((log) => {
        if (logsMap[log.user_id]) {
          logsMap[log.user_id].push(log);
        }
      });

      setLogsByClient(logsMap);
    } catch (err) {
      console.error('Unexpected error loading roster:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [trainerId]);

  useEffect(() => {
    let ignore = false;
    const run = async () => {
      if (!ignore) {
        await fetchRosterData();
      }
    };
    void run();
    return () => {
      ignore = true;
    };
  }, [fetchRosterData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRosterData();
  };

  const handleNudge = (client: Profile) => {
    const name = client.full_name || 'Client';
    Toast.show({
      type: 'success',
      text1: `Nudge Sent to ${name}`,
      text2: 'Adherence check-in notification dispatched.',
      visibilityTime: 3000,
    });
  };

  const stats = useMemo(() => {
    let green = 0;
    let amber = 0;
    let red = 0;

    clients.forEach((client) => {
      const logs = logsByClient[client.id] || [];
      const { status } = calculateClientRAG(client, logs, colors);
      if (status === 'green') green++;
      else if (status === 'amber') amber++;
      else red++;
    });

    return { green, amber, red, total: clients.length };
  }, [clients, logsByClient, colors]);


  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.titleRow}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Client Roster</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Live macro compliance and athlete command center
          </Text>
        </View>
        <View style={[styles.badge, { backgroundColor: 'rgba(74, 222, 128, 0.15)', borderColor: colors.primary }]}>
          <Ionicons name="shield-checkmark" size={13} color={colors.primaryText} />
          <Text style={[styles.badgeText, { color: colors.primaryText }]}>Trainer Portal</Text>
        </View>
      </View>

      {clients.length > 0 && (
        <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.borderSubtle }]}>
          <View style={styles.summaryItem}>
            <View style={[styles.summaryDot, { backgroundColor: colors.success }]} />
            <Text style={[styles.summaryCount, { color: colors.text }]}>{stats.green}</Text>
            <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>On Target</Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: colors.borderSubtle }]} />
          <View style={styles.summaryItem}>
            <View style={[styles.summaryDot, { backgroundColor: colors.warning }]} />
            <Text style={[styles.summaryCount, { color: colors.text }]}>{stats.amber}</Text>
            <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Attention</Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: colors.borderSubtle }]} />
          <View style={styles.summaryItem}>
            <View style={[styles.summaryDot, { backgroundColor: colors.error }]} />
            <Text style={[styles.summaryCount, { color: colors.text }]}>{stats.red}</Text>
            <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>No Logs</Text>
          </View>
        </View>
      )}
    </View>
  );

  const handleInviteClient = async () => {
    if (!trainerId) return;
    const inviteUrl = `https://fitnessapp.com/signup?coach_id=${trainerId}`;
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

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.borderSubtle }]}>
        <View style={[styles.iconContainer, { backgroundColor: 'rgba(74, 222, 128, 0.1)' }]}>
          <Ionicons name="people-outline" size={36} color={colors.primary} />
        </View>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>No Clients Assigned</Text>
        <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
          When athletes link to your trainer profile, their real-time macro compliance and daily logs will appear here.
        </Text>
        <TouchableOpacity
          style={[styles.emptyInviteButton, { backgroundColor: colors.primary }]}
          onPress={handleInviteClient}
          activeOpacity={0.8}
        >
          <Ionicons name="share-social-outline" size={18} color="#0a0a0a" />
          <Text style={styles.emptyInviteButtonText}>Invite Client</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={clients}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ClientCard
              client={item}
              todayLogs={logsByClient[item.id] || []}
              onNudge={handleNudge}
            />
          )}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },
  headerContainer: {
    marginBottom: 16,
  },
  titleRow: {
    gap: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 14,
    borderWidth: 1,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  summaryCount: {
    fontSize: 15,
    fontWeight: '800',
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  summaryDivider: {
    width: 1,
    height: 18,
  },
  emptyCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    marginTop: 20,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  emptyInviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyInviteButtonText: {
    color: '#0a0a0a',
    fontSize: 14,
    fontWeight: '700',
  },
});

