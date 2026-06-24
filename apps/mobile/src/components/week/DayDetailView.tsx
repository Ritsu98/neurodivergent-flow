import { View } from 'react-native';
import type { DayThemeConfig, Task } from '@neurodivergent-flow/core';
import {
  DAY_NAMES,
  THEME_LABELS,
  adjustScheduledTime,
  cycleDayTheme,
  isWorkday,
} from '@neurodivergent-flow/core';
import { Button } from '@/components/ui/Button';
import { AppText } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';

interface DayDetailViewProps {
  config: DayThemeConfig;
  tasks: Task[];
  workWindowDays?: number[];
  workWindowTime?: string;
  onBack: () => void;
  onUpdateDay: (updated: DayThemeConfig) => void;
  onSwapWithDay: (otherDay: number) => void;
}

export function DayDetailView({
  config,
  tasks,
  workWindowDays = [],
  workWindowTime,
  onBack,
  onUpdateDay,
  onSwapWithDay,
}: DayDetailViewProps) {
  const dayTasks = tasks.filter((t) => t.day === config.day && t.status !== 'done').slice(0, 3);
  const hasWork = isWorkday(config.day, workWindowDays);

  const handleConvertTheme = () => {
    onUpdateDay({ ...config, theme: cycleDayTheme(config.theme) });
  };

  const handleTimeShift = (delta: number) => {
    if (!config.scheduledTime) return;
    onUpdateDay({ ...config, scheduledTime: adjustScheduledTime(config.scheduledTime, delta) });
  };

  return (
    <View className="gap-6">
      <Button label="← Back to week" variant="ghost" onPress={onBack} className="self-start px-0" />

      <View>
        <AppText variant="title">{DAY_NAMES[config.day]}</AppText>
        <AppText variant="caption">
          {THEME_LABELS[config.theme]} day
          {config.scheduledTime ? ` · ${config.scheduledTime}` : ''}
        </AppText>
      </View>

      {hasWork && workWindowTime ? (
        <Card className="bg-gray-50">
          <AppText variant="caption">Work window: {workWindowTime}</AppText>
        </Card>
      ) : null}

      <Card>
        <AppText className="mb-3 font-semibold">Edit Primary Block</AppText>
        <View className="flex-row flex-wrap gap-2">
          <Button label="Convert type" variant="secondary" onPress={handleConvertTheme} />
          {config.day < 6 ? (
            <Button
              label={`Swap ${DAY_NAMES[config.day + 1]}`}
              variant="secondary"
              onPress={() => onSwapWithDay(config.day + 1)}
            />
          ) : null}
          {config.scheduledTime ? (
            <>
              <Button label="−30 min" variant="secondary" onPress={() => handleTimeShift(-30)} />
              <Button label="+30 min" variant="secondary" onPress={() => handleTimeShift(30)} />
            </>
          ) : null}
        </View>
      </Card>

      <View>
        <AppText className="mb-3 font-semibold">Top tasks</AppText>
        {dayTasks.length === 0 ? (
          <AppText variant="caption">No tasks for this day yet.</AppText>
        ) : (
          dayTasks.map((task) => (
            <Card key={task.id} className="mb-2">
              <AppText className="font-medium">{task.title}</AppText>
              {task.nextStep ? (
                <AppText variant="muted" className="mt-1">
                  Next: {task.nextStep}
                </AppText>
              ) : null}
            </Card>
          ))
        )}
      </View>
    </View>
  );
}
