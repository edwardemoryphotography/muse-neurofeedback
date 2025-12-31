import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MeditationSession } from '../hooks/useMeditationSession';

interface SessionStatsProps {
  session: MeditationSession | null;
  elapsedTime: number;
  isActive: boolean;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  color: string;
  unit?: string;
}

function StatCard({ icon, label, value, color, unit }: StatCardProps) {
  return (
    <View style={[styles.statCard, { borderColor: `${color}30` }]}>
      <View style={[styles.statIconContainer, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={styles.statValueContainer}>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
        {unit && <Text style={styles.statUnit}>{unit}</Text>}
      </View>
    </View>
  );
}

export function SessionStats({ session, elapsedTime, isActive }: SessionStatsProps) {
  const avgCalm = session?.calmHistory.length
    ? Math.round(
        session.calmHistory.reduce((a, b) => a + b, 0) / session.calmHistory.length
      )
    : 0;

  const avgFocus = session?.focusHistory.length
    ? Math.round(
        session.focusHistory.reduce((a, b) => a + b, 0) / session.focusHistory.length
      )
    : 0;

  const peakCalm = session?.calmHistory.length
    ? Math.round(Math.max(...session.calmHistory))
    : 0;

  return (
    <View style={styles.container}>
      <View style={styles.timerContainer}>
        <Text style={styles.timerLabel}>Session Time</Text>
        <Text style={styles.timerValue}>{formatTime(elapsedTime)}</Text>
        {isActive && <View style={styles.liveIndicator} />}
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          icon="leaf-outline"
          label="Avg Calm"
          value={avgCalm}
          color="#10B981"
          unit="%"
        />
        <StatCard
          icon="flash-outline"
          label="Avg Focus"
          value={avgFocus}
          color="#F59E0B"
          unit="%"
        />
        <StatCard
          icon="trending-up-outline"
          label="Peak Calm"
          value={peakCalm}
          color="#8B5CF6"
          unit="%"
        />
        <StatCard
          icon="pulse-outline"
          label="Samples"
          value={session?.bandPowerHistory.length || 0}
          color="#06B6D4"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  timerLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 4,
  },
  timerValue: {
    fontSize: 48,
    fontWeight: '200',
    color: '#ffffff',
    letterSpacing: 4,
  },
  liveIndicator: {
    position: 'absolute',
    top: 0,
    right: '30%',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 8,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  statValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '600',
  },
  statUnit: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
  },
});

export default SessionStats;
