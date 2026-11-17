import React, { useMemo } from 'react';
import { ArrowDownRight } from 'lucide-react';
import { tempToColor } from '../data/projectData';

function generatePreviewGrid(hasHotspot: boolean): number[][] {
  const rows = 24;
  const cols = 32;
  const grid: number[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: number[] = [];
    for (let c = 0; c < cols; c++) {
      const edgeCool = -1.4 * ((r - 11.5) / 12) ** 2 - 1.0 * ((c - 15.5) / 16) ** 2;
      let val = 21.5 + edgeCool;
      if (hasHotspot) {
        const blob = 9.8 * Math.exp(-0.5 * (((r - 11.5) / 2.7) ** 2 + ((c - 16.5) / 3.0) ** 2));
        const halo = 2.4 * Math.exp(-0.5 * (((r - 12.2) / 4.4) ** 2 + ((c - 16.5) / 5.0) ** 2));
        val += blob + halo;
      }
      row.push(Number(val.toFixed(2)));
    }
    grid.push(row);
  }
  return grid;
}

const MiniThermalCanvas: React.FC<{ grid: number[][]; caption: string; sub: string; hot?: boolean }> = ({
  grid,
  caption,
  sub,
  hot,
}) => {
  return (
    <div>
      <div
        className="grid border border-[#E5E7EB] bg-[#18181B] p-0.5"
        style={{ gridTemplateColumns: 'repeat(32, minmax(0, 1fr))' }}
        aria-label={caption}
      >
        {grid.map((row, rIdx) =>
          row.map((temp, cIdx) => (
            <div
              key={`${rIdx}-${cIdx}`}
              className="aspect-square w-full"
              style={{ backgroundColor: tempToColor(temp, 17.5, 33.5) }}
            />
          ))
        )}
      </div>
      <div className="mt-2.5 flex items-baseline justify-between gap-2 text-xs">
        <span className={`font-semibold ${hot ? 'text-[#B91C1C]' : 'text-[#1D4ED8]'}`}>
          {caption}
        </span>
        <span className="font-mono tabular-nums text-[#6B7280]">{sub}</span>
      </div>
    </div>
  );
};

export const HeroSection: React.FC = () => {
  const baselinePreview = useMemo(() => generatePreviewGrid(false), []);
  const hotspotPreview = useMemo(() => generatePreviewGrid(true), []);

  return (
    <section className="border-b border-[#E5E7EB] bg-[#FAFAFA] pt-14 pb-16 md:pt-20 md:pb-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <p className="font-mono text-xs font-semibold uppercase tracking-widest text-[#0E7490]">
              ES 335 Machine Learning · Pure-NumPy Thermal Hotspot Detection
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-[#111827] sm:text-5xl leading-[1.08] [text-wrap:balance]">
              Spot real heat hotspots in low-res thermal grids under 1 ms.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#4B5563] sm:text-lg">
              Finding a small warm spot on a coarse <span className="font-mono font-medium text-[#111827]">24×32</span> heat grid is a shared problem across future target domains like{' '}
              <span className="text-[#111827] font-semibold">medical tumour checks</span>,{' '}
              <span className="text-[#111827] font-semibold">missile and target tracking</span>, and{' '}
              <span className="text-[#111827] font-semibold">early machine fault alerts</span>. We built Linear SVM, Decision Tree, Random Forest, and Lasso completely from scratch in NumPy—and tested them on the labelled BU TIDOS thermal benchmark.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#explorer"
                className="inline-flex items-center gap-2 rounded-[4px] bg-[#111827] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1F2937] whitespace-nowrap shrink-0"
              >
                Open Thermal Grid Explorer
                <ArrowDownRight className="h-4 w-4" />
              </a>
              <a
                href="#architecture"
                className="inline-flex items-center rounded-[4px] border border-[#D1D5DB] bg-white px-5 py-3 text-sm font-semibold text-[#111827] transition-colors hover:border-[#111827] whitespace-nowrap shrink-0"
              >
                See Our NumPy Code
              </a>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="border border-[#E5E7EB] bg-white p-5">
              <div className="mb-3 flex items-center justify-between text-xs font-mono text-[#6B7280]">
                <span>24×32 INFRARED SENSOR VIEW</span>
                <span className="tabular-nums text-[#0E7490] font-medium">768 PIXELS · 16 FPS</span>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <MiniThermalCanvas
                  grid={baselinePreview}
                  caption="Normal Frame (−1)"
                  sub="21.5°C peak"
                />
                <MiniThermalCanvas
                  grid={hotspotPreview}
                  caption="Heat Hotspot (+1)"
                  sub="33.7°C peak"
                  hot
                />
              </div>
              <div className="mt-4 pt-3 border-t border-[#F3F4F6]">
                <div
                  className="h-2 w-full"
                  style={{
                    background:
                      'linear-gradient(90deg, #1D4ED8 0%, #0891B2 32%, #EAB308 58%, #EA580C 80%, #DC2626 100%)',
                  }}
                />
                <div className="mt-1.5 flex justify-between font-mono text-[11px] tabular-nums text-[#6B7280]">
                  <span>17.5°C Cool</span>
                  <span>25.5°C Warm</span>
                  <span>33.5°C Hotspot</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Unboxed 4-column Key Metrics Strip */}
        <div className="mt-14 grid grid-cols-2 gap-8 border-t border-[#E5E7EB] pt-8 md:grid-cols-4">
          <div>
            <div className="font-mono text-xs uppercase tracking-wider text-[#6B7280]">
              NumPy Random Forest
            </div>
            <div className="mt-1.5 font-mono text-3xl font-bold tabular-nums text-[#111827]">
              90.09%
            </div>
            <div className="mt-1 text-xs text-[#4B5563] tabular-nums">
              Test accuracy (222 unseen frames)
            </div>
          </div>

          <div>
            <div className="font-mono text-xs uppercase tracking-wider text-[#6B7280]">
              NumPy Linear SVM
            </div>
            <div className="mt-1.5 font-mono text-3xl font-bold tabular-nums text-[#0E7490]">
              97.67%
            </div>
            <div className="mt-1 text-xs text-[#4B5563] tabular-nums">
              Precision · 86.94% acc · 0.770 ms end-to-end
            </div>
          </div>

          <div>
            <div className="font-mono text-xs uppercase tracking-wider text-[#6B7280]">
              False-Alarm Rate
            </div>
            <div className="mt-1.5 font-mono text-3xl font-bold tabular-nums text-[#111827]">
              1.80%
            </div>
            <div className="mt-1 text-xs text-[#4B5563] tabular-nums">
              Only 2 false alarms in 111 normal frames
            </div>
          </div>

          <div>
            <div className="font-mono text-xs uppercase tracking-wider text-[#6B7280]">
              Full Pipeline Speed
            </div>
            <div className="mt-1.5 font-mono text-3xl font-bold tabular-nums text-[#111827]">
              ≈ 0.7–0.9<span className="ml-1 text-base font-normal text-[#6B7280]">ms</span>
            </div>
            <div className="mt-1 text-xs text-[#4B5563] tabular-nums">
              ≈ 1–1.5% of the 62.5 ms budget (features ≈ 0.6 ms)
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
