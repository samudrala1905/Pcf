import React from 'react';
import { cn } from '@/lib/utils';

const STYLES = {
  green: 'bg-saurient-greenlight text-saurient-greendark border-saurient-green/30',
  amber: 'bg-saurient-amberlight text-saurient-amber border-saurient-amber/30',
  red: 'bg-red-50 text-saurient-red border-red-200',
  blue: 'bg-sky-50 text-sky-700 border-sky-200',
  slate: 'bg-slate-100 text-slate-600 border-slate-200',
  navy: 'bg-saurient-navy text-white border-saurient-navy',
};

// map a status label -> tone
const TONE = {
  'DRAFT': 'slate', 'Draft': 'slate',
  'DATA COLLECTION': 'blue',
  'DATA COMPLETE': 'blue',
  'CALCULATION READY': 'blue', 'Calculation Ready': 'blue',
  'CALCULATED': 'green', 'Calculated': 'green',
  'REVIEW': 'amber',
  'VERIFICATION READY': 'green', 'Ready': 'green',
  'SUBMITTED': 'amber', 'Submitted': 'amber',
  'Awaiting Verification': 'amber', 'Pending': 'amber',
  'VERIFIED': 'green', 'Verified': 'green',
  'LOCKED': 'navy',
  'CHANGE DETECTED': 'amber',
  'RECALCULATION REQUIRED': 'red',
  'RECONCILED': 'green',
  'ALLOCATION MISMATCH': 'red',
  'In': 'green', 'Out': 'slate',
  'Validated': 'green', 'Warning': 'amber', 'Info': 'blue',
  'High': 'red', 'Medium': 'amber', 'Low': 'slate', 'Excluded': 'slate',
};

export function StatusChip({ status, tone, className, testId }) {
  const t = tone || TONE[status] || 'slate';
  return (
    <span
      data-testid={testId}
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
        STYLES[t], className
      )}
    >
      {status}
    </span>
  );
}
