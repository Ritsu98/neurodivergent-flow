import { View } from 'react-native';
import type { Task, TaskStatus } from '@neurodivergent-flow/core';
import { DAY_NAMES } from '@neurodivergent-flow/core';
import { Button } from '@/components/ui/Button';
import { AppText } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';

interface TaskBoardProps {
  tasks: Task[];
  todayDayIndex: number;
  onMoveTask: (taskId: string, status: TaskStatus, day?: number) => Promise<void>;
}

const columns: {
  status: TaskStatus;
  label: string;
  filter: (t: Task, today: number) => boolean;
}[] = [
  { status: 'this_week', label: 'This Week', filter: (t) => t.status === 'this_week' },
  {
    status: 'today',
    label: 'Today',
    filter: (t, today) => t.status === 'today' && t.day === today,
  },
  { status: 'done', label: 'Done', filter: (t) => t.status === 'done' },
];

export function TaskBoard({ tasks, todayDayIndex, onMoveTask }: TaskBoardProps) {
  return (
    <View className="gap-4">
      {columns.map((col) => {
        const columnTasks = tasks.filter((t) => col.filter(t, todayDayIndex));
        return (
          <Card key={col.status} className="bg-gray-50">
            <AppText className="mb-3 text-sm font-semibold">
              {col.label}{' '}
              <AppText variant="muted">({columnTasks.length})</AppText>
            </AppText>
            {columnTasks.length === 0 ? (
              <AppText variant="muted" className="text-xs">
                Empty
              </AppText>
            ) : (
              columnTasks.map((task) => (
                <Card key={task.id} className="mb-2 bg-white">
                  <AppText className="text-sm font-medium">{task.title}</AppText>
                  {task.day != null && col.status !== 'today' ? (
                    <AppText variant="muted" className="mt-1 text-xs">
                      {DAY_NAMES[task.day]}
                    </AppText>
                  ) : null}
                  <View className="mt-2 flex-row flex-wrap gap-1">
                    {col.status !== 'this_week' ? (
                      <Button
                        label="→ Week"
                        variant="ghost"
                        onPress={() => void onMoveTask(task.id, 'this_week')}
                        className="px-2 py-1"
                      />
                    ) : null}
                    {col.status !== 'today' ? (
                      <Button
                        label="→ Today"
                        variant="ghost"
                        onPress={() => void onMoveTask(task.id, 'today', todayDayIndex)}
                        className="px-2 py-1"
                      />
                    ) : null}
                    {col.status !== 'done' ? (
                      <Button
                        label="→ Done"
                        variant="ghost"
                        onPress={() => void onMoveTask(task.id, 'done', task.day)}
                        className="px-2 py-1"
                      />
                    ) : null}
                  </View>
                </Card>
              ))
            )}
          </Card>
        );
      })}
    </View>
  );
}
