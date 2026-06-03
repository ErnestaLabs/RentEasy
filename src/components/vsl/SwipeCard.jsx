/**
 * SwipeCard — property/listing card with gradient overlay, match-score badge,
 * title/location/price, tag chips, and circular Pass/Like/Superlike buttons.
 *
 * Used inside a PhoneFrame in the RentEazy VSL.
 * All images are loaded via Remotion's staticFile / Img.
 */

import React from 'react';
import { Img, staticFile, interpolate, spring, useCurrentFrame, Easing } from 'remotion';

const C = {
  navy:      '#06182f',
  green:     '#52a832',
  greenDark: '#2f7d32',
  greenPale: '#9bd383',
  blue:      '#2670a8',
  bluePale:  '#5bc4ff',
  white:     '#ffffff',
};

const FONT = {
  display: "'Bricolage Grotesque Variable', 'Inter', sans-serif",
  sans:    "'Inter', system-ui, sans-serif",
  mono:    "'JetBrains Mono', monospace",
};

const easeOut = Easing.out(Easing.cubic);
const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));

const fi = (frame, [f0, f1], [v0, v1], easingFn) =>
  clamp(
    interpolate(frame, [f0, f1], [v0, v1], {
      extrapolateLeft:  'clamp',
      extrapolateRight: 'clamp',
      easing: easingFn,
    })
  );

const sp = (frame, delay, config = {}) =>
  spring({
    frame: frame - delay,
    fps:   30,
    config: { damping: 20, stiffness: 200, mass: 0.8, ...config },
  });

// ─── Tag chip ─────────────────────────────────────────────────────────────────
function Chip({ label, color = 'rgba(255,255,255,0.72)', bg = 'rgba(255,255,255,0.12)', border = 'rgba(255,255,255,0.18)' }) {
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      background: bg,
      border: `1px solid ${border}`,
      borderRadius: 100,
      padding: '3px 10px',
      fontFamily: FONT.mono,
      fontSize: 10,
      fontWeight: 500,
      color,
      letterSpacing: '0.04em',
      whiteSpace: 'nowrap',
    }}>
      {label}
    </div>
  );
}

// ─── Action button (Pass / Like / Superlike) ──────────────────────────────────
function ActionBtn({ icon, color, bg, shadow, size = 50, fontSize = 22 }) {
  return (
    <div style={{
      width:  size,
      height: size,
      borderRadius: '50%',
      background: bg,
      border: `2px solid ${color}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize,
      boxShadow: shadow,
      flexShrink: 0,
    }}>
      {icon}
    </div>
  );
}

// ─── SwipeCard ────────────────────────────────────────────────────────────────
/**
 * Props:
 *   imagePath   — path relative to public/, e.g. '/images/match-flat.jpg'
 *   matchScore  — integer 0-100 (e.g. 88)
 *   title       — e.g. "Stratford 1-bed"
 *   location    — e.g. "Stratford, E15"
 *   price       — e.g. "£1,650 pcm"
 *   tags        — array of strings (up to 4)
 *   verified    — bool — show "Verified" chip
 *   repScore    — optional string rep score label
 *   enterFrame  — frame at which card springs in (default 0)
 *   width       — card width (default 320, fills phone inner screen)
 *   height      — card height (default 540, fills phone inner screen)
 *   showButtons — show Pass/Like/Superlike row (default true)
 */
export function SwipeCard({
  imagePath   = '/images/match-flat.jpg',
  matchScore  = 88,
  title       = 'Stratford 1-bed',
  location    = 'Stratford, E15',
  price       = '£1,650 pcm',
  tags        = ['1 bed', 'Bills incl.', 'Pets OK'],
  verified    = true,
  repScore    = null,
  enterFrame  = 0,
  width       = 320,
  height      = 540,
  showButtons = true,
}) {
  const frame = useCurrentFrame();

  const entryProg = clamp(sp(frame, enterFrame, { damping: 24, stiffness: 220, mass: 0.75 }));
  const cardY     = interpolate(entryProg, [0, 1], [60, 0]);
  const cardOp    = fi(frame, [enterFrame, enterFrame + 12], [0, 1], easeOut);

  // Score badge breathe
  const scorePulse = 1 + Math.sin((frame - enterFrame) / 18) * 0.025;

  return (
    <div style={{
      width,
      height,
      borderRadius: 24,
      overflow: 'hidden',
      position: 'relative',
      boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
      transform: `translateY(${cardY}px)`,
      opacity: cardOp,
      flexShrink: 0,
      background: '#0d1e35',
    }}>
      {/* Property photo — fills card */}
      <Img
        src={staticFile(imagePath)}
        style={{
          position: 'absolute',
          inset: 0,
          width:  '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
        }}
      />

      {/* Gradient overlay — bottom heavy */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: [
          'linear-gradient(to bottom,',
          'rgba(6,24,47,0.0) 0%,',
          'rgba(6,24,47,0.1) 35%,',
          'rgba(6,24,47,0.72) 65%,',
          'rgba(6,24,47,0.97) 100%)',
        ].join(' '),
      }} />

      {/* Match-score badge — top right */}
      <div style={{
        position: 'absolute',
        top: 14,
        right: 14,
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        background: 'rgba(6,24,47,0.78)',
        border: '1.5px solid rgba(82,168,50,0.6)',
        borderRadius: 100,
        padding: '5px 11px',
        backdropFilter: 'blur(8px)',
        transform: `scale(${scorePulse})`,
      }}>
        <div style={{
          width: 7, height: 7, borderRadius: '50%',
          background: C.green,
          boxShadow: `0 0 8px ${C.green}`,
        }} />
        <span style={{
          fontFamily: FONT.mono,
          fontSize: 12,
          fontWeight: 700,
          color: C.greenPale,
          letterSpacing: '0.04em',
        }}>
          {matchScore}% match
        </span>
      </div>

      {/* Verified badge — top left */}
      {verified && (
        <div style={{
          position: 'absolute',
          top: 14,
          left: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          background: 'rgba(6,24,47,0.78)',
          border: '1px solid rgba(91,196,255,0.4)',
          borderRadius: 100,
          padding: '4px 10px',
          backdropFilter: 'blur(8px)',
        }}>
          <span style={{ fontSize: 9, color: C.bluePale }}>✓</span>
          <span style={{
            fontFamily: FONT.mono,
            fontSize: 10,
            color: C.bluePale,
            letterSpacing: '0.06em',
          }}>
            VERIFIED
          </span>
        </div>
      )}

      {/* Card info — bottom overlay */}
      <div style={{
        position: 'absolute',
        bottom: showButtons ? 82 : 18,
        left: 16,
        right: 16,
      }}>
        {/* Title + price row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: 4,
        }}>
          <div>
            <div style={{
              fontFamily: FONT.display,
              fontSize: 20,
              fontWeight: 700,
              color: C.white,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              textShadow: '0 1px 4px rgba(0,0,0,0.5)',
            }}>
              {title}
            </div>
            <div style={{
              fontFamily: FONT.sans,
              fontSize: 12,
              color: 'rgba(255,255,255,0.62)',
              marginTop: 2,
            }}>
              {location}
            </div>
          </div>
          <div style={{
            fontFamily: FONT.mono,
            fontSize: 15,
            fontWeight: 700,
            color: C.greenPale,
            letterSpacing: '-0.01em',
            textAlign: 'right',
          }}>
            {price}
          </div>
        </div>

        {/* Tag chips */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 5,
          marginTop: 8,
        }}>
          {tags.map((t) => (
            <Chip key={t} label={t} />
          ))}
          {repScore && (
            <Chip
              label={`Rep ${repScore}`}
              color={C.greenPale}
              bg="rgba(82,168,50,0.18)"
              border="rgba(82,168,50,0.35)"
            />
          )}
        </div>
      </div>

      {/* Pass / Like / Superlike buttons */}
      {showButtons && (
        <div style={{
          position: 'absolute',
          bottom: 18,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 18,
        }}>
          <ActionBtn
            icon="✕"
            color="rgba(239,68,68,0.7)"
            bg="rgba(239,68,68,0.12)"
            shadow="0 4px 16px rgba(239,68,68,0.3)"
            size={46}
            fontSize={18}
          />
          <ActionBtn
            icon="♥"
            color={C.green}
            bg={`rgba(82,168,50,0.18)`}
            shadow={`0 4px 20px rgba(82,168,50,0.4)`}
            size={58}
            fontSize={24}
          />
          <ActionBtn
            icon="★"
            color={C.bluePale}
            bg="rgba(38,112,168,0.15)"
            shadow={`0 4px 16px rgba(91,196,255,0.3)`}
            size={46}
            fontSize={18}
          />
        </div>
      )}
    </div>
  );
}

// ─── SwipeAnimation — card swipes right + LIKE stamp + MATCH pop ──────────────
/**
 * Animated swipe sequence. All timing is relative to the passed `startFrame`.
 * Timeline (relative frames):
 *   0–8    : card visible, idle
 *   8–28   : card swoops right (spring translate) + rotates
 *   14–28  : "LIKE" green stamp fades in, scales
 *   28–50  : MATCH pop: two avatars + check circle + text appears
 *   50–90  : hold the match state
 *
 * Props mirror SwipeCard plus startFrame.
 */
export function SwipeAnimation({
  imagePath    = '/images/match-flat.jpg',
  counterImage = '/images/match-tenant.jpg',
  matchLine    = 'You both said yes.',
  matchScore   = 91,
  title        = 'Stratford 1-bed',
  location     = 'Stratford, E15',
  price        = '£1,650 pcm',
  tags         = ['1 bed', 'Pets OK', 'Bills incl.'],
  startFrame   = 0,
  width        = 320,
  height       = 540,
}) {
  const frame = useCurrentFrame();
  const rel   = frame - startFrame;  // relative frame

  // Phase 1: Card idle (rel 0–8)
  const cardVisible = rel >= 0;

  // Phase 2: Swipe right (rel 8–28)
  const swipeProgress = clamp(
    interpolate(rel, [8, 28], [0, 1], {
      extrapolateLeft:  'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.back(1.2)),
    })
  );
  const cardX   = interpolate(swipeProgress, [0, 1], [0, width + 80]);
  const cardRot = interpolate(swipeProgress, [0, 1], [0, 28]);
  const cardOp  = interpolate(swipeProgress, [0.7, 1], [1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // LIKE stamp (rel 10–24)
  const stampScale = clamp(
    interpolate(rel, [10, 20], [0, 1], {
      extrapolateLeft:  'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.back(2.5)),
    })
  );
  const stampOp = clamp(
    interpolate(rel, [10, 16], [0, 1], {
      extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    })
  ) * (1 - clamp(interpolate(rel, [24, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })));

  // MATCH pop (rel 28–48)
  const matchProgress = clamp(
    sp(Math.max(0, rel - 28), 0, { damping: 14, stiffness: 320, mass: 0.6 })
  );
  const matchOp = fi(frame, [startFrame + 28, startFrame + 36], [0, 1], easeOut);

  // Score badge breathe
  const scorePulse = rel > 0 ? 1 + Math.sin(rel / 18) * 0.025 : 1;

  return (
    <div style={{ position: 'relative', width, height }}>
      {/* Main card (swipes away) */}
      {cardVisible && (
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 24,
          overflow: 'hidden',
          transform: `translateX(${cardX}px) rotate(${cardRot}deg)`,
          opacity: cardOp,
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          background: '#0d1e35',
          transformOrigin: 'bottom center',
        }}>
          <Img
            src={staticFile(imagePath)}
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover', objectPosition: 'center',
            }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, rgba(6,24,47,0.0) 0%, rgba(6,24,47,0.72) 65%, rgba(6,24,47,0.97) 100%)',
          }} />

          {/* Match score */}
          <div style={{
            position: 'absolute', top: 14, right: 14,
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'rgba(6,24,47,0.78)',
            border: '1.5px solid rgba(82,168,50,0.6)',
            borderRadius: 100, padding: '5px 11px',
            backdropFilter: 'blur(8px)',
            transform: `scale(${scorePulse})`,
          }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#52a832', boxShadow: '0 0 8px #52a832' }} />
            <span style={{ fontFamily: FONT.mono, fontSize: 12, fontWeight: 700, color: '#9bd383', letterSpacing: '0.04em' }}>
              {matchScore}% match
            </span>
          </div>

          {/* Card info */}
          <div style={{ position: 'absolute', bottom: 80, left: 16, right: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 4 }}>
              <div>
                <div style={{ fontFamily: FONT.display, fontSize: 20, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                  {title}
                </div>
                <div style={{ fontFamily: FONT.sans, fontSize: 12, color: 'rgba(255,255,255,0.62)', marginTop: 2 }}>
                  {location}
                </div>
              </div>
              <div style={{ fontFamily: FONT.mono, fontSize: 15, fontWeight: 700, color: '#9bd383' }}>
                {price}
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8 }}>
              {tags.map(t => <Chip key={t} label={t} />)}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{
            position: 'absolute', bottom: 18, left: 0, right: 0,
            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18,
          }}>
            <ActionBtn icon="✕" color="rgba(239,68,68,0.7)" bg="rgba(239,68,68,0.12)" shadow="0 4px 16px rgba(239,68,68,0.3)" size={46} fontSize={18} />
            <ActionBtn icon="♥" color="#52a832" bg="rgba(82,168,50,0.18)" shadow="0 4px 20px rgba(82,168,50,0.4)" size={58} fontSize={24} />
            <ActionBtn icon="★" color="#5bc4ff" bg="rgba(38,112,168,0.15)" shadow="0 4px 16px rgba(91,196,255,0.3)" size={46} fontSize={18} />
          </div>
        </div>
      )}

      {/* LIKE stamp — overlaid on the card as it swipes */}
      {rel >= 10 && rel < 32 && (
        <div style={{
          position: 'absolute',
          top: '28%',
          left: '50%',
          transform: `translate(-50%, -50%) scale(${stampScale}) rotate(-15deg)`,
          opacity: stampOp,
          zIndex: 10,
          background: 'rgba(82,168,50,0.18)',
          border: '4px solid #52a832',
          borderRadius: 12,
          padding: '10px 22px',
          pointerEvents: 'none',
        }}>
          <span style={{
            fontFamily: FONT.display,
            fontSize: 36,
            fontWeight: 900,
            color: '#52a832',
            letterSpacing: '0.08em',
            textShadow: '0 0 20px rgba(82,168,50,0.5)',
            textTransform: 'uppercase',
          }}>
            LIKE
          </span>
        </div>
      )}

      {/* MATCH pop — replaces the card after swipe */}
      {rel >= 28 && (
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 24,
          background: 'linear-gradient(160deg, rgba(47,125,50,0.18) 0%, rgba(6,24,47,0.95) 100%)',
          border: '1.5px solid rgba(82,168,50,0.35)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: matchOp,
          overflow: 'hidden',
        }}>
          {/* Green glow burst */}
          <div style={{
            position: 'absolute',
            width: 280, height: 280,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(82,168,50,0.22) 0%, transparent 65%)',
            filter: 'blur(30px)',
            transform: `scale(${interpolate(matchProgress, [0, 1], [0.4, 1])})`,
            opacity: matchProgress,
          }} />

          {/* "It's a match!" text */}
          <div style={{
            fontFamily: FONT.display,
            fontSize: 28,
            fontWeight: 800,
            color: '#9bd383',
            letterSpacing: '-0.025em',
            textAlign: 'center',
            textShadow: '0 0 30px rgba(155,211,131,0.4)',
            transform: `scale(${interpolate(matchProgress, [0, 1], [0.6, 1])})`,
            opacity: matchProgress,
            marginBottom: 20,
            zIndex: 1,
          }}>
            It's a match!
          </div>

          {/* Two avatar circles */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 0,
            opacity: matchProgress,
            transform: `translateY(${interpolate(matchProgress, [0, 1], [20, 0])}px)`,
            zIndex: 1,
          }}>
            {/* The card you swiped (left) */}
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              overflow: 'hidden',
              border: '3px solid #52a832',
              boxShadow: '0 0 20px rgba(82,168,50,0.4)',
              marginRight: -10,
            }}>
              <Img
                src={staticFile(imagePath)}
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
              />
            </div>

            {/* Check circle in middle */}
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, #52a832, #2f7d32)',
              border: '2.5px solid rgba(155,211,131,0.6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(82,168,50,0.5)',
              zIndex: 2,
              flexShrink: 0,
              fontSize: 16,
              color: 'white',
              fontWeight: 700,
            }}>
              ✓
            </div>

            {/* The counterpart who liked back (right) */}
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              overflow: 'hidden',
              border: '3px solid #52a832',
              boxShadow: '0 0 20px rgba(82,168,50,0.4)',
              marginLeft: -10,
            }}>
              <Img
                src={staticFile(counterImage)}
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
              />
            </div>
          </div>

          {/* Sub-text */}
          <div style={{
            marginTop: 18,
            fontFamily: FONT.sans,
            fontSize: 13,
            color: 'rgba(255,255,255,0.55)',
            textAlign: 'center',
            opacity: fi(frame, [startFrame + 38, startFrame + 48], [0, 1], easeOut),
            zIndex: 1,
          }}>
            {matchLine}
          </div>
          <div style={{
            marginTop: 6,
            fontFamily: FONT.mono,
            fontSize: 10,
            color: 'rgba(155,211,131,0.6)',
            letterSpacing: '0.1em',
            opacity: fi(frame, [startFrame + 42, startFrame + 52], [0, 1], easeOut),
            zIndex: 1,
          }}>
            MUTUAL MATCH · RENTEAZY
          </div>
        </div>
      )}
    </div>
  );
}

export default SwipeCard;
