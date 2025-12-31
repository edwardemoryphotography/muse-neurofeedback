import { useState, useEffect, useCallback } from 'react';
import { Device } from 'react-native-ble-plx';
import museService, { 
  MuseState, 
  EEGData, 
  BandPowers,
  EEGChannel,
  FrequencyBand,
  FREQUENCY_BANDS 
} from '../services/MuseService';

export interface UseMuseReturn {
  state: MuseState;
  eegData: EEGData | null;
  bandPowers: BandPowers | null;
  availableDevices: Device[];
  scan: () => Promise<void>;
  connect: (device: Device) => Promise<void>;
  disconnect: () => Promise<void>;
  isReady: boolean;
}

export function useMuse(): UseMuseReturn {
  const [state, setState] = useState<MuseState>(museService.getState());
  const [eegData, setEEGData] = useState<EEGData | null>(null);
  const [bandPowers, setBandPowers] = useState<BandPowers | null>(null);
  const [availableDevices, setAvailableDevices] = useState<Device[]>([]);

  useEffect(() => {
    const unsubscribeState = museService.onStateChange(setState);
    const unsubscribeEEG = museService.onEEGData(setEEGData);
    const unsubscribeBands = museService.onBandPowers(setBandPowers);

    return () => {
      unsubscribeState();
      unsubscribeEEG();
      unsubscribeBands();
    };
  }, []);

  const scan = useCallback(async () => {
    const devices = await museService.scanForDevices();
    setAvailableDevices(devices);
  }, []);

  const connect = useCallback(async (device: Device) => {
    await museService.connect(device);
  }, []);

  const disconnect = useCallback(async () => {
    await museService.disconnect();
    setEEGData(null);
    setBandPowers(null);
  }, []);

  const isReady = state.isConnected && 
    Object.values(state.signalQuality).every((q) => q > 50);

  return {
    state,
    eegData,
    bandPowers,
    availableDevices,
    scan,
    connect,
    disconnect,
    isReady,
  };
}

export { EEGChannel, FrequencyBand, FREQUENCY_BANDS };
export default useMuse;
