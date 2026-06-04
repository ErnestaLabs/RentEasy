import { ArrowDownLeft, Megaphone } from 'lucide-react';

export default function PostScreen({
  addPost,
  boosts,
  components,
  isPreviewVisitor,
  openUpsell,
  posts,
  profile,
  reports,
  shares,
  usageLimit,
}) {
  const { ActivityInbox, AdsInventoryPanel, ComposerPanel, MiniShopPanel, PreviewRouteGate } = components;

  if (isPreviewVisitor) {
    return (
      <PreviewRouteGate
        action="post"
        title="Post after signup"
        body="You can preview the rental-market Feed first. Create a free account to post listings, looking posts, questions, updates, deals, stays, and useful local signals."
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="rounded-b-[2.4rem] bg-[#e2f7f3] px-5 pb-7 pt-6 lg:rounded-[2.4rem]">
        <div className="flex items-center justify-between gap-3">
          <a href="/app/feed" className="grid h-10 w-10 place-items-center rounded-full bg-white/78 text-[#050506]"><ArrowDownLeft className="h-4 w-4" /></a>
          <p className="text-sm font-bold text-[#050506]/55">Create</p>
          <button type="button" onClick={() => openUpsell('post-bump-small')} className="grid h-10 w-10 place-items-center rounded-full bg-[#050506] text-white"><Megaphone className="h-4 w-4" /></button>
        </div>
        <h1 className="mt-8 text-[2.65rem] font-bold leading-none tracking-tight text-[#050506]">Post</h1>
        <p className="mt-2 text-sm font-medium text-[#050506]/55">Listings, updates, deals, questions, rooms, stays.</p>
      </div>
      <ComposerPanel onCreatePost={addPost} profile={profile} />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-[2rem] bg-[#050506] p-5 text-white shadow-[0_28px_70px_-48px_rgba(0,0,0,0.72)]">
          <p className="text-lg font-bold">Share and boost</p>
          <p className="mt-2 text-sm leading-6 text-white/62">Reach more relevant people after the post is live.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => openUpsell('post-bump-small')} className="rounded-full bg-[#bff4ef] px-4 py-2 text-sm font-bold text-[#050506]">Boost from 29p</button>
            <button type="button" onClick={() => openUpsell('profile-polish')} className="rounded-full bg-white/12 px-4 py-2 text-sm font-bold text-white">Polish 49p</button>
          </div>
        </div>
        <MiniShopPanel onSelectProduct={openUpsell} compact />
        <AdsInventoryPanel onBoost={openUpsell} />
        <ActivityInbox usageLimit={usageLimit} posts={posts} shares={shares} reports={reports} boosts={boosts} profile={profile} />
      </div>
    </div>
  );
}
