import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const fi = (frame, [f0, f1], [v0, v1]) =>
  clamp(interpolate(frame, [f0, f1], [v0, v1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  }));

const C = {
  navy: '#06182f',
  navyMid: '#092243',
  navyLight: '#0d2e57',
  green: '#52a832',
  greenDark: '#2f7d32',
  greenPale: '#9bd383',
  blue: '#2670a8',
  bluePale: '#cfe9fb',
  white: '#ffffff',
};

const FONT = {
  sans: 'Inter, system-ui, sans-serif',
  mono: "'JetBrains Mono', monospace",
};

// ─── Reusable: swipe card ─────────────────────────────────────────
function SwipeCard({ imageSrc, title, location, price, matchScore, availability, detail, badges, type, swipeX = 0, swipeY = 0, rotate = 0, opacity = 1, scale = 1, dimmed = false }) {
  const typeLabel = type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Flat';
  return (
    <div style={{
      position: 'absolute', inset: 0,
      borderRadius: 32, overflow: 'hidden',
      transform: `translate(${swipeX}px, ${swipeY}px) rotate(${rotate}deg) scale(${scale})`,
      opacity,
      boxShadow: '0 32px 72px rgba(0,0,0,0.62)',
      background: C.navyMid,
    }}>
      <img src={imageSrc} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: dimmed ? 0.45 : 1 }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(6,24,47,0.94) 0%, rgba(6,24,47,0.22) 45%, rgba(6,24,47,0.04) 100%)' }} />
      {!dimmed && (
        <>
          <div style={{ position: 'absolute', top: 20, left: 20, right: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ background: 'rgba(255,255,255,0.94)', backdropFilter: 'blur(10px)', borderRadius: 100, padding: '5px 14px', fontSize: 12, fontWeight: 700, color: C.navyMid, fontFamily: FONT.sans }}>{matchScore}% match</div>
            <div style={{ background: 'rgba(255,255,255,0.16)', border: '1px solid rgba(255,255,255,0.32)', borderRadius: 100, padding: '5px 14px', fontSize: 11, color: 'white', fontFamily: FONT.sans }}>{typeLabel}</div>
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '28px 24px 106px' }}>
            <div style={{ color: 'white', fontSize: 28, fontWeight: 300, letterSpacing: '-0.02em', lineHeight: 1.1, fontFamily: FONT.sans }}>{title}</div>
            <div style={{ color: 'rgba(255,255,255,0.78)', fontSize: 14, marginTop: 5, fontFamily: FONT.sans }}>{location} · {price}</div>
            <div style={{ color: 'rgba(255,255,255,0.58)', fontSize: 12, marginTop: 3, fontFamily: FONT.sans }}>{availability} · {detail}</div>
            <div style={{ display: 'flex', gap: 7, marginTop: 12, flexWrap: 'wrap' }}>
              {(badges || []).map(b => <div key={b} style={{ background: 'rgba(255,255,255,0.13)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 100, padding: '4px 11px', fontSize: 10, color: 'rgba(255,255,255,0.85)', fontFamily: FONT.sans }}>{b}</div>)}
            </div>
          </div>
          <div style={{ position: 'absolute', bottom: 26, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20 }}>
            <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'rgba(255,255,255,0.94)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 28px rgba(0,0,0,0.45)' }}>
              <span style={{ color: '#ef4444', fontSize: 22 }}>✕</span>
            </div>
            <div style={{ width: 62, height: 62, borderRadius: '50%', background: 'rgba(9,34,67,0.96)', border: '1px solid rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'white', fontSize: 24 }}>★</span>
            </div>
            <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'rgba(47,125,50,0.96)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 28px rgba(47,125,50,0.45)' }}>
              <span style={{ color: 'white', fontSize: 20 }}>♥</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Scene 1: HOOK — universal pain (0–90f = 3s) ──────────────────
// Pain tiles span all three audiences — agent, landlord, tenant
const TILES = [
  { text: 'Already let, sorry',       sub: 'Listed 4 hours ago',       x: 6,  y: 5,  r: -4 },
  { text: 'No reply — 3 weeks',       sub: 'Sent 22 messages',          x: 54, y: 3,  r: 3  },
  { text: 'No-show viewing',          sub: 'Third one this week',        x: 30, y: 48, r: -2 },
  { text: 'Unqualified applicant',    sub: 'Budget nowhere near',        x: 72, y: 52, r: 5  },
  { text: 'Landlord ghosted',         sub: 'After 6 viewings',          x: 2,  y: 60, r: -6 },
  { text: 'Application ghosted',      sub: '14 days, no update',        x: 60, y: 72, r: 2  },
  { text: 'Duplicate listing',        sub: 'Same flat, 3× price',       x: 18, y: 76, r: -3 },
  { text: '47 new listings',          sub: '0 actually fit',            x: 42, y: 20, r: 4  },
];

function SceneHook() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tileEnter = (i) => {
    const s = spring({ frame: frame - i * 2, fps, config: { damping: 22, stiffness: 260, mass: 0.8 } });
    return interpolate(s, [0, 1], [60, 0]);
  };
  const stampOp = (i) => fi(frame, [18 + i * 2, 28 + i * 2], [0, 1]);
  const tileOut = (i) => fi(frame, [42 + i, 55 + i], [0, 1]);
  const tileOutX = (i) => (i % 2 === 0 ? -1 : 1) * interpolate(tileOut(i), [0, 1], [0, 180]);
  const heroOp = fi(frame, [52, 64], [0, 1]);
  const heroY = interpolate(spring({ frame: frame - 52, fps, config: { damping: 18, stiffness: 220 } }), [0, 1], [32, 0]);
  const underlineW = fi(frame, [68, 82], [0, 100]);
  const exitOp = fi(frame, [76, 88], [1, 0]);

  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${C.navy} 0%, ${C.navyMid} 100%)`, opacity: exitOp, fontFamily: FONT.sans }}>
      {TILES.map((tile, i) => (
        <div key={tile.text} style={{
          position: 'absolute', left: `${tile.x}%`, top: `${tile.y}%`,
          transform: `translateY(${tileEnter(i)}px) translateX(${tileOutX(i)}px) rotate(${tile.r}deg)`,
          opacity: clamp(1 - tileOut(i) * 1.4),
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 12, padding: '10px 14px', minWidth: 170, backdropFilter: 'blur(6px)',
        }}>
          <div style={{ color: 'rgba(255,255,255,0.82)', fontSize: 12, fontWeight: 500 }}>{tile.text}</div>
          <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 10, marginTop: 3, fontFamily: FONT.mono }}>{tile.sub}</div>
          {stampOp(i) > 0.01 && (
            <div style={{ position: 'absolute', top: -8, right: -8, width: 22, height: 22, borderRadius: '50%', background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: stampOp(i), fontSize: 11, color: 'white', fontWeight: 700 }}>✕</div>
          )}
        </div>
      ))}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: heroOp, transform: `translateY(${heroY}px)`, textAlign: 'center' }}>
        <div style={{ fontSize: 88, fontWeight: 700, color: C.white, letterSpacing: '-0.04em', lineHeight: 1 }}>Stop shouting</div>
        <div style={{ position: 'relative', display: 'inline-block', marginTop: 4 }}>
          <div style={{ fontSize: 88, fontWeight: 700, color: C.white, letterSpacing: '-0.04em', lineHeight: 1 }}>into the void.</div>
          <div style={{ position: 'absolute', bottom: -6, left: 0, height: 5, borderRadius: 3, background: `linear-gradient(90deg, ${C.green}, ${C.greenDark})`, width: `${underlineW}%`, boxShadow: `0 0 18px rgba(82,168,50,0.65)` }} />
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ─── Scene 2: TENANT — post, swipe, match (90–180f = 3s) ─────────
function SceneTenant() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardY = interpolate(spring({ frame: frame - 8, fps, config: { damping: 20, stiffness: 160 } }), [0, 1], [80, 0]);
  const cardOp = fi(frame, [8, 30], [0, 1]);

  // Swipe out to the right after frame 50
  const swipeX = frame > 55 ? interpolate(frame, [55, 80], [0, 480], { extrapolateRight: 'clamp' }) : 0;
  const swipeOp = frame > 55 ? fi(frame, [60, 78], [1, 0]) : 1;

  const labelOp = fi(frame, [62, 82], [0, 1]);
  const labelY = interpolate(spring({ frame: frame - 62, fps, config: { damping: 18, stiffness: 180 } }), [0, 1], [20, 0]);
  const exitOp = fi(frame, [78, 90], [1, 0]);

  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${C.navy} 0%, #0a2540 100%)`, opacity: exitOp, fontFamily: FONT.sans }}>
      {/* Swipe card */}
      <div style={{ position: 'absolute', top: 60, left: '50%', transform: 'translateX(-50%)', width: 300, height: 440 }}>
        <div style={{ position: 'absolute', inset: 8, borderRadius: 28, overflow: 'hidden', transform: 'rotate(3deg) scale(0.95)', opacity: 0.45, background: C.navyMid }} />
        <div style={{
          position: 'absolute', inset: 0,
          transform: `translateX(${swipeX}px) translateY(${cardY}px) rotate(${swipeX / 18}deg)`,
          opacity: cardOp * swipeOp,
        }}>
          <SwipeCard
            imageSrc="/images/match-flat.jpg"
            title="Stratford 1-bed"
            location="Stratford"
            price="£1,650 pcm"
            matchScore={88}
            availability="Available 12 June"
            detail="8 min walk to station"
            badges={['Budget fit', 'No red flags', 'Viewing slots']}
            type="flat"
          />
          {swipeX > 20 && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(47,125,50,0.2)', borderRadius: 32 }}>
              <div style={{ background: C.greenDark, borderRadius: 100, padding: '12px 28px', color: 'white', fontSize: 16, fontWeight: 700 }}>LIKE</div>
            </div>
          )}
        </div>
      </div>
      {/* Label */}
      <div style={{ position: 'absolute', bottom: '6%', left: 0, right: 0, textAlign: 'center', opacity: labelOp, transform: `translateY(${labelY}px)` }}>
        <div style={{ fontSize: 46, fontWeight: 300, color: C.white, letterSpacing: '-0.025em' }}>Everyone swipes here.</div>
        <div style={{ fontSize: 16, color: C.greenPale, marginTop: 8, fontWeight: 300 }}>Scored cards. No noise. No cold messages.</div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 14, flexWrap: 'wrap' }}>
          {[['Tenants', 'homes & rooms'], ['Agents', 'tenants'], ['Landlords', 'tenants & agents']].map(([who, what]) => (
            <div key={who} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 100, padding: '5px 13px', fontSize: 12, color: 'rgba(255,255,255,0.62)' }}>
              <span style={{ color: C.greenPale, fontWeight: 600 }}>{who}</span> swipe {what}
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ─── Scene 3: AGENT REPUTATION (180–390f = 7s) ───────────────────
// The network-effect star scene: reputation compounds as users grow
function SceneAgentRep() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Agent card enters
  const cardScale = 0.82 + spring({ frame: frame - 5, fps, config: { damping: 18, stiffness: 160 } }) * 0.18;
  const cardOp = fi(frame, [5, 30], [0, 1]);

  // Rep rating counts up 4.2 → 4.9
  const repScore = interpolate(frame, [20, 70], [4.2, 4.9], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Tenant match cards fly in from sides, one by one
  const matchTiming = [45, 60, 75, 90, 105, 120];
  const matchCards = [
    { name: 'Amelia R.', budget: '£1,650', area: 'Stratford', score: 91, side: -1 },
    { name: 'Marcus T.', budget: '£1,800', area: 'Canary Wharf', score: 88, side: 1 },
    { name: 'Priya K.',  budget: '£1,450', area: 'Hackney', score: 86, side: -1 },
    { name: 'Tom B.',    budget: '£2,100', area: 'Greenwich', score: 93, side: 1 },
    { name: 'Sofia L.',  budget: '£1,550', area: 'Bethnal Green', score: 85, side: -1 },
    { name: 'Raj M.',    budget: '£1,900', area: 'Bow', score: 89, side: 1 },
  ];

  // Counter: total matches shown over time
  const matchCount = Math.floor(interpolate(frame, [45, 140], [0, 186], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));

  // Insight text — arrives at frame 140
  const insightOp = fi(frame, [140, 165], [0, 1]);
  const insightY = interpolate(spring({ frame: frame - 140, fps, config: { damping: 18, stiffness: 180 } }), [0, 1], [24, 0]);

  // Second insight line
  const insight2Op = fi(frame, [165, 185], [0, 1]);

  const exitOp = fi(frame, [192, 208], [1, 0]);

  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${C.navy} 0%, ${C.navyMid} 100%)`, opacity: exitOp, fontFamily: FONT.sans }}>

      {/* Agent profile card — centre */}
      <div style={{
        position: 'absolute', top: '12%', left: '50%',
        transform: `translateX(-50%) scale(${cardScale})`,
        opacity: cardOp,
        width: 340,
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.14)',
          borderRadius: 28, padding: '26px 28px',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.45)',
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: `linear-gradient(135deg, ${C.blue}, #1a3f6e)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, color: 'white', fontWeight: 600, flexShrink: 0,
            }}>LD</div>
            <div>
              <div style={{ color: 'white', fontSize: 16, fontWeight: 500 }}>Lena from Dockside</div>
              <div style={{ color: 'rgba(255,255,255,0.48)', fontSize: 11, fontFamily: FONT.mono, letterSpacing: '0.08em', marginTop: 2 }}>LETTING AGENCY · EAST LONDON</div>
            </div>
            <div style={{ marginLeft: 'auto', background: 'rgba(82,168,50,0.2)', border: '1px solid rgba(82,168,50,0.4)', borderRadius: 100, padding: '4px 10px' }}>
              <span style={{ color: C.greenPale, fontSize: 10, fontFamily: FONT.mono, letterSpacing: '0.1em' }}>VERIFIED</span>
            </div>
          </div>

          {/* Rep score — animated */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: '14px 16px', textAlign: 'center' }}>
              <div style={{ color: C.greenPale, fontSize: 32, fontWeight: 300, fontFamily: FONT.mono, letterSpacing: '-0.02em' }}>{repScore.toFixed(1)}</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, marginTop: 4, fontFamily: FONT.mono }}>REP SCORE</div>
              <div style={{ color: '#f59e0b', fontSize: 14, marginTop: 4 }}>{'★'.repeat(Math.round(repScore))}</div>
            </div>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: '14px 16px', textAlign: 'center' }}>
              <div style={{ color: '#5bc4ff', fontSize: 32, fontWeight: 300, fontFamily: FONT.mono }}>{matchCount}</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, marginTop: 4, fontFamily: FONT.mono }}>MATCHES MADE</div>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, marginTop: 4 }}>0 disputes</div>
            </div>
          </div>

          {/* Properties strip */}
          <div style={{ display: 'flex', gap: 8 }}>
            {['/images/match-flat.jpg', '/images/match-room.jpg', '/images/match-flat-2.jpg'].map((src, i) => (
              <div key={i} style={{ flex: 1, height: 56, borderRadius: 12, overflow: 'hidden', position: 'relative' }}>
                <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', bottom: 4, right: 4, background: C.greenDark, borderRadius: 100, padding: '2px 6px', fontSize: 9, color: 'white' }}>88%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tenant match cards orbiting in from sides */}
      {matchCards.map((mc, i) => {
        const startF = matchTiming[i];
        const entryProg = clamp(fi(frame, [startF, startF + 18], [0, 1]));
        const exitProg = clamp(fi(frame, [startF + 40, startF + 58], [0, 1]));
        const vis = entryProg * (1 - exitProg);
        if (vis < 0.01) return null;

        const side = mc.side;
        const startX = side < 0 ? -300 : 300;
        const x = interpolate(entryProg, [0, 1], [startX, side < 0 ? -195 : 195]);
        const yOffset = -100 + (i % 3) * 75;

        return (
          <div key={mc.name} style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: `translate(calc(${x}px - 50%), calc(-50% + ${yOffset}px))`,
            opacity: vis,
            background: 'rgba(255,255,255,0.96)',
            borderRadius: 16, padding: '10px 14px', width: 150,
            boxShadow: '0 12px 32px rgba(0,0,0,0.35)',
            fontFamily: FONT.sans,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: `linear-gradient(135deg, ${C.green}, ${C.greenDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'white', fontWeight: 600 }}>
                {mc.name[0]}
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#0f172a' }}>{mc.name}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 10, color: '#475569' }}>{mc.area}</div>
              <div style={{ background: '#edf8ee', borderRadius: 100, padding: '2px 7px', fontSize: 10, fontWeight: 700, color: C.greenDark }}>{mc.score}%</div>
            </div>
            <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 3 }}>{mc.budget} pcm</div>
            <div style={{ marginTop: 6, background: C.greenDark, borderRadius: 100, padding: '3px 0', textAlign: 'center', fontSize: 9, color: 'white' }}>♥ Matched</div>
          </div>
        );
      })}

      {/* Network-effect insight text */}
      <div style={{ position: 'absolute', bottom: '8%', left: 0, right: 0, textAlign: 'center', opacity: insightOp, transform: `translateY(${insightY}px)` }}>
        <div style={{ fontSize: 44, fontWeight: 300, color: C.white, letterSpacing: '-0.025em', lineHeight: 1.1 }}>
          Your reputation works for you.
        </div>
        <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', marginTop: 8, opacity: insight2Op }}>
          Every new user on RentEazy is another tenant who sees your track record.
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ─── Scene 4: LANDLORD — match direct or via agent (390–510f = 4s) ─
function SceneLandlord() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardOp = fi(frame, [8, 32], [0, 1]);
  const cardY = interpolate(spring({ frame: frame - 8, fps, config: { damping: 20, stiffness: 160 } }), [0, 1], [60, 0]);

  // Two route cards slide in
  const route1Op = fi(frame, [40, 62], [0, 1]);
  const route1X = interpolate(spring({ frame: frame - 40, fps, config: { damping: 18, stiffness: 180 } }), [0, 1], [-80, 0]);
  const route2Op = fi(frame, [60, 82], [0, 1]);
  const route2X = interpolate(spring({ frame: frame - 60, fps, config: { damping: 18, stiffness: 180 } }), [0, 1], [80, 0]);

  const textOp = fi(frame, [88, 108], [0, 1]);
  const textY = interpolate(spring({ frame: frame - 88, fps, config: { damping: 18, stiffness: 180 } }), [0, 1], [20, 0]);
  const exitOp = fi(frame, [108, 120], [1, 0]);

  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${C.navy} 0%, #0a2540 100%)`, opacity: exitOp, fontFamily: FONT.sans }}>

      {/* Landlord property card — top */}
      <div style={{ position: 'absolute', top: '8%', left: '50%', transform: `translateX(-50%) translateY(${cardY}px)`, opacity: cardOp, width: 300 }}>
        <div style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 24, padding: '18px 20px' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 14, overflow: 'hidden', flexShrink: 0 }}>
              <img src="/images/match-flat.jpg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div>
              <div style={{ color: '#5bc4ff', fontSize: 9, fontFamily: FONT.mono, letterSpacing: '0.1em', marginBottom: 5 }}>LANDLORD · BOW</div>
              <div style={{ color: 'white', fontSize: 15, fontWeight: 400 }}>Sam P. — 1-bed flat</div>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, marginTop: 3 }}>£1,650 pcm · Available soon</div>
            </div>
          </div>
          <div style={{ marginTop: 14, padding: '8px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: 12, fontSize: 12, color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>
            3 tenants liked this · 1 agent intro request
          </div>
        </div>
      </div>

      {/* Two route cards */}
      <div style={{ position: 'absolute', top: '44%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', gap: 16, width: 540 }}>
        {/* Direct route */}
        <div style={{ flex: 1, opacity: route1Op, transform: `translateX(${route1X}px)`, background: 'rgba(82,168,50,0.1)', border: '1px solid rgba(82,168,50,0.3)', borderRadius: 22, padding: '20px 18px' }}>
          <div style={{ fontSize: 28, marginBottom: 10 }}>🏠</div>
          <div style={{ color: C.greenPale, fontSize: 10, fontFamily: FONT.mono, letterSpacing: '0.12em', marginBottom: 8 }}>DIRECT ROUTE</div>
          <div style={{ color: 'white', fontSize: 15, fontWeight: 300, lineHeight: 1.5 }}>Match and progress a tenant directly. No agent needed.</div>
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {['Swipe tenants yourself', 'Set your own terms', 'Full control'].map(f => (
              <div key={f} style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', display: 'flex', gap: 7 }}>
                <span style={{ color: C.greenPale }}>✓</span> {f}
              </div>
            ))}
          </div>
        </div>

        {/* Via agent route */}
        <div style={{ flex: 1, opacity: route2Op, transform: `translateX(${route2X}px)`, background: 'rgba(91,196,255,0.07)', border: '1px solid rgba(91,196,255,0.25)', borderRadius: 22, padding: '20px 18px' }}>
          <div style={{ fontSize: 28, marginBottom: 10 }}>🤝</div>
          <div style={{ color: '#5bc4ff', fontSize: 10, fontFamily: FONT.mono, letterSpacing: '0.12em', marginBottom: 8 }}>AGENT ROUTE</div>
          <div style={{ color: 'white', fontSize: 15, fontWeight: 300, lineHeight: 1.5 }}>Request an intro to a matched agent. Let them run the search.</div>
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {['Matched agents only', 'Verified rep score', 'Hands-off option'].map(f => (
              <div key={f} style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', display: 'flex', gap: 7 }}>
                <span style={{ color: '#5bc4ff' }}>✓</span> {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: '8%', left: 0, right: 0, textAlign: 'center', opacity: textOp, transform: `translateY(${textY}px)` }}>
        <div style={{ fontSize: 46, fontWeight: 300, color: C.white, letterSpacing: '-0.025em' }}>You choose the route.</div>
        <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.48)', marginTop: 8 }}>Direct to tenant, or matched agent intro. No lock-in.</div>
      </div>
    </AbsoluteFill>
  );
}

// ─── Scene 5: MUTUAL MATCH — all three sides (510–630f = 4s) ──────
function SceneMatch() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const leftX  = interpolate(spring({ frame: frame - 8, fps, config: { damping: 20, stiffness: 140 } }), [0, 1], [-380, 0]);
  const rightX = interpolate(spring({ frame: frame - 8, fps, config: { damping: 20, stiffness: 140 } }), [0, 1], [380, 0]);
  const cardsOp = fi(frame, [8, 35], [0, 1]);

  const matchScale = 0.5 + spring({ frame: frame - 55, fps, config: { damping: 12, stiffness: 280 } }) * 0.5;
  const matchOp   = fi(frame, [55, 72], [0, 1]);
  const matchRing = fi(frame, [55, 80], [0, 1]);

  const textOp = fi(frame, [70, 90], [0, 1]);
  const textY  = interpolate(spring({ frame: frame - 70, fps, config: { damping: 18, stiffness: 180 } }), [0, 1], [20, 0]);
  const exitOp = fi(frame, [102, 118], [1, 0]);

  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${C.navy} 0%, ${C.navyMid} 100%)`, opacity: exitOp, fontFamily: FONT.sans }}>
      <div style={{ position: 'absolute', top: '36%', left: '50%', transform: 'translate(-50%, -50%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, opacity: cardsOp }}>
          {/* Property card */}
          <div style={{ transform: `translateX(${leftX}px)`, width: 160, height: 220, borderRadius: 20, overflow: 'hidden', position: 'relative', boxShadow: '0 20px 48px rgba(0,0,0,0.55)', flexShrink: 0 }}>
            <img src="/images/match-flat.jpg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(6,24,47,0.9) 0%, transparent 55%)' }} />
            <div style={{ position: 'absolute', top: 8, left: 8 }}>
              <div style={{ background: 'rgba(255,255,255,0.93)', borderRadius: 100, padding: '3px 9px', fontSize: 9, fontWeight: 700, color: C.navyMid }}>88% match</div>
            </div>
            <div style={{ position: 'absolute', bottom: 10, left: 10 }}>
              <div style={{ color: C.greenPale, fontSize: 8, fontFamily: FONT.mono, letterSpacing: '0.1em', marginBottom: 3 }}>PROPERTY</div>
              <div style={{ color: 'white', fontSize: 13 }}>Stratford 1-bed</div>
              <div style={{ background: C.greenDark, borderRadius: 100, padding: '3px 7px', marginTop: 6, fontSize: 8, color: 'white', textAlign: 'center' }}>♥ Liked</div>
            </div>
          </div>

          {/* Match circle */}
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: `linear-gradient(135deg, ${C.green}, ${C.greenDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: matchOp, transform: `scale(${matchScale})`, flexShrink: 0, boxShadow: `0 0 0 ${matchRing * 12}px rgba(82,168,50,0.12), 0 0 0 ${matchRing * 24}px rgba(82,168,50,0.06)` }}>
            <span style={{ color: 'white', fontSize: 22 }}>✓</span>
          </div>

          {/* Tenant brief */}
          <div style={{ transform: `translateX(${rightX}px)`, width: 160, height: 220, borderRadius: 20, overflow: 'hidden', position: 'relative', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', flexShrink: 0, boxShadow: '0 20px 48px rgba(0,0,0,0.45)' }}>
            <div style={{ padding: '14px 14px' }}>
              <div style={{ color: '#5bc4ff', fontSize: 8, fontFamily: FONT.mono, letterSpacing: '0.1em', marginBottom: 8 }}>TENANT BRIEF</div>
              <div style={{ color: 'white', fontSize: 14, marginBottom: 8 }}>Amelia R.</div>
              {[['Budget', '£1,650–£1,900'], ['Move', 'Within 30 days'], ['Area', 'Stratford / E3'], ['Profile', '86% complete']].map(([k, v]) => (
                <div key={k} style={{ marginBottom: 6 }}>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 8, fontFamily: FONT.mono }}>{k.toUpperCase()}</div>
                  <div style={{ color: 'white', fontSize: 10, marginTop: 1 }}>{v}</div>
                </div>
              ))}
              <div style={{ background: C.greenDark, borderRadius: 100, padding: '4px 0', marginTop: 8, fontSize: 9, color: 'white', textAlign: 'center' }}>♥ Liked back</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: '10%', left: 0, right: 0, textAlign: 'center', opacity: textOp, transform: `translateY(${textY}px)` }}>
        <div style={{ fontSize: 46, fontWeight: 300, color: C.white, letterSpacing: '-0.025em', lineHeight: 1.1 }}>Both sides like back.<br />Match unlocked.</div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', marginTop: 8 }}>No cold messages. No wasted viewings.</div>
      </div>
    </AbsoluteFill>
  );
}

// ─── Scene 6: BOOST + PROTECT (630–780f = 5s) — universal ─────────
function SceneBoostProtect() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const boostScale = spring({ frame: frame - 10, fps, config: { damping: 14, stiffness: 200 } });
  const boostOp   = fi(frame, [10, 35], [0, 1]);
  const protOp    = fi(frame, [45, 70], [0, 1]);
  const protX     = interpolate(spring({ frame: frame - 45, fps, config: { damping: 18, stiffness: 180 } }), [0, 1], [50, 0]);
  const textOp    = fi(frame, [85, 108], [0, 1]);
  const textY     = interpolate(spring({ frame: frame - 85, fps, config: { damping: 18, stiffness: 180 } }), [0, 1], [20, 0]);
  const exitOp    = fi(frame, [132, 148], [1, 0]);

  const timeline = ['Posted', 'Viewed', 'Liked', 'Matched', 'Viewing', 'Terms', 'Protected'];

  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${C.navy} 0%, ${C.navyMid} 100%)`, opacity: exitOp, fontFamily: FONT.sans }}>
      <div style={{ position: 'absolute', top: '36%', left: '50%', transform: 'translate(-50%, -50%)', width: 640, display: 'flex', gap: 24 }}>
        {/* Boost */}
        <div style={{ flex: 1, background: 'rgba(82,168,50,0.1)', border: '1px solid rgba(82,168,50,0.28)', borderRadius: 28, padding: '28px 24px', opacity: boostOp, transform: `scale(${0.82 + boostScale * 0.18})` }}>
          <div style={{ fontSize: 38, marginBottom: 14 }}>🚀</div>
          <div style={{ color: C.greenPale, fontSize: 11, fontFamily: FONT.mono, letterSpacing: '0.14em', marginBottom: 10 }}>BOOST</div>
          <div style={{ color: 'white', fontSize: 18, fontWeight: 300, lineHeight: 1.4 }}>Reach the right people already looking. No fake audiences.</div>
          <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 5 }}>
            {['♥ Area match', '♥ Budget fit', '★ You — Boosted'].map((item, i) => (
              <div key={item} style={{ background: i === 2 ? `rgba(82,168,50,0.25)` : 'rgba(255,255,255,0.07)', border: `1px solid ${i === 2 ? 'rgba(82,168,50,0.5)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 10, padding: '7px 12px', fontSize: 11, color: i === 2 ? C.greenPale : 'rgba(255,255,255,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {item} {i === 2 && <span style={{ fontSize: 10, color: C.green }}>↑ Visible</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Protect */}
        <div style={{ flex: 1, background: 'rgba(91,196,255,0.07)', border: '1px solid rgba(91,196,255,0.22)', borderRadius: 28, padding: '28px 24px', opacity: protOp, transform: `translateX(${protX}px)` }}>
          <div style={{ fontSize: 38, marginBottom: 14 }}>🛡</div>
          <div style={{ color: '#5bc4ff', fontSize: 11, fontFamily: FONT.mono, letterSpacing: '0.14em', marginBottom: 10 }}>PROTECT</div>
          <div style={{ color: 'white', fontSize: 18, fontWeight: 300, lineHeight: 1.4 }}>A timestamped record of every key step.</div>
          <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 0, flexWrap: 'wrap' }}>
            {timeline.map((step, i) => (
              <React.Fragment key={step}>
                <div style={{ background: 'rgba(91,196,255,0.18)', borderRadius: 100, padding: '4px 8px', fontSize: 9, color: '#5bc4ff', whiteSpace: 'nowrap' }}>{step}</div>
                {i < timeline.length - 1 && <div style={{ width: 10, height: 1, background: 'rgba(91,196,255,0.28)', flexShrink: 0 }} />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: '10%', left: 0, right: 0, textAlign: 'center', opacity: textOp, transform: `translateY(${textY}px)` }}>
        <div style={{ fontSize: 46, fontWeight: 300, color: C.white, letterSpacing: '-0.025em', lineHeight: 1.1 }}>More visibility.<br />Every step on record.</div>
      </div>
    </AbsoluteFill>
  );
}

// ─── Scene 7: FINALE — tenants, agents, landlords (780–900f = 4s) ─
function SceneFinale() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = 0.78 + spring({ frame, fps, config: { damping: 20, stiffness: 140 } }) * 0.22;
  const logoOp    = fi(frame, [0, 28], [0, 1]);
  const markOp    = fi(frame, [18, 42], [0, 1]);

  // Three audience pills appear in sequence
  const pill1Op = fi(frame, [28, 46], [0, 1]);
  const pill2Op = fi(frame, [40, 58], [0, 1]);
  const pill3Op = fi(frame, [52, 70], [0, 1]);

  const closeOp  = fi(frame, [44, 60], [0, 1]);
  const ctaScale = 0.8 + spring({ frame: frame - 56, fps, config: { damping: 14, stiffness: 200 } }) * 0.2;
  const ctaOp    = fi(frame, [60, 78], [0, 1]);
  const glow     = 0.5 + Math.sin(frame / 8) * 0.08;

  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${C.navy} 0%, ${C.navyMid} 100%)`, fontFamily: FONT.sans, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%)', width: 480, height: 280, borderRadius: '50%', background: `rgba(82,168,50,${glow * 0.18})`, filter: 'blur(72px)' }} />

      <div style={{ textAlign: 'center', opacity: logoOp, transform: `scale(${logoScale})` }}>
        <div style={{ fontSize: 82, fontWeight: 300, color: C.white, letterSpacing: '-0.04em', lineHeight: 1 }}>RentEazy</div>
        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center', opacity: markOp }}>
          <span style={{ fontFamily: FONT.mono, fontSize: 14, color: C.green, letterSpacing: '0.18em' }}>EASY</span>
          <span style={{ fontFamily: FONT.mono, fontSize: 14, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.18em' }}>PEAZY</span>
        </div>
      </div>

      {/* Audience pills */}
      <div style={{ marginTop: 28, display: 'flex', gap: 12, justifyContent: 'center' }}>
        <div style={{ opacity: pill1Op, background: 'rgba(82,168,50,0.18)', border: '1px solid rgba(82,168,50,0.4)', borderRadius: 100, padding: '8px 18px' }}>
          <span style={{ color: C.greenPale, fontSize: 13, fontWeight: 400 }}>🏠 Renters & buddies</span>
        </div>
        <div style={{ opacity: pill2Op, background: 'rgba(91,196,255,0.14)', border: '1px solid rgba(91,196,255,0.35)', borderRadius: 100, padding: '8px 18px' }}>
          <span style={{ color: '#5bc4ff', fontSize: 13, fontWeight: 400 }}>🏢 Agents, agencies & hosts</span>
        </div>
        <div style={{ opacity: pill3Op, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 100, padding: '8px 18px' }}>
          <span style={{ color: '#fbbf24', fontSize: 13, fontWeight: 400 }}>🔑 Landlords, operators & investors</span>
        </div>
      </div>

      <div style={{ marginTop: 26, textAlign: 'center', opacity: closeOp }}>
        <div style={{ fontSize: 26, fontWeight: 300, color: C.white, letterSpacing: '-0.02em' }}>Your next rental signal is already moving.</div>
      </div>

      <div style={{ marginTop: 18, opacity: ctaOp, transform: `scale(${ctaScale})`, textAlign: 'center' }}>
        <div style={{
          background: `linear-gradient(135deg, ${C.green}, ${C.greenDark})`,
          borderRadius: 100, padding: '17px 46px', color: 'white', fontSize: 18, fontWeight: 500, display: 'inline-block',
          boxShadow: `0 18px 44px rgba(47,125,50,0.44), 0 0 0 1px rgba(255,255,255,0.2)`,
        }}>
          Start free — 2 minutes, no card
        </div>
        <div style={{ marginTop: 14, fontFamily: FONT.mono, fontSize: 12, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em' }}>
          renteazy.co.uk · free to post · free to swipe
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ─── Root composition ─────────────────────────────────────────────
export default function RentEazyVSL() {
  return (
    <AbsoluteFill style={{ background: C.navy, fontFamily: FONT.sans }}>
      <Audio src={staticFile('/audio/summer.mp3')} volume={0.72} />
      <Sequence from={0}   durationInFrames={90}><SceneHook /></Sequence>
      <Sequence from={90}  durationInFrames={90}><SceneTenant /></Sequence>
      <Sequence from={180} durationInFrames={210}><SceneAgentRep /></Sequence>
      <Sequence from={390} durationInFrames={120}><SceneLandlord /></Sequence>
      <Sequence from={510} durationInFrames={120}><SceneMatch /></Sequence>
      <Sequence from={630} durationInFrames={150}><SceneBoostProtect /></Sequence>
      <Sequence from={780} durationInFrames={120}><SceneFinale /></Sequence>
    </AbsoluteFill>
  );
}
