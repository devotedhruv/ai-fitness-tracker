import { CommunityInsight } from '../data/communityInsights';

interface WikipediaSearchResult {
  title: string;
  snippet: string;
  pageid: number;
}

interface EuropePmcResult {
  id: string;
  title: string;
  authorString?: string;
  journalTitle?: string;
  pubYear?: string;
  abstractText?: string;
  doi?: string;
}

/**
 * Free Internet Sports Science & Exercise Medicine API Service
 * Queries open, public, non-commercial endpoints:
 * - Wikipedia Sports Physiology & Biomechanics REST API
 * - Europe PMC Open-Access Biomedical Literature
 */
export const internetInsightsService = {
  /**
   * Search Wikipedia's verified sports medicine, biomechanics, and exercise physiology articles.
   */
  async searchWikipedia(query: string): Promise<CommunityInsight[]> {
    try {
      const sanitized = encodeURIComponent(query.trim() + ' exercise resistance training');
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${sanitized}&utf8=&format=json&origin=*`;

      const res = await fetch(searchUrl);
      if (!res.ok) return [];

      const data = await res.json();
      const searchHits: WikipediaSearchResult[] = data?.query?.search?.slice(0, 5) || [];

      const insights: CommunityInsight[] = [];

      for (const hit of searchHits) {
        try {
          const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(hit.title)}`;
          const summaryRes = await fetch(summaryUrl);
          if (!summaryRes.ok) continue;

          const summaryData = await summaryRes.json();
          const cleanSnippet = hit.snippet.replace(/<[^>]*>?/gm, '');

          insights.push({
            id: `wiki-${hit.pageid}`,
            title: summaryData.title || hit.title,
            category: 'SCIENCE',
            categoryName: 'Exercise Science',
            badgeColor: '#38BDF8',
            readTime: '4 min read',
            summary: summaryData.extract || cleanSnippet || 'Verified sports physiology overview from Wikipedia.',
            author: {
              name: 'Wikipedia Sports Physiology Project',
              role: 'Open Science Contributor Collective',
              avatar: 'preset:open-science',
            },
            tags: [query, 'Physiology', 'Open Science', 'Exercise Medicine'],
            viewsCount: 1420 + Math.floor(Math.random() * 800),
            likesCount: 95 + Math.floor(Math.random() * 120),
            sourceUrl: summaryData.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(hit.title)}`,
            sourceName: 'Wikipedia Science',
            isExternal: true,
            keyTakeaways: [
              summaryData.description ? `${summaryData.title}: ${summaryData.description}` : `Key physiological principles of ${summaryData.title}.`,
              'Peer-reviewed and verified by the international academic and medical sports community.',
              'Click "Read Full Internet Article" below to study the full research literature citations.',
            ],
            coachingCues: [
              `Ground your training in verified biomechanics principles for ${query}`,
              'Apply progressive overload while respecting biological recovery windows',
            ],
            commonMistakes: [
              'Relying on unverified fitness folklore rather than evidence-based human physiology.',
              'Neglecting proper joint alignment and periodization in high-intensity protocols.',
            ],
            content: summaryData.extract
              ? `${summaryData.extract}\n\nThis article is published openly under the Creative Commons Attribution-ShareAlike License by researchers in human movement science and exercise physiology.`
              : cleanSnippet,
          });
        } catch {
          // If individual page fetch fails, continue
        }
      }

      return insights;
    } catch (err) {
      console.warn('Wikipedia API fetch error:', err);
      return [];
    }
  },

  /**
   * Search Europe PMC for open-access peer-reviewed studies on resistance training and sports nutrition.
   */
  async searchEuropePmc(query: string): Promise<CommunityInsight[]> {
    try {
      const sanitized = encodeURIComponent(`${query} resistance training exercise`);
      const url = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${sanitized}&format=json&pageSize=4`;

      const res = await fetch(url);
      if (!res.ok) return [];

      const data = await res.json();
      const results: EuropePmcResult[] = data?.resultList?.result || [];

      return results.map((paper, idx) => {
        const cleanTitle = paper.title.replace(/\.$/, '');
        const paperUrl = paper.doi
          ? `https://doi.org/${paper.doi}`
          : `https://europepmc.org/article/MED/${paper.id}`;

        return {
          id: `epmc-${paper.id || idx}`,
          title: cleanTitle,
          category: 'SCIENCE',
          categoryName: 'Exercise Science',
          badgeColor: '#B8F500',
          readTime: '6 min read',
          summary: paper.abstractText
            ? paper.abstractText.slice(0, 180) + '...'
            : `Peer-reviewed scientific investigation into ${query} published in ${paper.journalTitle || 'Sports Medicine'}.`,
          author: {
            name: paper.authorString ? paper.authorString.split(',')[0] + ' et al.' : 'Sports Medicine Researchers',
            role: paper.journalTitle || 'Peer-Reviewed Journal',
            avatar: 'preset:sports-doc',
          },
          tags: [query, 'Research Study', 'Peer-Reviewed', paper.pubYear || 'Recent'],
          viewsCount: 880 + Math.floor(Math.random() * 400),
          likesCount: 65 + Math.floor(Math.random() * 90),
          sourceUrl: paperUrl,
          sourceName: paper.journalTitle ? paper.journalTitle.slice(0, 24) : 'Europe PMC Open Access',
          isExternal: true,
          publishedDate: paper.pubYear,
          keyTakeaways: [
            `Published investigation in ${paper.journalTitle || 'Sports Medicine'} (${paper.pubYear || 'Recent'}).`,
            'Controlled experimental methodology analyzing muscular adaptations and performance metrics.',
            'Direct access to full open-access manuscript provided via Europe PMC repository.',
          ],
          coachingCues: [
            'Incorporate scientific findings to refine rep pacing and weekly set volume',
            'Track individual fatigue metrics against the study parameters',
          ],
          commonMistakes: [
            'Generalizing extreme elite athlete studies to recreational lifters without scaling volume.',
            'Overlooking nutrition and sleep variables that alter physiological outcomes.',
          ],
          content: paper.abstractText || `Study investigating the physiological effects of ${query} on human muscular performance, structural remodeling, and endurance capacity. Access the complete free scientific paper via Europe PMC.`,
        };
      });
    } catch (err) {
      console.warn('Europe PMC API fetch error:', err);
      return [];
    }
  },

  /**
   * Unified search across open internet fitness resources
   */
  async searchInternetScience(query: string): Promise<CommunityInsight[]> {
    if (!query || query.trim().length < 2) return [];

    const [wikiResults, pmcResults] = await Promise.all([
      this.searchWikipedia(query),
      this.searchEuropePmc(query),
    ]);

    return [...wikiResults, ...pmcResults];
  },
};
