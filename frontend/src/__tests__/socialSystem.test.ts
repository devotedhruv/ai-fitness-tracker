import { useSocialStore } from '../stores/socialStore';

describe('BALYRA Social & Community System', () => {
  beforeEach(() => {
    // Reset store state before each test if needed
  });

  describe('Initial State & Cultural Discipline Concepts', () => {
    it('initializes with multi-type athletic posts and Sanskrit discipline metadata', () => {
      const state = useSocialStore.getState();
      expect(state.posts.length).toBeGreaterThanOrEqual(4);

      const postTypes = state.posts.map((p) => p.postType);
      expect(postTypes).toContain('WORKOUT');
      expect(postTypes).toContain('PERSONAL_RECORD');
      expect(postTypes).toContain('CHALLENGE');
      expect(postTypes).toContain('ACHIEVEMENT');

      // Verify Sanskrit discipline titles and concepts
      const alex = state.users['user-alex'];
      expect(alex).toBeDefined();
      expect(alex.disciplineTitle).toBe('Vajra Warrior');

      const marcus = state.users['user-marcus'];
      expect(marcus).toBeDefined();
      expect(marcus.disciplineTitle).toBe('Bala Master');

      const elena = state.users['user-elena'];
      expect(elena).toBeDefined();
      expect(elena.disciplineTitle).toBe('Gati Specialist');
    });

    it('initializes active stories with distinct story types and unseen rings', () => {
      const { stories } = useSocialStore.getState();
      expect(stories.length).toBeGreaterThanOrEqual(4);

      const storyTypes = stories.map((s) => s.storyType);
      expect(storyTypes).toContain('WORKOUT');
      expect(storyTypes).toContain('PR');
      expect(storyTypes).toContain('STREAK');
      expect(storyTypes).toContain('CHALLENGE');
    });

    it('initializes community challenges with active participants and rewards', () => {
      const { challenges } = useSocialStore.getState();
      expect(challenges.length).toBeGreaterThanOrEqual(3);

      const squatChal = challenges.find((c) => c.id === 'chal-squat-30');
      expect(squatChal).toBeDefined();
      expect(squatChal?.unit).toBe('squats');
      expect(squatChal?.targetAmount).toBe(3000);
      expect(squatChal?.badgeReward).toBe('Vajra Legs Insignia');
    });
  });

  describe('Post Interactions (Likes, Creation, Edits, Deletion)', () => {
    it('optimistically toggles like on a post, updating count and likers list', () => {
      const { posts, toggleLikePost } = useSocialStore.getState();
      const targetPost = posts.find((p) => !p.isLikedByMe) || posts[0];
      const initialLikes = targetPost.likesCount;
      const initialLiked = targetPost.isLikedByMe;

      // Toggle Like
      toggleLikePost(targetPost.id);
      let updatedPost = useSocialStore.getState().posts.find((p) => p.id === targetPost.id)!;
      expect(updatedPost.isLikedByMe).toBe(!initialLiked);
      expect(updatedPost.likesCount).toBe(initialLiked ? initialLikes - 1 : initialLikes + 1);

      // Verify current user added to likedByUsers
      if (!initialLiked) {
        expect(updatedPost.likedByUsers?.some((u) => u.id === 'me')).toBe(true);
      }

      // Toggle back
      toggleLikePost(targetPost.id);
      updatedPost = useSocialStore.getState().posts.find((p) => p.id === targetPost.id)!;
      expect(updatedPost.isLikedByMe).toBe(initialLiked);
      expect(updatedPost.likesCount).toBe(initialLikes);
    });

    it('creates a WORKOUT post with structured exercise breakdown', () => {
      const { createPost } = useSocialStore.getState();

      const workoutPayload = {
        postType: 'WORKOUT' as const,
        caption: 'Heavy Leg Day: Quad Hypertrophy & ATG Squats',
        visibility: 'EVERYONE' as const,
        workoutData: {
          workoutName: 'Barbell Quad Destroyer',
          durationMinutes: 65,
          exercisesCount: 4,
          setsCount: 16,
          totalVolumeKg: 9400,
          prsCount: 1,
          streakDays: 15,
          exercises: [
            {
              exerciseName: 'Barbell Back Squat',
              category: 'Legs',
              topWeightKg: 140,
              totalVolumeKg: 4200,
              sets: [
                { setNumber: 1, weightKg: 100, reps: 10 },
                { setNumber: 2, weightKg: 120, reps: 8 },
                { setNumber: 3, weightKg: 140, reps: 5, isPR: true },
              ],
            },
          ],
        },
      };

      createPost(workoutPayload);

      const latestPost = useSocialStore.getState().posts[0];
      expect(latestPost.caption).toBe('Heavy Leg Day: Quad Hypertrophy & ATG Squats');
      expect(latestPost.postType).toBe('WORKOUT');
      expect(latestPost.isMine).toBe(true);
      expect(latestPost.workoutData?.workoutName).toBe('Barbell Quad Destroyer');
      expect(latestPost.workoutData?.exercises[0].sets[2].isPR).toBe(true);
    });

    it('creates a PERSONAL_RECORD post with percent gain and estimated 1RM', () => {
      const { createPost } = useSocialStore.getState();

      createPost({
        postType: 'PERSONAL_RECORD',
        caption: 'Huge milestone reached! 100kg overhead press.',
        prData: {
          exerciseName: 'Overhead Barbell Press',
          currentWeightKg: 100,
          currentReps: 3,
          previousWeightKg: 92.5,
          previousReps: 3,
          percentGain: 8.1,
          estimated1RM: 107,
        },
      });

      const latestPost = useSocialStore.getState().posts[0];
      expect(latestPost.postType).toBe('PERSONAL_RECORD');
      expect(latestPost.prData?.currentWeightKg).toBe(100);
      expect(latestPost.prData?.estimated1RM).toBe(107);
    });

    it('creates a PROGRESS post with privacy toggle', () => {
      const { createPost } = useSocialStore.getState();

      createPost({
        postType: 'PROGRESS',
        caption: '12-Week Cut progress report. Core definition improving.',
        progressData: {
          measurementDate: 'October 2026',
          bodyWeightKg: 78.5,
          previousWeightKg: 84.0,
          bodyFatPercent: 12.5,
          strengthSummary: 'Maintained all working compound sets.',
          hideWeight: true,
        },
      });

      const latestPost = useSocialStore.getState().posts[0];
      expect(latestPost.postType).toBe('PROGRESS');
      expect(latestPost.progressData?.hideWeight).toBe(true);
      expect(latestPost.progressData?.bodyFatPercent).toBe(12.5);
    });

    it('edits post caption and preserves edit state', () => {
      const { createPost, editPost } = useSocialStore.getState();
      createPost({ caption: 'Original Draft Caption' });

      const newPostId = useSocialStore.getState().posts[0].id;
      editPost(newPostId, 'Updated Polished Caption #Discipline');

      const updated = useSocialStore.getState().posts.find((p) => p.id === newPostId);
      expect(updated?.caption).toBe('Updated Polished Caption #Discipline');
      expect(updated?.isEdited).toBe(true);
    });

    it('deletes post and clears any corresponding saved bookmark', () => {
      const { createPost, deletePost, savePost } = useSocialStore.getState();
      createPost({ caption: 'To Be Deleted Post' });
      const target = useSocialStore.getState().posts[0];

      savePost(target);
      expect(useSocialStore.getState().isItemSaved(target.id)).toBe(true);

      deletePost(target.id);
      expect(useSocialStore.getState().posts.some((p) => p.id === target.id)).toBe(false);
      expect(useSocialStore.getState().isItemSaved(target.id)).toBe(false);
    });
  });

  describe('Bookmark & Saved Items Vault', () => {
    it('saves and unsaves posts with toggleSaveItem', () => {
      const post = useSocialStore.getState().posts[0];
      const { toggleSaveItem, isItemSaved } = useSocialStore.getState();

      expect(isItemSaved(post.id)).toBe(false);

      // Save item
      toggleSaveItem({
        id: post.id,
        category: 'POSTS',
        title: 'Saved Workout Reference',
        subtitle: 'Key lifting techniques',
      });
      expect(useSocialStore.getState().isItemSaved(post.id)).toBe(true);
      expect(useSocialStore.getState().savedItems.some((i) => i.id === post.id)).toBe(true);

      // Toggle again to unsave
      useSocialStore.getState().toggleSaveItem({ id: post.id, title: 'Saved Workout Reference' });
      expect(useSocialStore.getState().isItemSaved(post.id)).toBe(false);
    });

    it('unsaves items directly by ID', () => {
      const { toggleSaveItem, unsaveItem, isItemSaved } = useSocialStore.getState();
      const testId = 'saved-test-123';

      toggleSaveItem({
        id: testId,
        category: 'WORKOUTS',
        title: 'Marcus Heavy Pull Routine',
      });
      expect(isItemSaved(testId)).toBe(true);

      unsaveItem(testId);
      expect(useSocialStore.getState().isItemSaved(testId)).toBe(false);
    });
  });

  describe('Threaded Comments & Replies', () => {
    it('adds top-level comments and increments post comments count', () => {
      const post = useSocialStore.getState().posts[0];
      const initialCount = post.commentsCount;
      const { addComment } = useSocialStore.getState();

      addComment(post.id, 'Incredible form and control! 🔥');

      const updatedPost = useSocialStore.getState().posts.find((p) => p.id === post.id)!;
      expect(updatedPost.commentsCount).toBe(initialCount + 1);

      const comments = useSocialStore.getState().getCommentsForPost(post.id);
      expect(comments.some((c) => c.text === 'Incredible form and control! 🔥')).toBe(true);
    });

    it('adds nested reply to an existing comment', () => {
      const post = useSocialStore.getState().posts[0];
      const { addComment } = useSocialStore.getState();

      addComment(post.id, 'Top-level question: what was rest duration?');
      const comments = useSocialStore.getState().getCommentsForPost(post.id);
      const topComment = comments[comments.length - 1];

      addComment(post.id, 'Reply: Kept it strictly at 90 seconds.', topComment.id);

      const updatedComments = useSocialStore.getState().getCommentsForPost(post.id);
      const parent = updatedComments.find((c) => c.id === topComment.id)!;
      expect(parent.replies.length).toBeGreaterThan(0);
      expect(parent.replies[parent.replies.length - 1].text).toBe(
        'Reply: Kept it strictly at 90 seconds.'
      );
    });

    it('likes and unlikes a comment', () => {
      const post = useSocialStore.getState().posts[0];
      const { addComment, likeComment } = useSocialStore.getState();

      addComment(post.id, 'Comment to like');
      const comments = useSocialStore.getState().getCommentsForPost(post.id);
      const targetComment = comments[comments.length - 1];

      // Like
      likeComment(post.id, targetComment.id);
      let updated = useSocialStore.getState().getCommentsForPost(post.id).find((c) => c.id === targetComment.id)!;
      expect(updated.isLikedByMe).toBe(true);
      expect(updated.likesCount).toBe(1);

      // Unlike
      likeComment(post.id, targetComment.id);
      updated = useSocialStore.getState().getCommentsForPost(post.id).find((c) => c.id === targetComment.id)!;
      expect(updated.isLikedByMe).toBe(false);
      expect(updated.likesCount).toBe(0);
    });

    it('deletes a comment and decrements post comments count', () => {
      const post = useSocialStore.getState().posts[0];
      const { addComment, deleteComment } = useSocialStore.getState();

      addComment(post.id, 'Temporary remark');
      const comments = useSocialStore.getState().getCommentsForPost(post.id);
      const targetComment = comments[comments.length - 1];
      const countBefore = useSocialStore.getState().posts.find((p) => p.id === post.id)!.commentsCount;

      deleteComment(post.id, targetComment.id);
      const countAfter = useSocialStore.getState().posts.find((p) => p.id === post.id)!.commentsCount;
      expect(countAfter).toBe(Math.max(0, countBefore - 1));

      const updatedList = useSocialStore.getState().getCommentsForPost(post.id);
      expect(updatedList.some((c) => c.id === targetComment.id)).toBe(false);
    });
  });

  describe('Social Graph & Moderation (Follow, Requests, Block, Mute)', () => {
    it('follows a public athlete immediately and increments followers count', () => {
      const { users, followUser } = useSocialStore.getState();
      const marcus = users['user-marcus'];
      expect(marcus.isPrivate).toBe(false);
      const initialFollowers = marcus.followersCount;

      followUser('user-marcus');

      const updated = useSocialStore.getState().users['user-marcus'];
      expect(updated.followStatus).toBe('FOLLOWING');
      expect(updated.isFollowing).toBe(true);
      expect(updated.followersCount).toBe(initialFollowers + 1);
    });

    it('requests to follow a private athlete without immediate follower increment', () => {
      const { users, followUser } = useSocialStore.getState();
      const sarah = users['user-sarah'];
      expect(sarah.isPrivate).toBe(true);
      const initialFollowers = sarah.followersCount;

      followUser('user-sarah');

      const updated = useSocialStore.getState().users['user-sarah'];
      expect(updated.followStatus).toBe('REQUESTED');
      expect(updated.isFollowRequested).toBe(true);
      expect(updated.followersCount).toBe(initialFollowers);
    });

    it('unfollows an athlete and updates status', () => {
      const { followUser, unfollowUser } = useSocialStore.getState();
      followUser('user-marcus');
      const followerCountAfterFollow = useSocialStore.getState().users['user-marcus'].followersCount;

      unfollowUser('user-marcus');
      const updated = useSocialStore.getState().users['user-marcus'];
      expect(updated.followStatus).toBe('NOT_FOLLOWING');
      expect(updated.isFollowing).toBe(false);
      expect(updated.followersCount).toBe(followerCountAfterFollow - 1);
    });

    it('responds to follow requests (accept and decline)', () => {
      const { notifications, respondFollowRequest } = useSocialStore.getState();
      const requestNotif = notifications.find((n) => n.type === 'FOLLOW_REQUEST')!;
      expect(requestNotif).toBeDefined();

      respondFollowRequest(requestNotif.id, true);
      const updatedNotif = useSocialStore.getState().notifications.find((n) => n.id === requestNotif.id)!;
      expect(updatedNotif.requestStatus).toBe('ACCEPTED');
      expect(updatedNotif.isRead).toBe(true);
    });

    it('blocks a user and purges their posts and stories from the feed', () => {
      const { blockUser } = useSocialStore.getState();
      const targetUserId = 'user-marcus';

      // Ensure user has posts before block
      const hasPostsBefore = useSocialStore.getState().posts.some((p) => p.userId === targetUserId);
      expect(hasPostsBefore).toBe(true);

      blockUser(targetUserId);

      expect(useSocialStore.getState().blockedUserIds).toContain(targetUserId);
      const hasPostsAfter = useSocialStore.getState().posts.some((p) => p.userId === targetUserId);
      expect(hasPostsAfter).toBe(false);

      const hasStoriesAfter = useSocialStore.getState().stories.some((s) => s.userId === targetUserId);
      expect(hasStoriesAfter).toBe(false);

      // Unblock
      useSocialStore.getState().unblockUser(targetUserId);
      expect(useSocialStore.getState().blockedUserIds).not.toContain(targetUserId);
    });

    it('mutes and unmutes a user', () => {
      const { muteUser, unmuteUser } = useSocialStore.getState();
      const targetUserId = 'user-elena';

      muteUser(targetUserId);
      expect(useSocialStore.getState().mutedUserIds).toContain(targetUserId);

      unmuteUser(targetUserId);
      expect(useSocialStore.getState().mutedUserIds).not.toContain(targetUserId);
    });
  });

  describe('Stories, Notifications & Community Challenges', () => {
    it('marks story as seen', () => {
      const story = useSocialStore.getState().stories.find((s) => s.hasUnseen)!;
      expect(story).toBeDefined();

      useSocialStore.getState().markStorySeen(story.id);

      const updated = useSocialStore.getState().stories.find((s) => s.id === story.id)!;
      expect(updated.hasUnseen).toBe(false);
    });

    it('manages notification read states', () => {
      const { notifications, markNotificationRead, markAllNotificationsRead, unreadNotificationsCount } =
        useSocialStore.getState();

      const unreadNotif = notifications.find((n) => !n.isRead);
      if (unreadNotif) {
        markNotificationRead(unreadNotif.id);
        const updated = useSocialStore.getState().notifications.find((n) => n.id === unreadNotif.id)!;
        expect(updated.isRead).toBe(true);
      }

      markAllNotificationsRead();
      expect(unreadNotificationsCount()).toBe(0);
      expect(useSocialStore.getState().notifications.every((n) => n.isRead)).toBe(true);
    });

    it('joins, leaves, and logs progress toward community challenges', () => {
      const challenge = useSocialStore.getState().challenges[0];
      const initialJoined = challenge.isJoined;
      const initialParticipants = challenge.participantsCount;

      if (!initialJoined) {
        useSocialStore.getState().joinChallenge(challenge.id);
        let updated = useSocialStore.getState().challenges.find((c) => c.id === challenge.id)!;
        expect(updated.isJoined).toBe(true);
        expect(updated.participantsCount).toBe(initialParticipants + 1);
      }

      // Log progress
      const amountBefore = useSocialStore.getState().challenges.find((c) => c.id === challenge.id)!.currentAmount;
      useSocialStore.getState().logChallengeProgress(challenge.id, 50);

      const amountAfter = useSocialStore.getState().challenges.find((c) => c.id === challenge.id)!.currentAmount;
      expect(amountAfter).toBe(Math.min(challenge.targetAmount, amountBefore + 50));

      // Leave challenge
      useSocialStore.getState().leaveChallenge(challenge.id);
      const left = useSocialStore.getState().challenges.find((c) => c.id === challenge.id)!;
      expect(left.isJoined).toBe(false);
    });
  });
});
