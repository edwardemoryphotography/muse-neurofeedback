import { BleManager, Device, Characteristic } from 'react-native-ble-plx';
import { Buffer } from 'buffer';

// Muse headband service and characteristic UUIDs
const MUSE_SERVICE_UUID = '0000fe8d-0000-1000-8000-00805f9b34fb';
const MUSE_CONTROL_UUID = '273e0001-4c4d-454d-96be-f03bac821358';
const MUSE_EEG_TP9_UUID = '273e0003-4c4d-454d-96be-f03bac821358';
const MUSE_EEG_AF7_UUID = '273e0004-4c4d-454d-96be-f03bac821358';
const MUSE_EEG_AF8_UUID = '273e0005-4c4d-454d-96be-f03bac821358';
const MUSE_EEG_TP10_UUID = '273e0006-4c4d-454d-96be-f03bac821358';
const MUSE_ACCELEROMETER_UUID = '273e000a-4c4d-454d-96be-f03bac821358';
const MUSE_GYROSCOPE_UUID = '273e0009-4c4d-454d-96be-f03bac821358';
const MUSE_PPG_UUID = '273e000f-4c4d-454d-96be-f03bac821358';
const MUSE_BATTERY_UUID = '273e000b-4c4d-454d-96be-f03bac821358';

// EEG frequency bands in Hz
export const FREQUENCY_BANDS = {
  delta: { min: 0.5, max: 4, color: '#8B5CF6', label: 'Delta' },
  theta: { min: 4, max: 8, color: '#06B6D4', label: 'Theta' },
  alpha: { min: 8, max: 13, color: '#10B981', label: 'Alpha' },
  beta: { min: 13, max: 30, color: '#F59E0B', label: 'Beta' },
  gamma: { min: 30, max: 100, color: '#EF4444', label: 'Gamma' },
};

export type EEGChannel = 'TP9' | 'AF7' | 'AF8' | 'TP10';
export type FrequencyBand = keyof typeof FREQUENCY_BANDS;

export interface EEGData {
  timestamp: number;
  channels: {
    TP9: number[];
    AF7: number[];
    AF8: number[];
    TP10: number[];
  };
}

export interface BandPowers {
  delta: number;
  theta: number;
  alpha: number;
  beta: number;
  gamma: number;
}

export interface MuseState {
  isConnected: boolean;
  isConnecting: boolean;
  isScanning: boolean;
  deviceName: string | null;
  batteryLevel: number;
  signalQuality: { [key in EEGChannel]: number };
}

export type MuseEventCallback = (data: EEGData) => void;
export type BandPowerCallback = (powers: BandPowers) => void;
export type StateCallback = (state: MuseState) => void;

class MuseService {
  private manager: BleManager;
  private device: Device | null = null;
  private eegCallbacks: MuseEventCallback[] = [];
  private bandPowerCallbacks: BandPowerCallback[] = [];
  private stateCallbacks: StateCallback[] = [];
  private eegBuffer: { [key in EEGChannel]: number[] } = {
    TP9: [],
    AF7: [],
    AF8: [],
    TP10: [],
  };
  private state: MuseState = {
    isConnected: false,
    isConnecting: false,
    isScanning: false,
    deviceName: null,
    batteryLevel: 100,
    signalQuality: { TP9: 0, AF7: 0, AF8: 0, TP10: 0 },
  };

  constructor() {
    this.manager = new BleManager();
  }

  getState(): MuseState {
    return { ...this.state };
  }

  private updateState(updates: Partial<MuseState>) {
    this.state = { ...this.state, ...updates };
    this.stateCallbacks.forEach((cb) => cb(this.state));
  }

  onStateChange(callback: StateCallback): () => void {
    this.stateCallbacks.push(callback);
    return () => {
      this.stateCallbacks = this.stateCallbacks.filter((cb) => cb !== callback);
    };
  }

  onEEGData(callback: MuseEventCallback): () => void {
    this.eegCallbacks.push(callback);
    return () => {
      this.eegCallbacks = this.eegCallbacks.filter((cb) => cb !== callback);
    };
  }

  onBandPowers(callback: BandPowerCallback): () => void {
    this.bandPowerCallbacks.push(callback);
    return () => {
      this.bandPowerCallbacks = this.bandPowerCallbacks.filter((cb) => cb !== callback);
    };
  }

  async scanForDevices(): Promise<Device[]> {
    const devices: Device[] = [];
    this.updateState({ isScanning: true });

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.manager.stopDeviceScan();
        this.updateState({ isScanning: false });
        resolve(devices);
      }, 10000);

      this.manager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          clearTimeout(timeout);
          this.updateState({ isScanning: false });
          reject(error);
          return;
        }

        if (device && device.name?.includes('Muse')) {
          if (!devices.find((d) => d.id === device.id)) {
            devices.push(device);
          }
        }
      });
    });
  }

  async connect(device: Device): Promise<void> {
    try {
      this.updateState({ isConnecting: true });

      const connectedDevice = await device.connect();
      await connectedDevice.discoverAllServicesAndCharacteristics();

      this.device = connectedDevice;
      this.updateState({
        isConnected: true,
        isConnecting: false,
        deviceName: device.name || 'Muse Headband',
      });

      // Start streaming
      await this.startStreaming();

      // Monitor disconnection
      this.device.onDisconnected(() => {
        this.updateState({
          isConnected: false,
          deviceName: null,
        });
        this.device = null;
      });
    } catch (error) {
      this.updateState({ isConnecting: false });
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.device) {
      await this.device.cancelConnection();
      this.device = null;
      this.updateState({
        isConnected: false,
        deviceName: null,
      });
    }
  }

  private async startStreaming(): Promise<void> {
    if (!this.device) return;

    // Send start command to Muse
    const startCommand = Buffer.from([0x02, 0x64, 0x0a]).toString('base64');
    await this.device.writeCharacteristicWithResponseForService(
      MUSE_SERVICE_UUID,
      MUSE_CONTROL_UUID,
      startCommand
    );

    // Subscribe to EEG channels
    const eegChannels = [
      { uuid: MUSE_EEG_TP9_UUID, channel: 'TP9' as EEGChannel },
      { uuid: MUSE_EEG_AF7_UUID, channel: 'AF7' as EEGChannel },
      { uuid: MUSE_EEG_AF8_UUID, channel: 'AF8' as EEGChannel },
      { uuid: MUSE_EEG_TP10_UUID, channel: 'TP10' as EEGChannel },
    ];

    for (const { uuid, channel } of eegChannels) {
      this.device.monitorCharacteristicForService(
        MUSE_SERVICE_UUID,
        uuid,
        (error, characteristic) => {
          if (error) {
            console.error(`Error monitoring ${channel}:`, error);
            return;
          }
          if (characteristic?.value) {
            this.processEEGData(channel, characteristic.value);
          }
        }
      );
    }

    // Monitor battery
    this.device.monitorCharacteristicForService(
      MUSE_SERVICE_UUID,
      MUSE_BATTERY_UUID,
      (error, characteristic) => {
        if (!error && characteristic?.value) {
          const data = Buffer.from(characteristic.value, 'base64');
          if (data.length > 0) {
            this.updateState({ batteryLevel: data[0] });
          }
        }
      }
    );
  }

  private processEEGData(channel: EEGChannel, value: string): void {
    const data = Buffer.from(value, 'base64');
    const samples: number[] = [];

    // Muse sends 12 samples per packet, each sample is 12 bits
    for (let i = 2; i < data.length; i += 2) {
      if (i + 1 < data.length) {
        const sample = ((data[i] << 8) | data[i + 1]) / 4096;
        samples.push(sample);
      }
    }

    this.eegBuffer[channel].push(...samples);

    // Keep buffer size manageable (last 256 samples = ~1 second at 256Hz)
    if (this.eegBuffer[channel].length > 256) {
      this.eegBuffer[channel] = this.eegBuffer[channel].slice(-256);
    }

    // Calculate signal quality
    const variance = this.calculateVariance(samples);
    const quality = Math.min(100, Math.max(0, 100 - variance * 10));
    this.updateState({
      signalQuality: { ...this.state.signalQuality, [channel]: quality },
    });

    // Emit EEG data
    const eegData: EEGData = {
      timestamp: Date.now(),
      channels: { ...this.eegBuffer },
    };
    this.eegCallbacks.forEach((cb) => cb(eegData));

    // Calculate and emit band powers periodically
    if (this.eegBuffer[channel].length >= 256) {
      this.calculateBandPowers();
    }
  }

  private calculateVariance(samples: number[]): number {
    if (samples.length === 0) return 0;
    const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
    return samples.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / samples.length;
  }

  private calculateBandPowers(): void {
    // Simple FFT-based band power calculation
    const allChannels = Object.values(this.eegBuffer);
    const avgChannel = allChannels[0].map((_, i) =>
      allChannels.reduce((sum, ch) => sum + (ch[i] || 0), 0) / allChannels.length
    );

    if (avgChannel.length < 256) return;

    const powers = this.computeBandPowers(avgChannel.slice(-256));
    this.bandPowerCallbacks.forEach((cb) => cb(powers));
  }

  private computeBandPowers(samples: number[]): BandPowers {
    // Simple power estimation using zero-crossing rate and variance
    // A proper implementation would use FFT
    const sampleRate = 256;
    const n = samples.length;

    // Calculate zero-crossing rate as a proxy for frequency content
    let zeroCrossings = 0;
    for (let i = 1; i < n; i++) {
      if ((samples[i] >= 0 && samples[i - 1] < 0) || 
          (samples[i] < 0 && samples[i - 1] >= 0)) {
        zeroCrossings++;
      }
    }
    const zcr = (zeroCrossings * sampleRate) / (2 * n);

    // Estimate band powers based on signal characteristics
    const variance = this.calculateVariance(samples);
    const totalPower = variance;

    // Distribute power across bands based on estimated frequency content
    const powers: BandPowers = {
      delta: 0,
      theta: 0,
      alpha: 0,
      beta: 0,
      gamma: 0,
    };

    // Simple heuristic distribution - in production, use proper FFT
    if (zcr < 4) {
      powers.delta = totalPower * 0.6;
      powers.theta = totalPower * 0.25;
      powers.alpha = totalPower * 0.1;
      powers.beta = totalPower * 0.04;
      powers.gamma = totalPower * 0.01;
    } else if (zcr < 8) {
      powers.delta = totalPower * 0.2;
      powers.theta = totalPower * 0.5;
      powers.alpha = totalPower * 0.2;
      powers.beta = totalPower * 0.08;
      powers.gamma = totalPower * 0.02;
    } else if (zcr < 13) {
      powers.delta = totalPower * 0.1;
      powers.theta = totalPower * 0.2;
      powers.alpha = totalPower * 0.5;
      powers.beta = totalPower * 0.15;
      powers.gamma = totalPower * 0.05;
    } else if (zcr < 30) {
      powers.delta = totalPower * 0.05;
      powers.theta = totalPower * 0.1;
      powers.alpha = totalPower * 0.2;
      powers.beta = totalPower * 0.5;
      powers.gamma = totalPower * 0.15;
    } else {
      powers.delta = totalPower * 0.02;
      powers.theta = totalPower * 0.05;
      powers.alpha = totalPower * 0.1;
      powers.beta = totalPower * 0.25;
      powers.gamma = totalPower * 0.58;
    }

    // Normalize to 0-1 range
    const maxPower = Math.max(...Object.values(powers));
    if (maxPower > 0) {
      Object.keys(powers).forEach((key) => {
        powers[key as FrequencyBand] /= maxPower;
      });
    }

    return powers;
  }

  destroy(): void {
    this.disconnect();
    this.manager.destroy();
  }
}

export const museService = new MuseService();
export default museService;
