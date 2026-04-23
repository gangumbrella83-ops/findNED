import React from 'react';
import { cn } from '../lib/utils';
import { ReportStatus } from '../types';

const statusConfig: Record<ReportStatus, { color: string; label: string }> = {
  'Pending': { color: 'bg-amber-50 text-amber-600 border-amber-100', label: 'Pending' },
  'Under Review': { color: 'bg-blue-50 text-blue-600 border-blue-100', label: 'Reviewing' },
  'Matched': { color: 'bg-emerald-50 text-emerald-600 border-emerald-100', label: 'Matched' },
  'Resolved': { color: 'bg-primary-extralight text-primary border-primary/20', label: 'Resolved' },
  'Rejected': { color: 'bg-red-50 text-red-600 border-red-100', label: 'Rejected' },
};

export function StatusBadge({ status, className }: { status: ReportStatus; className?: string }) {
  const config = statusConfig[status];
  return (
    <span className={cn(
      "px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all",
      config.color,
      className
    )}>
      {config.label}
    </span>
  );
}
