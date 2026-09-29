import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import {
  PROJECT, ACTIVITIES, LOGISTICS_LEGS, ALLOCATION, BASELINE_VERSION,
} from './pcfData';

const PcfContext = createContext(null);

export const CATEGORY_SCOPE = {
  'Raw Materials': 'Scope 3',
  'Energy': 'Scope 2',
  'Fuel': 'Scope 1',
  'Process Emissions': 'Scope 1',
  'Packaging': 'Scope 3',
  'Waste': 'Scope 3',
  'Logistics': 'Scope 3',
};

export function PcfProvider({ children }) {
  const [activities, setActivities] = useState(ACTIVITIES);
  const [legs, setLegs] = useState(LOGISTICS_LEGS);
  const [allocationMethod, setAllocationMethod] = useState('Physical / Mass');
  const [boundaryType, setBoundaryType] = useState('Cradle-to-Gate');
  const [boundaryApproved, setBoundaryApproved] = useState(true);
  const [versions, setVersions] = useState([BASELINE_VERSION]);
  const [recalcRequired, setRecalcRequired] = useState(false);
  const [reportStatus, setReportStatus] = useState('READY'); // READY | SUBMITTED
  const [lockedVersion, setLockedVersion] = useState(null);
  const [scenarios, setScenarios] = useState([]);
  const [activeTab, setActiveTabState] = useState('projects');
  const [openProject, setOpenProject] = useState(true);

  // ---- computed: logistics ----
  const logisticsInboundKg = useMemo(
    () => legs.filter((l) => l.boundary === 'In').reduce((s, l) => s + l.co2e, 0),
    [legs]
  );

  // ---- computed: category totals from activities + logistics ----
  const categoryTotals = useMemo(() => {
    const map = {};
    activities.forEach((a) => {
      map[a.category] = (map[a.category] || 0) + a.co2e;
    });
    map['Logistics'] = logisticsInboundKg;
    return map;
  }, [activities, logisticsInboundKg]);

  const liveTotalKg = useMemo(
    () => Object.values(categoryTotals).reduce((s, v) => s + v, 0),
    [categoryTotals]
  );

  const scopeTotals = useMemo(() => {
    const map = { 'Scope 1': 0, 'Scope 2': 0, 'Scope 3': 0 };
    activities.forEach((a) => { map[a.scope] += a.co2e; });
    map['Scope 3'] += logisticsInboundKg;
    return map;
  }, [activities, logisticsInboundKg]);

  // official = latest calculated version snapshot
  const officialVersion = versions[versions.length - 1];
  const officialTotalKg = officialVersion.totalKg;
  const productionKg = PROJECT.productionQuantity;
  const officialIntensity = (officialTotalKg / productionKg).toFixed(2);
  const liveIntensity = (liveTotalKg / productionKg).toFixed(2);

  // ---- mutations ----
  const addActivity = useCallback((rec) => {
    setActivities((prev) => [...prev, rec]);
    setRecalcRequired(true);
  }, []);

  const updateActivity = useCallback((id, patch) => {
    setActivities((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
    setRecalcRequired(true);
  }, []);

  const addLeg = useCallback((leg) => {
    setLegs((prev) => [...prev, leg]);
    setRecalcRequired(true);
  }, []);

  const recalculate = useCallback(() => {
    const next = {
      version: `V1.${versions.length}`,
      totalKg: liveTotalKg,
      calculatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      calculatedBy: 'A. Boateng',
      note: 'Recalculated after inventory change',
    };
    setVersions((prev) => [...prev, next]);
    setRecalcRequired(false);
    return next;
  }, [liveTotalKg, versions.length]);

  const submitForVerification = useCallback(() => {
    setReportStatus('SUBMITTED');
    setLockedVersion(officialVersion.version);
  }, [officialVersion]);

  const addScenario = useCallback((sc) => setScenarios((prev) => [...prev, sc]), []);

  const setActiveTab = useCallback((t) => setActiveTabState(t), []);

  const value = {
    project: PROJECT,
    activities, legs,
    allocationMethod, setAllocationMethod,
    boundaryType, setBoundaryType,
    boundaryApproved, setBoundaryApproved,
    versions, officialVersion, officialTotalKg, officialIntensity,
    liveTotalKg, liveIntensity, productionKg,
    logisticsInboundKg,
    categoryTotals, scopeTotals,
    recalcRequired, setRecalcRequired,
    reportStatus, lockedVersion, submitForVerification,
    scenarios, addScenario,
    addActivity, updateActivity, addLeg, recalculate,
    activeTab, setActiveTab,
    openProject, setOpenProject,
    allocation: ALLOCATION,
  };

  return <PcfContext.Provider value={value}>{children}</PcfContext.Provider>;
}

export const usePcf = () => {
  const ctx = useContext(PcfContext);
  if (!ctx) throw new Error('usePcf must be used within PcfProvider');
  return ctx;
};
