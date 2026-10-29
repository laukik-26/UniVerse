import React from 'react';

export type BadgeVariant = 'pending' | 'active' | 'in_progress' | 'success' | 'resolved' | 'neutral' | 'dismissed' | 'error';

interface StatusBadgeProps {
  status: string;
  variant?: BadgeVariant;
  label?: string;
  className?: string;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string; border: string; dot: string }> = {
  pending: {
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
  active: {
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
  },
  in_progress: {
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
  },
  success: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
  },
  resolved: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
  },
  neutral: {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
  },
  dismissed: {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
  },
  error: {
    bg: 'bg-rose-50',
    text: 'text-rose-800',
    border: 'border-rose-200',
    dot: 'bg-rose-500',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant,
  label,
  className = '',
}) => {
  // Infer variant from status string if not explicitly passed
  let resolvedVariant: BadgeVariant = variant || 'neutral';
  if (!variant) {
    const s = status.toLowerCase();
    if (s.includes('pending') || s.includes('queue') || s.includes('unreviewed')) resolvedVariant = 'pending';
    else if (s.includes('in_progress') || s.includes('review') || s.includes('active')) resolvedVariant = 'active';
    else if (s.includes('resolved') || s.includes('completed') || s.includes('success') || s.includes('matched')) resolvedVariant = 'resolved';
    else if (s.includes('dismissed') || s.includes('closed') || s.includes('neutral')) resolvedVariant = 'neutral';
    else if (s.includes('error') || s.includes('failed') || s.includes('alert') || s.includes('cancelled')) resolvedVariant = 'error';
  }

  const style = variantStyles[resolvedVariant] || variantStyles.neutral;
  const displayLabel = label || status.replace(/_/g, ' ');

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${style.bg} ${style.text} ${style.border} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} aria-hidden="true" />
      <span>{displayLabel}</span>
    </span>
  );
};
