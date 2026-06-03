import { useEffect, useRef, useState } from 'react';
import { getLandingSpec } from './landingSpec.js';

// Lightweight, runtime-only signal capture → LandingSpec. No network, no LLM.
// Captures: scroll_depth, dwell_time, cta_hover, hero_interaction,
// feature_section_view, exit_intent. Context: device, hour, city (coarse,
// no GPS prompt), referral. Spec stays stable within a session and only
// recomputes when a signal crosses a meaningful threshold.

const RETURNING_KEY = 'renteazy-visited';
const PREV_SCROLL_KEY = 'renteazy-prev-scroll';
const LAST_SECTION_KEY = 'renteazy-last-section';

function readContext() {
  if (typeof window === 'undefined') return {};
  const ua = navigator.userAgent || '';
  const device = /Mobi|Android|iPhone/i.test(ua) ? 'mobile' : /iPad|Tablet/i.test(ua) ? 'tablet' : 'desktop';
  let city;
  try {
    // Coarse, permission-free region hint from the timezone (e.g. Europe/London).
    city = (Intl.DateTimeFormat().resolvedOptions().timeZone || '').split('/').pop()?.replace(/_/g, ' ');
  } catch (_) {}
  let referral;
  try { referral = document.referrer ? new URL(document.referrer).hostname : undefined; } catch (_) {}
  return { device, hour: new Date().getHours(), city, referral };
}

function buildSession(signals, context, profile) {
  let isReturning = false;
  let prevScrollDepth = 0;
  let lastInteractedSection;
  try {
    isReturning = window.localStorage.getItem(RETURNING_KEY) === '1';
    prevScrollDepth = parseFloat(window.localStorage.getItem(PREV_SCROLL_KEY) || '0') || 0;
    lastInteractedSection = window.localStorage.getItem(LAST_SECTION_KEY) || undefined;
  } catch (_) {}
  return { isReturning, prevScrollDepth, lastInteractedSection, profile, signals, context };
}

/**
 * @param {string|null} profile  the chosen role (inferred intent), optional
 * @returns {object} the live LandingSpec
 */
export function useLandingSpec(profile = null) {
  const signals = useRef({ scroll_depth: 0, dwell_time: 0, cta_hover: false, hero_interaction: false, feature_section_view: false, exit_intent: false });
  const context = useRef(typeof window === 'undefined' ? {} : readContext());
  const [spec, setSpec] = useState(() => getLandingSpec(buildSession(signals.current, context.current, profile)));
  const recomputed = useRef(false);

  // Recompute the spec from current signals (called only on threshold crossings).
  const recompute = useRef(() => {
    setSpec(getLandingSpec(buildSession(signals.current, context.current, profile)));
  });
  recompute.current = () => setSpec(getLandingSpec(buildSession(signals.current, context.current, profile)));

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const start = Date.now();
    let lastScrollBucket = 0;

    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const depth = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      if (depth > signals.current.scroll_depth) signals.current.scroll_depth = depth;
      signals.current.dwell_time = (Date.now() - start) / 1000;
      // recompute only when scroll crosses a 25% bucket boundary (stability)
      const bucket = Math.floor(depth * 4);
      if (bucket > lastScrollBucket) { lastScrollBucket = bucket; recompute.current(); }
    };

    const onCtaOver = (e) => {
      if (e.target?.closest?.('[data-cta]') && !signals.current.cta_hover) {
        signals.current.cta_hover = true;
        recompute.current();
      }
    };

    const onHeroInteract = (e) => {
      if (e.target?.closest?.('[data-hero]')) signals.current.hero_interaction = true;
    };

    const onExit = (e) => {
      if (e.clientY <= 0 && !signals.current.exit_intent) {
        signals.current.exit_intent = true;
        recompute.current();
      }
    };

    // feature_section_view via IntersectionObserver on [data-section]
    const io = new IntersectionObserver((entries) => {
      let changed = false;
      for (const en of entries) {
        if (en.isIntersecting) {
          signals.current.feature_section_view = true;
          const key = en.target.getAttribute('data-section');
          if (key) { try { window.localStorage.setItem(LAST_SECTION_KEY, key); } catch (_) {} }
          changed = true;
        }
      }
      if (changed && !recomputed.current) { recomputed.current = true; }
    }, { threshold: 0.6 });
    document.querySelectorAll('[data-section]').forEach((el) => io.observe(el));

    const persist = () => {
      try {
        window.localStorage.setItem(RETURNING_KEY, '1');
        window.localStorage.setItem(PREV_SCROLL_KEY, String(signals.current.scroll_depth));
      } catch (_) {}
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('mouseover', onCtaOver, { passive: true });
    window.addEventListener('pointerdown', onHeroInteract, { passive: true });
    document.addEventListener('mouseout', onExit);
    window.addEventListener('pagehide', persist);
    window.addEventListener('beforeunload', persist);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('mouseover', onCtaOver);
      window.removeEventListener('pointerdown', onHeroInteract);
      document.removeEventListener('mouseout', onExit);
      window.removeEventListener('pagehide', persist);
      window.removeEventListener('beforeunload', persist);
      io.disconnect();
      persist();
    };
  }, [profile]);

  return spec;
}
