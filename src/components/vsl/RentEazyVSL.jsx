/**
 * RentEazyVSL — 7-act cinematic VSL composition.
 *
 * Duration: 60 s × 30 fps = 1800 frames.
 *
 * Music: in-it-kadant.mp3 @ 98 BPM
 *   Beat  = 18.37f   Bar = 73.47f @30fps
 *   0–22s  (0–660f)   : quiet build / rising tension
 *   22s    (660f)     : DROP 1 — groove / beat kicks in
 *   24–40s (720–1200f): main groove
 *   40–47s (1200–1410f): breakdown (quiet)
 *   48s    (1440f)   : DROP 2 — biggest peak
 *
 * Act boundaries (snapped to bar grid):
 *   Act 1 INTERRUPT    0–147f   (0–4.9s)   2 bars  — black, word-by-word hook
 *   Act 2 IDENTIFY   147–368f   (4.9–12.3s) 3 bars — pain cards + role-specific UI
 *   Act 3 AGITATE    368–588f  (12.3–19.6s) 3 bars — agitate lines + ghost inbox
 *   Act 4 BRIDGE     588–661f  (19.6–22s)  ~1 bar  — tone-shift, tension peak
 *   Act 5 REVEAL     661–1176f (22–39.2s)  7 bars  — DROP 1: phone + swipe→MATCH
 *   Act 6 PROOF     1176–1397f (39.2–46.6s) 3 bars — groove + breakdown: facts
 *   Act 7 CLOSE     1397–1800f (46.6–60s)  ~5 bars — DROP 2 @1440: CTA spring
 *
 * Total: 1800f = 60s @ 30fps.
 * Parameterised via inputProps.userType ('tenant'|'landlord'|'investor'|'agent').
 */

import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import CONTENT, {
  PLATFORM_FACTS,
  PLATFORM_FEATURES,
  BEFORE_AFTER,
  LISTING_FRAGMENTS_BY_TYPE,
  CARD_DATA_BY_TYPE,
} from './vsl-content.js';
import { PhoneFrame } from './PhoneFrame.jsx';
import { SwipeCard, SwipeAnimation } from './SwipeCard.jsx';

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

// ─── Fonts ────────────────────────────────────────────────────────────────────
const FONT = {
  display: "'Bricolage Grotesque Variable', 'Inter', sans-serif",
  sans:    "'Inter', system-ui, sans-serif",
  mono:    "'JetBrains Mono', monospace",
};

// ─── Music timing constants ───────────────────────────────────────────────────
const BEAT = 18.37;   // frames per beat @ 98 BPM / 30 fps
const BAR  = BEAT * 4; // 73.47f

// Act boundaries
const A1_START =    0;
const A2_START =  147;  // 2 bars
const A3_START =  368;  // 5 bars from 0
const A4_START =  588;  // 8 bars
const A5_START =  661;  // DROP 1 — ~9 bars = 661
const A6_START = 1176;  // A5_START + 7 bars
const A7_START = 1397;  // A6_START + 3 bars
const TOTAL    = 1800;

const DROP2_FRAME = 1440; // 48s — CTA spring target

// ─── Helpers ──────────────────────────────────────────────────────────────────
const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));

const fi = (frame, [f0, f1], [v0, v1], easingFn) =>
  clamp(
    interpolate(frame, [f0, f1], [v0, v1], {
      extrapolateLeft:  'clamp',
      extrapolateRight: 'clamp',
      easing: easingFn,
    })
  );

const easeOut   = Easing.out(Easing.cubic);
const easeInOut = Easing.inOut(Easing.cubic);
const easeIn    = Easing.in(Easing.cubic);

const sp = (frame, delay, config = {}) =>
  spring({
    frame: frame - delay,
    fps:   30,
    config: { damping: 20, stiffness: 200, mass: 0.8, ...config },
  });

// ─── Shared primitives ────────────────────────────────────────────────────────

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

function Accent({ children }) {
  return (
    <span style={{
      color: C.greenPale,
      textShadow: `0 0 28px rgba(155,211,131,0.5)`,
    }}>
      {children}
    </span>
  );
}

function RedAccent({ children }) {
  return (
    <span style={{
      color: '#fca5a5',
      textShadow: '0 0 20px rgba(239,68,68,0.35)',
    }}>
      {children}
    </span>
  );
}

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

function Grain() {
  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none',
      backgroundImage: [
        'radial-gradient(circle at 18% 52%, rgba(38,112,168,0.10) 0%, transparent 58%)',
        'radial-gradient(circle at 82% 18%, rgba(82,168,50,0.07) 0%, transparent 52%)',
        'radial-gradient(circle at 50% 80%, rgba(6,24,47,0.15) 0%, transparent 45%)',
      ].join(', '),
    }} />
  );
}

// ─── Role-specific "before" UI fragments (scattered in Act 2) ────────────────
function BuriedListing({ title, sub, frame, enterFrame, x, y, rot = 0 }) {
  const op   = fi(frame, [enterFrame, enterFrame + 14], [0, 1], easeOut);
  const yAnim = interpolate(
    clamp(sp(frame, enterFrame, { damping: 22, stiffness: 260, mass: 0.7 })),
    [0, 1], [44, 0]
  );
  return (
    <div style={{
      position: 'absolute',
      left: x, top: y,
      opacity: op * 0.80,
      transform: `translateY(${yAnim}px) rotate(${rot}deg)`,
      background: 'rgba(255,255,255,0.046)',
      border: '1px solid rgba(255,255,255,0.09)',
      borderRadius: 10,
      padding: '10px 14px',
      minWidth: 180,
      backdropFilter: 'blur(6px)',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 5,
      }}>
        <div style={{
          fontFamily: FONT.sans, fontSize: 11, fontWeight: 600,
          color: 'rgba(255,255,255,0.65)',
        }}>
          {title}
        </div>
        <div style={{
          width: 6, height: 6, borderRadius: '50%',
          background: 'rgba(239,68,68,0.8)', flexShrink: 0,
          boxShadow: '0 0 5px rgba(239,68,68,0.5)',
        }} />
      </div>
      <div style={{
        fontFamily: FONT.mono, fontSize: 9,
        color: 'rgba(255,255,255,0.30)', letterSpacing: '0.04em',
      }}>
        {sub}
      </div>
    </div>
  );
}

// ─── Kinetic caption bar — bottom-of-screen caption for any act ───────────────
function Caption({ text, frame, enterFrame, exitFrame, color = 'rgba(255,255,255,0.72)' }) {
  const op = fi(frame, [enterFrame, enterFrame + 10], [0, 1], easeOut) *
             fi(frame, [exitFrame - 10, exitFrame], [1, 0], easeOut);
  const y  = interpolate(
    clamp(sp(frame, enterFrame, { damping: 24, stiffness: 280, mass: 0.6 })),
    [0, 1], [16, 0]
  );
  return (
    <div style={{
      position: 'absolute', bottom: '5%', left: '50%',
      transform: `translateX(-50%) translateY(${y}px)`,
      opacity: op,
      fontFamily: FONT.display, fontSize: 22, fontWeight: 600,
      color, letterSpacing: '-0.01em', textAlign: 'center',
      textShadow: '0 2px 12px rgba(0,0,0,0.6)',
      whiteSpace: 'nowrap',
    }}>
      {text}
    </div>
  );
}

// ─── ACT 1: INTERRUPT (0–147f, 0–4.9s) ───────────────────────────────────────
// Pure black. Hard-cut word-by-word. Hits fast — 2s for the hook, 2s to land.
function Act1Interrupt({ content }) {
  const frame = useCurrentFrame();
  const words = content.hookWords;

  // Beat-synced cadence — each word lands ON a beat (BEAT≈18.37f @ 98 BPM).
  // Humans feel off-beat text subconsciously; on-beat reads as intentional and
  // gives each word ~0.6s to land (also kills the "too fast" feel).
  const wordFrames = [1, 2, 3, 4, 5, 6, 7].map((n) => Math.round(n * BEAT)).slice(0, words.length);
  const lastWordF = wordFrames[wordFrames.length - 1] ?? 92;

  // Subline lands on the next beat after the last word; whole line holds, cuts on a beat.
  const subStart = lastWordF + Math.round(BEAT);
  const subOp = fi(frame, [subStart, subStart + 14], [0, 1], easeOut);
  const subY  = interpolate(clamp(sp(frame, subStart, { damping: 22, stiffness: 240 })), [0, 1], [12, 0]);

  const exitOp = fi(frame, [136, 147], [1, 0], easeInOut);

  const cursorVisible = frame > lastWordF + 6 && frame < 134;
  const cursorOn      = cursorVisible && Math.floor((frame - lastWordF) / 7) % 2 === 0;

  // Subtle red vignette builds during hook — signals danger/urgency
  const vignetteOp = fi(frame, [20, 100], [0, 0.18], easeInOut);

  return (
    <AbsoluteFill style={{
      background: '#000000',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      opacity: exitOp,
    }}>
      {/* Red vignette */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(ellipse at center, transparent 30%, rgba(120,20,20,${vignetteOp}) 100%)`,
      }} />

      {/* Word-by-word hook */}
      <div style={{
        display: 'flex', flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '0 18px',
        maxWidth: 980,
        padding: '0 48px',
      }}>
        {words.map((word, i) => {
          const startF  = wordFrames[i] ?? (5 + i * 12);
          const visible = frame >= startF;
          const isLast  = i === words.length - 1;
          // Each word slightly scales down from 1.15 to 1.0 on entry
          const entryScale = visible
            ? 1 + clamp(interpolate(frame - startF, [0, 8], [0.15, 0])) * 0
            : 1;
          return (
            <span key={`${word}-${i}`} style={{
              fontFamily: FONT.display,
              fontSize: 86,
              fontWeight: 800,
              letterSpacing: '-0.04em',
              lineHeight: 1.0,
              color: isLast ? C.greenPale : C.white,
              opacity: visible ? 1 : 0,
              textShadow: isLast
                ? `0 0 48px rgba(155,211,131,0.45), 0 0 100px rgba(155,211,131,0.18)`
                : 'none',
              transform: `scale(${visible ? 1 : 1.15})`,
              transition: 'none',
            }}>
              {word}
            </span>
          );
        })}
        {cursorOn && (
          <span style={{
            fontFamily: FONT.mono, fontSize: 86,
            fontWeight: 200, color: 'rgba(155,211,131,0.7)',
            lineHeight: 1.0, marginLeft: -4,
          }}>|</span>
        )}
      </div>

      {/* Sub-hook: the inner thought */}
      <div style={{
        marginTop: 22, opacity: subOp, transform: `translateY(${subY}px)`,
        textAlign: 'center', padding: '0 80px',
      }}>
        <div style={{
          fontFamily: FONT.mono, fontSize: 13,
          letterSpacing: '0.16em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.38)',
        }}>
          {content.hookSubline}
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ─── ACT 2: IDENTIFY (147–368f, 4.9–12.3s) ───────────────────────────────────
// Pain cards that name the exact feeling. Role-specific UI fragments in corners.
// Kept clear of the central band (38–62%) so they never sit under the hero line.
const PAIN_POSITIONS = [
  { x: '3%',  y: '7%',  r: -4 },
  { x: '56%', y: '5%',  r:  3 },
  { x: '3%',  y: '72%', r: -3 },
  { x: '57%', y: '73%', r:  5 },
];

function Act2Identify({ content, userType }) {
  const frame = useCurrentFrame();
  const cardDelay = 20;
  const cards = content.painCards;

  // Hero identity line enters at ~f132 relative and OWNS the screen — the
  // scattered pain cards recede to the background as it lands (no overlap).
  const heroOp = fi(frame, [132, 156], [0, 1], easeOut);
  const heroY  = interpolate(clamp(sp(frame, 132, { damping: 16, stiffness: 240 })), [0, 1], [28, 0]);
  const recede = fi(frame, [116, 140], [1, 0.16], easeInOut);
  const exitOp = fi(frame, [204, 221], [1, 0], easeInOut);

  const identityLine  = content.identityLine;
  const accentWord    = content.identityAccent;
  const parts = identityLine.split(accentWord);
  const heroEl = parts.length > 1 ? (
    <>{parts[0]}<RedAccent>{accentWord}</RedAccent>{parts[1]}</>
  ) : identityLine;

  // Role-specific listing fragments
  const fragments = LISTING_FRAGMENTS_BY_TYPE[userType] || LISTING_FRAGMENTS_BY_TYPE.tenant;

  return (
    <Bg style={{ opacity: exitOp }}>
      <Grain />

      {/* Pain cards */}
      {cards.map((card, i) => {
        const startF    = i * cardDelay + 6;
        const entryProg = clamp(sp(frame, startF, { damping: 22, stiffness: 320, mass: 0.55 }));
        const cardY     = interpolate(entryProg, [0, 1], [80, 0]);
        const cardOp    = fi(frame, [startF, startF + 12], [0, 1]);
        const pos       = PAIN_POSITIONS[i] || { x: `${20 + i * 18}%`, y: `${15 + i * 12}%`, r: 0 };

        // Subtle red glow on entry
        const glowOp = fi(frame, [startF, startF + 22], [0.4, 0]);

        return (
          <div key={card.title} style={{
            position: 'absolute', left: pos.x, top: pos.y,
            transform: `translateY(${cardY}px) rotate(${pos.r}deg)`,
            opacity: cardOp * recede,
          }}>
            {/* Glow splash on entry */}
            <div style={{
              position: 'absolute', inset: -20, borderRadius: 30,
              background: `rgba(239,68,68,${glowOp * 0.15})`,
              filter: 'blur(12px)', pointerEvents: 'none',
            }} />
            <div style={{
              position: 'relative',
              background: 'rgba(255,255,255,0.058)',
              border: '1px solid rgba(255,255,255,0.13)',
              borderRadius: 14, padding: '14px 20px', minWidth: 215,
              backdropFilter: 'blur(10px)',
              boxShadow: '0 12px 30px rgba(0,0,0,0.3)',
            }}>
              <div style={{
                position: 'absolute', top: -10, right: -10,
                width: 24, height: 24, borderRadius: '50%',
                background: '#dc2626',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, color: 'white', fontWeight: 700,
                boxShadow: '0 4px 14px rgba(220,38,38,0.55)',
              }}>✕</div>
              <div style={{
                color: 'rgba(255,255,255,0.90)', fontSize: 13,
                fontWeight: 600, fontFamily: FONT.sans, lineHeight: 1.3,
              }}>
                {card.title}
              </div>
              <div style={{
                color: 'rgba(255,255,255,0.44)', fontSize: 11,
                marginTop: 5, fontFamily: FONT.mono, lineHeight: 1.4,
              }}>
                {card.sub}
              </div>
            </div>
          </div>
        );
      })}

      {/* Role-specific buried listing UI fragments — recede with the cards */}
      <div style={{ opacity: recede }}>
        {fragments.map((lf) => (
          <BuriedListing
            key={lf.title}
            frame={frame}
            enterFrame={lf.ef}
            title={lf.title}
            sub={lf.sub}
            x={lf.x}
            y={lf.y}
            rot={lf.r}
          />
        ))}
      </div>

      {/* Hero identity line — the empathy moment */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        opacity: heroOp, transform: `translateY(${heroY}px)`,
        textAlign: 'center', padding: '0 72px',
      }}>
        <div style={{
          fontFamily: FONT.display, fontSize: 60, fontWeight: 700,
          color: C.white, letterSpacing: '-0.03em', lineHeight: 1.1,
          textShadow: '0 2px 24px rgba(0,0,0,0.5)',
        }}>
          {heroEl}
        </div>
        <div style={{
          marginTop: 16,
          fontFamily: FONT.mono, fontSize: 12,
          letterSpacing: '0.16em', color: 'rgba(255,255,255,0.30)',
          textTransform: 'uppercase',
        }}>
          And the market doesn't care.
        </div>
      </div>
    </Bg>
  );
}

// ─── ACT 3: AGITATE (368–588f, 12.3–19.6s) ───────────────────────────────────
// Three kinetic lines. Ghost phone on the right shows a flooded inbox.
// Anguish kicker at the bottom lands at ~f168.
function Act3Agitate({ content }) {
  const frame = useCurrentFrame();
  const lines = content.agitateLines;
  const lineFrames = [6, 62, 118];

  const anguishOp = fi(frame, [168, 192], [0, 1], easeOut);
  const anguishY  = interpolate(clamp(sp(frame, 168, { damping: 18, stiffness: 200 })), [0, 1], [22, 0]);
  const exitOp    = fi(frame, [208, 228], [1, 0], easeInOut);

  const anguishLine   = content.anguishLine;
  const anguishAccent = content.anguishAccent;
  const anguishParts  = anguishLine.split(anguishAccent);
  const anguishEl = anguishParts.length > 1 ? (
    <>{anguishParts[0]}<Accent>{anguishAccent}</Accent>{anguishParts[1]}</>
  ) : anguishLine;

  // Ghost phone fades in at ~f70
  const ghostOp = fi(frame, [70, 115], [0, 0.24], easeOut);

  // Tension vignette builds slowly
  const tensionOp = fi(frame, [60, 200], [0, 0.25], easeInOut);

  return (
    <AbsoluteFill style={{
      background: `linear-gradient(170deg, #040d1a 0%, ${C.navy} 55%, #08152a 100%)`,
      opacity: exitOp, fontFamily: FONT.sans,
    }}>
      <Grain />

      {/* Red tension vignette */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(ellipse at 50% 100%, rgba(180,30,30,${tensionOp}) 0%, transparent 55%)`,
      }} />

      {/* Ghost phone — flooded inbox "before" visual */}
      <div style={{
        position: 'absolute',
        right: '4%',
        top: '50%',
        transform: 'translateY(-50%)',
        opacity: ghostOp,
        pointerEvents: 'none',
      }}>
        <PhoneFrame width={260} height={480}>
          <div style={{
            padding: '52px 10px 10px',
            display: 'flex', flexDirection: 'column', gap: 5,
          }}>
            {[...Array(10)].map((_, i) => (
              <div key={i} style={{
                height: 30, borderRadius: 6,
                background: i % 3 === 0
                  ? 'rgba(239,68,68,0.14)'
                  : 'rgba(255,255,255,0.04)',
                border: i % 3 === 0
                  ? '1px solid rgba(239,68,68,0.25)'
                  : '1px solid rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center',
                paddingLeft: 9, gap: 7,
              }}>
                <div style={{
                  width: 15, height: 15, borderRadius: '50%',
                  background: i % 3 === 0
                    ? 'rgba(239,68,68,0.35)'
                    : 'rgba(255,255,255,0.09)',
                  flexShrink: 0,
                }} />
                <div style={{
                  flex: 1, height: 5, borderRadius: 3,
                  background: 'rgba(255,255,255,0.10)',
                  maxWidth: `${48 + (i * 19) % 42}%`,
                }} />
                {i % 3 === 0 && (
                  <div style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: '#ef4444', marginRight: 7,
                    boxShadow: '0 0 5px #ef4444', flexShrink: 0,
                  }} />
                )}
              </div>
            ))}
            <div style={{
              textAlign: 'center', marginTop: 5,
              fontFamily: FONT.mono, fontSize: 9,
              color: 'rgba(239,68,68,0.55)',
              letterSpacing: '0.1em',
            }}>
              47 UNREAD · PORTAL INBOX
            </div>
          </div>
        </PhoneFrame>
      </div>

      {/* Agitate lines — left-aligned, slide in from left */}
      <div style={{
        position: 'absolute', left: 80, top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex', flexDirection: 'column', gap: 34,
        maxWidth: 640,
      }}>
        {lines.map((line, i) => {
          const startF    = lineFrames[i] ?? i * 60 + 6;
          const entryProg = clamp(sp(frame, startF, { damping: 24, stiffness: 170, mass: 1.0 }));
          const lineX     = interpolate(entryProg, [0, 1], [-70, 0]);
          const lineOp    = fi(frame, [startF, startF + 20], [0, 1], easeOut);
          const dimProg   = i < lines.length - 1
            ? fi(frame, [lineFrames[i + 1] + 8, lineFrames[i + 1] + 28], [1, 0.26])
            : 1;

          // Red rule under each line (draws left to right)
          const ruleW = fi(frame, [startF + 6, startF + 28], [0, 140]) * (lineOp > 0.4 ? 1 : 0);

          return (
            <div key={line} style={{ transform: `translateX(${lineX}px)`, opacity: lineOp * dimProg }}>
              <div style={{
                fontFamily: FONT.display, fontSize: 38, fontWeight: 600,
                color: C.white, letterSpacing: '-0.025em', lineHeight: 1.2,
              }}>
                {line}
              </div>
              <div style={{
                height: 2, width: ruleW,
                background: 'linear-gradient(90deg, rgba(239,68,68,0.75), transparent)',
                marginTop: 8, borderRadius: 1,
              }} />
            </div>
          );
        })}
      </div>

      {/* Anguish kicker — bottom centre */}
      <div style={{
        position: 'absolute', bottom: '10%', left: 0, right: 0,
        textAlign: 'center', opacity: anguishOp,
        transform: `translateY(${anguishY}px)`, padding: '0 60px',
      }}>
        <div style={{
          fontFamily: FONT.display, fontSize: 46, fontWeight: 700,
          color: C.white, letterSpacing: '-0.03em', lineHeight: 1.1,
        }}>
          {anguishEl}
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ─── ACT 4: BRIDGE (588–661f, 19.6–22.0s) ────────────────────────────────────
// ~73f = 1 bar. Maximum tension, then the light breaks.
// Hard cut into DROP 1 — no exit fade.
function Act4Bridge({ content }) {
  const frame = useCurrentFrame();

  const glowScale = interpolate(
    clamp(sp(frame, 4, { damping: 28, stiffness: 80, mass: 1.4 })),
    [0, 1], [0.18, 1]
  );
  const glowOp = fi(frame, [4, 38], [0, 0.72], easeOut);

  const lineOp = fi(frame, [12, 36], [0, 1], easeOut);
  const lineY  = interpolate(clamp(sp(frame, 12, { damping: 22, stiffness: 200 })), [0, 1], [36, 0]);

  const subOp  = fi(frame, [36, 58], [0, 1], easeOut);
  const pillOp = fi(frame, [4, 20], [0, 1], easeOut);

  const bridgeLine = content.bridgeLine;
  const accent     = content.bridgeAccent;
  const accentIdx  = bridgeLine.toLowerCase().indexOf(accent.toLowerCase());
  const bridgeEl = accentIdx !== -1 ? (
    <>
      {bridgeLine.slice(0, accentIdx)}
      <Accent>{bridgeLine.slice(accentIdx, accentIdx + accent.length)}</Accent>
      {bridgeLine.slice(accentIdx + accent.length)}
    </>
  ) : bridgeLine;

  return (
    <AbsoluteFill style={{
      background: `linear-gradient(160deg, ${C.navy} 0%, ${C.navyLight} 100%)`,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: FONT.sans,
    }}>
      {/* Light burst — the turn */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        width: 800, height: 800,
        transform: `translate(-50%, -50%) scale(${glowScale})`,
        borderRadius: '50%',
        background: `radial-gradient(circle, rgba(82,168,50,${glowOp * 0.28}) 0%, rgba(38,112,168,${glowOp * 0.12}) 45%, transparent 70%)`,
        filter: 'blur(50px)', pointerEvents: 'none',
      }} />

      <div style={{
        opacity: pillOp, marginBottom: 24,
        background: 'rgba(82,168,50,0.15)', border: '1px solid rgba(82,168,50,0.38)',
        borderRadius: 100, padding: '7px 22px',
      }}>
        <Eyebrow color={C.greenPale}>A different way entirely</Eyebrow>
      </div>

      <div style={{
        opacity: lineOp, transform: `translateY(${lineY}px)`,
        textAlign: 'center', padding: '0 80px', maxWidth: 1040,
      }}>
        <div style={{
          fontFamily: FONT.display, fontSize: 74, fontWeight: 700,
          color: C.white, letterSpacing: '-0.035em', lineHeight: 1.07,
        }}>
          {bridgeEl}
        </div>
      </div>

      <div style={{
        marginTop: 26, opacity: subOp,
        textAlign: 'center', padding: '0 80px',
      }}>
        <div style={{
          fontFamily: FONT.sans, fontSize: 22, fontWeight: 300,
          color: 'rgba(255,255,255,0.58)', letterSpacing: '-0.01em',
        }}>
          {content.bridgeSub}
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ─── ACT 5: REVEAL (661–1176f, 22–39.2s) — DROP 1 ────────────────────────────
// 515 frames (7 bars). The big product moment.
// Sub-acts:
//   0–65f    : Brand name cinematic entrance (on the beat drop)
//   60–230f  : Phone + first SwipeCard
//   220–370f : SwipeAnimation — card swipes → LIKE → MATCH pop
//   340–515f : Before/After wipe + mechanism pills
function Act5Reveal({ content, userType }) {
  const frame = useCurrentFrame();

  // ── Sub-act 1: Brand reveal (0–65f) ─────────────────────────────────────────
  const nameOp = fi(frame, [0, 26], [0, 1], easeInOut);
  const nameY  = interpolate(frame, [0, 32], [48, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeInOut,
  });
  const tagOp  = fi(frame, [28, 56], [0, 1], easeOut);

  // Green flash burst on the DROP
  const dropFlashOp = fi(frame, [0, 12], [0.4, 0], easeOut);

  // ── Sub-act 2: Phone enters (60–130f) ───────────────────────────────────────
  const phoneOp    = fi(frame, [60, 98], [0, 1], easeOut);
  const phoneScale = interpolate(
    clamp(sp(frame, 60, { damping: 20, stiffness: 110, mass: 1.1 })),
    [0, 1], [0.68, 1]
  );
  const phoneX = interpolate(
    clamp(sp(frame, 60, { damping: 20, stiffness: 110, mass: 1.1 })),
    [0, 1], [100, 0]
  );

  // ── Sub-act 4: Before/After wipe (340–460f) ──────────────────────────────────
  const wipeProgress = fi(frame, [340, 440], [0, 1], easeInOut);
  const wipeOp       = fi(frame, [335, 360], [0, 1], easeOut);
  const beforeX      = interpolate(wipeProgress, [0, 1], [0, -14]);
  const afterX       = interpolate(wipeProgress, [0, 1], [0, 14]);

  // Mechanism pills (370–460f)
  const mechOp = fi(frame, [370, 410], [0, 1], easeOut);
  const mechY  = interpolate(clamp(sp(frame, 370, { damping: 22, stiffness: 190 })), [0, 1], [22, 0]);

  // Exit fade
  const exitOp = fi(frame, [492, 515], [1, 0], easeInOut);

  const cardData = CARD_DATA_BY_TYPE[userType] || CARD_DATA_BY_TYPE.tenant;

  // Role-specific tagline under the brand name
  const taglines = {
    tenant:   'Post once. Match with landlords who already want you.',
    landlord: 'List free. Match with tenants who already fit.',
    agent:    'Get verified demand. Build your reputation.',
    investor: 'See real demand data before you commit.',
  };
  const roleTagline = taglines[userType] || taglines.tenant;

  return (
    <AbsoluteFill style={{
      background: `linear-gradient(160deg, ${C.navyMid} 0%, ${C.navy} 100%)`,
      opacity: exitOp, fontFamily: FONT.sans,
    }}>
      {/* Green flash on the DROP */}
      {frame < 14 && (
        <div style={{
          position: 'absolute', inset: 0,
          background: `rgba(82,168,50,${dropFlashOp * 0.28})`,
          pointerEvents: 'none', zIndex: 20,
        }} />
      )}

      <Grain />

      {/* Ambient glow — grows with the groove */}
      <div style={{
        position: 'absolute', top: '30%', left: '50%',
        width: 700, height: 500,
        transform: 'translate(-50%, -50%)',
        borderRadius: '50%',
        background: `radial-gradient(ellipse, rgba(82,168,50,${fi(frame, [0, 80], [0.06, 0.16])}) 0%, transparent 65%)`,
        filter: 'blur(70px)', pointerEvents: 'none',
      }} />

      {/* Brand name — drops in with the beat */}
      <div style={{
        position: 'absolute', top: '5%', left: 0, right: 0,
        textAlign: 'center',
        opacity: nameOp, transform: `translateY(${nameY}px)`,
      }}>
        <Eyebrow color="rgba(255,255,255,0.34)" style={{ marginBottom: 10 }}>
          {content.revealLabel} · INTRODUCING
        </Eyebrow>
        <div style={{
          fontFamily: FONT.display, fontSize: 100, fontWeight: 800,
          color: C.white, letterSpacing: '-0.048em', lineHeight: 1,
          textShadow: '0 0 70px rgba(82,168,50,0.30), 0 4px 32px rgba(0,0,0,0.5)',
        }}>
          Rent<span style={{ color: C.greenPale }}>Eazy</span>
        </div>
        <div style={{
          opacity: tagOp, marginTop: 12,
          fontFamily: FONT.sans, fontSize: 19, fontWeight: 300,
          color: 'rgba(255,255,255,0.50)', letterSpacing: '-0.01em',
          maxWidth: 560, margin: '12px auto 0',
        }}>
          {roleTagline}
        </div>
      </div>

      {/* Phone frame with swipe demo — centred and prominent */}
      <div style={{
        position: 'absolute',
        left: '50%',
        top: '53%',
        transform: `translate(-50%, -50%) scale(${phoneScale}) translateX(${phoneX}px)`,
        opacity: phoneOp,
      }}>
        <PhoneFrame width={310} height={580}>
          {/* Static card shown 60–219f */}
          {frame >= 60 && frame < 220 && (
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
              <SwipeCard
                imagePath={cardData.image}
                matchScore={cardData.matchScore}
                title={cardData.title}
                location={cardData.location}
                price={cardData.price}
                tags={cardData.tags}
                verified={true}
                repScore={cardData.repScore}
                enterFrame={8}
                width={290}
                height={560}
              />
            </div>
          )}

          {/* Swipe animation 220–515f */}
          {frame >= 220 && (
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
              <SwipeAnimation
                imagePath={cardData.image}
                counterImage={cardData.counterImage}
                matchLine={cardData.matchLine}
                matchScore={cardData.matchScore}
                title={cardData.title}
                location={cardData.location}
                price={cardData.price}
                tags={cardData.tags}
                startFrame={220}
                width={290}
                height={560}
              />
            </div>
          )}
        </PhoneFrame>
      </div>

      {/* Before/After split screen */}
      <div style={{
        position: 'absolute', bottom: '3%', left: '2%', right: '2%',
        display: 'flex', gap: 14,
        opacity: wipeOp, height: '26%',
      }}>
        <div style={{
          flex: 1,
          background: 'rgba(239,68,68,0.07)',
          border: '1px solid rgba(239,68,68,0.22)',
          borderRadius: 18, padding: '14px 18px',
          transform: `translateX(${beforeX}px)`, overflow: 'hidden',
        }}>
          <Eyebrow color="rgba(239,68,68,0.75)" style={{ marginBottom: 8 }}>
            Before — {BEFORE_AFTER.before.label}
          </Eyebrow>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {BEFORE_AFTER.before.points.map(p => (
              <div key={p} style={{
                fontSize: 11, color: 'rgba(255,255,255,0.50)',
                display: 'flex', gap: 8, alignItems: 'flex-start',
                fontFamily: FONT.sans,
              }}>
                <span style={{ color: '#ef4444', flexShrink: 0 }}>—</span> {p}
              </div>
            ))}
          </div>
        </div>

        <div style={{
          width: 2, alignSelf: 'stretch',
          background: `linear-gradient(to bottom, transparent, ${C.greenPale}, transparent)`,
          opacity: wipeProgress, flexShrink: 0,
        }} />

        <div style={{
          flex: 1,
          background: 'rgba(82,168,50,0.10)',
          border: '1px solid rgba(82,168,50,0.32)',
          borderRadius: 18, padding: '14px 18px',
          transform: `translateX(${afterX}px)`, overflow: 'hidden',
        }}>
          <Eyebrow color={C.greenPale} style={{ marginBottom: 8 }}>
            After — {BEFORE_AFTER.after.label}
          </Eyebrow>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {BEFORE_AFTER.after.points.map(p => (
              <div key={p} style={{
                fontSize: 11, color: 'rgba(255,255,255,0.74)',
                display: 'flex', gap: 8, alignItems: 'flex-start',
                fontFamily: FONT.sans,
              }}>
                <span style={{ color: C.greenPale, flexShrink: 0 }}>✓</span> {p}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mechanism pills — top right, after the swipe */}
      <div style={{
        position: 'absolute',
        top: '27%', right: '2%',
        display: 'flex', flexDirection: 'column', gap: 10,
        opacity: mechOp, transform: `translateY(${mechY}px)`,
        width: 230,
      }}>
        {[
          { label: 'Match only when both like', highlight: true },
          { label: 'No cold outreach needed', highlight: false },
          { label: '9 match criteria', highlight: false },
          { label: 'Reputation travels', highlight: false },
        ].map((pill, i) => (
          <div key={pill.label} style={{
            background: pill.highlight ? 'rgba(82,168,50,0.22)' : 'rgba(255,255,255,0.07)',
            border: `1px solid ${pill.highlight ? 'rgba(82,168,50,0.50)' : 'rgba(255,255,255,0.13)'}`,
            borderRadius: 100, padding: '9px 16px',
            fontFamily: FONT.sans, fontSize: 13,
            color: pill.highlight ? C.greenPale : 'rgba(255,255,255,0.68)',
            fontWeight: pill.highlight ? 600 : 400,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ color: C.greenPale, fontSize: 11 }}>✓</span>
            {pill.label}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
}

// ─── ACT 6: PROOF (1176–1397f, 39.2–46.6s) ───────────────────────────────────
// Rides the groove, dims into the breakdown. Real platform facts only.
function Act6Proof({ content }) {
  const frame = useCurrentFrame();

  const hookOp = fi(frame, [8, 35], [0, 1], easeOut);
  const hookY  = interpolate(clamp(sp(frame, 8, { damping: 20, stiffness: 180 })), [0, 1], [24, 0]);

  const cardDelay = 44;
  const exitOp    = fi(frame, [196, 220], [1, 0], easeInOut);

  const featOp  = fi(frame, [148, 175], [0, 1], easeOut);
  const featY   = interpolate(clamp(sp(frame, 148, { damping: 22, stiffness: 180 })), [0, 1], [20, 0]);

  const gtmOp   = fi(frame, [178, 205], [0, 1], easeOut);

  // Breakdown dim at ~f168
  const breakdownDim = fi(frame, [165, 190], [1.0, 0.70], easeInOut);

  return (
    <AbsoluteFill style={{
      background: `linear-gradient(155deg, ${C.navyLight} 0%, ${C.navy} 55%, ${C.navyMid} 100%)`,
      opacity: exitOp * breakdownDim, fontFamily: FONT.sans,
    }}>
      <Grain />

      <div style={{
        position: 'absolute', top: '6%', left: 0, right: 0,
        textAlign: 'center', opacity: hookOp, transform: `translateY(${hookY}px)`,
      }}>
        <Eyebrow color={C.greenPale} style={{ marginBottom: 10 }}>
          What you actually get
        </Eyebrow>
        <div style={{
          fontFamily: FONT.display, fontSize: 52, fontWeight: 700,
          color: C.white, letterSpacing: '-0.03em', lineHeight: 1.1,
        }}>
          {content.proofHook}
        </div>
      </div>

      {/* Platform fact cards — counting animation */}
      <div style={{
        position: 'absolute', top: '28%',
        left: '50%', transform: 'translateX(-50%)',
        display: 'flex', gap: 16, width: 'max-content',
      }}>
        {PLATFORM_FACTS.map((fact, i) => {
          const startF  = i * cardDelay + 40;
          const cardOp  = fi(frame, [startF, startF + 20], [0, 1], easeOut);
          const cardY   = interpolate(clamp(sp(frame, startF, { damping: 20, stiffness: 210 })), [0, 1], [32, 0]);

          let displayNum;
          if (fact.count === 0) {
            displayNum = 'FREE';
          } else if (fact.count === 2) {
            const counted = Math.round(interpolate(frame, [startF + 10, startF + 36], [0, fact.count], {
              extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOut,
            }));
            displayNum = `${counted}×`;
          } else {
            const counted = Math.round(interpolate(frame, [startF + 10, startF + 48], [0, fact.count], {
              extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOut,
            }));
            displayNum = counted.toString();
          }

          return (
            <div key={fact.label} style={{
              opacity: cardOp, transform: `translateY(${cardY}px)`,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 20, padding: '20px 22px', minWidth: 152,
              textAlign: 'center', backdropFilter: 'blur(10px)',
              boxShadow: '0 16px 42px rgba(0,0,0,0.38)',
            }}>
              <div style={{
                fontFamily: FONT.mono,
                fontSize: fact.count === 0 ? 26 : 46,
                fontWeight: 700, color: C.greenPale,
                letterSpacing: '-0.02em', lineHeight: 1,
                textShadow: `0 0 22px rgba(155,211,131,0.38)`,
              }}>
                {displayNum}
              </div>
              <div style={{
                marginTop: 8, fontFamily: FONT.sans,
                fontSize: 12, fontWeight: 500,
                color: 'rgba(255,255,255,0.72)',
              }}>
                {fact.label}
              </div>
              <div style={{
                marginTop: 5, fontFamily: FONT.mono,
                fontSize: 9, letterSpacing: '0.08em',
                color: 'rgba(255,255,255,0.32)',
              }}>
                {fact.sub}
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature checklist */}
      <div style={{
        position: 'absolute', bottom: '14%',
        left: '50%', transform: `translateX(-50%) translateY(${featY}px)`,
        opacity: featOp,
        display: 'flex', flexDirection: 'column', gap: 9,
        minWidth: 540,
      }}>
        {PLATFORM_FEATURES.slice(0, 4).map((feat, i) => {
          const featItemOp = fi(frame, [148 + i * 12, 168 + i * 12], [0, 1], easeOut);
          return (
            <div key={feat} style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: featItemOp }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%',
                background: 'rgba(82,168,50,0.25)',
                border: '1px solid rgba(82,168,50,0.52)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span style={{ color: C.greenPale, fontSize: 11, fontWeight: 700 }}>✓</span>
              </div>
              <div style={{ fontFamily: FONT.sans, fontSize: 14, color: 'rgba(255,255,255,0.74)' }}>
                {feat}
              </div>
            </div>
          );
        })}
      </div>

      {/* East London GTM honest badge */}
      <div style={{
        position: 'absolute', bottom: '4%', left: 0, right: 0,
        textAlign: 'center', opacity: gtmOp,
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          background: 'rgba(38,112,168,0.15)',
          border: '1px solid rgba(91,196,255,0.25)',
          borderRadius: 100, padding: '8px 24px',
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: C.bluePale, boxShadow: `0 0 8px ${C.bluePale}`,
          }} />
          <span style={{
            fontFamily: FONT.mono, fontSize: 11,
            color: C.bluePale, letterSpacing: '0.14em',
          }}>
            LIVE IN EAST LONDON · GROWING NOW · EARLY-MOVER ADVANTAGE
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ─── ACT 7: CLOSE (1397–1800f, 46.6–60s) — DROP 2 @ frame 1440 ───────────────
// 403 frames. Quiet identity shot (breakdown), then CTA explodes on DROP 2.
// The consequence line names the exact cost of doing nothing.
function Act7Close({ content }) {
  const frame = useCurrentFrame();
  const beat = (n) => Math.round(n * BEAT); // beat-synced reveal frames

  const glowPulse = 0.5 + Math.sin(frame / 13) * 0.13;

  // Closing line — lands on beat 1, the calm before the drop
  const lineOp = fi(frame, [beat(0.4), beat(1.4)], [0, 1], easeOut);
  const lineY  = interpolate(clamp(sp(frame, beat(0.4), { damping: 20, stiffness: 200 })), [0, 1], [26, 0]);

  const identityFrame = content.identityFrame;
  const accentWord    = content.identityAccentWord;
  const idParts = identityFrame.split(accentWord);
  const idEl = idParts.length > 1 ? (
    <>{idParts[0]}<Accent>{accentWord}</Accent>{idParts[1]}</>
  ) : identityFrame;

  // Logo lockup — settles in on beat 2, just before the drop
  const logoProg  = clamp(sp(frame, beat(1.6), { damping: 18, stiffness: 180, mass: 0.9 }));
  const logoScale = interpolate(logoProg, [0, 1], [0.78, 1]);
  const logoOp    = fi(frame, [beat(1.6), beat(2.4)], [0, 1], easeOut);

  // CTA — springs in ON DROP 2 (rel frame 43 = abs 1440)
  const ctaDrop  = 43;
  const ctaScale = 0.58 + clamp(sp(frame, ctaDrop, { damping: 9, stiffness: 400, mass: 0.50 })) * 0.42;
  const ctaOp    = fi(frame, [ctaDrop, ctaDrop + 16], [0, 1], easeOut);
  const ctaGlow  = 0.5 + Math.sin(frame / 10) * 0.15;
  const dropFlash = fi(frame, [ctaDrop, ctaDrop + 15], [0.38, 0], easeOut);

  // Domain + reassurance land on the following beats
  const domOp    = fi(frame, [beat(4), beat(5)], [0, 1], easeOut);
  const socialOp = fi(frame, [beat(6.5), beat(7.5)], [0, 1], easeOut);

  // Fade to black over the final ~1.2s → seamless loop into Act 1's black open,
  // and a clean, deliberate finish instead of a hard cut.
  const endFade = fi(frame, [368, 402], [0, 1], easeInOut);

  return (
    <AbsoluteFill style={{
      background: `linear-gradient(160deg, ${C.navy} 0%, ${C.navyMid} 100%)`,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: FONT.sans,
    }}>
      {/* Green flash on DROP 2 */}
      {frame >= ctaDrop && frame <= ctaDrop + 15 && (
        <div style={{
          position: 'absolute', inset: 0,
          background: `rgba(82,168,50,${dropFlash})`,
          pointerEvents: 'none', zIndex: 20,
        }} />
      )}

      {/* Ambient pulsing glow */}
      <div style={{
        position: 'absolute', top: '46%', left: '50%',
        width: 720, height: 460,
        transform: 'translate(-50%, -50%)',
        borderRadius: '50%',
        background: `radial-gradient(ellipse, rgba(82,168,50,${glowPulse * 0.22}) 0%, transparent 65%)`,
        filter: 'blur(70px)', pointerEvents: 'none',
      }} />

      {/* Closing line */}
      <div style={{
        opacity: lineOp, transform: `translateY(${lineY}px)`,
        textAlign: 'center', padding: '0 80px', maxWidth: 920, zIndex: 1,
        marginBottom: 30,
      }}>
        <div style={{
          fontFamily: FONT.display, fontSize: 54, fontWeight: 800,
          color: C.white, letterSpacing: '-0.04em', lineHeight: 1.04,
        }}>
          {idEl}
        </div>
      </div>

      {/* Logo lockup — the real RentEazy mark on a clean card */}
      <div style={{
        opacity: logoOp,
        transform: `scale(${logoScale})`,
        background: '#ffffff',
        borderRadius: 28,
        padding: '26px 44px',
        boxShadow: '0 30px 70px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.6), 0 0 60px rgba(82,168,50,0.25)',
        zIndex: 1,
      }}>
        <Img
          src={staticFile('/images/renteazy-main-logo-transparent.png')}
          style={{ width: 230, height: 'auto', display: 'block' }}
        />
      </div>

      {/* CTA button — spring-drops on DROP 2 */}
      <div style={{
        marginTop: 30, opacity: ctaOp,
        transform: `scale(${ctaScale})`,
        textAlign: 'center', zIndex: 1,
      }}>
        <div style={{
          background: `linear-gradient(135deg, ${C.green} 0%, ${C.greenDark} 100%)`,
          borderRadius: 100, padding: '22px 64px',
          color: 'white', fontFamily: FONT.display,
          fontSize: 24, fontWeight: 600, display: 'inline-block',
          boxShadow: [
            `0 22px 56px rgba(47,125,50,${ctaGlow * 0.7})`,
            '0 0 0 1px rgba(255,255,255,0.20)',
            '0 2px 0 rgba(255,255,255,0.14) inset',
          ].join(', '),
          letterSpacing: '-0.01em',
        }}>
          {content.ctaLabel}
        </div>
        <div style={{
          marginTop: 11,
          fontFamily: FONT.mono, fontSize: 10,
          letterSpacing: '0.14em', color: 'rgba(255,255,255,0.30)',
          textTransform: 'uppercase',
        }}>
          Takes 2 minutes · No card required
        </div>
      </div>

      {/* Domain + multi-sided reassurance */}
      <div style={{ marginTop: 20, opacity: domOp, zIndex: 1, textAlign: 'center' }}>
        <div style={{
          fontFamily: FONT.mono, fontSize: 12,
          color: 'rgba(255,255,255,0.40)',
          letterSpacing: '0.16em',
        }}>
          renteazy.co.uk
        </div>
      </div>

      <div style={{
        marginTop: 12, opacity: socialOp, zIndex: 1,
        display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center',
      }}>
        <div style={{
          width: 6, height: 6, borderRadius: '50%',
          background: C.greenPale, boxShadow: `0 0 6px ${C.greenPale}`,
        }} />
        <div style={{
          fontFamily: FONT.mono, fontSize: 10,
          letterSpacing: '0.14em', color: 'rgba(155,211,131,0.6)',
          textTransform: 'uppercase',
        }}>
          Renters · Landlords · Agents · Investors — your match is already here
        </div>
      </div>

      {/* Fade to black — clean finish + seamless loop */}
      <div style={{
        position: 'absolute', inset: 0, background: '#000000',
        opacity: endFade, pointerEvents: 'none', zIndex: 40,
      }} />
    </AbsoluteFill>
  );
}

// ─── Root composition ─────────────────────────────────────────────────────────
export default function RentEazyVSL({ userType = 'tenant' }) {
  const resolvedType = ['tenant', 'landlord', 'investor', 'agent'].includes(userType)
    ? userType
    : 'tenant';
  const content = CONTENT[resolvedType];

  return (
    <AbsoluteFill style={{ background: C.navy, fontFamily: FONT.sans }}>
      {/*
        Background music.
        staticFile resolves '/audio/in-it-kadant.mp3' from the public/ directory.
        Volume 0.65 — the track should be *felt*, not background wallpaper.
        Remotion's <Audio> respects the Player's muted prop via context —
        the Player is initiallyMuted; VSLPlayer unmutes it on tap + seekTo(0).
      */}
      <Audio
        src={staticFile('/audio/in-it-kadant.mp3')}
        startFrom={0}
        volume={(f) =>
          interpolate(
            f,
            [0, 14, TOTAL - 60, TOTAL - 4],
            [0, 0.65, 0.65, 0],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeInOut }
          )
        }
      />

      {/* Act 1: INTERRUPT — 0–147f */}
      <Sequence from={A1_START} durationInFrames={A2_START - A1_START}>
        <Act1Interrupt content={content} />
      </Sequence>

      {/* Act 2: IDENTIFY — 147–368f */}
      <Sequence from={A2_START} durationInFrames={A3_START - A2_START}>
        <Act2Identify content={content} userType={resolvedType} />
      </Sequence>

      {/* Act 3: AGITATE — 368–588f */}
      <Sequence from={A3_START} durationInFrames={A4_START - A3_START}>
        <Act3Agitate content={content} />
      </Sequence>

      {/* Act 4: BRIDGE — 588–661f */}
      <Sequence from={A4_START} durationInFrames={A5_START - A4_START}>
        <Act4Bridge content={content} />
      </Sequence>

      {/* Act 5: REVEAL — 661–1176f (DROP 1) */}
      <Sequence from={A5_START} durationInFrames={A6_START - A5_START}>
        <Act5Reveal content={content} userType={resolvedType} />
      </Sequence>

      {/* Act 6: PROOF — 1176–1397f */}
      <Sequence from={A6_START} durationInFrames={A7_START - A6_START}>
        <Act6Proof content={content} />
      </Sequence>

      {/* Act 7: CLOSE — 1397–1800f (DROP 2 @ rel frame 43 = abs 1440) */}
      <Sequence from={A7_START} durationInFrames={TOTAL - A7_START}>
        <Act7Close content={content} />
      </Sequence>
    </AbsoluteFill>
  );
}
