import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Upload } from 'lucide-react';
import {
  PredictionsPayload,
  ThermalSample,
  applyMedianFilter3x3,
  computeFrameStats,
  computeGridGradient,
  tempToColor,
} from '../data/projectData';

type LabelFilter = 'all' | 'pos' | 'neg' | 'disagree';
type ViewMode = 'absolute' | 'contrast' | 'gradient';

function formatPred(val: 1 | -1) {
  return val === 1 ? '+1 Hotspot' : '−1 Baseline';
}

export const ThermalExplorer: React.FC = () => {
  const [payload, setPayload] = useState<PredictionsPayload | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sourceName, setSourceName] = useState<string>('./predictions.json');

  const [labelFilter, setLabelFilter] = useState<LabelFilter>('all');
  const [recordingFilter, setRecordingFilter] = useState<string>('ALL');
  const [selectedSampleId, setSelectedSampleId] = useState<number>(0);

  const [viewMode, setViewMode] = useState<ViewMode>('absolute');
  const [useMedianFilter, setUseMedianFilter] = useState<boolean>(false);
  const [injectGlitch, setInjectGlitch] = useState<boolean>(false);
  const [hoveredCell, setHoveredCell] = useState<{ r: number; c: number; raw: number; display: number } | null>(null);

  useEffect(() => {
    let active = true;
    fetch('./predictions.json')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<PredictionsPayload>;
      })
      .then((data) => {
        if (!active) return;
        setPayload(data);
        if (data.samples.length > 0) {
          setSelectedSampleId(data.samples[0].id);
        }
      })
      .catch((err: Error) => {
        if (!active) return;
        setLoadError(`Unable to load predictions.json (${err.message}).`);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as PredictionsPayload;
        if (!parsed.samples || !Array.isArray(parsed.samples)) {
          throw new Error('Missing samples array');
        }
        setPayload(parsed);
        setLoadError(null);
        setSourceName(file.name);
        setRecordingFilter('ALL');
        setLabelFilter('all');
        if (parsed.samples.length > 0) {
          setSelectedSampleId(parsed.samples[0].id);
        }
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : 'Invalid JSON format');
      }
    };
    reader.readAsText(file);
  };

  const recordings = useMemo(() => {
    if (!payload) return [];
    return Array.from(new Set(payload.samples.map((s) => s.recording)));
  }, [payload]);

  const filteredSamples = useMemo(() => {
    if (!payload) return [];
    return payload.samples.filter((s) => {
      if (recordingFilter !== 'ALL' && s.recording !== recordingFilter) return false;
      if (labelFilter === 'pos' && s.true_label !== 1) return false;
      if (labelFilter === 'neg' && s.true_label !== -1) return false;
      if (
        labelFilter === 'disagree' &&
        s.svm_pred === s.true_label &&
        s.dt_pred === s.true_label &&
        s.rf_pred === s.true_label
      ) {
        return false;
      }
      return true;
    });
  }, [payload, recordingFilter, labelFilter]);

  const currentSample: ThermalSample | null = useMemo(() => {
    if (filteredSamples.length === 0) return null;
    return filteredSamples.find((s) => s.id === selectedSampleId) ?? filteredSamples[0];
  }, [filteredSamples, selectedSampleId]);

  const currentIdx = useMemo(() => {
    if (!currentSample) return -1;
    return filteredSamples.findIndex((s) => s.id === currentSample.id);
  }, [filteredSamples, currentSample]);

  const processedRawGrid = useMemo(() => {
    if (!currentSample) return null;
    const base = currentSample.grid.map((row) => row.slice());
    if (injectGlitch && base.length > 10 && base[10].length > 15) {
      base[10][15] = Number((base[10][15] + 6.0).toFixed(2));
    }
    return useMedianFilter ? applyMedianFilter3x3(base) : base;
  }, [currentSample, injectGlitch, useMedianFilter]);

  const stats = useMemo(() => {
    if (!processedRawGrid) return null;
    return computeFrameStats(processedRawGrid);
  }, [processedRawGrid]);

  const displayGrid = useMemo(() => {
    if (!processedRawGrid || !stats) return null;
    if (viewMode === 'absolute') return processedRawGrid;
    if (viewMode === 'contrast') {
      return processedRawGrid.map((row) => row.map((v) => v - stats.p25));
    }
    return computeGridGradient(processedRawGrid);
  }, [processedRawGrid, stats, viewMode]);

  const stepSample = (delta: number) => {
    if (filteredSamples.length === 0) return;
    const nextPos = (currentIdx + delta + filteredSamples.length) % filteredSamples.length;
    setSelectedSampleId(filteredSamples[nextPos].id);
  };

  const colorBounds =
    viewMode === 'absolute'
      ? { min: 17.5, max: 33.5, unit: '°C', minLabel: '17.5°C', midLabel: '25.5°C', maxLabel: '33.5°C' }
      : viewMode === 'contrast'
        ? { min: -1.0, max: 10.5, unit: '°C Δ', minLabel: '-1.0°C', midLabel: '+4.8°C', maxLabel: '+10.5°C' }
        : { min: 0.0, max: 4.5, unit: '°C/px', minLabel: '0.0°C/px', midLabel: '2.2°C/px', maxLabel: '4.5°C/px' };

  return (
    <section id="explorer" className="border-b border-[#E5E7EB] bg-white py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <div className="font-mono text-xs font-semibold uppercase tracking-widest text-[#0E7490]">
              03 · Interactive Thermal Grid Explorer
            </div>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#111827] sm:text-3xl [text-wrap:balance]">
              Inspect 24×32 test frames, heat slopes, and model predictions.
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#4B5563]">
              Move your cursor over any square to check its temperature. Switch between raw temperature, self-contrast (<span className="font-mono text-[#111827]">ΔT</span>), and edge steepness (<span className="font-mono text-[#111827]">∇T</span>), or add a fake <span className="font-mono text-[#111827]">+6°C</span> bad pixel and watch the <span className="font-mono text-[#111827]">3×3</span> median filter clean it up.
            </p>
          </div>

          <label className="inline-flex items-center gap-2 rounded-[4px] border border-[#D1D5DB] bg-[#FAFAFA] px-3.5 py-2 text-xs font-medium text-[#111827] hover:border-[#111827] cursor-pointer whitespace-nowrap shrink-0">
            <Upload className="h-3.5 w-3.5 text-[#6B7280]" />
            <span>Load predictions.json</span>
            <input type="file" accept=".json,application/json" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        {/* Filter & Navigation Bar */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border border-[#E5E7EB] bg-[#FAFAFA] p-4">
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                ['all', 'All Frames'],
                ['pos', 'Hotspots (+1)'],
                ['neg', 'Baseline (−1)'],
                ['disagree', 'Wrong Calls'],
              ] as Array<[LabelFilter, string]>
            ).map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => setLabelFilter(val)}
                className={`rounded-[4px] border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  labelFilter === val
                    ? 'border-[#111827] bg-[#111827] text-white'
                    : 'border-[#E5E7EB] bg-white text-[#4B5563] hover:border-[#111827] hover:text-[#111827]'
                }`}
              >
                {label}
              </button>
            ))}

            <select
              aria-label="Filter by recording"
              value={recordingFilter}
              onChange={(e) => setRecordingFilter(e.target.value)}
              className="rounded-[4px] border border-[#E5E7EB] bg-white px-3 py-1.5 font-mono text-xs text-[#111827] focus:border-[#111827] focus:outline-none"
            >
              <option value="ALL">All Recordings ({payload?.samples.length ?? 0})</option>
              {recordings.map((rec) => (
                <option key={rec} value={rec}>
                  {rec}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs tabular-nums text-[#6B7280] mr-1">
              {filteredSamples.length > 0 ? `${currentIdx + 1} / ${filteredSamples.length}` : '0 / 0'}
            </span>
            <button
              type="button"
              onClick={() => stepSample(-1)}
              disabled={filteredSamples.length === 0}
              aria-label="Previous frame"
              className="rounded-[4px] border border-[#E5E7EB] bg-white p-1.5 text-[#111827] hover:border-[#111827] disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => stepSample(1)}
              disabled={filteredSamples.length === 0}
              aria-label="Next frame"
              className="rounded-[4px] border border-[#E5E7EB] bg-white p-1.5 text-[#111827] hover:border-[#111827] disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {loadError && (
          <div className="mt-6 border border-[#DC2626]/30 bg-[#FEF2F2] p-4 text-sm text-[#991B1B]">
            {loadError}
          </div>
        )}

        {!payload && !loadError && (
          <div className="mt-6 border border-[#E5E7EB] bg-[#FAFAFA] p-12 text-center font-mono text-xs text-[#6B7280]">
            Loading thermal frames from {sourceName}...
          </div>
        )}

        {currentSample && displayGrid && processedRawGrid && stats && (
          <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Left: Interactive 24x32 Heatmap Canvas */}
            <div className="lg:col-span-7 border border-[#E5E7EB] bg-[#FAFAFA] p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="font-mono text-[#111827]">
                  Frame <span className="font-semibold">#{currentSample.id}</span> ·{' '}
                  <span className="text-[#6B7280]">{currentSample.recording}</span>
                </div>
                <div className="font-mono tabular-nums text-[#6B7280]">
                  {hoveredCell
                    ? `[row ${String(hoveredCell.r).padStart(2, '0')}, col ${String(hoveredCell.c).padStart(2, '0')}] · ${hoveredCell.raw.toFixed(2)}°C (${hoveredCell.display.toFixed(2)} ${colorBounds.unit})`
                    : 'Hover any pixel for °C reading'}
                </div>
              </div>

              <div
                className="grid border border-[#E5E7EB] bg-[#18181B] p-0.5 cursor-crosshair select-none"
                style={{ gridTemplateColumns: 'repeat(32, minmax(0, 1fr))' }}
                onMouseLeave={() => setHoveredCell(null)}
              >
                {displayGrid.map((row, r) =>
                  row.map((val, c) => {
                    const isGlitchTarget = injectGlitch && r === 10 && c === 15;
                    return (
                      <div
                        key={`${r}-${c}`}
                        onMouseEnter={() =>
                          setHoveredCell({
                            r,
                            c,
                            raw: processedRawGrid[r][c],
                            display: val,
                          })
                        }
                        className={`aspect-square w-full transition-transform hover:scale-125 hover:z-10 hover:ring-1 hover:ring-white ${
                          isGlitchTarget ? 'ring-1 ring-white' : ''
                        }`}
                        style={{
                          backgroundColor: tempToColor(val, colorBounds.min, colorBounds.max),
                        }}
                      />
                    );
                  })
                )}
              </div>

              {/* Colour Legend */}
              <div className="mt-4">
                <div
                  className="h-2 w-full"
                  style={{
                    background:
                      'linear-gradient(90deg, #1D4ED8 0%, #0891B2 32%, #EAB308 58%, #EA580C 80%, #DC2626 100%)',
                  }}
                />
                <div className="mt-1.5 flex justify-between font-mono text-[11px] tabular-nums text-[#6B7280]">
                  <span>{colorBounds.minLabel}</span>
                  <span>{colorBounds.midLabel}</span>
                  <span>{colorBounds.maxLabel}</span>
                </div>
              </div>

              {/* Interactive Physics & Noise Controls */}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#E5E7EB] pt-4">
                <div className="flex flex-wrap items-center gap-1.5">
                  {(
                    [
                      ['absolute', 'Temp (°C)'],
                      ['contrast', 'Contrast (ΔT)'],
                      ['gradient', 'Edge Slope (∇T)'],
                    ] as Array<[ViewMode, string]>
                  ).map(([m, label]) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setViewMode(m)}
                      className={`rounded-[4px] border px-2.5 py-1 text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer ${
                        viewMode === m
                          ? 'border-[#0E7490] bg-[#0E7490] text-white'
                          : 'border-[#E5E7EB] bg-white text-[#4B5563] hover:text-[#111827]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setInjectGlitch((v) => !v)}
                    className={`rounded-[4px] border px-2.5 py-1 font-mono text-xs whitespace-nowrap shrink-0 cursor-pointer ${
                      injectGlitch
                        ? 'border-[#B91C1C] bg-[#FEF2F2] text-[#B91C1C]'
                        : 'border-[#E5E7EB] bg-white text-[#4B5563] hover:text-[#111827]'
                    }`}
                  >
                    {injectGlitch ? '✕ +6°C Bad Pixel On' : '+ Add Bad Pixel'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseMedianFilter((v) => !v)}
                    className={`rounded-[4px] border px-2.5 py-1 font-mono text-xs whitespace-nowrap shrink-0 cursor-pointer ${
                      useMedianFilter
                        ? 'border-[#0E7490] bg-[#ECFEFF] text-[#0E7490]'
                        : 'border-[#E5E7EB] bg-white text-[#4B5563] hover:text-[#111827]'
                    }`}
                  >
                    {useMedianFilter ? '✓ 3×3 Median On' : '3×3 Median Off'}
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Ground Truth vs Pure-NumPy Model Verdicts & Live Physics */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-6">
              <div className="border border-[#E5E7EB] bg-[#FAFAFA] p-6">
                <div className="flex items-baseline justify-between border-b border-[#E5E7EB] pb-4">
                  <span className="font-mono text-xs uppercase tracking-wider text-[#6B7280]">
                    True Label
                  </span>
                  <span
                    className={`font-mono text-sm font-bold ${
                      currentSample.true_label === 1 ? 'text-[#B91C1C]' : 'text-[#1D4ED8]'
                    }`}
                  >
                    {formatPred(currentSample.true_label)}
                  </span>
                </div>

                <div className="mt-4 divide-y divide-[#E5E7EB]">
                  {[
                    { name: 'NumPy Linear SVM', pred: currentSample.svm_pred, acc: '86.94%' },
                    { name: 'NumPy CART Tree', pred: currentSample.dt_pred, acc: '86.94%' },
                    { name: 'NumPy Random Forest', pred: currentSample.rf_pred, acc: '90.09%' },
                  ].map((m) => {
                    const match = m.pred === currentSample.true_label;
                    return (
                      <div key={m.name} className="flex items-center justify-between py-3 text-sm">
                        <div>
                          <div className="font-semibold text-[#111827]">{m.name}</div>
                          <div className="font-mono text-[11px] tabular-nums text-[#6B7280]">
                            Test accuracy: {m.acc}
                          </div>
                        </div>
                        <div className="text-right font-mono">
                          <div className="text-xs font-semibold text-[#111827]">
                            {formatPred(m.pred)}
                          </div>
                          <div
                            className={`text-[11px] font-medium ${
                              match ? 'text-[#047857]' : 'text-[#B91C1C]'
                            }`}
                          >
                            {match ? '✓ Match' : '✕ Wrong'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Computed Frame Numbers */}
              <div className="border border-[#E5E7EB] bg-white p-6">
                <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7280] font-mono">
                    Frame Heat Numbers
                  </span>
                  <span className="font-mono text-[11px] text-[#6B7280]">
                    {useMedianFilter ? 'Median-Cleaned' : 'Raw Grid'}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-[#6B7280]">Peak Temperature</div>
                    <div className="mt-0.5 font-mono text-xl font-bold tabular-nums text-[#111827]">
                      {stats.max.toFixed(2)}
                      <span className="ml-1 text-xs font-normal text-[#6B7280]">°C</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[#6B7280]">Peak Self-Contrast</div>
                    <div className="mt-0.5 font-mono text-xl font-bold tabular-nums text-[#111827]">
                      +{stats.maxContrast.toFixed(2)}
                      <span className="ml-1 text-xs font-normal text-[#6B7280]">°C</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[#6B7280]">Steepest Edge Slope</div>
                    <div className="mt-0.5 font-mono text-xl font-bold tabular-nums text-[#111827]">
                      {stats.maxGrad.toFixed(2)}
                      <span className="ml-1 text-xs font-normal text-[#6B7280]">°C/px</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[#6B7280]">Pixels &gt; +3.0°C Cool</div>
                    <div className="mt-0.5 font-mono text-xl font-bold tabular-nums text-[#111827]">
                      {stats.hotContrastPct.toFixed(1)}
                      <span className="ml-1 text-xs font-normal text-[#6B7280]">%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Sample Strip */}
              <div className="border border-[#E5E7EB] bg-[#FAFAFA] p-4">
                <div className="mb-2 flex items-center justify-between font-mono text-[11px] text-[#6B7280]">
                  <span>PICK A FRAME</span>
                  <span className="tabular-nums">Source: {sourceName}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {filteredSamples.map((s) => {
                    const isSel = s.id === currentSample.id;
                    const hasErr =
                      s.svm_pred !== s.true_label ||
                      s.dt_pred !== s.true_label ||
                      s.rf_pred !== s.true_label;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSelectedSampleId(s.id)}
                        title={`${s.recording} · True ${s.true_label}`}
                        className={`rounded-[3px] border px-2 py-1 font-mono text-[11px] tabular-nums cursor-pointer ${
                          isSel
                            ? 'border-[#111827] bg-[#111827] text-white'
                            : hasErr
                              ? 'border-[#D97706]/50 bg-[#FFFBEB] text-[#92400E] hover:border-[#111827]'
                              : 'border-[#E5E7EB] bg-white text-[#4B5563] hover:border-[#111827]'
                        }`}
                      >
                        #{s.id}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
