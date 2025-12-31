import React, { useEffect } from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop, G, Path } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIZE = Math.min(SCREEN_WIDTH - 96, 280);
const STROKE_WIDTH = 16;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CalmMeterProps {
  value: number; // 0-100
  label?: string;
  showBreathingGuide?: boolean;
}

export function CalmMeter({ value, label = 'Calm', showBreathingGuide = false }: CalmMeterProps) {
  const progress = useSharedValue(0);
  const breathingPhase = useSharedValue(0);

  useEffect(() => {
    progress.value = withSpring(value / 100, {
      damping: 20,
      stiffness: 100,
    });
  }, [value]);

  useEffect(() => {
    if (showBreathingGuide) {
      // Animate breathing: 4s inhale, 4s hold, 4s exhale, 4s hold
      const animate = () => {
        breathingPhase.value = withSpring(1, { duration: 4000 }, () => {
          breathingPhase.value = withSpring(0, { duration: 4000 }, animate);
        });
      };
      animate();
    }
  }, [showBreathingGuide]);

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = CIRCUMFERENCE * (1 - progress.value);
    return {
      strokeDashoffset,
    };
  });

  const getStatusText = (val: number): string => {
    if (val >= 80) return 'Deep Calm';
    if (val >= 60) return 'Relaxed';
    if (val >= 40) return 'Settling';
    if (val >= 20) return 'Active';
    return 'Restless';
  };

  const getStatusColor = (val: number): string => {
    if (val >= 80) return '#10B981';
    if (val >= 60) return '#06B6D4';
    if (val >= 40) return '#F59E0B';
    if (val >= 20) return '#F97316';
    return '#EF4444';
  };

  const statusColor = getStatusColor(value);

  return (
    <View style={styles.container}>
      <View style={styles.meterContainer}>
        <Svg width={SIZE} height={SIZE}>
          <Defs>
            <LinearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#8B5CF6" />
              <Stop offset="50%" stopColor="#06B6D4" />
              <Stop offset="100%" stopColor="#10B981" />
            </LinearGradient>
            <LinearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.3} />
              <Stop offset="100%" stopColor="#10B981" stopOpacity={0.3} />
            </LinearGradient>
          </Defs>

          {/* Background track */}
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={STROKE_WIDTH}
            fill="none"
          />

          {/* Glow effect */}
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke="url(#glowGradient)"
            strokeWidth={STROKE_WIDTH + 20}
            fill="none"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - value / 100)}
            strokeLinecap="round"
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
            opacity={0.5}
          />

          {/* Progress arc */}
          <AnimatedCircle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke="url(#progressGradient)"
            strokeWidth={STROKE_WIDTH}
            fill="none"
            strokeDasharray={CIRCUMFERENCE}
            animatedProps={animatedProps}
            strokeLinecap="round"
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          />

          {/* Center decorative rings */}
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS - 35}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={1}
            fill="none"
          />
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS - 50}
            stroke="rgba(255,255,255,0.03)"
            strokeWidth={1}
            fill="none"
          />
        </Svg>

        {/* Center content */}
        <View style={styles.centerContent}>
          <Text style={styles.valueText}>{Math.round(value)}</Text>
          <Text style={styles.labelText}>{label}</Text>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {getStatusText(value)}
            </Text>
          </View>
        </View>
      </View>

      {showBreathingGuide && (
        <View style={styles.breathingGuide}>
          <Text style={styles.breathingText}>Breathe with the rhythm</Text>
          <View style={styles.breathingIndicator}>
            <View style={styles.breathingDot} />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  meterContainer: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueText: {
    fontSize: 64,
    fontWeight: '200',
    color: '#ffffff',
    letterSpacing: -2,
  },
  labelText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    marginTop: -4,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  breathingGuide: {
    marginTop: 24,
    alignItems: 'center',
  },
  breathingText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 12,
  },
  breathingIndicator: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  breathingDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#8B5CF6',
  },
});

export default CalmMeter;
