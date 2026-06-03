import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// RentEazy voice assistant — a custom branded rendering on top of the
// @tixae-labs/web-sdk WebCall class (NOT the stock iframe). The heavy SDK is
// lazy-imported the first time someone opens the panel, so it never touches
// the initial bundle / page load.
const AGENT_ID = import.meta.env.VITE_TIXAE_AGENT_ID || 'DbOkbg8YOyrFdlEt2OQO';
const REGION = import.meta.env.VITE_TIXAE_REGION || 'eu';

const STATUS_LABEL = {
  idle: 'Tap to talk',
  connecting: 'Connecting…',
  live: 'Listening',
  ended: 'Call ended',
  error: 'Mic blocked',
};

export default function RentEazyVoiceAgent() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | connecting | live | ended | error
  const [messages, setMessages] = useState([]); // {role, content}
  const [muted, setMuted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [pulse, setPulse] = useState(0); // bumps the orb on each new turn
  const voiceRef = useRef(null);
  const transcriptRef = useRef(null);

  const live = status === 'live';

  // Lazy-create the WebCall instance + wire events on first use.
  const ensureVoice = useCallback(async () => {
    if (voiceRef.current) return voiceRef.current;
    const mod = await import('@tixae-labs/web-sdk');
    const WebCall = mod.WebCall || mod.default;
    const voice = new WebCall();

    voice.on('call-start', () => setStatus('live'));
    voice.on('state-change', (s) => {
      if (s === 'connecting') setStatus('connecting');
      else if (s === 'connected') setStatus('live');
    });
    voice.on('call-ended', () => setStatus('ended'));
    voice.on('call-end', () => setStatus('ended'));
    voice.on('mute-change', (m) => setMuted(Boolean(m)));
    voice.on('conversation-update', (payload) => {
      const history = (payload && payload.messagesHistory) || [];
      const turns = history.filter((m) => m.role === 'user' || m.role === 'assistant');
      setMessages(turns);
      setPulse((p) => p + 1);
    });
    voice.on('error', (err) => {
      setStatus('error');
      setErrorMsg(typeof err === 'string' ? err : (err?.message || 'Voice unavailable. Check mic permissions.'));
    });

    await voice.init({ agentId: AGENT_ID, region: REGION });
    voiceRef.current = voice;
    return voice;
  }, []);

  const startCall = useCallback(async () => {
    setErrorMsg('');
    setStatus('connecting');
    try {
      const voice = await ensureVoice();
      await voice.startCall();
    } catch (err) {
      setStatus('error');
      setErrorMsg(err?.message || 'Could not start the call. Allow microphone access and try again.');
    }
  }, [ensureVoice]);

  const endCall = useCallback(() => {
    try { voiceRef.current?.endCall(); } catch (_) {}
    setStatus('ended');
  }, []);

  const toggleMute = useCallback(() => {
    try { voiceRef.current?.toggleMute(); } catch (_) {}
  }, []);

  // Auto-scroll transcript to newest turn.
  useEffect(() => {
    const el = transcriptRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  // End the call if the widget unmounts.
  useEffect(() => () => { try { voiceRef.current?.endCall(); } catch (_) {} }, []);

  const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant');

  return (
    <>
      {/* Launcher */}
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Talk to the RentEazy assistant"
        className="fixed bottom-24 right-4 z-[58] flex items-center gap-2.5 rounded-full border border-[#25672a] bg-linear-to-b from-[#52a832] to-[#2f7d32] px-4 py-3 text-white shadow-[0_12px_28px_rgba(47,125,50,0.4),inset_0_1px_0_rgba(255,255,255,0.35)] md:bottom-6 md:right-6"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
      >
        <span className="relative flex h-5 w-5 items-center justify-center">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/50" />
          <iconify-icon icon="solar:microphone-3-bold" class="relative text-lg"></iconify-icon>
        </span>
        <span className="text-sm font-medium">Ask RentEazy</span>
      </motion.button>

      {/* Call panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: 'spring', damping: 22, stiffness: 240 }}
            className="fixed bottom-40 right-4 z-[59] w-[min(92vw,360px)] overflow-hidden rounded-[1.75rem] border border-white/10 bg-linear-to-b from-[#0d2e57] to-[#06182f] text-white shadow-[0_40px_90px_-30px_rgba(9,34,67,0.85),inset_0_1px_0_rgba(255,255,255,0.12)] md:bottom-24 md:right-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10">
                  <iconify-icon icon="solar:soundwave-bold" class="text-base text-[#9bd383]"></iconify-icon>
                </span>
                <div>
                  <p className="text-sm font-medium leading-none">RentEazy Assistant</p>
                  <p className="mt-1 font-['JetBrains_Mono',monospace] text-[10px] tracking-[0.12em] text-[#9bd383]">
                    {(STATUS_LABEL[status] || 'Voice').toUpperCase()}
                  </p>
                </div>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="rounded-full p-1.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white">
                <iconify-icon icon="solar:close-circle-linear" class="text-xl"></iconify-icon>
              </button>
            </div>

            {/* Orb visualiser */}
            <div className="relative flex h-44 items-center justify-center overflow-hidden">
              {/* pulse rings (only while live) */}
              {live && [0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="absolute rounded-full border border-[#9bd383]/30"
                  initial={{ width: 88, height: 88, opacity: 0.5 }}
                  animate={{ width: 200, height: 200, opacity: 0 }}
                  transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.8, ease: 'easeOut' }}
                />
              ))}
              <motion.div
                key={pulse}
                className="relative flex h-24 w-24 items-center justify-center rounded-full bg-linear-to-br from-[#52a832] to-[#2670a8] shadow-[0_0_50px_-6px_rgba(82,168,50,0.7)]"
                animate={live
                  ? { scale: [1, 1.08, 1] }
                  : status === 'connecting'
                    ? { scale: [1, 1.04, 1], opacity: [0.8, 1, 0.8] }
                    : { scale: 1 }}
                transition={live || status === 'connecting'
                  ? { duration: live ? 1.6 : 0.9, repeat: Infinity, ease: 'easeInOut' }
                  : { duration: 0.3 }}
              >
                <iconify-icon
                  icon={live ? 'solar:soundwave-bold' : status === 'connecting' ? 'solar:refresh-linear' : 'solar:microphone-3-bold'}
                  class={`text-4xl text-white ${status === 'connecting' ? 'animate-spin' : ''}`}
                ></iconify-icon>
              </motion.div>
            </div>

            {/* Live caption / transcript */}
            <div className="px-5 pb-2">
              {status === 'error' ? (
                <p className="rounded-2xl bg-[#fef2f2]/10 border border-[#fecaca]/20 px-3 py-2.5 text-xs leading-5 text-[#fecaca]">{errorMsg}</p>
              ) : messages.length ? (
                <div ref={transcriptRef} className="max-h-28 space-y-2 overflow-y-auto pr-1">
                  {messages.slice(-6).map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <span className={`max-w-[85%] rounded-2xl px-3 py-1.5 text-xs leading-5 ${m.role === 'user' ? 'bg-white/10 text-white/80' : 'bg-[#9bd383]/14 text-[#dff4e2]'}`}>
                        {m.content}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-xs leading-6 text-white/55">
                  {live ? 'Listening — ask me anything about renting, matching, or how RentEazy works.'
                    : 'Talk to RentEazy. Ask how matching works, what it costs, or where it’s live.'}
                </p>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 px-5 pb-5 pt-3">
              {live ? (
                <>
                  <button type="button" onClick={endCall} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#ef4444] px-4 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90">
                    <iconify-icon icon="solar:end-call-bold" class="text-base"></iconify-icon>
                    End
                  </button>
                  <button type="button" onClick={toggleMute} aria-label={muted ? 'Unmute' : 'Mute'} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/8 text-white/80 transition-colors hover:bg-white/15">
                    <iconify-icon icon={muted ? 'solar:microphone-slash-bold' : 'solar:microphone-3-bold'} class="text-lg"></iconify-icon>
                  </button>
                </>
              ) : (
                <button type="button" onClick={startCall} disabled={status === 'connecting'} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-linear-to-b from-[#52a832] to-[#2f7d32] px-4 py-3 text-sm font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] transition-all hover:from-[#64bd44] hover:to-[#3b8d3d] disabled:opacity-60">
                  <iconify-icon icon="solar:phone-calling-rounded-bold" class="text-base"></iconify-icon>
                  {status === 'connecting' ? 'Connecting…' : status === 'ended' ? 'Call again' : 'Start voice call'}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
