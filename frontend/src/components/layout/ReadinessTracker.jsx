import React from 'react';
import { cn } from '@/lib/utils';
import { usePcf } from '@/store/PcfContext';
import { Check } from 'lucide-react';

// maps tracker step -> tab it opens
const STEPS = [
  { key: 'output', label: 'Output', tab: 'output', done: true },
  { key: 'boundary', label: 'Boundary', tab: 'boundary', done: true },
  { key: 'inventory', label: 'Inventory', tab: 'inventory', done: true },
  { key: 'allocation', label: 'Allocation', tab: 'allocation', done: true },
  { key: 'logistics', label: 'Logistics', tab: 'logistics', done: true },
  { key: 'calculation', label: 'Calculation', tab: 'calculation', done: true },
  { key: 'report', label: 'Report', tab: 'report', done: true },
  { key: 'verification', label: 'Verification', tab: 'report', done: false },
  { key: 'passport', label: 'Passport', tab: null, done: false },
];

export function ReadinessTracker() {
  const { setActiveTab, reportStatus } = usePcf();

  return (
    <div className="flex flex-wrap items-center gap-1 rounded-lg border border-border bg-white px-3 py-2.5">
      {STEPS.map((s, i) => {
        // verification becomes done once submitted
        const done = s.key === 'verification' ? reportStatus === 'SUBMITTED' : s.done;
        const clickable = done && s.tab;
        return (
          <React.Fragment key={s.key}>
            <button
              disabled={!clickable}
              onClick={() => clickable && setActiveTab(s.tab)}
              data-testid={`tracker-${s.key}`}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold transition-colors',
                done ? 'text-saurient-greendark' : 'text-slate-400',
                clickable && 'hover:bg-saurient-greenlight'
              )}
            >
              <span className={cn(
                'flex h-4 w-4 items-center justify-center rounded-full border',
                done ? 'border-saurient-green bg-saurient-green text-white' : 'border-slate-300 bg-white'
              )}>
                {done ? <Check className="h-3 w-3" /> : <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />}
              </span>
              {s.label}
            </button>
            {i < STEPS.length - 1 && <span className="h-px w-3 bg-slate-200" />}
          </React.Fragment>
        );
      })}
    </div>
  );
}
