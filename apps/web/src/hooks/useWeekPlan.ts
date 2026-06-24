'use client';

import { useQuery } from '@tanstack/react-query';
import { getWeekPlan } from '@neurodivergent-flow/api';

export function useWeekPlan(userId: string, startDate: string) {
  return useQuery({
    queryKey: ['weekPlan', userId, startDate],
    queryFn: () => getWeekPlan(userId, startDate),
    enabled: Boolean(userId && startDate),
  });
}
