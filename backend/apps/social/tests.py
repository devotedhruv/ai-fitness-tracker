from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from apps.authentication.models import User, UserProfile
from .models import FeedPost, PostLike, PostComment, PostReport

class SocialApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(email='social@fittrack.app', password='Password123!')
        UserProfile.objects.create(user=self.user, display_name='Social Athlete', username='social_champ')
        self.client.force_authenticate(user=self.user)

    def test_create_and_list_feed_posts(self):
        post = FeedPost.objects.create(
            user=self.user,
            title='Morning Heavy Push Day',
            caption='Hit 100kg bench press!',
            post_type='WORKOUT',
            total_volume_kg=4800,
            xp_earned=180,
            media_type='NONE',
        )

        response = self.client.get('/api/v1/social/feed')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('posts', response.data)
        self.assertEqual(len(response.data['posts']), 1)
        self.assertEqual(response.data['posts'][0]['title'], 'Morning Heavy Push Day')
        self.assertEqual(response.data['posts'][0]['xp_earned'], 180)
        self.assertIn('userRankName', response.data['posts'][0])

    def test_toggle_like_on_post(self):
        post = FeedPost.objects.create(
            user=self.user,
            title='5K Personal Record',
            post_type='RUN',
            distance_meters=5000,
        )

        # Like
        res1 = self.client.post(f'/api/v1/social/posts/{post.id}/like')
        self.assertEqual(res1.status_code, status.HTTP_200_OK)
        self.assertTrue(res1.data['isLiked'])
        self.assertEqual(res1.data['likesCount'], 1)

        # Unlike
        res2 = self.client.post(f'/api/v1/social/posts/{post.id}/like')
        self.assertEqual(res2.status_code, status.HTTP_200_OK)
        self.assertFalse(res2.data['isLiked'])
        self.assertEqual(res2.data['likesCount'], 0)

    def test_edit_and_delete_own_post(self):
        post = FeedPost.objects.create(
            user=self.user,
            title='Initial Title',
            caption='Initial Caption',
            post_type='TEXT',
        )

        # Edit
        patch_res = self.client.patch(f'/api/v1/social/posts/{post.id}', {
            'caption': 'Updated Caption with better progress notes!'
        }, format='json')
        self.assertEqual(patch_res.status_code, status.HTTP_200_OK)
        self.assertEqual(patch_res.data['caption'], 'Updated Caption with better progress notes!')
        self.assertTrue(patch_res.data['is_edited'])

        # Delete
        del_res = self.client.delete(f'/api/v1/social/posts/{post.id}')
        self.assertEqual(del_res.status_code, status.HTTP_200_OK)
        self.assertFalse(FeedPost.objects.filter(id=post.id).exists())

    def test_add_and_delete_comment(self):
        post = FeedPost.objects.create(
            user=self.user,
            title='Epic Squat Day',
            post_type='WORKOUT',
        )

        # Add comment
        comment_res = self.client.post(f'/api/v1/social/posts/{post.id}/comments', {
            'content': 'Great depth on those squats!'
        }, format='json')
        self.assertEqual(comment_res.status_code, status.HTTP_201_CREATED)
        comment_id = comment_res.data['id']
        self.assertEqual(comment_res.data['content'], 'Great depth on those squats!')

        # List comments
        list_res = self.client.get(f'/api/v1/social/posts/{post.id}/comments')
        self.assertEqual(list_res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_res.data), 1)

        # Delete comment
        del_res = self.client.delete(f'/api/v1/social/posts/{post.id}/comments/{comment_id}')
        self.assertEqual(del_res.status_code, status.HTTP_200_OK)
        self.assertEqual(PostComment.objects.filter(id=comment_id).count(), 0)

    def test_report_post(self):
        post = FeedPost.objects.create(
            user=self.user,
            title='Reportable Post',
            post_type='TEXT',
        )

        report_res = self.client.post(f'/api/v1/social/posts/{post.id}/report', {
            'reason': 'SPAM',
            'details': 'Suspicious advertising link',
        }, format='json')
        self.assertEqual(report_res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(PostReport.objects.filter(post=post).count(), 1)

    def test_get_public_user_profile(self):
        res = self.client.get(f'/api/v1/social/users/{self.user.id}/profile')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['displayName'], 'Social Athlete')
        self.assertEqual(res.data['username'], 'social_champ')
        self.assertIn('rank', res.data)
        self.assertIn('stats', res.data)
        self.assertIn('posts', res.data)

    def test_get_leaderboard(self):
        response = self.client.get('/api/v1/social/leaderboard?exercise=Bench')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('leaderboard', response.data)

    def test_get_streaks_leaderboard(self):
        response = self.client.get('/api/v1/social/streaks-leaderboard')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('userStats', response.data)
        self.assertIn('leagues', response.data)
        self.assertIn('leaderboard', response.data)
        self.assertEqual(response.data['mode'], 'streak')
        # Check current user in leaderboard
        user_entries = [a for a in response.data['leaderboard'] if a['isCurrentUser']]
        self.assertEqual(len(user_entries), 1)

    def test_get_streaks_leaderboard_workouts_mode(self):
        response = self.client.get('/api/v1/social/streaks-leaderboard?mode=workouts&league=silver')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['mode'], 'workouts')
        self.assertEqual(response.data['currentLeagueId'], 'silver')
        self.assertTrue(len(response.data['leaderboard']) > 0)
        # Scores should be sorted descending
        scores = [item['score'] for item in response.data['leaderboard']]
        self.assertEqual(scores, sorted(scores, reverse=True))

    def test_get_personal_ranking(self):
        response = self.client.get('/api/v1/social/personal-ranking')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('totalXP', response.data)
        self.assertIn('currentRank', response.data)
        self.assertIn('streak', response.data)
        self.assertIn('performanceComparison', response.data)
        self.assertIn('xpBreakdown', response.data)
        self.assertIn('allRanks', response.data)
        self.assertEqual(len(response.data['allRanks']), 12)
        self.assertGreater(response.data['totalXP'], 0)


