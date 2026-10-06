from django.urls import path
from .views import (
    FeedPostListCreateView,
    FeedPostDetailView,
    PostLikeToggleView,
    PostCommentListCreateView,
    PostCommentDetailView,
    PostReportCreateView,
    MediaUploadView,
    PublicUserProfileView,
    LeaderboardView,
    StreakLeaderboardView,
    PersonalRankingView,
)

urlpatterns = [
    path('social/feed', FeedPostListCreateView.as_view(), name='social-feed'),
    path('social/posts/<uuid:post_id>', FeedPostDetailView.as_view(), name='social-post-detail'),
    path('social/posts/<uuid:post_id>/like', PostLikeToggleView.as_view(), name='social-post-like'),
    path('social/posts/<uuid:post_id>/comments', PostCommentListCreateView.as_view(), name='social-post-comments'),
    path('social/posts/<uuid:post_id>/comments/<uuid:comment_id>', PostCommentDetailView.as_view(), name='social-post-comment-detail'),
    path('social/posts/<uuid:post_id>/report', PostReportCreateView.as_view(), name='social-post-report'),
    path('social/upload', MediaUploadView.as_view(), name='social-upload'),
    path('social/users/<uuid:user_id>/profile', PublicUserProfileView.as_view(), name='social-public-profile'),
    path('social/leaderboard', LeaderboardView.as_view(), name='social-leaderboard'),
    path('social/streaks-leaderboard', StreakLeaderboardView.as_view(), name='social-streaks-leaderboard'),
    path('social/personal-ranking', PersonalRankingView.as_view(), name='personal-ranking'),
]

