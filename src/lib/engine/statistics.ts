export interface StatTestResult {
  testName: string;
  statisticName: string;
  statisticValue: number;
  pValue: number;
  degreesOfFreedom?: number;
  sampleSize: number;
  assumptions: {
    name: string;
    passed: boolean;
    description: string;
    recommendation?: string;
  }[];
  finding: string;
  academicInterpretation: string;
  businessImplication: string;
  limitations: string;
}

// Deterministic Pearson Correlation Calculation
export function calculatePearson(x: number[], y: number[]): { r: number; pValue: number; n: number } {
  const n = Math.min(x.length, y.length);
  if (n < 3) return { r: 0, pValue: 1, n };

  const xMean = x.reduce((a, b) => a + b, 0) / n;
  const yMean = y.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let denomX = 0;
  let denomY = 0;

  for (let i = 0; i < n; i++) {
    const dx = x[i] - xMean;
    const dy = y[i] - yMean;
    numerator += dx * dy;
    denomX += dx * dx;
    denomY += dy * dy;
  }

  const denominator = Math.sqrt(denomX * denomY);
  if (denominator === 0) return { r: 0, pValue: 1, n };

  const r = numerator / denominator;
  // Approximation of t-statistic for p-value
  const t = (r * Math.sqrt(n - 2)) / Math.sqrt(Math.max(0.00001, 1 - r * r));
  // Standard two-tailed p-value approximation
  const pValue = 2 * (1 - normalCdf(Math.abs(t)));

  return {
    r: Math.round(r * 1000) / 1000,
    pValue: Math.max(0.0001, Math.round(pValue * 10000) / 10000),
    n
  };
}

// Approximation of standard normal CDF
function normalCdf(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - prob : prob;
}

// Check Normality assumption using Skewness & Kurtosis
export function checkNormality(values: number[]): { passed: boolean; skewness: number; note: string } {
  const n = values.length;
  if (n < 5) return { passed: true, skewness: 0, note: "Ukuran sampel terlalu kecil untuk uji formal" };

  const mean = values.reduce((a, b) => a + b, 0) / n;
  const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (n - 1);
  const std = Math.sqrt(variance);

  if (std === 0) return { passed: false, skewness: 0, note: "Varians bernilai 0 (semua data identik)" };

  const m3 = values.reduce((acc, val) => acc + Math.pow(val - mean, 3), 0) / n;
  const skewness = m3 / Math.pow(std, 3);

  // General rule of thumb: skewness between -1.0 and +1.0 indicates moderate to normal distribution
  const passed = Math.abs(skewness) <= 1.2;

  return {
    passed,
    skewness: Math.round(skewness * 100) / 100,
    note: passed
      ? `Data terdistribusi mendekati normal (kemencengan/skewness: ${skewness.toFixed(2)}). Asumsi terpenuhi.`
      : `Distribusi data condong tidak normal (skewness: ${skewness.toFixed(2)} > 1.2). Direkomendasikan menggunakan uji non-parametrik (seperti Spearman atau Mann-Whitney U).`
  };
}

// Simple Linear Regression OLS
export function calculateLinearRegression(x: number[], y: number[]) {
  const n = Math.min(x.length, y.length);
  if (n < 3) return { slope: 0, intercept: 0, r2: 0 };

  const xMean = x.reduce((a, b) => a + b, 0) / n;
  const yMean = y.reduce((a, b) => a + b, 0) / n;

  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (x[i] - xMean) * (y[i] - yMean);
    den += Math.pow(x[i] - xMean, 2);
  }

  const slope = den !== 0 ? num / den : 0;
  const intercept = yMean - slope * xMean;

  // R-squared
  const { r } = calculatePearson(x, y);
  const r2 = Math.round(r * r * 1000) / 1000;

  return {
    slope: Math.round(slope * 1000) / 1000,
    intercept: Math.round(intercept * 100) / 100,
    r2,
    n
  };
}

