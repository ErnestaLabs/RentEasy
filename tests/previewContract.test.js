import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

describe('app preview contract', () => {
  it('does not run passive account-write effects for anonymous preview visitors', async () => {
    const source = await readFile('src/App.jsx', 'utf8');

    expect(source).toContain("if (isPreviewVisitor || backendStatus !== 'connected') return;");
    expect(source).toContain('if (isPreviewVisitor) return;');
    expect(source).toContain('if (isPreviewVisitor) return undefined;');
  });

  it('keeps preview action handlers behind the account gate', async () => {
    const source = await readFile('src/App.jsx', 'utf8');
    const container = source.slice(source.indexOf('function RentEazyAppContainer'));

    expect(container).toContain("const guardedBoostPost = previewGuard('billing', (post) => boostPost(post.id));");
    expect(container).toContain("const guardedOpenPartnerOffer = previewGuard('perks', openPartnerOffer);");
    expect(container).toContain("const guardedOpenRecommendedOffer = previewGuard('perks', openRecommendedOffer);");
    expect(container).toContain("const guardedRecordFeedSignal = previewGuard('continue', recordFeedSignal);");
    expect(container).toContain('onBoost={guardedBoostPost}');
    expect(container).toContain('onSignal={guardedRecordFeedSignal}');
    expect(container).toContain('onMarkRead={guardedMarkNotificationRead}');
    expect(container).toContain('onOpenOffer={guardedOpenRecommendedOffer}');
    expect(container).not.toContain('onBoost={(post) => boostPost(post.id)}');
    expect(container).not.toContain('onMarkRead={markNotificationRead}');
    expect(container).not.toContain('onOpenOffer={openRecommendedOffer}');
  });
});
