export default function DemoCardVisual({ card, dimmed = false, quiet = false, photoIndex = 0, onPreviousPhoto, onNextPhoto }) {
  const typeLabel = card.type.charAt(0).toUpperCase() + card.type.slice(1);
  const gallery = card.gallery?.length ? card.gallery : [card.imageSrc].filter(Boolean);
  const activePhotoIndex = Math.min(photoIndex, Math.max(0, gallery.length - 1));
  const activeImage = gallery[activePhotoIndex] || card.imageSrc;

  return (
    <div className={`absolute inset-0 overflow-hidden bg-slate-200 ${dimmed ? 'opacity-55' : ''}`}>
      <img
        src={activeImage}
        alt={card.imageAlt}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: card.imagePosition }}
        loading="eager"
        decoding="async"
        draggable="false"
      />
      <div className="absolute inset-0 bg-linear-to-t from-[rgba(6,24,47,0.9)] via-[rgba(6,24,47,0.18)] to-[rgba(6,24,47,0.02)]" />
      {!quiet && (
        <>
          {gallery.length > 1 && (
            <div className="absolute inset-x-5 top-3 z-20 flex gap-1.5">
              {gallery.map((photo, index) => (
                <span key={`${photo}-${index}`} className={`h-1 flex-1 rounded-full ${index === activePhotoIndex ? 'bg-white' : 'bg-white/35'}`} />
              ))}
            </div>
          )}
          {gallery.length > 1 && (
            <div className="absolute inset-x-4 top-1/2 z-20 flex -translate-y-1/2 justify-between">
              <button
                type="button"
                aria-label="Previous photo"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  onPreviousPhoto?.();
                }}
                className="grid h-9 w-9 place-items-center rounded-full bg-black/28 text-lg font-semibold text-white ring-1 ring-white/20 backdrop-blur-md"
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="Next photo"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  onNextPhoto?.();
                }}
                className="grid h-9 w-9 place-items-center rounded-full bg-black/28 text-lg font-semibold text-white ring-1 ring-white/20 backdrop-blur-md"
              >
                ›
              </button>
            </div>
          )}
          <div className="absolute left-5 right-5 top-5 z-10 flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur-sm px-3 py-1.5 text-xs font-semibold text-[#092243] shadow-[0_8px_18px_-12px_rgba(15,23,42,0.4)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#52a832]" />
              {card.matchScore}% match
            </span>
            <span className="rounded-full bg-black/25 backdrop-blur-sm border border-white/25 px-3 py-1.5 font-['JetBrains_Mono',monospace] text-[10px] tracking-[0.08em] text-white/90">{typeLabel} · {activePhotoIndex + 1}/{gallery.length}</span>
          </div>
          <div className="absolute inset-x-0 bottom-0 p-5 pb-24 pt-28 text-white">
            <h2 className="font-['Bricolage_Grotesque_Variable',Inter,sans-serif] text-[1.8rem] font-normal leading-[1.08] tracking-tight">{card.title}</h2>
            <p className="mt-1.5 text-sm text-white/85">{card.location} · <span className="font-semibold text-[#9bd383]">{card.price}</span></p>
            <p className="mt-0.5 text-[13px] text-white/65">{card.availability} · {card.detailLine}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {card.badges.map((badge) => <span key={badge} className="rounded-full bg-white/14 border border-white/20 px-3 py-1 text-[11px] font-medium text-white/88">{badge}</span>)}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
