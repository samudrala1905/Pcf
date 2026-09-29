import React, { useEffect, useState } from 'react';
import { usePcf } from '@/store/PcfContext';
import { Section } from '@/components/common/Section';
import { StatusChip } from '@/components/common/StatusChip';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { READINESS_CHECKS } from '@/store/pcfData';
import { fmtNum } from '@/lib/format';
import {
  CheckCircle2, XCircle, FileDown, Database, FileText, ShieldCheck, Lock, ArrowRight, QrCode,
} from 'lucide-react';
import { toast } from 'sonner';

const SECTIONS = [
  'Organisation', 'Facility', 'Product', 'Batch', 'Declared / Functional Unit', 'Assessment Period',
  'System Boundary', 'Methodology', 'Inventory Summary', 'Allocation Methodology', 'Logistics Methodology',
  'Emission Factors', 'Total PCF', 'PCF Intensity', 'Scope Breakdown', 'Lifecycle Breakdown',
  'Data Quality', 'Exclusions', 'Assumptions', 'Limitations / Uncertainty', 'Calculation Version',
  'Evidence Register', 'Approval History', 'Verification Status',
];

export function ReportTab({ registerPrimary }) {
  const {
    project, officialTotalKg, officialIntensity, officialVersion, reportStatus,
    lockedVersion, submitForVerification, recalcRequired,
  } = usePcf();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [mrv, setMrv] = useState(null);

  const allReady = READINESS_CHECKS.every((c) => c.ok) && !recalcRequired;

  useEffect(() => {
    registerPrimary(() => {
      if (reportStatus === 'SUBMITTED') { toast.info('Already submitted and locked.'); return; }
      if (!allReady) { toast.error('Verification not ready — resolve outstanding checks.'); return; }
      setConfirmOpen(true);
    });
  }, [registerPrimary, reportStatus, allReady]);

  const doSubmit = () => {
    submitForVerification();
    const req = {
      requestId: `VR-GH-2026-014`, projectId: project.id, version: officialVersion.version,
      product: project.product, batch: project.batch, facility: project.facility,
      submittedBy: 'A. Boateng', date: new Date().toISOString().slice(0, 10),
      evidenceCount: 27, dataQuality: 92, status: 'Queued for Verification',
    };
    setMrv(req);
    setConfirmOpen(false);
    toast.success('Submitted to MRV & Verification queue. Calculation version locked.');
  };

  return (
    <div className="space-y-6">
      {/* header card */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-saurient-navy p-6 text-white">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-saurient-green">PCF Report</div>
          <h2 className="mt-1 text-2xl font-extrabold">{project.id}</h2>
          <p className="text-sm text-slate-300">{project.product} · {project.batch}</p>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase tracking-wide text-slate-400">Report Status</div>
          <div className="mt-1">
            {reportStatus === 'SUBMITTED'
              ? <StatusChip status="SUBMITTED" tone="amber" />
              : allReady ? <StatusChip status="READY FOR VERIFICATION" tone="green" /> : <StatusChip status="VERIFICATION NOT READY" tone="red" />}
          </div>
          {lockedVersion && <div className="mt-2 flex items-center justify-end gap-1 text-xs text-slate-300"><Lock className="h-3 w-3" /> {lockedVersion} locked</div>}
        </div>
      </div>

      {/* readiness validation */}
      <Section title="Readiness Validation" testId="section-readiness"
        right={allReady ? <StatusChip status="VERIFICATION READY" tone="green" /> : <StatusChip status="VERIFICATION NOT READY" tone="red" />}>
        <div className="grid gap-2 md:grid-cols-2">
          {READINESS_CHECKS.map((c) => (
            <div key={c.label} className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm">
              {c.ok ? <CheckCircle2 className="h-4 w-4 text-saurient-green" /> : <XCircle className="h-4 w-4 text-saurient-red" />}
              <span className={c.ok ? 'text-slate-700' : 'text-saurient-red'}>{c.label}</span>
            </div>
          ))}
          {recalcRequired && (
            <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm md:col-span-2">
              <XCircle className="h-4 w-4 text-saurient-red" />
              <span className="text-saurient-red">Recalculation required — recalculate PCF before submitting.</span>
            </div>
          )}
        </div>
      </Section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* sections list */}
        <Section title="Report Sections (24)" className="lg:col-span-2" testId="section-report-sections">
          <div className="grid gap-1.5 sm:grid-cols-2">
            {SECTIONS.map((s, i) => (
              <div key={s} className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm">
                <span className="w-5 text-right text-[11px] font-bold text-slate-400">{i + 1}</span>
                <CheckCircle2 className="h-3.5 w-3.5 text-saurient-green" />
                <span className="text-slate-700">{s}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* summary card */}
        <Section title="Report Summary" testId="section-report-summary">
          <dl className="space-y-2.5">
            {[
              ['Total', `${(officialTotalKg / 1000).toFixed(1)} tCO₂e`],
              ['Intensity', `${officialIntensity} kgCO₂e/kg`],
              ['Boundary', project.boundary],
              ['Data Quality', `${project.dataQuality}/100`],
              ['Calculation', officialVersion.version],
              ['Verification', reportStatus === 'SUBMITTED' ? 'Submitted' : 'Ready'],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between border-b border-border pb-2 last:border-0">
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{k}</dt>
                <dd className="tabular font-bold text-saurient-navy">{v}</dd>
              </div>
            ))}
          </dl>
        </Section>
      </div>

      {/* actions */}
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button variant="outline" onClick={() => toast.success('Generating PCF report PDF…')} data-testid="btn-download-pdf"><FileDown className="mr-1.5 h-4 w-4" /> Download PDF</Button>
        <Button variant="outline" onClick={() => toast.success('Exporting calculation data (CSV)…')} data-testid="btn-export-calc"><Database className="mr-1.5 h-4 w-4" /> Export Calculation Data</Button>
        <Button variant="outline" onClick={() => toast.success('Exporting evidence register…')} data-testid="btn-export-evidence"><FileText className="mr-1.5 h-4 w-4" /> Export Evidence Register</Button>
        <Button
          onClick={() => reportStatus === 'SUBMITTED' ? toast.info('Already submitted.') : allReady ? setConfirmOpen(true) : toast.error('Verification not ready.')}
          disabled={reportStatus === 'SUBMITTED'}
          data-testid="btn-submit-verification"
          className="bg-saurient-green hover:bg-saurient-greendark"
        >
          <ShieldCheck className="mr-1.5 h-4 w-4" /> Submit for Verification
        </Button>
      </div>

      {/* MRV handoff summary after submit */}
      {mrv && (
        <Section title="MRV Verification Request Created" testId="section-mrv"
          right={<StatusChip status={mrv.status} tone="amber" />}>
          <div className="grid gap-x-6 gap-y-2 sm:grid-cols-3">
            {[
              ['Verification Request ID', mrv.requestId], ['Linked PCF Project', mrv.projectId],
              ['Calculation Version', mrv.version], ['Product', mrv.product], ['Batch', mrv.batch],
              ['Facility', mrv.facility], ['Submitted By', mrv.submittedBy], ['Submission Date', mrv.date],
              ['Evidence Count', mrv.evidenceCount], ['Data Quality', `${mrv.dataQuality}/100`],
            ].map(([k, v]) => (
              <div key={k} className="border-b border-border py-1.5"><div className="text-[11px] uppercase text-muted-foreground">{k}</div><div className="font-semibold text-saurient-navy">{v}</div></div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-slate-50 p-3">
            {['Report Submitted', 'MRV Queue', 'Verifier Review', 'Verified PCF', 'Carbon Passport'].map((p, i, arr) => (
              <React.Fragment key={p}>
                <span className="rounded-md border border-border bg-white px-2.5 py-1 text-xs font-semibold text-saurient-navy">{p}</span>
                {i < arr.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-slate-400" />}
              </React.Fragment>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-md border border-dashed border-slate-300 bg-white px-3 py-2 text-xs text-muted-foreground">
            <QrCode className="h-4 w-4 text-slate-400" />
            Once verified, a QR-backed Carbon Passport can be issued from verified PCF data (handled in the Carbon Passport module).
          </div>
        </Section>
      )}

      {/* confirm modal */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent data-testid="submit-confirm-dialog">
          <DialogHeader>
            <DialogTitle>Submit for Verification</DialogTitle>
            <DialogDescription>
              You are submitting <b>{project.id}</b> Version <b>{officialVersion.version}</b> for independent verification.
              The submitted calculation version and supporting evidence will be locked.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)} data-testid="submit-cancel">Cancel</Button>
            <Button onClick={doSubmit} data-testid="submit-lock" className="bg-saurient-navy hover:bg-saurient-navy2"><Lock className="mr-1.5 h-4 w-4" /> Submit &amp; Lock</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
