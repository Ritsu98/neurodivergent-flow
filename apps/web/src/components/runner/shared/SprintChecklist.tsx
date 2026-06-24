'use client';

interface SprintChecklistProps {
  items: string[];
  checked: Record<number, boolean>;
  onToggle: (index: number) => void;
}

export function SprintChecklist({ items, checked, onToggle }: SprintChecklistProps) {
  return (
    <ul className="space-y-2 rounded-lg border border-gray-200 bg-white p-4">
      {items.map((item, index) => (
        <li key={`${item}-${index}`}>
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={!!checked[index]}
              onChange={() => onToggle(index)}
              className="h-4 w-4 rounded"
            />
            <span className={`text-sm ${checked[index] ? 'text-text-muted line-through' : ''}`}>
              {item}
            </span>
          </label>
        </li>
      ))}
    </ul>
  );
}
