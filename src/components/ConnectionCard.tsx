import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MuseState, EEGChannel } from '../services/MuseService';

interface ConnectionCardProps {
  state: MuseState;
  onConnect: () => void;
  onDisconnect: () => void;
}

function SignalQualityBar({ channel, quality }: { channel: EEGChannel; quality: number }) {
  const getColor = (q: number) => {
    if (q >= 70) return '#10B981';
    if (q >= 40) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <View style={styles.signalRow}>
      <Text style={styles.signalLabel}>{channel}</Text>
      <View style={styles.signalBarContainer}>
        <View
          style={[
            styles.signalBarFill,
            { width: `${quality}%`, backgroundColor: getColor(quality) },
          ]}
        />
      </View>
      <Text style={[styles.signalValue, { color: getColor(quality) }]}>
        {Math.round(quality)}%
      </Text>
    </View>
  );
}

export function ConnectionCard({ state, onConnect, onDisconnect }: ConnectionCardProps) {
  const { isConnected, isConnecting, isScanning, deviceName, batteryLevel, signalQuality } = state;

  if (isConnected) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['rgba(16, 185, 129, 0.15)', 'rgba(16, 185, 129, 0.05)']}
          style={styles.gradient}
        >
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.connectedDot} />
              <View>
                <Text style={styles.deviceName}>{deviceName}</Text>
                <Text style={styles.statusText}>Connected</Text>
              </View>
            </View>
            <View style={styles.headerRight}>
              <View style={styles.batteryContainer}>
                <Ionicons
                  name={batteryLevel > 20 ? 'battery-full' : 'battery-dead'}
                  size={20}
                  color={batteryLevel > 20 ? '#10B981' : '#EF4444'}
                />
                <Text style={styles.batteryText}>{batteryLevel}%</Text>
              </View>
              <TouchableOpacity style={styles.disconnectButton} onPress={onDisconnect}>
                <Ionicons name="close" size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.signalContainer}>
            <Text style={styles.signalTitle}>Signal Quality</Text>
            <View style={styles.signalGrid}>
              {(Object.keys(signalQuality) as EEGChannel[]).map((channel) => (
                <SignalQualityBar
                  key={channel}
                  channel={channel}
                  quality={signalQuality[channel]}
                />
              ))}
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(139, 92, 246, 0.15)', 'rgba(139, 92, 246, 0.05)']}
        style={styles.gradient}
      >
        <View style={styles.disconnectedContent}>
          <View style={styles.iconContainer}>
            <Ionicons name="bluetooth" size={32} color="#8B5CF6" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>Connect Your Muse</Text>
            <Text style={styles.subtitle}>
              Put on your headband and tap to connect
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.connectButton, (isConnecting || isScanning) && styles.connectButtonDisabled]}
            onPress={onConnect}
            disabled={isConnecting || isScanning}
          >
            {isConnecting || isScanning ? (
              <>
                <ActivityIndicator color="#ffffff" size="small" />
                <Text style={styles.connectButtonText}>
                  {isScanning ? 'Scanning...' : 'Connecting...'}
                </Text>
              </>
            ) : (
              <>
                <Ionicons name="search" size={18} color="#ffffff" />
                <Text style={styles.connectButtonText}>Scan for Muse</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  gradient: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  connectedDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  statusText: {
    fontSize: 12,
    color: '#10B981',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  batteryText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  disconnectButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signalContainer: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12,
    padding: 16,
  },
  signalTitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  signalGrid: {
    gap: 8,
  },
  signalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  signalLabel: {
    width: 40,
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  signalBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  signalBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  signalValue: {
    width: 36,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'right',
  },
  disconnectedContent: {
    alignItems: 'center',
    padding: 8,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
  },
  connectButtonDisabled: {
    opacity: 0.7,
  },
  connectButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default ConnectionCard;
