export default function LikesScreen({
  components,
  dismissUpsell,
  feedItems,
  likedIds,
  matches,
  matchMessages,
  newPost,
  openUpsell,
  posts,
  primaryContextualUpsell,
  profile,
  savedIds,
  setSelectedFeedViewerIndex,
  setSharePost,
}) {
  const { GenUpsellCard, LikesSocialInbox } = components;

  return (
    <div className="space-y-4">
      <LikesSocialInbox
        posts={posts}
        likedIds={likedIds}
        savedIds={savedIds}
        matches={matches}
        matchMessages={matchMessages}
        profile={profile}
        onSelectProduct={openUpsell}
        onOpenPost={(post) => {
          const index = feedItems.findIndex((item) => item.post.id === post.id);
          if (index >= 0) setSelectedFeedViewerIndex(index);
        }}
      />
      {primaryContextualUpsell && (
        <GenUpsellCard
          card={primaryContextualUpsell}
          onSelectProduct={openUpsell}
          onDismiss={dismissUpsell}
          onSharePost={setSharePost}
          newPost={newPost}
        />
      )}
    </div>
  );
}
