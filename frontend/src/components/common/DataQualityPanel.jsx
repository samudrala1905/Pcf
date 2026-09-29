import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { DATA_QUALITY } from '@/store/pcfData';
import { AlertTriangle } from 'lucide-react';

export function DataQualityPanel({ open, onOpenChange }) {
  const dq = DATA_QUALITY;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" data-testid="data-quality-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Data Quality Breakdown</span>
            <span className="text-2xl font-extrabold text-saurient-green tabular">{dq.overall}/100</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {dq.breakdown.map((b) => (
            <div key={b.label}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-slate-600">{b.label}</span>
                <span className="font-semibold tabular text-saurient-navy">{b.score}</span>
              </div>
              <Progress value={b.score} className="h-2" />
            </div>
          ))}
        </div>

        <div className="mt-2 rounded-lg border border-amber-200 bg-saurient-amberlight/60 p-3">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-saurient-amber">
            <AlertTriangle className="h-4 w-4" /> Records reducing the score
          </div>
          <ul className="space-y-1.5 text-sm">
            {dq.detractors.map((d) => (
              <li key={d.record} className="flex items-center justify-between">
                <span className="text-slate-700">{d.record}</span>
                <span className="text-slate-500">{d.reason} <span className="font-semibold text-saurient-red">{d.impact}</span></span>
              </li>
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
