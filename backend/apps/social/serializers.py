from rest_framework import serializers
from .models import FeedPost, PostLike, PostComment, PostReport
from apps.authentication.serializers import UserProfileSerializer

MILITARY_RANKS_CACHE = [
    {'id': 'recruit', 'name': 'RECRUIT', 'minXP': 0, 'tier': 1, 'insigniaType': 'recruit-bar'},
    {'id': 'private', 'name': 'PRIVATE', 'minXP': 300, 'tier': 2, 'insigniaType': 'single-chevron'},
    {'id': 'private-first-class', 'name': 'PRIVATE FIRST CLASS', 'minXP': 700, 'tier': 3, 'insigniaType': 'chevron-rocker'},
    {'id': 'corporal', 'name': 'CORPORAL', 'minXP': 1200, 'tier': 4, 'insigniaType': 'double-chevron'},
    {'id': 'sergeant', 'name': 'SERGEANT', 'minXP': 2200, 'tier': 5, 'insigniaType': 'triple-chevron'},
    {'id': 'staff-sergeant', 'name': 'STAFF SERGEANT', 'minXP': 3500, 'tier': 6, 'insigniaType': 'chevron-arc'},
    {'id': 'master-sergeant', 'name': 'MASTER SERGEANT', 'minXP': 5200, 'tier': 7, 'insigniaType': 'diamond-star'},
    {'id': 'lieutenant', 'name': 'LIEUTENANT', 'minXP': 7500, 'tier': 8, 'insigniaType': 'single-bar'},
    {'id': 'captain', 'name': 'CAPTAIN', 'minXP': 10500, 'tier': 9, 'insigniaType': 'double-bar'},
    {'id': 'major', 'name': 'MAJOR', 'minXP': 14000, 'tier': 10, 'insigniaType': 'oak-crest'},
    {'id': 'colonel', 'name': 'COLONEL', 'minXP': 18500, 'tier': 11, 'insigniaType': 'eagle-crest'},
    {'id': 'general', 'name': 'GENERAL', 'minXP': 25000, 'tier': 12, 'insigniaType': 'winged-star'},
]

def get_user_rank(user):
    if not user:
        return MILITARY_RANKS_CACHE[0]
    
    # Calculate approximate XP based on completed sessions, runs, PRs
    try:
        from apps.workouts.models import WorkoutSession, PersonalRecord
        from apps.runs.models import Run

        w_count = WorkoutSession.objects.filter(user=user, is_completed=True).count()
        r_count = Run.objects.filter(user=user).count()
        pr_count = PersonalRecord.objects.filter(user=user).count()

        total_xp = (w_count * 150) + (r_count * 120) + (pr_count * 100) + 450
    except Exception:
        total_xp = 450

    current = MILITARY_RANKS_CACHE[0]
    for r in reversed(MILITARY_RANKS_CACHE):
        if total_xp >= r['minXP']:
            current = r
            break

    return {
        'rankId': current['id'],
        'rankName': current['name'],
        'rankTier': current['tier'],
        'insigniaType': current['insigniaType'],
        'totalXP': total_xp,
    }

class PostCommentSerializer(serializers.ModelSerializer):
    userName = serializers.CharField(source='user.profile.display_name', read_only=True)
    userUsername = serializers.CharField(source='user.profile.username', read_only=True)
    userAvatarUrl = serializers.CharField(source='user.profile.avatar_url', read_only=True)
    userEmail = serializers.CharField(source='user.email', read_only=True)
    userRankName = serializers.SerializerMethodField()
    userRankInsignia = serializers.SerializerMethodField()
    isMine = serializers.SerializerMethodField()

    class Meta:
        model = PostComment
        fields = [
            'id', 'user', 'userName', 'userUsername', 'userAvatarUrl', 'userEmail',
            'userRankName', 'userRankInsignia', 'content', 'created_at', 'isMine'
        ]
        read_only_fields = ['user', 'created_at']

    def get_userRankName(self, obj):
        return get_user_rank(obj.user)['rankName']

    def get_userRankInsignia(self, obj):
        return get_user_rank(obj.user)['insigniaType']

    def get_isMine(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.user_id == request.user.id
        return False

class FeedPostSerializer(serializers.ModelSerializer):
    userName = serializers.CharField(source='user.profile.display_name', read_only=True)
    userUsername = serializers.CharField(source='user.profile.username', read_only=True)
    userAvatarUrl = serializers.CharField(source='user.profile.avatar_url', read_only=True)
    userEmail = serializers.CharField(source='user.email', read_only=True)
    userRankName = serializers.SerializerMethodField()
    userRankInsignia = serializers.SerializerMethodField()
    userRankTier = serializers.SerializerMethodField()
    userTotalXP = serializers.SerializerMethodField()
    likesCount = serializers.SerializerMethodField()
    commentsCount = serializers.SerializerMethodField()
    isLikedByMe = serializers.SerializerMethodField()
    isMine = serializers.SerializerMethodField()
    comments = PostCommentSerializer(many=True, read_only=True)

    class Meta:
        model = FeedPost
        fields = [
            'id', 'user', 'userName', 'userUsername', 'userAvatarUrl', 'userEmail',
            'userRankName', 'userRankInsignia', 'userRankTier', 'userTotalXP',
            'title', 'caption', 'post_type', 'media_url', 'media_type', 'thumbnail_url',
            'xp_earned', 'metadata',
            'total_volume_kg', 'distance_meters', 'duration_seconds', 'pr_exercise_name',
            'pr_value', 'is_edited', 'created_at', 'updated_at',
            'likesCount', 'commentsCount', 'isLikedByMe', 'isMine', 'comments'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']

    def get_userRankName(self, obj):
        return get_user_rank(obj.user)['rankName']

    def get_userRankInsignia(self, obj):
        return get_user_rank(obj.user)['insigniaType']

    def get_userRankTier(self, obj):
        return get_user_rank(obj.user)['rankTier']

    def get_userTotalXP(self, obj):
        return get_user_rank(obj.user)['totalXP']

    def get_likesCount(self, obj):
        return obj.likes.count()

    def get_commentsCount(self, obj):
        return obj.comments.count()

    def get_isLikedByMe(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False

    def get_isMine(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.user_id == request.user.id
        return False

    def create(self, validated_data):
        user = self.context['request'].user
        return FeedPost.objects.create(user=user, **validated_data)

class PostReportSerializer(serializers.ModelSerializer):
    reportedByName = serializers.CharField(source='reported_by.profile.display_name', read_only=True)

    class Meta:
        model = PostReport
        fields = ['id', 'post', 'reported_by', 'reportedByName', 'reason', 'details', 'status', 'created_at']
        read_only_fields = ['reported_by', 'status', 'created_at']

    def create(self, validated_data):
        user = self.context['request'].user
        return PostReport.objects.create(reported_by=user, **validated_data)

