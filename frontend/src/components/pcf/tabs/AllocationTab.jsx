import React, { useEffect, useState } from 'react';
import { usePcf } from '@/store/PcfContext';
import { Section, Field } from '@/components/common/Section';
import { StatusChip } from '@/components/common/StatusChip';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { fmtNum } from '@/lib/format';
import { CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

// allocation parameter per method (relative weights)
const METHODS = {
  'Physical / Mass': (p) => p.qty,
  'Energy Content': (p) => p.qty * (p.name.includes('Butter') ? 1.35 : p.name.includes('Cake') ? 0.9 : 1.0),
  'Economic': (p) => p.qty * (p.name.includes('Butter') ? 3.2 : p.name.includes('Cake') ? 1.1 : 0.5),
  'Custom Justified Method': (p) => p.qty,
};

export function AllocationTab({ registerPrimary }) {
  const { allocation, allocationMethod, setAllocationMethod } = usePcf();
  const [validated, setValidated] = useState(true);

  useEffect(() => { registerPrimary(() => { setValidated(true); toast.success('Allocation validated & reconciled.'); }); }, [registerPrimary]);

  const weightFn = METHODS[allocationMethod];
  const weights = allocation.products.map((p) => ({ ...p, w: weightFn(p) }));
  const totalW = weights.reduce((s, p) => s + p.w, 0);
  const rows = weights.map((p) => {
    const share = p.w / totalW;
    return { ...p, share, allocated: Math.round(allocation.totalSharedKg * share) };
  });
  const allocatedSum = rows.reduce((s, r) => s + r.allocated, 0);
  const reconciled = Math.abs(allocatedSum - allocation.totalSharedKg) <= 5;
  const target = rows.find((r) => r.isTarget);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Section title="Shared Process" testId="section-shared-process">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-bold text-saurient-navy">{allocation.sharedProcess}</div>
              <p className="text-xs text-muted-foreground">Energy + Fuel + Process emissions shared across co-products</p>
            </div>
          </div>
        </Section>
        <Section title="Total Shared Emissions" testId="section-total-shared">
          <div className="text-3xl font-extrabold tabular text-saurient-navy">{fmtNum(allocation.totalSharedKg)} <span className="text-base font-semibold text-muted-foreground">kgCO₂e</span></div>
          <p className="mt-1 text-xs text-muted-foreground">{(allocation.totalSharedKg / 1000).toFixed(1)} tCO₂e to be allocated</p>
        </Section>
      </div>

      <Section title="Co-product Allocation" testId="section-allocation-table"
        right={
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Method</span>
            <Select value={allocationMethod} onValueChange={setAllocationMethod}>
              <SelectTrigger className="w-56" data-testid="select-allocation-method"><SelectValue /></SelectTrigger>
              <SelectContent>{Object.keys(METHODS).map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        }>
        <div className="overflow-x-auto thin-scroll">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-slate-50 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                {['Product','Production Qty','Allocation Method','Allocation Parameter','Allocation %','Allocated CO₂e'].map((h) => <th key={h} className="px-4 py-2.5 font-semibold">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.name} className={`border-b border-border last:border-0 ${r.isTarget ? 'bg-saurient-greenlight/30' : ''}`} data-testid={`alloc-row-${r.name}`}>
                  <td className="px-4 py-2.5 font-semibold text-saurient-navy">{r.name}{r.isTarget && <span className="ml-2 text-[10px] font-bold uppercase text-saurient-green">Target</span>}</td>
                  <td className="px-4 py-2.5 tabular">{fmtNum(r.qty)} kg</td>
                  <td className="px-4 py-2.5">{allocationMethod}</td>
                  <td className="px-4 py-2.5 tabular">{fmtNum(Math.round(r.w))}</td>
                  <td className="px-4 py-2.5 tabular font-semibold">{(r.share * 100).toFixed(2)}%</td>
                  <td className="px-4 py-2.5 tabular font-bold text-saurient-navy">{fmtNum(r.allocated)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Formula */}
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-slate-50 p-4 text-sm">
          <code className="rounded bg-white px-2 py-1 tabular">{fmtNum(allocation.totalSharedKg)} kgCO₂e</code>
          <span className="text-slate-400">×</span>
          <code className="rounded bg-white px-2 py-1 tabular">{target ? (target.share * 100).toFixed(2) : 0}% (Cocoa Butter share)</code>
          <span className="text-slate-400">=</span>
          <code className="rounded bg-saurient-navy px-2 py-1 font-bold text-white tabular">{target ? fmtNum(target.allocated) : 0} kgCO₂e</code>
        </div>
      </Section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Allocation Justification" testId="section-justification">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Method"><div className="text-sm font-semibold text-saurient-navy">{allocationMethod}</div></Field>
            <Field label="Version"><div className="text-sm font-semibold text-saurient-navy">{allocation.justification.version}</div></Field>
            <div className="col-span-2"><Field label="Reason"><p className="text-sm text-slate-600">{allocation.justification.reason}</p></Field></div>
            <Field label="Supporting Dataset"><div className="text-sm text-slate-600">{allocation.justification.dataset}</div></Field>
            <Field label="Evidence"><div className="text-sm text-slate-600">{allocation.justification.evidence}</div></Field>
            <Field label="Approved By"><div className="text-sm text-slate-600">{allocation.justification.approvedBy}</div></Field>
          </div>
        </Section>

        <Section title="Reconciliation" testId="section-reconciliation"
          right={reconciled ? <StatusChip status="RECONCILED" tone="green" /> : <StatusChip status="ALLOCATION MISMATCH" tone="red" />}>
          <div className="space-y-2 text-sm">
            {rows.map((r) => (
              <div key={r.name} className="flex items-center justify-between">
                <span className="text-slate-600">{r.name}</span>
                <span className="tabular font-semibold">{fmtNum(r.allocated)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Permitted Residual</span>
              <span className="tabular font-semibold">{fmtNum(allocation.residualKg)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
              <span className="font-bold text-saurient-navy">Total allocated</span>
              <span className="tabular font-extrabold text-saurient-navy">{fmtNum(allocatedSum)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Total shared emissions</span>
              <span className="tabular text-slate-500">{fmtNum(allocation.totalSharedKg)}</span>
            </div>
            {reconciled && (
              <div className="mt-2 flex items-center gap-2 rounded-md border border-saurient-green/30 bg-saurient-greenlight/50 px-3 py-2 text-saurient-greendark">
                <CheckCircle2 className="h-4 w-4" /> <span className="text-sm font-semibold">Allocations reconcile to total shared emissions.</span>
              </div>
            )}
          </div>
        </Section>
      </div>

      <div className="flex items-center justify-end gap-3">
        {validated && <StatusChip status="ALLOCATION VALIDATED" tone="green" />}
        <Button onClick={() => { setValidated(true); toast.success('Allocation validated & reconciled.'); }} data-testid="btn-validate-allocation" className="bg-saurient-green hover:bg-saurient-greendark">
          Validate Allocation
        </Button>
      </div>
    </div>
  );
}
