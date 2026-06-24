import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import {
  createEndTimestamp,
  getRemainingSeconds,
  FOCUS_TIMER_STORAGE_KEY,
} from '@neurodivergent-flow/core';
import {
  clearStoredTimerEnd,
  getStoredTimerEnd,
  setStoredTimerEnd,
} from '@/lib/timerStorage';

interface UseCountdownTimerOptions {
  durationMinutes: number;
  storageKey?: string;
  onComplete: () => void;
}

export function useCountdownTimer({
  durationMinutes,
  storageKey = FOCUS_TIMER_STORAGE_KEY,
  onComplete,
}: UseCountdownTimerOptions) {
  const totalSeconds = durationMinutes * 60;
  const [remainingSeconds, setRemainingSeconds] = useState(totalSeconds);
  const [isPaused, setIsPaused] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const endTimestampRef = useRef<number | null>(null);
  const pausedRemainingRef = useRef(totalSeconds);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const syncFromEnd = useCallback((end: number) => {
    const remaining = getRemainingSeconds(end);
    setRemainingSeconds(remaining);
    if (remaining <= 0) {
      endTimestampRef.current = null;
      void clearStoredTimerEnd(storageKey);
      setIsRunning(false);
      setIsPaused(false);
      onCompleteRef.current();
      return;
    }
    endTimestampRef.current = end;
    setIsRunning(true);
    setIsPaused(false);
  }, [storageKey]);

  const tick = useCallback(() => {
    if (!endTimestampRef.current) return;
    syncFromEnd(endTimestampRef.current);
  }, [syncFromEnd]);

  useEffect(() => {
    void (async () => {
      const end = await getStoredTimerEnd(storageKey);
      if (end) syncFromEnd(end);
    })();
  }, [storageKey, syncFromEnd]);

  useEffect(() => {
    if (!isRunning || isPaused) return;
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isRunning, isPaused, tick]);

  useEffect(() => {
    const onAppState = (state: AppStateStatus) => {
      if (state === 'active') {
        void (async () => {
          const end = await getStoredTimerEnd(storageKey);
          if (end) syncFromEnd(end);
        })();
      }
    };
    const sub = AppState.addEventListener('change', onAppState);
    return () => sub.remove();
  }, [storageKey, syncFromEnd]);

  const start = useCallback(() => {
    void (async () => {
      const stored = await getStoredTimerEnd(storageKey);
      if (stored) {
        syncFromEnd(stored);
        return;
      }
      const end = createEndTimestamp(durationMinutes);
      endTimestampRef.current = end;
      await setStoredTimerEnd(storageKey, end);
      setRemainingSeconds(totalSeconds);
      setIsRunning(true);
      setIsPaused(false);
    })();
  }, [durationMinutes, storageKey, syncFromEnd, totalSeconds]);

  const pause = useCallback(() => {
    if (!endTimestampRef.current) return;
    pausedRemainingRef.current = getRemainingSeconds(endTimestampRef.current);
    endTimestampRef.current = null;
    void clearStoredTimerEnd(storageKey);
    setRemainingSeconds(pausedRemainingRef.current);
    setIsPaused(true);
  }, [storageKey]);

  const resume = useCallback(() => {
    const end = Date.now() + pausedRemainingRef.current * 1000;
    endTimestampRef.current = end;
    void setStoredTimerEnd(storageKey, end);
    setIsPaused(false);
    setIsRunning(true);
  }, [storageKey]);

  const abandon = useCallback(() => {
    endTimestampRef.current = null;
    void clearStoredTimerEnd(storageKey);
    setIsRunning(false);
    setIsPaused(false);
    setRemainingSeconds(totalSeconds);
  }, [storageKey, totalSeconds]);

  const resetForDuration = useCallback(
    (minutes: number) => {
      endTimestampRef.current = null;
      void clearStoredTimerEnd(storageKey);
      setIsRunning(false);
      setIsPaused(false);
      pausedRemainingRef.current = minutes * 60;
      setRemainingSeconds(minutes * 60);
    },
    [storageKey]
  );

  return {
    totalSeconds,
    remainingSeconds,
    isPaused,
    isRunning,
    start,
    pause,
    resume,
    abandon,
    resetForDuration,
  };
}
