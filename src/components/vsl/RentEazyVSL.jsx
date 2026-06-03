/**
 * RentEazyVSL — 7-act cinematic VSL composition.
 *
 * Duration: 60 s × 30 fps = 1800 frames.
 * Acts:
 *   Act 1 INTERRUPT    0–180f   (0–6s)    hard cut, word-by-word hook
 *   Act 2 IDENTIFY   180–390f   (6–13s)   staccato pain cards
 *   Act 3 AGITATE    390–630f   (13–21s)  spring, slow-burn cost lines
 *   Act 4 BRIDGE     630–840f   (21–28s)  spring, light-break tone shift
 *   Act 5 REVEAL     840–1110f  (28–37s)  cinematic ease, before/after wipe
 *   Act 6 PROOF     1110–1440f  (37–48s)  real platform facts — NO invented numbers
 *   Act 7 CLOSE     1440–1800f  (48–60s)  identity frame + free CTA + consequence
 *
 * Parameterised via inputProps.userType ('tenant' | 'landlord' | 'investor' | 'agent').
 * Default: 'tenant'.
 */

import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Easing,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import CONTENT, { PLATFORM_FACTS, PLATFORM_FEATURES, BEFORE_AFTER } from './vsl-content.js';

// ─── Brand palette ────────────────────────────────────────────────────────────
const C = {
  navy:      '#06182f',
  navyMid:   '#092243',
  navyLight: '#0d2e57',
  green:     '#52a832',
  greenDark: '#2f7d32',
  greenPale: '#9bd383',
  blue:      '#2670a8',
  bluePale:  '#5bc4ff',
  white:     '#ffffff',
};

// ─── Fonts ───────────────────────────────────────────────────────────────────
const FONT = {
  display: "'Bricolage Grotesque Variable', 'Inter', sans-serif",
  sans:    "'Inter', system-ui, sans-serif",
  mono:    "'JetBrains Mono', monospace",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));

/** Clamped interpolate — no extrapolation. */
const fi = (frame, [f0, f1], [v0, v1], easingFn) =>
  clamp(
    interpolate(frame, [f0, f1], [v0, v1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: easingFn,
    })
  );

const easeOut = Easing.out(Easing.cubic);
const easeInOut = Easing.inOut(Easing.cubic);

/** Spring helper — returns [0→1] progress. */
const sp = (frame, delay, config = {}) =>
  spring({
    frame: frame - delay,
    fps: 30,
    config: { damping: 20, stiffness: 200, mass: 0.8, ...config },
  });

// ─── Shared primitives ───────────────────────────────────────────────────────

/** Eyebrow label (mono, small-caps track) */
function Eyebrow({ children, color = C.greenPale, style = {} }) {
  return (
    <div style={{
      fontFamily: FONT.mono,
      fontSize: 11,
      letterSpacing: '0.18em',
      textTransform: 'uppercase',
      color,
      ...style,
    }}>
      {children}
    </div>
  );
}

/** Accent word in a headline — renders inline, green glow. */
function Accent({ children }) {
  return (
    <span style={{
      color: C.greenPale,
      textShadow: `0 0 24px rgba(155,211,131,0.45)`,
    }}>
      {children}
    </span>
  );
}

/** Full-screen gradient background */
function Bg({ angle = '160deg', from = C.navy, to = C.navyMid, children, style = {} }) {
  return (
    <AbsoluteFill style={{
      background: `linear-gradient(${angle}, ${from} 0%, ${to} 100%)`,
      fontFamily: FONT.sans,
      ...style,
    }}>
      {children}
    </AbsoluteFill>
  );
}

/** Subtle grid/noise overlay for cinematic texture */
function Grain() {
  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none',
      backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(38,112,168,0.08) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(82,168,50,0.06) 0%, transparent 55%)',
    }} />
  );
}

// ─── ACT 1: INTERRUPT ─────────────────────────────────────────────────────────
// Frames 0–180 (6s). Pure black. Words assemble on hard cuts — no easing.
// Each word drops in at exact frame intervals (hard cut: immediate opacity).
function Act1Interrupt({ content }) {
  const frame = useCurrentFrame();
  const words = content.hookWords;

  // Hard cuts: each word appears at specific frame with 0→1 instant jump.
  // Word timing: frames 0, 20, 38, 54, 68, 80, 90 (faster toward end = urgency).
  const wordFrames = [8, 26, 44, 60, 74, 86, 96, 104].slice(0, words.length);

  // After words assembled (frame ~110), hold, then sub-text arrives.
  const subOp = fi(frame, [118, 135], [0, 1], easeOut);
  const subY  = interpolate(sp(frame, 118, { damping: 22, stiffness: 220 }), [0, 1], [18, 0]);

  // Scene exit: slow fade at end
  const exitOp = fi(frame, [158, 178], [1, 0], easeInOut);

  // Cursor blink after last word
  const lastWordFrame = wordFrames[wordFrames.length - 1] || 104;
  const cursorVisible = frame > lastWordFrame + 10 && Math.floor((frame - lastWordFrame) / 10) % 2 === 0;

  return (
    <AbsoluteFill style={{
      background: '#000000',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: exitOp,
    }}>
      {/* Word-by-word hook assembly */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '0 18px',
        maxWidth: 900,
        padding: '0 40px',
      }}>
        {words.map((word, i) => {
          const startF = wordFrames[i] ?? (8 + i * 18);
          // Hard cut: instantly visible once frame passes threshold
          const visible = frame >= startF;
          const isLast = i === words.length - 1;
          return (
            <span
              key={`${word}-${i}`}
              style={{
                fontFamily: FONT.display,
                fontSize: 88,
                fontWeight: 800,
                letterSpacing: '-0.04em',
                lineHeight: 1.0,
                color: isLast ? C.greenPale : C.white,
                opacity: visible ? 1 : 0,
                // Hard cut: no transition — immediate state change via frame
                textShadow: isLast ? `0 0 40px rgba(155,211,131,0.4)` : 'none',
              }}
            >
              {word}
            </span>
          );
        })}
        {cursorVisible && (
          <span style={{
            fontFamily: FONT.mono,
            fontSize: 88,
            fontWeight: 300,
            color: C.greenPale,
            lineHeight: 1.0,
          }}>|</span>
        )}
      </div>

      {/* Sub-text: sets the pain context */}
      <div style={{
        marginTop: 28,
        opacity: subOp,
        transform: `translateY(${subY}px)`,
        textAlign: 'center',
      }}>
        <div style={{
          fontFamily: FONT.mono,
          fontSize: 13,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.38)',
        }}>
          There's a better way to find a match
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ─── ACT 2: IDENTIFY ─────────────────────────────────────────────────────────
// Frames 180–390 (6–13s, 210f). Staccato pain cards fly in & stack.
// Left-aligned during agitation per brief.
const PAIN_POSITIONS = [
  { x: '5%',  y: '8%',  r: -5 },
  { x: '52%', y: '4%',  r: 4  },
  { x: '8%',  y: '52%', r: -3 },
  { x: '55%', y: '56%', r: 6  },
];

function Act2Identify({ content }) {
  const frame = useCurrentFrame();

  // Cards enter with hard spring (staccato feel)
  const cardDelay = 18;
  const cards = content.painCards;

  // Hero identity line arrives after cards
  const heroOp = fi(frame, [115, 138], [0, 1], easeOut);
  const heroY  = interpolate(sp(frame, 115, { damping: 16, stiffness: 240 }), [0, 1], [28, 0]);

  // Exit
  const exitOp = fi(frame, [188, 208], [1, 0], easeInOut);

  // Accent word detection: find the accent word in the identity line
  const identityLine = content.identityLine;
  const accentWord = content.identityAccent;

  const parts = identityLine.split(accentWord);
  const heroEl = parts.length > 1 ? (
    <>
      {parts[0]}<Accent>{accentWord}</Accent>{parts[1]}
    </>
  ) : identityLine;

  return (
    <Bg opacity={exitOp} style={{ opacity: exitOp }}>
      <Grain />
      {/* Pain cards — staggered hard-spring entry, left-aligned */}
      {cards.map((card, i) => {
        const startF = i * cardDelay + 8;
        const entryProg = clamp(sp(frame, startF, { damping: 22, stiffness: 300, mass: 0.6 }));
        const cardY = interpolate(entryProg, [0, 1], [70, 0]);
        const cardOp = fi(frame, [startF, startF + 14], [0, 1]);
        const pos = PAIN_POSITIONS[i] || { x: `${20 + i * 18}%`, y: `${15 + i * 12}%`, r: 0 };

        return (
          <div key={card.title} style={{
            position: 'absolute',
            left: pos.x,
            top: pos.y,
            transform: `translateY(${cardY}px) rotate(${pos.r}deg)`,
            opacity: cardOp,
            background: 'rgba(255,255,255,0.055)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 14,
            padding: '14px 18px',
            minWidth: 200,
            backdropFilter: 'blur(8px)',
          }}>
            {/* Red X stamp */}
            <div style={{
              position: 'absolute', top: -10, right: -10,
              width: 24, height: 24, borderRadius: '50%',
              background: '#ef4444',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, color: 'white', fontWeight: 700,
              boxShadow: '0 4px 12px rgba(239,68,68,0.5)',
            }}>✕</div>
            <div style={{ color: 'rgba(255,255,255,0.88)', fontSize: 13, fontWeight: 600, fontFamily: FONT.sans }}>
              {card.title}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.42)', fontSize: 11, marginTop: 4, fontFamily: FONT.mono }}>
              {card.sub}
            </div>
          </div>
        );
      })}

      {/* Hero identity line — centred, display weight */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        opacity: heroOp,
        transform: `translateY(${heroY}px)`,
        textAlign: 'center',
        padding: '0 60px',
      }}>
        <div style={{
          fontFamily: FONT.display,
          fontSize: 64,
          fontWeight: 700,
          color: C.white,
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
        }}>
          {heroEl}
        </div>
        <div style={{
          marginTop: 16,
          fontFamily: FONT.mono,
          fontSize: 12,
          letterSpacing: '0.18em',
          color: 'rgba(255,255,255,0.32)',
          textTransform: 'uppercase',
        }}>
          The market doesn't wait
        </div>
      </div>
    </Bg>
  );
}

// ─── ACT 3: AGITATE ──────────────────────────────────────────────────────────
// Frames 390–630 (13–21s, 240f). Spring motion. Slow-burn cost lines.
// Left-aligned text. Dark, heavy atmosphere.
function Act3Agitate({ content }) {
  const frame = useCurrentFrame();
  const lines = content.agitateLines;
  const lineSpacing = 52;

  // Lines enter one by one, left-aligned, spring
  const lineFrames = [8, 68, 128];

  // Anguish line — the kicker — arrives after agitate lines
  const anguishOp = fi(frame, [175, 200], [0, 1], easeOut);
  const anguishY  = interpolate(sp(frame, 175, { damping: 18, stiffness: 200 }), [0, 1], [22, 0]);

  // Exit
  const exitOp = fi(frame, [215, 235], [1, 0], easeInOut);

  const anguishLine = content.anguishLine;
  const anguishAccent = content.anguishAccent;
  const anguishParts = anguishLine.split(anguishAccent);
  const anguishEl = anguishParts.length > 1 ? (
    <>{anguishParts[0]}<Accent>{anguishAccent}</Accent>{anguishParts[1]}</>
  ) : anguishLine;

  return (
    <AbsoluteFill style={{
      background: `linear-gradient(170deg, #050f1e 0%, ${C.navy} 60%, #0a1a30 100%)`,
      opacity: exitOp,
      fontFamily: FONT.sans,
    }}>
      <Grain />

      {/* Agitate lines — left aligned */}
      <div style={{
        position: 'absolute',
        left: 80,
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: 32,
        maxWidth: 700,
      }}>
        {lines.map((line, i) => {
          const startF = lineFrames[i] ?? i * 60 + 8;
          const entryProg = clamp(sp(frame, startF, { damping: 22, stiffness: 160, mass: 1.1 }));
          const lineX = interpolate(entryProg, [0, 1], [-60, 0]);
          const lineOp = fi(frame, [startF, startF + 22], [0, 1], easeOut);
          // Dim older lines as new ones appear
          const dimProg = i < lines.length - 1 ? fi(frame, [lineFrames[i + 1] + 10, lineFrames[i + 1] + 30], [1, 0.3]) : 1;

          return (
            <div key={line} style={{
              transform: `translateX(${lineX}px)`,
              opacity: lineOp * dimProg,
            }}>
              <div style={{
                fontFamily: FONT.display,
                fontSize: 42,
                fontWeight: 600,
                color: C.white,
                letterSpacing: '-0.025em',
                lineHeight: 1.2,
              }}>
                {line}
              </div>
              {/* Subtle underline pulse */}
              <div style={{
                height: 2,
                width: fi(frame, [startF + 8, startF + 30], [0, 140]) * (lineOp > 0.5 ? 1 : 0),
                background: `linear-gradient(90deg, rgba(239,68,68,0.7), transparent)`,
                marginTop: 8,
                borderRadius: 1,
              }} />
            </div>
          );
        })}
      </div>

      {/* Anguish kicker — centred, bigger, green accent */}
      <div style={{
        position: 'absolute',
        bottom: '12%',
        left: 0, right: 0,
        textAlign: 'center',
        opacity: anguishOp,
        transform: `translateY(${anguishY}px)`,
        padding: '0 60px',
      }}>
        <div style={{
          fontFamily: FONT.display,
          fontSize: 52,
          fontWeight: 700,
          color: C.white,
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
        }}>
          {anguishEl}
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ─── ACT 4: BRIDGE ───────────────────────────────────────────────────────────
// Frames 630–840 (21–28s, 210f). Tone shift — light breaks through.
// Spring motion. Centred during resolution.
function Act4Bridge({ content }) {
  const frame = useCurrentFrame();

  // Light burst: radial glow expands from centre
  const glowScale = interpolate(sp(frame, 5, { damping: 28, stiffness: 80, mass: 1.4 }), [0, 1], [0.2, 1]);
  const glowOp    = fi(frame, [5, 40], [0, 0.6], easeOut);

  // Bridge headline — spring in, centred
  const lineOp = fi(frame, [18, 48], [0, 1], easeOut);
  const lineY  = interpolate(sp(frame, 18, { damping: 22, stiffness: 180 }), [0, 1], [32, 0]);

  // Sub-text below
  const subOp = fi(frame, [58, 82], [0, 1], easeOut);
  const subY  = interpolate(sp(frame, 58, { damping: 22, stiffness: 200 }), [0, 1], [16, 0]);

  // "What if" pill label
  const pillOp = fi(frame, [8, 28], [0, 1], easeOut);

  // Exit
  const exitOp = fi(frame, [188, 208], [1, 0], easeInOut);

  const bridgeLine = content.bridgeLine;
  const accent     = content.bridgeAccent;

  // Highlight the accent phrase
  const accentIdx = bridgeLine.toLowerCase().indexOf(accent.toLowerCase());
  let bridgeEl;
  if (accentIdx !== -1) {
    bridgeEl = (
      <>
        {bridgeLine.slice(0, accentIdx)}
        <Accent>{bridgeLine.slice(accentIdx, accentIdx + accent.length)}</Accent>
        {bridgeLine.slice(accentIdx + accent.length)}
      </>
    );
  } else {
    bridgeEl = bridgeLine;
  }

  return (
    <AbsoluteFill style={{
      background: `linear-gradient(160deg, ${C.navy} 0%, ${C.navyLight} 100%)`,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      opacity: exitOp,
      fontFamily: FONT.sans,
    }}>
      {/* Light burst glow */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        width: 700, height: 700,
        transform: `translate(-50%, -50%) scale(${glowScale})`,
        borderRadius: '50%',
        background: `radial-gradient(circle, rgba(82,168,50,${glowOp * 0.28}) 0%, rgba(38,112,168,${glowOp * 0.12}) 45%, transparent 70%)`,
        filter: 'blur(40px)',
        pointerEvents: 'none',
      }} />

      {/* "What if" eyebrow pill */}
      <div style={{
        opacity: pillOp,
        marginBottom: 24,
        background: 'rgba(82,168,50,0.15)',
        border: '1px solid rgba(82,168,50,0.35)',
        borderRadius: 100,
        padding: '6px 20px',
      }}>
        <Eyebrow color={C.greenPale}>A different approach</Eyebrow>
      </div>

      {/* Bridge headline */}
      <div style={{
        opacity: lineOp,
        transform: `translateY(${lineY}px)`,
        textAlign: 'center',
        padding: '0 80px',
        maxWidth: 1000,
      }}>
        <div style={{
          fontFamily: FONT.display,
          fontSize: 72,
          fontWeight: 700,
          color: C.white,
          letterSpacing: '-0.035em',
          lineHeight: 1.08,
        }}>
          {bridgeEl}
        </div>
      </div>

      {/* Sub-text */}
      <div style={{
        marginTop: 28,
        opacity: subOp,
        transform: `translateY(${subY}px)`,
        textAlign: 'center',
        padding: '0 80px',
      }}>
        <div style={{
          fontFamily: FONT.sans,
          fontSize: 22,
          fontWeight: 300,
          color: 'rgba(255,255,255,0.62)',
          letterSpacing: '-0.01em',
        }}>
          {content.bridgeSub}
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ─── ACT 5: REVEAL ───────────────────────────────────────────────────────────
// Frames 840–1110 (28–37s, 270f). Cinematic ease-in-out cubic.
// Before/after split-screen wipe. RentEazy mechanism revealed.
function Act5Reveal({ content }) {
  const frame = useCurrentFrame();

  // RentEazy name reveal — cinematic ease
  const nameOp = fi(frame, [10, 45], [0, 1], easeInOut);
  const nameY  = interpolate(frame, [10, 55], [40, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeInOut,
  });

  // Tagline
  const tagOp = fi(frame, [50, 80], [0, 1], easeOut);

  // Mechanism row
  const mechOp = fi(frame, [70, 100], [0, 1], easeOut);
  const mechY  = interpolate(sp(frame, 70, { damping: 22, stiffness: 180 }), [0, 1], [20, 0]);

  // Split-screen wipe — divider slides from centre outward
  const wipeProgress = fi(frame, [110, 170], [0, 1], easeInOut);
  const wipeOp       = fi(frame, [105, 125], [0, 1], easeOut);

  // Before panel slides left, After panel slides right
  const beforeX = interpolate(wipeProgress, [0, 1], [0, -10]);
  const afterX  = interpolate(wipeProgress, [0, 1], [0, 10]);

  // Exit
  const exitOp = fi(frame, [248, 268], [1, 0], easeInOut);

  const revealLabel = content.revealLabel;

  return (
    <AbsoluteFill style={{
      background: `linear-gradient(160deg, ${C.navyMid} 0%, ${C.navy} 100%)`,
      opacity: exitOp,
      fontFamily: FONT.sans,
    }}>
      <Grain />

      {/* RentEazy brand name */}
      <div style={{
        position: 'absolute',
        top: '8%', left: 0, right: 0,
        textAlign: 'center',
        opacity: nameOp,
        transform: `translateY(${nameY}px)`,
      }}>
        <Eyebrow color="rgba(255,255,255,0.38)" style={{ marginBottom: 12 }}>
          {revealLabel} · INTRODUCING
        </Eyebrow>
        <div style={{
          fontFamily: FONT.display,
          fontSize: 96,
          fontWeight: 800,
          color: C.white,
          letterSpacing: '-0.045em',
          lineHeight: 1,
        }}>
          Rent<span style={{ color: C.greenPale }}>Eazy</span>
        </div>
        <div style={{
          opacity: tagOp,
          marginTop: 10,
          fontFamily: FONT.sans,
          fontSize: 20,
          fontWeight: 300,
          color: 'rgba(255,255,255,0.55)',
          letterSpacing: '-0.01em',
        }}>
          The mutual-matching network for rentals
        </div>
      </div>

      {/* Mechanism pills */}
      <div style={{
        position: 'absolute',
        top: '38%',
        left: 0, right: 0,
        display: 'flex',
        justifyContent: 'center',
        gap: 14,
        flexWrap: 'wrap',
        padding: '0 60px',
        opacity: mechOp,
        transform: `translateY(${mechY}px)`,
      }}>
        {['Both sides like first', 'No cold outreach', '9 match criteria', 'Reputation travels with you'].map((pill, i) => (
          <div key={pill} style={{
            background: i === 0
              ? `rgba(82,168,50,0.2)`
              : 'rgba(255,255,255,0.07)',
            border: `1px solid ${i === 0 ? 'rgba(82,168,50,0.45)' : 'rgba(255,255,255,0.13)'}`,
            borderRadius: 100,
            padding: '10px 20px',
            fontFamily: FONT.sans,
            fontSize: 14,
            color: i === 0 ? C.greenPale : 'rgba(255,255,255,0.72)',
            fontWeight: i === 0 ? 600 : 400,
          }}>
            {pill}
          </div>
        ))}
      </div>

      {/* Before / After split screen */}
      <div style={{
        position: 'absolute',
        bottom: '4%',
        left: '4%',
        right: '4%',
        display: 'flex',
        gap: 16,
        opacity: wipeOp,
        height: '30%',
      }}>
        {/* BEFORE panel */}
        <div style={{
          flex: 1,
          background: 'rgba(239,68,68,0.07)',
          border: '1px solid rgba(239,68,68,0.22)',
          borderRadius: 20,
          padding: '18px 22px',
          transform: `translateX(${beforeX}px)`,
          overflow: 'hidden',
        }}>
          <Eyebrow color="rgba(239,68,68,0.7)" style={{ marginBottom: 10 }}>
            Before — {BEFORE_AFTER.before.label}
          </Eyebrow>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {BEFORE_AFTER.before.points.map(p => (
              <div key={p} style={{
                fontSize: 12, color: 'rgba(255,255,255,0.52)',
                display: 'flex', gap: 8, alignItems: 'flex-start',
                fontFamily: FONT.sans,
              }}>
                <span style={{ color: '#ef4444', flexShrink: 0 }}>—</span> {p}
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{
          width: 2,
          alignSelf: 'stretch',
          background: `linear-gradient(to bottom, transparent, ${C.greenPale}, transparent)`,
          opacity: wipeProgress,
          flexShrink: 0,
        }} />

        {/* AFTER panel */}
        <div style={{
          flex: 1,
          background: 'rgba(82,168,50,0.1)',
          border: '1px solid rgba(82,168,50,0.32)',
          borderRadius: 20,
          padding: '18px 22px',
          transform: `translateX(${afterX}px)`,
          overflow: 'hidden',
        }}>
          <Eyebrow color={C.greenPale} style={{ marginBottom: 10 }}>
            After — {BEFORE_AFTER.after.label}
          </Eyebrow>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {BEFORE_AFTER.after.points.map(p => (
              <div key={p} style={{
                fontSize: 12, color: 'rgba(255,255,255,0.75)',
                display: 'flex', gap: 8, alignItems: 'flex-start',
                fontFamily: FONT.sans,
              }}>
                <span style={{ color: C.greenPale, flexShrink: 0 }}>✓</span> {p}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ─── ACT 6: PROOF ────────────────────────────────────────────────────────────
// Frames 1110–1440 (37–48s, 330f). Real platform facts only.
// Count-up on REAL numbers (9 match types, 18 ways to post, etc.).
// No fabricated user/signup/traction numbers.
function Act6Proof({ content }) {
  const frame = useCurrentFrame();

  // Proof hook line enters
  const hookOp = fi(frame, [8, 35], [0, 1], easeOut);
  const hookY  = interpolate(sp(frame, 8, { damping: 20, stiffness: 180 }), [0, 1], [24, 0]);

  // Fact cards stagger in
  const cardDelay = 50;
  const exitOp = fi(frame, [298, 325], [1, 0], easeInOut);

  // Feature list enters after facts
  const featOp = fi(frame, [225, 255], [0, 1], easeOut);
  const featY  = interpolate(sp(frame, 225, { damping: 22, stiffness: 180 }), [0, 1], [20, 0]);

  // East London GTM honest angle
  const gtmOp = fi(frame, [268, 295], [0, 1], easeOut);

  return (
    <AbsoluteFill style={{
      background: `linear-gradient(155deg, ${C.navyLight} 0%, ${C.navy} 55%, ${C.navyMid} 100%)`,
      opacity: exitOp,
      fontFamily: FONT.sans,
    }}>
      <Grain />

      {/* Proof hook */}
      <div style={{
        position: 'absolute',
        top: '7%', left: 0, right: 0,
        textAlign: 'center',
        opacity: hookOp,
        transform: `translateY(${hookY}px)`,
      }}>
        <Eyebrow color={C.greenPale} style={{ marginBottom: 10 }}>
          What you actually get
        </Eyebrow>
        <div style={{
          fontFamily: FONT.display,
          fontSize: 52,
          fontWeight: 700,
          color: C.white,
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
        }}>
          {content.proofHook}
        </div>
      </div>

      {/* Real platform fact cards — animated count-up on real numbers */}
      <div style={{
        position: 'absolute',
        top: '26%',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 18,
        width: 'max-content',
      }}>
        {PLATFORM_FACTS.map((fact, i) => {
          const startF = i * cardDelay + 55;
          const cardOp = fi(frame, [startF, startF + 25], [0, 1], easeOut);
          const cardY  = interpolate(sp(frame, startF, { damping: 20, stiffness: 200 }), [0, 1], [30, 0]);

          // Count-up animation for real numbers
          let displayNum;
          if (fact.count === 0) {
            // "0 fee" — show "FREE" not a counter
            displayNum = 'FREE';
          } else if (fact.count === 2) {
            // "both sides must like first" — display as "2×"
            const counted = Math.round(interpolate(frame, [startF + 10, startF + 45], [0, fact.count], {
              extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOut,
            }));
            displayNum = `${counted}×`;
          } else {
            // count-up from 0 to real number
            const counted = Math.round(interpolate(frame, [startF + 10, startF + 55], [0, fact.count], {
              extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOut,
            }));
            displayNum = counted.toString();
          }

          return (
            <div key={fact.label} style={{
              opacity: cardOp,
              transform: `translateY(${cardY}px)`,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 22,
              padding: '22px 24px',
              minWidth: 160,
              textAlign: 'center',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 16px 40px rgba(0,0,0,0.35)',
            }}>
              <div style={{
                fontFamily: FONT.mono,
                fontSize: fact.count === 0 ? 28 : 48,
                fontWeight: 700,
                color: C.greenPale,
                letterSpacing: '-0.02em',
                lineHeight: 1,
                textShadow: `0 0 20px rgba(155,211,131,0.35)`,
              }}>
                {displayNum}
              </div>
              <div style={{
                marginTop: 8,
                fontFamily: FONT.sans,
                fontSize: 12,
                fontWeight: 500,
                color: 'rgba(255,255,255,0.72)',
              }}>
                {fact.label}
              </div>
              <div style={{
                marginTop: 5,
                fontFamily: FONT.mono,
                fontSize: 9,
                letterSpacing: '0.08em',
                color: 'rgba(255,255,255,0.35)',
              }}>
                {fact.sub}
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature checklist */}
      <div style={{
        position: 'absolute',
        bottom: '14%',
        left: '50%',
        transform: 'translateX(-50%)',
        opacity: featOp,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        minWidth: 540,
      }}>
        {PLATFORM_FEATURES.slice(0, 4).map((feat, i) => {
          const featItemOp = fi(frame, [225 + i * 12, 248 + i * 12], [0, 1], easeOut);
          return (
            <div key={feat} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              opacity: featItemOp,
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%',
                background: `rgba(82,168,50,0.25)`,
                border: '1px solid rgba(82,168,50,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span style={{ color: C.greenPale, fontSize: 12, fontWeight: 700 }}>✓</span>
              </div>
              <div style={{ fontFamily: FONT.sans, fontSize: 15, color: 'rgba(255,255,255,0.75)' }}>
                {feat}
              </div>
            </div>
          );
        })}
      </div>

      {/* Honest GTM angle */}
      <div style={{
        position: 'absolute',
        bottom: '4%',
        left: 0, right: 0,
        textAlign: 'center',
        opacity: gtmOp,
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          background: 'rgba(38,112,168,0.15)',
          border: '1px solid rgba(91,196,255,0.25)',
          borderRadius: 100,
          padding: '8px 22px',
        }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.bluePale, boxShadow: `0 0 8px ${C.bluePale}` }} />
          <span style={{ fontFamily: FONT.mono, fontSize: 11, color: C.bluePale, letterSpacing: '0.14em' }}>
            LIVE IN EAST LONDON · GROWING NOW · EARLY-MOVER ADVANTAGE
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ─── ACT 7: CLOSE ────────────────────────────────────────────────────────────
// Frames 1440–1800 (48–60s, 360f). Cinematic ease. Identity frame + CTA + consequence.
function Act7Close({ content }) {
  const frame = useCurrentFrame();

  // Brand name glow pulse
  const glowPulse = 0.5 + Math.sin(frame / 14) * 0.12;

  // Identity frame enters
  const idOp = fi(frame, [8, 48], [0, 1], easeInOut);
  const idY  = interpolate(frame, [8, 55], [36, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeInOut,
  });

  // Accent word in identity frame
  const identityFrame = content.identityFrame;
  const accentWord    = content.identityAccentWord;
  const idParts = identityFrame.split(accentWord);
  const idEl = idParts.length > 1 ? (
    <>{idParts[0]}<Accent>{accentWord}</Accent>{idParts[1]}</>
  ) : identityFrame;

  // Audience pills
  const pill1Op = fi(frame, [60, 82], [0, 1], easeOut);
  const pill2Op = fi(frame, [76, 98], [0, 1], easeOut);
  const pill3Op = fi(frame, [92, 114], [0, 1], easeOut);
  const pill4Op = fi(frame, [108, 130], [0, 1], easeOut);

  // CTA button — spring pop
  const ctaScale = 0.75 + sp(frame, 135, { damping: 12, stiffness: 280, mass: 0.7 }) * 0.25;
  const ctaOp    = fi(frame, [135, 160], [0, 1], easeOut);
  // Subtle CTA glow pulse
  const ctaGlow  = 0.5 + Math.sin(frame / 11) * 0.1;

  // Consequence line — last to arrive
  const conseqOp = fi(frame, [185, 215], [0, 1], easeOut);
  const conseqY  = interpolate(sp(frame, 185, { damping: 22, stiffness: 180 }), [0, 1], [14, 0]);

  // Domain footer
  const footOp = fi(frame, [218, 245], [0, 1], easeOut);

  const pills = [
    { label: 'Renters', color: C.greenPale, bg: 'rgba(82,168,50,0.18)', border: 'rgba(82,168,50,0.4)' },
    { label: 'Landlords', color: C.bluePale, bg: 'rgba(38,112,168,0.15)', border: 'rgba(91,196,255,0.3)' },
    { label: 'Agents', color: '#fbbf24', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' },
    { label: 'Investors', color: 'rgba(255,255,255,0.62)', bg: 'rgba(255,255,255,0.07)', border: 'rgba(255,255,255,0.15)' },
  ];
  const pillOps = [pill1Op, pill2Op, pill3Op, pill4Op];

  return (
    <AbsoluteFill style={{
      background: `linear-gradient(160deg, ${C.navy} 0%, ${C.navyMid} 100%)`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: FONT.sans,
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute',
        top: '40%', left: '50%',
        width: 640, height: 400,
        transform: `translate(-50%, -50%)`,
        borderRadius: '50%',
        background: `radial-gradient(ellipse, rgba(82,168,50,${glowPulse * 0.16}) 0%, transparent 65%)`,
        filter: 'blur(60px)',
        pointerEvents: 'none',
      }} />

      {/* Identity frame headline */}
      <div style={{
        opacity: idOp,
        transform: `translateY(${idY}px)`,
        textAlign: 'center',
        padding: '0 80px',
        maxWidth: 960,
        zIndex: 1,
      }}>
        <div style={{
          fontFamily: FONT.display,
          fontSize: 80,
          fontWeight: 800,
          color: C.white,
          letterSpacing: '-0.04em',
          lineHeight: 1.0,
        }}>
          {idEl}
        </div>
      </div>

      {/* Audience pills */}
      <div style={{
        marginTop: 30,
        display: 'flex',
        gap: 12,
        justifyContent: 'center',
        flexWrap: 'wrap',
        padding: '0 40px',
        zIndex: 1,
      }}>
        {pills.map((pill, i) => (
          <div key={pill.label} style={{
            opacity: pillOps[i],
            background: pill.bg,
            border: `1px solid ${pill.border}`,
            borderRadius: 100,
            padding: '9px 20px',
          }}>
            <span style={{ fontFamily: FONT.sans, fontSize: 14, fontWeight: 500, color: pill.color }}>
              {pill.label}
            </span>
          </div>
        ))}
      </div>

      {/* CTA button */}
      <div style={{
        marginTop: 32,
        opacity: ctaOp,
        transform: `scale(${ctaScale})`,
        textAlign: 'center',
        zIndex: 1,
      }}>
        <div style={{
          background: `linear-gradient(135deg, ${C.green}, ${C.greenDark})`,
          borderRadius: 100,
          padding: '18px 52px',
          color: 'white',
          fontFamily: FONT.display,
          fontSize: 20,
          fontWeight: 600,
          display: 'inline-block',
          boxShadow: `0 20px 48px rgba(47,125,50,${ctaGlow * 0.55}), 0 0 0 1px rgba(255,255,255,0.18)`,
          letterSpacing: '-0.01em',
        }}>
          {content.ctaLabel}
        </div>
      </div>

      {/* Consequence line */}
      <div style={{
        marginTop: 24,
        opacity: conseqOp,
        transform: `translateY(${conseqY}px)`,
        textAlign: 'center',
        padding: '0 80px',
        zIndex: 1,
      }}>
        <div style={{
          fontFamily: FONT.sans,
          fontSize: 16,
          fontWeight: 300,
          color: 'rgba(255,255,255,0.42)',
          letterSpacing: '-0.005em',
          fontStyle: 'italic',
        }}>
          {content.consequenceLine}
        </div>
      </div>

      {/* Domain + free badge */}
      <div style={{
        marginTop: 20,
        opacity: footOp,
        zIndex: 1,
      }}>
        <div style={{
          fontFamily: FONT.mono,
          fontSize: 11,
          color: 'rgba(255,255,255,0.28)',
          letterSpacing: '0.16em',
          textAlign: 'center',
        }}>
          renteazy.co.uk · free to post · free to swipe · mutual match
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ─── Root composition ─────────────────────────────────────────────────────────
/**
 * Act boundaries (all at 30 fps):
 *   Act 1 INTERRUPT    0–180f   (6s)
 *   Act 2 IDENTIFY   180–390f   (7s)
 *   Act 3 AGITATE    390–630f   (8s)
 *   Act 4 BRIDGE     630–840f   (7s)
 *   Act 5 REVEAL     840–1110f  (9s)
 *   Act 6 PROOF     1110–1440f  (11s)
 *   Act 7 CLOSE     1440–1800f  (12s)
 *
 * Total: 1800 frames = 60 seconds @ 30fps.
 */
export default function RentEazyVSL({ userType = 'tenant' }) {
  const resolvedType = ['tenant', 'landlord', 'investor', 'agent'].includes(userType)
    ? userType
    : 'tenant';
  const content = CONTENT[resolvedType];

  return (
    <AbsoluteFill style={{ background: C.navy, fontFamily: FONT.sans }}>
      {/* Background music — keep quiet to not overpower a landing page */}
      <Audio src={staticFile('/audio/in-it-kadant.mp3')} volume={0.18} />

      {/* Act 1: INTERRUPT — 0–180f (0–6s) */}
      <Sequence from={0} durationInFrames={180}>
        <Act1Interrupt content={content} />
      </Sequence>

      {/* Act 2: IDENTIFY — 180–390f (6–13s) */}
      <Sequence from={180} durationInFrames={210}>
        <Act2Identify content={content} />
      </Sequence>

      {/* Act 3: AGITATE — 390–630f (13–21s) */}
      <Sequence from={390} durationInFrames={240}>
        <Act3Agitate content={content} />
      </Sequence>

      {/* Act 4: BRIDGE — 630–840f (21–28s) */}
      <Sequence from={630} durationInFrames={210}>
        <Act4Bridge content={content} />
      </Sequence>

      {/* Act 5: REVEAL — 840–1110f (28–37s) */}
      <Sequence from={840} durationInFrames={270}>
        <Act5Reveal content={content} />
      </Sequence>

      {/* Act 6: PROOF — 1110–1440f (37–48s) */}
      <Sequence from={1110} durationInFrames={330}>
        <Act6Proof content={content} />
      </Sequence>

      {/* Act 7: CLOSE — 1440–1800f (48–60s) */}
      <Sequence from={1440} durationInFrames={360}>
        <Act7Close content={content} />
      </Sequence>
    </AbsoluteFill>
  );
}
