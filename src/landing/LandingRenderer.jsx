import React from 'react';

// Renders a personalised landing PURELY from a LandingSpec. No layout decisions
// live in here beyond mapping spec.sectionOrder → section components. All content
// is honest: urgency maps only to real levers (launch pricing / East-London
// early-mover); social proof never shows fabricated live counts.

const display = "font-['Bricolage_Grotesque_Variable',Inter,sans-serif]";

function UrgencyBanner({ style }) {
  if (style === 'none') return null;
  const strong = style === 'strong';
  return (
    <div className={`mb-5 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 ${strong ? 'border-[#52a832]/40 bg-[#52a832]/15' : 'border-[#fef08a] bg-[#fef9c3]'}`}>
      <span className="relative flex h-2 w-2">
        <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${strong ? 'bg-[#9bd383]' : 'bg-[#ca8a04]'} opacity-60`} />
        <span className={`relative inline-flex h-2 w-2 rounded-full ${strong ? 'bg-[#9bd383]' : 'bg-[#ca8a04]'}`} />
      </span>
      <span className={`font-['JetBrains_Mono',monospace] text-[10px] tracking-[0.12em] ${strong ? 'text-[#9bd383]' : 'text-[#854d0e]'}`}>
        {strong ? 'LIVE IN EAST LONDON · BE EARLY' : 'LAUNCH PRICING · LOCKED IN FOR EARLY MEMBERS'}
      </span>
    </div>
  );
}

const SECTION_REGISTRY = {
  hero: (spec) => (
    <section data-section="hero" data-hero key="hero" className="mx-auto max-w-5xl px-6 pt-16 pb-12 text-center">
      <UrgencyBanner style={spec.urgencyStyle} />
      <h1 className={`${display} text-4xl font-normal leading-[1.05] tracking-tight text-slate-950 md:text-6xl`}>{spec.headline}</h1>
      <p className="mx-auto mt-5 max-w-2xl text-base font-light leading-8 text-slate-600 md:text-lg">{spec.subheadline}</p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <a data-cta href="/signup?source=genui_hero" className="inline-flex items-center gap-2 rounded-full border border-[#25672a] bg-linear-to-b from-[#52a832] to-[#2f7d32] px-7 py-3.5 text-sm font-medium text-white shadow-[0_12px_28px_rgba(47,125,50,0.3)]">{spec.ctaPrimary}</a>
        <a href="#how_it_works" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm text-slate-700">{spec.ctaSecondary}</a>
      </div>
    </section>
  ),

  how_it_works: () => (
    <section data-section="how_it_works" id="how_it_works" key="how_it_works" className="mx-auto max-w-7xl px-6 py-12">
      <h2 className={`${display} mb-8 text-3xl font-normal tracking-tight text-slate-950 md:text-4xl`}>From brief to match in four steps.</h2>
      <div className="grid gap-4 md:grid-cols-4">
        {[['Create your profile', 'Budget, areas, move date — 2 minutes.'], ['Post or browse', 'List a property or scroll the free Feed.'], ['Swipe your deck', 'Scored cards only. Like what fits.'], ['Match & view', 'Both sides like → viewing flow begins.']].map(([t, d], i) => (
          <div key={t} className="rounded-4xl border border-white bg-white/72 p-6 shadow-[0_14px_34px_-26px_rgba(15,23,42,0.32)]">
            <span className="font-['JetBrains_Mono',monospace] text-3xl text-slate-200">0{i + 1}</span>
            <h3 className="mt-3 text-lg font-normal text-slate-950">{t}</h3>
            <p className="mt-2 text-sm font-light leading-6 text-slate-600">{d}</p>
          </div>
        ))}
      </div>
    </section>
  ),

  featured_listings_preview: () => (
    <section data-section="featured_listings_preview" key="featured_listings_preview" className="mx-auto max-w-7xl px-6 py-12">
      <h2 className={`${display} mb-8 text-3xl font-normal tracking-tight text-slate-950 md:text-4xl`}>Scored matches, not endless listings.</h2>
      <div className="grid gap-5 md:grid-cols-3">
        {[['/images/match-flat.jpg', 'Stratford 1-bed', '£1,650 pcm', 88], ['/images/match-room.jpg', 'Canary Wharf room', '£940 pcm', 91], ['/images/match-flat-2.jpg', 'Wembley studio', '£1,390 pcm', 84]].map(([img, title, price, score]) => (
          <div key={title} className="overflow-hidden rounded-4xl border border-white bg-[#06182f] shadow-[0_18px_44px_-32px_rgba(15,23,42,0.55)]">
            <div className="relative h-44">
              <img src={img} alt={title} className="h-full w-full object-cover" loading="lazy" />
              <span className="absolute left-3 top-3 rounded-full bg-white/92 px-2.5 py-1 text-xs font-bold text-[#092243]">{score}% match</span>
            </div>
            <div className="p-4 text-white"><p className="text-base">{title}</p><p className="mt-1 text-sm text-white/60">{price}</p></div>
          </div>
        ))}
      </div>
    </section>
  ),

  trust_and_safety: () => (
    <section data-section="trust_and_safety" key="trust_and_safety" className="mx-auto max-w-7xl px-6 py-12">
      <div className="rounded-[2.5rem] border border-[#cde7f8] bg-[#edf7ff] p-8 md:p-12">
        <h2 className={`${display} text-3xl font-normal tracking-tight text-slate-950 md:text-4xl`}>Reputation behind every offer.</h2>
        <p className="mt-4 max-w-xl text-base font-light leading-7 text-slate-600">See who you’re dealing with before anyone wastes a viewing. Reputation is shown behind every agent and landlord — and it travels with you, move to move.</p>
      </div>
    </section>
  ),

  social_proof: (spec) => {
    if (spec.socialProofBlock === 'none') return null;
    if (spec.socialProofBlock === 'testimonials') {
      return (
        <section data-section="social_proof" key="social_proof" className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid gap-5 md:grid-cols-3">
            {[['Found a Stratford 1-bed in four days. First time the search worked for me.', 'Amelia R. · Tenant'], ['Viewing-ready tenants in our deck within 48 hours.', 'James K. · Letting agent'], ['Matched a tenant directly — no agency fee.', 'Sam P. · Landlord']].map(([q, who]) => (
              <div key={who} className="rounded-4xl border border-white bg-white/86 p-6 shadow-[0_14px_34px_-26px_rgba(15,23,42,0.32)]">
                <p className="text-sm font-light leading-7 text-slate-700">“{q}”</p>
                <p className="mt-4 text-xs text-slate-400">{who}</p>
              </div>
            ))}
          </div>
        </section>
      );
    }
    // 'stats' → REAL platform facts only (no fabricated live counts)
    return (
      <section data-section="social_proof" key="social_proof" className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-2 gap-6 rounded-4xl border border-white/8 bg-linear-to-br from-[#0d2e57] to-[#06182f] px-6 py-9 lg:grid-cols-4">
          {[['9', 'Match types'], ['18', 'Ways to post'], ['10', 'Roles welcome'], ['£0', 'To get started']].map(([n, l]) => (
            <div key={l} className="text-center">
              <p className={`${display} text-4xl text-[#9bd383] md:text-5xl`}>{n}</p>
              <p className="mt-2 text-sm font-medium text-white/90">{l}</p>
            </div>
          ))}
        </div>
      </section>
    );
  },

  pricing_or_value: () => (
    <section data-section="pricing_or_value" key="pricing_or_value" className="mx-auto max-w-7xl px-6 py-12 text-center">
      <h2 className={`${display} text-3xl font-normal tracking-tight text-slate-950 md:text-4xl`}>Start free. Upgrade when you want more matches.</h2>
      <p className="mx-auto mt-4 max-w-xl text-base font-light leading-7 text-slate-600">Free to post, free to swipe, free to match. Individuals pay per profile; teams pay per seat — only when you want more reach.</p>
    </section>
  ),

  final_cta: (spec) => (
    <section data-section="final_cta" key="final_cta" className="mx-auto max-w-7xl px-6 pb-20 pt-8">
      <div className="rounded-[2.75rem] border border-[#06182f] bg-linear-to-b from-[#0c376b] to-[#06182f] px-6 py-20 text-center text-white">
        <h2 className={`${display} text-3xl font-normal tracking-tight md:text-5xl`}>Find your match. Or let your match find you.</h2>
        <a data-cta href="/signup?source=genui_final" className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#74c656]/30 bg-linear-to-b from-[#52a832] to-[#2f7d32] px-8 py-4 text-base font-medium text-white shadow-[0_12px_32px_rgba(82,168,50,0.36)]">{spec.ctaPrimary}</a>
        <p className="mt-4 text-xs text-white/40">No card required · Free to post & swipe</p>
      </div>
    </section>
  ),
};

/** Renders the personalised landing from a LandingSpec. */
export default function LandingRenderer({ spec }) {
  if (!spec || !Array.isArray(spec.sectionOrder)) return null;
  return (
    <div className="bg-[#f5f8fb] font-['Inter',sans-serif] text-slate-900 antialiased">
      {spec.sectionOrder.map((key) => {
        const render = SECTION_REGISTRY[key];
        return render ? render(spec) : null;
      })}
    </div>
  );
}
