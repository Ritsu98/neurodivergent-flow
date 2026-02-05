'use client';

import { useState, useEffect } from 'react';
import type { EnergyLog, DayColor } from '@neurodivergent-flow/core';

interface EnergySliderProps {
  initialValue?: number;
  dayColor?: DayColor;
  onSave: (value: number) => Promise<void>;
  disabled?: boolean;
}

export function EnergySlider({ initialValue, dayColor, onSave, disabled }: EnergySliderProps) {
  const [value, setValue] = useState(initialValue ?? 3);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialValue !== undefined) {
      setValue(initialValue);
    }
  }, [initialValue]);

  const handleChange = async (newValue: number) => {
    setValue(newValue);
    if (!disabled) {
      setIsSaving(true);
      try {
        await onSave(newValue);
      } catch (error) {
        console.error('Failed to save energy:', error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const getColor = (val: number): string => {
    if (val >= 4) return 'bg-energy-green';
    if (val >= 2) return 'bg-energy-yellow';
    return 'bg-energy-red';
  };

  const getLabel = (val: number): string => {
    if (val >= 4) return 'Green';
    if (val >= 2) return 'Yellow';
    return 'Red';
  };

  const currentColor = getColor(value);
  const currentLabel = getLabel(value);

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">How's your energy today?</h3>
          <p className="text-sm text-text-secondary">
            Today is a <span className={`font-medium ${currentColor.replace('bg-', 'text-')}`}>{currentLabel}</span> plan
          </p>
        </div>
        {isSaving && <span className="text-xs text-text-muted">Saving...</span>}
      </div>

      <div className="relative">
        <input
          type="range"
          min="0"
          max="5"
          step="1"
          value={value}
          onChange={(e) => handleChange(Number(e.target.value))}
          disabled={disabled}
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 disabled:cursor-not-allowed"
          style={{
            background: `linear-gradient(to right, ${currentColor.replace('bg-', '')} 0%, ${currentColor.replace('bg-', '')} ${(value / 5) * 100}%, #e5e7eb ${(value / 5) * 100}%, #e5e7eb 100%)`,
          }}
        />
        <div className="mt-2 flex justify-between text-xs text-text-secondary">
          <span>0</span>
          <span>1</span>
          <span>2</span>
          <span>3</span>
          <span>4</span>
          <span>5</span>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <div className={`flex-1 rounded-lg p-3 text-center ${currentColor} bg-opacity-10`}>
          <div className="text-sm font-medium">{currentLabel}</div>
          <div className="text-xs text-text-secondary">
            {value === 0 && 'Very low'}
            {value === 1 && 'Low'}
            {value === 2 && 'Moderate'}
            {value === 3 && 'Good'}
            {value === 4 && 'High'}
            {value === 5 && 'Very high'}
          </div>
        </div>
      </div>
    </div>
  );
}
