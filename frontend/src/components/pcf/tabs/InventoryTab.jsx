import React, { useEffect, useState } from 'react';
import { usePcf } from '@/store/PcfContext';
import { KpiCard } from '@/components/common/KpiCard';
import { Section } from '@/components/common/Section';
import { StatusChip } from '@/components/common/StatusChip';
import { DataQualityPanel } from '@/components/common/DataQualityPanel';
import { ActivityDrawer } from '@/components/pcf/ActivityDrawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { VALIDATION_ISSUES } from '@/store/pcfData';
import { fmtNum } from '@/lib/format';
import { Database, Cpu, FileCheck2, Gauge, AlertCircle, FileText, Plus, Upload, Link2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const BADGE_TONE = {
  'SATTRIC+': 'bg-purple-100 text-purple-700', 'PAS800': 'bg-sky-100 text-sky-700',
  'ERP': 'bg-slate-200 text-slate-700', 'SUPPLIER': 'bg-amber-100 text-amber-700',
  'MANUAL': 'bg-rose-100 text-rose-700', 'API': 'bg-emerald-100 text-emerald-700', 'CSV': 'bg-indigo-100 text-indigo-700',
};

function SourceBadge({ s }) {
  return <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-bold uppercase', BADGE_TONE[s] || 'bg-slate-100 text-slate-600')}>{s}</span>;
}

export function InventoryTab({ registerPrimary, search }) {
  const { activities, addActivity } = usePcf();
  const [selected, setSelected] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dqOpen, setDqOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ activity: '', quantity: '', unit: 'kWh', scope: 'Scope 2', ef: '0.5', category: 'Energy' });

  useEffect(() => { registerPrimary(() => setAddOpen(true)); }, [registerPrimary]);

  const openRow = (a) => { setSelected(a); setDrawerOpen(true); };

  const submitAdd = () => {
    const qty = Number(form.quantity) || 0;
    const efv = Number(form.ef) || 0;
    const rec = {
      id: `ACT-${String(activities.length + 1).padStart(3, '0')}`,
      stage: form.category, category: form.category, activity: form.activity || 'New Activity',
      quantity: qty, unit: form.unit, scope: form.scope, process: 'Manual',
      source: 'MANUAL', sourceSystem: 'Manual Entry', ef: `${efv} kgCO2e/${form.unit}`, efValue: efv,
      factorVersion: 'Manual', co2e: Math.round(qty * efv), evidence: false, quality: 70, status: 'Validated',
      facility: 'Tema Processing Plant', equipment: '—', meter: '—', timestamp: new Date().toISOString().slice(0, 10),
      supplier: '—', createdBy: 'a.boateng', lastUpdated: new Date().toISOString().slice(0, 10),
      provenance: ['Manual Entry', 'Validation', 'Inventory Record'],
    };
    addActivity(rec);
    setAddOpen(false);
    toast.success(`${rec.id} added — recalculation required.`);
  };

  const rows = activities.filter((a) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return [a.id, a.activity, a.scope, a.sourceSystem, a.stage].some((v) => String(v).toLowerCase().includes(q));
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <KpiCard label="Activity Records" value={48} icon={Database} testId="kpi-records" />
        <KpiCard label="Automated Sources" value={21} icon={Cpu} testId="kpi-automated" />
        <KpiCard label="Evidence Coverage" value="94%" icon={FileCheck2} testId="kpi-evidence" />
        <KpiCard label="Data Quality" value="92/100" accent icon={Gauge} onClick={() => setDqOpen(true)} testId="kpi-dq" />
        <KpiCard label="Missing Records" value={3} icon={AlertCircle} testId="kpi-missing" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="mr-auto flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <span className="font-semibold uppercase">Sources:</span>
          {['SATTRIC+','PAS800','ERP','SUPPLIER','MANUAL','API','CSV'].map((s) => <SourceBadge key={s} s={s} />)}
        </div>
        <Button variant="outline" size="sm" onClick={() => setAddOpen(true)} data-testid="btn-add-activity"><Plus className="mr-1 h-4 w-4" /> Add Activity</Button>
        <Button variant="outline" size="sm" onClick={() => toast.info('CSV import wizard (simulated).')} data-testid="btn-import-csv"><Upload className="mr-1 h-4 w-4" /> Import CSV</Button>
        <Button variant="outline" size="sm" onClick={() => toast.info('Connect a new data source (simulated).')} data-testid="btn-connect-source"><Link2 className="mr-1 h-4 w-4" /> Connect Source</Button>
        <Button size="sm" onClick={() => toast.success('Inventory validated — no critical errors.')} data-testid="btn-validate-inventory" className="bg-saurient-green hover:bg-saurient-greendark"><ShieldCheck className="mr-1 h-4 w-4" /> Validate Inventory</Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h3 className="text-sm font-bold uppercase tracking-wide text-saurient-navy">Activity Data Ledger</h3>
          <StatusChip status="INVENTORY COMPLETE" tone="green" />
        </div>
        <div className="overflow-x-auto thin-scroll">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-slate-50 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                {['ID','Stage','Source','Activity','Quantity','Unit','Scope','Process','Emission Factor','CO₂e','Evidence','Quality','Status'].map((h) => <th key={h} className="whitespace-nowrap px-3 py-2.5 font-semibold">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id} onClick={() => openRow(a)} className="cursor-pointer border-b border-border last:border-0 hover:bg-saurient-greenlight/30" data-testid={`inv-row-${a.id}`}>
                  <td className="whitespace-nowrap px-3 py-2.5 font-bold text-saurient-navy">{a.id}</td>
                  <td className="whitespace-nowrap px-3 py-2.5">{a.stage}</td>
                  <td className="whitespace-nowrap px-3 py-2.5"><SourceBadge s={a.source} /></td>
                  <td className="whitespace-nowrap px-3 py-2.5 font-medium">{a.activity}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 tabular">{fmtNum(a.quantity)}</td>
                  <td className="whitespace-nowrap px-3 py-2.5">{a.unit}</td>
                  <td className="whitespace-nowrap px-3 py-2.5"><StatusChip status={a.scope} /></td>
                  <td className="whitespace-nowrap px-3 py-2.5">{a.process}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 tabular text-xs">{a.ef}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 tabular font-semibold">{fmtNum(a.co2e)}</td>
                  <td className="whitespace-nowrap px-3 py-2.5">{a.evidence ? <FileText className="h-4 w-4 text-saurient-green" /> : <span className="text-xs text-saurient-amber">Missing</span>}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 tabular">{a.quality}</td>
                  <td className="whitespace-nowrap px-3 py-2.5"><StatusChip status={a.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Section title="Validation Engine" testId="section-validation">
        <div className="space-y-2">
          {VALIDATION_ISSUES.map((v, i) => (
            <div key={i} className="flex items-center gap-3 rounded-md border border-border px-3 py-2 text-sm">
              <StatusChip status={v.severity} />
              <span className="font-semibold text-saurient-navy">{v.type}</span>
              <span className="text-slate-500">{v.record}</span>
              <span className="ml-auto text-xs text-slate-400">{v.detail}</span>
            </div>
          ))}
          <div className="flex flex-wrap gap-1.5 pt-1 text-[11px] text-muted-foreground">
            <span className="font-semibold uppercase">Checks:</span>
            {['Missing Data','Duplicate Record','Incorrect Unit','Meter Gap','Abnormal Value','Missing Evidence','Missing Emission Factor'].map((c) => (
              <span key={c} className="rounded bg-slate-100 px-1.5 py-0.5">{c}</span>
            ))}
          </div>
        </div>
      </Section>

      <ActivityDrawer activity={selected} open={drawerOpen} onOpenChange={setDrawerOpen} />
      <DataQualityPanel open={dqOpen} onOpenChange={setDqOpen} />

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent data-testid="add-activity-dialog">
          <DialogHeader><DialogTitle>Add Activity Data</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label>Activity name</Label>
              <Input value={form.activity} onChange={(e) => setForm({ ...form, activity: e.target.value })} placeholder="e.g. Steam" data-testid="add-activity-name" />
            </div>
            <div className="space-y-1.5"><Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger data-testid="add-activity-category"><SelectValue /></SelectTrigger>
                <SelectContent>{['Raw Materials','Energy','Fuel','Process Emissions','Packaging','Waste'].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Scope</Label>
              <Select value={form.scope} onValueChange={(v) => setForm({ ...form, scope: v })}>
                <SelectTrigger data-testid="add-activity-scope"><SelectValue /></SelectTrigger>
                <SelectContent>{['Scope 1','Scope 2','Scope 3'].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Quantity</Label><Input value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} type="number" data-testid="add-activity-qty" /></div>
            <div className="space-y-1.5"><Label>Unit</Label><Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} data-testid="add-activity-unit" /></div>
            <div className="space-y-1.5"><Label>Emission factor (kgCO₂e/unit)</Label><Input value={form.ef} onChange={(e) => setForm({ ...form, ef: e.target.value })} type="number" data-testid="add-activity-ef" /></div>
            <div className="flex items-end"><div className="rounded-md bg-slate-50 px-3 py-2 text-sm">= <span className="font-bold tabular">{fmtNum(Math.round((Number(form.quantity) || 0) * (Number(form.ef) || 0)))}</span> kgCO₂e</div></div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={submitAdd} data-testid="add-activity-submit" className="bg-saurient-green hover:bg-saurient-greendark">Add Activity</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
