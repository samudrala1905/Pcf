import React, { useEffect, useState } from 'react';
import { usePcf } from '@/store/PcfContext';
import { KpiCard } from '@/components/common/KpiCard';
import { StatusChip } from '@/components/common/StatusChip';
import { CreateProjectWizard } from '@/components/pcf/CreateProjectWizard';
import { DataQualityPanel } from '@/components/common/DataQualityPanel';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { PROJECT_ROWS, PROJECT_KPIS } from '@/store/pcfData';
import { fmtNum } from '@/lib/format';
import { MoreHorizontal, FolderKanban, FileEdit, Calculator, Clock, BadgeCheck } from 'lucide-react';
import { toast } from 'sonner';

export function ProjectsTab({ registerPrimary, search }) {
  const { setActiveTab } = usePcf();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [dqOpen, setDqOpen] = useState(false);

  useEffect(() => { registerPrimary(() => setWizardOpen(true)); }, [registerPrimary]);

  const rows = PROJECT_ROWS.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return [r.id, r.product, r.batch, r.facility, r.status].some((v) => String(v).toLowerCase().includes(q));
  });

  const open = (r) => {
    if (r.primary) { toast.success(`Opened ${r.id}`); setActiveTab('output'); }
    else toast.info(`${r.id} is a demo record — only PCF-GH-2026-001 is fully populated.`);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <KpiCard label="Total PCF Projects" value={PROJECT_KPIS.total} icon={FolderKanban} testId="kpi-total" />
        <KpiCard label="Draft" value={PROJECT_KPIS.draft} icon={FileEdit} testId="kpi-draft" />
        <KpiCard label="Calculation Ready" value={PROJECT_KPIS.calcReady} icon={Calculator} testId="kpi-calcready" />
        <KpiCard label="Awaiting Verification" value={PROJECT_KPIS.awaitingVerification} icon={Clock} testId="kpi-awaiting" />
        <KpiCard label="Verified" value={PROJECT_KPIS.verified} accent icon={BadgeCheck} testId="kpi-verified" />
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h3 className="text-sm font-bold uppercase tracking-wide text-saurient-navy">PCF Projects</h3>
          <Button size="sm" onClick={() => setWizardOpen(true)} data-testid="create-project-btn" className="bg-saurient-green hover:bg-saurient-greendark">
            Create PCF Project
          </Button>
        </div>
        <div className="overflow-x-auto thin-scroll">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-slate-50 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                {['PCF Project ID','Product','Batch','Facility','Production Qty','Boundary','PCF Intensity','Data Quality','Status','Verification','Actions'].map((h) => (
                  <th key={h} className="whitespace-nowrap px-4 py-2.5 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className={`border-b border-border last:border-0 hover:bg-slate-50 ${r.primary ? 'bg-saurient-greenlight/30' : ''}`} data-testid={`project-row-${r.id}`}>
                  <td className="whitespace-nowrap px-4 py-3 font-bold text-saurient-navy">{r.id}</td>
                  <td className="whitespace-nowrap px-4 py-3">{r.product}</td>
                  <td className="whitespace-nowrap px-4 py-3">{r.batch}</td>
                  <td className="whitespace-nowrap px-4 py-3">{r.facility}</td>
                  <td className="whitespace-nowrap px-4 py-3 tabular">{fmtNum(r.productionQuantity)} kg</td>
                  <td className="whitespace-nowrap px-4 py-3">{r.boundary}</td>
                  <td className="whitespace-nowrap px-4 py-3 tabular font-semibold">{r.intensity} kgCO₂e/kg</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <button onClick={() => setDqOpen(true)} className="tabular font-semibold text-saurient-green underline decoration-dotted underline-offset-4" data-testid={`dq-${r.id}`}>{r.dataQuality}/100</button>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3"><StatusChip status={r.status} /></td>
                  <td className="whitespace-nowrap px-4 py-3"><StatusChip status={r.verification} /></td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`actions-${r.id}`}><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => open(r)}>Open</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.success(`Cloned ${r.id}`)}>Clone</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.info(`Archived ${r.id}`)}>Archive</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CreateProjectWizard open={wizardOpen} onOpenChange={setWizardOpen} />
      <DataQualityPanel open={dqOpen} onOpenChange={setDqOpen} />
    </div>
  );
}
