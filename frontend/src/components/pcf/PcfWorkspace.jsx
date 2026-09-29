import React, { useState, useCallback, useRef } from 'react';
import { usePcf } from '@/store/PcfContext';
import { PcfHeader } from '@/components/layout/PcfHeader';
import { ReadinessTracker } from '@/components/layout/ReadinessTracker';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import { ProjectsTab } from './tabs/ProjectsTab';
import { OutputDefinitionTab } from './tabs/OutputDefinitionTab';
import { BoundaryTab } from './tabs/BoundaryTab';
import { InventoryTab } from './tabs/InventoryTab';
import { AllocationTab } from './tabs/AllocationTab';
import { LogisticsTab } from './tabs/LogisticsTab';
import { CalculationTab } from './tabs/CalculationTab';
import { HotspotsTab } from './tabs/HotspotsTab';
import { ReportTab } from './tabs/ReportTab';

const TABS = [
  { key: 'projects', label: 'Projects', Comp: ProjectsTab },
  { key: 'output', label: 'Output Definition', Comp: OutputDefinitionTab },
  { key: 'boundary', label: 'Boundary', Comp: BoundaryTab },
  { key: 'inventory', label: 'Inventory', Comp: InventoryTab },
  { key: 'allocation', label: 'Allocation', Comp: AllocationTab },
  { key: 'logistics', label: 'Logistics', Comp: LogisticsTab },
  { key: 'calculation', label: 'Calculation', Comp: CalculationTab },
  { key: 'hotspots', label: 'Hotspots', Comp: HotspotsTab },
  { key: 'report', label: 'Report', Comp: ReportTab },
];

export function PcfWorkspace() {
  const { activeTab, setActiveTab } = usePcf();
  const [search, setSearch] = useState('');
  const primaryRef = useRef(() => toast.info('No action bound for this stage.'));

  const registerPrimary = useCallback((fn) => { primaryRef.current = fn; }, []);
  const handlePrimary = () => primaryRef.current && primaryRef.current();
  const handleDownload = () => toast.success('Preparing export for PCF-GH-2026-001…');

  const Active = TABS.find((t) => t.key === activeTab)?.Comp || ProjectsTab;

  return (
    <div className="flex min-h-screen flex-col">
      <PcfHeader
        activeTab={activeTab}
        onPrimary={handlePrimary}
        onDownload={handleDownload}
        search={search}
        setSearch={setSearch}
      />

      {/* tracker */}
      <div className="bg-white px-8 pb-4">
        <ReadinessTracker />
      </div>

      {/* tab bar */}
      <div className="sticky top-0 z-10 border-b border-border bg-white px-8">
        <div className="flex gap-1 overflow-x-auto thin-scroll">
          {TABS.map((t, i) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              data-testid={`tab-${t.key}`}
              className={cn(
                'relative whitespace-nowrap px-3.5 py-3 text-sm font-semibold transition-colors',
                activeTab === t.key ? 'text-saurient-green' : 'text-slate-500 hover:text-saurient-navy'
              )}
            >
              <span className="mr-1.5 text-[11px] text-slate-400">{i + 1}</span>
              {t.label}
              {activeTab === t.key && (
                <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-saurient-green" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* content */}
      <div className="flex-1 px-8 py-6">
        <Active registerPrimary={registerPrimary} search={search} />
      </div>
    </div>
  );
}
