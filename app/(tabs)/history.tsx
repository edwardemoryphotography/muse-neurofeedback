import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Mock data for demonstration - in production, this would come from AsyncStorage or a database
const mockSessions = [
  {
    id: '1',
    date: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    duration: 600, // 10 minutes
    calmScore: 72,
    focusScore: 65,
    type: 'meditation',
  },
  {
    id: '2',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    duration: 900, // 15 minutes
    calmScore: 85,
    focusScore: 78,
    type: 'meditation',
  },
  {
    id: '3',
    date: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
    duration: 300, // 5 minutes
    calmScore: 58,
    focusScore: 62,
    type: 'focus',
  },
  {
    id: '4',
    date: new Date(Date.now() - 1000 * 60 * 60 * 72), // 3 days ago
    duration: 1200, // 20 minutes
    calmScore: 91,
    focusScore: 88,
    type: 'meditation',
  },
];

type TimeFilter = 'week' | 'month' | 'all';

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins < 60) {
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return `${hours}h ${remainingMins}m`;
}

function formatDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export default function HistoryScreen() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('week');

  // Calculate statistics
  const totalMinutes = mockSessions.reduce((acc, s) => acc + s.duration / 60, 0);
  const avgCalm = mockSessions.reduce((acc, s) => acc + s.calmScore, 0) / mockSessions.length;
  const avgFocus = mockSessions.reduce((acc, s) => acc + s.focusScore, 0) / mockSessions.length;
  const currentStreak = 4; // Mock streak

  const timeFilters: { filter: TimeFilter; label: string }[] = [
    { filter: 'week', label: '7 Days' },
    { filter: 'month', label: '30 Days' },
    { filter: 'all', label: 'All Time' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Your Progress</Text>
          <Text style={styles.subtitle}>Track your mindfulness journey</Text>
        </View>

        {/* Time Filter */}
        <View style={styles.filterContainer}>
          {timeFilters.map(({ filter, label }) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                timeFilter === filter && styles.filterButtonActive,
              ]}
              onPress={() => setTimeFilter(filter)}
            >
              <Text
                style={[
                  styles.filterText,
                  timeFilter === filter && styles.filterTextActive,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats Overview */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.15)', 'rgba(139, 92, 246, 0.05)']}
              style={styles.statGradient}
            >
              <Ionicons name="time-outline" size={24} color="#8B5CF6" />
              <Text style={styles.statValue}>{Math.round(totalMinutes)}</Text>
              <Text style={styles.statLabel}>Minutes</Text>
            </LinearGradient>
          </View>

          <View style={styles.statCard}>
            <LinearGradient
              colors={['rgba(16, 185, 129, 0.15)', 'rgba(16, 185, 129, 0.05)']}
              style={styles.statGradient}
            >
              <Ionicons name="leaf-outline" size={24} color="#10B981" />
              <Text style={styles.statValue}>{Math.round(avgCalm)}%</Text>
              <Text style={styles.statLabel}>Avg Calm</Text>
            </LinearGradient>
          </View>

          <View style={styles.statCard}>
            <LinearGradient
              colors={['rgba(245, 158, 11, 0.15)', 'rgba(245, 158, 11, 0.05)']}
              style={styles.statGradient}
            >
              <Ionicons name="flash-outline" size={24} color="#F59E0B" />
              <Text style={styles.statValue}>{Math.round(avgFocus)}%</Text>
              <Text style={styles.statLabel}>Avg Focus</Text>
            </LinearGradient>
          </View>

          <View style={styles.statCard}>
            <LinearGradient
              colors={['rgba(6, 182, 212, 0.15)', 'rgba(6, 182, 212, 0.05)']}
              style={styles.statGradient}
            >
              <Ionicons name="flame-outline" size={24} color="#06B6D4" />
              <Text style={styles.statValue}>{currentStreak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Weekly Chart Placeholder */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Activity</Text>
          <View style={styles.weeklyChart}>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => {
              const height = [60, 80, 40, 100, 70, 90, 30][index];
              const isToday = index === 6;
              return (
                <View key={index} style={styles.dayColumn}>
                  <View style={styles.dayBarContainer}>
                    <View
                      style={[
                        styles.dayBar,
                        {
                          height: `${height}%`,
                          backgroundColor: isToday ? '#8B5CF6' : 'rgba(139, 92, 246, 0.3)',
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.dayLabel,
                      isToday && styles.dayLabelActive,
                    ]}
                  >
                    {day}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Session History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Sessions</Text>
          <View style={styles.sessionList}>
            {mockSessions.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons
                  name="calendar-outline"
                  size={48}
                  color="rgba(255,255,255,0.2)"
                />
                <Text style={styles.emptyText}>No sessions yet</Text>
                <Text style={styles.emptySubtext}>
                  Complete a meditation session to see it here
                </Text>
              </View>
            ) : (
              mockSessions.map((session) => (
                <TouchableOpacity key={session.id} style={styles.sessionCard}>
                  <View style={styles.sessionIcon}>
                    <Ionicons
                      name={session.type === 'meditation' ? 'leaf' : 'flash'}
                      size={20}
                      color={session.type === 'meditation' ? '#10B981' : '#F59E0B'}
                    />
                  </View>
                  <View style={styles.sessionInfo}>
                    <Text style={styles.sessionType}>
                      {session.type === 'meditation' ? 'Meditation' : 'Focus'} Session
                    </Text>
                    <Text style={styles.sessionDate}>{formatDate(session.date)}</Text>
                  </View>
                  <View style={styles.sessionStats}>
                    <View style={styles.sessionStat}>
                      <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.4)" />
                      <Text style={styles.sessionStatText}>
                        {formatDuration(session.duration)}
                      </Text>
                    </View>
                    <View style={styles.sessionScores}>
                      <View style={styles.sessionScore}>
                        <View style={[styles.scoreDot, { backgroundColor: '#10B981' }]} />
                        <Text style={styles.scoreText}>{session.calmScore}%</Text>
                      </View>
                      <View style={styles.sessionScore}>
                        <View style={[styles.scoreDot, { backgroundColor: '#F59E0B' }]} />
                        <Text style={styles.scoreText}>{session.focusScore}%</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>

        {/* Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Insights</Text>
          <View style={styles.insightCard}>
            <View style={styles.insightIcon}>
              <Ionicons name="trending-up" size={24} color="#10B981" />
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>You're improving!</Text>
              <Text style={styles.insightText}>
                Your average calm score has increased by 12% compared to last week.
                Keep up the great work! 🎉
              </Text>
            </View>
          </View>
        </View>

        {/* Spacer for tab bar */}
        <View style={styles.tabBarSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    padding: 4,
    marginBottom: 24,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  filterButtonActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.5)',
  },
  filterTextActive: {
    color: '#8B5CF6',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 28,
  },
  statCard: {
    width: '48%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  statGradient: {
    padding: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  weeklyChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  dayColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  dayBarContainer: {
    flex: 1,
    width: '60%',
    justifyContent: 'flex-end',
  },
  dayBar: {
    width: '100%',
    borderRadius: 4,
    minHeight: 4,
  },
  dayLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '500',
  },
  dayLabelActive: {
    color: '#8B5CF6',
  },
  sessionList: {
    gap: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
  },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  sessionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  sessionDate: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
  },
  sessionStats: {
    alignItems: 'flex-end',
    gap: 4,
  },
  sessionStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sessionStatText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  sessionScores: {
    flexDirection: 'row',
    gap: 8,
  },
  sessionScore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scoreDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  scoreText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
  },
  insightCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    gap: 14,
  },
  insightIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: 4,
  },
  insightText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 20,
  },
  tabBarSpacer: {
    height: 100,
  },
});
