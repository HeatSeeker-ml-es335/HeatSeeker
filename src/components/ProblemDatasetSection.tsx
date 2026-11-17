import React from 'react';
import { RECORDING_AUDIT } from '../data/projectData';

const TARGET_DOMAINS = [
  {
    tag: 'Healthcare · Untested Future Goal',
    domain: 'Medical Tumour Checks',
    detail: 'Early tumours and inflamed tissue often run warmer than nearby skin. In future medical tools (not tested here), fast hotspot spotting could flag warm zones on low-cost thermal scans.',
  },
  {
    tag: 'Defence · Untested Future Goal',
    domain: 'Missile & Target Tracking',
    detail: 'Rocket exhaust and fast aircraft appear as small, bright heat spots against a cooler sky. Fast maths could help future trackers lock on within milliseconds.',
  },
  {
    tag: 'Industry · Untested Future Goal',
    domain: 'Machine & Battery Safety',
    detail: 'Spotting a single overheating battery cell, circuit chip, or power transformer early could prevent fires long before damage spreads.',
  },
];

export const ProblemDatasetSection: React.FC = () => {
  return (
    <section id="motivation" className="border-b border-[#E5E7EB] bg-white py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-6">
        {/* Top Row: Bigger Picture + Why BU TIDOS */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="font-mono text-xs font-semibold uppercase tracking-widest text-[#0E7490]">
              01 · Why We Built This &amp; Dataset Choice
            </div>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#111827] sm:text-3xl [text-wrap:balance]">
              The goal is hotspot tracking. The doorway dataset is just our test track.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[#4B5563] sm:text-base">
              In healthcare, defence, and engineering, the core problem is the same: find a small, unusually warm spot inside a blurry <span className="font-mono font-medium text-[#111827]">24×32</span> heat grid before it is too late.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[#4B5563]">
              Public thermal datasets for tumours or missiles with clean frame-by-frame labels are hard to find. That is why we used the{' '}
              <span className="text-[#111827] font-semibold">Boston University TIDOS</span> dataset: it gives us real 16 Hz thermal grids with manual <span className="font-mono text-[#111827]">.mat</span> people-count annotations. People walking through a doorway act as clear, measurable heat blobs so we can test our NumPy code fairly.
            </p>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 gap-px bg-[#E5E7EB] border border-[#E5E7EB] sm:grid-cols-3 self-start">
            {TARGET_DOMAINS.map((item) => (
              <div key={item.domain} className="bg-[#FAFAFA] p-5">
                <div className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#0E7490]">
                  {item.tag}
                </div>
                <h3 className="mt-2 text-sm font-bold text-[#111827]">{item.domain}</h3>
                <p className="mt-2 text-xs leading-relaxed text-[#4B5563]">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Middle Row: Visual Overhead Camera Labelling Diagram */}
        <div className="mt-14 border-t border-[#E5E7EB] pt-12">
          <div className="max-w-3xl">
            <h3 className="text-lg font-bold text-[#111827]">
              How Each Frame Was Labelled (+1 vs −1)
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-[#4B5563]">
              The TIDOS dataset logs how many people are inside a room—not directly whether someone is standing under the doorway camera at a given instant. To build a clean answer key for training and testing, we identify doorway crossings from the ground-truth count changes:
            </p>
          </div>

          {/* Inline SVG Overhead Thermal Sequence */}
          <div className="mt-6 overflow-x-auto border border-[#E5E7EB] bg-white p-4 sm:p-6">
            <svg
              viewBox="0 0 920 214"
              className="w-full min-w-[720px] h-auto select-none"
              role="img"
              aria-label="Overhead 24x32 thermal camera sequence showing Empty Room (-1), a 4-second clear gap, 5 Doorway Crossing frames (Entering, Moving In, Center, Crosses Line, Exiting), another 4-second clear gap, and Empty Room (-1)"
            >
              <defs>
                <radialGradient id="coolFloorGrad" cx="50%" cy="50%" r="70%">
                  <stop offset="0%" stopColor="#2563EB" />
                  <stop offset="100%" stopColor="#1E3A8A" />
                </radialGradient>
                <radialGradient id="hotBlobGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FEF08A" />
                  <stop offset="35%" stopColor="#F97316" />
                  <stop offset="72%" stopColor="#B91C1C" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#B91C1C" stopOpacity="0" />
                </radialGradient>
                <pattern id="gridPattern" width="8.5" height="8.5" patternUnits="userSpaceOnUse">
                  <path
                    d="M 8.5 0 L 0 0 0 8.5"
                    fill="none"
                    stroke="#93C5FD"
                    strokeWidth="0.4"
                    strokeOpacity="0.22"
                  />
                </pattern>
              </defs>

              {/* Left: Empty (-1) */}
              <text
                x="52"
                y="56"
                textAnchor="middle"
                className="fill-[#2563EB] font-mono text-[10.5px] font-bold"
              >
                Empty (−1)
              </text>
              <rect
                x="18"
                y="68"
                width="68"
                height="51"
                rx="2"
                fill="url(#coolFloorGrad)"
                stroke="#2563EB"
                strokeWidth="1.5"
              />
              <rect x="18" y="68" width="68" height="51" rx="2" fill="url(#gridPattern)" />
              <text
                x="52"
                y="136"
                textAnchor="middle"
                className="fill-[#111827] font-mono text-[10px] font-semibold"
              >
                Empty Room
              </text>
              <text
                x="52"
                y="149"
                textAnchor="middle"
                className="fill-[#6B7280] font-mono text-[9px]"
              >
                0 people
              </text>

              {/* Left 4s clear gap */}
              <line
                x1="96"
                y1="93.5"
                x2="176"
                y2="93.5"
                stroke="#9CA3AF"
                strokeWidth="1.2"
                strokeDasharray="3 3"
              />
              <text
                x="136"
                y="84"
                textAnchor="middle"
                className="fill-[#6B7280] font-mono text-[9.5px] font-semibold"
              >
                4s clear gap
              </text>
              <text
                x="136"
                y="107"
                textAnchor="middle"
                className="fill-[#6B7280] font-mono text-[9px]"
              >
                (64 frames skipped)
              </text>

              {/* Center Group: Doorway Crossing · 5 Frames (0.31 s) */}
              <rect
                x="186"
                y="22"
                width="548"
                height="148"
                rx="4"
                fill="#FEF2F2"
                fillOpacity="0.45"
                stroke="#B91C1C"
                strokeOpacity="0.35"
                strokeWidth="1"
              />
              <text
                x="204"
                y="42"
                textAnchor="start"
                className="fill-[#B91C1C] font-mono text-[10.5px] font-bold"
              >
                Doorway Crossing · 5 Frames (0.31 s)
              </text>

              {/* Highlighted tripwire badge */}
              <rect
                x="491"
                y="29"
                width="168"
                height="18"
                rx="2"
                fill="#B91C1C"
              />
              <text
                x="575"
                y="41"
                textAnchor="middle"
                className="fill-white font-mono text-[9.5px] font-bold"
              >
                Room Count Changes (0 → 1)
              </text>

              {/* 5 Overhead Frames */}
              {[
                { x: 214, cx: 227, label: 'Entering', isCross: false },
                { x: 320, cx: 344, label: 'Moving In', isCross: false },
                { x: 426, cx: 460, label: 'Center', isCross: false },
                { x: 532, cx: 575, label: 'Crosses Line', isCross: true },
                { x: 638, cx: 693, label: 'Exiting', isCross: false },
              ].map((f, idx) => (
                <g key={f.label}>
                  {idx < 4 && (
                    <path
                      d={`M ${f.x + 76} 93.5 L ${f.x + 96} 93.5 M ${f.x + 92} 90 L ${f.x + 96} 93.5 L ${f.x + 92} 97`}
                      fill="none"
                      stroke="#B91C1C"
                      strokeOpacity="0.45"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}

                  <rect
                    x={f.x}
                    y="68"
                    width="68"
                    height="51"
                    rx="2"
                    fill="url(#coolFloorGrad)"
                    stroke={f.isCross ? '#B91C1C' : '#991B1B'}
                    strokeWidth={f.isCross ? '2' : '1'}
                    strokeOpacity={f.isCross ? '1' : '0.45'}
                  />
                  <rect x={f.x} y="68" width="68" height="51" rx="2" fill="url(#gridPattern)" />

                  <circle cx={f.cx} cy="93.5" r="14" fill="url(#hotBlobGrad)" />
                  <circle cx={f.cx} cy="93.5" r="5" fill="#F97316" />
                  <circle cx={f.cx} cy="93.5" r="2.2" fill="#FEF08A" />

                  {f.isCross && (
                    <line
                      x1="575"
                      y1="50"
                      x2="575"
                      y2="127"
                      stroke="#B91C1C"
                      strokeWidth="1.5"
                      strokeDasharray="3 2.5"
                    />
                  )}

                  <text
                    x={f.x + 34}
                    y="142"
                    textAnchor="middle"
                    className={`font-mono text-[10.5px] font-bold ${
                      f.isCross ? 'fill-[#B91C1C]' : 'fill-[#111827]'
                    }`}
                  >
                    {f.label}
                  </text>
                </g>
              ))}

              {/* Right 4s clear gap */}
              <line
                x1="744"
                y1="93.5"
                x2="824"
                y2="93.5"
                stroke="#9CA3AF"
                strokeWidth="1.2"
                strokeDasharray="3 3"
              />
              <text
                x="784"
                y="84"
                textAnchor="middle"
                className="fill-[#6B7280] font-mono text-[9.5px] font-semibold"
              >
                4s clear gap
              </text>
              <text
                x="784"
                y="107"
                textAnchor="middle"
                className="fill-[#6B7280] font-mono text-[9px]"
              >
                (64 frames skipped)
              </text>

              {/* Right: Empty (-1) */}
              <text
                x="868"
                y="56"
                textAnchor="middle"
                className="fill-[#2563EB] font-mono text-[10.5px] font-bold"
              >
                Empty (−1)
              </text>
              <rect
                x="834"
                y="68"
                width="68"
                height="51"
                rx="2"
                fill="url(#coolFloorGrad)"
                stroke="#2563EB"
                strokeWidth="1.5"
              />
              <rect x="834" y="68" width="68" height="51" rx="2" fill="url(#gridPattern)" />
              <text
                x="868"
                y="136"
                textAnchor="middle"
                className="fill-[#111827] font-mono text-[10px] font-semibold"
              >
                Empty Room
              </text>
              <text
                x="868"
                y="149"
                textAnchor="middle"
                className="fill-[#6B7280] font-mono text-[9px]"
              >
                0 people
              </text>

              {/* Bottom caption */}
              <text
                x="460"
                y="198"
                textAnchor="middle"
                className="fill-[#6B7280] font-mono text-[10px]"
              >
                Right after exiting, the person leaves the camera view—so only 1 frame is kept after the room count changes.
              </text>
            </svg>
          </div>

          {/* One-line Training Answer Key Callout */}
          <div className="mt-4 border border-[#E5E7EB] bg-[#FAFAFA] px-5 py-3.5 text-sm leading-relaxed text-[#4B5563]">
            <strong className="text-[#111827]">Training Answer Key Only:</strong> The room-count log is only used offline to label our training and test frames (685 crossings, 822 empty frames). Once deployed, the model never needs a logbook—it classifies{' '}
            <strong className="text-[#111827]">a single 24×32 thermal snapshot</strong> on its own in{' '}
            <strong className="text-[#111827]">0.0046–0.0487 ms</strong> for the classifier step (and{' '}
            <strong className="text-[#111827]">0.696–0.938 ms</strong> full end-to-end including{' '}
            <span className="font-mono text-[#111827]">0.611 ms</span> feature extraction).
          </div>
        </div>

        {/* Bottom Row: Zero-Leakage Split & Recording Audit */}
        <div className="mt-12 grid grid-cols-1 gap-10 border-t border-[#E5E7EB] pt-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h3 className="text-base font-bold text-[#111827]">
              Fair Split Without Cheating (5-Second Blocks)
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#4B5563]">
              At 16 frames per second, adjacent frames look almost identical. Mixing them between Train and Test would inflate scores falsely. Instead, we grouped frames into 5-second blocks (80 frames each) using{' '}
              <span className="font-mono text-[#111827]">GroupShuffleSplit</span> (<span className="font-mono tabular-nums text-[#111827]">70% / 15% / 15%</span>) and excluded{' '}
              <span className="font-mono text-[#111827]">Edge_Cases</span> from <span className="font-mono text-[#111827]">−1</span> because people linger in the doorway while the log still reads zero.
            </p>
          </div>

          <div className="lg:col-span-7">
            <div className="border border-[#E5E7EB] bg-[#FAFAFA] p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-[#E5E7EB] pb-4">
                <div>
                  <h3 className="text-sm font-bold text-[#111827]">
                    BU TIDOS Sensor 1 — All 6 Recordings
                  </h3>
                  <p className="mt-0.5 text-xs text-[#4B5563]">
                    1,507 labelled frames · 17.45°C – 34.02°C · 0 missing pixels · 21.47°C average floor
                  </p>
                </div>
                <div className="font-mono text-xs font-semibold tabular-nums text-[#0E7490]">
                  1,055 Train · 230 Val · 222 Test
                </div>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E5E7EB] font-mono uppercase tracking-wider text-[#6B7280]">
                      <th className="py-2.5 pr-3 font-medium">Recording</th>
                      <th className="py-2.5 px-2 text-right font-medium">Normal (−1)</th>
                      <th className="py-2.5 px-2 text-right font-medium">Hotspot (+1)</th>
                      <th className="py-2.5 px-2 text-right font-medium">Train</th>
                      <th className="py-2.5 px-2 text-right font-medium">Val</th>
                      <th className="py-2.5 pl-2 text-right font-medium">Test</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB] font-mono tabular-nums">
                    {RECORDING_AUDIT.map((rec) => (
                      <tr key={rec.name} className="hover:bg-white transition-colors">
                        <td className="py-3 pr-3 font-sans">
                          <div className="font-semibold text-[#111827] font-mono">{rec.name}</div>
                          <div className="text-[11px] text-[#6B7280] mt-0.5">{rec.note}</div>
                        </td>
                        <td className="py-3 px-2 text-right text-[#4B5563]">{rec.empty}</td>
                        <td className="py-3 px-2 text-right text-[#111827] font-semibold">{rec.crossing}</td>
                        <td className="py-3 px-2 text-right text-[#4B5563]">{rec.train}</td>
                        <td className="py-3 px-2 text-right text-[#4B5563]">{rec.val}</td>
                        <td className="py-3 pl-2 text-right text-[#0E7490] font-bold">{rec.test}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-[#111827] font-mono text-xs font-bold tabular-nums text-[#111827]">
                      <td className="py-3 pr-3">Total (1,507 frames)</td>
                      <td className="py-3 px-2 text-right">822</td>
                      <td className="py-3 px-2 text-right">685</td>
                      <td className="py-3 px-2 text-right">1,055</td>
                      <td className="py-3 px-2 text-right">230</td>
                      <td className="py-3 pl-2 text-right">222</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <p className="mt-4 text-xs leading-relaxed text-[#6B7280] border-t border-[#E5E7EB] pt-3">
                Note: we kept every 4th empty frame (up to 1.2× the hotspot count) so both classes stayed balanced (~45% hotspot / ~55% normal). In real 24/7 use, hotspots happen far less often.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
