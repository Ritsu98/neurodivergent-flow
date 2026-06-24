import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatTimerDisplay, getTimerProgress } from '@neurodivergent-flow/core';
import { Button } from '@/components/ui/Button';
import { AppText } from '@/components/ui/Text';

interface FocusTimerProps {
  label: string;
  totalSeconds: number;
  remainingSeconds: number;
  isPaused: boolean;
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onAbandon: () => void;
  onLater: () => void;
}

export function FocusTimer({
  label,
  totalSeconds,
  remainingSeconds,
  isPaused,
  isRunning,
  onStart,
  onPause,
  onResume,
  onAbandon,
  onLater,
}: FocusTimerProps) {
  const progress = getTimerProgress(totalSeconds, remainingSeconds);
  const display = formatTimerDisplay(remainingSeconds);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 p-4">
        <AppText variant="caption" className="font-medium">
          {label}
        </AppText>
        <AppText variant="title" className="mt-2 text-5xl tabular-nums">
          {display}
        </AppText>

        <View className="mt-8 h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <View className="h-full bg-primary-500" style={{ width: `${progress * 100}%` }} />
        </View>

        <View className="mt-8 flex-row flex-wrap gap-3">
          {!isRunning ? <Button label="Start" onPress={onStart} /> : null}
          {isRunning && !isPaused ? <Button label="Pause" variant="secondary" onPress={onPause} /> : null}
          {isPaused ? <Button label="Resume" onPress={onResume} /> : null}
          {(isRunning || isPaused) && (
            <>
              <Button label="Later" variant="secondary" onPress={onLater} />
              <Button label="Abandon" variant="ghost" onPress={onAbandon} />
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
