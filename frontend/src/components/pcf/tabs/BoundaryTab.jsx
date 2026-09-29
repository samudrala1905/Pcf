import React, { useEffect, useState } from 'react';
import { usePcf } from '@/store/PcfContext';
import { Section } from '@/components/common/Section';
import { StatusChip } from '@/components/common/StatusChip';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { BOUNDARY_STAGES, LIFECYCLE_FLOW, EXCLUSIONS } from '@/store/pcfData';
import { cn } from '@/lib/utils';
import { ArrowRight, CheckCircle2, XCircle, FileText, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

const SCOPE_MAP = [
  { scope: 'Scope 1', tone: 'amber', items: ['Direct combustion', 'Diesel', 'Gas', 'Refrigerants', 'Process emissions'] },
  { scope: 'Scope 2', tone: 'blue', items: ['Purchased electricity', 'Purchased energy'] },
  { scope: 'Scope 3', tone: 'green', items: ['Raw materials', 'Suppliers', 'Transport', 'Packaging', 'Waste'] },
];

export function BoundaryTab({ registerPrimary }) {
  const { boundaryType, setBoundaryType, boundaryApproved, setBoundaryApproved } = usePcf();
  const [approved, setApproved] = useState(boundaryApproved);

  useEffect(() => {
    registerPrimary(() => { setApproved(true); setBoundaryApproved(true); toast.success('Boundary approved.'); });
  }, [registerPrimary, setBoundaryApproved]);

  const ctg = boundaryType === 'Cradle-to-Gate';

  return (
    <div className="space-y-6">
      <Section title="Boundary Type" testId="section-boundary-type"
        right={approved ? <StatusChip status="BOUNDARY APPROVED" tone="green" /> : <StatusChip status="REVIEW" />}>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Selected boundary</span>
            <Select value={boundaryType} onValueChange={setBoundaryType}>
              <SelectTrigger className="w-56" data-testid="select-boundary-type"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Cradle-to-Gate">Cradle-to-Gate</SelectItem>
                <SelectItem value="Gate-to-Gate">Gate-to-Gate</SelectItem>
                <SelectItem value="Cradle-to-Grave">Cradle-to-Grave</SelectItem>
                <SelectItem value="Custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-full bg-saurient-navy px-3 py-1 text-sm font-bold uppercase tracking-wide text-white">{boundaryType}</div>
        </div>

        {/* Lifecycle visual */}
        <div className="mt-5 flex flex-wrap items-center gap-1.5 overflow-x-auto rounded-lg border border-border bg-slate-50 p-4 thin-scroll">
          {LIFECYCLE_FLOW.map((s, i) => (
            <React.Fragment key={s.key}>
              <div className={cn(
                'whitespace-nowrap rounded-md border px-3 py-2 text-xs font-bold uppercase tracking-wide',
                s.inCTG ? 'border-saurient-green/40 bg-white text-saurient-navy' : 'border-slate-200 bg-slate-100 text-slate-300 line-through'
              )}>{s.label}</div>
              {i < LIFECYCLE_FLOW.length - 1 && <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />}
            </React.Fragment>
          ))}
          <div className="ml-2 flex items-center gap-1 whitespace-nowrap rounded-md border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-300 line-through">
            Distribution · Use · End-of-Life
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Stages outside the selected {boundaryType} boundary are greyed out and excluded from the official PCF.</p>
      </Section>

      <Section title="Lifecycle Stage Inclusion" testId="section-boundary-table">
        <div className="overflow-x-auto thin-scroll">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-slate-50 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                {['Lifecycle Stage','Included','Scope','Reason','Materiality','Evidence','Status'].map((h) => <th key={h} className="px-4 py-2.5 font-semibold">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {BOUNDARY_STAGES.map((r) => (
                <tr key={r.stage} className={cn('border-b border-border last:border-0', !r.included && 'bg-slate-50 text-slate-400')}>
                  <td className="px-4 py-2.5 font-semibold text-saurient-navy">{r.stage}</td>
                  <td className="px-4 py-2.5">
                    {r.included
                      ? <span className="inline-flex items-center gap-1 font-semibold text-saurient-green"><CheckCircle2 className="h-4 w-4" /> YES</span>
                      : <span className="inline-flex items-center gap-1 font-semibold text-slate-400"><XCircle className="h-4 w-4" /> NO</span>}
                  </td>
                  <td className="px-4 py-2.5">{r.scope}</td>
                  <td className="px-4 py-2.5">{r.reason}</td>
                  <td className="px-4 py-2.5"><StatusChip status={r.materiality} /></td>
                  <td className="px-4 py-2.5">{r.evidence ? <FileText className="h-4 w-4 text-saurient-green" /> : '—'}</td>
                  <td className="px-4 py-2.5">{r.included ? <StatusChip status="Validated" /> : <StatusChip status="Excluded" />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Exclusions Register" testId="section-exclusions"
          right={<span className="flex items-center gap-1 text-xs font-semibold text-saurient-amber"><ShieldAlert className="h-4 w-4" /> Never silently excluded</span>}>
          <div className="space-y-3">
            {EXCLUSIONS.map((e) => (
              <div key={e.activity} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-saurient-navy">{e.activity}</span>
                  <span className="text-xs text-muted-foreground">Materiality: {e.materiality}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500"><span className="font-semibold">Reason:</span> {e.reason}</p>
                <p className="mt-0.5 text-xs text-slate-500"><span className="font-semibold">Justification:</span> {e.justification}</p>
                <p className="mt-1 text-[11px] text-slate-400">Approved by {e.approvedBy} · {e.date}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Scope Mapping" testId="section-scope-map">
          <div className="space-y-3">
            {SCOPE_MAP.map((s) => (
              <div key={s.scope} className="rounded-lg border border-border p-3">
                <StatusChip status={s.scope} tone={s.tone} />
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {s.items.map((it) => <span key={it} className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600">{it}</span>)}
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => { setApproved(true); setBoundaryApproved(true); toast.success('Boundary approved.'); }} data-testid="btn-approve-boundary" className="bg-saurient-green hover:bg-saurient-greendark">
          Approve Boundary
        </Button>
      </div>
    </div>
  );
}
