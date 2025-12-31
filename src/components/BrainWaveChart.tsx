import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, G, Text as SvgText, Line } from 'react-native-svg';
import { BandPowers, FREQUENCY_BANDS, FrequencyBand } from '../services/MuseService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_HEIGHT = 200;
const CHART_WIDTH = SCREEN_WIDTH - 48;
const BAR_WIDTH = (CHART_WIDTH - 80) / 5;
const BAR_GAP = 12;

interface BrainWaveChartProps {
  bandPowers: BandPowers | null;
  showLabels?: boolean;
}

export function BrainWaveChart({ bandPowers, showLabels = true }: BrainWaveChartProps) {
  const bands: FrequencyBand[] = ['delta', 'theta', 'alpha', 'beta', 'gamma'];

  const bars = useMemo(() => {
    return bands.map((band, index) => {
      const power = bandPowers?.[band] ?? 0;
      const barHeight = Math.max(4, power * (CHART_HEIGHT - 60));
      const x = 40 + index * (BAR_WIDTH + BAR_GAP);
      const y = CHART_HEIGHT - 30 - barHeight;
      const bandInfo = FREQUENCY_BANDS[band];

      return {
        band,
        power,
        barHeight,
        x,
        y,
        color: bandInfo.color,
        label: bandInfo.label,
        frequency: `${bandInfo.min}-${bandInfo.max}Hz`,
      };
    });
  }, [bandPowers]);

  return (
    <View style={styles.container}>
      <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
        <Defs>
          {bars.map((bar) => (
            <LinearGradient
              key={`gradient-${bar.band}`}
              id={`gradient-${bar.band}`}
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <Stop offset="0%" stopColor={bar.color} stopOpacity={1} />
              <Stop offset="100%" stopColor={bar.color} stopOpacity={0.3} />
            </LinearGradient>
          ))}
        </Defs>

        {/* Grid lines */}
        {[0.25, 0.5, 0.75, 1].map((level) => {
          const y = CHART_HEIGHT - 30 - level * (CHART_HEIGHT - 60);
          return (
            <G key={`grid-${level}`}>
              <Line
                x1={35}
                y1={y}
                x2={CHART_WIDTH - 5}
                y2={y}
                stroke="rgba(255,255,255,0.1)"
                strokeWidth={1}
                strokeDasharray="4,4"
              />
              <SvgText
                x={5}
                y={y + 4}
                fill="rgba(255,255,255,0.4)"
                fontSize={10}
              >
                {Math.round(level * 100)}%
              </SvgText>
            </G>
          );
        })}

        {/* Bars */}
        {bars.map((bar) => (
          <G key={bar.band}>
            {/* Bar background */}
            <Path
              d={`M${bar.x} ${CHART_HEIGHT - 30} 
                  L${bar.x} ${CHART_HEIGHT - 30 - (CHART_HEIGHT - 60)} 
                  Q${bar.x} ${CHART_HEIGHT - 30 - (CHART_HEIGHT - 60) - 4} ${bar.x + 4} ${CHART_HEIGHT - 30 - (CHART_HEIGHT - 60) - 4}
                  L${bar.x + BAR_WIDTH - 4} ${CHART_HEIGHT - 30 - (CHART_HEIGHT - 60) - 4}
                  Q${bar.x + BAR_WIDTH} ${CHART_HEIGHT - 30 - (CHART_HEIGHT - 60) - 4} ${bar.x + BAR_WIDTH} ${CHART_HEIGHT - 30 - (CHART_HEIGHT - 60)}
                  L${bar.x + BAR_WIDTH} ${CHART_HEIGHT - 30}
                  Z`}
              fill="rgba(255,255,255,0.05)"
            />

            {/* Actual bar */}
            <Path
              d={`M${bar.x} ${CHART_HEIGHT - 30} 
                  L${bar.x} ${bar.y + 4} 
                  Q${bar.x} ${bar.y} ${bar.x + 4} ${bar.y}
                  L${bar.x + BAR_WIDTH - 4} ${bar.y}
                  Q${bar.x + BAR_WIDTH} ${bar.y} ${bar.x + BAR_WIDTH} ${bar.y + 4}
                  L${bar.x + BAR_WIDTH} ${CHART_HEIGHT - 30}
                  Z`}
              fill={`url(#gradient-${bar.band})`}
            />

            {/* Power value */}
            <SvgText
              x={bar.x + BAR_WIDTH / 2}
              y={bar.y - 8}
              fill={bar.color}
              fontSize={12}
              fontWeight="600"
              textAnchor="middle"
            >
              {Math.round(bar.power * 100)}%
            </SvgText>

            {/* Label */}
            {showLabels && (
              <SvgText
                x={bar.x + BAR_WIDTH / 2}
                y={CHART_HEIGHT - 12}
                fill="rgba(255,255,255,0.7)"
                fontSize={11}
                fontWeight="500"
                textAnchor="middle"
              >
                {bar.label}
              </SvgText>
            )}
          </G>
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
});

export default BrainWaveChart;
