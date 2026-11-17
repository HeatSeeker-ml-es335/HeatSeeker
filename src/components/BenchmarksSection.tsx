import React, { useState } from 'react';
import {
  BOOTSTRAP_CI,
  END_TO_END_LATENCY,
  GLITCH_MITIGATION,
  LOCKED_BENCHMARKS,
  LORO_RESULTS,
  NOISE_CURVE,
} from '../data/projectData';

type RobustnessTab = 'noise' | 'glitch' | 'loro' | 'latency';

const METRIC_GLOSSARY = [
  { term: 'Accuracy', meaning: 'Overall % of all 222 frames guessed right.' },
  { term: 'Precision', meaning: 'When it says "Hotspot!", how often is it truly right?' },
  { term: 'Recall', meaning: 'Out of all real hotspots, how many did it catch?' },
  { term: 'False Alarms', meaning: 'Out of all normal frames, how often did it cry wolf?' },
];

const NoiseSvgChart: React.FC = () => {
  const width = 560;
  const height = 230;
  const pad = { top: 20, right: 24, bottom: 36, left: 46 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  const xScale = (sigma: number) => pad.left + (sigma / 3.0) * innerW;
  const yScale = (f1: number) => pad.top + ((0.92 - f1) / 0.32) * innerH;

  const makePath = (key: 'svm' | 'dt' | 'rf') =>
    NOISE_CURVE.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${xScale(pt.sigma).toFixed(1)} ${yScale(pt[key]).toFixed(1)}`).join(' ');

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible" role="img" aria-label="Test F1-Score under sensor noise from 0 to 3 degrees Celsius">
        {[0.60, 0.65, 0.70, 0.75, 0.80, 0.85, 0.90].map((tick) => {
          const y = yScale(tick);
          return (
            <g key={tick}>
              <line x1={pad.left} y1={y} x2={width - pad.right} y2={y} stroke="#E5E7EB" strokeWidth="1" />
              <text x={pad.left - 8} y={y + 4} textAnchor="end" className="fill-[#6B7280] font-mono text-[10px]">
                {tick.toFixed(2)}
              </text>
            </g>
          );
        })}

        {[0.0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0].map((sigma) => {
          const x = xScale(sigma);
          return (
            <g key={sigma}>
              <line x1={x} y1={pad.top} x2={x} y2={height - pad.bottom} stroke="#F3F4F6" strokeWidth="1" />
              <text x={x} y={height - 14} textAnchor="middle" className="fill-[#6B7280] font-mono text-[10px]">
                {sigma.toFixed(1)}°C
              </text>
            </g>
          );
        })}

        <rect
          x={xScale(0)}
          y={pad.top}
          width={xScale(0.5) - xScale(0)}
          height={innerH}
          fill="#0E7490"
          fillOpacity="0.06"
        />

        <path d={makePath('rf')} fill="none" stroke="#B91C1C" strokeWidth="2.2" />
        <path d={makePath('svm')} fill="none" stroke="#1D4ED8" strokeWidth="2.2" />
        <path d={makePath('dt')} fill="none" stroke="#D97706" strokeWidth="2" strokeDasharray="4 3" />

        {NOISE_CURVE.map((pt) => (
          <g key={pt.sigma}>
            <circle cx={xScale(pt.sigma)} cy={yScale(pt.rf)} r="3.2" fill="#B91C1C" />
            <circle cx={xScale(pt.sigma)} cy={yScale(pt.svm)} r="3.2" fill="#1D4ED8" />
            <circle cx={xScale(pt.sigma)} cy={yScale(pt.dt)} r="3" fill="#D97706" />
          </g>
        ))}
      </svg>
      <div className="mt-3 flex flex-wrap items-center gap-6 font-mono text-xs text-[#4B5563]">
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-0.5 w-4 bg-[#B91C1C]" />
          NumPy Random Forest
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-0.5 w-4 bg-[#1D4ED8]" />
          NumPy Linear SVM
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-0.5 w-4 border-t-2 border-dashed border-[#D97706]" />
          NumPy CART Tree
        </span>
      </div>
    </div>
  );
};

export const BenchmarksSection: React.FC = () => {
  const [showCi, setShowCi] = useState(false);
  const [activeTab, setActiveTab] = useState<RobustnessTab>('noise');

  return (
    <section id="benchmarks" className="border-b border-[#E5E7EB] bg-[#FAFAFA] py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <div className="font-mono text-xs font-semibold uppercase tracking-widest text-[#0E7490]">
              04 · Test Scores &amp; Stress Tests
            </div>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#111827] sm:text-3xl [text-wrap:balance]">
              How accurate, fast, and steady our models are under noise.
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#4B5563]">
              Tested once on <span className="font-mono font-semibold text-[#111827]">222</span> unseen frames (<span className="font-mono text-[#111827]">111</span> hotspots, <span className="font-mono text-[#111827]">111</span> normal). Our pure-NumPy SVM and Tree match or beat <span className="font-mono text-[#111827]">scikit-learn</span>, and Random Forest hits <span className="font-mono font-semibold text-[#111827]">90.09%</span> accuracy.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCi((v) => !v)}
            className="rounded-[4px] border border-[#D1D5DB] bg-white px-3.5 py-2 font-mono text-xs font-semibold text-[#111827] hover:border-[#111827] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {showCi ? 'Show Full Model Table' : 'Show 95% Error Margins'}
          </button>
        </div>

        {/* Simple 1-line Glossary for Every Metric */}
        <div className="mt-8 grid grid-cols-1 gap-px bg-[#E5E7EB] border border-[#E5E7EB] sm:grid-cols-2 lg:grid-cols-4">
          {METRIC_GLOSSARY.map((g) => (
            <div key={g.term} className="bg-white p-4">
              <div className="font-mono text-xs font-bold uppercase tracking-wider text-[#0E7490]">
                {g.term}
              </div>
              <p className="mt-1 text-xs leading-relaxed text-[#4B5563]">{g.meaning}</p>
            </div>
          ))}
        </div>

        {/* Verified Locked Test Table OR Bootstrap 95% CI */}
        <div className="mt-4 border border-[#E5E7EB] bg-white p-6">
          {!showCi ? (
            <div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-[#E5E7EB] font-mono text-xs uppercase tracking-wider text-[#6B7280]">
                      <th className="py-3 pr-4 font-medium">Model (222 Test Frames)</th>
                      <th className="py-3 px-3 text-right font-medium">Accuracy</th>
                      <th className="py-3 px-3 text-right font-medium">Precision</th>
                      <th className="py-3 px-3 text-right font-medium">Recall</th>
                      <th className="py-3 px-3 text-right font-medium">F1-Score</th>
                      <th className="py-3 pl-3 text-right font-medium">False Alarms</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB] font-mono tabular-nums">
                    {LOCKED_BENCHMARKS.map((row) => (
                      <tr
                        key={row.model}
                        className={row.family === 'numpy' ? 'bg-[#FAFAFA]' : 'text-[#6B7280]'}
                      >
                        <td className="py-3.5 pr-4 font-sans font-bold text-[#111827]">
                          <div>{row.model}</div>
                          {row.confusion && (
                            <div className="mt-0.5 font-mono text-[11px] font-normal text-[#6B7280]">
                              Confusion Matrix: {row.confusion}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-right font-bold text-[#111827]">
                          {row.accuracy}
                        </td>
                        <td className="py-3.5 px-3 text-right">{row.precision}</td>
                        <td className="py-3.5 px-3 text-right">{row.recall}</td>
                        <td className="py-3.5 px-3 text-right font-bold text-[#0E7490]">
                          {row.f1}
                        </td>
                        <td className="py-3.5 pl-3 text-right">{row.fpr}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 border-t border-[#E5E7EB] pt-3 font-mono text-xs text-[#6B7280]">
                End-to-end single-frame latency (including 0.611 ms feature extraction): CART 0.696 ms · Linear SVM 0.770 ms · Random Forest 0.938 ms (≈ 0.7–0.9 ms, ≈ 1–1.5% of the 62.5 ms budget).
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-sm font-bold text-[#111827]">
                  95% Confidence Ranges (2,000 Bootstrap Resamples on 222 Frames)
                </h3>
                <span className="font-mono text-xs text-[#6B7280]">
                  Because the ranges overlap, small gaps between models are within normal test luck
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-[#E5E7EB] font-mono text-xs uppercase tracking-wider text-[#6B7280]">
                      <th className="py-3 pr-4 font-medium">Pure-NumPy Model</th>
                      <th className="py-3 px-3 text-right font-medium">Test F1</th>
                      <th className="py-3 px-3 text-right font-medium">F1 95% Range</th>
                      <th className="py-3 px-3 text-right font-medium">Recall 95% Range</th>
                      <th className="py-3 pl-3 text-right font-medium">False-Alarm Range</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB] font-mono tabular-nums">
                    {BOOTSTRAP_CI.map((row) => (
                      <tr key={row.model}>
                        <td className="py-3.5 pr-4 font-sans font-bold text-[#111827]">
                          {row.model}
                        </td>
                        <td className="py-3.5 px-3 text-right font-bold text-[#111827]">
                          {row.f1}
                        </td>
                        <td className="py-3.5 px-3 text-right text-[#4B5563]">{row.f1Ci}</td>
                        <td className="py-3.5 px-3 text-right text-[#4B5563]">{row.recCi}</td>
                        <td className="py-3.5 pl-3 text-right text-[#0E7490] font-semibold">
                          {row.fprCi}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Robustness & Generalization Interactive Explorer */}
        <div className="mt-10 border border-[#E5E7EB] bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5E7EB] pb-4">
            <h3 className="text-base font-bold text-[#111827]">
              Stress Tests &amp; Real-World Checks
            </h3>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ['noise', 'Sensor Noise'],
                  ['glitch', 'Bad-Pixel Fix'],
                  ['loro', 'New Session Test'],
                  ['latency', 'Speed vs 16 Hz'],
                ] as Array<[RobustnessTab, string]>
              ).map(([tab, label]) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-[4px] border px-3 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
                    activeTab === tab
                      ? 'border-[#111827] bg-[#111827] text-white'
                      : 'border-[#E5E7EB] bg-[#FAFAFA] text-[#4B5563] hover:border-[#111827] hover:text-[#111827]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'noise' && (
            <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-7">
                <NoiseSvgChart />
              </div>
              <div className="lg:col-span-5 space-y-3 text-sm text-[#4B5563] leading-relaxed">
                <h4 className="text-base font-bold text-[#111827]">
                  Random Sensor Noise (σ = 0.0°C to 3.0°C)
                </h4>
                <p>
                  We added random temperature noise to every pixel in the test frames and checked how well the models still worked without retraining them.
                </p>
                <p>
                  Up to <span className="font-mono font-medium text-[#111827]">0.5°C</span> noise (higher than typical hardware noise), the models still reach <span className="font-mono tabular-nums text-[#111827]">0.78–0.84</span> F1 (Random Forest peaks at <span className="font-mono tabular-nums text-[#111827]">0.898</span> at <span className="font-mono text-[#111827]">0.25°C</span> before dipping slightly below SVM and CART to <span className="font-mono tabular-nums text-[#111827]">0.777</span> at <span className="font-mono text-[#111827]">0.5°C</span>). From <span className="font-mono text-[#111827]">1.0°C</span> upward, scores hit a sharp cliff down to <span className="font-mono tabular-nums text-[#111827]">0.61–0.67</span> F1—near <span className="font-mono tabular-nums text-[#111827]">0.67</span>, noise makes empty frames look hot so models flag almost every frame.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'glitch' && (
            <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
              <div className="lg:col-span-7 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E5E7EB] font-mono uppercase tracking-wider text-[#6B7280]">
                      <th className="py-2 pr-3 font-medium">+6°C Pixels</th>
                      <th className="py-2 px-2 text-right font-medium">Raw SVM</th>
                      <th className="py-2 px-2 text-right font-medium">Raw RF</th>
                      <th className="py-2 px-2 text-right font-medium">3×3 Clean SVM</th>
                      <th className="py-2 pl-2 text-right font-medium">3×3 Clean RF</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB] font-mono tabular-nums">
                    {GLITCH_MITIGATION.map((row) => (
                      <tr key={row.glitches}>
                        <td className="py-2.5 pr-3 font-bold text-[#111827]">{row.glitches}</td>
                        <td className="py-2.5 px-2 text-right text-[#B91C1C] font-semibold">
                          {(row.rawSvm * 100).toFixed(1)}%
                        </td>
                        <td className="py-2.5 px-2 text-right text-[#B91C1C] font-semibold">
                          {(row.rawRf * 100).toFixed(1)}%
                        </td>
                        <td className="py-2.5 px-2 text-right text-[#047857] font-bold">
                          {(row.medSvm * 100).toFixed(1)}%
                        </td>
                        <td className="py-2.5 pl-2 text-right text-[#047857] font-bold">
                          {(row.medRf * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="lg:col-span-5 space-y-3 text-sm text-[#4B5563] leading-relaxed">
                <h4 className="text-base font-bold text-[#111827]">
                  One Dead Pixel Broke Everything—Until We Added a 3×3 Median Filter
                </h4>
                <p>
                  Because features like <span className="font-mono text-[#111827]">max heat</span> look at the single hottest pixel, adding just <strong>one</strong> glitched <span className="font-mono text-[#111827]">+6°C</span> pixel caused a <span className="font-mono tabular-nums text-[#B91C1C] font-semibold">100%</span> false-alarm rate on normal frames.
                </p>
                <p>
                  A real hotspot covers several pixels side by side, while a sensor glitch hits just one pixel. Applying a <span className="font-mono text-[#111827]">3×3</span> median filter keeps real hotspots intact and drops false alarms back down to <span className="font-mono tabular-nums text-[#047857] font-semibold">2.7%</span> (SVM) and <span className="font-mono tabular-nums text-[#047857] font-semibold">3.6%</span> (RF), raising median-filtered RF test F1 to <span className="font-mono tabular-nums text-[#111827] font-semibold">0.900</span>.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'loro' && (
            <div className="mt-6">
              <p className="mb-4 text-sm text-[#4B5563]">
                Here we trained on 4 recordings and tested on the 1 unseen recording left out. It works nearly perfectly on <span className="font-mono text-[#111827]">Lecture</span> (<span className="font-mono tabular-nums text-[#111827]">98.1%–100%</span>), but misses more events on <span className="font-mono text-[#111827]">Lunch_Meeting_3</span> (<span className="font-mono tabular-nums text-[#111827]">~52%–55%</span> recall) and triggers more false alarms on <span className="font-mono text-[#111827]">High_Activity</span> (<span className="font-mono tabular-nums text-[#111827]">~31%</span>).
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E5E7EB] font-mono uppercase tracking-wider text-[#6B7280]">
                      <th className="py-2 pr-3 font-medium">Held-Out Session</th>
                      <th className="py-2 px-2 text-right font-medium">Frames (+1 / −1)</th>
                      <th className="py-2 px-2 text-right font-medium">SVM Acc / Rec / FPR</th>
                      <th className="py-2 px-2 text-right font-medium">Tree Acc / Rec / FPR</th>
                      <th className="py-2 pl-2 text-right font-medium">Forest Acc / Rec / FPR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB] font-mono tabular-nums">
                    {LORO_RESULTS.map((r) => (
                      <tr key={r.recording}>
                        <td className="py-2.5 pr-3 font-bold text-[#111827]">{r.recording}</td>
                        <td className="py-2.5 px-2 text-right text-[#6B7280]">
                          {r.nPos} / {r.nNeg}
                        </td>
                        <td className="py-2.5 px-2 text-right">
                          {r.svmAcc.toFixed(3)} · {r.svmRec.toFixed(3)} · {r.svmFpr.toFixed(3)}
                        </td>
                        <td className="py-2.5 px-2 text-right">
                          {r.dtAcc.toFixed(3)} · {r.dtRec.toFixed(3)} · {r.dtFpr.toFixed(3)}
                        </td>
                        <td className="py-2.5 pl-2 text-right font-bold text-[#0E7490]">
                          {r.rfAcc.toFixed(3)} · {r.rfRec.toFixed(3)} · {r.rfFpr.toFixed(3)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'latency' && (
            <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-7 space-y-4">
                {END_TO_END_LATENCY.map((item) => (
                  <div key={item.model}>
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="font-semibold text-[#111827]">{item.model}</span>
                      <span className="font-mono tabular-nums text-[#6B7280]">
                        <strong className="text-[#111827]">{item.ms.toFixed(3)} ms</strong> ({item.budgetPct.toFixed(2)}% of 62.5 ms)
                      </span>
                    </div>
                    <div className="mt-1.5 h-2.5 w-full bg-[#F3F4F6]">
                      <div
                        className="h-full bg-[#0E7490]"
                        style={{ width: `${Math.min(100, item.budgetPct * 15)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="lg:col-span-5 text-sm text-[#4B5563] leading-relaxed">
                <h4 className="text-base font-bold text-[#111827]">
                  60× Faster Than the 16 FPS Sensor Clock
                </h4>
                <p className="mt-2">
                  The sensor sends one new frame every <span className="font-mono tabular-nums text-[#111827]">62.5 ms</span>. Our entire live path—extracting all 40 features (<span className="font-mono tabular-nums text-[#111827]">≈ 0.6 ms</span>), scaling, and predicting—takes <span className="font-mono tabular-nums text-[#111827] font-semibold">≈ 0.7–0.9 ms</span> (<span className="font-mono tabular-nums text-[#111827]">0.696–0.938 ms</span>, or <span className="font-mono tabular-nums text-[#111827]">≈ 1–1.5%</span> of the budget). Speed is not a bottleneck at all.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
