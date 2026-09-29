import React, { useEffect, useState } from 'react';
import { usePcf } from '@/store/PcfContext';
import { KpiCard } from '@/components/common/KpiCard';
import { Section } from '@/components/common/Section';
import { StatusChip } from '@/components/common/StatusChip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { fmtNum } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Truck, Route, Gauge, Leaf, ArrowRight, Plus, Upload, Calculator, FileText, MapPin } from 'lucide-react';
import { toast } from 'sonner';

const SUBTABS = ['Inbound', 'Internal', 'Outbound'];

export function LogisticsTab({ registerPrimary }) {
  const { legs, addLeg, logisticsInboundKg } = usePcf();
  const [sub, setSub] = useState('Inbound');
  const [addOpen, setAddOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [form, setForm] = useState({ from: '', to: '', material: 'Raw Cocoa', weightT: '', distanceKm: '', mode: 'Truck', basis: 'Tonne-km', co2e: '', boundary: 'Inbound' });

  useEffect(() => { registerPrimary(() => setAddOpen(true)); }, [registerPrimary]);

  const filtered = legs.filter((l) => l.tab === sub);
  const totalDistance = legs.reduce((s, l) => s + l.distanceKm, 0);
  const totalTkm = legs.reduce((s, l) => s + (l.tonneKm || 0), 0);

  const submitAdd = () => {
    const leg = {
      id: `LEG-${String(legs.length + 1).padStart(2, '0')}`,
      tab: form.boundary, from: form.from || 'Origin', to: form.to || 'Destination', material: form.material,
      weightT: Number(form.weightT) || 0, distanceKm: Number(form.distanceKm) || 0, mode: form.mode,
      vehicle: `${form.mode} (Diesel)`, fuel: 'Diesel', basis: form.basis,
      tonneKm: (Number(form.weightT) || 0) * (Number(form.distanceKm) || 0),
      ef: 'custom', co2e: Number(form.co2e) || 0, boundary: form.boundary === 'Outbound' ? 'Out' : 'In',
      evidence: true, loadFactor: '—', returnTrip: '—', tempControlled: 'No', carrier: 'Manual', distanceSource: 'Manual',
    };
    addLeg(leg);
    setAddOpen(false);
    toast.success(`${leg.id} added — recalculation required.`);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard label="Transport Legs" value={legs.length} icon={Truck} testId="kpi-legs" />
        <KpiCard label="Total Distance" value={`${fmtNum(totalDistance)} km`} icon={Route} testId="kpi-distance" />
        <KpiCard label="Freight Activity" value={`${fmtNum(totalTkm)} t·km`} icon={Gauge} testId="kpi-freight" />
        <KpiCard label="Logistics CO₂e (in-boundary)" value={`${(logisticsInboundKg / 1000).toFixed(1)} t`} accent icon={Leaf} testId="kpi-logistics-co2e" />
      </div>

      {/* subtabs */}
      <div className="flex items-center gap-1 rounded-lg border border-border bg-white p-1">
        {SUBTABS.map((s) => (
          <button key={s} onClick={() => setSub(s)} data-testid={`logi-subtab-${s}`}
            className={cn('rounded-md px-4 py-1.5 text-sm font-semibold transition-colors',
              sub === s ? 'bg-saurient-green text-white' : 'text-slate-500 hover:text-saurient-navy')}>
            {s}
          </button>
        ))}
        <span className="ml-auto pr-2 text-xs text-muted-foreground">Only logistics inside the PCF boundary contribute to the official PCF.</span>
      </div>

      {/* route viz */}
      <Section title={`${sub} Route`} testId="section-route">
        <div className="flex flex-wrap items-center gap-2 overflow-x-auto thin-scroll">
          {filtered.length === 0 && <span className="text-sm text-muted-foreground">No legs on this segment.</span>}
          {filtered.map((l, i) => (
            <React.Fragment key={l.id}>
              <div className="flex items-center gap-1.5 rounded-md border border-border bg-slate-50 px-3 py-2 text-xs">
                <MapPin className="h-3.5 w-3.5 text-saurient-green" /><span className="font-semibold text-saurient-navy">{l.from}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-muted-foreground">{l.distanceKm} km · {l.mode}</span>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </div>
              {i === filtered.length - 1 && (
                <div className="flex items-center gap-1.5 rounded-md border border-border bg-slate-50 px-3 py-2 text-xs">
                  <MapPin className="h-3.5 w-3.5 text-saurient-navy" /><span className="font-semibold text-saurient-navy">{l.to}</span>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </Section>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => setAddOpen(true)} data-testid="btn-add-leg"><Plus className="mr-1 h-4 w-4" /> Add Transport Leg</Button>
        <Button variant="outline" size="sm" onClick={() => toast.info('Logistics import (simulated).')} data-testid="btn-import-logistics"><Upload className="mr-1 h-4 w-4" /> Import Logistics</Button>
        <Button size="sm" onClick={() => toast.success('Logistics calculated.')} data-testid="btn-calc-logistics" className="bg-saurient-green hover:bg-saurient-greendark"><Calculator className="mr-1 h-4 w-4" /> Calculate Logistics</Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h3 className="text-sm font-bold uppercase tracking-wide text-saurient-navy">{sub} Transport Legs</h3>
          <StatusChip status="LOGISTICS COMPLETE" tone="green" />
        </div>
        <div className="overflow-x-auto thin-scroll">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-slate-50 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                {['From','To','Material','Weight','Distance','Mode','Vehicle/Fuel','Emission Factor','CO₂e','Boundary','Evidence'].map((h) => <th key={h} className="whitespace-nowrap px-3 py-2.5 font-semibold">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr key={l.id} onClick={() => setDetail(l)} className="cursor-pointer border-b border-border last:border-0 hover:bg-saurient-greenlight/30" data-testid={`logi-row-${l.id}`}>
                  <td className="whitespace-nowrap px-3 py-2.5 font-semibold text-saurient-navy">{l.from}</td>
                  <td className="whitespace-nowrap px-3 py-2.5">{l.to}</td>
                  <td className="whitespace-nowrap px-3 py-2.5">{l.material}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 tabular">{l.weightT} t</td>
                  <td className="whitespace-nowrap px-3 py-2.5 tabular">{fmtNum(l.distanceKm)} km</td>
                  <td className="whitespace-nowrap px-3 py-2.5">{l.mode}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-xs">{l.vehicle}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-xs tabular">{l.ef}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 tabular font-semibold">{fmtNum(l.co2e)}</td>
                  <td className="whitespace-nowrap px-3 py-2.5"><StatusChip status={l.boundary} /></td>
                  <td className="whitespace-nowrap px-3 py-2.5">{l.evidence ? <FileText className="h-4 w-4 text-saurient-green" /> : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transport detail dialog */}
      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-lg" data-testid="logi-detail-dialog">
          {detail && (
            <>
              <DialogHeader><DialogTitle>{detail.from} → {detail.to}</DialogTitle></DialogHeader>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                {[
                  ['Origin', detail.from], ['Destination', detail.to], ['Distance', `${detail.distanceKm} km`],
                  ['Distance Source', detail.distanceSource], ['Mode', detail.mode], ['Vehicle Type', detail.vehicle],
                  ['Fuel', detail.fuel], ['Mass Transported', `${detail.weightT} t`], ['Load Factor', detail.loadFactor],
                  ['Return Trip', detail.returnTrip], ['Temperature Controlled', detail.tempControlled], ['Carrier', detail.carrier],
                  ['Calculation Basis', detail.basis], ['Emission Factor', detail.ef],
                ].map(([k, v]) => (
                  <div key={k} className="border-b border-border py-1.5"><div className="text-[11px] uppercase text-muted-foreground">{k}</div><div className="font-semibold text-saurient-navy">{v}</div></div>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-slate-50 p-3 text-sm">
                <code className="rounded bg-white px-2 py-1 tabular">{fmtNum(detail.tonneKm)} t·km</code>
                <span className="text-slate-400">×</span>
                <code className="rounded bg-white px-2 py-1 tabular">{detail.ef}</code>
                <span className="text-slate-400">=</span>
                <code className="rounded bg-saurient-navy px-2 py-1 font-bold text-white tabular">{fmtNum(detail.co2e)} kgCO₂e</code>
              </div>
              <p className="text-xs text-muted-foreground">Basis varies by leg — fuel-based, vehicle-km or tonne-km — not a single formula.</p>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add leg dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent data-testid="add-leg-dialog">
          <DialogHeader><DialogTitle>Add Transport Leg</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label>From</Label><Input value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })} data-testid="leg-from" /></div>
            <div className="space-y-1.5"><Label>To</Label><Input value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} data-testid="leg-to" /></div>
            <div className="space-y-1.5"><Label>Segment</Label>
              <Select value={form.boundary} onValueChange={(v) => setForm({ ...form, boundary: v })}>
                <SelectTrigger data-testid="leg-segment"><SelectValue /></SelectTrigger>
                <SelectContent>{SUBTABS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Mode</Label>
              <Select value={form.mode} onValueChange={(v) => setForm({ ...form, mode: v })}>
                <SelectTrigger data-testid="leg-mode"><SelectValue /></SelectTrigger>
                <SelectContent>{['Truck','Rail','Ship','Air'].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Weight (t)</Label><Input value={form.weightT} onChange={(e) => setForm({ ...form, weightT: e.target.value })} type="number" data-testid="leg-weight" /></div>
            <div className="space-y-1.5"><Label>Distance (km)</Label><Input value={form.distanceKm} onChange={(e) => setForm({ ...form, distanceKm: e.target.value })} type="number" data-testid="leg-distance" /></div>
            <div className="space-y-1.5"><Label>Basis</Label>
              <Select value={form.basis} onValueChange={(v) => setForm({ ...form, basis: v })}>
                <SelectTrigger data-testid="leg-basis"><SelectValue /></SelectTrigger>
                <SelectContent>{['Tonne-km','Vehicle-km','Fuel Based'].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>CO₂e (kg)</Label><Input value={form.co2e} onChange={(e) => setForm({ ...form, co2e: e.target.value })} type="number" data-testid="leg-co2e" /></div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={submitAdd} data-testid="leg-submit" className="bg-saurient-green hover:bg-saurient-greendark">Add Leg</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
