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
import { useMuse } from '../../src/hooks/useMuse';
import { EEGWaveform } from '../../src/components/EEGWaveform';
import { BrainWaveChart } from '../../src/components/BrainWaveChart';
import { FREQUENCY_BANDS, FrequencyBand } from '../../src/services/MuseService';

type ViewMode = 'waves' | 'bands' | 'both';

export default function VisualizeScreen() {
  const { state, eegData, bandPowers } = useMuse();
  const [viewMode, setViewMode] = useState<ViewMode>('both');

  const viewModes: { mode: ViewMode; label: string; icon: string }[] = [
    { mode: 'waves', label: 'Waves', icon: 'analytics-outline' },
    { mode: 'bands', label: 'Bands', icon: 'bar-chart-outline' },
    { mode: 'both', label: 'Both', icon: 'grid-outline' },
  ];

  const bandDescriptions: Record<FrequencyBand, string> = {
    delta: 'Deep sleep & healing',
    theta: 'Creativity & meditation',
    alpha: 'Relaxed focus & calm',
    beta: 'Active thinking & alertness',
    gamma: 'Peak performance & insight',
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Brain Activity</Text>
            <Text style={styles.subtitle}>Real-time EEG visualization</Text>
          </View>
          {state.isConnected && (
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          )}
        </View>

        {/* View Mode Selector */}
        <View style={styles.modeSelector}>
          {viewModes.map(({ mode, label, icon }) => (
            <TouchableOpacity
              key={mode}
              style={[
                styles.modeButton,
                viewMode === mode && styles.modeButtonActive,
              ]}
              onPress={() => setViewMode(mode)}
            >
              <Ionicons
                name={icon as any}
                size={18}
                color={viewMode === mode ? '#8B5CF6' : 'rgba(255,255,255,0.5)'}
              />
              <Text
                style={[
                  styles.modeText,
                  viewMode === mode && styles.modeTextActive,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {!state.isConnected ? (
          /* Not Connected State */
          <View style={styles.notConnectedContainer}>
            <View style={styles.notConnectedIcon}>
              <Ionicons name="bluetooth-outline" size={48} color="rgba(255,255,255,0.3)" />
            </View>
            <Text style={styles.notConnectedTitle}>No Muse Connected</Text>
            <Text style={styles.notConnectedText}>
              Connect your Muse headband from the Home screen to see real-time 
              brain activity visualization.
            </Text>
          </View>
        ) : (
          <>
            {/* EEG Waveforms */}
            {(viewMode === 'waves' || viewMode === 'both') && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Raw EEG Signals</Text>
                  <Text style={styles.sectionSubtitle}>4 channels @ 256Hz</Text>
                </View>
                <View style={styles.chartCard}>
                  <EEGWaveform
                    eegData={eegData}
                    signalQuality={state.signalQuality}
                  />
                </View>
              </View>
            )}

            {/* Frequency Bands */}
            {(viewMode === 'bands' || viewMode === 'both') && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Frequency Bands</Text>
                  <Text style={styles.sectionSubtitle}>Power spectrum analysis</Text>
                </View>
                <View style={styles.chartCard}>
                  <BrainWaveChart bandPowers={bandPowers} />
                </View>

                {/* Band Legend */}
                <View style={styles.bandLegend}>
                  {(Object.keys(FREQUENCY_BANDS) as FrequencyBand[]).map((band) => (
                    <View key={band} style={styles.bandItem}>
                      <View
                        style={[
                          styles.bandColor,
                          { backgroundColor: FREQUENCY_BANDS[band].color },
                        ]}
                      />
                      <View style={styles.bandInfo}>
                        <View style={styles.bandHeader}>
                          <Text style={styles.bandName}>
                            {FREQUENCY_BANDS[band].label}
                          </Text>
                          <Text style={styles.bandFreq}>
                            {FREQUENCY_BANDS[band].min}-{FREQUENCY_BANDS[band].max}Hz
                          </Text>
                        </View>
                        <Text style={styles.bandDesc}>{bandDescriptions[band]}</Text>
                      </View>
                      <Text
                        style={[
                          styles.bandValue,
                          { color: FREQUENCY_BANDS[band].color },
                        ]}
                      >
                        {bandPowers ? Math.round(bandPowers[band] * 100) : 0}%
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Brain State Interpretation */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Current Brain State</Text>
              <View style={styles.stateCard}>
                {getBrainStateInterpretation(bandPowers).map((insight, index) => (
                  <View key={index} style={styles.stateItem}>
                    <Ionicons
                      name={insight.icon as any}
                      size={20}
                      color={insight.color}
                    />
                    <View style={styles.stateContent}>
                      <Text style={styles.stateTitle}>{insight.title}</Text>
                      <Text style={styles.stateDesc}>{insight.description}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}

        {/* Spacer for tab bar */}
        <View style={styles.tabBarSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

function getBrainStateInterpretation(bandPowers: any) {
  if (!bandPowers) {
    return [
      {
        icon: 'help-circle-outline',
        title: 'Waiting for data...',
        description: 'Brain activity analysis will appear here',
        color: 'rgba(255,255,255,0.5)',
      },
    ];
  }

  const insights = [];

  // Analyze dominant frequency
  const bands = ['delta', 'theta', 'alpha', 'beta', 'gamma'] as const;
  const dominant = bands.reduce((a, b) =>
    bandPowers[a] > bandPowers[b] ? a : b
  );

  const dominantInsights: Record<string, { icon: string; title: string; description: string; color: string }> = {
    delta: {
      icon: 'moon-outline',
      title: 'Deep Relaxation',
      description: 'Your brain is in a deeply relaxed or drowsy state',
      color: '#8B5CF6',
    },
    theta: {
      icon: 'sparkles-outline',
      title: 'Meditative State',
      description: 'Associated with creativity and light meditation',
      color: '#06B6D4',
    },
    alpha: {
      icon: 'leaf-outline',
      title: 'Relaxed Awareness',
      description: 'Calm and alert - ideal for mindfulness',
      color: '#10B981',
    },
    beta: {
      icon: 'flash-outline',
      title: 'Active Thinking',
      description: 'Engaged in focused, analytical thought',
      color: '#F59E0B',
    },
    gamma: {
      icon: 'rocket-outline',
      title: 'Peak Performance',
      description: 'High-level information processing',
      color: '#EF4444',
    },
  };

  insights.push(dominantInsights[dominant]);

  // Alpha/Theta ratio for meditation quality
  const meditationRatio = bandPowers.alpha + bandPowers.theta;
  if (meditationRatio > 0.6) {
    insights.push({
      icon: 'checkmark-circle-outline',
      title: 'Good for Meditation',
      description: 'High alpha & theta - favorable for mindfulness practice',
      color: '#10B981',
    });
  } else if (bandPowers.beta > 0.5) {
    insights.push({
      icon: 'alert-circle-outline',
      title: 'Mind is Active',
      description: 'Try slowing your breathing to calm beta waves',
      color: '#F59E0B',
    });
  }

  return insights;
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
    alignItems: 'flex-start',
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
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
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
  modeSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    padding: 4,
    marginBottom: 24,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  modeButtonActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
  },
  modeText: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.5)',
  },
  modeTextActive: {
    color: '#8B5CF6',
  },
  notConnectedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  notConnectedIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  notConnectedTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  notConnectedText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 32,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
  },
  chartCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  bandLegend: {
    marginTop: 16,
    gap: 12,
  },
  bandItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  bandColor: {
    width: 4,
    height: 36,
    borderRadius: 2,
  },
  bandInfo: {
    flex: 1,
  },
  bandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  bandName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  bandFreq: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
  },
  bandDesc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  bandValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  stateCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    gap: 16,
    marginTop: 16,
  },
  stateItem: {
    flexDirection: 'row',
    gap: 12,
  },
  stateContent: {
    flex: 1,
  },
  stateTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  stateDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    lineHeight: 18,
  },
  tabBarSpacer: {
    height: 100,
  },
});
