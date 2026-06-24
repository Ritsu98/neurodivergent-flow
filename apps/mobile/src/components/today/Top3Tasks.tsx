import { Pressable, View } from 'react-native';
import type { Task } from '@neurodivergent-flow/core';
import { AppText } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

interface Top3TasksProps {
  tasks: Task[];
  onTaskComplete: (taskId: string) => void;
  onAddTask?: () => void;
  isRedDay?: boolean;
}

export function Top3Tasks({
  tasks,
  onTaskComplete,
  onAddTask,
  isRedDay = false,
}: Top3TasksProps) {
  const displayTasks = tasks.slice(0, 3);

  return (
    <View className="w-full">
      <View className="mb-4 flex-row items-center justify-between">
        <AppText variant="subtitle">Top 3</AppText>
        {isRedDay ? <AppText variant="caption" className="text-energy-red">MVD only</AppText> : null}
      </View>

      {displayTasks.length === 0 ? (
        <View className="rounded-lg border-2 border-dashed border-gray-300 p-6">
          <AppText variant="caption" className="text-center">
            No tasks yet
          </AppText>
          {onAddTask ? (
            <Pressable onPress={onAddTask} className="mt-2">
              <AppText className="text-center text-sm font-medium text-primary-500">
                Add Top 3
              </AppText>
            </Pressable>
          ) : null}
        </View>
      ) : (
        <View className="gap-3">
          {displayTasks.map((task) => (
            <View
              key={task.id}
              className="flex-row items-start gap-3 rounded-lg border border-gray-200 bg-white p-4"
            >
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: task.status === 'done' }}
                onPress={() => void onTaskComplete(task.id)}
                className={cn(
                  'mr-2 mt-1 h-6 w-6 items-center justify-center rounded border-2',
                  task.status === 'done'
                    ? 'border-primary-500 bg-primary-500'
                    : 'border-gray-400 bg-white'
                )}
              >
                {task.status === 'done' ? (
                  <AppText className="text-xs font-bold text-white">✓</AppText>
                ) : null}
              </Pressable>
              <View className="flex-1">
                <AppText className={task.status === 'done' ? 'line-through opacity-60' : 'font-medium'}>
                  {task.title}
                </AppText>
                {task.outcome ? (
                  <AppText variant="caption" className="mt-1">
                    Outcome: {task.outcome}
                  </AppText>
                ) : null}
                {task.nextStep ? (
                  <AppText variant="muted" className="mt-1">
                    Next: {task.nextStep}
                  </AppText>
                ) : null}
              </View>
            </View>
          ))}
          {tasks.length < 3 && onAddTask ? (
            <Button label={`+ Add task (${tasks.length}/3)`} variant="ghost" onPress={onAddTask} />
          ) : null}
        </View>
      )}
    </View>
  );
}
