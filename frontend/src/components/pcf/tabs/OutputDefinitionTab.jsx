import React, { useEffect } from 'react';
import { usePcf } from '@/store/PcfContext';
import { Section, Field, ReadValue } from '@/components/common/Section';
import { StatusChip } from '@/components/common/StatusChip';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export function OutputDefinitionTab({ registerPrimary }) {
  const { project, setActiveTab } = usePcf();
  useEffect(() => { registerPrimary(() => toast.success('Output definition saved.')); }, [registerPrimary]);

  const completeness = [
    'Product identity', 'Functional unit', 'Production quantity', 'Assessment period', 'Methodology',
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="1 · Product Identity" testId="section-product-identity">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Product Name"><ReadValue value={project.product} /></Field>
            <Field label="Product Code"><ReadValue value={project.productCode} /></Field>
            <Field label="Batch"><ReadValue value={project.batch} /></Field>
            <Field label="Product Category"><ReadValue value={project.productCategory} /></Field>
            <Field label="Facility"><ReadValue value={project.facility} /></Field>
            <Field label="Country"><ReadValue value={project.country} /></Field>
            <Field label="Production Date"><ReadValue value={project.productionDate} /></Field>
            <Field label="Destination Market"><ReadValue value={project.destinationMarket} /></Field>
            <Field label="CN / HS Commodity Code"><Input defaultValue={project.hsCode} data-testid="input-hscode" /></Field>
            <Field label="Customer (optional)"><Input defaultValue="" placeholder="—" data-testid="input-customer" /></Field>
          </div>
        </Section>

        <Section title="2 · Declared / Functional Unit" testId="section-functional-unit">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Declared Unit"><Input defaultValue="1 kg" data-testid="input-declared-qty" /></Field>
            <Field label="Unit Basis">
              <Select defaultValue="kg">
                <SelectTrigger data-testid="select-unit-basis"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">kg Refined Cocoa Butter</SelectItem>
                  <SelectItem value="t">tonne Refined Cocoa Butter</SelectItem>
                  <SelectItem value="carton">25 kg carton</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Batch Production"><ReadValue value="100,000 kg" /></Field>
            <Field label="Packaging Unit"><ReadValue value={project.packagingUnit} /></Field>
            <Field label="Product Grade"><ReadValue value={project.productGrade} /></Field>
          </div>
          <div className="mt-4 rounded-md border border-saurient-green/30 bg-saurient-greenlight/40 px-3 py-2 text-sm">
            <span className="font-semibold text-saurient-greendark">Declared unit:</span> {project.declaredUnit}
          </div>
        </Section>

        <Section title="3 · Assessment Methodology" testId="section-methodology">
          <div className="grid grid-cols-2 gap-4">
            <Field label="PCF Methodology">
              <Select defaultValue="iso14067">
                <SelectTrigger data-testid="select-methodology"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="iso14067">GHG Protocol / ISO 14067</SelectItem>
                  <SelectItem value="pas2050">PAS 2050</SelectItem>
                  <SelectItem value="pef">PEF</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="GWP Basis">
              <Select defaultValue="ar6">
                <SelectTrigger data-testid="select-gwp"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ar6">IPCC AR6 (GWP100)</SelectItem>
                  <SelectItem value="ar5">IPCC AR5 (GWP100)</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Emission Factor Dataset"><ReadValue value={project.efDataset} /></Field>
            <Field label="Dataset Version"><ReadValue value={project.datasetVersion} /></Field>
            <Field label="Calculation Engine Version"><ReadValue value={project.engineVersion} /></Field>
          </div>
        </Section>

        <Section title="4 · Assessment Period" testId="section-period">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Production Start Date"><Input type="date" defaultValue="2026-03-01" data-testid="input-prod-start" /></Field>
            <Field label="Production End Date"><Input type="date" defaultValue="2026-03-20" data-testid="input-prod-end" /></Field>
            <Field label="Data Collection Start"><Input type="date" defaultValue="2026-03-01" data-testid="input-data-start" /></Field>
            <Field label="Data Collection End"><Input type="date" defaultValue="2026-03-31" data-testid="input-data-end" /></Field>
          </div>
        </Section>
      </div>

      <Section title="5 · Completeness Check" testId="section-completeness"
        right={<StatusChip status="OUTPUT DEFINITION COMPLETE" tone="green" />}>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {completeness.map((c) => (
            <div key={c} className="flex items-center gap-2 rounded-md border border-border bg-slate-50 px-3 py-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-saurient-green" /> {c}
            </div>
          ))}
        </div>
      </Section>

      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" onClick={() => toast.info('Draft saved.')} data-testid="btn-save-draft">Save Draft</Button>
        <Button variant="outline" onClick={() => toast.success('Definition saved.')} data-testid="btn-save-definition">Save Definition</Button>
        <Button onClick={() => setActiveTab('boundary')} data-testid="btn-continue-boundary" className="bg-saurient-green hover:bg-saurient-greendark">Continue to Boundary</Button>
      </div>
    </div>
  );
}
