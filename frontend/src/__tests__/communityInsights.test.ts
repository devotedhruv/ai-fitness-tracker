import {
  COMMUNITY_INSIGHTS,
  InsightCategory,
  CommunityInsight,
} from '../data/communityInsights';
import { internetInsightsService } from '../services/internetInsightsService';

describe('Community Insights & Educational Guides', () => {
  it('contains comprehensive insights covering all 4 core categories', () => {
    expect(COMMUNITY_INSIGHTS.length).toBeGreaterThanOrEqual(12);

    const categories = new Set(COMMUNITY_INSIGHTS.map((item) => item.category));
    expect(categories.has('TIPS')).toBe(true);
    expect(categories.has('HEALTH')).toBe(true);
    expect(categories.has('VIDEOS')).toBe(true);
    expect(categories.has('SCIENCE')).toBe(true);
  });

  it('validates every insight has required fields, cues, takeaways, and author info', () => {
    COMMUNITY_INSIGHTS.forEach((item: CommunityInsight) => {
      expect(item.id).toBeTruthy();
      expect(item.title.length).toBeGreaterThan(5);
      expect(item.summary.length).toBeGreaterThan(10);
      expect(item.badgeColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(item.readTime).toMatch(/min/);
      expect(item.author.name).toBeTruthy();
      expect(item.author.role).toBeTruthy();
      expect(item.keyTakeaways.length).toBeGreaterThanOrEqual(2);
      expect(item.coachingCues.length).toBeGreaterThanOrEqual(2);
      expect(item.commonMistakes.length).toBeGreaterThanOrEqual(2);
      expect(item.content.length).toBeGreaterThan(50);
      expect(item.viewsCount).toBeGreaterThanOrEqual(0);
      expect(item.likesCount).toBeGreaterThanOrEqual(0);
    });
  });

  it('verifies internet blogs, articles, and videos have real external source links', () => {
    const externalItems = COMMUNITY_INSIGHTS.filter((item) => item.isExternal);
    expect(externalItems.length).toBeGreaterThanOrEqual(10);

    externalItems.forEach((item) => {
      expect(item.sourceUrl).toMatch(/^https?:\/\//);
      expect(item.sourceName).toBeTruthy();
    });
  });

  it('ensures video guides have YouTube video IDs and HD video thumbnails', () => {
    const videoInsights = COMMUNITY_INSIGHTS.filter((i) => i.category === 'VIDEOS' || !!i.youtubeId);
    expect(videoInsights.length).toBeGreaterThanOrEqual(3);

    videoInsights.forEach((v) => {
      if (v.youtubeId) {
        expect(v.youtubeId.length).toBeGreaterThanOrEqual(6);
        expect(v.videoThumbnail).toContain(v.youtubeId);
      }
      if (v.videoDuration) {
        expect(v.videoDuration).toMatch(/^\d{1,2}:\d{2}$/);
      }
    });
  });

  it('correctly filters insights by category', () => {
    const filterByCategory = (cat: InsightCategory): CommunityInsight[] => {
      if (cat === 'ALL') return COMMUNITY_INSIGHTS;
      return COMMUNITY_INSIGHTS.filter((item) => item.category === cat);
    };

    const all = filterByCategory('ALL');
    expect(all.length).toBe(COMMUNITY_INSIGHTS.length);

    const tips = filterByCategory('TIPS');
    expect(tips.length).toBeGreaterThan(0);
    expect(tips.every((t) => t.category === 'TIPS')).toBe(true);

    const health = filterByCategory('HEALTH');
    expect(health.length).toBeGreaterThan(0);
    expect(health.every((h) => h.category === 'HEALTH')).toBe(true);

    const videos = filterByCategory('VIDEOS');
    expect(videos.length).toBeGreaterThan(0);
    expect(videos.every((v) => v.category === 'VIDEOS')).toBe(true);

    const science = filterByCategory('SCIENCE');
    expect(science.length).toBeGreaterThan(0);
    expect(science.every((s) => s.category === 'SCIENCE')).toBe(true);
  });

  describe('Internet Insights Service API', () => {
    it('returns empty array when search query is empty', async () => {
      const results = await internetInsightsService.searchInternetScience('');
      expect(results).toEqual([]);
    });

    it('formats live Wikipedia science articles correctly when mocked', async () => {
      const mockFetch = jest.fn();
      const originalFetch = global.fetch;
      (global as any).fetch = mockFetch;

      // Mock Wikipedia search
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          query: {
            search: [{ title: 'Strength training', snippet: 'Resistance training overview', pageid: 12345 }],
          },
        }),
      });

      // Mock Wikipedia summary
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          title: 'Strength training',
          extract: 'Strength training involves the performance of physical exercises designed to improve strength and endurance.',
          content_urls: { desktop: { page: 'https://en.wikipedia.org/wiki/Strength_training' } },
        }),
      });

      const wikiResults = await internetInsightsService.searchWikipedia('strength');
      expect(wikiResults.length).toBe(1);
      expect(wikiResults[0].id).toBe('wiki-12345');
      expect(wikiResults[0].title).toBe('Strength training');
      expect(wikiResults[0].sourceName).toBe('Wikipedia Science');
      expect(wikiResults[0].isExternal).toBe(true);
      expect(wikiResults[0].sourceUrl).toBe('https://en.wikipedia.org/wiki/Strength_training');

      (global as any).fetch = originalFetch;
    });

    it('formats live Europe PMC open access research papers correctly when mocked', async () => {
      const mockFetch = jest.fn();
      const originalFetch = global.fetch;
      (global as any).fetch = mockFetch;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          resultList: {
            result: [
              {
                id: 'PMC999999',
                title: 'Resistance exercise and muscle fiber hypertrophy.',
                authorString: 'Smith J, Doe A',
                journalTitle: 'Journal of Applied Physiology',
                pubYear: '2023',
                abstractText: 'This study evaluated mechanical tension across multi-joint movements.',
                doi: '10.1152/japplphysiol.001.2023',
              },
            ],
          },
        }),
      });

      const pmcResults = await internetInsightsService.searchEuropePmc('hypertrophy');
      expect(pmcResults.length).toBe(1);
      expect(pmcResults[0].id).toBe('epmc-PMC999999');
      expect(pmcResults[0].title).toBe('Resistance exercise and muscle fiber hypertrophy');
      expect(pmcResults[0].sourceUrl).toBe('https://doi.org/10.1152/japplphysiol.001.2023');
      expect(pmcResults[0].author.name).toBe('Smith J et al.');
      expect(pmcResults[0].isExternal).toBe(true);

      (global as any).fetch = originalFetch;
    });
  });
});
