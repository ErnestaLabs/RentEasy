export default function ProfileScreen({
  answers,
  comments,
  components,
  dismissUpsell,
  feedItems,
  lifecycleTasks,
  likedIds,
  matches,
  newPost,
  notifications,
  openUpsell,
  posts,
  primaryContextualUpsell,
  profile,
  reports,
  reputationProfile,
  savedIds,
  setAnswers,
  setProfile,
  setSelectedFeedViewerIndex,
  setSharePost,
  markNotificationRead,
  completeLifecycleTask,
}) {
  const {
    DailyReturnPanel,
    GenUpsellCard,
    ProfileEditor,
    ReputationScoreCard,
    SocialKitProfilePage,
    TrustReputationPanel,
    UsefulNotificationsPanel,
  } = components;

  return (
    <div className="space-y-5">
      <SocialKitProfilePage
        profile={profile}
        answers={answers}
        reputationProfile={reputationProfile}
        posts={posts}
        likedIds={likedIds}
        savedIds={savedIds}
        matches={matches}
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
      <ProfileEditor profile={profile} setProfile={setProfile} answers={answers} setAnswers={setAnswers} />
      <div className="grid gap-5 lg:grid-cols-2">
        <DailyReturnPanel profile={profile} lifecycleTasks={lifecycleTasks} reputationProfile={reputationProfile} onCompleteTask={completeLifecycleTask} />
        <ReputationScoreCard reputationProfile={reputationProfile} />
        <UsefulNotificationsPanel notifications={notifications} onMarkRead={markNotificationRead} />
        <TrustReputationPanel reports={reports} comments={comments} profile={profile} />
      </div>
    </div>
  );
}
