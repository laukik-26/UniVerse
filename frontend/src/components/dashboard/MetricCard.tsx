import React from 'react';
import { ArrowUpRight, ArrowDownRight, Check } from 'lucide-react';

export interface MetricCardProps {
  label: string;
  value: string;
  deltaText: string;
  deltaType?: 'positive' | 'negative' | 'neutral' | 'eco';
  icon: React.ElementType;
  iconBgColor: string;
  iconTextColor: string;
  subtitle?: string;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  deltaText,
  deltaType = 'positive',
  icon: Icon,
  iconBgColor,
  iconTextColor,
  subtitle,
  onClick,
}) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-slate-300 hover:shadow' : ''
      }`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div 
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBgColor} ${iconTextColor}`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <span className="text-2xl font-bold text-slate-900 tracking-tight block leading-none">
            {value}
          </span>
          <span className="text-xs font-semibold text-slate-500 mt-1 block">
            {label}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 text-xs">
        {deltaType === 'positive' && (
          <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
            <ArrowUpRight className="w-3.5 h-3.5" />
            {deltaText}
          </span>
        )}
        {deltaType === 'eco' && (
          <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
            <Check className="w-3.5 h-3.5" />
            {deltaText}
          </span>
        )}
        {deltaType === 'negative' && (
          <span className="text-rose-600 font-semibold flex items-center gap-0.5">
            <ArrowDownRight className="w-3.5 h-3.5" />
            {deltaText}
          </span>
        )}
        {deltaType === 'neutral' && (
          <span className="text-slate-600 font-medium flex items-center gap-0.5">
            <Check className="w-3.5 h-3.5 text-blue-600" />
            {deltaText}
          </span>
        )}

        {subtitle && (
          <span className="text-slate-400 text-[11px] ml-auto">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};
