import React, { useRef, useState, useEffect } from 'react';
import { Player } from '@remotion/player';
import { BorderBeam } from '@/components/ui/border-beam';
import RentEazyVSL from './RentEazyVSL';

const DURATION_IN_FRAMES = 1800; // 60s × 30fps — 7-act VSL
const FPS = 30;

/**
 * VSLPlayer — wraps the Remotion Player with:
 *   - autoPlay, muted (browser policy requires muted autoplay)
 *   - unmissable "Tap for sound" pulsing overlay while muted
 *   - on unmute: seek to frame 0 + play so the viewer hears from the top
 *   - BorderBeam brand overlays (green → blue)
 */
export default function VSLPlayer({ userType = 'tenant' }) {
  const playerRef = useRef(null);
  const [muted, setMuted] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Pulse animation tick — drives the CSS-in-JS pulse ring
  const [pulseTick, setPulseTick] = useState(0);
  useEffect(() => {
    if (!muted) return;
    const id = setInterval(() => setPulseTick((t) => t + 1), 16);
    return () => clearInterval(id);
  }, [muted]);

  // Pulse scale: 1 → 1.18 → 1 on a 1.4s sine cycle
  const pulseScale = 1 + Math.sin((pulseTick / 60) * Math.PI * 2 * 0.7) * 0.09;
  // Pulse opacity: breathes between 0.6 and 1
  const pulseOpacity = 0.7 + Math.sin((pulseTick / 60) * Math.PI * 2 * 0.7) * 0.3;

  function unmute() {
    setMuted(false);
    setHasInteracted(true);
    // Seek to frame 0 so the viewer hears the track from the top
    try {
      playerRef.current?.seekTo(0);
      playerRef.current?.play();
    } catch (_) {}
  }

  function toggleMute() {
    if (muted) {
      unmute();
    } else {
      setMuted(true);
    }
  }

  return (
    <div
      className="relative w-full overflow-hidden rounded-4xl bg-[#06182f]"
      style={{
        aspectRatio: '16/9',
        boxShadow: '0 40px 90px -45px rgba(9,34,67,0.7), 0 0 0 1px rgba(255,255,255,0.06)',
      }}
    >
      <Player
        ref={playerRef}
        component={RentEazyVSL}
        durationInFrames={DURATION_IN_FRAMES}
        compositionWidth={1280}
        compositionHeight={720}
        fps={FPS}
        inputProps={{ userType }}
        style={{ width: '100%', height: '100%', borderRadius: '2rem' }}
        controls={false}
        autoPlay
        loop
        clickToPlay={false}
        initiallyMuted
        muted={muted}
        acknowledgeRemotionLicense
      />

      {/* Brand-coloured beam tracing the frame — green → blue */}
      <BorderBeam size={220} duration={11} borderWidth={2} colorFrom="#52a832" colorTo="#5bc4ff" />
      <BorderBeam size={220} duration={11} delay={5.5} borderWidth={2} colorFrom="#5bc4ff" colorTo="#52a832" />

      {/* ── UNMISSABLE "TAP FOR SOUND" OVERLAY (shown while muted) ─────────── */}
      {muted && (
        <button
          type="button"
          onClick={unmute}
          aria-label="Tap for sound"
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(6,24,47,0.52)',
            backdropFilter: 'blur(2px)',
            cursor: 'pointer',
            border: 'none',
            zIndex: 10,
          }}
        >
          {/* Pulse ring */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Outer pulse ring */}
            <div style={{
              position: 'absolute',
              width: 104,
              height: 104,
              borderRadius: '50%',
              border: '2px solid rgba(82,168,50,0.5)',
              transform: `scale(${pulseScale})`,
              opacity: 0.5,
              pointerEvents: 'none',
            }} />
            {/* Mid ring */}
            <div style={{
              position: 'absolute',
              width: 84,
              height: 84,
              borderRadius: '50%',
              border: '1.5px solid rgba(82,168,50,0.35)',
              transform: `scale(${1 + (pulseScale - 1) * 0.5})`,
              opacity: 0.4,
              pointerEvents: 'none',
            }} />
            {/* Core button */}
            <div style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #52a832, #2f7d32)',
              boxShadow: `0 0 32px rgba(82,168,50,${pulseOpacity * 0.55}), 0 8px 24px rgba(0,0,0,0.4)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              transform: `scale(${1 + (pulseScale - 1) * 0.3})`,
            }}>
              🔊
            </div>
          </div>

          {/* Label */}
          <div style={{
            marginTop: 16,
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 15,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.92)',
            letterSpacing: '0.01em',
          }}>
            Tap for sound
          </div>
          <div style={{
            marginTop: 5,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            letterSpacing: '0.14em',
            color: 'rgba(155,211,131,0.7)',
            textTransform: 'uppercase',
          }}>
            hear it from the top
          </div>
        </button>
      )}

      {/* ── Bottom HUD (always visible, above overlay) ──────────────────────── */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between px-5 pb-4"
        style={{ zIndex: 20 }}
      >
        <div className="rounded-full border border-white/10 bg-black/38 px-3 py-1.5 backdrop-blur-xs">
          <span className="font-['JetBrains_Mono',monospace] text-[10px] tracking-[0.12em] text-white/38">
            RENTEAZY · 1:00
          </span>
        </div>

        {/* Small mute/unmute toggle (always reachable once overlay dismissed) */}
        {!muted && (
          <button
            type="button"
            onClick={toggleMute}
            className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-3.5 py-2 text-xs text-white/85 backdrop-blur-xs transition-all hover:bg-white/10"
            aria-label="Mute"
            style={{ zIndex: 21 }}
          >
            <span className="text-sm">🔊</span>
          </button>
        )}
      </div>
    </div>
  );
}
