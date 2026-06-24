'use client';

import { useState } from 'react';

interface NextStepCaptureProps {
  title?: string;
  subtitle?: string;
  taskTitle?: string;
  onDone: (nextStep: string, saveAs: 'task' | 'inbox' | 'skip') => Promise<void>;
  onBack?: () => void;
}

export function NextStepCapture({
  title = "What's your next tiny step?",
  subtitle = 'Optional — capture it for later or skip.',
  taskTitle,
  onDone,
  onBack,
}: NextStepCaptureProps) {
  const [nextStep, setNextStep] = useState('');
  const [saveAs, setSaveAs] = useState<'task' | 'inbox' | 'skip'>('inbox');
  const [isSaving, setIsSaving] = useState(false);

  const handleDone = async () => {
    setIsSaving(true);
    try {
      const trimmed = nextStep.trim();
      await onDone(trimmed, trimmed ? saveAs : 'skip');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-surface p-4">
      <div className="mx-auto w-full max-w-lg flex-1">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="mt-2 text-text-secondary">{subtitle}</p>
        {taskTitle && (
          <p className="mt-4 text-sm text-text-muted">
            For: <span className="font-medium text-text-primary">{taskTitle}</span>
          </p>
        )}

        <textarea
          value={nextStep}
          onChange={(e) => setNextStep(e.target.value)}
          placeholder="e.g. put dishes away, reply to one email"
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
                checked={saveAs === 'inbox'}
                onChange={() => setSaveAs('inbox')}
              />
              <span className="text-sm">Later inbox</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="saveAs"
                checked={saveAs === 'task'}
                onChange={() => setSaveAs('task')}
              />
              <span className="text-sm">Update today&apos;s task next step</span>
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
        {onBack && (
          <button type="button" onClick={onBack} className="w-full text-sm text-text-muted">
            Back
          </button>
        )}
      </div>
    </div>
  );
}
