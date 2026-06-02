import React, { useEffect, useRef, useState } from 'react';
import { Player } from '@remotion/player';
import { BorderBeam } from '@/components/ui/border-beam';
import RentEazyVSL from './RentEazyVSL';

const DURATION_IN_FRAMES = 900;
const FPS = 30;

export default function VSLPlayer() {
  const playerRef = useRef(null);
  const containerRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const hasAutoStarted = useRef(false);

  const tryPlay = () => {
    try {
      playerRef.current?.play();
      setPlaying(true);
    } catch (_) {}
  };

  // Autoplay when the player enters the viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAutoStarted.current) {
          hasAutoStarted.current = true;
          // Small delay so Remotion is fully initialised
          setTimeout(tryPlay, 180);
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const unmute = () => {
    setMuted(false);
    tryPlay();
  };

  return (
    <div
      ref={containerRef}
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
        style={{ width: '100%', height: '100%', borderRadius: '2rem' }}
        controls={false}
        loop
        clickToPlay
        muted={muted}
        acknowledgeRemotionLicense
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      {/* Brand-coloured beam tracing the frame — draws the eye to the explainer
          without shouting. Green → blue, never the component's default purple. */}
      <BorderBeam size={220} duration={11} borderWidth={2} colorFrom="#52a832" colorTo="#5bc4ff" />
      <BorderBeam size={220} duration={11} delay={5.5} borderWidth={2} colorFrom="#5bc4ff" colorTo="#52a832" />

      {/* Play button — shown until first play event fires */}
      {!playing && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-300">
          <button
            type="button"
            onClick={() => { hasAutoStarted.current = true; tryPlay(); }}
            className="pointer-events-auto group flex items-center justify-center rounded-full bg-white/14 border border-white/22 backdrop-blur-md transition-all duration-200 hover:bg-white/28 hover:scale-105 active:scale-95"
            aria-label="Play video"
            style={{ width: 72, height: 72 }}
          >
            <svg viewBox="0 0 24 24" fill="white" className="h-8 w-8 translate-x-0.5" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        </div>
      )}

      {/* Controls — shown when playing */}
      {playing && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between px-5 pb-4">
          <div className="rounded-full border border-white/10 bg-black/38 px-3 py-1.5 backdrop-blur-xs">
            <span className="font-['JetBrains_Mono',monospace] text-[10px] tracking-[0.12em] text-white/38">RENTEAZY · 0:30</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="pointer-events-auto rounded-full border border-white/15 bg-black/38 px-3 py-2 text-sm backdrop-blur-xs transition-all hover:bg-white/10"
              onClick={muted ? unmute : () => setMuted(true)}
              title={muted ? 'Unmute' : 'Mute'}
            >
              {muted ? '🔇' : '🔊'}
            </button>
            <button
              type="button"
              className="pointer-events-auto rounded-full border border-white/12 bg-black/38 px-4 py-2 text-xs text-white/45 backdrop-blur-xs transition-colors hover:text-white/85"
              onClick={() => playerRef.current?.toggle()}
            >
              ❚❚
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
