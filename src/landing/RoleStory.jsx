import React from 'react';
import { getRoleContent } from './roleContent.js';

// Per-role narrative injected INTO the existing landing (Gen UI on the real
// page — not a separate landing). Renders the chosen role's emotional arc:
// problem (their exact pain) → dream (the experience) → mechanism (how).
// This is what makes a landlord's page genuinely different from a tenant's,
// without touching the beloved rotating-word hero. Honest: real pain, no
// fabricated metrics.

const display = "font-['Bricolage_Grotesque_Variable',Inter,sans-serif]";

export default function RoleStory({ profile = 'tenant' }) {
  const rc = getRoleContent(profile);

  return (
    <div data-role-story={profile}>
      {/* ── PROBLEM — name their exact pain ─────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <p
          className="font-['JetBrains_Mono',monospace] text-[11px] tracking-[0.16em] mb-3"
          style={{ color: rc.accent }}
        >
          {rc.label.toUpperCase()}
        </p>
        <h2 className={`${display} text-3xl md:text-4xl font-normal leading-[1.1] tracking-tight text-slate-950`}>
          {rc.problem.heading}
        </h2>
        <div className="mt-7 space-y-4">
          {rc.problem.lines.map((line) => (
            <div key={line} className="flex items-start gap-3">
              <span className="mt-[3px] shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-[#fee2e2] text-[11px] font-bold text-[#dc2626]">
                ✕
              </span>
              <p className="text-base leading-7 text-slate-600 font-light">{line}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── DREAM — the experience on the other side ────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-linear-to-br from-[#0d2e57] to-[#06182f] px-8 py-14 md:px-14 text-center shadow-[0_30px_70px_-45px_rgba(9,34,67,0.65)]">
          <div
            className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full blur-[6rem] opacity-40"
            style={{ background: rc.accent }}
          />
          <h2 className={`${display} relative text-3xl md:text-[2.5rem] font-normal leading-[1.1] tracking-tight text-white`}>
            {rc.dream.heading}
          </h2>
          <p className="relative mx-auto mt-5 max-w-2xl text-base md:text-lg leading-8 font-light text-white/70">
            {rc.dream.sub}
          </p>
        </div>
      </section>

      {/* ── MECHANISM — how it actually works for them ──────────────────── */}
      <section className="max-w-7xl mx-auto px-6 pb-4">
        <div className="grid gap-4 md:grid-cols-3">
          {rc.mechanism.map((step, i) => (
            <div
              key={step}
              className="rounded-4xl border border-white bg-white/72 p-7 shadow-[0_14px_34px_-26px_rgba(15,23,42,0.32)]"
            >
              <span
                className="font-['JetBrains_Mono',monospace] text-3xl"
                style={{ color: rc.accent, opacity: 0.35 }}
              >
                0{i + 1}
              </span>
              <p className="mt-3 text-base font-normal leading-7 text-slate-900">{step}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
