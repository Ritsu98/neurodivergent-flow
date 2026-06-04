'use client';

import { useState } from 'react';

interface LaterCaptureModalProps {
  onSave: (content: string) => Promise<void>;
  onClose: () => void;
}

export function LaterCaptureModal({ onSave, onClose }: LaterCaptureModalProps) {
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    const trimmed = content.trim();
    if (!trimmed) return;
    setIsSaving(true);
    try {
      await onSave(trimmed);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="dialog"
      aria-labelledby="later-capture-title"
    >
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h2 id="later-capture-title" className="text-lg font-semibold">
          What came up?
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          Capture it for later. Your timer keeps running.
        </p>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Quick note..."
          rows={3}
          className="mt-4 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          autoFocus
        />
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!content.trim() || isSaving}
            className="flex-1 rounded-lg bg-primary-500 px-4 py-2 font-semibold text-white disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save to Later'}
          </button>
        </div>
      </div>
    </div>
  );
}
