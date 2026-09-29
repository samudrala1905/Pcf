export const fmtNum = (n, d = 0) =>
  Number(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

// kg -> tonnes string with 1 decimal
export const kgToT = (kg) => fmtNum(kg / 1000, 1);

// intensity kgCO2e/kg
export const intensity = (totalKg, productionKg) =>
  productionKg ? (totalKg / productionKg).toFixed(2) : '0.00';

export const pct = (part, whole) => (whole ? ((part / whole) * 100).toFixed(1) : '0.0');
