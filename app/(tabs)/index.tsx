import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMuseOrSimulator } from '../../src/hooks/useMuseOrSimulator';
import { ConnectionCard } from '../../src/components/ConnectionCard';
import { BrainWaveChart } from '../../src/components/BrainWaveChart';

export default function HomeScreen() {
  const router = useRouter();
  const { 
    state, 
    bandPowers, 
    availableDevices, 
    scan, 
    connect, 
    connectSimulator,
    disconnect,
    isSimulated 
  } = useMuseOrSimulator();
  const [refreshing, setRefreshing] = useState(false);

  const handleConnect = useCallback(async () => {
    try {
      await scan();
      if (availableDevices.length > 0) {
        // For simplicity, connect to the first found device
        // In production, show a device picker
        await connect(availableDevices[0]);
      }
      // Note: scan() now shows simulator option if no devices found
    } catch (error) {
      console.error('Connection error:', error);
      // scan() handles showing simulator option on error
    }
  }, [scan, connect, availableDevices]);

  const handleDemoMode = useCallback(async () => {
    await connectSimulator();
  }, [connectSimulator]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await scan();
    setRefreshing(false);
  }, [scan]);

  const quickActions = [
    {
      icon: 'leaf-outline',
      title: 'Quick Meditation',
      subtitle: '5 min session',
      color: '#10B981',
      route: '/meditate',
    },
    {
      icon: 'pulse-outline',
      title: 'Brain Activity',
      subtitle: 'View EEG',
      color: '#8B5CF6',
      route: '/visualize',
    },
    {
      icon: 'moon-outline',
      title: 'Sleep Focus',
      subtitle: 'Relaxation',
      color: '#06B6D4',
      route: '/meditate',
    },
    {
      icon: 'flash-outline',
      title: 'Focus Session',
      subtitle: 'Concentration',
      color: '#F59E0B',
      route: '/meditate',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#8B5CF6"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back</Text>
            <Text style={styles.title}>Muse Neurofeedback</Text>
          </View>
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        </View>

        {/* Connection Card */}
        <View style={styles.section}>
          <ConnectionCard
            state={state}
            onConnect={handleConnect}
            onDisconnect={disconnect}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.actionCard}
                onPress={() => router.push(action.route as any)}
              >
                <LinearGradient
                  colors={[`${action.color}20`, `${action.color}05`]}
                  style={styles.actionGradient}
                >
                  <View style={[styles.actionIcon, { backgroundColor: `${action.color}30` }]}>
                    <Ionicons name={action.icon as any} size={24} color={action.color} />
                  </View>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Real-time Brain Activity (when connected) */}
        {state.isConnected && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Live Brain Activity</Text>
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            </View>
            <View style={styles.chartContainer}>
              <BrainWaveChart bandPowers={bandPowers} />
            </View>
          </View>
        )}

        {/* Demo Mode Button (when not connected) */}
        {!state.isConnected && (
          <View style={styles.section}>
            <TouchableOpacity style={styles.demoButton} onPress={handleDemoMode}>
              <LinearGradient
                colors={['rgba(6, 182, 212, 0.15)', 'rgba(139, 92, 246, 0.15)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.demoGradient}
              >
                <Ionicons name="play-circle-outline" size={24} color="#06B6D4" />
                <View style={styles.demoContent}>
                  <Text style={styles.demoTitle}>Try Demo Mode</Text>
                  <Text style={styles.demoText}>
                    No Muse headband? Test the app with simulated brain data
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.4)" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Simulated indicator */}
        {isSimulated && state.isConnected && (
          <View style={styles.simulatedBanner}>
            <Ionicons name="information-circle-outline" size={18} color="#06B6D4" />
            <Text style={styles.simulatedText}>
              Using simulated data for demo purposes
            </Text>
          </View>
        )}

        {/* Tips Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Getting Started</Text>
          <View style={styles.tipCard}>
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.1)', 'rgba(6, 182, 212, 0.1)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.tipGradient}
            >
              <Ionicons name="bulb-outline" size={24} color="#F59E0B" />
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Tip: Proper Fit</Text>
                <Text style={styles.tipText}>
                  For best results, ensure the sensors on your Muse are making 
                  good contact with your forehead and behind your ears.
                </Text>
              </View>
            </LinearGradient>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  liveText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#EF4444',
    letterSpacing: 1,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: -8,
  },
  actionCard: {
    width: '48%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  chartContainer: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  tipCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: -8,
  },
  tipGradient: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 20,
  },
  tabBarSpacer: {
    height: 100,
  },
  demoButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  demoGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.2)',
    borderRadius: 16,
  },
  demoContent: {
    flex: 1,
  },
  demoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  demoText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  simulatedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 16,
  },
  simulatedText: {
    fontSize: 12,
    color: '#06B6D4',
  },
});
