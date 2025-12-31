import { useState, useEffect, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import { Device } from 'react-native-ble-plx';
import museService, { 
  MuseState, 
  EEGData, 
  BandPowers,
} from '../services/MuseService';
import museSimulator from '../services/MuseSimulator';

export interface UseMuseReturn {
  state: MuseState;
  eegData: EEGData | null;
  bandPowers: BandPowers | null;
  availableDevices: Device[];
  scan: () => Promise<void>;
  connect: (device: Device) => Promise<void>;
  connectSimulator: () => Promise<void>;
  disconnect: () => Promise<void>;
  isSimulated: boolean;
  isReady: boolean;
}

/**
 * A hook that provides Muse connectivity with a simulator fallback.
 * Useful for testing on devices without a real Muse headband.
 */
export function useMuseOrSimulator(): UseMuseReturn {
  const [isSimulated, setIsSimulated] = useState(false);
  const [state, setState] = useState<MuseState>(museService.getState());
  const [eegData, setEEGData] = useState<EEGData | null>(null);
  const [bandPowers, setBandPowers] = useState<BandPowers | null>(null);
  const [availableDevices, setAvailableDevices] = useState<Device[]>([]);

  useEffect(() => {
    // Subscribe to real Muse service
    const unsubscribeState = museService.onStateChange((newState) => {
      if (!isSimulated) setState(newState);
    });
    const unsubscribeEEG = museService.onEEGData((data) => {
      if (!isSimulated) setEEGData(data);
    });
    const unsubscribeBands = museService.onBandPowers((powers) => {
      if (!isSimulated) setBandPowers(powers);
    });

    // Subscribe to simulator
    const unsubSimState = museSimulator.onStateChange((newState) => {
      if (isSimulated) setState(newState);
    });
    const unsubSimEEG = museSimulator.onEEGData((data) => {
      if (isSimulated) setEEGData(data);
    });
    const unsubSimBands = museSimulator.onBandPowers((powers) => {
      if (isSimulated) setBandPowers(powers);
    });

    return () => {
      unsubscribeState();
      unsubscribeEEG();
      unsubscribeBands();
      unsubSimState();
      unsubSimEEG();
      unsubSimBands();
    };
  }, [isSimulated]);

  const scan = useCallback(async () => {
    try {
      const devices = await museService.scanForDevices();
      setAvailableDevices(devices);

      if (devices.length === 0) {
        // Offer simulator option
        Alert.alert(
          'No Muse Found',
          'Would you like to use the simulator to test the app?',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Use Simulator', 
              onPress: async () => {
                await connectSimulator();
              }
            },
          ]
        );
      }
    } catch (error) {
      console.error('Scan error:', error);
      // Offer simulator on error (common in Expo Go)
      Alert.alert(
        'Bluetooth Error',
        'Bluetooth scanning requires a development build. Would you like to use the simulator?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Use Simulator', 
            onPress: async () => {
              await connectSimulator();
            }
          },
        ]
      );
    }
  }, []);

  const connect = useCallback(async (device: Device) => {
    setIsSimulated(false);
    await museService.connect(device);
  }, []);

  const connectSimulator = useCallback(async () => {
    setIsSimulated(true);
    await museSimulator.connect();
    setState(museSimulator.getState());
  }, []);

  const disconnect = useCallback(async () => {
    if (isSimulated) {
      await museSimulator.disconnect();
    } else {
      await museService.disconnect();
    }
    setEEGData(null);
    setBandPowers(null);
    setIsSimulated(false);
  }, [isSimulated]);

  const isReady = state.isConnected && 
    Object.values(state.signalQuality).every((q) => q > 50);

  return {
    state,
    eegData,
    bandPowers,
    availableDevices,
    scan,
    connect,
    connectSimulator,
    disconnect,
    isSimulated,
    isReady,
  };
}

export default useMuseOrSimulator;
