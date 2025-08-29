import React from 'react';

type Option = { id: string; label: string };

type SegmentedControlProps = {
  options: Option[];
  value: string;
  onChange: (id: string) => void;
};

export const SegmentedControl: React.FC<SegmentedControlProps> = ({ options, value, onChange }) => {
  return (
    <div className="inline-flex p-1 rounded-xl border border-[var(--app-light-gray)] bg-[var(--app-card)]">
      {options.map(opt => {
        const active = opt.id === value;
        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={`px-3 py-1.5 rounded-lg text-sm transition ${active ? 'text-white' : 'text-[var(--app-text)]'}`}
            style={{ backgroundColor: active ? 'var(--app-blue)' : 'transparent' }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};

export default SegmentedControl;

