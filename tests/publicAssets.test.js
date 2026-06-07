import { access, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const publicPath = (...parts) => join(process.cwd(), 'public', ...parts);

async function exists(path) {
  await access(publicPath(path.replace(/^\//, '')));
}

describe('public launch assets', () => {
  it('keeps referenced feed, swipe, perk, video, and audio assets deployable', async () => {
    const requiredAssets = [
      '/audio/in-it-kadant.mp3',
      '/pexels/images/bow-landlord-flat.jpg',
      '/pexels/images/canary-area-insight.jpg',
      '/pexels/images/clapham-buddy.jpg',
      '/pexels/images/feed-balcony-1.jpg',
      '/pexels/images/feed-flat-1.jpg',
      '/pexels/images/feed-house-1.jpg',
      '/pexels/images/feed-kitchen-1.jpg',
      '/pexels/images/feed-landlord.jpg',
      '/pexels/images/feed-moving.jpg',
      '/pexels/images/feed-office-agent.jpg',
      '/pexels/images/feed-room-1.jpg',
      '/pexels/images/greenwich-viewings.jpg',
      '/pexels/images/hackney-tenant.jpg',
      '/pexels/images/leeds-student-house.jpg',
      '/pexels/images/manchester-relocation.jpg',
      '/pexels/images/northwest-investor.jpg',
      '/pexels/images/operator-west-london.jpg',
      '/pexels/images/perk-broadband.jpg',
      '/pexels/images/perk-cleaning.jpg',
      '/pexels/images/perk-insurance.jpg',
      '/pexels/images/perk-storage.jpg',
      '/pexels/images/referencing-question.jpg',
      '/pexels/images/shoreditch-short-stay.jpg',
      '/pexels/images/stratford-room.jpg',
      '/pexels/videos/agent-walkthrough.mp4',
      '/pexels/videos/city-apartment.mp4',
      '/pexels/videos/city-skyline.mp4',
      '/pexels/videos/cleaning-service.mp4',
      '/pexels/videos/moving-boxes.mp4',
      '/pexels/videos/rental-feed-scroll.mp4',
    ];

    await Promise.all(requiredAssets.map(exists));
  });

  it('keeps the Open Peeps avatar pools available for profile customisation', async () => {
    const bust = await readdir(publicPath('open-peeps', 'bust'));
    const standing = await readdir(publicPath('open-peeps', 'standing'));
    const sitting = await readdir(publicPath('open-peeps', 'sitting'));

    expect(bust.filter((file) => file.endsWith('.png')).length).toBeGreaterThanOrEqual(105);
    expect(standing.filter((file) => file.endsWith('.png')).length).toBeGreaterThanOrEqual(30);
    expect(sitting.filter((file) => file.endsWith('.png')).length).toBeGreaterThanOrEqual(14);
  });
});
