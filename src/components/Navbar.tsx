import React from 'react';

const NAV_LINKS = [
  { href: '#motivation', label: 'Big Picture' },
  { href: '#architecture', label: 'Architecture' },
  { href: '#explorer', label: 'Grid Explorer' },
  { href: '#benchmarks', label: 'Benchmarks' },
  { href: '#applications', label: 'Scaling' },
  { href: '#transparency', label: 'AI Use' },
];

export const Navbar: React.FC = () => {
  return (
    <header className="sticky top-0 z-40 border-b border-[#E5E7EB] bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-8 px-6">
        <a
          href="#"
          className="text-base font-bold tracking-tight text-[#111827] whitespace-nowrap shrink-0"
        >
          HeatSeeker
        </a>

        <nav className="hidden md:flex items-center gap-7" aria-label="Primary">
          {NAV_LINKS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-[#4B5563] transition-colors hover:text-[#111827] whitespace-nowrap shrink-0"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <a
          href="#explorer"
          className="inline-flex items-center justify-center rounded-[4px] bg-[#111827] px-4 py-2 text-xs font-semibold tracking-wide text-white transition-colors hover:bg-[#1F2937] whitespace-nowrap shrink-0"
        >
          Inspect Frames
        </a>
      </div>
    </header>
  );
};
