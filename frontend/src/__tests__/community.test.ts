import { socialApi } from '../services/api';
import { MILITARY_RANKS, getRankByXP } from '../services/progression/rankConfig';

// Mock global fetch
const mockFetch = jest.fn();
(global as any).fetch = mockFetch;

describe('Community Feed & Social API', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('getFeed requests /social/feed with correct sort and pagination query parameters', async () => {
    const mockFeedResponse = {
      results: [
        {
          id: 'post-1',
          caption: 'Great leg workout today!',
          postType: 'WORKOUT',
          userName: 'Athlete One',
          userRankName: 'SERGEANT',
          userRankInsignia: 'triple-chevron',
          userRankTier: 5,
          likesCount: 12,
          commentsCount: 3,
          isLikedByMe: false,
          isMine: false,
        },
      ],
      totalCount: 1,
      page: 1,
      totalPages: 1,
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockFeedResponse,
    });

    const result = await socialApi.getFeed({ sort: 'popular', page: 2, limit: 10 });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const calledUrl = mockFetch.mock.calls[0][0];
    expect(calledUrl).toContain('/social/feed');
    expect(calledUrl).toContain('sort=popular');
    expect(calledUrl).toContain('page=2');
    expect(calledUrl).toContain('limit=10');
    expect(result.results[0].id).toBe('post-1');
  });

  it('createPost sends correct JSON payload to /social/feed', async () => {
    const mockCreated = {
      id: 'post-created',
      caption: 'New personal record on Bench Press!',
      postType: 'PERSONAL_RECORD',
      xpEarned: 100,
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCreated,
    });

    const payload = {
      caption: 'New personal record on Bench Press!',
      postType: 'PERSONAL_RECORD',
      xpEarned: 100,
      metadata: { exerciseName: 'Bench Press', recordValue: '100 kg' },
    };

    const result = await socialApi.createPost(payload);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain('/social/feed');
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual(payload);
    expect(result.id).toBe('post-created');
  });

  it('editPost sends PATCH request with new caption', async () => {
    const mockUpdated = {
      id: 'post-123',
      caption: 'Updated workout caption',
      isEdited: true,
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUpdated,
    });

    const result = await socialApi.editPost('post-123', { caption: 'Updated workout caption' });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain('/social/posts/post-123');
    expect(options.method).toBe('PATCH');
    expect(JSON.parse(options.body)).toEqual({ caption: 'Updated workout caption' });
    expect(result.isEdited).toBe(true);
  });

  it('deletePost sends DELETE request to /social/posts/<id>', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    const result = await socialApi.deletePost('post-to-delete');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain('/social/posts/post-to-delete');
    expect(options.method).toBe('DELETE');
    expect(result.success).toBe(true);
  });

  it('toggleLike sends POST to /social/posts/<id>/like', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ liked: true, likesCount: 5 }),
    });

    const result = await socialApi.toggleLike('post-liked');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain('/social/posts/post-liked/like');
    expect(options.method).toBe('POST');
    expect(result.liked).toBe(true);
    expect(result.likesCount).toBe(5);
  });

  it('comments operations: getComments, createComment, deleteComment', async () => {
    // getComments
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 'comm-1', text: 'Great work!' }],
    });
    const comments = await socialApi.getComments('post-1');
    expect(comments).toHaveLength(1);

    // createComment
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'comm-2', text: 'Keep going!' }),
    });
    const created = await socialApi.createComment('post-1', { text: 'Keep going!' });
    expect(created.text).toBe('Keep going!');

    // deleteComment
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });
    const delRes = await socialApi.deleteComment('post-1', 'comm-2');
    expect(delRes.success).toBe(true);
  });

  it('reportPost sends reason and optional notes to backend', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, message: 'Report submitted successfully.' }),
    });

    const res = await socialApi.reportPost('post-reported', {
      reason: 'SPAM',
      notes: 'Contains unwanted links',
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain('/social/posts/post-reported/report');
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual({
      reason: 'SPAM',
      notes: 'Contains unwanted links',
    });
    expect(res.success).toBe(true);
  });

  it('getPublicProfile fetches public stats and rank information for user', async () => {
    const mockProfile = {
      user: { id: 'usr-456', displayName: 'Jane Doe', createdAt: '2026-01-01' },
      rank: { name: 'CAPTAIN', insigniaType: 'double-bar', tier: 8, level: 8, totalXP: 14500 },
      stats: { currentStreak: 12, totalWorkouts: 85, totalRuns: 20, postsCount: 14 },
      recentPosts: [],
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockProfile,
    });

    const profile = await socialApi.getPublicProfile('usr-456');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch.mock.calls[0][0]).toContain('/social/users/usr-456/public-profile');
    expect(profile.rank.name).toBe('CAPTAIN');
    expect(profile.stats.currentStreak).toBe(12);
  });
});

describe('Military Rank Progression System', () => {
  it('contains valid hierarchy of 12 military ranks from Recruit to General', () => {
    expect(MILITARY_RANKS.length).toBe(12);
    expect(MILITARY_RANKS[0].id).toBe('recruit');
    expect(MILITARY_RANKS[11].id).toBe('general');
  });

  it('correctly maps XP to military warrior ranks', () => {
    expect(getRankByXP(0).name).toBe('INITIATE WARRIOR');
    expect(getRankByXP(0).id).toBe('recruit');
    expect(getRankByXP(350).name).toBe('BRONZE BERSERKER');
    expect(getRankByXP(350).id).toBe('private');
    expect(getRankByXP(2500).name).toBe('SHADOW BLADE');
    expect(getRankByXP(2500).id).toBe('sergeant');
    expect(getRankByXP(50000).name).toBe('WARMASTER SUPREME');
    expect(getRankByXP(50000).id).toBe('general');
  });
});
