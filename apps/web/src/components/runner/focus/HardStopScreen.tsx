'use client';

import { useState } from 'react';

interface HardStopScreenProps {
  taskTitle?: string;
  onDone: (nextStep: string, saveAs: 'task' | 'inbox' | 'skip') => Promise<void>;
  onBack: () => void;
}

export function HardStopScreen({ taskTitle, onDone, onBack }: HardStopScreenProps) {
  const [nextStep, setNextStep] = useState('');
  const [saveAs, setSaveAs] = useState<'task' | 'inbox' | 'skip'>('task');
  const [isSaving, setIsSaving] = useState(false);

  const handleDone = async () => {
    setIsSaving(true);
    try {
      await onDone(nextStep.trim(), saveAs);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-surface p-4">
      <div className="mx-auto w-full max-w-lg flex-1">
        <h1 className="text-2xl font-bold">Hard stop</h1>
        <p className="mt-2 text-text-secondary">
          Nice work. What&apos;s your next tiny step?
        </p>
        {taskTitle && (
          <p className="mt-4 text-sm text-text-muted">
            For: <span className="font-medium text-text-primary">{taskTitle}</span>
          </p>
        )}

        <textarea
          value={nextStep}
          onChange={(e) => setNextStep(e.target.value)}
          placeholder="Optional — e.g. open doc, write one line"
          rows={3}
          className="mt-6 w-full rounded-lg border border-gray-300 px-3 py-2"
        />

        {nextStep.trim() && (
          <fieldset className="mt-4 space-y-2">
            <legend className="text-sm font-medium">Save as</legend>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="saveAs"
                checked={saveAs === 'task'}
                onChange={() => setSaveAs('task')}
              />
              <span className="text-sm">Update today&apos;s task next step</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="saveAs"
                checked={saveAs === 'inbox'}
                onChange={() => setSaveAs('inbox')}
              />
              <span className="text-sm">Save to Later inbox</span>
            </label>
          </fieldset>
        )}
      </div>

      <div className="mx-auto w-full max-w-lg space-y-3 pb-6">
        <button
          type="button"
          onClick={handleDone}
          disabled={isSaving}
          className="w-full rounded-lg bg-primary-500 px-6 py-3 font-semibold text-white disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Done'}
        </button>
        <button
          type="button"
          onClick={() => onDone('', 'skip')}
          disabled={isSaving}
          className="w-full text-sm text-text-secondary hover:text-text-primary"
        >
          Skip — return to Today
        </button>
        <button type="button" onClick={onBack} className="w-full text-sm text-text-muted">
          Back to timer
        </button>
      </div>
    </div>
  );
}
