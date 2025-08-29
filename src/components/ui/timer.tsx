import React from 'react';

type TimerProps = {
  value: number; // seconds
  total: number; // seconds
};

export const Timer: React.FC<TimerProps> = ({ value, total }) => {
  const minutes = Math.floor(value / 60).toString().padStart(2, '0');
  const seconds = (value % 60).toString().padStart(2, '0');
  const progress = Math.max(0, Math.min(100, (1 - value / Math.max(1, total)) * 100));

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
          <path
            d="M18 2a16 16 0 1 1 0 32 16 16 0 0 1 0-32"
            fill="none"
            stroke="var(--app-light-gray)"
            strokeWidth="2"
          />
          <path
            d="M18 2a16 16 0 1 1 0 32 16 16 0 0 1 0-32"
            fill="none"
            stroke="var(--app-blue)"
            strokeWidth="2"
            strokeDasharray={`${progress}, 100`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-xl font-semibold text-[var(--app-text)]">
          {minutes}:{seconds}
        </div>
      </div>
    </div>
  );
};

export default Timer;

