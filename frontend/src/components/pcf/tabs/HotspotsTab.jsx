import React, { useEffect, useState } from 'react';
import { usePcf } from '@/store/PcfContext';
import { KpiCard } from '@/components/common/KpiCard';
import { Section } from '@/components/common/Section';
import { StatusChip } from '@/components/common/StatusChip';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
  PieChart, Pie,
} from 'recharts';
import { fmtNum } from '@/lib/format';
import { CHART_COLORS, SCOPE_COLORS, PROCESS_EMISSIONS } from '@/store/pcfData';
import { TrendingUp, Layers, Cog, Lightbulb, ArrowDownRight, ArrowUpRight, Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';

const SCENARIO_PRESETS = [
  { id: 'renew', label: 'Grid Electricity → Renewable Electricity', target: 'Energy', reduction: 0.75 },
  { id: 'fuel', label: 'Diesel → Lower Carbon Fuel', target: 'Fuel', reduction: 0.30 },
  { id: 'supplier', label: 'Supplier A → Supplier B', target: 'Raw Materials', reduction: 0.12 },
  { id: 'route', label: 'Current Logistics → Optimised Route', target: 'Logistics', reduction: 0.22 },
  { id: 'pack', label: 'Current Packaging → Recycled Packaging', target: 'Packaging', reduction: 0.40 },
];

export function HotspotsTab({ registerPrimary }) {
  const { categoryTotals, scopeTotals, officialTotalKg, productionKg, scenarios, addScenario } = usePcf();
  const [scOpen, setScOpen] = useState(false);
  const [preset, setPreset] = useState(SCENARIO_PRESETS[0].id);
  const [intensityCut, setIntensityCut] = useState([75]);

  useEffect(() => { registerPrimary(() => setScOpen(true)); }, [registerPrimary]);

  const cats = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  const largest = cats[0];
  const largestScope = Object.entries(scopeTotals).sort((a, b) => b[1] - a[1])[0];
  const largestProcess = [...PROCESS_EMISSIONS].sort((a, b) => b.kg - a.kg)[0];

  const stageData = cats.map(([name, kg]) => ({ name, tCO2e: +(kg / 1000).toFixed(1) }));
  const scopeData = Object.entries(scopeTotals).map(([k, v]) => ({ name: k, value: v }));

  const hotspotRows = cats.map(([name, kg]) => ({
    source: name, kg, pct: (kg / officialTotalKg) * 100,
    dq: name === 'Raw Materials' ? 88 : name === 'Waste' ? 84 : 92,
    trend: name === 'Raw Materials' ? 'up' : name === 'Energy' ? 'down' : 'flat',
    opportunity: SCENARIO_PRESETS.find((s) => s.target === name)?.label.split(' → ')[1] || '—',
  }));

  const createScenario = () => {
    const p = SCENARIO_PRESETS.find((s) => s.id === preset);
    const targetKg = categoryTotals[p.target] || 0;
    const cut = (intensityCut[0] / 100) * p.reduction; // apply slider to preset max
    const savedKg = Math.round(targetKg * (intensityCut[0] / 100));
    const scenarioTotal = officialTotalKg - savedKg;
    addScenario({
      id: `SCN-${scenarios.length + 1}`, label: p.label,
      baselineKg: officialTotalKg, scenarioKg: scenarioTotal,
      reductionPct: ((savedKg / officialTotalKg) * 100).toFixed(1),
    });
    setScOpen(false);
    toast.success('Reduction scenario created (simulation only).');
  };

  const TrendIcon = ({ t }) => t === 'up' ? <ArrowUpRight className="h-4 w-4 text-saurient-red" /> : t === 'down' ? <ArrowDownRight className="h-4 w-4 text-saurient-green" /> : <Minus className="h-4 w-4 text-slate-400" />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard label="Largest Source" value={largest[0]} sub={`${(largest[1] / 1000).toFixed(1)} t`} accent icon={TrendingUp} testId="kpi-largest-source" />
        <KpiCard label="Largest Scope" value={largestScope[0]} sub={`${(largestScope[1] / 1000).toFixed(1)} t`} icon={Layers} testId="kpi-largest-scope" />
        <KpiCard label="Largest Process" value={largestProcess.process} sub={`${(largestProcess.kg / 1000).toFixed(1)} t`} icon={Cog} testId="kpi-largest-process" />
        <KpiCard label="Reduction Opportunities" value={5} icon={Lightbulb} testId="kpi-opportunities" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Section title="Emissions by Lifecycle Stage" className="lg:col-span-2" testId="section-stage">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stageData} margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => `${v} t`} />
              <Bar dataKey="tCO2e" radius={[4, 4, 0, 0]}>
                {stageData.map((d, i) => <Cell key={d.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Section>

        <Section title="Emissions by Scope" testId="section-scope-hs">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={scopeData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
                {scopeData.map((d) => <Cell key={d.name} fill={SCOPE_COLORS[d.name]} />)}
              </Pie>
              <Tooltip formatter={(v) => `${fmtNum(v)} kg`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1 text-sm">
            {scopeData.map((d) => (
              <div key={d.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: SCOPE_COLORS[d.name] }} />{d.name}</span>
                <span className="tabular font-semibold">{((d.value / officialTotalKg) * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <Section title="Emissions by Process" testId="section-process">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={PROCESS_EMISSIONS.map((p) => ({ name: p.process, tCO2e: +(p.kg / 1000).toFixed(1) }))}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v) => `${v} t`} />
            <Bar dataKey="tCO2e" fill="#15304d" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Section>

      <Section title="Hotspot Register" testId="section-hotspot-table">
        <div className="overflow-x-auto thin-scroll">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-slate-50 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              {['Source','tCO₂e','% of PCF','Data Quality','Trend','Opportunity','Action'].map((h) => <th key={h} className="px-4 py-2.5 font-semibold">{h}</th>)}
            </tr></thead>
            <tbody>
              {hotspotRows.map((r) => (
                <tr key={r.source} className="border-b border-border last:border-0 hover:bg-slate-50" data-testid={`hotspot-row-${r.source}`}>
                  <td className="px-4 py-2.5 font-semibold text-saurient-navy">{r.source}</td>
                  <td className="px-4 py-2.5 tabular font-semibold">{(r.kg / 1000).toFixed(1)}</td>
                  <td className="px-4 py-2.5 tabular">{r.pct.toFixed(1)}%</td>
                  <td className="px-4 py-2.5 tabular">{r.dq}/100</td>
                  <td className="px-4 py-2.5"><TrendIcon t={r.trend} /></td>
                  <td className="px-4 py-2.5 text-xs">{r.opportunity}</td>
                  <td className="px-4 py-2.5">
                    <Button variant="outline" size="sm" className="h-7" onClick={() => setScOpen(true)} data-testid={`hotspot-action-${r.source}`}>Model</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Scenario analysis */}
      <Section title="Scenario Analysis" testId="section-scenarios"
        right={
          <div className="flex items-center gap-2">
            <StatusChip status="SIMULATION ONLY" tone="amber" />
            <StatusChip status="NOT VERIFIED" tone="slate" />
            <Button size="sm" onClick={() => setScOpen(true)} data-testid="btn-create-scenario" className="bg-saurient-green hover:bg-saurient-greendark"><Plus className="mr-1 h-4 w-4" /> Create Reduction Scenario</Button>
          </div>
        }>
        {scenarios.length === 0 ? (
          <p className="text-sm text-muted-foreground">No scenarios yet. Scenario calculations never overwrite the official PCF.</p>
        ) : (
          <div className="space-y-3">
            {scenarios.map((s) => (
              <div key={s.id} className="rounded-lg border border-border p-4" data-testid={`scenario-${s.id}`}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-saurient-navy">{s.label}</span>
                  <StatusChip status="SIMULATION ONLY" tone="amber" />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-4 text-center">
                  <div><div className="text-[11px] uppercase text-muted-foreground">Official Baseline</div><div className="text-lg font-bold tabular text-saurient-navy">{(s.baselineKg / 1000).toFixed(1)} t</div></div>
                  <div><div className="text-[11px] uppercase text-muted-foreground">Scenario PCF</div><div className="text-lg font-bold tabular text-saurient-green">{(s.scenarioKg / 1000).toFixed(1)} t</div></div>
                  <div><div className="text-[11px] uppercase text-muted-foreground">Potential Reduction</div><div className="text-lg font-bold tabular text-saurient-green">-{s.reductionPct}%</div></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Dialog open={scOpen} onOpenChange={setScOpen}>
        <DialogContent data-testid="scenario-dialog">
          <DialogHeader><DialogTitle>Create Reduction Scenario</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Intervention</Label>
              <Select value={preset} onValueChange={setPreset}>
                <SelectTrigger data-testid="scenario-preset"><SelectValue /></SelectTrigger>
                <SelectContent>{SCENARIO_PRESETS.map((s) => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between"><Label>Reduction applied to target category</Label><span className="tabular font-bold text-saurient-green">{intensityCut[0]}%</span></div>
              <Slider value={intensityCut} onValueChange={setIntensityCut} max={100} step={5} data-testid="scenario-slider" />
            </div>
            <div className="rounded-md border border-amber-200 bg-saurient-amberlight/60 px-3 py-2 text-xs text-saurient-amber">
              Simulation only — will not overwrite the official verified PCF.
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setScOpen(false)}>Cancel</Button>
            <Button onClick={createScenario} data-testid="scenario-submit" className="bg-saurient-green hover:bg-saurient-greendark">Create Scenario</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
