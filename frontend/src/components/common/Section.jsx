import React from 'react';
import { cn } from '@/lib/utils';

export function Section({ title, desc, right, children, className, testId }) {
  return (
    <div data-testid={testId} className={cn('rounded-lg border border-border bg-card', className)}>
      {(title || right) && (
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div>
            {title && <h3 className="text-sm font-bold uppercase tracking-wide text-saurient-navy">{title}</h3>}
            {desc && <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>}
          </div>
          {right}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

export function Field({ label, children, hint }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}

// static read-only value shown like a field value
export function ReadValue({ value }) {
  return (
    <div className="flex h-9 items-center rounded-md border border-border bg-slate-50 px-3 text-sm font-medium text-saurient-navy">
      {value}
    </div>
  );
}
