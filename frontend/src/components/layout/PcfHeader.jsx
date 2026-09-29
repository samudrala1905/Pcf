import React, { useState } from 'react';
import { usePcf } from '@/store/PcfContext';
import { StatusChip } from '@/components/common/StatusChip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Download, Search, ChevronRight, Zap } from 'lucide-react';

// primary action label per active tab
export const PRIMARY_ACTIONS = {
  projects: 'Create PCF Project',
  output: 'Save Definition',
  boundary: 'Approve Boundary',
  inventory: 'Add Activity Data',
  allocation: 'Validate Allocation',
  logistics: 'Add Transport Leg',
  calculation: 'Calculate PCF',
  hotspots: 'Create Scenario',
  report: 'Submit for Verification',
};

export function PcfHeader({ activeTab, onPrimary, onDownload, search, setSearch }) {
  const { project, reportStatus, recalcRequired, lockedVersion } = usePcf();

  let statusLabel = 'CALCULATED';
  if (recalcRequired) statusLabel = 'RECALCULATION REQUIRED';
  if (reportStatus === 'SUBMITTED') statusLabel = 'SUBMITTED';
  if (lockedVersion) statusLabel = 'LOCKED';

  return (
    <div className="border-b border-border bg-white">
      <div className="px-8 pt-6">
        {/* breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <span>Carbon Accounting</span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-saurient-navy">Product Carbon Footprint</span>
        </div>

        <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold tracking-tight text-saurient-navy">Product Carbon Footprint</h1>
              <StatusChip status={statusLabel} testId="header-status-chip" />
              <span className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-sky-700">
                <Zap className="h-3 w-3" /> Simulated
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Batch-level lifecycle footprint for {project.product} · {project.batch}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onDownload} data-testid="header-download-btn">
              <Download className="mr-1.5 h-4 w-4" /> Download
            </Button>
            <Button size="sm" onClick={onPrimary} data-testid="header-primary-btn" className="bg-saurient-green hover:bg-saurient-greendark">
              {PRIMARY_ACTIONS[activeTab]}
            </Button>
          </div>
        </div>

        {/* filters */}
        <div className="mt-4 flex flex-wrap items-center gap-3 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Facility</span>
            <Select defaultValue="tema">
              <SelectTrigger className="h-9 w-52" data-testid="filter-facility"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="tema">Tema Processing Plant</SelectItem>
                <SelectItem value="kumasi">Kumasi Facility</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Period</span>
            <Select defaultValue="fy2026">
              <SelectTrigger className="h-9 w-32" data-testid="filter-period"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="fy2026">FY 2026</SelectItem>
                <SelectItem value="fy2025">FY 2025</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="relative ml-auto">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search records…"
              className="h-9 w-64 pl-8"
              data-testid="filter-search"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
