import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../ctx/ThemeContext';
import { supabase } from '../../lib/supabase';
import { Profile } from '../../ctx/AuthContext';
import { Image } from 'expo-image';
import Toast from 'react-native-toast-message';
import { showAppAlert } from '../../components/CustomAlert';
import { fetchClientShoppingList, ShoppingAnalyticsSummary } from '../../services/shoppingListService';

export default function ClientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const [client, setClient] = useState<Profile | null>(null);
  const [shoppingSummary, setShoppingSummary] = useState<ShoppingAnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRevoking, setIsRevoking] = useState(false);

  const handleRevokeAccess = () => {
    showAppAlert(
      "Revoke Client Access",
      "Are you sure you want to lock this client's account? They will be locked out until they reactivate on the free tier.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Revoke & Lock",
          style: "destructive",
          onPress: async () => {
            if (!id) return;
            setIsRevoking(true);
            try {
              const { error } = await supabase
                .from("profiles")
                .update({
                  account_status: "locked_trainer_revoked",
                } as any)
                .eq("id", id);

              if (error) throw error;

              Toast.show({
                type: "success",
                text1: "Access Revoked",
                text2: "Client account has been locked.",
              });

              router.back();
            } catch (err: any) {
              console.error("Revoke error:", err);
              Toast.show({
                type: "error",
                text1: "Revocation Failed",
                text2: err?.message || "Could not revoke client access.",
              });
            } finally {
              setIsRevoking(false);
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    async function loadClient() {
      if (!id) return;
      try {
        const [profileRes, shoppingRes] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', id).single(),
          fetchClientShoppingList(id),
        ]);
        if (!profileRes.error && profileRes.data) {
          setClient(profileRes.data);
        }
        setShoppingSummary(shoppingRes);
      } catch (e) {
        console.error('Error loading client details:', e);
      } finally {
        setLoading(false);
      }
    }
    loadClient();
  }, [id]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.borderSubtle }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: colors.surfaceSubtle }]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Client Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : !client ? (
        <View style={styles.center}>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>Client not found.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.avatarSection}>
            {client.avatar_url ? (
              <Image source={{ uri: client.avatar_url }} style={styles.avatar} contentFit="cover" />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback, { backgroundColor: colors.surfaceSubtle }]}>
                <Text style={[styles.fallbackText, { color: colors.primaryText }]}>
                  {(client.full_name || 'C').charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <Text style={[styles.clientName, { color: colors.text }]}>
              {client.full_name || 'Unnamed Client'}
            </Text>
            <Text style={[styles.clientSub, { color: colors.textMuted }]}>
              Goal: {client.goals?.join(', ') || 'General Fitness'}
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderSubtle }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Macro Targets</Text>
            <View style={styles.targetsRow}>
              <View style={styles.targetItem}>
                <Text style={[styles.targetVal, { color: colors.text }]}>{client.target_calories || 2000}</Text>
                <Text style={[styles.targetLabel, { color: colors.textMuted }]}>Calories</Text>
              </View>
              <View style={styles.targetItem}>
                <Text style={[styles.targetVal, { color: colors.text }]}>{client.target_protein || 140}g</Text>
                <Text style={[styles.targetLabel, { color: colors.textMuted }]}>Protein</Text>
              </View>
              <View style={styles.targetItem}>
                <Text style={[styles.targetVal, { color: colors.text }]}>{client.target_carbs || 200}g</Text>
                <Text style={[styles.targetLabel, { color: colors.textMuted }]}>Carbs</Text>
              </View>
              <View style={styles.targetItem}>
                <Text style={[styles.targetVal, { color: colors.text }]}>{client.target_fats || 65}g</Text>
                <Text style={[styles.targetLabel, { color: colors.textMuted }]}>Fats</Text>
              </View>
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderSubtle }]}>
            <View style={styles.analyticsHeaderRow}>
              <View>
                <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 2 }]}>
                  Grocery & Shopping Habits
                </Text>
                <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>
                  Client ingredient procurement adherence
                </Text>
              </View>
              {shoppingSummary && (
                <View style={[styles.adherenceBadge, { backgroundColor: shoppingSummary.adherenceRate >= 80 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(234, 179, 8, 0.15)' }]}>
                  <Text style={[styles.adherenceBadgeText, { color: shoppingSummary.adherenceRate >= 80 ? '#10b981' : '#eab308' }]}>
                    {shoppingSummary.adherenceRate}% ADHERENCE
                  </Text>
                </View>
              )}
            </View>

            {!shoppingSummary || shoppingSummary.totalItems === 0 ? (
              <Text style={[styles.emptySectionText, { color: colors.textMuted }]}>
                No shopping list items recorded for this client yet.
              </Text>
            ) : (
              <View style={styles.analyticsBody}>
                <View style={styles.statsRow}>
                  <View style={styles.statBox}>
                    <Text style={[styles.statVal, { color: colors.text }]}>{shoppingSummary.checkedItems} / {shoppingSummary.totalItems}</Text>
                    <Text style={[styles.statLabel, { color: colors.textMuted }]}>Items Ticked</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={[styles.statVal, { color: colors.text }]}>{shoppingSummary.sections.length}</Text>
                    <Text style={[styles.statLabel, { color: colors.textMuted }]}>Active Aisles</Text>
                  </View>
                </View>

                <View style={styles.aislesList}>
                  {shoppingSummary.sections.map((sec, idx) => {
                    const done = sec.data.filter((i) => i.checked).length;
                    return (
                      <View key={idx} style={[styles.aisleRow, { borderBottomColor: colors.borderSubtle }]}>
                        <Text style={[styles.aisleName, { color: colors.text }]}>{sec.aisle}</Text>
                        <Text style={[styles.aisleCount, { color: colors.textMuted }]}>{done}/{sec.data.length} bought</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}
          </View>

          {/* Revoke Client Access Action */}
          <TouchableOpacity
            style={[styles.revokeBtn, { backgroundColor: colors.destructiveBg, borderColor: colors.destructive }]}
            onPress={handleRevokeAccess}
            disabled={isRevoking}
            activeOpacity={0.7}
          >
            {isRevoking ? (
              <ActivityIndicator size="small" color={colors.destructive} />
            ) : (
              <View style={styles.revokeBtnInner}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.destructive} style={{ marginRight: 8 }} />
                <Text style={[styles.revokeBtnText, { color: colors.destructive }]}>Revoke Client Access & Lock</Text>
              </View>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  revokeBtn: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  revokeBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  revokeBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 18, fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 16 },
  content: { padding: 20 },
  avatarSection: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 12 },
  avatarFallback: { alignItems: 'center', justifyContent: 'center' },
  fallbackText: { fontSize: 32, fontWeight: '700' },
  clientName: { fontSize: 22, fontWeight: '800' },
  clientSub: { fontSize: 14, marginTop: 4 },
  card: { padding: 18, borderRadius: 16, borderWidth: 1, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 16 },
  cardSubtitle: { fontSize: 12, marginBottom: 14 },
  analyticsHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  adherenceBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  adherenceBadgeText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  emptySectionText: { fontSize: 13, fontStyle: 'italic', marginTop: 8 },
  analyticsBody: { marginTop: 12 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statBox: { flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 10, alignItems: 'center' },
  statVal: { fontSize: 16, fontWeight: '800' },
  statLabel: { fontSize: 11, marginTop: 4 },
  aislesList: { gap: 8 },
  aisleRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1 },
  aisleName: { fontSize: 13, fontWeight: '600' },
  aisleCount: { fontSize: 12 },
  targetsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  targetItem: { alignItems: 'center' },
  targetVal: { fontSize: 18, fontWeight: '800' },
  targetLabel: { fontSize: 12, marginTop: 4 },
});
