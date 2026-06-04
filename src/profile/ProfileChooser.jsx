import React from 'react';
import { motion } from 'framer-motion';
import { PROFILE_ORDER, PROFILES } from './profiles';

// Full-screen branded gate: land → pick who you are → get a profile-specific
// landing. Shown when no profile is chosen yet.
export default function ProfileChooser({ onSelect }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-[#0d2e57] to-[#06182f] font-['Inter',sans-serif] text-white">
      {/* ambient brand glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-[#52a832]/15 blur-[80px]" />
        <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-[#2670a8]/18 blur-[80px]" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-16">
        <img
          src="/images/renteazy-main-logo-transparent-nav.png"
          alt="RentEazy"
          className="mb-10 h-10 w-auto object-contain brightness-0 invert"
        />

        <p className="font-['JetBrains_Mono',monospace] text-xs tracking-[0.16em] text-[#9bd383]">FIRST — WHO ARE YOU?</p>
        <h1 className="mt-4 text-center font-['Bricolage_Grotesque_Variable',Inter,sans-serif] text-4xl font-normal leading-[1.05] tracking-tight md:text-5xl">
          Pick your side of the match.
        </h1>
        <p className="mt-4 max-w-xl text-center text-base font-light leading-7 text-white/60">
          RentEazy tailors everything — the matches, the swipe deck, the whole page — to you. Choose one to begin.
        </p>

        <div className="mt-10 grid w-full gap-4 sm:grid-cols-3">
          {PROFILE_ORDER.map((key, i) => {
            const p = PROFILES[key];
            return (
              <motion.button
                key={key}
                type="button"
                onClick={() => onSelect(key)}
                className="group relative flex flex-col items-start rounded-4xl border border-white/12 bg-white/[0.05] p-6 text-left backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.09]"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
              >
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-2xl border"
                  style={{ backgroundColor: p.iconBg, borderColor: p.iconBorder }}
                >
                  <iconify-icon icon={p.icon} style={{ color: p.accent }} class="text-2xl"></iconify-icon>
                </span>
                <h2 className="mt-5 text-lg font-medium text-white">{p.label}</h2>
                <p className="mt-2 text-sm font-light leading-6 text-white/55">{p.blurb}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[#9bd383]">
                  Get my RentEazy
                  <iconify-icon icon="solar:arrow-right-linear" class="text-base transition-transform group-hover:translate-x-0.5"></iconify-icon>
                </span>
              </motion.button>
            );
          })}
        </div>

        <p className="mt-8 text-xs font-light text-white/35">You can switch anytime. Free to start — no card required.</p>
      </div>
    </div>
  );
}
