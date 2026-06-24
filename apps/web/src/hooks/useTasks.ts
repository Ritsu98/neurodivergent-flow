'use client';

import { useQuery } from '@tanstack/react-query';
import { getTasks } from '@neurodivergent-flow/api';
import type { TaskStatus } from '@neurodivergent-flow/core';

export function useTasks(
  userId: string,
  filters?: { day?: number; status?: TaskStatus; weekPlanId?: string }
) {
  return useQuery({
    queryKey: ['tasks', userId, filters],
    queryFn: () => getTasks(userId, filters),
    enabled: Boolean(userId),
  });
}
