/**
 * Muse Simulator
 * 
 * Generates realistic fake EEG data for testing the app without a real Muse headband.
 * Useful for development and demo purposes.
 */

import { EEGData, BandPowers, MuseState, EEGChannel } from './MuseService';

type SimulatorCallback<T> = (data: T) => void;

interface SimulatorState {
  isRunning: boolean;
  mode: 'relaxed' | 'focused' | 'meditation' | 'random';
}

class MuseSimulator {
  private state: MuseState = {
    isConnected: false,
    isConnecting: false,
    isScanning: false,
    deviceName: null,
    batteryLevel: 87,
    signalQuality: { TP9: 0, AF7: 0, AF8: 0, TP10: 0 },
  };

  private simulatorState: SimulatorState = {
    isRunning: false,
    mode: 'random',
  };

  private eegCallbacks: SimulatorCallback<EEGData>[] = [];
  private bandPowerCallbacks: SimulatorCallback<BandPowers>[] = [];
  private stateCallbacks: SimulatorCallback<MuseState>[] = [];
  
  private eegInterval: ReturnType<typeof setInterval> | null = null;
  private bandInterval: ReturnType<typeof setInterval> | null = null;
  private time: number = 0;

  getState(): MuseState {
    return { ...this.state };
  }

  private updateState(updates: Partial<MuseState>): void {
    this.state = { ...this.state, ...updates };
    this.stateCallbacks.forEach((cb) => cb(this.state));
  }

  onStateChange(callback: SimulatorCallback<MuseState>): () => void {
    this.stateCallbacks.push(callback);
    return () => {
      this.stateCallbacks = this.stateCallbacks.filter((cb) => cb !== callback);
    };
  }

  onEEGData(callback: SimulatorCallback<EEGData>): () => void {
    this.eegCallbacks.push(callback);
    return () => {
      this.eegCallbacks = this.eegCallbacks.filter((cb) => cb !== callback);
    };
  }

  onBandPowers(callback: SimulatorCallback<BandPowers>): () => void {
    this.bandPowerCallbacks.push(callback);
    return () => {
      this.bandPowerCallbacks = this.bandPowerCallbacks.filter((cb) => cb !== callback);
    };
  }

  setMode(mode: SimulatorState['mode']): void {
    this.simulatorState.mode = mode;
  }

  async connect(): Promise<void> {
    this.updateState({ isConnecting: true });
    
    // Simulate connection delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    this.updateState({
      isConnected: true,
      isConnecting: false,
      deviceName: 'Muse Simulator',
      signalQuality: { TP9: 95, AF7: 92, AF8: 94, TP10: 91 },
    });

    this.startSimulation();
  }

  async disconnect(): Promise<void> {
    this.stopSimulation();
    this.updateState({
      isConnected: false,
      deviceName: null,
      signalQuality: { TP9: 0, AF7: 0, AF8: 0, TP10: 0 },
    });
  }

  private startSimulation(): void {
    if (this.simulatorState.isRunning) return;
    this.simulatorState.isRunning = true;
    this.time = 0;

    // Generate EEG data at ~20Hz (realistic for display)
    this.eegInterval = setInterval(() => {
      const eegData = this.generateEEGData();
      this.eegCallbacks.forEach((cb) => cb(eegData));
      this.time += 0.05;
    }, 50);

    // Generate band powers at 4Hz
    this.bandInterval = setInterval(() => {
      const bandPowers = this.generateBandPowers();
      this.bandPowerCallbacks.forEach((cb) => cb(bandPowers));
    }, 250);
  }

  private stopSimulation(): void {
    this.simulatorState.isRunning = false;
    if (this.eegInterval) {
      clearInterval(this.eegInterval);
      this.eegInterval = null;
    }
    if (this.bandInterval) {
      clearInterval(this.bandInterval);
      this.bandInterval = null;
    }
  }

  private generateEEGData(): EEGData {
    const channels: EEGData['channels'] = {
      TP9: [],
      AF7: [],
      AF8: [],
      TP10: [],
    };

    const channelNames: EEGChannel[] = ['TP9', 'AF7', 'AF8', 'TP10'];

    // Generate 12 samples per packet (like real Muse)
    for (let i = 0; i < 12; i++) {
      const t = this.time + i * 0.004; // 256Hz sampling

      channelNames.forEach((channel, idx) => {
        // Combine multiple frequency components for realistic EEG
        const delta = 0.3 * Math.sin(2 * Math.PI * 2 * t + idx);
        const theta = 0.25 * Math.sin(2 * Math.PI * 6 * t + idx * 0.5);
        const alpha = 0.4 * Math.sin(2 * Math.PI * 10 * t + idx * 0.3);
        const beta = 0.15 * Math.sin(2 * Math.PI * 20 * t + idx * 0.7);
        const gamma = 0.05 * Math.sin(2 * Math.PI * 40 * t + idx * 0.2);
        const noise = 0.1 * (Math.random() - 0.5);

        // Normalize to 0-1 range
        const value = 0.5 + 0.3 * (delta + theta + alpha + beta + gamma + noise);
        channels[channel].push(Math.max(0, Math.min(1, value)));
      });
    }

    return {
      timestamp: Date.now(),
      channels,
    };
  }

  private generateBandPowers(): BandPowers {
    const { mode } = this.simulatorState;
    
    // Base values with some randomness
    let powers: BandPowers;

    switch (mode) {
      case 'relaxed':
        powers = {
          delta: 0.2 + Math.random() * 0.1,
          theta: 0.3 + Math.random() * 0.15,
          alpha: 0.7 + Math.random() * 0.2,
          beta: 0.2 + Math.random() * 0.1,
          gamma: 0.1 + Math.random() * 0.05,
        };
        break;

      case 'focused':
        powers = {
          delta: 0.1 + Math.random() * 0.05,
          theta: 0.2 + Math.random() * 0.1,
          alpha: 0.3 + Math.random() * 0.15,
          beta: 0.7 + Math.random() * 0.2,
          gamma: 0.3 + Math.random() * 0.1,
        };
        break;

      case 'meditation':
        powers = {
          delta: 0.3 + Math.random() * 0.1,
          theta: 0.5 + Math.random() * 0.2,
          alpha: 0.8 + Math.random() * 0.15,
          beta: 0.15 + Math.random() * 0.1,
          gamma: 0.05 + Math.random() * 0.05,
        };
        break;

      default: // random
        // Gradually shifting pattern
        const phase = Math.sin(this.time * 0.1);
        powers = {
          delta: 0.3 + 0.2 * Math.sin(this.time * 0.05) + Math.random() * 0.1,
          theta: 0.3 + 0.2 * Math.sin(this.time * 0.08) + Math.random() * 0.1,
          alpha: 0.4 + 0.3 * phase + Math.random() * 0.1,
          beta: 0.3 - 0.2 * phase + Math.random() * 0.1,
          gamma: 0.15 + 0.1 * Math.sin(this.time * 0.12) + Math.random() * 0.05,
        };
    }

    // Normalize so they don't all exceed 1
    const max = Math.max(...Object.values(powers));
    if (max > 1) {
      Object.keys(powers).forEach((key) => {
        powers[key as keyof BandPowers] /= max;
      });
    }

    return powers;
  }

  destroy(): void {
    this.disconnect();
  }
}

export const museSimulator = new MuseSimulator();
export default museSimulator;
