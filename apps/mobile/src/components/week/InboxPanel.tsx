import { useState } from 'react';
import { Pressable, View } from 'react-native';
import type { InboxItem, TaskStatus } from '@neurodivergent-flow/core';
import {
  DAY_NAMES,
  INBOX_MAX_ITEMS,
  INBOX_WARNING_THRESHOLD,
  isSunday,
} from '@neurodivergent-flow/core';
import { Button } from '@/components/ui/Button';
import { AppText } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/cn';

interface InboxPanelProps {
  items: InboxItem[];
  onDelete: (id: string) => Promise<void>;
  onPromote: (item: InboxItem, day: number | null, status: TaskStatus) => Promise<void>;
}

export function InboxPanel({ items, onDelete, onPromote }: InboxPanelProps) {
  const [promotingId, setPromotingId] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const count = items.length;
  const showWarning = count >= INBOX_WARNING_THRESHOLD;
  const atLimit = count >= INBOX_MAX_ITEMS;
  const showPrunePrompt = isSunday() && count > 0;

  const handlePromote = async (item: InboxItem) => {
    await onPromote(item, selectedDay, 'today');
    setPromotingId(null);
  };

  return (
    <View className="gap-4">
      {showPrunePrompt ? (
        <Card className="border-primary-200 bg-primary-50">
          <AppText variant="caption">
            Review your Later inbox — promote what matters or delete the rest.
          </AppText>
        </Card>
      ) : null}

      {showWarning ? (
        <Card className={cn(atLimit ? 'border-energy-red bg-red-50' : 'border-amber-300 bg-amber-50')}>
          <AppText variant="caption">
            {atLimit
              ? `Inbox full (${INBOX_MAX_ITEMS} items). Promote or delete before adding more.`
              : `${count} items — approaching limit of ${INBOX_MAX_ITEMS}.`}
          </AppText>
        </Card>
      ) : null}

      {items.length === 0 ? (
        <AppText variant="caption">
          Nothing in Later yet. Capture thoughts during Focus.
        </AppText>
      ) : (
        items.map((item) => (
          <Card key={item.id}>
            <AppText className="text-sm">{item.content}</AppText>
            <AppText variant="muted" className="mt-1">
              {new Date(item.capturedAt).toLocaleDateString()}
            </AppText>
            <View className="mt-3 flex-row flex-wrap gap-2">
              <Button
                label="Promote"
                onPress={() => setPromotingId(item.id)}
                disabled={item.promotedToTaskId != null}
                className="px-3 py-1"
              />
              <Button
                label="Delete"
                variant="secondary"
                onPress={() => void onDelete(item.id)}
                className="px-3 py-1"
              />
            </View>
            {promotingId === item.id ? (
              <View className="mt-3 border-t border-gray-100 pt-3">
                <AppText variant="caption" className="mb-2 font-medium">
                  Assign to day:
                </AppText>
                <View className="mb-2 flex-row flex-wrap gap-1">
                  {DAY_NAMES.map((name, i) => (
                    <Pressable
                      key={name}
                      onPress={() => setSelectedDay(i)}
                      className={cn(
                        'rounded border px-2 py-1',
                        selectedDay === i ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
                      )}
                    >
                      <AppText className="text-xs">{name}</AppText>
                    </Pressable>
                  ))}
                </View>
                <View className="flex-row gap-2">
                  <Button label="Confirm" onPress={() => void handlePromote(item)} className="flex-1" />
                  <Button
                    label="Cancel"
                    variant="ghost"
                    onPress={() => setPromotingId(null)}
                    className="flex-1"
                  />
                </View>
              </View>
            ) : null}
          </Card>
        ))
      )}
    </View>
  );
}
