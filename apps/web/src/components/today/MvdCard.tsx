'use client';

import type { Task } from '@neurodivergent-flow/core';

interface MvdCardProps {
  tasks: Task[];
  onDismiss?: () => void;
}

export function MvdCard({ tasks, onDismiss }: MvdCardProps) {
  const essentialTasks = tasks.filter((t) => t.isMvdEssential);

  return (
    <div className="rounded-lg border-2 border-energy-red bg-red-50 p-6">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-energy-red">Minimum Viable Day</h3>
          <p className="mt-1 text-sm text-text-secondary">
            Today: protect your energy. Here's the minimum.
          </p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-sm text-text-secondary hover:text-text-primary"
          >
            Dismiss
          </button>
        )}
      </div>

      <div className="space-y-2">
        {essentialTasks.length > 0 ? (
          essentialTasks.map((task) => (
            <div key={task.id} className="rounded bg-white p-3">
              <div className="font-medium">{task.title}</div>
              {task.outcome && (
                <div className="mt-1 text-xs text-text-secondary">{task.outcome}</div>
              )}
            </div>
          ))
        ) : (
          <div className="text-sm text-text-secondary">
            No essential tasks marked. Add at least one task and mark it as MVD essential.
          </div>
        )}

        <div className="mt-4 space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-energy-green">✓</span>
            <span>Hydration reminder</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-energy-green">✓</span>
            <span>One meal</span>
          </div>
        </div>
      </div>
    </div>
  );
}
