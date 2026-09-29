import React, { useEffect, useState } from 'react';
import { usePcf } from '@/store/PcfContext';
import { KpiCard } from '@/components/common/KpiCard';
import { Section } from '@/components/common/Section';
import { StatusChip } from '@/components/common/StatusChip';
import { DataQualityPanel } from '@/components/common/DataQualityPanel';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid,
} from 'recharts';
import { fmtNum } from '@/lib/format';
import { CHART_COLORS, SCOPE_COLORS, EMISSION_FACTORS } from '@/store/pcfData';
import { cn } from '@/lib/utils';
import { ChevronRight, ChevronDown, Leaf, Factory, Gauge, GitBranch, AlertTriangle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export function CalculationTab({ registerPrimary }) {
  const {
    activities, legs, categoryTotals, scopeTotals, officialVersion, officialTotalKg, officialIntensity,
    liveTotalKg, liveIntensity, productionKg, recalcRequired, recalculate, versions,
  } = usePcf();

  const [expanded, setExpanded] = useState({ 'Raw Materials': true });
  const [drill, setDrill] = useState(null);
  const [dqOpen, setDqOpen] = useState(false);

  useEffect(() => {
    registerPrimary(() => {
      const v = recalculate();
      toast.success(`Recalculated — created ${v.version} (${(v.totalKg / 1000).toFixed(1)} tCO₂e).`);
    });
  }, [registerPrimary, recalculate]);

  const catByName = (name) => {
    if (name === 'Logistics') return legs.filter((l) => l.boundary === 'In').map((l) => ({ label: `${l.from} → ${l.to}`, qty: `${l.tonneKm} t·km`, ef: l.ef, co2e: l.co2e, ref: l }));
    return activities.filter((a) => a.category === name).map((a) => ({ label: a.activity, qty: `${fmtNum(a.quantity)} ${a.unit}`, ef: a.ef, co2e: a.co2e, ref: a }));
  };

  const categories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

  const scopeData = Object.entries(scopeTotals).map(([k, v]) => ({ name: k, value: v }));
  const barData = categories.map(([name, kg]) => ({ name, tCO2e: +(kg / 1000).toFixed(1) }));

  return (
    <div className="space-y-6">
      {recalcRequired && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3" data-testid="recalc-banner">
          <AlertTriangle className="h-5 w-5 text-saurient-red" />
          <div>
            <StatusChip status="CHANGE DETECTED" tone="amber" /> <StatusChip status="RECALCULATION REQUIRED" tone="red" />
            <p className="mt-1 text-sm text-slate-600">Live inventory total is <b className="tabular">{(liveTotalKg / 1000).toFixed(1)} t</b> vs official <b className="tabular">{(officialTotalKg / 1000).toFixed(1)} t</b>. Recalculate to create a new version.</p>
          </div>
          <Button size="sm" onClick={() => { const v = recalculate(); toast.success(`Created ${v.version}.`); }} className="ml-auto bg-saurient-green hover:bg-saurient-greendark" data-testid="btn-recalc-inline">Recalculate PCF</Button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <KpiCard label="Total Footprint" value={`${(officialTotalKg / 1000).toFixed(1)} t`} sub="tCO₂e" accent icon={Leaf} testId="kpi-total-footprint" />
        <KpiCard label="Production" value={`${fmtNum(productionKg)} kg`} icon={Factory} testId="kpi-production" />
        <KpiCard label="PCF Intensity" value={`${officialIntensity}`} sub="kgCO₂e/kg (auto-derived)" icon={Gauge} testId="kpi-intensity" />
        <KpiCard label="Data Quality" value="92/100" onClick={() => setDqOpen(true)} icon={Gauge} testId="kpi-calc-dq" />
        <KpiCard label="Calculation Version" value={officialVersion.version} sub={`${versions.length} version(s)`} icon={GitBranch} testId="kpi-version" />
      </div>

      {/* Calculation tree */}
      <Section title="Calculation Tree" testId="section-calc-tree"
        right={<span className="text-sm font-bold tabular text-saurient-navy">PCF TOTAL · {(officialTotalKg / 1000).toFixed(1)} tCO₂e</span>}>
        <div className="divide-y divide-border">
          {categories.map(([name, kg]) => {
            const open = expanded[name];
            const leaves = catByName(name);
            return (
              <div key={name}>
                <button onClick={() => setExpanded((e) => ({ ...e, [name]: !e[name] }))} data-testid={`tree-node-${name}`} className="flex w-full items-center gap-2 py-2.5 text-left hover:bg-slate-50">
                  {open ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
                  <span className="flex-1 font-semibold text-saurient-navy">{name}</span>
                  <span className="w-32 text-right tabular text-slate-500">{fmtNum(kg)} kg</span>
                  <span className="w-24 text-right tabular font-bold text-saurient-navy">{(kg / 1000).toFixed(1)} t</span>
                  <span className="w-16 text-right tabular text-xs text-muted-foreground">{((kg / officialTotalKg) * 100).toFixed(0)}%</span>
                </button>
                {open && (
                  <div className="ml-6 border-l border-border pl-4">
                    {leaves.map((lf, i) => (
                      <button key={i} onClick={() => setDrill(lf)} data-testid={`tree-leaf-${name}-${i}`} className="flex w-full items-center gap-2 py-2 text-left text-sm hover:bg-saurient-greenlight/30">
                        <span className="flex-1">{lf.label}</span>
                        <code className="hidden rounded bg-slate-100 px-1.5 py-0.5 text-[11px] tabular sm:inline">{lf.qty} × {lf.ef}</code>
                        <span className="w-24 text-right tabular font-semibold text-saurient-navy">{fmtNum(lf.co2e)} kg</span>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
                      </button>
                    ))}
                    {leaves.length === 0 && <p className="py-2 text-sm text-muted-foreground">No lines.</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Section>

      {/* Result breakdown */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Section title="Emissions by Scope" testId="section-scope-chart">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={scopeData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                {scopeData.map((d) => <Cell key={d.name} fill={SCOPE_COLORS[d.name]} />)}
              </Pie>
              <Tooltip formatter={(v) => `${fmtNum(v)} kg`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-1 text-sm">
            {scopeData.map((d) => (
              <div key={d.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: SCOPE_COLORS[d.name] }} />{d.name}</span>
                <span className="tabular font-semibold">{(d.value / 1000).toFixed(1)} t · {((d.value / officialTotalKg) * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Emissions by Category" className="lg:col-span-2" testId="section-category-chart">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData} layout="vertical" margin={{ left: 30 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => `${v} t`} />
              <Bar dataKey="tCO2e" radius={[0, 4, 4, 0]}>
                {barData.map((d, i) => <Cell key={d.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Section>
      </div>

      {/* Calc info */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Calculation Information" testId="section-calc-info">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {[
              ['Methodology', 'GHG Protocol / ISO 14067'], ['GWP Version', 'IPCC AR6 (GWP100)'],
              ['Emission Factor Dataset', 'ecoinvent v3.10'], ['Dataset Version', 'v3.10'],
              ['Calculation Engine', 'Saurient CalcEngine 4.2'], ['Last Calculated', officialVersion.calculatedAt],
              ['Calculated By', officialVersion.calculatedBy], ['PCF Intensity', `${liveTotalKg === officialTotalKg ? officialIntensity : liveIntensity} kgCO₂e/kg`],
            ].map(([k, v]) => (
              <div key={k} className="border-b border-border py-1.5"><dt className="text-[11px] uppercase text-muted-foreground">{k}</dt><dd className="font-semibold text-saurient-navy">{v}</dd></div>
            ))}
          </dl>
          <p className="mt-3 rounded-md bg-slate-50 px-3 py-2 text-xs text-muted-foreground">
            Intensity is auto-derived: {fmtNum(officialTotalKg)} kgCO₂e ÷ {fmtNum(productionKg)} kg = <b className="text-saurient-navy">{officialIntensity} kgCO₂e/kg</b>. Never hard-coded.
          </p>
        </Section>

        <Section title="Version History" testId="section-versions">
          <div className="space-y-2">
            {versions.map((v, i) => (
              <div key={v.version} className={cn('flex items-center justify-between rounded-md border px-3 py-2 text-sm', i === versions.length - 1 ? 'border-saurient-green/40 bg-saurient-greenlight/40' : 'border-border')}>
                <div>
                  <span className="font-bold text-saurient-navy">{v.version}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{v.note}</span>
                </div>
                <div className="text-right">
                  <div className="tabular font-semibold">{(v.totalKg / 1000).toFixed(1)} t</div>
                  <div className="text-[11px] text-muted-foreground">{v.calculatedAt}</div>
                </div>
              </div>
            ))}
            <p className="text-xs text-muted-foreground">Historical calculations are never overwritten — each recalculation creates a new version.</p>
          </div>
        </Section>
      </div>

      <div className="flex items-center justify-end gap-3">
        <StatusChip status={recalcRequired ? 'RECALCULATION REQUIRED' : 'CALCULATION COMPLETE'} tone={recalcRequired ? 'red' : 'green'} />
        <Button onClick={() => { const v = recalculate(); toast.success(`Recalculated — ${v.version}.`); }} data-testid="btn-recalculate" className="bg-saurient-green hover:bg-saurient-greendark">Recalculate PCF</Button>
      </div>

      {/* drill dialog */}
      <Dialog open={!!drill} onOpenChange={(o) => !o && setDrill(null)}>
        <DialogContent data-testid="calc-drill-dialog">
          {drill && (
            <>
              <DialogHeader><DialogTitle>Traceability · {drill.label}</DialogTitle></DialogHeader>
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-slate-50 p-3 text-sm">
                <code className="rounded bg-white px-2 py-1 tabular">{drill.qty}</code>
                <span className="text-slate-400">×</span>
                <code className="rounded bg-white px-2 py-1 tabular">{drill.ef}</code>
                <span className="text-slate-400">=</span>
                <code className="rounded bg-saurient-navy px-2 py-1 font-bold text-white tabular">{fmtNum(drill.co2e)} kgCO₂e</code>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {['Calculated Result', 'Formula', 'Emission Factor', 'Activity Record', 'Data Source', 'Evidence'].map((p, i, arr) => (
                  <React.Fragment key={p}>
                    <span className="rounded-md border border-border bg-white px-2.5 py-1 text-xs font-semibold text-saurient-navy">{p}</span>
                    {i < arr.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-slate-400" />}
                  </React.Fragment>
                ))}
              </div>
              {drill.ref && drill.ref.id && (
                <p className="text-xs text-muted-foreground">Source record: <b className="text-saurient-navy">{drill.ref.id}</b> · {drill.ref.sourceSystem || drill.ref.carrier} · evidence {drill.ref.evidence ? 'attached' : 'missing'}</p>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      <DataQualityPanel open={dqOpen} onOpenChange={setDqOpen} />

      {/* emission factor register reference */}
      <Section title="Emission Factors Applied" testId="section-ef-register">
        <div className="overflow-x-auto thin-scroll">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-slate-50 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              {['Factor','Value','Source','Version','Scope'].map((h) => <th key={h} className="px-4 py-2.5 font-semibold">{h}</th>)}
            </tr></thead>
            <tbody>
              {EMISSION_FACTORS.map((f) => (
                <tr key={f.name} className="border-b border-border last:border-0">
                  <td className="px-4 py-2 font-semibold text-saurient-navy">{f.name}</td>
                  <td className="px-4 py-2 tabular">{f.value}</td>
                  <td className="px-4 py-2">{f.source}</td>
                  <td className="px-4 py-2">{f.version}</td>
                  <td className="px-4 py-2"><StatusChip status={f.scope} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}
