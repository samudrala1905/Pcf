import React from 'react';
import { cn } from '@/lib/utils';

// A number/value rendered as a drill-down link.
export function DrillValue({ children, onClick, className, testId }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      className={cn(
        'group inline-flex items-center gap-1 font-semibold text-saurient-navy underline decoration-dotted decoration-saurient-green/60 underline-offset-4 transition-colors hover:text-saurient-green',
        className
      )}
    >
      {children}
    </button>
  );
}
