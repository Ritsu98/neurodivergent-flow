'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createEndTimestamp,
  getRemainingSeconds,
  FOCUS_TIMER_STORAGE_KEY,
} from '@neurodivergent-flow/core';

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

  const tick = useCallback(() => {
    if (!endTimestampRef.current) return;
    const remaining = getRemainingSeconds(endTimestampRef.current);
    setRemainingSeconds(remaining);
    if (remaining <= 0) {
      endTimestampRef.current = null;
      sessionStorage.removeItem(storageKey);
      setIsRunning(false);
      onCompleteRef.current();
    }
  }, [storageKey]);

  useEffect(() => {
    if (!isRunning || isPaused) return;
    tick();
    const interval = setInterval(tick, 1000);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') tick();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [isRunning, isPaused, tick]);

  const start = useCallback(() => {
    const stored = sessionStorage.getItem(storageKey);
    if (stored) {
      const end = Number(stored);
      if (end > Date.now()) {
        endTimestampRef.current = end;
        setRemainingSeconds(getRemainingSeconds(end));
        setIsRunning(true);
        setIsPaused(false);
        return;
      }
      sessionStorage.removeItem(storageKey);
    }
    const end = createEndTimestamp(durationMinutes);
    endTimestampRef.current = end;
    sessionStorage.setItem(storageKey, String(end));
    setRemainingSeconds(totalSeconds);
    setIsRunning(true);
    setIsPaused(false);
  }, [durationMinutes, storageKey, totalSeconds]);

  const pause = useCallback(() => {
    if (!endTimestampRef.current) return;
    pausedRemainingRef.current = getRemainingSeconds(endTimestampRef.current);
    endTimestampRef.current = null;
    sessionStorage.removeItem(storageKey);
    setRemainingSeconds(pausedRemainingRef.current);
    setIsPaused(true);
  }, [storageKey]);

  const resume = useCallback(() => {
    const end = Date.now() + pausedRemainingRef.current * 1000;
    endTimestampRef.current = end;
    sessionStorage.setItem(storageKey, String(end));
    setIsPaused(false);
    setIsRunning(true);
  }, [storageKey]);

  const abandon = useCallback(() => {
    endTimestampRef.current = null;
    sessionStorage.removeItem(storageKey);
    setIsRunning(false);
    setIsPaused(false);
    setRemainingSeconds(totalSeconds);
  }, [storageKey, totalSeconds]);

  const resetForDuration = useCallback((minutes: number) => {
    abandon();
    pausedRemainingRef.current = minutes * 60;
    setRemainingSeconds(minutes * 60);
  }, [abandon]);

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
