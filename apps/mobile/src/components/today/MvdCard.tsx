import { View } from 'react-native';
import type { Task } from '@neurodivergent-flow/core';
import { AppText } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';

interface MvdCardProps {
  tasks: Task[];
  onDismiss?: () => void;
}

export function MvdCard({ tasks, onDismiss }: MvdCardProps) {
  const essentialTasks = tasks.filter((t) => t.isMvdEssential);

  return (
    <View className="rounded-lg border-2 border-energy-red bg-red-50 p-6">
      <View className="mb-4 flex-row items-start justify-between">
        <View className="flex-1">
          <AppText variant="subtitle" className="text-energy-red">
            Minimum Viable Day
          </AppText>
          <AppText variant="caption" className="mt-1">
            Today: protect your energy. Here&apos;s the minimum.
          </AppText>
        </View>
        {onDismiss ? (
          <Button label="Dismiss" variant="ghost" onPress={onDismiss} className="px-2 py-1" />
        ) : null}
      </View>

      {essentialTasks.length > 0 ? (
        essentialTasks.map((task) => (
          <View key={task.id} className="mb-2 rounded bg-white p-3">
            <AppText className="font-medium">{task.title}</AppText>
            {task.outcome ? (
              <AppText variant="muted" className="mt-1">
                {task.outcome}
              </AppText>
            ) : null}
          </View>
        ))
      ) : (
        <AppText variant="caption">
          No essential tasks marked. Add at least one task and mark it as MVD essential.
        </AppText>
      )}

      <View className="mt-4 gap-2">
        <AppText variant="caption">✓ Hydration reminder</AppText>
        <AppText variant="caption">✓ One meal</AppText>
      </View>
    </View>
  );
}
