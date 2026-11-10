import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, GestureResponderEvent } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useTheme } from '../../ctx/ThemeContext';
import { Profile } from '../../ctx/AuthContext';
import { DailyLog } from '../../types/database';
import { globalStyles } from '../../constants/Styles';

export type RAGStatus = 'red' | 'amber' | 'green';

export interface RAGAdherence {
  status: RAGStatus;
  color: string;
  label: string;
  totalCalories: number;
  targetCalories: number;
  totalProtein: number;
  targetProtein: number;
  percent: number;
}

export function calculateClientRAG(
  client: Profile,
  todayLogs: DailyLog[],
  themeColors: { success: string; warning: string; error: string }
): RAGAdherence {
  const totalCalories = (todayLogs || []).reduce((sum, l) => sum + (Number(l.calories) || 0), 0);
  const totalProtein = (todayLogs || []).reduce((sum, l) => sum + (Number(l.protein) || 0), 0);
  const targetCalories = Number(client.target_calories) || 2000;
  const targetProtein = Number(client.target_protein) || 140;
  const variancePct = (Number(client.macro_variance) || 20) / 100;

  if (!todayLogs || todayLogs.length === 0 || totalCalories === 0) {
    return {
      status: 'red',
      color: themeColors.error,
      label: 'No Logs',
      totalCalories,
      targetCalories,
      totalProtein,
      targetProtein,
      percent: 0,
    };
  }

  const calorieDiffRatio = Math.abs(totalCalories - targetCalories) / targetCalories;
  const percent = Math.round((totalCalories / targetCalories) * 100);

  if (calorieDiffRatio <= variancePct) {
    return {
      status: 'green',
      color: themeColors.success,
      label: 'On Target',
      totalCalories,
      targetCalories,
      totalProtein,
      targetProtein,
      percent,
    };
  }

  return {
    status: 'amber',
    color: themeColors.warning,
    label: calorieDiffRatio > 0.4 ? 'Off Track' : 'In Progress',
    totalCalories,
    targetCalories,
    totalProtein,
    targetProtein,
    percent,
  };
}
interface ClientCardProps {
  client: Profile;
  todayLogs: DailyLog[];
  onNudge: (client: Profile) => void;
}

export const ClientCard: React.FC<ClientCardProps> = ({ client, todayLogs, onNudge }) => {
  const { colors } = useTheme();
  const adherence = calculateClientRAG(client, todayLogs, colors);

  const handleNudgePress = (e: GestureResponderEvent) => {
    e.stopPropagation();
    onNudge(client);
  };

  const displayName = client.full_name || 'Client';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <Link href={`/client/${client.id}` as any} asChild>
      <TouchableOpacity
        activeOpacity={0.8}
        style={StyleSheet.flatten([
          globalStyles.clientCard,
          { backgroundColor: colors.surface, borderColor: colors.borderSubtle },
        ])}
      >
        <View style={globalStyles.avatarContainer}>
          {client.avatar_url ? (
            <Image
              source={{ uri: client.avatar_url }}
              style={globalStyles.avatar}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View style={[globalStyles.avatarFallback, { backgroundColor: colors.surfaceSubtle }]}>
              <Text style={[globalStyles.fallbackText, { color: colors.primaryText }]}>{initial}</Text>
            </View>
          )}
          <View
            style={[
              globalStyles.ragBadge,
              { backgroundColor: adherence.color, borderColor: colors.surface },
            ]}
          />
        </View>

        <View style={globalStyles.contentContainer}>
          <View style={globalStyles.nameRow}>
            <Text style={[globalStyles.clientName, { color: colors.text }]} numberOfLines={1}>
              {displayName}
            </Text>
            <View
              style={[
                globalStyles.statusPill,
                { backgroundColor: `${adherence.color}1A`, borderColor: adherence.color },
              ]}
            >
              <Text style={[globalStyles.statusPillText, { color: adherence.color }]}>
                {adherence.label}
              </Text>
            </View>
          </View>

          <View style={globalStyles.metricsRow}>
            <View style={globalStyles.metricItem}>
              <Ionicons name="flame" size={13} color={colors.textSecondary} />
              <Text style={[globalStyles.metricText, { color: colors.textSecondary }]}>
                {adherence.totalCalories.toLocaleString()} / {adherence.targetCalories.toLocaleString()} kcal
              </Text>
            </View>
            <View style={globalStyles.metricDivider} />
            <View style={globalStyles.metricItem}>
              <Ionicons name="barbell-outline" size={13} color={colors.textSecondary} />
              <Text style={[globalStyles.metricText, { color: colors.textSecondary }]}>
                {adherence.totalProtein}g / {adherence.targetProtein}g P
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleNudgePress}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={[
            globalStyles.nudgeButton,
            { backgroundColor: 'rgba(74, 222, 128, 0.12)', borderColor: colors.primary },
          ]}
        >
          <Ionicons name="notifications-outline" size={18} color={colors.primaryText} />
          <Text style={[globalStyles.nudgeButtonText, { color: colors.primaryText }]}>Nudge</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Link>
  );
};


