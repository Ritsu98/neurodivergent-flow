'use client';

import { useState, type ReactNode } from 'react';

interface RitualChecklistProps {
  items: string[];
  onItemsChange: (items: string[]) => void;
  onBegin: () => void;
  onSkip: () => void;
  footer?: ReactNode;
}

export function RitualChecklist({
  items,
  onItemsChange,
  onBegin,
  onSkip,
  footer,
}: RitualChecklistProps) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [newItem, setNewItem] = useState('');

  const allChecked = items.length > 0 && items.every((_, i) => checked[i]);

  const toggleItem = (index: number) => {
    setChecked((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const removeItem = (index: number) => {
    const next = items.filter((_, i) => i !== index);
    onItemsChange(next);
    setChecked({});
  };

  const addItem = () => {
    const trimmed = newItem.trim();
    if (!trimmed) return;
    onItemsChange([...items, trimmed]);
    setNewItem('');
  };

  return (
    <div className="flex min-h-screen flex-col bg-surface p-4">
      <div className="mx-auto w-full max-w-lg flex-1">
        <h1 className="text-2xl font-bold">Start ritual</h1>
        <p className="mt-2 text-sm text-text-secondary">
          A quick setup before you focus. Optional, but helpful.
        </p>

        <div className="mt-6 space-y-3">
          {items.map((item, index) => (
            <div
              key={`${item}-${index}`}
              className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4"
            >
              {!isEditing ? (
                <input
                  type="checkbox"
                  checked={!!checked[index]}
                  onChange={() => toggleItem(index)}
                  className="h-5 w-5 rounded"
                  aria-label={item}
                />
              ) : null}
              <span className="flex-1">{item}</span>
              {isEditing && items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="text-sm text-text-secondary hover:text-energy-red"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>

        {isEditing && (
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="Add ritual item"
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
              onKeyDown={(e) => e.key === 'Enter' && addItem()}
            />
            <button
              type="button"
              onClick={addItem}
              className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white"
            >
              Add
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className="mt-4 text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          {isEditing ? 'Done editing' : 'Customize checklist'}
        </button>

        {footer}
      </div>

      <div className="mx-auto w-full max-w-lg space-y-3 pb-6">
        {allChecked && (
          <button
            type="button"
            onClick={onBegin}
            className="w-full rounded-lg bg-primary-500 px-6 py-3 font-semibold text-white hover:bg-primary-600"
          >
            Begin Focus
          </button>
        )}
        <button
          type="button"
          onClick={onSkip}
          className="w-full rounded-lg border border-gray-300 px-6 py-3 font-medium hover:bg-gray-50"
        >
          Skip ritual
        </button>
      </div>
    </div>
  );
}
