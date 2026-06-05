import React from 'react';
import { Flame, Gift, PlusCircle, Users } from 'lucide-react';

export default function FeedScreen({
  activeFeedTab,
  comments,
  components,
  dismissUpsell,
  feedTabs,
  followedIds,
  groupMemberships,
  groups,
  guardedComment,
  guardedOpenFeedItem,
  guardedReport,
  guardedShare,
  guardedToggleFollow,
  guardedToggleLike,
  guardedToggleSave,
  isPreviewVisitor,
  joinGroup,
  likedIds,
  newPost,
  openPartnerOffer,
  openedOfferId,
  openUpsell,
  posts,
  primaryContextualUpsell,
  profile,
  requireAccount,
  savedIds,
  setActiveFeedTab,
  setSharePost,
  sortedPartnerOffers,
  usageLimit,
  visibleFeedItems,
  createGroup,
}) {
  const {
    BrandLogo,
    FeedPreviewBanner,
    FeedTimelineCard,
    GenUpsellCard,
    GroupsPanel,
    PeepAvatar,
    PerksRail,
    SocialHomeHeader,
    SocialStoryRail,
  } = components;

  return (
    <>
      <aside className="sticky top-5 hidden space-y-4 lg:block">
        <div className="rounded-[1.65rem] border border-white/80 bg-white/88 p-4 shadow-[0_18px_48px_-38px_rgba(15,23,42,0.48),inset_0_1px_0_rgba(255,255,255,0.96)] backdrop-blur-xl">
          <a href="/app/feed" className="flex items-baseline gap-0.5 text-2xl font-bold tracking-tight text-[#092243]">
            Rent<span className="text-[#2f7d32]">Eazy</span>
          </a>
          <p className="mt-1 text-xs font-medium text-slate-400">EasyPeazy</p>
          <nav className="mt-5 space-y-1.5">
            {components.navItems.map(([label, href, Icon]) => (
              <a key={label} href={href} className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition ${components.routeTab === label ? 'bg-[#092243] text-white shadow-[0_12px_28px_-18px_rgba(9,34,67,0.7)]' : 'text-slate-600 hover:bg-slate-50'}`}>
                <Icon className="h-4 w-4" />
                {label}
              </a>
            ))}
          </nav>
          <a href="/app/post" className="mt-5 flex items-center justify-center gap-2 rounded-full bg-[#2f7d32] px-4 py-3 text-sm font-semibold text-white shadow-[0_16px_34px_-22px_rgba(47,125,50,0.72)]">
            <PlusCircle className="h-4 w-4" />
            Post to Feed
          </a>
        </div>

        <div className="rounded-[1.65rem] border border-white/80 bg-white/78 p-4 shadow-[0_18px_48px_-40px_rgba(15,23,42,0.42)] backdrop-blur-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#2670a8]">Market rooms</p>
          <div className="mt-3 space-y-2">
            {['East London Renters', 'London Landlords', 'Operators & Hosts'].map((groupName) => (
              <button key={groupName} type="button" onClick={() => setActiveFeedTab('Groups')} className="flex w-full items-center justify-between rounded-2xl bg-white px-3 py-2 text-left text-sm text-slate-700 ring-1 ring-black/5">
                <span className="truncate">{groupName}</span>
                <Users className="h-4 w-4 text-slate-400" />
              </button>
            ))}
          </div>
        </div>
      </aside>

      <section className="min-w-0">
        <div className="sticky top-0 z-40 -mx-3 space-y-4 bg-white/96 px-6 pb-4 pt-5 backdrop-blur-xl lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <a href="/app/feed" className="flex items-baseline gap-0.5 text-[1.35rem] font-bold tracking-tight text-[#050506]">
              Rent<span className="text-[#2f7d32]">Eazy</span>
            </a>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setActiveFeedTab('Groups')} className="grid h-10 w-10 place-items-center rounded-full bg-[#f3f6f8] text-[#050506]"><Users className="h-4 w-4" /></button>
              <a href="/app/post" className="grid h-10 w-10 place-items-center rounded-full bg-[#050506] text-white shadow-[0_16px_34px_-22px_rgba(0,0,0,0.75)]"><PlusCircle className="h-4 w-4" /></a>
              <a href="/app/swipe" className="grid h-10 w-10 place-items-center rounded-full bg-[#bff4ef] text-[#050506]"><Flame className="h-4 w-4" /></a>
            </div>
          </div>
          <div>
            <h1 className="text-[2.7rem] font-bold leading-none tracking-tight text-[#050506]">Feed</h1>
            <p className="mt-1 text-sm font-medium text-slate-400">{activeFeedTab}</p>
          </div>
          <SocialStoryRail posts={posts} groups={groups} onSelectTab={setActiveFeedTab} />
          <a href="/app/post" className="flex items-center gap-3 rounded-[1.55rem] bg-[#f4f7f8] px-3 py-3">
            <PeepAvatar
              seed={`${profile.id}-${profile.name}-${profile.role}`}
              variant={profile.avatarVariant || 'bust'}
              avatarIndex={profile.avatarIndex}
              avatarBg={profile.avatarBg || 'mist'}
              className="h-10 w-10"
              imageClassName={(profile.avatarVariant || 'bust') === 'bust' ? '' : 'object-contain p-1'}
            />
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold text-slate-950">Post into RentEazy</span>
              <span className="block truncate text-xs font-medium text-slate-400">Listings, questions, updates</span>
            </span>
          </a>
          <div className="-mx-6 overflow-x-auto px-6 [scrollbar-width:none]">
            <div className="flex min-w-max gap-2 pb-1">
              {feedTabs.map((tab) => {
                const active = activeFeedTab === tab;
                const isPerks = tab === 'Perks';
                return (
                  <button key={tab} onClick={() => setActiveFeedTab(tab)} className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition ${active ? 'bg-[#050506] text-white shadow-[0_14px_28px_-20px_rgba(0,0,0,0.7)]' : isPerks ? 'bg-[#edf8ee] text-[#2f7d32]' : 'bg-[#f4f7f8] text-slate-500'}`}>
                    {isPerks && <Gift className="h-3.5 w-3.5" />}
                    {tab}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="hidden lg:block">
          <SocialHomeHeader profile={profile} usageLimit={usageLimit} groups={groups} memberships={groupMemberships} posts={posts} onSelectTab={setActiveFeedTab} />
          <div className="mb-4 rounded-[1.6rem] border border-white/80 bg-white/88 p-4 shadow-[0_18px_48px_-38px_rgba(15,23,42,0.42),inset_0_1px_0_rgba(255,255,255,0.96)] backdrop-blur-xl">
            <a href="/app/post" className="flex items-center gap-3">
              <PeepAvatar
                seed={`${profile.id}-${profile.name}-${profile.role}`}
                variant={profile.avatarVariant || 'bust'}
                avatarIndex={profile.avatarIndex}
                avatarBg={profile.avatarBg || 'mist'}
                className="h-11 w-11"
                imageClassName={(profile.avatarVariant || 'bust') === 'bust' ? '' : 'object-contain p-1'}
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-slate-950">What are you looking for, offering, or sharing?</span>
                <span className="block truncate text-xs text-slate-500">Post into the rental-market network</span>
              </span>
              <span className="rounded-full bg-[#092243] px-4 py-2 text-sm font-semibold text-white">Post</span>
            </a>
          </div>
          <div className="sticky top-5 z-30 -mx-1 mb-4 overflow-x-auto px-1 [scrollbar-width:none]">
            <div className="flex min-w-max gap-2 pb-1">
              {feedTabs.map((tab) => {
                const active = activeFeedTab === tab;
                const isPerks = tab === 'Perks';
                return (
                  <button key={tab} onClick={() => setActiveFeedTab(tab)} className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${active ? 'bg-[#092243] text-white shadow-[0_14px_28px_-20px_rgba(9,34,67,0.65)]' : isPerks ? 'bg-[#edf8ee] text-[#2f7d32] ring-1 ring-[#bfe6c3]' : 'bg-white text-slate-600 shadow-[0_10px_24px_-22px_rgba(15,23,42,0.45)] ring-1 ring-white/80'}`}>
                    {isPerks && <Gift className="h-3.5 w-3.5" />}
                    {tab}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {newPost && (
          <div className="mt-4 rounded-3xl border border-[#d5ecd7] bg-[#edf8ee] p-4">
            <p className="text-sm font-medium text-[#215d27]">Want more people to see this?</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={() => setSharePost(newPost)} className="rounded-full bg-[#2f7d32] px-4 py-2 text-sm text-white">Share Everywhere</button>
              <button onClick={() => openUpsell('post-bump-small')} className="rounded-full bg-[#092243] px-4 py-2 text-sm text-white">Boost post from 29p</button>
            </div>
          </div>
        )}
        {openedOfferId && (
          <div className="mt-4 rounded-3xl border border-[#d5ecd7] bg-[#edf8ee] px-4 py-3 text-sm text-[#215d27]">
            Perk opened. RentEazy records the signal so future offers can be more relevant.
          </div>
        )}
        {isPreviewVisitor && (
          <div className="mt-4">
            <FeedPreviewBanner onSignup={() => requireAccount('continue')} />
          </div>
        )}
        <div className="space-y-4 pb-4">
          {activeFeedTab === 'Groups' ? (
            <GroupsPanel groups={groups} memberships={groupMemberships} onJoinGroup={joinGroup} onCreateGroup={createGroup} />
          ) : activeFeedTab === 'Perks' ? (
            <PerksRail partnerOffers={sortedPartnerOffers} profile={profile} onOpenOffer={openPartnerOffer} />
          ) : (
            visibleFeedItems.map((item, index) => {
              const post = item.post;
              const lockedPreviewCard = isPreviewVisitor && index >= 2;
              // Preview visitors: show 2 full cards + ONE gated teaser, not the
              // banner stamped on every locked card down the page.
              if (isPreviewVisitor && index > 2) return null;
              return (
                <React.Fragment key={item.streamId}>
                  <div className="relative">
                    <div className={lockedPreviewCard ? 'pointer-events-none select-none blur-[2.5px]' : ''}>
                      <FeedTimelineCard
                        post={post}
                        ranking={{ ...item.ranking, sequence: item.sequence, rewardSpike: item.rewardSpike }}
                        card={item.card}
                        liked={likedIds.includes(post.id)}
                        saved={savedIds.includes(post.id)}
                        followed={followedIds.includes(post.authorId)}
                        commentCount={post.commentCount + comments.filter((comment) => comment.postId === post.id).length}
                        onOpen={() => guardedOpenFeedItem(index)}
                        onLike={guardedToggleLike}
                        onSave={guardedToggleSave}
                        onFollow={guardedToggleFollow}
                        onShare={guardedShare}
                        onComment={guardedComment}
                        onReport={guardedReport}
                      />
                    </div>
                    {lockedPreviewCard && (
                      <button
                        type="button"
                        onClick={() => requireAccount('continue')}
                        className="absolute inset-0 grid place-items-center rounded-[2.1rem] bg-[#092243]/28 p-5 text-center backdrop-blur-[1px]"
                      >
                        <span className="rounded-[1.5rem] bg-white px-5 py-4 text-sm font-bold text-[#092243] shadow-[0_24px_60px_-36px_rgba(15,23,42,0.72)]">
                          Create a free account to keep browsing and interact
                        </span>
                      </button>
                    )}
                  </div>
                  {primaryContextualUpsell && !isPreviewVisitor && index === 3 && (
                    <GenUpsellCard
                      card={primaryContextualUpsell}
                      onSelectProduct={openUpsell}
                      onDismiss={dismissUpsell}
                      onSharePost={setSharePost}
                      newPost={newPost}
                    />
                  )}
                  {!isPreviewVisitor && index === 4 && (
                    <section className="rounded-[1.9rem] border border-[#d5ecd7] bg-linear-to-br from-[#edf8ee] to-white p-4 shadow-[0_18px_44px_-38px_rgba(47,125,50,0.4)] sm:p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-['JetBrains_Mono',monospace] text-[10px] tracking-[0.16em] text-[#2f7d32]">PERKS · TIMED FOR YOUR MOVE</p>
                          <h3 className="mt-1 font-['Bricolage_Grotesque_Variable',Inter,sans-serif] text-lg font-normal leading-tight tracking-tight text-[#092243]">Member rewards, only when they fit.</h3>
                        </div>
                        <button type="button" onClick={() => setActiveFeedTab('Perks')} className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#092243] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#0c2e5a]">
                          <Gift className="h-3.5 w-3.5" />
                          See all perks
                        </button>
                      </div>
                      <div className="mt-4">
                        <PerksRail partnerOffers={sortedPartnerOffers} profile={profile} onOpenOffer={openPartnerOffer} compact />
                      </div>
                    </section>
                  )}
                </React.Fragment>
              );
            })
          )}
        </div>
      </section>
    </>
  );
}
