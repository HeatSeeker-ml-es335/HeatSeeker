import React from 'react';
import { ExternalLink } from 'lucide-react';

export const ApplicationsFooterSection: React.FC = () => {
  return (
    <>
      <section id="applications" className="border-b border-[#E5E7EB] bg-white py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-3xl">
            <div className="font-mono text-xs font-semibold uppercase tracking-widest text-[#0E7490]">
              05 · Untested Future Directions &amp; Scaling
            </div>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#111827] sm:text-3xl [text-wrap:balance]">
              Scaling Beyond Doorways: From Smart Rooms to Industry, Medical &amp; Aerospace
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#4B5563]">
              The same basic idea—spotting unusual heat patches quickly on small thermal grids—applies to other fields too, though moving beyond doorways requires a few real upgrades.
            </p>
          </div>

          {/* Three Target Application Domains */}
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="border border-[#E5E7EB] bg-[#FAFAFA] p-6">
              <div className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#0E7490]">
                Industrial · Future Use
              </div>
              <h3 className="mt-2 text-base font-bold text-[#111827]">
                Industrial Fault Checks
              </h3>
              <p className="mt-2.5 text-xs leading-relaxed text-[#4B5563]">
                <strong className="text-[#111827]">What it does:</strong> Spots overheating motors, power panels, circuit boards, or solar cells early before hardware fails.
              </p>
              <p className="mt-2 text-xs leading-relaxed text-[#4B5563]">
                <strong className="text-[#111827]">How our idea fits:</strong> Just like a warm person stands out on a cool floor, an overheating part creates a sharp local heat spike against cooler surroundings.
              </p>
            </div>

            <div className="border border-[#E5E7EB] bg-[#FAFAFA] p-6">
              <div className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#0E7490]">
                Medical · Future Use
              </div>
              <h3 className="mt-2 text-base font-bold text-[#111827]">
                Medical Thermal Checks
              </h3>
              <p className="mt-2.5 text-xs leading-relaxed text-[#4B5563]">
                <strong className="text-[#111827]">What it does:</strong> Screens for unusual warm patches on the body—such as localised inflammation, fever spots, or surface tissue/tumour heat differences—without contact or regular cameras.
              </p>
              <p className="mt-2 text-xs leading-relaxed text-[#4B5563]">
                <strong className="text-[#111827]">How our idea fits:</strong> Compares local warm spots against surrounding baseline temperature while keeping patient privacy intact.
              </p>
            </div>

            <div className="border border-[#E5E7EB] bg-[#FAFAFA] p-6">
              <div className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#0E7490]">
                Aerospace · Future Use
              </div>
              <h3 className="mt-2 text-base font-bold text-[#111827]">
                Drone &amp; Target Detection
              </h3>
              <p className="mt-2.5 text-xs leading-relaxed text-[#4B5563]">
                <strong className="text-[#111827]">What it does:</strong> Flags warm vehicles, engines, or heat plumes on small, low-power onboard chips.
              </p>
              <p className="mt-2 text-xs leading-relaxed text-[#4B5563]">
                <strong className="text-[#111827]">How our idea fits:</strong> Simple maths rules run in under a millisecond (<span className="font-mono text-[#111827]">0.0046–0.0487 ms</span> model time; <span className="font-mono text-[#111827]">0.696–0.938 ms</span> full pipeline), acting as a fast early alert before heavier trackers kick in.
              </p>
            </div>
          </div>

          {/* Why Scaling Isn't 1-to-1 + Honest Limits */}
          <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Why Scaling Isn't 1-to-1 */}
            <div className="lg:col-span-7 border border-[#E5E7EB] bg-white p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[#E5E7EB] pb-3">
                <h3 className="text-base font-bold text-[#111827]">
                  Why Scaling Isn’t 1-to-1
                </h3>
                <span className="font-mono text-[11px] text-[#6B7280]">
                  Upgrades needed beyond doorways
                </span>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="border border-[#E5E7EB] bg-[#FAFAFA] p-4">
                  <div className="font-mono text-xs font-bold text-[#111827]">
                    1. Moving Cameras Need Moving Baselines
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#4B5563]">
                    Our model compares against a fixed empty floor (<span className="font-mono text-[#111827]">T_bg</span>). Moving drones or handheld cameras see changing scenery, so the background must update continuously.
                  </p>
                </div>

                <div className="border border-[#E5E7EB] bg-[#FAFAFA] p-4">
                  <div className="font-mono text-xs font-bold text-[#111827]">
                    2. Tiny Targets Need Sharper Sensors
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#4B5563]">
                    A person fills ~30 pixels on our <span className="font-mono text-[#111827]">24×32</span> grid. Tiny circuit faults or distant targets need sharper cameras (<span className="font-mono text-[#111827]">160×120+</span>) so small hotspots don’t blur away.
                  </p>
                </div>

                <div className="border border-[#E5E7EB] bg-[#FAFAFA] p-4">
                  <div className="font-mono text-xs font-bold text-[#111827]">
                    3. Single Frame vs. Tracking Motion
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#4B5563]">
                    Our model judges one isolated snapshot at a time. Counting people or following moving targets requires linking detections across consecutive frames.
                  </p>
                </div>

                <div className="border border-[#E5E7EB] bg-[#FAFAFA] p-4">
                  <div className="font-mono text-xs font-bold text-[#111827]">
                    4. New Settings Need New Training Data
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#4B5563]">
                    Doorway weights can’t simply be copied into a hospital or factory—each environment has its own normal heat clutter (sunlight, heaters, engines).
                  </p>
                </div>
              </div>
            </div>

            {/* Honest Limits */}
            <div className="lg:col-span-5 border border-[#E5E7EB] bg-[#FAFAFA] p-6">
              <div className="font-mono text-xs font-semibold uppercase tracking-widest text-[#6B7280]">
                Honest Limits
              </div>
              <h3 className="mt-1.5 text-base font-bold text-[#111827]">
                What Our Tests Actually Prove
              </h3>

              <ul className="mt-4 space-y-3 text-xs leading-relaxed text-[#4B5563]">
                <li className="border-t border-[#E5E7EB] pt-3">
                  <strong className="text-[#111827]">Indoor Doorways Only:</strong> All test numbers come from BU TIDOS indoor doorway videos; industrial, medical, and aerial uses are untested future extensions.
                </li>
                <li className="border-t border-[#E5E7EB] pt-3">
                  <strong className="text-[#111827]">One Room Setup:</strong> Tested on <span className="font-mono text-[#111827]">1,507</span> frames from one classroom sensor; moving to an unseen room can dip accuracy without fresh calibration.
                </li>
                <li className="border-t border-[#E5E7EB] pt-3">
                  <strong className="text-[#111827]">Balanced Test Split:</strong> Tested on a ~45/55 split of hotspots and empty frames. In a real hallway that stays empty 95% of the time, keeping false alarms low (like Linear SVM’s <span className="font-mono text-[#111827]">1.80%</span>) matters even more.
                </li>
                <li className="border-t border-[#E5E7EB] pt-3">
                  <strong className="text-[#111827]">Saved Floor Map (<span className="font-mono text-[#111827]">T_bg</span>):</strong> <span className="font-mono text-[#111827]">36 of 40</span> features use the saved empty-floor map; only the 4 self-contrast features work without it.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Section 06: AI Use & Academic Transparency */}
      <section id="transparency" className="border-b border-[#E5E7EB] bg-[#FAFAFA] py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-3xl">
            <div className="font-mono text-xs font-semibold uppercase tracking-widest text-[#0E7490]">
              06 · AI Use &amp; Academic Transparency
            </div>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#111827] sm:text-3xl">
              AI Use &amp; Workflow Transparency
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#4B5563]">
              We used AI tools as coding and design aids throughout this project, while all core modelling choices, dataset validation, experiments, and final checks were run and reviewed by our team in Jupyter (<span className="font-mono text-[#111827]">ES335_TIDOS_Project.ipynb</span>).
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="border border-[#E5E7EB] bg-white p-6">
              <div className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#0E7490]">
                01 · Core Algorithms
              </div>
              <h3 className="mt-1.5 text-sm font-bold text-[#111827]">
                Custom NumPy Implementations
              </h3>
              <p className="mt-3 text-xs leading-relaxed text-[#4B5563]">
                <strong className="text-[#111827]">How AI helped:</strong> Assisted with writing and debugging clean, function-based NumPy code for our Linear SVM, CART Decision Tree, and Random Forest, as well as organising our 40 thermal features.
              </p>
              <p className="mt-2.5 border-t border-[#F3F4F6] pt-2.5 text-xs leading-relaxed text-[#4B5563]">
                <strong className="text-[#111827]">Our role:</strong> We chose to build these models from scratch in NumPy (without using <span className="font-mono text-[#111827]">scikit-learn</span> for core training) to keep the maths transparent and lightweight, then compared them against standard <span className="font-mono text-[#111827]">scikit-learn</span> baselines (<span className="font-mono text-[#111827]">90.09%</span> NumPy RF vs <span className="font-mono text-[#111827]">90.09%</span> sklearn RF).
              </p>
            </div>

            <div className="border border-[#E5E7EB] bg-white p-6">
              <div className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#0E7490]">
                02 · Data &amp; Evaluation
              </div>
              <h3 className="mt-1.5 text-sm font-bold text-[#111827]">
                TIDOS Loader &amp; Error Checks
              </h3>
              <p className="mt-3 text-xs leading-relaxed text-[#4B5563]">
                <strong className="text-[#111827]">How AI helped:</strong> Helped put together the TIDOS <span className="font-mono text-[#111827]">.json</span> + <span className="font-mono text-[#111827]">.mat</span> data loader, group-based 5-second block splitting (<span className="font-mono text-[#111827]">GroupShuffleSplit</span>), and error-inspection plots.
              </p>
              <p className="mt-2.5 border-t border-[#F3F4F6] pt-2.5 text-xs leading-relaxed text-[#4B5563]">
                <strong className="text-[#111827]">Our role:</strong> We reviewed the thermal error plots ourselves, noticed doorway loitering (<span className="font-mono text-[#111827]">Edge_Cases</span>) and crossing-edge mismatches, and adjusted the <span className="font-mono text-[#111827]">.mat</span> ground-truth timing window so the labels stayed fair and leak-free.
              </p>
            </div>

            <div className="border border-[#E5E7EB] bg-white p-6">
              <div className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#0E7490]">
                03 · Web Interface
              </div>
              <h3 className="mt-1.5 text-sm font-bold text-[#111827]">
                Interactive Page Generation
              </h3>
              <p className="mt-3 text-xs leading-relaxed text-[#4B5563]">
                <strong className="text-[#111827]">How AI helped:</strong> Generated the interactive web page, diagrams, and the <span className="font-mono text-[#111827]">24×32</span> thermal frame explorer directly from our Jupyter notebook structure and exported <span className="font-mono text-[#111827]">predictions.json</span> file.
              </p>
              <p className="mt-2.5 border-t border-[#F3F4F6] pt-2.5 text-xs leading-relaxed text-[#4B5563]">
                <strong className="text-[#111827]">Our role:</strong> We reviewed all text, visual explanations, and restrictions to ensure every chart and test score (<span className="font-mono text-[#111827]">86.94%</span> SVM, <span className="font-mono text-[#111827]">86.94%</span> CART, <span className="font-mono text-[#111827]">90.09%</span> RF, and <span className="font-mono text-[#111827]">0.696–0.938 ms</span> end-to-end latency) reflects our actual notebook runs (<span className="font-mono text-[#111827]">n = 222</span>).
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#F3F4F6] py-12 text-[#4B5563]">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-base font-bold tracking-tight text-[#111827]">
                HeatSeeker
              </div>
              <p className="mt-1.5 text-sm text-[#4B5563]">
                ES 335 Machine Learning Project ·{' '}
                <span className="text-[#111827] font-semibold">Dhruv Anil Gupta</span>{' '}
                <span className="font-mono text-xs tabular-nums">(24110108)</span> &amp;{' '}
                <span className="text-[#111827] font-semibold">Bhoomi Anurag Agrawal</span>{' '}
                <span className="font-mono text-xs tabular-nums">(24110073)</span>
              </p>
            </div>

            <div className="text-sm text-[#4B5563] md:text-right">
              <div>
                Dataset credit:{' '}
                <a
                  href="https://vip.bu.edu/projects/vsns/cossy/datasets/tidos/download/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-[#111827] underline decoration-[#D1D5DB] underline-offset-4 hover:decoration-[#0E7490]"
                >
                  Boston University TIDOS Dataset (BU VIP / COSSY Lab)
                  <ExternalLink className="h-3.5 w-3.5 text-[#0E7490]" />
                </a>
              </div>
              <div className="mt-1.5 text-xs text-[#6B7280]">
                Cokbas, Ishwar &amp; Konrad, “Low-resolution overhead thermal tripwire for occupancy estimation,”{' '}
                <span className="italic">CVPR PBVS Workshop</span>, 2020 (arXiv:2004.05685) · Non-commercial use.
              </div>
              <div className="mt-1 font-mono text-xs text-[#6B7280]">
                Pure-NumPy ML · Static GitHub Pages Build
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};
