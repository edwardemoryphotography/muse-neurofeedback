import React, { useMemo } from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, G, Line, Rect } from 'react-native-svg';
import { EEGData, EEGChannel } from '../services/MuseService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 48;
const CHANNEL_HEIGHT = 60;

const CHANNEL_COLORS: Record<EEGChannel, string> = {
  TP9: '#8B5CF6',
  AF7: '#06B6D4',
  AF8: '#10B981',
  TP10: '#F59E0B',
};

const CHANNEL_LABELS: Record<EEGChannel, string> = {
  TP9: 'Left Ear',
  AF7: 'Left Forehead',
  AF8: 'Right Forehead',
  TP10: 'Right Ear',
};

interface EEGWaveformProps {
  eegData: EEGData | null;
  channels?: EEGChannel[];
  signalQuality?: Record<EEGChannel, number>;
}

function generateWaveformPath(
  data: number[],
  width: number,
  height: number,
  offsetY: number
): string {
  if (!data || data.length === 0) {
    return '';
  }

  const samples = data.slice(-128); // Last 0.5 seconds at 256Hz
  const step = width / samples.length;
  const midY = offsetY + height / 2;
  const amplitude = height * 0.4;

  let path = `M 0 ${midY}`;

  samples.forEach((value, index) => {
    const x = index * step;
    const normalizedValue = Math.max(-1, Math.min(1, (value - 0.5) * 2));
    const y = midY - normalizedValue * amplitude;
    path += ` L ${x} ${y}`;
  });

  return path;
}

function SignalQualityIndicator({ quality, color }: { quality: number; color: string }) {
  const bars = 4;
  const activeBarCount = Math.ceil((quality / 100) * bars);

  return (
    <View style={styles.signalIndicator}>
      {Array.from({ length: bars }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.signalBar,
            {
              height: 4 + i * 3,
              backgroundColor: i < activeBarCount ? color : 'rgba(255,255,255,0.2)',
            },
          ]}
        />
      ))}
    </View>
  );
}

export function EEGWaveform({
  eegData,
  channels = ['TP9', 'AF7', 'AF8', 'TP10'],
  signalQuality,
}: EEGWaveformProps) {
  const totalHeight = channels.length * CHANNEL_HEIGHT + (channels.length - 1) * 8;

  const paths = useMemo(() => {
    if (!eegData) return {};

    return channels.reduce((acc, channel, index) => {
      const offsetY = index * (CHANNEL_HEIGHT + 8);
      acc[channel] = generateWaveformPath(
        eegData.channels[channel],
        CHART_WIDTH - 80,
        CHANNEL_HEIGHT,
        offsetY
      );
      return acc;
    }, {} as Record<string, string>);
  }, [eegData, channels]);

  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        {/* Channel labels */}
        <View style={styles.labelsContainer}>
          {channels.map((channel, index) => (
            <View
              key={channel}
              style={[
                styles.labelRow,
                { top: index * (CHANNEL_HEIGHT + 8) + CHANNEL_HEIGHT / 2 - 20 },
              ]}
            >
              <View style={styles.labelContent}>
                <View
                  style={[styles.channelDot, { backgroundColor: CHANNEL_COLORS[channel] }]}
                />
                <View>
                  <Text style={[styles.channelName, { color: CHANNEL_COLORS[channel] }]}>
                    {channel}
                  </Text>
                  <Text style={styles.channelLocation}>{CHANNEL_LABELS[channel]}</Text>
                </View>
              </View>
              {signalQuality && (
                <SignalQualityIndicator
                  quality={signalQuality[channel]}
                  color={CHANNEL_COLORS[channel]}
                />
              )}
            </View>
          ))}
        </View>

        {/* Waveforms */}
        <Svg width={CHART_WIDTH - 80} height={totalHeight} style={styles.svg}>
          <Defs>
            {channels.map((channel) => (
              <LinearGradient
                key={`stroke-${channel}`}
                id={`stroke-${channel}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <Stop offset="0%" stopColor={CHANNEL_COLORS[channel]} stopOpacity={0.3} />
                <Stop offset="50%" stopColor={CHANNEL_COLORS[channel]} stopOpacity={1} />
                <Stop offset="100%" stopColor={CHANNEL_COLORS[channel]} stopOpacity={0.3} />
              </LinearGradient>
            ))}
          </Defs>

          {/* Background grid for each channel */}
          {channels.map((channel, index) => {
            const offsetY = index * (CHANNEL_HEIGHT + 8);
            return (
              <G key={`bg-${channel}`}>
                <Rect
                  x={0}
                  y={offsetY}
                  width={CHART_WIDTH - 80}
                  height={CHANNEL_HEIGHT}
                  fill="rgba(255,255,255,0.02)"
                  rx={8}
                />
                <Line
                  x1={0}
                  y1={offsetY + CHANNEL_HEIGHT / 2}
                  x2={CHART_WIDTH - 80}
                  y2={offsetY + CHANNEL_HEIGHT / 2}
                  stroke="rgba(255,255,255,0.1)"
                  strokeDasharray="4,4"
                />
              </G>
            );
          })}

          {/* Waveform paths */}
          {channels.map((channel) => (
            <Path
              key={`wave-${channel}`}
              d={paths[channel] || ''}
              stroke={`url(#stroke-${channel})`}
              strokeWidth={2}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  chartContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  labelsContainer: {
    width: 80,
    position: 'relative',
  },
  labelRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  labelContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  channelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  channelName: {
    fontSize: 11,
    fontWeight: '600',
  },
  channelLocation: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.4)',
  },
  svg: {
    flex: 1,
  },
  signalIndicator: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    height: 16,
  },
  signalBar: {
    width: 3,
    borderRadius: 1,
  },
});

export default EEGWaveform;
