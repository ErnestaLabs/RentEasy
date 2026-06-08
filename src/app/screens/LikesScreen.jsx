export default function LikesScreen({
  components,
  dismissOffer,
  feedItems,
  likedIds,
  matches,
  matchMessages,
  newPost,
  openOffer,
  posts,
  primaryContextualOffer,
  profile,
  savedIds,
  setSelectedFeedViewerIndex,
  setSharePost,
}) {
  const { GenOfferCard, LikesSocialInbox } = components;

  return (
    <div className="space-y-4">
      <LikesSocialInbox
        posts={posts}
        likedIds={likedIds}
        savedIds={savedIds}
        matches={matches}
        matchMessages={matchMessages}
        profile={profile}
        onSelectProduct={openOffer}
        onOpenPost={(post) => {
          const index = feedItems.findIndex((item) => item.post.id === post.id);
          if (index >= 0) setSelectedFeedViewerIndex(index);
        }}
      />
      {primaryContextualOffer && (
        <GenOfferCard
          card={primaryContextualOffer}
          onSelectProduct={openOffer}
          onDismiss={dismissOffer}
          onSharePost={setSharePost}
          newPost={newPost}
        />
      )}
    </div>
  );
}
