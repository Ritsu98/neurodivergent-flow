import { View } from 'react-native';
import { formatTimerDisplay, getTimerProgress } from '@neurodivergent-flow/core';
import { Button } from '@/components/ui/Button';
import { AppText } from '@/components/ui/Text';
import type { ReactNode } from 'react';

interface SprintTimerProps {
  label: string;
  totalSeconds: number;
  remainingSeconds: number;
  isPaused: boolean;
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onAbandon: () => void;
  onSkip?: () => void;
  children?: ReactNode;
}

export function SprintTimer({
  label,
  totalSeconds,
  remainingSeconds,
  isPaused,
  isRunning,
  onStart,
  onPause,
  onResume,
  onAbandon,
  onSkip,
  children,
}: SprintTimerProps) {
  const progress = getTimerProgress(totalSeconds, remainingSeconds);
  const display = formatTimerDisplay(remainingSeconds);

  return (
    <View className="flex-1 bg-gray-50 p-4">
      <AppText variant="caption" className="font-medium">
        {label}
      </AppText>
      <AppText variant="title" className="mt-2 text-5xl tabular-nums">
        {display}
      </AppText>

      <View className="mt-8 h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <View className="h-full bg-primary-500" style={{ width: `${progress * 100}%` }} />
      </View>

      {children ? <View className="mt-6">{children}</View> : null}

      <View className="mt-8 flex-row flex-wrap gap-3">
        {!isRunning ? <Button label="Start" onPress={onStart} /> : null}
        {isRunning && !isPaused ? <Button label="Pause" variant="secondary" onPress={onPause} /> : null}
        {isPaused ? <Button label="Resume" onPress={onResume} /> : null}
        {(isRunning || isPaused) && (
          <Button label="Abandon" variant="ghost" onPress={onAbandon} className="text-energy-red" />
        )}
        {onSkip && !isRunning ? (
          <Button label="Skip timer" variant="secondary" onPress={onSkip} />
        ) : null}
      </View>
    </View>
  );
}
