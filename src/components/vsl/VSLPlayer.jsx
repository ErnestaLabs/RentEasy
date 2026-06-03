import React, { useRef, useState } from 'react';
import { Player } from '@remotion/player';
import { BorderBeam } from '@/components/ui/border-beam';
import RentEazyVSL from './RentEazyVSL';

const DURATION_IN_FRAMES = 1800; // 60s × 30fps — 7-act VSL
const FPS = 30;

// userType drives the profile-specific VSL variant.
export default function VSLPlayer({ userType = 'tenant' }) {
  const playerRef = useRef(null);
  const [playing, setPlaying] = useState(true); // autoPlay starts it muted
  const [muted, setMuted] = useState(true);

  const unmute = () => {
    setMuted(false);
    try { playerRef.current?.play(); } catch (_) {}
  };

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
        clickToPlay
        initiallyMuted
        muted={muted}
        acknowledgeRemotionLicense
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      {/* Brand-coloured beam tracing the frame — green → blue, never the
          component's default purple. */}
      <BorderBeam size={220} duration={11} borderWidth={2} colorFrom="#52a832" colorTo="#5bc4ff" />
      <BorderBeam size={220} duration={11} delay={5.5} borderWidth={2} colorFrom="#5bc4ff" colorTo="#52a832" />

      {/* It autoplays muted — the only affordance is a subtle sound toggle. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between px-5 pb-4">
        <div className="rounded-full border border-white/10 bg-black/38 px-3 py-1.5 backdrop-blur-xs">
          <span className="font-['JetBrains_Mono',monospace] text-[10px] tracking-[0.12em] text-white/38">RENTEAZY · 1:00</span>
        </div>
        <button
          type="button"
          onClick={muted ? unmute : () => setMuted(true)}
          className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-3.5 py-2 text-xs text-white/85 backdrop-blur-xs transition-all hover:bg-white/10"
          aria-label={muted ? 'Unmute' : 'Mute'}
        >
          <span className="text-sm">{muted ? '🔇' : '🔊'}</span>
          {muted && <span className="font-medium">Tap for sound</span>}
        </button>
      </div>

      {/* Big tap-to-unmute target while muted (the video is already playing) */}
      {muted && (
        <button
          type="button"
          onClick={unmute}
          aria-label="Tap for sound"
          className="absolute inset-0 z-0 h-full w-full cursor-pointer bg-transparent"
        />
      )}
    </div>
  );
}
