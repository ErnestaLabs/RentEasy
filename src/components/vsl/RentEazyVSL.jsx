/**
 * RentEazyVSL — 7-act cinematic VSL composition.
 *
 * Duration: 60 s × 30 fps = 1800 frames.
 *
 * Music: in-it-kadant.mp3 @ 98 BPM
 *   Beat  = 18.37f   Bar = 73.47f @ 30fps
 *   0–22s  (0–660f)   : quiet build / rising tension
 *   22s    (660f)     : DROP 1 — groove / beat kicks in
 *   24–40s (720–1200f): main groove
 *   40–47s (1200–1410f): breakdown (quiet)
 *   48s    (1440f)   : DROP 2 — biggest peak
 *
 * Act boundaries (snapped to bar grid):
 *   Act 1 INTERRUPT    0–147f   (0–4.9s)   2 bars  — black, word-by-word hook
 *   Act 2 IDENTIFY   147–368f   (4.9–12.3s) 3 bars — pain cards + UI fragment
 *   Act 3 AGITATE    368–588f  (12.3–19.6s) 3 bars — agitate lines + buried listings
 *   Act 4 BRIDGE     588–661f  (19.6–22s)  ~1 bar  — tone-shift, tension peak
 *   Act 5 REVEAL     661–1176f (22–39.2s)  7 bars  — DROP 1: phone + swipe→MATCH
 *   Act 6 PROOF     1176–1397f (39.2–46.6s) 3 bars — groove + breakdown: facts
 *   Act 7 CLOSE     1397–1800f (46.6–60s)  ~5 bars — DROP 2 @1440: CTA spring
 *
 * Total: 1800f = 60s @ 30fps.
 *
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
import CONTENT, { PLATFORM_FACTS, PLATFORM_FEATURES, BEFORE_AFTER } from './vsl-content.js';
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

// ─── Fonts ───────────────────────────────────────────────────────────────────
const FONT = {
  display: "'Bricolage Grotesque Variable', 'Inter', sans-serif",
  sans:    "'Inter', system-ui, sans-serif",
  mono:    "'JetBrains Mono', monospace",
};

// ─── Music timing constants ───────────────────────────────────────────────────
const BEAT  = 18.37;  // frames per beat @ 98 BPM / 30 fps
const BAR   = BEAT * 4; // 73.47f

// Act boundaries
const A1_START =   0;
const A2_START = 147;  // 2 bars
const A3_START = 368;  // 2+3 = 5 bars from 0 = 5*73.47 = 367 ≈ 368
const A4_START = 588;  // 8 bars = 588
const A5_START = 661;  // DROP 1 — ~9 bars = 661
const A6_START = 1176; // A5_START + 7 bars = 661 + 515 = 1176
const A7_START = 1397; // A6_START + 3 bars = 1176 + 221 = 1397
const TOTAL    = 1800;

// Key beat-snap helpers
const DROP2_FRAME = 1440; // 48s — CTA spring target (kept at exact 48s)

// ─── Helpers ─────────────────────────────────────────────────────────────────
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

const sp = (frame, delay, config = {}) =>
  spring({
    frame: frame - delay,
    fps:   30,
    config: { damping: 20, stiffness: 200, mass: 0.8, ...config },
  });

// ─── Shared primitives ───────────────────────────────────────────────────────

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
      textShadow: `0 0 24px rgba(155,211,131,0.45)`,
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
        'radial-gradient(circle at 20% 50%, rgba(38,112,168,0.08) 0%, transparent 60%)',
        'radial-gradient(circle at 80% 20%, rgba(82,168,50,0.06) 0%, transparent 55%)',
      ].join(', '),
    }} />
  );
}

// ─── "Buried listing" fragment — tiny UI element for Act 2/3 "before" flavour ─
function BuriedListing({ title, sub, frame, enterFrame, x, y, rot = 0 }) {
  const op = fi(frame, [enterFrame, enterFrame + 14], [0, 1], easeOut);
  const yAnim = interpolate(
    clamp(sp(frame, enterFrame, { damping: 22, stiffness: 260, mass: 0.7 })),
    [0, 1], [40, 0]
  );
  return (
    <div style={{
      position: 'absolute',
      left: x, top: y,
      opacity: op * 0.78,
      transform: `translateY(${yAnim}px) rotate(${rot}deg)`,
      background: 'rgba(255,255,255,0.042)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 10,
      padding: '10px 14px',
      minWidth: 170,
      backdropFilter: 'blur(6px)',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 5,
      }}>
        <div style={{ fontFamily: FONT.sans, fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>
          {title}
        </div>
        {/* Unread dot */}
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(239,68,68,0.7)', flexShrink: 0 }} />
      </div>
      <div style={{ fontFamily: FONT.mono, fontSize: 9, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.04em' }}>
        {sub}
      </div>
    </div>
  );
}

// ─── ACT 1: INTERRUPT (0–147f, 0–4.9s) ───────────────────────────────────────
// Pure black. Hard-cut word-by-word. Rides the very first bars of the build.
function Act1Interrupt({ content }) {
  const frame = useCurrentFrame();
  const words = content.hookWords;

  // Hard-cut timing — faster cadence to stay inside 2 bars (147f)
  // Words spread across ~0–90f; sub-text at ~95f; exit ~130–147f
  const wordFrames = [6, 20, 32, 44, 54, 64, 72, 80].slice(0, words.length);

  const subOp = fi(frame, [88, 105], [0, 1], easeOut);
  const subY  = interpolate(clamp(sp(frame, 88, { damping: 22, stiffness: 220 })), [0, 1], [14, 0]);

  const exitOp = fi(frame, [128, 146], [1, 0], easeInOut);

  const lastWordF = wordFrames[wordFrames.length - 1] ?? 80;
  const cursorOn  = frame > lastWordF + 8 && Math.floor((frame - lastWordF) / 8) % 2 === 0;

  return (
    <AbsoluteFill style={{
      background: '#000000',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      opacity: exitOp,
    }}>
      <div style={{
        display: 'flex', flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '0 16px',
        maxWidth: 960,
        padding: '0 40px',
      }}>
        {words.map((word, i) => {
          const startF = wordFrames[i] ?? (6 + i * 14);
          const visible = frame >= startF;
          const isLast  = i === words.length - 1;
          return (
            <span key={`${word}-${i}`} style={{
              fontFamily: FONT.display,
              fontSize: 88,
              fontWeight: 800,
              letterSpacing: '-0.04em',
              lineHeight: 1.0,
              color: isLast ? C.greenPale : C.white,
              opacity: visible ? 1 : 0,
              textShadow: isLast ? `0 0 40px rgba(155,211,131,0.4)` : 'none',
            }}>
              {word}
            </span>
          );
        })}
        {cursorOn && (
          <span style={{
            fontFamily: FONT.mono, fontSize: 88,
            fontWeight: 300, color: C.greenPale, lineHeight: 1.0,
          }}>|</span>
        )}
      </div>

      <div style={{ marginTop: 24, opacity: subOp, transform: `translateY(${subY}px)`, textAlign: 'center' }}>
        <div style={{
          fontFamily: FONT.mono, fontSize: 12,
          letterSpacing: '0.22em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.35)',
        }}>
          There's a better way to find a match
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ─── ACT 2: IDENTIFY (147–368f, 4.9–12.3s) ───────────────────────────────────
// Pain cards + a few "buried listing" UI fragments in the corners.
// Ends with identity hero line.
const PAIN_POSITIONS = [
  { x: '4%',  y: '7%',  r: -4 },
  { x: '54%', y: '4%',  r:  3 },
  { x: '6%',  y: '54%', r: -3 },
  { x: '56%', y: '55%', r:  5 },
];

// UI fragments to sprinkle as "before" evidence
const LISTING_FRAGMENTS = [
  { title: 'Hackney 2-bed · £2,400pcm', sub: 'Listed 2 hours ago · 38 enquiries', x: '62%', y: '28%', r:  2, ef: 28 },
  { title: 'Inbox: 22 messages',         sub: 'Landlord last seen 9 days ago',     x: '3%',  y: '28%', r: -2, ef: 48 },
];

function Act2Identify({ content }) {
  const frame = useCurrentFrame();
  const cardDelay = 18;
  const cards = content.painCards;

  const heroOp = fi(frame, [122, 145], [0, 1], easeOut);
  const heroY  = interpolate(clamp(sp(frame, 122, { damping: 16, stiffness: 240 })), [0, 1], [28, 0]);
  const exitOp = fi(frame, [198, 218], [1, 0], easeInOut);

  const identityLine  = content.identityLine;
  const accentWord    = content.identityAccent;
  const parts = identityLine.split(accentWord);
  const heroEl = parts.length > 1 ? (
    <>{parts[0]}<Accent>{accentWord}</Accent>{parts[1]}</>
  ) : identityLine;

  return (
    <Bg style={{ opacity: exitOp }}>
      <Grain />

      {/* Pain cards */}
      {cards.map((card, i) => {
        const startF = i * cardDelay + 8;
        const entryProg = clamp(sp(frame, startF, { damping: 22, stiffness: 300, mass: 0.6 }));
        const cardY = interpolate(entryProg, [0, 1], [70, 0]);
        const cardOp = fi(frame, [startF, startF + 14], [0, 1]);
        const pos = PAIN_POSITIONS[i] || { x: `${20 + i * 18}%`, y: `${15 + i * 12}%`, r: 0 };

        return (
          <div key={card.title} style={{
            position: 'absolute', left: pos.x, top: pos.y,
            transform: `translateY(${cardY}px) rotate(${pos.r}deg)`,
            opacity: cardOp,
            background: 'rgba(255,255,255,0.055)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 14, padding: '14px 18px', minWidth: 200,
            backdropFilter: 'blur(8px)',
          }}>
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

      {/* Buried listing UI fragments */}
      {LISTING_FRAGMENTS.map((lf) => (
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

      {/* Hero identity line */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        opacity: heroOp, transform: `translateY(${heroY}px)`,
        textAlign: 'center', padding: '0 60px',
      }}>
        <div style={{
          fontFamily: FONT.display, fontSize: 64, fontWeight: 700,
          color: C.white, letterSpacing: '-0.03em', lineHeight: 1.1,
        }}>
          {heroEl}
        </div>
        <div style={{
          marginTop: 16,
          fontFamily: FONT.mono, fontSize: 12,
          letterSpacing: '0.18em', color: 'rgba(255,255,255,0.32)',
          textTransform: 'uppercase',
        }}>
          The market doesn't wait
        </div>
      </div>
    </Bg>
  );
}

// ─── ACT 3: AGITATE (368–588f, 12.3–19.6s) ───────────────────────────────────
// Agitate lines left-aligned. A faint phone silhouette fades in on the right
// showing a flooded inbox (static) — the "before" state visually.
function Act3Agitate({ content }) {
  const frame = useCurrentFrame();
  const lines = content.agitateLines;
  const lineFrames = [8, 62, 118];

  const anguishOp = fi(frame, [168, 192], [0, 1], easeOut);
  const anguishY  = interpolate(clamp(sp(frame, 168, { damping: 18, stiffness: 200 })), [0, 1], [22, 0]);
  const exitOp    = fi(frame, [208, 228], [1, 0], easeInOut);

  const anguishLine   = content.anguishLine;
  const anguishAccent = content.anguishAccent;
  const anguishParts  = anguishLine.split(anguishAccent);
  const anguishEl = anguishParts.length > 1 ? (
    <>{anguishParts[0]}<Accent>{anguishAccent}</Accent>{anguishParts[1]}</>
  ) : anguishLine;

  // Right-side "flooded inbox" ghost phone (fades in at ~70f into act)
  const ghostOp = fi(frame, [70, 110], [0, 0.22], easeOut);

  return (
    <AbsoluteFill style={{
      background: `linear-gradient(170deg, #050f1e 0%, ${C.navy} 60%, #0a1a30 100%)`,
      opacity: exitOp, fontFamily: FONT.sans,
    }}>
      <Grain />

      {/* Ghost phone silhouette (faint "before" visual) */}
      <div style={{
        position: 'absolute',
        right: '4%',
        top: '50%',
        transform: 'translateY(-50%)',
        opacity: ghostOp,
        pointerEvents: 'none',
      }}>
        <PhoneFrame width={260} height={470}>
          {/* Flood of unread messages as thin lines */}
          <div style={{
            padding: '52px 12px 12px',
            display: 'flex', flexDirection: 'column', gap: 6,
          }}>
            {[...Array(9)].map((_, i) => (
              <div key={i} style={{
                height: 32, borderRadius: 6,
                background: i % 3 === 0
                  ? 'rgba(239,68,68,0.12)'
                  : 'rgba(255,255,255,0.04)',
                border: i % 3 === 0
                  ? '1px solid rgba(239,68,68,0.2)'
                  : '1px solid rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', paddingLeft: 10, gap: 8,
              }}>
                {/* Tiny avatar circle */}
                <div style={{
                  width: 16, height: 16, borderRadius: '50%',
                  background: i % 3 === 0 ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.08)',
                  flexShrink: 0,
                }} />
                {/* Message line */}
                <div style={{
                  flex: 1, height: 6, borderRadius: 3,
                  background: 'rgba(255,255,255,0.1)',
                  maxWidth: `${50 + (i * 17) % 40}%`,
                }} />
                {/* Unread red dot for some */}
                {i % 3 === 0 && (
                  <div style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: '#ef4444',
                    marginRight: 8, flexShrink: 0,
                    boxShadow: '0 0 4px #ef4444',
                  }} />
                )}
              </div>
            ))}
            {/* "47 unread" label */}
            <div style={{
              textAlign: 'center', marginTop: 4,
              fontFamily: FONT.mono, fontSize: 9,
              color: 'rgba(239,68,68,0.5)',
              letterSpacing: '0.1em',
            }}>
              47 UNREAD · PORTAL INBOX
            </div>
          </div>
        </PhoneFrame>
      </div>

      {/* Agitate lines — left aligned */}
      <div style={{
        position: 'absolute', left: 80, top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex', flexDirection: 'column', gap: 32,
        maxWidth: 660,
      }}>
        {lines.map((line, i) => {
          const startF = lineFrames[i] ?? i * 60 + 8;
          const entryProg = clamp(sp(frame, startF, { damping: 22, stiffness: 160, mass: 1.1 }));
          const lineX = interpolate(entryProg, [0, 1], [-60, 0]);
          const lineOp = fi(frame, [startF, startF + 22], [0, 1], easeOut);
          const dimProg = i < lines.length - 1
            ? fi(frame, [lineFrames[i + 1] + 10, lineFrames[i + 1] + 30], [1, 0.28])
            : 1;

          return (
            <div key={line} style={{ transform: `translateX(${lineX}px)`, opacity: lineOp * dimProg }}>
              <div style={{
                fontFamily: FONT.display, fontSize: 40, fontWeight: 600,
                color: C.white, letterSpacing: '-0.025em', lineHeight: 1.2,
              }}>
                {line}
              </div>
              <div style={{
                height: 2,
                width: fi(frame, [startF + 8, startF + 30], [0, 130]) * (lineOp > 0.5 ? 1 : 0),
                background: 'linear-gradient(90deg, rgba(239,68,68,0.7), transparent)',
                marginTop: 8, borderRadius: 1,
              }} />
            </div>
          );
        })}
      </div>

      {/* Anguish kicker */}
      <div style={{
        position: 'absolute', bottom: '11%', left: 0, right: 0,
        textAlign: 'center', opacity: anguishOp,
        transform: `translateY(${anguishY}px)`, padding: '0 60px',
      }}>
        <div style={{
          fontFamily: FONT.display, fontSize: 50, fontWeight: 700,
          color: C.white, letterSpacing: '-0.03em', lineHeight: 1.1,
        }}>
          {anguishEl}
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ─── ACT 4: BRIDGE (588–661f, 19.6–22.0s) ────────────────────────────────────
// Short (~73f = 1 bar). Builds maximum tension right up to the DROP.
// Light-break animation + bridge headline. Cut is tight.
function Act4Bridge({ content }) {
  const frame = useCurrentFrame();

  const glowScale = interpolate(
    clamp(sp(frame, 4, { damping: 28, stiffness: 80, mass: 1.4 })),
    [0, 1], [0.2, 1]
  );
  const glowOp  = fi(frame, [4, 35], [0, 0.65], easeOut);

  const lineOp  = fi(frame, [14, 38], [0, 1], easeOut);
  const lineY   = interpolate(clamp(sp(frame, 14, { damping: 22, stiffness: 200 })), [0, 1], [32, 0]);

  const subOp   = fi(frame, [38, 58], [0, 1], easeOut);
  const pillOp  = fi(frame, [6, 22], [0, 1], easeOut);

  // No exit fade — hard cut into DROP 1
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
      {/* Light burst */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        width: 700, height: 700,
        transform: `translate(-50%, -50%) scale(${glowScale})`,
        borderRadius: '50%',
        background: `radial-gradient(circle, rgba(82,168,50,${glowOp * 0.30}) 0%, rgba(38,112,168,${glowOp * 0.13}) 45%, transparent 70%)`,
        filter: 'blur(40px)', pointerEvents: 'none',
      }} />

      <div style={{ opacity: pillOp, marginBottom: 22,
        background: 'rgba(82,168,50,0.15)', border: '1px solid rgba(82,168,50,0.35)',
        borderRadius: 100, padding: '6px 20px',
      }}>
        <Eyebrow color={C.greenPale}>A different approach</Eyebrow>
      </div>

      <div style={{
        opacity: lineOp, transform: `translateY(${lineY}px)`,
        textAlign: 'center', padding: '0 80px', maxWidth: 1000,
      }}>
        <div style={{
          fontFamily: FONT.display, fontSize: 72, fontWeight: 700,
          color: C.white, letterSpacing: '-0.035em', lineHeight: 1.08,
        }}>
          {bridgeEl}
        </div>
      </div>

      <div style={{
        marginTop: 24, opacity: subOp,
        textAlign: 'center', padding: '0 80px',
      }}>
        <div style={{
          fontFamily: FONT.sans, fontSize: 22, fontWeight: 300,
          color: 'rgba(255,255,255,0.60)', letterSpacing: '-0.01em',
        }}>
          {content.bridgeSub}
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ─── ACT 5: REVEAL (661–1176f, 22–39.2s) — DROP 1 ────────────────────────────
// The big product moment. 515 frames (7 bars).
// Sub-acts:
//   0–60f    : Brand name cinematic entrance (on the beat drop)
//   55–220f  : Phone + first SwipeCard appears
//   200–340f : SwipeAnimation (card swipes → LIKE → MATCH pop)
//   320–515f : Before/After wipe + mechanism pills
function Act5Reveal({ content, userType }) {
  const frame = useCurrentFrame(); // relative to start of this sequence

  // ── Sub-act 1: Brand reveal (0–60f) ──────────────────────────────────────
  const nameOp = fi(frame, [0, 28], [0, 1], easeInOut);
  const nameY  = interpolate(frame, [0, 35], [40, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeInOut,
  });
  const tagOp  = fi(frame, [30, 55], [0, 1], easeOut);

  // ── Sub-act 2: Phone frame enters (55–120f) ──────────────────────────────
  const phoneOp    = fi(frame, [55, 90], [0, 1], easeOut);
  const phoneScale = interpolate(
    clamp(sp(frame, 55, { damping: 22, stiffness: 120, mass: 1.0 })),
    [0, 1], [0.72, 1]
  );
  const phoneX = interpolate(
    clamp(sp(frame, 55, { damping: 22, stiffness: 120, mass: 1.0 })),
    [0, 1], [80, 0]
  );

  // ── Sub-act 3: Swipe animation start (200f) ──────────────────────────────
  // SwipeAnimation uses its own internal frame from useCurrentFrame relative
  // to the Sequence, so we pass startFrame = 200 (relative to this act's seq).

  // ── Sub-act 4: Before/After wipe (320–450f) ──────────────────────────────
  const wipeProgress = fi(frame, [320, 420], [0, 1], easeInOut);
  const wipeOp       = fi(frame, [315, 340], [0, 1], easeOut);
  const beforeX      = interpolate(wipeProgress, [0, 1], [0, -12]);
  const afterX       = interpolate(wipeProgress, [0, 1], [0, 12]);

  // Mechanism pills (350–440f)
  const mechOp = fi(frame, [350, 390], [0, 1], easeOut);
  const mechY  = interpolate(clamp(sp(frame, 350, { damping: 22, stiffness: 180 })), [0, 1], [20, 0]);

  // Exit fade
  const exitOp = fi(frame, [490, 514], [1, 0], easeInOut);

  // userType-appropriate card data
  const cardData = CARD_DATA_BY_TYPE[userType] || CARD_DATA_BY_TYPE.tenant;

  return (
    <AbsoluteFill style={{
      background: `linear-gradient(160deg, ${C.navyMid} 0%, ${C.navy} 100%)`,
      opacity: exitOp, fontFamily: FONT.sans,
    }}>
      <Grain />

      {/* Brand name — drops in with the beat */}
      <div style={{
        position: 'absolute', top: '5%', left: 0, right: 0,
        textAlign: 'center',
        opacity: nameOp, transform: `translateY(${nameY}px)`,
      }}>
        <Eyebrow color="rgba(255,255,255,0.36)" style={{ marginBottom: 10 }}>
          {content.revealLabel} · INTRODUCING
        </Eyebrow>
        <div style={{
          fontFamily: FONT.display, fontSize: 96, fontWeight: 800,
          color: C.white, letterSpacing: '-0.045em', lineHeight: 1,
          textShadow: '0 0 60px rgba(82,168,50,0.25)',
        }}>
          Rent<span style={{ color: C.greenPale }}>Eazy</span>
        </div>
        <div style={{
          opacity: tagOp, marginTop: 10,
          fontFamily: FONT.sans, fontSize: 20, fontWeight: 300,
          color: 'rgba(255,255,255,0.52)', letterSpacing: '-0.01em',
        }}>
          The mutual-matching network for rentals
        </div>
      </div>

      {/* Phone frame with live swipe demo */}
      <div style={{
        position: 'absolute',
        left: '50%',
        top: '52%',
        transform: `translate(-50%, -50%) scale(${phoneScale}) translateX(${phoneX}px)`,
        opacity: phoneOp,
      }}>
        <PhoneFrame width={300} height={560}>
          {/* Static card shown 55–199f */}
          {frame >= 55 && frame < 200 && (
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
                width={280}
                height={540}
              />
            </div>
          )}

          {/* Swipe animation 200–515f */}
          {frame >= 200 && (
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
              <SwipeAnimation
                imagePath={cardData.image}
                tenantImage="/images/match-tenant.jpg"
                matchScore={cardData.matchScore}
                title={cardData.title}
                location={cardData.location}
                price={cardData.price}
                tags={cardData.tags}
                startFrame={200}
                width={280}
                height={540}
              />
            </div>
          )}
        </PhoneFrame>
      </div>

      {/* Before/After split screen — appears after match pop */}
      <div style={{
        position: 'absolute', bottom: '3%', left: '3%', right: '3%',
        display: 'flex', gap: 14,
        opacity: wipeOp, height: '27%',
      }}>
        <div style={{
          flex: 1,
          background: 'rgba(239,68,68,0.07)',
          border: '1px solid rgba(239,68,68,0.22)',
          borderRadius: 18, padding: '16px 20px',
          transform: `translateX(${beforeX}px)`, overflow: 'hidden',
        }}>
          <Eyebrow color="rgba(239,68,68,0.7)" style={{ marginBottom: 8 }}>
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
          background: 'rgba(82,168,50,0.1)',
          border: '1px solid rgba(82,168,50,0.32)',
          borderRadius: 18, padding: '16px 20px',
          transform: `translateX(${afterX}px)`, overflow: 'hidden',
        }}>
          <Eyebrow color={C.greenPale} style={{ marginBottom: 8 }}>
            After — {BEFORE_AFTER.after.label}
          </Eyebrow>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {BEFORE_AFTER.after.points.map(p => (
              <div key={p} style={{
                fontSize: 11, color: 'rgba(255,255,255,0.72)',
                display: 'flex', gap: 8, alignItems: 'flex-start',
                fontFamily: FONT.sans,
              }}>
                <span style={{ color: C.greenPale, flexShrink: 0 }}>✓</span> {p}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mechanism pills (top right, appear after swipe) */}
      <div style={{
        position: 'absolute',
        top: '29%', right: '3%',
        display: 'flex', flexDirection: 'column', gap: 10,
        opacity: mechOp, transform: `translateY(${mechY}px)`,
        width: 220,
      }}>
        {['Both sides like first', 'No cold outreach', '9 match criteria', 'Reputation travels'].map((pill, i) => (
          <div key={pill} style={{
            background: i === 0 ? 'rgba(82,168,50,0.2)' : 'rgba(255,255,255,0.07)',
            border: `1px solid ${i === 0 ? 'rgba(82,168,50,0.45)' : 'rgba(255,255,255,0.12)'}`,
            borderRadius: 100, padding: '9px 16px',
            fontFamily: FONT.sans, fontSize: 13,
            color: i === 0 ? C.greenPale : 'rgba(255,255,255,0.68)',
            fontWeight: i === 0 ? 600 : 400,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ color: C.greenPale, fontSize: 11 }}>✓</span>
            {pill}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
}

// ─── ACT 6: PROOF (1176–1397f, 39.2–46.6s) ───────────────────────────────────
// Rides the groove then the breakdown. 221 frames (3 bars).
// Real platform facts — NO fabricated numbers.
// During the breakdown quiet section, UI dims slightly.
function Act6Proof({ content }) {
  const frame = useCurrentFrame();

  const hookOp = fi(frame, [8, 35], [0, 1], easeOut);
  const hookY  = interpolate(clamp(sp(frame, 8, { damping: 20, stiffness: 180 })), [0, 1], [24, 0]);

  const cardDelay = 45;
  const exitOp    = fi(frame, [196, 220], [1, 0], easeInOut);

  const featOp = fi(frame, [148, 175], [0, 1], easeOut);
  const featY  = interpolate(clamp(sp(frame, 148, { damping: 22, stiffness: 180 })), [0, 1], [20, 0]);

  const gtmOp = fi(frame, [180, 205], [0, 1], easeOut);

  // Breakdown feel: slight overall dim at ~170f (matches ~40s into full track)
  const breakdownDim = fi(frame, [168, 190], [1.0, 0.72], easeInOut);

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
          fontFamily: FONT.display, fontSize: 50, fontWeight: 700,
          color: C.white, letterSpacing: '-0.03em', lineHeight: 1.1,
        }}>
          {content.proofHook}
        </div>
      </div>

      {/* Real platform fact cards */}
      <div style={{
        position: 'absolute', top: '27%',
        left: '50%', transform: 'translateX(-50%)',
        display: 'flex', gap: 16, width: 'max-content',
      }}>
        {PLATFORM_FACTS.map((fact, i) => {
          const startF  = i * cardDelay + 42;
          const cardOp  = fi(frame, [startF, startF + 22], [0, 1], easeOut);
          const cardY   = interpolate(clamp(sp(frame, startF, { damping: 20, stiffness: 200 })), [0, 1], [30, 0]);

          let displayNum;
          if (fact.count === 0) {
            displayNum = 'FREE';
          } else if (fact.count === 2) {
            const counted = Math.round(interpolate(frame, [startF + 10, startF + 40], [0, fact.count], {
              extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOut,
            }));
            displayNum = `${counted}×`;
          } else {
            const counted = Math.round(interpolate(frame, [startF + 10, startF + 50], [0, fact.count], {
              extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOut,
            }));
            displayNum = counted.toString();
          }

          return (
            <div key={fact.label} style={{
              opacity: cardOp, transform: `translateY(${cardY}px)`,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 20, padding: '20px 22px', minWidth: 150,
              textAlign: 'center', backdropFilter: 'blur(10px)',
              boxShadow: '0 16px 40px rgba(0,0,0,0.35)',
            }}>
              <div style={{
                fontFamily: FONT.mono,
                fontSize: fact.count === 0 ? 26 : 44,
                fontWeight: 700, color: C.greenPale,
                letterSpacing: '-0.02em', lineHeight: 1,
                textShadow: `0 0 20px rgba(155,211,131,0.35)`,
              }}>
                {displayNum}
              </div>
              <div style={{ marginTop: 8, fontFamily: FONT.sans, fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.72)' }}>
                {fact.label}
              </div>
              <div style={{ marginTop: 5, fontFamily: FONT.mono, fontSize: 9, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.33)' }}>
                {fact.sub}
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature checklist */}
      <div style={{
        position: 'absolute', bottom: '14%',
        left: '50%', transform: 'translateX(-50%)',
        opacity: featOp,
        display: 'flex', flexDirection: 'column', gap: 9,
        minWidth: 520,
      }}>
        {PLATFORM_FEATURES.slice(0, 4).map((feat, i) => {
          const featItemOp = fi(frame, [148 + i * 12, 168 + i * 12], [0, 1], easeOut);
          return (
            <div key={feat} style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: featItemOp }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%',
                background: 'rgba(82,168,50,0.25)',
                border: '1px solid rgba(82,168,50,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <span style={{ color: C.greenPale, fontSize: 11, fontWeight: 700 }}>✓</span>
              </div>
              <div style={{ fontFamily: FONT.sans, fontSize: 14, color: 'rgba(255,255,255,0.72)' }}>
                {feat}
              </div>
            </div>
          );
        })}
      </div>

      {/* Honest GTM angle */}
      <div style={{
        position: 'absolute', bottom: '4%', left: 0, right: 0,
        textAlign: 'center', opacity: gtmOp,
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          background: 'rgba(38,112,168,0.15)',
          border: '1px solid rgba(91,196,255,0.25)',
          borderRadius: 100, padding: '8px 22px',
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

// ─── ACT 7: CLOSE (1397–1800f, 46.6–60s) — DROP 2 @ frame 1440 ───────────────
// 403 frames. CTA button springs in on DROP 2 (frame 43 relative = 1440 absolute).
// Identity frame quiet (breakdown feel) from 0–43f, then CTA explodes on drop.
function Act7Close({ content }) {
  const frame = useCurrentFrame();

  const glowPulse = 0.5 + Math.sin(frame / 14) * 0.12;

  // Identity frame: enters quietly in breakdown (0–40f)
  const idOp = fi(frame, [8, 42], [0, 1], easeInOut);
  const idY  = interpolate(frame, [8, 50], [36, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeInOut,
  });

  const identityFrame   = content.identityFrame;
  const accentWord      = content.identityAccentWord;
  const idParts = identityFrame.split(accentWord);
  const idEl = idParts.length > 1 ? (
    <>{idParts[0]}<Accent>{accentWord}</Accent>{idParts[1]}</>
  ) : identityFrame;

  // Audience pills appear just before drop (32–45f)
  const pillOps = [
    fi(frame, [32, 48], [0, 1], easeOut),
    fi(frame, [36, 52], [0, 1], easeOut),
    fi(frame, [40, 56], [0, 1], easeOut),
    fi(frame, [44, 60], [0, 1], easeOut),
  ];

  // CTA button — springs in EXACTLY on DROP 2 (frame 43 relative = 1440 absolute)
  // Hard spring for maximum impact impact on the beat
  const ctaDrop    = 43; // relative frame for CTA drop (= absolute 1440)
  const ctaScale   = 0.6 + clamp(sp(frame, ctaDrop, { damping: 10, stiffness: 380, mass: 0.55 })) * 0.4;
  const ctaOp      = fi(frame, [ctaDrop, ctaDrop + 18], [0, 1], easeOut);
  const ctaGlow    = 0.5 + Math.sin(frame / 11) * 0.12;

  // Brief green flash on the drop (43–55f)
  const dropFlash  = fi(frame, [ctaDrop, ctaDrop + 12], [0.35, 0], easeOut);

  // Consequence line
  const conseqOp = fi(frame, [90, 118], [0, 1], easeOut);
  const conseqY  = interpolate(clamp(sp(frame, 90, { damping: 22, stiffness: 180 })), [0, 1], [14, 0]);

  const footOp   = fi(frame, [120, 148], [0, 1], easeOut);

  const pills = [
    { label: 'Renters',   color: C.greenPale, bg: 'rgba(82,168,50,0.18)',  border: 'rgba(82,168,50,0.4)' },
    { label: 'Landlords', color: C.bluePale,  bg: 'rgba(38,112,168,0.15)', border: 'rgba(91,196,255,0.3)' },
    { label: 'Agents',    color: '#fbbf24',   bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' },
    { label: 'Investors', color: 'rgba(255,255,255,0.60)', bg: 'rgba(255,255,255,0.07)', border: 'rgba(255,255,255,0.14)' },
  ];

  return (
    <AbsoluteFill style={{
      background: `linear-gradient(160deg, ${C.navy} 0%, ${C.navyMid} 100%)`,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: FONT.sans,
    }}>
      {/* Green flash on drop */}
      {frame >= ctaDrop && frame <= ctaDrop + 12 && (
        <div style={{
          position: 'absolute', inset: 0,
          background: `rgba(82,168,50,${dropFlash})`,
          pointerEvents: 'none',
          zIndex: 20,
        }} />
      )}

      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: '40%', left: '50%',
        width: 640, height: 400,
        transform: 'translate(-50%, -50%)',
        borderRadius: '50%',
        background: `radial-gradient(ellipse, rgba(82,168,50,${glowPulse * 0.18}) 0%, transparent 65%)`,
        filter: 'blur(60px)', pointerEvents: 'none',
      }} />

      {/* Identity headline */}
      <div style={{
        opacity: idOp, transform: `translateY(${idY}px)`,
        textAlign: 'center', padding: '0 80px', maxWidth: 960, zIndex: 1,
      }}>
        <div style={{
          fontFamily: FONT.display, fontSize: 80, fontWeight: 800,
          color: C.white, letterSpacing: '-0.04em', lineHeight: 1.0,
        }}>
          {idEl}
        </div>
      </div>

      {/* Audience pills */}
      <div style={{
        marginTop: 28, display: 'flex', gap: 12,
        justifyContent: 'center', flexWrap: 'wrap',
        padding: '0 40px', zIndex: 1,
      }}>
        {pills.map((pill, i) => (
          <div key={pill.label} style={{
            opacity: pillOps[i],
            background: pill.bg, border: `1px solid ${pill.border}`,
            borderRadius: 100, padding: '9px 20px',
          }}>
            <span style={{ fontFamily: FONT.sans, fontSize: 14, fontWeight: 500, color: pill.color }}>
              {pill.label}
            </span>
          </div>
        ))}
      </div>

      {/* CTA button — springs in on DROP 2 */}
      <div style={{
        marginTop: 30, opacity: ctaOp, transform: `scale(${ctaScale})`,
        textAlign: 'center', zIndex: 1,
      }}>
        <div style={{
          background: `linear-gradient(135deg, ${C.green}, ${C.greenDark})`,
          borderRadius: 100, padding: '20px 58px',
          color: 'white', fontFamily: FONT.display,
          fontSize: 22, fontWeight: 600, display: 'inline-block',
          boxShadow: [
            `0 20px 52px rgba(47,125,50,${ctaGlow * 0.6})`,
            '0 0 0 1px rgba(255,255,255,0.18)',
            '0 2px 0 rgba(255,255,255,0.12) inset',
          ].join(', '),
          letterSpacing: '-0.01em',
        }}>
          {content.ctaLabel}
        </div>
      </div>

      {/* Consequence line */}
      <div style={{
        marginTop: 22, opacity: conseqOp,
        transform: `translateY(${conseqY}px)`,
        textAlign: 'center', padding: '0 80px', zIndex: 1,
      }}>
        <div style={{
          fontFamily: FONT.sans, fontSize: 16, fontWeight: 300,
          color: 'rgba(255,255,255,0.40)', letterSpacing: '-0.005em',
          fontStyle: 'italic',
        }}>
          {content.consequenceLine}
        </div>
      </div>

      {/* Domain footer */}
      <div style={{ marginTop: 18, opacity: footOp, zIndex: 1 }}>
        <div style={{
          fontFamily: FONT.mono, fontSize: 11,
          color: 'rgba(255,255,255,0.26)',
          letterSpacing: '0.16em', textAlign: 'center',
        }}>
          renteazy.co.uk · free to post · free to swipe · mutual match
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ─── Card data per userType ───────────────────────────────────────────────────
// tenant → swipes property listings
// landlord / agent → swipes tenant briefs
// investor → swipes deal cards
const CARD_DATA_BY_TYPE = {
  tenant: {
    image:      '/images/canary-wharf-studio-kitchen.jpg',
    matchScore: 91,
    title:      'Canary Wharf Studio',
    location:   'Canary Wharf, E14',
    price:      '£1,850 pcm',
    tags:       ['Bills incl.', 'Pets OK', 'Available now'],
    repScore:   '4.8',
  },
  landlord: {
    image:      '/images/match-tenant.jpg',
    matchScore: 88,
    title:      'Sophie M. · Young Professional',
    location:   'Seeking Hackney / Bow, E3',
    price:      'Budget £1,800 pcm',
    tags:       ['Verified', 'No DSS', 'Long-term'],
    repScore:   '4.9',
  },
  agent: {
    image:      '/images/match-tenant.jpg',
    matchScore: 93,
    title:      'Jordan T. · Couple',
    location:   'Seeking Stratford / Forest Gate',
    price:      'Budget £2,200 pcm',
    tags:       ['Pre-qualified', 'Long-term', 'Verified'],
    repScore:   '5.0',
  },
  investor: {
    image:      '/images/match-flat-2.jpg',
    matchScore: 86,
    title:      'Stratford 1-bed HMO',
    location:   'Stratford, E15 · 5.8% yield est.',
    price:      '£1,650 pcm',
    tags:       ['High demand', 'Near Crossrail', 'Verified'],
    repScore:   null,
  },
};

// ─── Root composition ─────────────────────────────────────────────────────────
/**
 * Act boundaries (all at 30 fps, music-timed):
 *   Act 1 INTERRUPT    0–147f   (0–4.9s)   build start — pure black, hook
 *   Act 2 IDENTIFY   147–368f   (4.9–12.3s) build — pain cards + UI fragments
 *   Act 3 AGITATE    368–588f  (12.3–19.6s) build rising — agitate + ghost phone
 *   Act 4 BRIDGE     588–661f  (19.6–22.0s) tension peak — light burst
 *   Act 5 REVEAL     661–1176f (22.0–39.2s) DROP 1: phone + swipe→MATCH
 *   Act 6 PROOF     1176–1397f (39.2–46.6s) groove→breakdown: real facts
 *   Act 7 CLOSE     1397–1800f (46.6–60.0s) DROP 2 @43f-rel(1440abs): CTA spring
 *
 * Total: 1800 frames = 60s @ 30fps.
 */
export default function RentEazyVSL({ userType = 'tenant' }) {
  const resolvedType = ['tenant', 'landlord', 'investor', 'agent'].includes(userType)
    ? userType
    : 'tenant';
  const content = CONTENT[resolvedType];

  return (
    <AbsoluteFill style={{ background: C.navy, fontFamily: FONT.sans }}>
      {/* Background music */}
      <Audio src={staticFile('/audio/in-it-kadant.mp3')} volume={0.18} />

      {/* Act 1: INTERRUPT — 0–147f */}
      <Sequence from={A1_START} durationInFrames={A2_START - A1_START}>
        <Act1Interrupt content={content} />
      </Sequence>

      {/* Act 2: IDENTIFY — 147–368f */}
      <Sequence from={A2_START} durationInFrames={A3_START - A2_START}>
        <Act2Identify content={content} />
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
