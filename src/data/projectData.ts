export interface ThermalSample {
  id: number;
  recording: string;
  true_label: 1 | -1;
  svm_pred: 1 | -1;
  dt_pred: 1 | -1;
  rf_pred: 1 | -1;
  max_temp_c: number;
  grid: number[][];
}

export interface PredictionsPayload {
  dataset: string;
  test_accuracy: {
    numpy_svm: number;
    numpy_dt: number;
    numpy_rf: number;
  };
  samples: ThermalSample[];
}

export interface BenchmarkRow {
  model: string;
  family: 'numpy' | 'sklearn';
  accuracy: string;
  precision: string;
  recall: string;
  f1: string;
  fpr: string;
  confusion?: string;
  highlight?: boolean;
  f1Num: number;
  accNum: number;
  fprNum: number;
}

// Verified Locked Test Set Results (n = 222 unseen test frames: 111 +1, 111 -1)
export const LOCKED_BENCHMARKS: BenchmarkRow[] = [
  {
    model: 'NumPy Linear SVM (tuned)',
    family: 'numpy',
    accuracy: '86.94%',
    precision: '97.67%',
    recall: '75.68%',
    f1: '0.8528',
    fpr: '1.80%',
    confusion: '[[109, 2], [27, 84]]',
    highlight: true,
    f1Num: 0.8528,
    accNum: 86.94,
    fprNum: 1.8,
  },
  {
    model: 'NumPy CART Tree (tuned)',
    family: 'numpy',
    accuracy: '86.94%',
    precision: '91.84%',
    recall: '81.08%',
    f1: '0.8612',
    fpr: '7.21%',
    confusion: '[[103, 8], [21, 90]]',
    f1Num: 0.8612,
    accNum: 86.94,
    fprNum: 7.21,
  },
  {
    model: 'NumPy Random Forest (40 trees)',
    family: 'numpy',
    accuracy: '90.09%',
    precision: '96.84%',
    recall: '82.88%',
    f1: '0.8932',
    fpr: '2.70%',
    confusion: '[[108, 3], [19, 92]]',
    highlight: true,
    f1Num: 0.8932,
    accNum: 90.09,
    fprNum: 2.7,
  },
  {
    model: 'sklearn Linear SVC (baseline)',
    family: 'sklearn',
    accuracy: '86.04%',
    precision: '97.62%',
    recall: '73.87%',
    f1: '0.8410',
    fpr: '1.80%',
    f1Num: 0.841,
    accNum: 86.04,
    fprNum: 1.8,
  },
  {
    model: 'sklearn Decision Tree (baseline)',
    family: 'sklearn',
    accuracy: '86.94%',
    precision: '96.59%',
    recall: '76.58%',
    f1: '0.8543',
    fpr: '2.70%',
    f1Num: 0.8543,
    accNum: 86.94,
    fprNum: 2.7,
  },
  {
    model: 'sklearn Random Forest (baseline)',
    family: 'sklearn',
    accuracy: '90.09%',
    precision: '94.95%',
    recall: '84.68%',
    f1: '0.8952',
    fpr: '4.50%',
    f1Num: 0.8952,
    accNum: 90.09,
    fprNum: 4.5,
  },
];

export const RECORDING_AUDIT = [
  { name: 'Edge_Cases', empty: 0, crossing: 70, train: 40, val: 25, test: 5, note: 'Excluded from -1 (people pause in view)' },
  { name: 'High_Activity', empty: 45, crossing: 255, train: 214, val: 25, test: 61, note: 'Many hotspots back to back' },
  { name: 'Lecture', empty: 150, crossing: 10, train: 106, val: 25, test: 29, note: 'Few hotspots, steady cool background' },
  { name: 'Lunch_Meeting_1', empty: 394, crossing: 65, train: 335, val: 69, test: 55, note: 'Long empty periods between events' },
  { name: 'Lunch_Meeting_2', empty: 54, crossing: 40, train: 67, val: 21, test: 6, note: 'Warm room with moderate activity' },
  { name: 'Lunch_Meeting_3', empty: 179, crossing: 245, train: 293, val: 65, test: 66, note: 'Varied hotspot shapes and speeds' },
];

export interface ExplainedFeatureItem {
  codeName: string;
  plainTitle: string;
  whatHappens: string;
  inference: string;
}

export interface FeatureGroupSpec {
  id: string;
  count: number;
  title: string;
  questionItAnswers: string;
  formula: string;
  rationale: string;
  items: ExplainedFeatureItem[];
  ablationF1: { svm: number; dt: number; rf: number };
}

export const FEATURE_GROUPS: FeatureGroupSpec[] = [
  {
    id: 'delta',
    count: 8,
    title: 'Heat Above Room Floor',
    questionItAnswers: 'How much hotter is this frame than the saved empty room?',
    formula: 'delta = frame - bg_frame',
    rationale:
      'Subtracts the median empty room (learned from training −1 frames, ~21.5°C) so only new extra heat remains.',
    items: [
      {
        codeName: 'delta.max()',
        plainTitle: 'Hottest single jump',
        whatHappens: 'Finds the highest °C rise above empty floor.',
        inference: 'Strong signal for a warm target, though sensitive alone to a 1-pixel glitch.',
      },
      {
        codeName: 'delta.mean()',
        plainTitle: 'Average frame rise',
        whatHappens: 'Averages °C change across all 768 pixels.',
        inference: 'Distinguishes whole-room warming from a localised hotspot.',
      },
      {
        codeName: 'delta.std()',
        plainTitle: 'Spread of extra heat',
        whatHappens: 'Measures heat unevenness across the grid (empty room ≈ 0.6°C).',
        inference: 'High spread means heat sits in a tight cluster, not flat drift.',
      },
      {
        codeName: 'percentile(delta, 95)',
        plainTitle: 'Top 5% heat level',
        whatHappens: 'Reads the ~38th hottest pixel above empty floor.',
        inference: 'Confirms a broad multi-pixel warm patch—cannot be fooled by 1 noisy pixel.',
      },
      {
        codeName: 'percentile(delta, 99)',
        plainTitle: 'Top 1% core heat',
        whatHappens: 'Reads the ~8th hottest pixel above empty floor.',
        inference: 'Tracks compact or distant hotspots safely without trusting a single pixel.',
      },
      {
        codeName: 'sum(delta > 1.5) / 768',
        plainTitle: 'Mild warm area',
        whatHappens: 'Share of pixels ≥ 1.5°C warmer than empty floor.',
        inference: 'Measures the outer thermal halo around a warm object.',
      },
      {
        codeName: 'sum(delta > 2.5) / 768',
        plainTitle: 'Medium warm area',
        whatHappens: 'Share of pixels ≥ 2.5°C warmer than empty floor.',
        inference: 'Captures the main body footprint of a person or warm target.',
      },
      {
        codeName: 'sum(delta > 4.0) / 768',
        plainTitle: 'Hot core area',
        whatHappens: 'Share of pixels ≥ 4.0°C warmer than empty floor.',
        inference: 'Confirms an intense hotspot core versus faint warm reflections.',
      },
    ],
    ablationF1: { svm: 0.812, dt: 0.800, rf: 0.814 },
  },
  {
    id: 'contrast',
    count: 4,
    title: 'Self-Contrast (No Saved Map Needed)',
    questionItAnswers: 'Does one spot stand out sharply from the cool parts of the SAME frame?',
    formula: 'frame_rel = frame - percentile(frame, 25)',
    rationale:
      'Compares pixels against the cool 25th-percentile floor inside the same frame—works even when ambient room temperature shifts.',
    items: [
      {
        codeName: 'frame_rel.max()',
        plainTitle: 'Peak self-contrast',
        whatHappens: 'Gap between hottest pixel and coolest 25% of the same frame.',
        inference: 'Detects a clear hotspot without needing any saved room background.',
      },
      {
        codeName: 'percentile(frame_rel, 95)',
        plainTitle: 'Top 5% self-contrast',
        whatHappens: 'How far the top 5% pixels sit above this frame’s own cool floor.',
        inference: 'Verifies a genuine warm body stands out from ambient temperature.',
      },
      {
        codeName: 'sum(frame_rel > 3.0) / 768',
        plainTitle: 'Stand-out area (> +3°C)',
        whatHappens: 'Share of pixels ≥ 3.0°C hotter than the same frame’s cool quarter.',
        inference: 'Separates real targets from uniform room heating (which lifts P25 too).',
      },
      {
        codeName: 'frame.std()',
        plainTitle: 'Overall frame contrast',
        whatHappens: 'Standard deviation across all 768 raw pixel temperatures.',
        inference: 'Empty scenes look thermally flat; hotspots spike overall variance.',
      },
    ],
    ablationF1: { svm: 0.845, dt: 0.812, rf: 0.814 },
  },
  {
    id: 'gradient',
    count: 4,
    title: 'Thermal Edge Steepness (∇T)',
    questionItAnswers: 'How sharp is the boundary between the hotspot and its surroundings?',
    formula: 'grad_mag = sqrt(gx² + gy²) on delta',
    rationale:
      'Takes spatial derivatives of delta. Edges alone score 0.53–0.57 F1, so they help alongside temperature level.',
    items: [
      {
        codeName: 'grad_mag.max()',
        plainTitle: 'Sharpest pixel jump',
        whatHappens: 'Steepest °C/pixel temperature drop anywhere in the grid.',
        inference: 'Flags crisp hotspot boundaries—slow sunlight drift has tiny slopes.',
      },
      {
        codeName: 'grad_mag.mean()',
        plainTitle: 'Average edge slope',
        whatHappens: 'Mean temperature slope across all 768 pixels.',
        inference: 'Shows whether the frame has sharp local structure vs. smooth air drift.',
      },
      {
        codeName: 'percentile(grad_mag, 95)',
        plainTitle: 'Top 5% boundary sharpness',
        whatHappens: 'Steepness of the sharpest 5% of pixel transitions.',
        inference: 'Tracks the crisp ring outlining a hotspot while ignoring 1-pixel spikes.',
      },
      {
        codeName: 'sum(grad_mag > 1.0) / 768',
        plainTitle: 'Sharp-edge footprint',
        whatHappens: 'Share of pixels changing faster than 1.0°C per pixel step.',
        inference: 'Measures how large the well-defined hotspot perimeter is.',
      },
    ],
    ablationF1: { svm: 0.526, dt: 0.565, rf: 0.562 },
  },
  {
    id: 'zones',
    count: 24,
    title: '3×4 Grid Zone Map',
    questionItAnswers: 'WHERE in the 24×32 grid is the extra heat sitting?',
    formula: 'delta.reshape(3, 8, 4, 8) → 12 zones of 8×8 px',
    rationale:
      'Divides the 24×32 view into a 3×4 grid of 8×8 boxes so the model learns spatial layout without memorising 768 pixels.',
    items: [
      {
        codeName: '12 × blocks.max(axis=(1, 3))',
        plainTitle: '12 zone peaks (3×4 grid)',
        whatHappens: 'Records the hottest ΔT pixel inside each 8×8 box.',
        inference: 'Pinpoints which region holds a hotspot, even if it is small.',
      },
      {
        codeName: '12 × blocks.mean(axis=(1, 3))',
        plainTitle: '12 zone averages (3×4 grid)',
        whatHappens: 'Records the mean ΔT warmth inside each 8×8 box.',
        inference: 'Separates a tiny pinpoint spike from a full-zone warm body.',
      },
    ],
    ablationF1: { svm: 0.758, dt: 0.786, rf: 0.790 },
  },
];

// Gaussian sensor noise F1 degradation curve (σ = 0.0 to 3.0°C) — verified from notebook plot
export const NOISE_CURVE = [
  { sigma: 0.0, svm: 0.853, dt: 0.861, rf: 0.893 },
  { sigma: 0.25, svm: 0.868, dt: 0.841, rf: 0.898 },
  { sigma: 0.5, svm: 0.836, dt: 0.784, rf: 0.777 },
  { sigma: 1.0, svm: 0.650, dt: 0.646, rf: 0.667 },
  { sigma: 1.5, svm: 0.655, dt: 0.638, rf: 0.667 },
  { sigma: 2.0, svm: 0.663, dt: 0.638, rf: 0.667 },
  { sigma: 3.0, svm: 0.667, dt: 0.613, rf: 0.667 },
];

// Isolated hot-pixel glitch (+6.0°C) FPR before and after 3x3 median filter
export const GLITCH_MITIGATION = [
  { glitches: 0, rawSvm: 0.018, rawDt: 0.072, rawRf: 0.027, medSvm: 0.027, medDt: 0.099, medRf: 0.036 },
  { glitches: 1, rawSvm: 1.000, rawDt: 1.000, rawRf: 0.910, medSvm: 0.027, medDt: 0.108, medRf: 0.036 },
  { glitches: 2, rawSvm: 1.000, rawDt: 1.000, rawRf: 1.000, medSvm: 0.027, medDt: 0.099, medRf: 0.045 },
  { glitches: 5, rawSvm: 1.000, rawDt: 1.000, rawRf: 1.000, medSvm: 0.027, medDt: 0.090, medRf: 0.045 },
  { glitches: 10, rawSvm: 1.000, rawDt: 1.000, rawRf: 1.000, medSvm: 0.036, medDt: 0.126, medRf: 0.081 },
  { glitches: 20, rawSvm: 1.000, rawDt: 1.000, rawRf: 1.000, medSvm: 0.054, medDt: 0.126, medRf: 0.063 },
];

export const LORO_RESULTS = [
  { recording: 'High_Activity', nPos: 255, nNeg: 45, svmAcc: 0.850, svmRec: 0.878, svmFpr: 0.311, rfAcc: 0.913, rfRec: 0.953, rfFpr: 0.311, dtAcc: 0.810, dtRec: 0.835, dtFpr: 0.333 },
  { recording: 'Lecture', nPos: 10, nNeg: 150, svmAcc: 1.000, svmRec: 1.000, svmFpr: 0.000, rfAcc: 0.981, rfRec: 1.000, rfFpr: 0.020, dtAcc: 0.888, dtRec: 0.800, dtFpr: 0.107 },
  { recording: 'Lunch_Meeting_1', nPos: 65, nNeg: 394, svmAcc: 0.954, svmRec: 0.754, svmFpr: 0.013, rfAcc: 0.946, rfRec: 0.785, rfFpr: 0.028, dtAcc: 0.869, dtRec: 0.785, dtFpr: 0.117 },
  { recording: 'Lunch_Meeting_2', nPos: 40, nNeg: 54, svmAcc: 0.787, svmRec: 0.650, svmFpr: 0.111, rfAcc: 0.755, rfRec: 0.675, rfFpr: 0.185, dtAcc: 0.787, dtRec: 0.700, dtFpr: 0.148 },
  { recording: 'Lunch_Meeting_3', nPos: 245, nNeg: 179, svmAcc: 0.708, svmRec: 0.518, svmFpr: 0.034, rfAcc: 0.717, rfRec: 0.539, rfFpr: 0.039, dtAcc: 0.693, dtRec: 0.547, dtFpr: 0.106 },
];

export const BOOTSTRAP_CI = [
  { model: 'NumPy Linear SVM', f1: '0.8528', f1Ci: '[0.796, 0.902]', recCi: '[0.672, 0.833]', fprCi: '[0.000, 0.047]' },
  { model: 'NumPy CART Tree', f1: '0.8612', f1Ci: '[0.806, 0.911]', recCi: '[0.733, 0.883]', fprCi: '[0.027, 0.124]' },
  { model: 'NumPy Random Forest', f1: '0.8932', f1Ci: '[0.844, 0.934]', recCi: '[0.757, 0.894]', fprCi: '[0.000, 0.061]' },
];

export const END_TO_END_LATENCY = [
  { model: 'Feature Extraction Only', ms: 0.611, budgetPct: 0.978 },
  { model: 'NumPy CART Tree (end-to-end)', ms: 0.696, budgetPct: 1.113 },
  { model: 'NumPy Linear SVM (end-to-end)', ms: 0.770, budgetPct: 1.232 },
  { model: 'NumPy Random Forest (end-to-end)', ms: 0.938, budgetPct: 1.502 },
];

/**
 * Restrained thermal colour scale:
 * Cool Blue (#1D4ED8) -> Cyan (#0891B2) -> Gold (#EAB308) -> Orange (#EA580C) -> Red (#DC2626)
 */
export function tempToColor(val: number, minVal = 17.5, maxVal = 33.5): string {
  const t = Math.max(0, Math.min(1, (val - minVal) / (maxVal - minVal)));
  const stops: Array<[number, [number, number, number]]> = [
    [0.0, [29, 78, 216]],
    [0.32, [8, 145, 178]],
    [0.58, [234, 179, 8]],
    [0.80, [234, 88, 12]],
    [1.0, [220, 38, 38]],
  ];
  for (let i = 0; i < stops.length - 1; i++) {
    const [t0, c0] = stops[i];
    const [t1, c1] = stops[i + 1];
    if (t >= t0 && t <= t1) {
      const u = (t - t0) / (t1 - t0);
      const r = Math.round(c0[0] + u * (c1[0] - c0[0]));
      const g = Math.round(c0[1] + u * (c1[1] - c0[1]));
      const b = Math.round(c0[2] + u * (c1[2] - c0[2]));
      return `rgb(${r}, ${g}, ${b})`;
    }
  }
  return 'rgb(220, 38, 38)';
}

export function applyMedianFilter3x3(grid: number[][]): number[][] {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  const out: number[][] = [];
  for (let r = 0; r < rows; r++) {
    const rowOut: number[] = [];
    for (let c = 0; c < cols; c++) {
      const win: number[] = [];
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const rr = Math.max(0, Math.min(rows - 1, r + dr));
          const cc = Math.max(0, Math.min(cols - 1, c + dc));
          win.push(grid[rr][cc]);
        }
      }
      win.sort((a, b) => a - b);
      rowOut.push(win[4]);
    }
    out.push(rowOut);
  }
  return out;
}

export function computeGridGradient(grid: number[][]): number[][] {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  const out: number[][] = [];
  for (let r = 0; r < rows; r++) {
    const rowOut: number[] = [];
    for (let c = 0; c < cols; c++) {
      const dy =
        r === 0
          ? grid[1][c] - grid[0][c]
          : r === rows - 1
            ? grid[rows - 1][c] - grid[rows - 2][c]
            : (grid[r + 1][c] - grid[r - 1][c]) * 0.5;
      const dx =
        c === 0
          ? grid[r][1] - grid[r][0]
          : c === cols - 1
            ? grid[r][cols - 1] - grid[r][cols - 2]
            : (grid[r][c + 1] - grid[r][c - 1]) * 0.5;
      rowOut.push(Math.sqrt(dx * dx + dy * dy));
    }
    out.push(rowOut);
  }
  return out;
}

export function computeFrameStats(grid: number[][]) {
  const flat = grid.flat().slice().sort((a, b) => a - b);
  const n = flat.length || 1;
  const p25 = flat[Math.floor(n * 0.25)];
  const min = flat[0];
  const max = flat[n - 1];
  const mean = flat.reduce((s, v) => s + v, 0) / n;
  const variance = flat.reduce((s, v) => s + (v - mean) ** 2, 0) / n;
  const std = Math.sqrt(variance);

  const grad = computeGridGradient(grid);
  let maxGrad = 0;
  let hotContrastCount = 0;
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grad[r][c] > maxGrad) maxGrad = grad[r][c];
      if (grid[r][c] - p25 > 3.0) hotContrastCount++;
    }
  }

  return {
    min,
    max,
    p25,
    mean,
    std,
    maxContrast: max - p25,
    maxGrad,
    hotContrastPct: (hotContrastCount / n) * 100,
  };
}
