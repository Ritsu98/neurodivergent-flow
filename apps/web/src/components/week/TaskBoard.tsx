'use client';

import type { Task, TaskStatus } from '@neurodivergent-flow/core';
import { DAY_NAMES } from '@neurodivergent-flow/core';

interface TaskBoardProps {
  tasks: Task[];
  todayDayIndex: number;
  onMoveTask: (taskId: string, status: TaskStatus, day?: number) => Promise<void>;
}

const columns: { status: TaskStatus; label: string; filter: (t: Task, today: number) => boolean }[] = [
  {
    status: 'this_week',
    label: 'This Week',
    filter: (t) => t.status === 'this_week',
  },
  {
    status: 'today',
    label: 'Today',
    filter: (t, today) => t.status === 'today' && t.day === today,
  },
  {
    status: 'done',
    label: 'Done',
    filter: (t) => t.status === 'done',
  },
];

export function TaskBoard({ tasks, todayDayIndex, onMoveTask }: TaskBoardProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {columns.map((col) => {
        const columnTasks = tasks.filter((t) => col.filter(t, todayDayIndex));
        return (
          <div key={col.status} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <h3 className="mb-3 text-sm font-semibold">
              {col.label}
              <span className="ml-1 text-text-muted">({columnTasks.length})</span>
            </h3>
            <ul className="space-y-2">
              {columnTasks.length === 0 ? (
                <li className="text-xs text-text-secondary">Empty</li>
              ) : (
                columnTasks.map((task) => (
                  <li key={task.id} className="rounded-lg border border-gray-200 bg-white p-3">
                    <div className="text-sm font-medium">{task.title}</div>
                    {task.day != null && col.status !== 'today' && (
                      <div className="mt-1 text-xs text-text-muted">{DAY_NAMES[task.day]}</div>
                    )}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {col.status !== 'this_week' && (
                        <button
                          type="button"
                          onClick={() => onMoveTask(task.id, 'this_week', undefined)}
                          className="rounded border border-gray-200 px-2 py-0.5 text-[10px] hover:bg-gray-50"
                        >
                          → This Week
                        </button>
                      )}
                      {col.status !== 'today' && (
                        <button
                          type="button"
                          onClick={() => onMoveTask(task.id, 'today', todayDayIndex)}
                          className="rounded border border-gray-200 px-2 py-0.5 text-[10px] hover:bg-gray-50"
                        >
                          → Today
                        </button>
                      )}
                      {col.status !== 'done' && (
                        <button
                          type="button"
                          onClick={() => onMoveTask(task.id, 'done', task.day)}
                          className="rounded border border-gray-200 px-2 py-0.5 text-[10px] hover:bg-gray-50"
                        >
                          → Done
                        </button>
                      )}
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
