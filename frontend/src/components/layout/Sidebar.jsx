import React from 'react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  LayoutDashboard, Factory, ShieldCheck, IdCard, Database, Settings,
  Leaf, ChevronDown, ChevronRight,
} from 'lucide-react';

const NAV = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  {
    key: 'carbon', label: 'Carbon Accounting', icon: Factory, expandable: true,
    children: [
      { key: 'pcf', label: 'Product Carbon Footprint', active: true },
      { key: 'org', label: 'Organisation Footprint' },
      { key: 'value', label: 'Value Chain (Scope 3)' },
    ],
  },
  { key: 'mrv', label: 'MRV & Verification', icon: ShieldCheck },
  { key: 'passport', label: 'Carbon Passports', icon: IdCard },
  { key: 'data', label: 'Data Sources', icon: Database },
  { key: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const notAvailable = () => toast.info('This module is outside the current PCF demo scope.');
  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col bg-saurient-navy text-slate-200">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-saurient-green">
          <Leaf className="h-5 w-5 text-white" />
        </div>
        <div className="leading-tight">
          <div className="text-base font-extrabold tracking-tight text-white">Saurient</div>
          <div className="text-[10px] font-medium uppercase tracking-widest text-saurient-green">Carbon Passport</div>
        </div>
      </div>

      <nav className="mt-2 flex-1 space-y-0.5 overflow-y-auto px-3 thin-scroll">
        {NAV.map((item) => {
          const Icon = item.icon;
          if (item.expandable) {
            return (
              <div key={item.key}>
                <div className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-white">
                  <Icon className="h-[18px] w-[18px] text-saurient-green" />
                  <span className="flex-1">{item.label}</span>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </div>
                <div className="ml-4 border-l border-white/10 pl-3">
                  {item.children.map((c) => (
                    <button
                      key={c.key}
                      onClick={c.active ? undefined : notAvailable}
                      data-testid={`nav-${c.key}`}
                      className={cn(
                        'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-[13px] transition-colors',
                        c.active
                          ? 'bg-saurient-green/15 font-semibold text-white'
                          : 'text-slate-400 hover:bg-white/5 hover:text-white'
                      )}
                    >
                      {c.active && <span className="h-1.5 w-1.5 rounded-full bg-saurient-green" />}
                      <span className={cn(!c.active && 'pl-3.5')}>{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          }
          return (
            <button
              key={item.key}
              onClick={notAvailable}
              data-testid={`nav-${item.key}`}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
            >
              <Icon className="h-[18px] w-[18px]" />
              <span className="flex-1">{item.label}</span>
              <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
            </button>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-saurient-navy3 text-xs font-bold text-white">AB</div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-white">A. Boateng</div>
            <div className="text-[11px] text-slate-400">Sustainability Lead</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
