import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const STEPS = [
  'Organisation', 'Facility', 'Product', 'Batch', 'Reporting Period',
  'PCF Methodology', 'Declared / Functional Unit', 'Boundary', 'Review', 'Create',
];

const DEFAULTS = {
  organisation: 'Asante Cocoa Cooperative',
  facility: 'Tema Processing Plant',
  product: 'Refined Cocoa Butter',
  batch: 'CB-2026-001',
  period: 'FY 2026',
  methodology: 'GHG Protocol Product Standard (ISO 14067)',
  unit: '1 kg Refined Cocoa Butter',
  boundary: 'Cradle-to-Gate',
};

export function CreateProjectWizard({ open, onOpenChange }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(DEFAULTS);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const close = () => { onOpenChange(false); setTimeout(() => setStep(0), 200); };
  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));
  const create = () => {
    toast.success('PCF project created (simulated). Opening PCF-GH-2026-001.');
    close();
  };

  const Sel = ({ k, options }) => (
    <Select value={form[k]} onValueChange={(v) => set(k, v)}>
      <SelectTrigger data-testid={`wizard-select-${k}`}><SelectValue /></SelectTrigger>
      <SelectContent>{options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
    </Select>
  );

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(o) : close())}>
      <DialogContent className="max-w-2xl" data-testid="create-project-wizard">
        <DialogHeader>
          <DialogTitle>Create PCF Project</DialogTitle>
        </DialogHeader>

        {/* step rail */}
        <div className="flex flex-wrap gap-1.5">
          {STEPS.map((s, i) => (
            <div key={s} className={cn(
              'flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold',
              i === step ? 'border-saurient-green bg-saurient-greenlight text-saurient-greendark'
                : i < step ? 'border-saurient-green/30 text-saurient-green' : 'border-border text-slate-400'
            )}>
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px]">
                {i < step ? <Check className="h-3 w-3 text-saurient-green" /> : i + 1}
              </span>
              {s}
            </div>
          ))}
        </div>

        <div className="min-h-[180px] py-2">
          {step === 0 && <Field label="Select Organisation"><Sel k="organisation" options={['Asante Cocoa Cooperative', 'Kumasi Growers Union', 'Volta Cocoa Ltd']} /></Field>}
          {step === 1 && <Field label="Select Facility"><Sel k="facility" options={['Tema Processing Plant', 'Kumasi Facility']} /></Field>}
          {step === 2 && <Field label="Select Product"><Sel k="product" options={['Refined Cocoa Butter', 'Natural Cocoa Powder', 'Cocoa Liquor']} /></Field>}
          {step === 3 && <Field label="Select Batch"><Sel k="batch" options={['CB-2026-001', 'CB-2026-002', 'CB-2026-003']} /></Field>}
          {step === 4 && <Field label="Select Reporting Period"><Sel k="period" options={['FY 2026', 'FY 2025']} /></Field>}
          {step === 5 && <Field label="Select PCF Methodology"><Sel k="methodology" options={['GHG Protocol Product Standard (ISO 14067)', 'PAS 2050', 'PEF (Product Environmental Footprint)']} /></Field>}
          {step === 6 && (
            <div className="space-y-3">
              <Field label="Declared / Functional Unit"><Input value={form.unit} onChange={(e) => set('unit', e.target.value)} data-testid="wizard-unit-input" /></Field>
              <p className="text-xs text-muted-foreground">Batch production: 100,000 kg · Packaging unit: 25 kg carton</p>
            </div>
          )}
          {step === 7 && <Field label="Choose Boundary"><Sel k="boundary" options={['Cradle-to-Gate', 'Gate-to-Gate', 'Cradle-to-Grave', 'Custom']} /></Field>}
          {step === 8 && (
            <div className="rounded-lg border border-border bg-slate-50 p-4">
              <h4 className="mb-2 text-sm font-bold text-saurient-navy">Review</h4>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                {Object.entries({
                  Organisation: form.organisation, Facility: form.facility, Product: form.product,
                  Batch: form.batch, Period: form.period, Methodology: form.methodology,
                  'Declared Unit': form.unit, Boundary: form.boundary,
                }).map(([k, v]) => (
                  <div key={k}><dt className="text-[11px] uppercase text-muted-foreground">{k}</dt><dd className="font-semibold text-saurient-navy">{v}</dd></div>
                ))}
              </dl>
            </div>
          )}
          {step === 9 && (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-saurient-greenlight">
                <Check className="h-6 w-6 text-saurient-green" />
              </div>
              <p className="text-sm font-semibold text-saurient-navy">Ready to create</p>
              <p className="mt-1 text-xs text-muted-foreground">A new PCF project will be initialised for {form.product} · {form.batch}.</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <Button variant="ghost" onClick={close} data-testid="wizard-cancel">Cancel</Button>
          <div className="flex gap-2">
            {step > 0 && <Button variant="outline" onClick={back} data-testid="wizard-back">Back</Button>}
            {step < STEPS.length - 1
              ? <Button onClick={next} data-testid="wizard-next" className="bg-saurient-green hover:bg-saurient-greendark">Continue</Button>
              : <Button onClick={create} data-testid="wizard-create" className="bg-saurient-green hover:bg-saurient-greendark">Create Project</Button>}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
