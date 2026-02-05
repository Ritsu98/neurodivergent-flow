'use client';

import { useState } from 'react';
import type { Task } from '@neurodivergent-flow/core';

interface Top3TasksProps {
  tasks: Task[];
  onTaskComplete: (taskId: string) => void;
  onTaskEdit: (task: Task) => void;
  onAddTask: () => void;
  isRedDay?: boolean;
}

export function Top3Tasks({
  tasks,
  onTaskComplete,
  onTaskEdit,
  onAddTask,
  isRedDay = false,
}: Top3TasksProps) {
  const displayTasks = tasks.slice(0, 3);

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Top 3</h3>
        {isRedDay && (
          <span className="text-xs text-energy-red">MVD only</span>
        )}
      </div>

      {displayTasks.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
          <p className="text-text-secondary">No tasks yet</p>
          <button
            onClick={onAddTask}
            className="mt-2 text-sm font-medium text-primary-500 hover:text-primary-600"
          >
            Add Top 3
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {displayTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4"
            >
              <input
                type="checkbox"
                checked={task.status === 'done'}
                onChange={() => onTaskComplete(task.id)}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="font-medium">{task.title}</div>
                {task.outcome && (
                  <div className="mt-1 text-sm text-text-secondary">
                    Outcome: {task.outcome}
                  </div>
                )}
                {task.nextStep && (
                  <div className="mt-1 text-xs text-text-muted">
                    Next: {task.nextStep}
                  </div>
                )}
              </div>
              <button
                onClick={() => onTaskEdit(task)}
                className="text-sm text-primary-500 hover:text-primary-600"
              >
                Edit
              </button>
            </div>
          ))}
          {tasks.length < 3 && (
            <button
              onClick={onAddTask}
              className="w-full rounded-lg border-2 border-dashed border-gray-300 p-3 text-sm font-medium text-text-secondary hover:border-primary-300 hover:text-primary-500"
            >
              + Add task ({tasks.length}/3)
            </button>
          )}
        </div>
      )}
    </div>
  );
}
