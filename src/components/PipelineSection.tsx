import React, { useState } from 'react';
import { FEATURE_GROUPS } from '../data/projectData';

interface CodeModuleSpec {
  id: string;
  fnName: string;
  role: string;
  summary: string;
  formula: string;
  settings: string;
  code: string;
}

const CODE_MODULES: CodeModuleSpec[] = [
  {
    id: 'features',
    fnName: 'extract_thermal_features(frame, bg_frame)',
    role: '40 Heat Measurements (Cell 12)',
    summary:
      'Turns each 24×32 heat picture (768 pixels) into 40 physical features: floor-rise stats, self-contrast, edge slope, and 12 grid zones—preventing raw-pixel memorisation.',
    formula: '40 features = 8 Floor Diff + 4 Self-Contrast + 4 Edge Steepness + 24 Zone Map',
    settings: 'Runs in 0.611 ms per frame · StandardScaler fit on X_train only',
    code: `def extract_thermal_features(frame, bg_frame):
    """Extract 40 fast, physical hotspot features from one 24x32 thermal frame."""
    delta = frame - bg_frame                          # Temperature rise over empty floor
    frame_rel = frame - np.percentile(frame, 25)      # Room-invariant contrast over floor
    gy, gx = np.gradient(delta)
    grad_mag = np.sqrt(gx**2 + gy**2)

    features = [
        float(delta.max()), float(delta.mean()), float(delta.std()),
        float(np.percentile(delta, 95)), float(np.percentile(delta, 99)),
        float(np.sum(delta > 1.5) / 768.0),
        float(np.sum(delta > 2.5) / 768.0),
        float(np.sum(delta > 4.0) / 768.0),
        float(frame_rel.max()), float(np.percentile(frame_rel, 95)),
        float(np.sum(frame_rel > 3.0) / 768.0), float(frame.std()),
        float(grad_mag.max()), float(grad_mag.mean()),
        float(np.percentile(grad_mag, 95)), float(np.sum(grad_mag > 1.0) / 768.0),
    ]
    blocks = delta.reshape(3, 8, 4, 8)
    features.extend(blocks.max(axis=(1, 3)).ravel().tolist())
    features.extend(blocks.mean(axis=(1, 3)).ravel().tolist())
    return np.asarray(features, dtype=np.float64)`,
  },
  {
    id: 'svm',
    fnName: 'train_linear_svm(X, y, ...)',
    role: 'Pure-NumPy Linear SVM (Cell 15)',
    summary:
      'Trains a soft-margin Linear SVM via stochastic subgradient descent. Validation tuning (Cell 25) selected learning_rate=0.001, lambda_reg=0.001, epochs=400.',
    formula: 'Minimise (λ/2)||w||² + mean(max(0, 1 − yᵢ(wᵀxᵢ + b)))',
    settings: 'Tuned (Cell 25): lr=0.001 · λ=0.001 · epochs=400 · Test: 86.94% acc · 97.67% prec · 1.80% FPR',
    code: `def train_linear_svm(X, y, learning_rate=0.001, lambda_reg=0.01,
                     epochs=300, random_state=42):
    X = np.asarray(X, dtype=np.float64)
    y = np.asarray(y, dtype=np.float64)
    n_samples, n_features = X.shape
    w = np.zeros(n_features, dtype=np.float64)
    b = 0.0
    rng = np.random.default_rng(random_state)
    losses = []

    for epoch in range(epochs):
        indices = rng.permutation(n_samples)
        for i in indices:
            margin = y[i] * (np.dot(X[i], w) + b)
            if margin >= 1:
                grad_w = lambda_reg * w
                grad_b = 0.0
            else:
                grad_w = lambda_reg * w - y[i] * X[i]
                grad_b = -y[i]
            w -= learning_rate * grad_w
            b -= learning_rate * grad_b
        margins = y * (X @ w + b)
        objective = 0.5 * lambda_reg * np.dot(w, w) + np.mean(np.maximum(0.0, 1.0 - margins))
        losses.append(objective)
    return w, b, np.asarray(losses)`,
  },
  {
    id: 'cart',
    fnName: 'build_decision_tree(X, y, ...)',
    role: 'Pure-NumPy CART Tree (Cell 17)',
    summary:
      'Recursively picks the feature and percentile-sampled threshold giving the largest Gini impurity drop. Tuned in Cell 25 to max_depth=5 and min_samples_leaf=10.',
    formula: 'Gini(S) = 1 − Σ pₖ²   (keep best gain ≥ min_impurity_decrease)',
    settings: 'Tuned (Cell 25): max_depth=5 · min_samples_leaf=10 · Test: 86.94% acc · 81.08% recall',
    code: `def calculate_gini(y):
    if len(y) == 0:
        return 0.0
    _, counts = np.unique(y, return_counts=True)
    probabilities = counts / counts.sum()
    return float(1.0 - np.sum(probabilities ** 2))

def find_best_split(X, y, min_samples_leaf=5, min_impurity_decrease=1e-5, feature_indices=None):
    n_samples, n_features = X.shape
    parent_gini = calculate_gini(y)
    best_gain, best_feature, best_threshold = 0.0, None, None
    if feature_indices is None:
        feature_indices = np.arange(n_features)
    for feature in feature_indices:
        values = np.unique(X[:, feature])
        if len(values) > 20:
            values = np.unique(np.percentile(values, np.linspace(5, 95, 19)))
        for threshold in values:
            left_mask = X[:, feature] <= threshold
            n_left = int(np.sum(left_mask))
            n_right = n_samples - n_left
            if n_left < min_samples_leaf or n_right < min_samples_leaf:
                continue
            weighted_child_gini = (
                (n_left / n_samples) * calculate_gini(y[left_mask])
                + (n_right / n_samples) * calculate_gini(y[~left_mask])
            )
            gain = parent_gini - weighted_child_gini
            if gain > best_gain and gain >= min_impurity_decrease:
                best_gain, best_feature, best_threshold = gain, feature, float(threshold)
    return best_feature, best_threshold, best_gain

def build_decision_tree(X, y, depth=0, max_depth=8, min_samples_split=10,
                        min_samples_leaf=20, min_impurity_decrease=1e-5,
                        max_features=None, rng=None):
    if rng is None:
        rng = np.random.default_rng(42)
    if len(np.unique(y)) == 1 or depth >= max_depth or len(y) < min_samples_split:
        return {"is_leaf": True, "value": majority_class(y)}
    n_features = X.shape[1]
    feature_indices = (
        np.arange(n_features) if max_features is None
        else rng.choice(n_features, size=min(max_features, n_features), replace=False)
    )
    feature, threshold, gain = find_best_split(
        X, y, min_samples_leaf=min_samples_leaf,
        min_impurity_decrease=min_impurity_decrease, feature_indices=feature_indices
    )
    if feature is None:
        return {"is_leaf": True, "value": majority_class(y)}
    left_mask = X[:, feature] <= threshold
    return {
        "is_leaf": False, "feature": int(feature), "threshold": float(threshold), "gain": float(gain),
        "left": build_decision_tree(X[left_mask], y[left_mask], depth + 1, max_depth,
                                    min_samples_split, min_samples_leaf, min_impurity_decrease, max_features, rng),
        "right": build_decision_tree(X[~left_mask], y[~left_mask], depth + 1, max_depth,
                                     min_samples_split, min_samples_leaf, min_impurity_decrease, max_features, rng),
    }`,
  },
  {
    id: 'rf',
    fnName: 'train_random_forest(X, y, ...)',
    role: 'Pure-NumPy Random Forest (Cell 21)',
    summary:
      'Bootstraps rows with replacement and gives each tree an independent RNG for feature subsampling at every split. Evaluated in Cell 25 with n_trees=40, max_depth=6, max_features=8.',
    formula: 'Bootstrap rows + random feature subset per split · majority vote > 0',
    settings: 'Cell 25 config: n_trees=40 · max_depth=6 · max_features=8 · Test: 90.09% acc · 0.8932 F1',
    code: `def train_random_forest(
    X, y, n_trees=50, max_depth=8, min_samples_split=10,
    min_samples_leaf=20, max_features=9, min_impurity_decrease=1e-5, random_state=42
):
    rng = np.random.default_rng(random_state)
    n_samples = X.shape[0]
    forest = []
    for i in range(n_trees):
        bootstrap_indices = rng.choice(n_samples, size=n_samples, replace=True)
        tree_rng = np.random.default_rng(rng.integers(0, 2**32))
        tree = build_decision_tree(
            X[bootstrap_indices], y[bootstrap_indices],
            max_depth=max_depth, min_samples_split=min_samples_split,
            min_samples_leaf=min_samples_leaf,
            min_impurity_decrease=min_impurity_decrease,
            max_features=max_features, rng=tree_rng
        )
        forest.append(tree)
    return forest

def predict_random_forest(X, forest):
    all_predictions = np.array([predict_decision_tree(X, tree) for tree in forest])
    votes = np.sum(all_predictions, axis=0)
    return np.where(votes > 0, 1, -1)`,
  },
  {
    id: 'lasso',
    fnName: 'lasso_coordinate_descent(X, y, alpha)',
    role: 'Pure-NumPy Lasso Filter (Cell 40)',
    summary:
      'Pure-NumPy coordinate descent used to test feature sparsity. Best α = 0.0016 keeps 34/40 features (Lasso val F1 = 0.8293; Linear SVM on those 34 features = 0.8519 vs 0.8625 with all 40).',
    formula: 'Minimise (1/2n)||y − Xw||² + α||w||₁ on centred y',
    settings: 'Best α = 0.0016 · 34 / 40 features kept (SVM on kept: 0.8519 val F1)',
    code: `def soft_threshold(rho, alpha):
    return np.sign(rho) * np.maximum(np.abs(rho) - alpha, 0.0)

def lasso_coordinate_descent(X, y, alpha, n_iter=300, tol=1e-7):
    """Minimise (1/2n)||y - Xw||^2 + alpha*||w||_1 on centred y (X already standardised)."""
    n, p = X.shape
    y_mean = y.mean()
    r = (y - y_mean).astype(np.float64)       # residual
    w = np.zeros(p)
    col_sq = (X ** 2).sum(axis=0) / n

    for _ in range(n_iter):
        w_old = w.copy()
        for j in range(p):
            r += X[:, j] * w[j]                # remove feature j from the fit
            rho = X[:, j] @ r / n
            w[j] = soft_threshold(rho, alpha) / col_sq[j]
            r -= X[:, j] * w[j]                # add it back
        if np.max(np.abs(w - w_old)) < tol:
            break
    return w, y_mean`,
  },
  {
    id: 'robust',
    fnName: 'extract_features_robust(frame, bg)',
    role: '3×3 Median Glitch Fix (Cell 33)',
    summary:
      'A single glitched +6°C pixel caused 100% false alarms on empty frames. Passing frame and bg through a 3×3 median filter removes 1-pixel spikes while keeping multi-pixel hotspots intact.',
    formula: 'median_filter(frame, size=3, mode="nearest") before feature extraction',
    settings: 'Cuts 1-glitch false alarms from 100% down to 2.7% (SVM) and 3.6% (RF)',
    code: `from scipy.ndimage import median_filter

def extract_features_robust(frame, bg):
    return extract_thermal_features(
        median_filter(frame, size=3, mode="nearest"),
        median_filter(bg,    size=3, mode="nearest")
    )`,
  },
];

const ABLATION_ROWS = [
  { label: 'A. Edge steepness only (4)', svm: 0.526, dt: 0.565, rf: 0.562 },
  { label: 'Self-contrast alone — no floor bg (4)', svm: 0.845, dt: 0.812, rf: 0.814 },
  { label: 'C. Self-contrast + edges (8)', svm: 0.845, dt: 0.817, rf: 0.817 },
  { label: 'D. 3×4 grid zones (24)', svm: 0.758, dt: 0.786, rf: 0.790 },
  { label: 'B. Heat above floor (8)', svm: 0.812, dt: 0.800, rf: 0.814 },
  { label: 'E. All 40 features together', svm: 0.862, dt: 0.821, rf: 0.821 },
];

export const PipelineSection: React.FC = () => {
  const [activeModuleId, setActiveModuleId] = useState<string>('features');
  const [activeGroupId, setActiveGroupId] = useState<string>('delta');

  const activeModule = CODE_MODULES.find((m) => m.id === activeModuleId) ?? CODE_MODULES[0];
  const activeGroup = FEATURE_GROUPS.find((g) => g.id === activeGroupId) ?? FEATURE_GROUPS[0];

  return (
    <section id="architecture" className="border-b border-[#E5E7EB] bg-[#FAFAFA] py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-3xl">
          <div className="font-mono text-xs font-semibold uppercase tracking-widest text-[#0E7490]">
            02 · Code Breakdown &amp; 40 Heat Measurements
          </div>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#111827] sm:text-3xl [text-wrap:balance]">
            Every solver, tree splitter, and heat measurement written in pure NumPy.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#4B5563] sm:text-base">
            We did not use <span className="font-mono font-medium text-[#111827]">scikit-learn</span> to train our main models—it was only used to split data, scale numbers, and sanity-check results. Click any module below to inspect the real Python code.
          </p>
        </div>

        {/* Problem Scale & Dimensions — 4-Step Horizontal Funnel Strip */}
        <div className="mt-10 border border-[#E5E7EB] bg-white">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[#E5E7EB] bg-[#FAFAFA] px-5 py-3">
            <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-[#111827]">
              Problem Scale &amp; Dimensions
            </h3>
            <span className="font-mono text-[11px] text-[#6B7280]">
              From raw 16 Hz thermal recordings down to a 41-number classifier
            </span>
          </div>

          <div className="grid grid-cols-1 divide-y divide-[#E5E7EB] md:grid-cols-4 md:divide-x md:divide-y-0">
            {/* Step 1 */}
            <div className="p-5 flex flex-col justify-between">
              <div>
                <div className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#0E7490]">
                  01 · Raw Recording Pool
                </div>
                <div className="mt-2 font-mono text-2xl sm:text-3xl font-bold tracking-tight tabular-nums text-[#111827]">
                  118,208
                </div>
                <div className="mt-0.5 text-xs font-semibold text-[#111827]">Raw Frames</div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-[#4B5563]">
                <span className="font-mono text-[#111827]">7,388</span> JSON chunks (<span className="font-mono text-[#111827]">16 Hz</span>) across <span className="font-mono text-[#111827]">6</span> TIDOS doorway recordings (~59k on Sensor 1; <span className="font-mono text-[#111827]">24×32</span> thermal grid).
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-5 flex flex-col justify-between">
              <div>
                <div className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#0E7490]">
                  02 · Leak-Free Dataset
                </div>
                <div className="mt-2 font-mono text-2xl sm:text-3xl font-bold tracking-tight tabular-nums text-[#111827]">
                  1,507
                </div>
                <div className="mt-0.5 text-xs font-semibold text-[#111827]">
                  Clean Labelled Frames
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-[#4B5563]">
                <span className="font-mono text-[#111827]">685</span> Hotspot (<span className="font-mono text-[#B91C1C]">+1</span>) + <span className="font-mono text-[#111827]">822</span> Empty (<span className="font-mono text-[#1D4ED8]">−1</span>), group-split by 5s blocks into{' '}
                <strong className="font-mono text-[#111827]">1,055 / 230 / 222</strong> (Train / Val / Test).
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-5 flex flex-col justify-between">
              <div>
                <div className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#0E7490]">
                  03 · Dimensionality Cut
                </div>
                <div className="mt-2 flex items-baseline gap-2 flex-wrap">
                  <span className="font-mono text-2xl sm:text-3xl font-bold tracking-tight tabular-nums text-[#111827]">
                    768 → 40
                  </span>
                  <span className="font-mono text-xs font-bold text-[#0E7490]">
                    (19× smaller)
                  </span>
                </div>
                <div className="mt-0.5 text-xs font-semibold text-[#111827]">
                  Physical Thermal Features
                </div>
              </div>
              <div className="mt-3">
                <p className="text-xs leading-relaxed text-[#4B5563]">
                  Compresses each <span className="font-mono text-[#111827]">24×32</span> grid into <strong className="text-[#111827]">40 numbers</strong> (<span className="font-mono text-[#111827]">8</span> peak/area + <span className="font-mono text-[#111827]">4</span> contrast + <span className="font-mono text-[#111827]">4</span> gradients + <span className="font-mono text-[#111827]">24</span> zone stats).
                </p>
                {/* Proportional 40-feature breakdown bar */}
                <div className="mt-2.5">
                  <div className="flex h-2 w-full overflow-hidden border border-[#E5E7EB]" aria-label="40-feature breakdown: 24 Zone Stats, 8 Delta Peak/Area, 4 Contrast, 4 Gradients">
                    <div className="bg-[#111827]" style={{ width: '60%' }} title="24 Zone Stats (60%)" />
                    <div className="bg-[#0E7490]" style={{ width: '20%' }} title="8 Delta Peak/Area (20%)" />
                    <div className="bg-[#2563EB]" style={{ width: '10%' }} title="4 Self-Contrast (10%)" />
                    <div className="bg-[#B91C1C]" style={{ width: '10%' }} title="4 Gradients (10%)" />
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-x-2.5 gap-y-1 font-mono text-[10px] text-[#6B7280]">
                    <span className="inline-flex items-center gap-1">
                      <span className="inline-block h-1.5 w-1.5 bg-[#111827]" />
                      24 Zones
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="inline-block h-1.5 w-1.5 bg-[#0E7490]" />
                      8 Delta
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="inline-block h-1.5 w-1.5 bg-[#2563EB]" />
                      4 Contrast
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="inline-block h-1.5 w-1.5 bg-[#B91C1C]" />
                      4 Gradients
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-5 flex flex-col justify-between">
              <div>
                <div className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#0E7490]">
                  04 · Model Footprint
                </div>
                <div className="mt-2 font-mono text-2xl sm:text-3xl font-bold tracking-tight tabular-nums text-[#111827]">
                  41 <span className="text-base font-normal text-[#6B7280]">/</span> 40
                </div>
                <div className="mt-0.5 text-xs font-semibold text-[#111827]">
                  Weights / Forest Trees
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-[#4B5563]">
                Linear SVM needs just <strong className="font-mono text-[#111827]">41</strong> numbers (<span className="font-mono text-[#111827]">40</span> weights + <span className="font-mono text-[#111827]">1</span> bias), CART uses <strong className="font-mono text-[#111827]">depth 5</strong>, and Random Forest votes across <strong className="font-mono text-[#111827]">40 trees</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Component-by-Component Code Breakdown */}
        <div className="mt-8 border border-[#E5E7EB] bg-white">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-[#E5E7EB] divide-y divide-[#E5E7EB]">
              {CODE_MODULES.map((mod, idx) => {
                const isSel = mod.id === activeModule.id;
                return (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => setActiveModuleId(mod.id)}
                    className={`w-full text-left px-5 py-4 transition-colors cursor-pointer ${
                      isSel
                        ? 'bg-[#111827] text-white'
                        : 'bg-white text-[#111827] hover:bg-[#F9FAFB]'
                    }`}
                  >
                    <div
                      className={`font-mono text-[11px] uppercase tracking-wider ${
                        isSel ? 'text-[#67E8F9]' : 'text-[#0E7490]'
                      }`}
                    >
                      0{idx + 1} · {mod.role}
                    </div>
                    <div className="mt-1 font-mono text-xs font-medium truncate">
                      {mod.fnName}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="lg:col-span-8 p-6 sm:p-7 flex flex-col justify-between bg-white">
              <div>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#0E7490]">
                    {activeModule.role}
                  </span>
                  <span className="font-mono text-xs text-[#6B7280]">{activeModule.settings}</span>
                </div>

                <h3 className="mt-1.5 font-mono text-base sm:text-lg font-semibold text-[#111827]">
                  {activeModule.fnName}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-[#4B5563]">
                  {activeModule.summary}
                </p>

                {/* Crisp Dark Code Block Inside Light Surface */}
                <div className="mt-4 border border-[#E5E7EB] bg-[#18181B] text-[#F4F4F5] p-4 overflow-x-auto">
                  <pre className="font-mono text-xs leading-relaxed">
                    <code>{activeModule.code}</code>
                  </pre>
                </div>
              </div>

              <div className="mt-4 border border-[#E5E7EB] bg-[#FAFAFA] px-4 py-3 text-xs">
                <span className="font-mono uppercase tracking-wider text-[#6B7280] mr-2">
                  Core Idea:
                </span>
                <span className="font-mono text-[#111827] font-medium">{activeModule.formula}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Crystal-Clear 40-Feature Breakdown + Ablation */}
        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7 border border-[#E5E7EB] bg-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E7EB] pb-4">
              <div>
                <h3 className="text-base font-bold text-[#111827]">
                  Inside the 40 Heat Measurements (Explained Simply)
                </h3>
                <p className="mt-0.5 text-xs text-[#4B5563]">
                  A model cannot look at 768 raw pixels cleanly, so we measure 4 things per frame:
                </p>
              </div>
              <span className="font-mono text-xs font-semibold tabular-nums text-[#0E7490]">
                8 + 4 + 4 + 24 = 40
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {FEATURE_GROUPS.map((grp, i) => {
                const isActive = grp.id === activeGroup.id;
                return (
                  <button
                    key={grp.id}
                    type="button"
                    onClick={() => setActiveGroupId(grp.id)}
                    className={`rounded-[4px] border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      isActive
                        ? 'border-[#111827] bg-[#111827] text-white'
                        : 'border-[#E5E7EB] bg-[#FAFAFA] text-[#4B5563] hover:border-[#111827] hover:text-[#111827]'
                    }`}
                  >
                    <span className="font-mono mr-1.5 tabular-nums">
                      {i + 1}. ({grp.count})
                    </span>
                    {grp.title.split(' (')[0]}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 border-t border-[#E5E7EB] pt-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h4 className="text-base font-bold text-[#111827]">
                  {activeGroup.title} ({activeGroup.count} features)
                </h4>
                <span className="font-mono text-xs text-[#0E7490]">{activeGroup.formula}</span>
              </div>

              <div className="mt-3 border border-[#E5E7EB] bg-[#FAFAFA] px-4 py-3 text-sm">
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#0E7490] mr-2">
                  Question it answers:
                </span>
                <span className="text-[#111827] font-semibold">{activeGroup.questionItAnswers}</span>
                <p className="mt-1.5 text-xs leading-relaxed text-[#4B5563]">
                  {activeGroup.rationale}
                </p>
              </div>

              {/* Inference-Driven Feature Cards */}
              <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {activeGroup.items.map((item) => (
                  <div
                    key={item.codeName}
                    className="border border-[#E5E7EB] bg-white p-3.5"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-xs font-bold text-[#111827]">{item.plainTitle}</span>
                      <span className="font-mono text-[10px] text-[#0E7490] shrink-0">
                        {item.codeName}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs leading-snug text-[#4B5563]">
                      {item.whatHappens}
                    </p>
                    <div className="mt-2 border-t border-[#F3F4F6] pt-1.5 text-xs leading-snug text-[#111827]">
                      <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#0E7490] mr-1.5">
                        Inference:
                      </span>
                      {item.inference}
                    </div>
                  </div>
                ))}
              </div>

              {/* Mini Visual Helper for 3x4 Grid Zones */}
              {activeGroup.id === 'zones' && (
                <div className="mt-4 border border-[#E5E7EB] bg-[#FAFAFA] p-4">
                  <div className="flex items-center justify-between text-xs mb-2.5">
                    <span className="font-semibold text-[#111827]">Visual: How 24×32 splits into 3×4 zones</span>
                    <span className="font-mono text-[#6B7280]">Each box = 8×8 pixels</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {Array.from({ length: 12 }).map((_, idx) => {
                      const isHotZone = idx === 5 || idx === 6;
                      return (
                        <div
                          key={idx}
                          className={`border py-2 text-center font-mono text-[11px] ${
                            isHotZone
                              ? 'border-[#C2410C] bg-[#FFF7ED] text-[#9A3412] font-semibold'
                              : 'border-[#E5E7EB] bg-white text-[#6B7280]'
                          }`}
                        >
                          Zone {idx + 1}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-[#E5E7EB] pt-4 text-xs">
                <span className="text-[#4B5563]">Validation F1 score using ONLY this group:</span>
                <div className="flex items-center gap-5 font-mono tabular-nums text-[#4B5563]">
                  <span>
                    SVM <strong className="text-[#111827]">{activeGroup.ablationF1.svm.toFixed(3)}</strong>
                  </span>
                  <span>
                    CART <strong className="text-[#111827]">{activeGroup.ablationF1.dt.toFixed(3)}</strong>
                  </span>
                  <span>
                    RF <strong className="text-[#111827]">{activeGroup.ablationF1.rf.toFixed(3)}</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 border border-[#E5E7EB] bg-white p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-[#111827]">
                Which Features Matter Most? (Validation F1)
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-[#4B5563]">
                At first we guessed edge steepness (<span className="font-mono text-[#111827]">∇T</span>) alone could find hotspots. Testing proved edges alone fail (<span className="font-mono font-semibold text-[#B45309]">0.53–0.57</span> F1)—you also need heat level.
              </p>

              <div className="mt-6 space-y-4">
                {ABLATION_ROWS.map((row) => (
                  <div key={row.label}>
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="font-semibold text-[#111827]">{row.label}</span>
                      <span className="font-mono tabular-nums text-[#4B5563]">
                        SVM {row.svm.toFixed(3)} · RF {row.rf.toFixed(3)}
                      </span>
                    </div>
                    <div className="mt-1.5 h-2.5 w-full bg-[#F3F4F6] overflow-hidden">
                      <div
                        className="h-full transition-all duration-300"
                        style={{
                          width: `${Math.round(row.svm * 100)}%`,
                          backgroundColor: row.svm < 0.6 ? '#D97706' : '#0E7490',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 border border-[#E5E7EB] bg-[#FAFAFA] p-4 text-xs leading-relaxed text-[#4B5563]">
              <div className="font-semibold text-[#0E7490]">
                Key Takeaway: Self-Contrast Alone Needs No Saved Room Map
              </div>
              <p className="mt-1">
                Self-contrast alone (just 4 features using each frame’s own <span className="font-mono text-[#111827]">P25</span> floor) needs no room calibration and reaches <span className="font-mono tabular-nums text-[#111827] font-semibold">≈ 0.845</span> SVM F1 (<span className="font-mono tabular-nums">0.812</span> CART, <span className="font-mono tabular-nums">0.814</span> RF); adding edges gives no measurable gain (<span className="font-mono tabular-nums">0.845</span> in Group C, where edges still subtract <span className="font-mono text-[#111827]">T_bg</span>).
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
