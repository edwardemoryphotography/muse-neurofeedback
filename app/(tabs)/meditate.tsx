import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useMuseOrSimulator } from '../../src/hooks/useMuseOrSimulator';
import { useMeditationSession } from '../../src/hooks/useMeditationSession';
import { CalmMeter } from '../../src/components/CalmMeter';
import { SessionStats } from '../../src/components/SessionStats';
import { BrainWaveChart } from '../../src/components/BrainWaveChart';

type SessionDuration = 5 | 10 | 15 | 20 | 30;

export default function MeditateScreen() {
  const { state, bandPowers, isSimulated } = useMuseOrSimulator();
  const {
    session,
    isActive,
    currentCalm,
    currentFocus,
    elapsedTime,
    start,
    stop,
    pause,
    resume,
    updateWithBandPowers,
  } = useMeditationSession();

  const [selectedDuration, setSelectedDuration] = useState<SessionDuration>(10);
  const [isPaused, setIsPaused] = useState(false);

  // Update meditation session with band powers
  useEffect(() => {
    if (bandPowers && isActive && !isPaused) {
      updateWithBandPowers(bandPowers);
    }
  }, [bandPowers, isActive, isPaused, updateWithBandPowers]);

  // Auto-stop session when duration reached
  useEffect(() => {
    if (isActive && elapsedTime >= selectedDuration * 60) {
      handleStop();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Session Complete! 🧘',
        `Great job! You completed a ${selectedDuration} minute meditation session.`,
        [{ text: 'View Results', onPress: () => {} }]
      );
    }
  }, [elapsedTime, selectedDuration, isActive]);

  const handleStart = useCallback(() => {
    if (!state.isConnected) {
      Alert.alert(
        'Muse Not Connected',
        'Please connect your Muse headband from the Home screen to track your brain activity during meditation.',
        [
          { text: 'Start Anyway', onPress: () => start() },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } else {
      start();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [state.isConnected, start]);

  const handleStop = useCallback(() => {
    const completedSession = stop();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsPaused(false);
    
    if (completedSession && completedSession.duration > 30) {
      // Show summary for sessions > 30 seconds
      Alert.alert(
        'Session Summary',
        `Duration: ${Math.floor(completedSession.duration / 60)}:${(completedSession.duration % 60).toString().padStart(2, '0')}\n` +
        `Average Calm: ${Math.round(completedSession.calmScore)}%\n` +
        `Average Focus: ${Math.round(completedSession.focusScore)}%`,
        [{ text: 'Done' }]
      );
    }
  }, [stop]);

  const handlePauseResume = useCallback(() => {
    if (isPaused) {
      resume();
      setIsPaused(false);
    } else {
      pause();
      setIsPaused(true);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [isPaused, pause, resume]);

  const durations: SessionDuration[] = [5, 10, 15, 20, 30];

  const remainingTime = Math.max(0, selectedDuration * 60 - elapsedTime);
  const progress = elapsedTime / (selectedDuration * 60);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Meditation</Text>
          <Text style={styles.subtitle}>
            {isActive ? 'Focus on your breath' : 'Find your calm'}
          </Text>
        </View>

        {/* Calm Meter */}
        <View style={styles.meterSection}>
          <CalmMeter
            value={isActive ? currentCalm : 0}
            label={isActive ? 'Calm' : 'Ready'}
            showBreathingGuide={isActive && !isPaused}
          />
        </View>

        {/* Session Controls */}
        {!isActive ? (
          <View style={styles.setupSection}>
            {/* Duration Selector */}
            <Text style={styles.sectionLabel}>Session Duration</Text>
            <View style={styles.durationSelector}>
              {durations.map((duration) => (
                <TouchableOpacity
                  key={duration}
                  style={[
                    styles.durationButton,
                    selectedDuration === duration && styles.durationButtonActive,
                  ]}
                  onPress={() => setSelectedDuration(duration)}
                >
                  <Text
                    style={[
                      styles.durationText,
                      selectedDuration === duration && styles.durationTextActive,
                    ]}
                  >
                    {duration}
                  </Text>
                  <Text
                    style={[
                      styles.durationUnit,
                      selectedDuration === duration && styles.durationUnitActive,
                    ]}
                  >
                    min
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Start Button */}
            <TouchableOpacity style={styles.startButton} onPress={handleStart}>
              <LinearGradient
                colors={['#8B5CF6', '#7C3AED']}
                style={styles.startButtonGradient}
              >
                <Ionicons name="play" size={28} color="#ffffff" />
                <Text style={styles.startButtonText}>Begin Session</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Connection Status */}
            <View style={styles.connectionStatus}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: state.isConnected ? '#10B981' : '#F59E0B' },
                ]}
              />
              <Text style={styles.statusText}>
                {state.isConnected
                  ? `Connected to ${state.deviceName}`
                  : 'Muse not connected - meditation without EEG tracking'}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.activeSection}>
            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[styles.progressFill, { width: `${progress * 100}%` }]}
                />
              </View>
              <View style={styles.progressLabels}>
                <Text style={styles.progressTime}>
                  {Math.floor(remainingTime / 60)}:{(remainingTime % 60).toString().padStart(2, '0')}
                </Text>
                <Text style={styles.progressLabel}>remaining</Text>
              </View>
            </View>

            {/* Session Stats */}
            <SessionStats
              session={session}
              elapsedTime={elapsedTime}
              isActive={isActive && !isPaused}
            />

            {/* Control Buttons */}
            <View style={styles.controlButtons}>
              <TouchableOpacity
                style={styles.pauseButton}
                onPress={handlePauseResume}
              >
                <Ionicons
                  name={isPaused ? 'play' : 'pause'}
                  size={24}
                  color="#8B5CF6"
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.stopButton} onPress={handleStop}>
                <Ionicons name="stop" size={24} color="#EF4444" />
                <Text style={styles.stopButtonText}>End Session</Text>
              </TouchableOpacity>
            </View>

            {/* Live Brain Activity */}
            {state.isConnected && bandPowers && (
              <View style={styles.brainActivitySection}>
                <Text style={styles.sectionLabel}>Brain Activity</Text>
                <View style={styles.chartContainer}>
                  <BrainWaveChart bandPowers={bandPowers} showLabels={true} />
                </View>
              </View>
            )}
          </View>
        )}

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
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
  },
  meterSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  setupSection: {
    alignItems: 'center',
    gap: 24,
  },
  sectionLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  durationSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  durationButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  durationButtonActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderColor: '#8B5CF6',
  },
  durationText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
  },
  durationTextActive: {
    color: '#8B5CF6',
  },
  durationUnit: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 2,
  },
  durationUnitActive: {
    color: 'rgba(139, 92, 246, 0.7)',
  },
  startButton: {
    width: '100%',
    borderRadius: 30,
    overflow: 'hidden',
    marginTop: 8,
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 12,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  activeSection: {
    gap: 24,
  },
  progressContainer: {
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 2,
  },
  progressLabels: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  progressTime: {
    fontSize: 24,
    fontWeight: '300',
    color: '#ffffff',
  },
  progressLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
  },
  controlButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  pauseButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  stopButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  brainActivitySection: {
    marginTop: 8,
  },
  chartContainer: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  tabBarSpacer: {
    height: 100,
  },
});
