# Saurient Carbon Passport Platform — Product Carbon Footprint (PCF) Module

## Original Problem Statement
Enhancement to the existing Saurient Carbon Passport Platform: build the complete inner-page
workflow for Carbon Accounting → Product Carbon Footprint as a fully clickable demo, with 9
connected tabs sharing one project's data. Must not redesign the platform (dark navy sidebar,
white content, green Saurient accent). Demo project PCF-GH-2026-001 (Refined Cocoa Butter,
Tema Processing Plant, Ghana, FY2026, 100,000 kg, Cradle-to-Gate, 284.0 tCO2e, 2.84 kgCO2e/kg,
DQ 92/100).

## User Choices
- Build fresh with the described Saurient design system (codebase was boilerplate).
- Data storage: frontend-only mock data (React context).
- Scope: the 9 PCF tabs now; MRV Verification + Carbon Passport are handoffs (later).
- Charts: enterprise style (Recharts).

## Architecture
- Frontend-only React 19 + CRACO + Tailwind + shadcn/ui + Recharts. No backend used.
- Shared state: `src/store/PcfContext.js` (activities, logistics legs, allocation method,
  boundary, calculation versions, recalc flag, report status, scenarios, active tab).
- Mock data: `src/store/pcfData.js` — totals are internally consistent
  (categories sum to 284,000 kgCO2e; intensity is ALWAYS derived = total / production = 2.84).
- Layout: `components/layout/` (Sidebar, PcfHeader with dynamic primary action + SIMULATED badge,
  ReadinessTracker). Workspace: `components/pcf/PcfWorkspace.jsx` (9-tab bar).
- Tabs: `components/pcf/tabs/` (Projects, OutputDefinition, Boundary, Inventory, Allocation,
  Logistics, Calculation, Hotspots, Report). Wizard + ActivityDrawer under `components/pcf/`.

## User Personas
- Operator/Sustainability lead: builds and calculates the PCF.
- Verifier: reviews submitted, locked calculation (MRV handoff shown).
- Investor: follows the full traceable journey from activity data to verified footprint.

## Core Requirements (static)
- 9 functional, connected tabs using shared project context; persistent IDs across tabs.
- Every important number drillable to formula → emission factor → activity → source → evidence.
- Intensity auto-derived, never hard-coded. Inventory changes → RECALCULATION REQUIRED.
- Recalculation creates a new version (never overwrites history). Submit locks the version.

## Implemented (2026-06)
- All 9 tabs built and verified by testing agent at 100% (iteration_1).
- Readiness tracker (Output→Passport), dynamic per-tab primary action, SIMULATED badge.
- Projects: KPIs, table, 10-step Create-PCF wizard, row actions, data-quality drilldown dialog.
- Output Definition: 5 sections + completeness check.
- Boundary: type selector, greyed lifecycle diagram, inclusion table, exclusions register, scope map.
- Inventory: KPIs, activity ledger, source badges, detail drawer w/ provenance, Add Activity → recalc.
- Allocation: method-driven % recompute, formula, reconciliation card.
- Logistics: Inbound/Internal/Outbound sub-tabs, leg detail dialog, add leg, in-boundary CO2e only.
- Calculation: expandable calc tree, drilldown dialog, scope donut + category bar, versioning, recalc banner, EF register.
- Hotspots: stage/scope/process charts, hotspot register, reduction scenarios (SIMULATION ONLY).
- Report: readiness validation, 24 sections, summary, Submit & Lock → SUBMITTED + MRV request created.

## Backlog / Remaining (P1/P2)
- P1: Full MRV & Verification module (verifier review/approve/reject queue).
- P1: Carbon Passport module + QR public verification (currently referenced as handoff).
- P2: Persist data via FastAPI + MongoDB (currently frontend-only).
- P2: Real PDF/CSV export (currently simulated toasts).

## Next Tasks
- Build the MRV Verification queue that consumes submitted requests.
- Build Carbon Passport issuance from verified PCF data with QR.
