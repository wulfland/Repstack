/**
 * Hook for managing rest timer between sets
 * Supports audio alerts, vibration, and configurable duration
 */

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseRestTimerOptions {
  defaultRestSeconds?: number;
  audioEnabled?: boolean; // Note: Audio alerts are not yet implemented. This parameter is reserved for future use.
  vibrationEnabled?: boolean;
}

interface UseRestTimerReturn {
  timeRemaining: number;
  isRunning: boolean;
  isPaused: boolean;
  isComplete: boolean;
  startTimer: (seconds?: number) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  extendTimer: (seconds: number) => void;
  resetTimer: () => void;
}

export function useRestTimer(
  options: UseRestTimerOptions = {}
): UseRestTimerReturn {
  const {
    defaultRestSeconds = 90,
    // audioEnabled - Reserved for future audio alerts implementation
    vibrationEnabled = true,
  } = options;

  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const playAlert = useCallback(() => {
    // Trigger vibration
    if (vibrationEnabled && 'vibrate' in navigator) {
      try {
        // Vibrate for 200ms, pause 100ms, vibrate 200ms
        navigator.vibrate([200, 100, 200]);
      } catch (error) {
        console.warn('Vibration failed:', error);
      }
    }

    // Note: Audio alerts can be added in the future with a proper sound file
    // For now, vibration provides sufficient feedback
  }, [vibrationEnabled]);

  useEffect(() => {
    if (!isRunning || isPaused) {
      return;
    }

    intervalRef.current = window.setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          setIsComplete(true);
          playAlert();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, playAlert]);

  const startTimer = useCallback(
    (seconds?: number) => {
      const duration = seconds ?? defaultRestSeconds;
      setTimeRemaining(duration);
      setIsRunning(true);
      setIsPaused(false);
      setIsComplete(false);
    },
    [defaultRestSeconds]
  );

  const pauseTimer = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resumeTimer = useCallback(() => {
    setIsPaused(false);
  }, []);

  const stopTimer = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeRemaining(0);
    setIsComplete(false);
  }, []);

  const extendTimer = useCallback((seconds: number) => {
    setTimeRemaining((prev) => prev + seconds);
    setIsComplete(false);
  }, []);

  const resetTimer = useCallback(() => {
    setTimeRemaining(defaultRestSeconds);
    setIsRunning(false);
    setIsPaused(false);
    setIsComplete(false);
  }, [defaultRestSeconds]);

  return {
    timeRemaining,
    isRunning,
    isPaused,
    isComplete,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    extendTimer,
    resetTimer,
  };
}
