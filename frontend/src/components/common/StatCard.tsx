import React from 'react';

export type StatusDotVariant = 'neutral' | 'info' | 'success' | 'warning' | 'error';

export interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  dotVariant?: StatusDotVariant;
  onClick?: () => void;
  className?: string;
}

const dotColors: Record<StatusDotVariant, string> = {
  neutral: 'bg-slate-400',
  info: 'bg-blue-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  error: 'bg-rose-500',
};

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  dotVariant = 'neutral',
  onClick,
  className = '',
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-slate-200 p-5 shadow-xs transition-all duration-150 ${
        onClick
          ? 'cursor-pointer hover:border-slate-300 hover:shadow-sm'
          : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-slate-500">
          {label}
        </span>
        <span
          className={`w-2 h-2 rounded-full shrink-0 ${dotColors[dotVariant]}`}
          aria-hidden="true"
        />
      </div>

      <div className="mt-2">
        <span className="text-2xl font-semibold text-slate-900 tracking-tight font-mono">
          {value}
        </span>
      </div>

      {subtext && (
        <div className="mt-1 text-xs text-slate-500">
          {subtext}
        </div>
      )}
    </div>
  );
};
