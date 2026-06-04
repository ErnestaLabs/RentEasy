import React from 'react';
import { getRoleContent } from './roleContent.js';
import { getProfile } from '@/profile/profiles';

// Per-role narrative injected INTO the existing landing (Gen UI on the real
// page — NOT touching the rotating-word hero or the demo). Sequence follows the
// VoC brief: pain (their words) → enemy (their distrust, named) → relief/mechanic
// → objection handling → CTA. One audience, one promise per render.
// Honest: real pain language; no fabricated metrics; no unbacked compliance claims.

const display = "font-['Bricolage_Grotesque_Variable',Inter,sans-serif]";

export default function RoleStory({ profile = 'tenant' }) {
  const rc = getRoleContent(profile);
  const peep = getProfile(profile).peep;

  return (
    <div data-role-story={profile}>
      {/* ── 1 · PAIN — mirror it in their own words ─────────────────────── */}
      <section className="max-w-3xl mx-auto px-6 pt-16 pb-10">
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

      {/* ── 2 · ENEMY — name what they already distrust ─────────────────── */}
      {rc.enemy && (
        <section className="max-w-3xl mx-auto px-6 pb-12">
          <div className="rounded-3xl border border-[#f3d2d2] bg-[#fdf4f4] p-7 md:p-9">
            <p className="font-['JetBrains_Mono',monospace] text-[10px] tracking-[0.18em] text-[#b91c1c]">
              THE PART NO ONE FIXES
            </p>
            <h3 className={`${display} mt-2 text-2xl md:text-[1.7rem] font-normal leading-[1.15] tracking-tight text-slate-950`}>
              {rc.enemy.heading}
            </h3>
            <p className="mt-3 text-base leading-7 font-light text-slate-600">{rc.enemy.line}</p>
          </div>
        </section>
      )}

      {/* ── 3 · RELIEF / MECHANIC — the dream, with the matched person ──── */}
      <section className="max-w-5xl mx-auto px-6 pb-12">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-linear-to-br from-[#0d2e57] to-[#06182f] px-8 py-14 md:px-14 shadow-[0_30px_70px_-45px_rgba(9,34,67,0.65)]">
          <div
            className="pointer-events-none absolute -top-24 right-10 h-72 w-72 rounded-full blur-[6rem] opacity-45"
            style={{ background: rc.accent }}
          />
          <div className="relative flex flex-col items-center gap-8 md:flex-row md:items-end md:text-left">
            <div className="md:flex-1 text-center md:text-left">
              <h2 className={`${display} text-3xl md:text-[2.5rem] font-normal leading-[1.1] tracking-tight text-white`}>
                {rc.dream.heading}
              </h2>
              <p className="mt-5 max-w-xl text-base md:text-lg leading-8 font-light text-white/70">
                {rc.dream.sub}
              </p>
            </div>
            {peep && (
              <img
                src={peep}
                alt=""
                aria-hidden="true"
                className="h-52 w-auto shrink-0 object-contain object-bottom md:h-64 [filter:brightness(0)_invert(1)]"
              />
            )}
          </div>
        </div>
      </section>

      {/* ── 4 · HOW IT WORKS — the match mechanic, stepwise ─────────────── */}
      <section className="max-w-7xl mx-auto px-6 pb-12">
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

      {/* ── 4.5 · PROFILE PREVIEW — how reputation reads, on the real avatar
           system. Honest: a product preview with sample data, NOT testimonials,
           NO invented ratings. Shows the proof a member adds → what you see. ── */}
      {rc.proofCards && (
        <section className="max-w-7xl mx-auto px-6 pb-12">
          <div className="max-w-3xl">
            <p className="font-['JetBrains_Mono',monospace] text-[11px] tracking-[0.16em]" style={{ color: rc.accent }}>
              WHAT A PROFILE LOOKS LIKE
            </p>
            <h2 className={`${display} mt-2 text-3xl md:text-4xl font-normal leading-[1.1] tracking-tight text-slate-950`}>
              {rc.proofCards.heading}
            </h2>
            <p className="mt-3 text-base font-light leading-7 text-slate-600">{rc.proofCards.sub}</p>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {rc.proofCards.cards.map((c) => (
              <div key={c.name} className="overflow-hidden rounded-4xl border border-white bg-white shadow-[0_18px_44px_-30px_rgba(15,23,42,0.4)]">
                <div className="flex items-center gap-4 px-5 pt-5">
                  <span
                    className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full"
                    style={{ backgroundColor: `${rc.accent}14`, boxShadow: `inset 0 0 0 2px ${rc.accent}33` }}
                  >
                    <img src={`/open-peeps/bust/peep-${c.avatar}.png`} alt="" aria-hidden="true" className="h-[88%] w-[88%] object-contain object-bottom" loading="lazy" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-slate-900">{c.name}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{c.role}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5 px-5 pb-5">
                  {c.chips.map((chip) => (
                    <span key={chip} className="inline-flex items-center gap-1 rounded-full border border-[#d5ecd7] bg-[#f1f9f1] px-2.5 py-1 text-[11px] font-medium text-[#2f7d32]">
                      <span style={{ color: rc.accent }}>✓</span>{chip}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 font-['JetBrains_Mono',monospace] text-[10px] tracking-[0.12em] text-slate-400">PROFILE PREVIEW · REPUTATION IS EARNED BY ADDING PROOF — NEVER GIVEN</p>
        </section>
      )}

      {/* ── 5 · OBJECTION — handle the reflex doubt ─────────────────────── */}
      {rc.objection && (
        <section className="max-w-3xl mx-auto px-6 pb-12">
          <div className="rounded-3xl border border-white bg-white/82 p-7 md:p-9 shadow-[0_14px_34px_-26px_rgba(15,23,42,0.32)]">
            <p className={`${display} text-xl md:text-2xl font-normal tracking-tight text-slate-900`}>
              {rc.objection.q}
            </p>
            <p className="mt-3 text-base leading-7 font-light text-slate-600">{rc.objection.a}</p>
          </div>
        </section>
      )}

      {/* ── 6 · CTA — single action, their promise ──────────────────────── */}
      <section className="max-w-3xl mx-auto px-6 pb-16 text-center">
        <a
          href={rc.ctaHref}
          className="inline-flex items-center gap-2 rounded-full border border-[#25672a] bg-linear-to-b from-[#52a832] to-[#2f7d32] px-8 py-4 text-base font-medium text-white shadow-[0_12px_28px_rgba(47,125,50,0.3)]"
        >
          {rc.cta}
        </a>
        <p className="mt-3 font-['JetBrains_Mono',monospace] text-[10px] tracking-[0.14em] text-slate-400">
          FREE TO START · NO CARD REQUIRED
        </p>
      </section>
    </div>
  );
}
