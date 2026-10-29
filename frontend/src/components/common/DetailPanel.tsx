import React from 'react';
import { X } from 'lucide-react';

interface DetailPanelProps {
  title: string;
  subtitle?: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const DetailPanel: React.FC<DetailPanelProps> = ({
  title,
  subtitle,
  isOpen,
  onClose,
  children,
  actions,
  className = '',
}) => {
  if (!isOpen) return null;

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3 shrink-0">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-slate-900 truncate">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-0.5 truncate">
              {subtitle}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
          title="Close details"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable Content Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {children}
      </div>

      {/* Footer / Actions */}
      {actions && (
        <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2.5 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};
