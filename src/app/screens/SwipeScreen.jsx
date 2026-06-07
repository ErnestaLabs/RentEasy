import { ArrowDownLeft } from 'lucide-react';

export default function SwipeScreen({
  components,
  handleSwipeAction,
  isPreviewVisitor,
  openUpsell,
  rankedSwipeCards,
  remainingSwipes,
  requireAccount,
}) {
  const { InteractiveMatchCard } = components;

  return (
    <div className="relative min-h-screen md:min-h-0">
      <div className="fixed left-4 top-4 z-[45] md:absolute md:left-5 md:top-5">
        <a href="/app/feed" className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/10 text-white backdrop-blur-xl" aria-label="Back to Feed">
          <ArrowDownLeft className="h-4 w-4" />
        </a>
      </div>
      {!isPreviewVisitor && (
        <button
          type="button"
          onClick={() => openUpsell('extra-swipes-10')}
          className="fixed right-[4.25rem] top-4 z-[45] rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-bold text-white backdrop-blur-xl md:absolute md:right-[4.25rem] md:top-5"
        >
          {remainingSwipes} swipes
        </button>
      )}
      {isPreviewVisitor && (
        <div className="fixed inset-x-4 bottom-[7.25rem] z-[46] rounded-[1.5rem] bg-white p-4 text-center shadow-[0_24px_70px_-40px_rgba(0,0,0,0.82)] md:absolute md:bottom-24">
          <p className="text-sm font-bold text-[#092243]">Create a free account to start matching.</p>
          <button type="button" onClick={() => requireAccount('match')} className="mt-3 rounded-full bg-[#2f7d32] px-5 py-3 text-sm font-bold text-white">Create account</button>
        </div>
      )}
      <InteractiveMatchCard
        cards={rankedSwipeCards}
        canSwipe={!isPreviewVisitor && remainingSwipes > 0}
        onSwipeAction={handleSwipeAction}
        onBlocked={() => isPreviewVisitor ? requireAccount('match') : openUpsell('extra-swipes-10')}
        blockedFeedback={isPreviewVisitor ? 'Create a free account to swipe' : 'Daily swipes used'}
        immersive
      />
    </div>
  );
}
