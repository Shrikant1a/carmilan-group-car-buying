import React from 'react';

interface ProgressBarProps {
  current: number;
  target: number;
  className?: string;
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  target,
  className = '',
  showLabels = true,
  size = 'md',
}) => {
  const percentage = Math.min(100, Math.round((current / Math.max(1, target)) * 100));
  const isTargetReached = current >= target;

  const heightClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabels && (
        <div className="flex items-center justify-between text-xs font-semibold mb-1.5 text-slate-700">
          <span className="flex items-center gap-1.5">
            <span className="text-slate-900 font-bold text-sm">{current}</span> of {target} Buyers Joined
          </span>
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
            isTargetReached ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-50 text-indigo-700'
          }`}>
            {percentage}%
          </span>
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${heightClasses[size]} border border-slate-200/60 shadow-inner`}>
        <div
          className={`h-full transition-all duration-700 ease-out rounded-full ${
            isTargetReached
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
              : 'bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-400'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
