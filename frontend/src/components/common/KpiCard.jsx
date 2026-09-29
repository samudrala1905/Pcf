import React from 'react';
import { cn } from '@/lib/utils';

export function KpiCard({ label, value, sub, accent = false, onClick, testId, icon: Icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      className={cn(
        'group flex flex-col items-start rounded-lg border bg-card p-4 text-left transition-shadow hover:shadow-md',
        onClick ? 'cursor-pointer' : 'cursor-default',
        accent ? 'border-saurient-green/40 bg-saurient-greenlight/40' : 'border-border'
      )}
    >
      <div className="flex w-full items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
        {Icon && <Icon className={cn('h-4 w-4', accent ? 'text-saurient-green' : 'text-slate-400')} />}
      </div>
      <span className="mt-2 text-2xl font-extrabold tabular text-saurient-navy">{value}</span>
      {sub && <span className="mt-0.5 text-xs text-muted-foreground">{sub}</span>}
    </button>
  );
}
