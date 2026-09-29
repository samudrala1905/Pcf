import React from 'react';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import { StatusChip } from '@/components/common/StatusChip';
import { CheckCircle2, FileText, ArrowRight } from 'lucide-react';

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border py-2 last:border-0">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-semibold text-saurient-navy">{value}</span>
    </div>
  );
}

export function ActivityDrawer({ activity, open, onOpenChange }) {
  if (!activity) return null;
  const a = activity;
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl thin-scroll" data-testid="activity-drawer">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>{a.activity}</span>
            <StatusChip status={a.status} />
          </SheetTitle>
          <p className="text-left text-xs text-muted-foreground">{a.id} · {a.stage}</p>
        </SheetHeader>

        <div className="mt-4 grid grid-cols-2 gap-x-6">
          <Row label="Activity ID" value={a.id} />
          <Row label="Scope" value={a.scope} />
          <Row label="Facility" value={a.facility} />
          <Row label="Process" value={a.process} />
          <Row label="Equipment" value={a.equipment} />
          <Row label="Meter" value={a.meter} />
          <Row label="Category" value={a.category} />
          <Row label="Lifecycle Stage" value={a.stage} />
          <Row label="Quantity" value={`${a.quantity.toLocaleString()} ${a.unit}`} />
          <Row label="Timestamp" value={a.timestamp} />
          <Row label="Source System" value={a.sourceSystem} />
          <Row label="Supplier" value={a.supplier} />
          <Row label="Emission Factor" value={a.ef} />
          <Row label="Factor Version" value={a.factorVersion} />
          <Row label="Data Quality" value={`${a.quality}/100`} />
          <Row label="Created By" value={a.createdBy} />
          <Row label="Last Updated" value={a.lastUpdated} />
          <Row label="Calculated CO₂e" value={`${a.co2e.toLocaleString()} kgCO₂e`} />
        </div>

        {/* Evidence */}
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-saurient-green/30 bg-saurient-greenlight/50 px-3 py-2 text-sm">
          <CheckCircle2 className="h-4 w-4 text-saurient-green" />
          <span className="font-semibold text-saurient-greendark">Evidence attached</span>
          <FileText className="ml-auto h-4 w-4 text-slate-400" />
          <span className="text-xs text-slate-500">{a.id}-evidence.pdf</span>
        </div>

        {/* Provenance */}
        <div className="mt-5">
          <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-saurient-navy">Provenance / Traceability</h4>
          <div className="flex flex-wrap items-center gap-2">
            {a.provenance.map((p, i) => (
              <React.Fragment key={p}>
                <span className="rounded-md border border-border bg-slate-50 px-2.5 py-1 text-xs font-semibold text-saurient-navy">{p}</span>
                {i < a.provenance.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-slate-400" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Calculation line */}
        <div className="mt-5 rounded-lg border border-border bg-slate-50 p-4">
          <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-saurient-navy">Calculation</h4>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <code className="rounded bg-white px-2 py-1 tabular">{a.quantity.toLocaleString()} {a.unit}</code>
            <span className="text-slate-400">×</span>
            <code className="rounded bg-white px-2 py-1 tabular">{a.ef}</code>
            <span className="text-slate-400">=</span>
            <code className="rounded bg-saurient-navy px-2 py-1 font-bold text-white tabular">{a.co2e.toLocaleString()} kgCO₂e</code>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
