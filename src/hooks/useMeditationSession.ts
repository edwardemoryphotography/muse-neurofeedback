import { useState, useEffect, useCallback, useRef } from 'react';
import { BandPowers } from '../services/MuseService';

export interface MeditationSession {
  startTime: number;
  endTime: number | null;
  duration: number;
  calmScore: number;
  focusScore: number;
  bandPowerHistory: BandPowers[];
  calmHistory: number[];
  focusHistory: number[];
}

export interface UseMeditationSessionReturn {
  session: MeditationSession | null;
  isActive: boolean;
  currentCalm: number;
  currentFocus: number;
  elapsedTime: number;
  start: () => void;
  stop: () => MeditationSession | null;
  pause: () => void;
  resume: () => void;
  updateWithBandPowers: (powers: BandPowers) => void;
}

export function useMeditationSession(): UseMeditationSessionReturn {
  const [session, setSession] = useState<MeditationSession | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentCalm, setCurrentCalm] = useState(0);
  const [currentFocus, setCurrentFocus] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pausedTimeRef = useRef(0);

  useEffect(() => {
    if (isActive && !isPaused) {
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive, isPaused]);

  const start = useCallback(() => {
    const newSession: MeditationSession = {
      startTime: Date.now(),
      endTime: null,
      duration: 0,
      calmScore: 0,
      focusScore: 0,
      bandPowerHistory: [],
      calmHistory: [],
      focusHistory: [],
    };
    setSession(newSession);
    setIsActive(true);
    setIsPaused(false);
    setElapsedTime(0);
    setCurrentCalm(0);
    setCurrentFocus(0);
  }, []);

  const stop = useCallback((): MeditationSession | null => {
    if (!session) return null;

    const finalSession: MeditationSession = {
      ...session,
      endTime: Date.now(),
      duration: elapsedTime,
      calmScore: session.calmHistory.length > 0
        ? session.calmHistory.reduce((a, b) => a + b, 0) / session.calmHistory.length
        : 0,
      focusScore: session.focusHistory.length > 0
        ? session.focusHistory.reduce((a, b) => a + b, 0) / session.focusHistory.length
        : 0,
    };

    setSession(finalSession);
    setIsActive(false);
    setIsPaused(false);
    return finalSession;
  }, [session, elapsedTime]);

  const pause = useCallback(() => {
    setIsPaused(true);
    pausedTimeRef.current = elapsedTime;
  }, [elapsedTime]);

  const resume = useCallback(() => {
    setIsPaused(false);
  }, []);

  const updateWithBandPowers = useCallback((powers: BandPowers) => {
    if (!isActive || isPaused || !session) return;

    // Calculate calm score (high alpha, low beta)
    const calmScore = Math.min(100, Math.max(0, 
      (powers.alpha * 100 + powers.theta * 50) - (powers.beta * 30 + powers.gamma * 20)
    ));

    // Calculate focus score (balanced beta, moderate alpha)
    const focusScore = Math.min(100, Math.max(0,
      (powers.beta * 60 + powers.alpha * 40) - (powers.theta * 20 + powers.delta * 30)
    ));

    setCurrentCalm(calmScore);
    setCurrentFocus(focusScore);

    setSession((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        bandPowerHistory: [...prev.bandPowerHistory, powers],
        calmHistory: [...prev.calmHistory, calmScore],
        focusHistory: [...prev.focusHistory, focusScore],
      };
    });
  }, [isActive, isPaused, session]);

  return {
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
  };
}

export default useMeditationSession;
