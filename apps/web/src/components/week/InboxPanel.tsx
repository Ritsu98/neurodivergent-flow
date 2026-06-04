'use client';

import { useState } from 'react';
import type { InboxItem, TaskStatus } from '@neurodivergent-flow/core';
import { DAY_NAMES, INBOX_MAX_ITEMS, INBOX_WARNING_THRESHOLD, isSunday } from '@neurodivergent-flow/core';

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
    <div className="space-y-4">
      {showPrunePrompt && (
        <div className="rounded-lg border border-primary-200 bg-primary-50 p-4 text-sm">
          Review your Later inbox — promote what matters or delete the rest.
        </div>
      )}

      {showWarning && (
        <div
          className={`rounded-lg border p-3 text-sm ${
            atLimit ? 'border-energy-red bg-red-50' : 'border-amber-300 bg-amber-50'
          }`}
        >
          {atLimit
            ? `Inbox full (${INBOX_MAX_ITEMS} items). Promote or delete before adding more.`
            : `${count} items — approaching limit of ${INBOX_MAX_ITEMS}.`}
        </div>
      )}

      {items.length === 0 ? (
        <p className="text-sm text-text-secondary">Nothing in Later yet. Capture thoughts during Focus.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-sm">{item.content}</p>
              <p className="mt-1 text-xs text-text-muted">
                {new Date(item.capturedAt).toLocaleDateString()}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setPromotingId(item.id)}
                  disabled={item.promotedToTaskId != null}
                  className="rounded-lg bg-primary-500 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                >
                  Promote to task
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(item.id)}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium hover:bg-gray-50"
                >
                  Delete
                </button>
              </div>
              {promotingId === item.id && (
                <div className="mt-3 flex items-center gap-2 border-t border-gray-100 pt-3">
                  <label className="text-xs font-medium">Assign to day:</label>
                  <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(Number(e.target.value))}
                    className="rounded border border-gray-300 px-2 py-1 text-xs"
                  >
                    {DAY_NAMES.map((name, i) => (
                      <option key={name} value={i}>
                        {name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => handlePromote(item)}
                    className="rounded bg-primary-500 px-2 py-1 text-xs text-white"
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    onClick={() => setPromotingId(null)}
                    className="text-xs text-text-secondary"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
