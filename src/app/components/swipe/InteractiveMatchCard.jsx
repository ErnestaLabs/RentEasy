import { useRef, useState } from 'react';
import { ArrowDownLeft, Check, Heart, RotateCcw, Send, Sparkles, X } from 'lucide-react';
import DemoCardVisual from './DemoCardVisual';

export default function InteractiveMatchCard({ cards = [], canSwipe = true, onSwipeAction = () => {}, onBlocked = () => {}, immersive = false }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [swipeCount, setSwipeCount] = useState(0);
  const [likeCount, setLikeCount] = useState(0);
  const [feedback, setFeedback] = useState('Try the swipe deck');
  const [modal, setModal] = useState(null);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const deck = cards;
  const card = deck[activeIndex % deck.length];
  const nextCard = deck[(activeIndex + 1) % deck.length];
  const totalCards = deck.length;
  const progress = totalCards ? ((activeIndex + 1) / totalCards) * 100 : 0;
  const visibleIndex = totalCards ? activeIndex % totalCards : 0;

  if (!deck.length) {
    return (
      <section className="grid h-[100dvh] min-h-[32rem] place-items-center bg-[#050506] px-6 text-center text-white md:rounded-[2.15rem]">
        <div>
          <p className="text-lg font-bold">No cards ready yet.</p>
          <p className="mt-2 text-sm text-white/58">The deck will appear when matching data is available.</p>
        </div>
      </section>
    );
  }

  const showTrial = (kind, nextSwipeCount) => {
    if (immersive) return;
    if (kind === 'superlike') {
      setModal({
        title: 'Get seen sooner.',
        text: 'Superlikes push you higher in suitable match decks. Try the real Match experience free for 24 hours.',
      });
      return;
    }
    if (nextSwipeCount > 0 && nextSwipeCount % totalCards === 0) {
      setModal({
        title: "You finished today's starter deck.",
        text: 'Your real matches are waiting. Create a free account and unlock your RentEazy Match deck for 24 hours.',
      });
      return;
    }
    if (kind === 'like' && likeCount === 0) {
      setModal({
        title: 'Nice match.',
        text: 'Create a free account and unlock your real RentEazy Match deck for 24 hours.',
      });
      return;
    }
    if (nextSwipeCount > 0 && nextSwipeCount % 5 === 0) {
      setModal({
        title: "You're getting the idea.",
        text: 'Want your real matches? Create a free account and try RentEazy Match free for 24 hours.',
      });
    }
  };

  const rewind = () => {
    if (swipeCount <= 0) {
      setFeedback('Nothing to rewind yet');
      return;
    }
    setActiveIndex((current) => (current - 1 + deck.length) % deck.length);
    setSwipeCount((count) => Math.max(0, count - 1));
    setDragX(0);
    setDragY(0);
    setFeedback('Previous card restored');
  };

  const swipe = (action) => {
    if (!canSwipe) {
      setFeedback('Daily swipes used');
      onBlocked();
      return;
    }
    const direction = action === 'pass' ? -1 : 1;
    const y = action === 'superlike' ? -420 : 0;
    const nextSwipeCount = swipeCount + 1;
    setIsDragging(false);
    setDragX(direction * 420);
    setDragY(y);

    if (action === 'pass') {
      setFeedback('Showing fewer like this');
    } else if (action === 'superlike') {
      setFeedback('Superlike used');
      setLikeCount((count) => count + 1);
    } else {
      setFeedback('More like this');
      setLikeCount((count) => count + 1);
    }

    setSwipeCount(nextSwipeCount);
    onSwipeAction(action, card);
    showTrial(action, nextSwipeCount);

    window.setTimeout(() => {
      setActiveIndex((current) => (current + 1) % deck.length);
      setDragX(0);
      setDragY(0);
    }, 220);
  };

  const handlePointerDown = (event) => {
    if (event.pointerType === 'mouse') return;
    startXRef.current = event.clientX;
    startYRef.current = event.clientY;
    setIsDragging(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (!isDragging) return;
    setDragX(Math.max(-150, Math.min(150, event.clientX - startXRef.current)));
    setDragY(Math.max(-120, Math.min(80, event.clientY - startYRef.current)));
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    if (dragY < -70) {
      swipe('superlike');
      return;
    }
    if (Math.abs(dragX) > 64) {
      swipe(dragX > 0 ? 'like' : 'pass');
      return;
    }
    setIsDragging(false);
    setDragX(0);
    setDragY(0);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowLeft') swipe('pass');
    if (event.key === 'ArrowRight' || event.key === 'Enter') swipe('like');
    if (event.key === 'ArrowUp') swipe('superlike');
  };

  if (immersive) {
    const actionButtons = [
      { label: 'Rewind', icon: RotateCcw, onClick: rewind, className: 'h-11 w-11 border-white/10 bg-white/9 text-white/74 hover:bg-white/14' },
      { label: 'Not for me', icon: X, onClick: () => swipe('pass'), className: 'h-[3.75rem] w-[3.75rem] border-[#ff4f73]/28 bg-[#17191f] text-[#ff4f73] shadow-[0_16px_38px_-22px_rgba(255,79,115,0.8)]' },
      { label: 'Priority', icon: Sparkles, onClick: () => swipe('superlike'), className: 'h-[4.5rem] w-[4.5rem] border-[#62a8ff]/30 bg-[#0d2a4c] text-[#62a8ff] shadow-[0_20px_46px_-24px_rgba(98,168,255,0.86)]' },
      { label: 'Interested', icon: Heart, onClick: () => swipe('like'), className: 'h-[3.75rem] w-[3.75rem] border-[#64dd70]/30 bg-[#112416] text-[#64dd70] shadow-[0_16px_38px_-22px_rgba(100,221,112,0.78)]' },
      { label: 'Send', icon: Send, onClick: () => swipe('superlike'), className: 'h-11 w-11 border-white/10 bg-white/9 text-[#36a3ff] hover:bg-white/14' },
    ];

    return (
      <section className="relative h-[100dvh] min-h-[42rem] overflow-hidden bg-[#050506] text-white md:h-[calc(100vh-2rem)] md:min-h-[45rem] md:rounded-[2.15rem] md:border md:border-white/10 md:shadow-[0_34px_84px_-48px_rgba(0,0,0,0.9)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(47,125,50,0.26),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.08),transparent_18%,rgba(0,0,0,0.92)_100%)]" />
        <div className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-4 pt-4 md:px-5 md:pt-5">
          <div className="pl-12 md:pl-12">
            <p className="flex items-center gap-1.5 font-['JetBrains_Mono',monospace] text-[10px] font-medium uppercase tracking-[0.16em] text-[#9bd383]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#52a832]" />RentEazy Match
            </p>
            <p className="mt-1.5 text-sm font-semibold text-white">{feedback}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 font-['JetBrains_Mono',monospace] text-[11px] font-medium text-white/82 backdrop-blur-xl">{visibleIndex + 1}/{totalCards}</span>
            <button type="button" onClick={() => swipe('superlike')} className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/10 text-[#62a8ff] backdrop-blur-xl" aria-label="Priority signal">
              <Sparkles className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="absolute inset-x-0 top-[5.25rem] bottom-[12rem] px-3 md:top-[5.75rem] md:bottom-[7.25rem] md:px-4">
          <div className="absolute inset-x-7 top-6 bottom-0 rounded-[2.2rem] bg-white/6 blur-[1px]" />
          <article
            key={card.title}
            role="button"
            tabIndex={0}
            aria-label={`Swipe card: ${card.title}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onKeyDown={handleKeyDown}
            className={`hero-swipe-card absolute inset-3 overflow-hidden rounded-[2.15rem] border border-white/12 bg-[#121318] shadow-[0_34px_76px_-38px_rgba(0,0,0,0.98)] outline-hidden ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            style={{ transform: `translate(${dragX}px, ${dragY}px) rotate(${dragX / 24}deg)` }}
          >
            <DemoCardVisual card={card} />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-linear-to-b from-black/56 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-linear-to-t from-black/92 via-black/34 to-transparent" />
            <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity ${Math.abs(dragX) > 28 || dragY < -50 ? 'opacity-100' : 'opacity-0'}`}>
              <span className={`rotate-[-10deg] rounded-2xl border-2 px-6 py-3 text-base font-black uppercase tracking-[0.14em] shadow-2xl ${dragY < -50 ? 'border-[#62a8ff] bg-[#0d2a4c]/84 text-[#62a8ff]' : dragX >= 0 ? 'border-[#64dd70] bg-[#112416]/84 text-[#64dd70]' : 'border-[#ff4f73] bg-[#231018]/84 text-[#ff4f73]'}`}>
                {dragY < -50 ? 'Priority' : dragX >= 0 ? 'Interested' : 'Not for me'}
              </span>
            </div>
          </article>
        </div>

        <div className="absolute inset-x-0 bottom-[6.35rem] z-30 flex items-center justify-center gap-2.5 px-4 md:bottom-5 md:gap-3">
          {actionButtons.map(({ label, icon: Icon, onClick, className }) => (
            <button
              key={label}
              type="button"
              aria-label={label}
              title={label}
              onClick={(event) => {
                event.stopPropagation();
                onClick();
              }}
              className={`grid shrink-0 place-items-center rounded-full border backdrop-blur-xl transition hover:scale-105 active:scale-95 ${className}`}
            >
              <Icon className="h-5 w-5" strokeWidth={label === 'Interested' ? 2.6 : 2.3} />
            </button>
          ))}
        </div>
      </section>
    );
  }

  return (
    <div className={`relative overflow-hidden ${immersive ? 'rounded-[1.2rem] bg-transparent' : 'rounded-[1.7rem] bg-white border border-slate-200 shadow-[0_14px_34px_-26px_rgba(15,23,42,0.42),inset_0_1px_0_white]'}`}>
      {modal && (
        <div className="absolute inset-x-4 top-4 z-30 rounded-3xl bg-white/96 backdrop-blur-sm border border-white p-5 shadow-[0_24px_52px_-28px_rgba(15,23,42,0.55)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-lg font-normal tracking-tight text-slate-950">{modal.title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{modal.text}</p>
            </div>
            <button type="button" aria-label="Keep swiping" onClick={() => setModal(null)} className="h-9 w-9 shrink-0 rounded-full border border-slate-200 bg-white text-slate-500">
              <iconify-icon icon="solar:close-circle-linear" class="text-xl"></iconify-icon>
            </button>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row gap-2">
            <a href="/signup?trial=match24h&source=landing_swipe" className="inline-flex items-center justify-center rounded-full bg-[#2f7d32] px-5 py-3 text-sm text-white">Try Match free for 24 hours</a>
            <button type="button" onClick={() => setModal(null)} className="inline-flex items-center justify-center rounded-full bg-slate-50 border border-slate-200 px-5 py-3 text-sm text-slate-600">Keep swiping</button>
          </div>
        </div>
      )}
      <div className={immersive ? 'p-0' : 'p-4 sm:p-5'}>
        {!immersive && <div className="flex items-start justify-between gap-4 pb-4">
          <div>
            <p className="font-['JetBrains_Mono',monospace] text-xs text-[#2670a8]">TRY THE SWIPE DECK</p>
            <p className="mt-1 text-sm text-slate-500">Tap not for me when it does not fit. Like what does. Superlike to get seen sooner.</p>
          </div>
          <div className="rounded-full bg-[#edf7ff] border border-[#cde7f8] px-3 py-1 text-xs text-[#154f79]">{activeIndex + 1} / {totalCards}</div>
        </div>}
        {!immersive && <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden mb-4">
          <div className="h-full rounded-full bg-linear-to-r from-[#2f7d32] to-[#2670a8]" style={{ width: `${progress}%` }}></div>
        </div>}
        <div className={`relative overflow-visible ${immersive ? 'h-[calc(100vh-13.5rem)] min-h-[34rem]' : 'h-126 sm:h-136 lg:h-120 xl:h-128'}`}>
          <div className="absolute inset-4 rounded-4xl bg-white border border-slate-200 shadow-[0_18px_38px_-28px_rgba(15,23,42,0.35)] rotate-3 scale-[0.96] overflow-hidden">
            <DemoCardVisual card={nextCard} dimmed />
          </div>
          <div className="absolute inset-2 rounded-4xl bg-white border border-slate-200 shadow-[0_18px_38px_-28px_rgba(15,23,42,0.35)] -rotate-2 scale-[0.98] overflow-hidden"></div>
          <article
            key={card.title}
            role="button"
            tabIndex={0}
            aria-label={`Swipe card: ${card.title}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onKeyDown={handleKeyDown}
            className={`hero-swipe-card absolute inset-0 rounded-4xl bg-white border border-slate-200 overflow-hidden shadow-[0_28px_58px_-30px_rgba(15,23,42,0.66),inset_0_1px_0_white] ${isDragging ? 'cursor-grabbing' : 'cursor-default'}`}
            style={{ transform: `translate(${dragX}px, ${dragY}px) rotate(${dragX / 22}deg)` }}
          >
            <DemoCardVisual card={card} />
            <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity ${Math.abs(dragX) > 28 || dragY < -50 ? 'opacity-100' : 'opacity-0'}`}>
              <span className={`rounded-full px-6 py-3 text-sm font-semibold text-white shadow-xl ${dragY < -50 ? 'bg-[#092243]' : dragX >= 0 ? 'bg-[#2f7d32]' : 'bg-[#ef4444]'}`}>
                {dragY < -50 ? 'SUPERLIKE' : dragX >= 0 ? 'LIKE' : 'NOT FOR ME'}
              </span>
            </div>
            <div className="absolute inset-x-0 bottom-5 z-20 flex items-center justify-center gap-4">
              <button type="button" aria-label="Not for me" onClick={(event) => { event.stopPropagation(); swipe('pass'); }} className="h-14 w-14 rounded-full bg-white/94 backdrop-blur-sm border border-white text-[#ef4444] shadow-[0_16px_30px_-18px_rgba(0,0,0,0.55),inset_0_1px_0_white]">
                <ArrowDownLeft className="mx-auto h-7 w-7" strokeWidth={2.4} />
              </button>
              <button type="button" aria-label="Superlike" onClick={(event) => { event.stopPropagation(); swipe('superlike'); }} className="h-16 w-16 rounded-full bg-[#092243]/96 backdrop-blur-sm border border-white/20 text-white shadow-[0_18px_34px_-18px_rgba(0,0,0,0.62),inset_0_1px_0_rgba(255,255,255,0.2)]">
                <Sparkles className="mx-auto h-8 w-8" strokeWidth={2.2} />
              </button>
              <button type="button" aria-label="Like" onClick={(event) => { event.stopPropagation(); swipe('like'); }} className="h-14 w-14 rounded-full bg-[#2f7d32]/96 backdrop-blur-sm border border-white/20 text-white shadow-[0_16px_30px_-18px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.25)]">
                <Check className="mx-auto h-7 w-7" strokeWidth={2.7} />
              </button>
            </div>
          </article>
        </div>
      </div>
      <div className={`${immersive ? 'mx-0 mt-3 mb-0' : 'mx-4 sm:mx-5 mb-5'} flex items-center justify-between gap-4 rounded-2xl bg-[#edf7ff] border border-[#cde7f8] p-3 text-sm`}>
        <span className="text-[#154f79]">{feedback}</span>
        <span className="text-slate-500">{likeCount} liked</span>
      </div>
      {!immersive && <p className="mx-4 sm:mx-5 mb-5 text-center text-xs text-slate-400">Limited free swipes refresh daily. Answer quick questions to improve this deck.</p>}
      <div className={`${immersive ? 'mt-3 mb-0' : 'mx-4 sm:mx-5 mb-5'} flex justify-center gap-1.5`} aria-hidden="true">
        {deck.slice(0, 12).map((item, index) => <span key={item.id} className={`h-1.5 rounded-full transition-all ${index === activeIndex % Math.min(12, deck.length) ? 'w-6 bg-[#2f7d32]' : 'w-1.5 bg-slate-300'}`}></span>)}
      </div>
    </div>
  );
}
