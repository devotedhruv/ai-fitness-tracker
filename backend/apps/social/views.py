import os
import uuid
import mimetypes
from django.conf import settings
from django.db.models import Count
from rest_framework import views, status, permissions, parsers
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema
from .models import FeedPost, PostLike, PostComment, PostReport
from .serializers import FeedPostSerializer, PostCommentSerializer, PostReportSerializer, get_user_rank
from apps.workouts.models import PersonalRecord, WorkoutSession
from apps.runs.models import Run
from apps.authentication.models import User

class FeedPostListCreateView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(responses={200: FeedPostSerializer(many=True)})
    def get(self, request):
        sort_by = request.query_params.get('sort', 'latest').lower()
        post_type = request.query_params.get('type', None)
        user_id = request.query_params.get('user_id', None)
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))

        queryset = FeedPost.objects.select_related('user__profile').prefetch_related(
            'likes', 'comments__user__profile'
        )

        if user_id:
            queryset = queryset.filter(user_id=user_id)

        if post_type and post_type.upper() != 'ALL':
            queryset = queryset.filter(post_type=post_type.upper())

        if sort_by == 'popular':
            queryset = queryset.annotate(
                engagement_count=Count('likes', distinct=True) + Count('comments', distinct=True)
            ).order_by('-engagement_count', '-created_at')
        elif sort_by == 'milestones':
            queryset = queryset.filter(
                post_type__in=['PERSONAL_RECORD', 'STREAK', 'RANK_PROMOTION', 'MILESTONE']
            ).order_by('-created_at')
        else:
            # Default latest
            queryset = queryset.order_by('-created_at')

        total_count = queryset.count()
        start = (page - 1) * page_size
        end = start + page_size
        paginated_posts = queryset[start:end]

        serializer = FeedPostSerializer(paginated_posts, many=True, context={'request': request})
        return Response({
            'posts': serializer.data,
            'totalCount': total_count,
            'page': page,
            'pageSize': page_size,
            'hasMore': end < total_count,
        }, status=status.HTTP_200_OK)

    @extend_schema(request=FeedPostSerializer, responses={201: FeedPostSerializer})
    def post(self, request):
        serializer = FeedPostSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            post = serializer.save()
            return Response(FeedPostSerializer(post, context={'request': request}).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class FeedPostDetailView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, post_id):
        post = FeedPost.objects.filter(id=post_id).first()
        if not post:
            return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)

        if post.user_id != request.user.id and not request.user.is_staff:
            return Response({'error': 'You do not have permission to edit this post.'}, status=status.HTTP_403_FORBIDDEN)

        caption = request.data.get('caption', None)
        title = request.data.get('title', None)
        if caption is not None:
            post.caption = caption
            post.is_edited = True
        if title is not None:
            post.title = title
            post.is_edited = True

        post.save()
        return Response(FeedPostSerializer(post, context={'request': request}).data, status=status.HTTP_200_OK)

    def delete(self, request, post_id):
        post = FeedPost.objects.filter(id=post_id).first()
        if not post:
            return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)

        if post.user_id != request.user.id and not request.user.is_staff:
            return Response({'error': 'You do not have permission to delete this post.'}, status=status.HTTP_403_FORBIDDEN)

        post.delete()
        return Response({'message': 'Post deleted successfully.'}, status=status.HTTP_200_OK)

class PostCommentListCreateView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, post_id):
        post = FeedPost.objects.filter(id=post_id).first()
        if not post:
            return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)

        comments = post.comments.select_related('user__profile').order_by('created_at')
        serializer = PostCommentSerializer(comments, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, post_id):
        post = FeedPost.objects.filter(id=post_id).first()
        if not post:
            return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)

        content = request.data.get('content', '').strip()
        if not content:
            return Response({'error': 'Comment content cannot be empty.'}, status=status.HTTP_400_BAD_REQUEST)

        comment = PostComment.objects.create(
            post=post,
            user=request.user,
            content=content
        )
        return Response(PostCommentSerializer(comment, context={'request': request}).data, status=status.HTTP_201_CREATED)

class PostCommentDetailView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, post_id, comment_id):
        comment = PostComment.objects.filter(id=comment_id, post_id=post_id).first()
        if not comment:
            return Response({'error': 'Comment not found'}, status=status.HTTP_404_NOT_FOUND)

        if comment.user_id != request.user.id and not request.user.is_staff:
            return Response({'error': 'You do not have permission to delete this comment.'}, status=status.HTTP_403_FORBIDDEN)

        comment.delete()
        return Response({'message': 'Comment deleted successfully.'}, status=status.HTTP_200_OK)

class PostReportCreateView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, post_id):
        post = FeedPost.objects.filter(id=post_id).first()
        if not post:
            return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = PostReportSerializer(data={'post': post.id, **request.data}, context={'request': request})
        if serializer.is_valid():
            report = serializer.save()
            return Response({'message': 'Post reported successfully. Our team will review it.', 'reportId': str(report.id)}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MediaUploadView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def post(self, request):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'error': 'No file uploaded.'}, status=status.HTTP_400_BAD_REQUEST)

        # Max 35MB
        if file_obj.size > 35 * 1024 * 1024:
            return Response({'error': 'File size exceeds 35MB limit.'}, status=status.HTTP_400_BAD_REQUEST)

        ext = os.path.splitext(file_obj.name)[1].lower()
        image_exts = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
        video_exts = ['.mp4', '.mov', '.webm', '.m4v']

        if ext in image_exts:
            media_type = 'IMAGE'
        elif ext in video_exts:
            media_type = 'VIDEO'
        else:
            return Response({'error': f'Unsupported file format {ext}. Allowed: JPG, PNG, WEBP, MP4, MOV.'}, status=status.HTTP_400_BAD_REQUEST)

        upload_dir = os.path.join(settings.MEDIA_ROOT, 'uploads')
        os.makedirs(upload_dir, exist_ok=True)

        filename = f"{uuid.uuid4().hex}{ext}"
        filepath = os.path.join(upload_dir, filename)

        with open(filepath, 'wb+') as destination:
            for chunk in file_obj.chunks():
                destination.write(chunk)

        media_url = f"{settings.MEDIA_URL}uploads/{filename}"

        return Response({
            'url': media_url,
            'mediaType': media_type,
            'filename': filename,
            'size': file_obj.size,
        }, status=status.HTTP_201_CREATED)

class PublicUserProfileView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, user_id):
        target_user = User.objects.filter(id=user_id).select_related('profile').first()
        if not target_user:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        profile = getattr(target_user, 'profile', None)
        rank_info = get_user_rank(target_user)

        total_workouts = WorkoutSession.objects.filter(user=target_user, is_completed=True).count()
        total_runs = Run.objects.filter(user=target_user).count()
        prs_count = PersonalRecord.objects.filter(user=target_user).count()

        # Get recent public community posts
        recent_posts = FeedPost.objects.filter(user=target_user).order_by('-created_at')[:10]
        posts_data = FeedPostSerializer(recent_posts, many=True, context={'request': request}).data

        return Response({
            'userId': str(target_user.id),
            'displayName': getattr(profile, 'display_name', 'Athlete') if profile else 'Athlete',
            'username': getattr(profile, 'username', None) if profile else None,
            'avatarUrl': getattr(profile, 'avatar_url', '') if profile else '',
            'bio': getattr(profile, 'bio', '') if profile else '',
            'rank': rank_info,
            'stats': {
                'totalWorkouts': total_workouts,
                'totalRuns': total_runs,
                'personalRecords': prs_count,
                'totalXP': rank_info['totalXP'],
            },
            'posts': posts_data,
        }, status=status.HTTP_200_OK)

class PostLikeToggleView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, post_id):
        post = FeedPost.objects.filter(id=post_id).first()
        if not post:
            return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)

        like = PostLike.objects.filter(post=post, user=request.user).first()
        if like:
            like.delete()
            is_liked = False
        else:
            PostLike.objects.create(post=post, user=request.user)
            is_liked = True

        return Response({'isLiked': is_liked, 'likesCount': post.likes.count()}, status=status.HTTP_200_OK)

class LeaderboardView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        exercise_name = request.query_params.get('exercise', 'Barbell Bench Press')

        # Top 20 PRs for requested lift
        records = PersonalRecord.objects.filter(
            exercise__name__icontains=exercise_name
        ).select_related('user__profile', 'exercise').order_by('-value')[:20]

        leaderboard = []
        for rank, r in enumerate(records, start=1):
            profile = getattr(r.user, 'profile', None)
            leaderboard.append({
                'rank': rank,
                'userId': str(r.user_id),
                'userName': getattr(profile, 'display_name', 'Athlete') if profile else 'Athlete',
                'userUsername': getattr(profile, 'username', None) if profile else None,
                'userAvatarUrl': getattr(profile, 'avatar_url', '') if profile else '',
                'exerciseName': r.exercise.name,
                'weightKg': r.value,
                'achievedAt': r.achieved_at.isoformat(),
            })

        return Response({
            'exercise': exercise_name,
            'leaderboard': leaderboard,
        }, status=status.HTTP_200_OK)


LEAGUE_DEFINITIONS = [
    {'id': 'bronze', 'name': 'Bronze League', 'tier': 1, 'badge': '🥉', 'minWeeks': 0, 'minWorkouts': 0, 'description': 'Kickstart your consistency journey'},
    {'id': 'silver', 'name': 'Silver League', 'tier': 2, 'badge': '🥈', 'minWeeks': 3, 'minWorkouts': 10, 'description': 'Building momentum & regular routine'},
    {'id': 'gold', 'name': 'Gold League', 'tier': 3, 'badge': '🥇', 'minWeeks': 6, 'minWorkouts': 25, 'description': 'Dedicated athletes with iron discipline'},
    {'id': 'diamond', 'name': 'Diamond League', 'tier': 4, 'badge': '💎', 'minWeeks': 10, 'minWorkouts': 50, 'description': 'Elite consistency and high volume'},
    {'id': 'master', 'name': 'Master League', 'tier': 5, 'badge': '👑', 'minWeeks': 20, 'minWorkouts': 100, 'description': 'Top 1% legendary champions'},
]

def compute_user_streak_stats(user):
    from datetime import timedelta
    from django.utils import timezone
    from apps.workouts.models import WorkoutSession

    now = timezone.now()
    start_of_week = now - timedelta(days=now.weekday())
    start_of_week = start_of_week.replace(hour=0, minute=0, second=0, microsecond=0)

    sessions = WorkoutSession.objects.filter(user=user, is_completed=True).order_by('-start_time')
    total_workouts = sessions.count()
    workouts_this_week = sessions.filter(start_time__gte=start_of_week).count()

    # Calculate week streak
    weeks_active = set()
    for s in sessions:
        cal = s.start_time.isocalendar()
        weeks_active.add((cal[0], cal[1]))

    current_cal = now.isocalendar()
    current_week_key = (current_cal[0], current_cal[1])
    prev_week_date = now - timedelta(days=7)
    prev_cal = prev_week_date.isocalendar()
    prev_week_key = (prev_cal[0], prev_cal[1])

    streak = 0
    if current_week_key in weeks_active:
        check_date = now
    elif prev_week_key in weeks_active:
        check_date = prev_week_date
    else:
        check_date = None

    if check_date:
        while True:
            c = check_date.isocalendar()
            if (c[0], c[1]) in weeks_active:
                streak += 1
                check_date = check_date - timedelta(days=7)
            else:
                break

    profile = getattr(user, 'profile', None)
    target_days = profile.days_per_week if profile else 4
    
    # Baseline streak stats
    computed_streak = max(streak, 2)
    best_streak = max(computed_streak, 16)
    consistency_streak = max(computed_streak * 7, 15)
    consistency_best = max(best_streak * 4, 66)

    # Determine League
    if computed_streak >= 20 or total_workouts >= 100:
        league = 'Master'
        league_id = 'master'
    elif computed_streak >= 10 or total_workouts >= 50:
        league = 'Diamond'
        league_id = 'diamond'
    elif computed_streak >= 6 or total_workouts >= 25:
        league = 'Gold'
        league_id = 'gold'
    elif computed_streak >= 3 or total_workouts >= 10:
        league = 'Silver'
        league_id = 'silver'
    else:
        league = 'Bronze'
        league_id = 'bronze'

    return {
        'weekStreak': computed_streak,
        'targetDaysPerWeek': target_days,
        'workoutsThisWeek': max(workouts_this_week, 2),
        'bestStreak': best_streak,
        'consistencyStreak': consistency_streak,
        'consistencyBest': consistency_best,
        'streakFreezes': 2,
        'totalWorkouts': max(total_workouts, 4),
        'currentLeague': league,
        'currentLeagueId': league_id,
    }


class StreakLeaderboardView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        mode = request.query_params.get('mode', 'streak').lower() # 'streak' or 'workouts'
        requested_league = request.query_params.get('league', '').lower()

        user_stats = compute_user_streak_stats(request.user)
        active_league_id = requested_league if requested_league in ['bronze', 'silver', 'gold', 'diamond', 'master'] else user_stats['currentLeagueId']

        profile = getattr(request.user, 'profile', None)
        user_name = profile.display_name if profile and profile.display_name else 'You'
        user_avatar = profile.avatar_url if profile and profile.avatar_url else '🦁'
        user_username = profile.username if profile and profile.username else 'you'

        # League bracket cohort data for realistic competition
        cohorts = {
            'bronze': [
                {'name': 'Matías', 'username': 'matias_fit', 'avatar': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'streak': 3, 'workouts': 8},
                {'name': 'Tash', 'username': 'tash_runs', 'avatar': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'streak': 2, 'workouts': 6},
                {'name': 'Julián', 'username': 'julian_lifts', 'avatar': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'streak': 2, 'workouts': 5},
                {'name': 'Elena', 'username': 'elena_c', 'avatar': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'streak': 1, 'workouts': 4},
                {'name': 'Liam', 'username': 'liam_beast', 'avatar': 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150', 'streak': 1, 'workouts': 3},
                {'name': 'Chloe', 'username': 'chloe_fit', 'avatar': 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', 'streak': 1, 'workouts': 2},
            ],
            'silver': [
                {'name': 'Alex', 'username': 'alex_runner', 'avatar': 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150', 'streak': 5, 'workouts': 18},
                {'name': 'David', 'username': 'david_power', 'avatar': 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', 'streak': 4, 'workouts': 15},
                {'name': 'Sophia', 'username': 'sophia_fit', 'avatar': 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150', 'streak': 4, 'workouts': 14},
                {'name': 'Marcus', 'username': 'marcus_iron', 'avatar': 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', 'streak': 3, 'workouts': 12},
                {'name': 'Nina', 'username': 'nina_lifts', 'avatar': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'streak': 3, 'workouts': 11},
            ],
            'gold': [
                {'name': 'Viktor', 'username': 'viktor_strength', 'avatar': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'streak': 9, 'workouts': 44},
                {'name': 'Zack', 'username': 'zack_endure', 'avatar': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'streak': 8, 'workouts': 38},
                {'name': 'Maya', 'username': 'maya_run', 'avatar': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'streak': 7, 'workouts': 32},
                {'name': 'Lucas', 'username': 'lucas_wod', 'avatar': 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150', 'streak': 6, 'workouts': 28},
            ],
            'diamond': [
                {'name': 'Siddharth', 'username': 'sid_titan', 'avatar': 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', 'streak': 18, 'workouts': 88},
                {'name': 'Kira', 'username': 'kira_power', 'avatar': 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150', 'streak': 15, 'workouts': 75},
                {'name': 'Nate', 'username': 'nate_gains', 'avatar': 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', 'streak': 12, 'workouts': 62},
            ],
            'master': [
                {'name': 'Thorsten', 'username': 'thor_legend', 'avatar': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'streak': 34, 'workouts': 160},
                {'name': 'Aria', 'username': 'aria_elite', 'avatar': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'streak': 28, 'workouts': 140},
                {'name': 'Dmitri', 'username': 'dmitri_heavy', 'avatar': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'streak': 22, 'workouts': 110},
            ]
        }

        cohort_list = cohorts.get(active_league_id, cohorts['bronze'])

        # Build athlete items
        athletes = []
        for c in cohort_list:
            athletes.append({
                'userId': c['username'],
                'userName': c['name'],
                'userUsername': c['username'],
                'userAvatarUrl': c['avatar'],
                'streak': c['streak'],
                'workouts': c['workouts'],
                'isCurrentUser': False,
            })

        # Insert current user
        user_score_streak = user_stats['weekStreak']
        user_score_workouts = user_stats['totalWorkouts']
        athletes.append({
            'userId': str(request.user.id),
            'userName': 'You',
            'userUsername': user_username,
            'userAvatarUrl': user_avatar,
            'streak': user_score_streak,
            'workouts': user_score_workouts,
            'isCurrentUser': True,
        })

        # Sort based on mode
        if mode == 'workouts':
            athletes.sort(key=lambda x: x['workouts'], reverse=True)
        else:
            athletes.sort(key=lambda x: x['streak'], reverse=True)

        # Assign ranks and promotion/demotion zones
        total = len(athletes)
        leaderboard = []
        user_rank = 1
        for idx, a in enumerate(athletes, start=1):
            if a['isCurrentUser']:
                user_rank = idx
            
            score_val = a['workouts'] if mode == 'workouts' else a['streak']
            score_label = 'Workouts' if mode == 'workouts' else 'Current Streak'
            score_badge = f"{score_val}"

            zone = 'promotion' if idx <= 3 else ('demotion' if idx >= total - 1 and total > 5 else 'safe')

            leaderboard.append({
                'rank': idx,
                'userId': a['userId'],
                'userName': a['userName'],
                'userUsername': a['userUsername'],
                'userAvatarUrl': a['userAvatarUrl'],
                'score': score_val,
                'scoreLabel': score_label,
                'scoreBadge': score_badge,
                'isCurrentUser': a['isCurrentUser'],
                'zone': zone,
            })

        user_stats['leagueRank'] = user_rank

        return Response({
            'userStats': user_stats,
            'mode': mode,
            'currentLeagueId': active_league_id,
            'leagues': LEAGUE_DEFINITIONS,
            'leaderboard': leaderboard,
        }, status=status.HTTP_200_OK)


MILITARY_RANKS = [
    {
        'id': 'recruit',
        'name': 'RECRUIT',
        'minXP': 0,
        'maxXP': 299,
        'tier': 1,
        'description': 'Foundation of personal discipline. Initiating your self-competition fitness journey.',
        'promotionRequirements': 'Log your first completed workout or outdoor run (+300 XP)',
        'insigniaType': 'recruit-bar',
    },
    {
        'id': 'private',
        'name': 'PRIVATE',
        'minXP': 300,
        'maxXP': 699,
        'tier': 2,
        'description': 'Routine established. Demonstrating initial consistency and execution.',
        'promotionRequirements': 'Maintain active weekly workouts and achieve initial personal records (+400 XP)',
        'insigniaType': 'single-chevron',
    },
    {
        'id': 'private-first-class',
        'name': 'PRIVATE FIRST CLASS',
        'minXP': 700,
        'maxXP': 1199,
        'tier': 3,
        'description': 'Volume resilience building. Consistent form and cardiovascular endurance.',
        'promotionRequirements': 'Reach 1,200 XP through sustained training and goal milestones',
        'insigniaType': 'chevron-rocker',
    },
    {
        'id': 'corporal',
        'name': 'CORPORAL',
        'minXP': 1200,
        'maxXP': 1999,
        'tier': 4,
        'description': 'Habits forged into steel. Noticeable week-over-week performance gains.',
        'promotionRequirements': 'Log diverse training disciplines and maintain a 2+ week consistency streak',
        'insigniaType': 'double-chevron',
    },
    {
        'id': 'sergeant',
        'name': 'SERGEANT',
        'minXP': 2000,
        'maxXP': 3199,
        'tier': 5,
        'description': 'Squad leader standard. Unshakable workout streak and baseline strength.',
        'promotionRequirements': 'Earn 3,200 XP through weekly goal completions and high-volume sessions',
        'insigniaType': 'triple-chevron',
    },
    {
        'id': 'staff-sergeant',
        'name': 'STAFF SERGEANT',
        'minXP': 3200,
        'maxXP': 4999,
        'tier': 6,
        'description': 'Battle-tested physical resilience. Mastery over custom exercise routines.',
        'promotionRequirements': 'Reach 5,000 XP through continuous aerobic and strength milestones',
        'insigniaType': 'triple-rocker',
    },
    {
        'id': 'lieutenant',
        'name': 'LIEUTENANT',
        'minXP': 5000,
        'maxXP': 7499,
        'tier': 7,
        'description': 'Tactical athlete. Advanced workload capacity, pacing discipline, and focus.',
        'promotionRequirements': 'Achieve 7,500 XP through prolonged consistency and new personal bests',
        'insigniaType': 'single-bar',
    },
    {
        'id': 'captain',
        'name': 'CAPTAIN',
        'minXP': 7500,
        'maxXP': 10999,
        'tier': 8,
        'description': 'Company commander tier. Exceptional dedication and regular personal records.',
        'promotionRequirements': 'Reach 11,000 XP with sustained monthly improvement over previous records',
        'insigniaType': 'double-bar',
    },
    {
        'id': 'major',
        'name': 'MAJOR',
        'minXP': 11000,
        'maxXP': 15999,
        'tier': 9,
        'description': 'Field grade mastery. Dominating endurance, power, and active recovery.',
        'promotionRequirements': 'Accumulate 16,000 XP through long-distance runs and heavy sessions',
        'insigniaType': 'diamond-leaf',
    },
    {
        'id': 'colonel',
        'name': 'COLONEL',
        'minXP': 16000,
        'maxXP': 19999,
        'tier': 10,
        'description': 'Elite command tier. Long-term athletic consistency and monumental volume.',
        'promotionRequirements': 'Reach 20,000 XP with flawless streak maintenance and dedication',
        'insigniaType': 'eagle-crest',
    },
    {
        'id': 'commander',
        'name': 'COMMANDER',
        'minXP': 20000,
        'maxXP': 24999,
        'tier': 11,
        'description': 'Supreme operational readiness. Multi-discipline athletic mastery.',
        'promotionRequirements': 'Reach 25,000 XP to attain the apex rank of General',
        'insigniaType': 'winged-star',
    },
    {
        'id': 'general',
        'name': 'GENERAL',
        'minXP': 25000,
        'maxXP': 999999,
        'tier': 12,
        'description': 'Legendary pinnacle. Self-mastery and supreme personal fitness excellence.',
        'promotionRequirements': 'Maximum rank achieved. Continue pushing your own personal records!',
        'insigniaType': 'general-wreath',
    },
]


class PersonalRankingView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        from datetime import timedelta
        from django.utils import timezone
        from apps.workouts.models import WorkoutSession, PersonalRecord
        from apps.runs.models import Run

        now = timezone.now()
        start_of_week = now - timedelta(days=now.weekday())
        start_of_week = start_of_week.replace(hour=0, minute=0, second=0, microsecond=0)
        start_of_last_week = start_of_week - timedelta(days=7)
        end_of_last_week = start_of_week - timedelta(microseconds=1)

        sessions = WorkoutSession.objects.filter(user=user, is_completed=True).order_by('-start_time')
        runs = Run.objects.filter(user=user).order_by('-started_at')
        records = PersonalRecord.objects.filter(user=user).order_by('-achieved_at')

        workout_xp = 0
        this_week_workouts = 0
        last_week_workouts = 0
        this_week_volume = 0.0
        last_week_volume = 0.0
        active_weeks = set()
        recent_activities = []

        for s in sessions:
            cal = s.start_time.isocalendar()
            active_weeks.add((cal[0], cal[1]))
            dur = s.duration_seconds or 1800
            vol = s.total_volume_kg or 0.0
            vol_bonus = min(60, int(vol // 2500) * 15) if vol > 2500 else 0
            sess_xp = 100 + vol_bonus
            workout_xp += sess_xp

            if s.start_time >= start_of_week:
                this_week_workouts += 1
                this_week_volume += vol
            elif s.start_time >= start_of_last_week and s.start_time <= end_of_last_week:
                last_week_workouts += 1
                last_week_volume += vol

            if len(recent_activities) < 5:
                recent_activities.append({
                    'type': 'WORKOUT',
                    'title': s.name or 'Workout Session',
                    'xp': sess_xp,
                    'timestamp': s.start_time.isoformat(),
                    'detail': f"{int(vol)}kg volume" if vol > 0 else f"{dur // 60} min",
                })

        run_xp = 0
        this_week_run_m = 0.0
        last_week_run_m = 0.0

        for r in runs:
            dist = r.distance_meters or 0.0
            km = dist / 1000.0
            km_xp = int(km * 20)
            r_xp = 50 + km_xp
            run_xp += r_xp

            if r.started_at >= start_of_week:
                this_week_run_m += dist
            elif r.started_at >= start_of_last_week and r.started_at <= end_of_last_week:
                last_week_run_m += dist

            if len(recent_activities) < 8:
                recent_activities.append({
                    'type': 'RUN',
                    'title': r.title or 'Outdoor Run',
                    'xp': r_xp,
                    'timestamp': r.started_at.isoformat(),
                    'detail': f"{km:.1f} km distance",
                })

        pr_xp = records.count() * 100
        streak_count = max(len(active_weeks), 2)
        streak_xp = streak_count * 25
        goals_xp = 250

        total_xp = workout_xp + run_xp + pr_xp + streak_xp + goals_xp
        total_xp = max(total_xp, 450)

        current_rank = MILITARY_RANKS[0]
        next_rank = None
        for i in range(len(MILITARY_RANKS) - 1, -1, -1):
            if total_xp >= MILITARY_RANKS[i]['minXP']:
                current_rank = MILITARY_RANKS[i]
                if i < len(MILITARY_RANKS) - 1:
                    next_rank = MILITARY_RANKS[i + 1]
                break

        if next_rank:
            xp_in_tier = total_xp - current_rank['minXP']
            tier_span = next_rank['minXP'] - current_rank['minXP']
            progress_pct = min(100, max(0, int((xp_in_tier / tier_span) * 100)))
            xp_to_next = max(0, next_rank['minXP'] - total_xp)
        else:
            progress_pct = 100
            xp_to_next = 0
            xp_in_tier = total_xp - current_rank['minXP']
            tier_span = 0

        encouraging_insights = []
        workout_delta = this_week_workouts - last_week_workouts
        if this_week_workouts > last_week_workouts:
            workout_pct = int((workout_delta / max(1, last_week_workouts)) * 100)
            encouraging_insights.append(f"This week you completed {this_week_workouts} workouts (+{workout_pct}% vs last week)!")
        elif this_week_workouts > 0 and this_week_workouts == last_week_workouts:
            encouraging_insights.append(f"Solid rhythm: matched your previous pace of {this_week_workouts} weekly sessions.")
        elif this_week_workouts > 0:
            encouraging_insights.append(f"Strong dedication: {this_week_workouts} workouts completed so far this week.")

        this_week_km = round(this_week_run_m / 1000.0, 1)
        last_week_km = round(last_week_run_m / 1000.0, 1)
        if this_week_km > last_week_km:
            delta_km = round(this_week_km - last_week_km, 1)
            encouraging_insights.append(f"You ran {delta_km} km farther than your previous weekly total.")
        elif this_week_km > 0:
            encouraging_insights.append(f"Recorded {this_week_km} km in endurance running this week.")

        if records.count() > 0:
            encouraging_insights.append(f"Lifetime performance: {records.count()} Personal Record milestones achieved.")

        if not encouraging_insights:
            encouraging_insights.append("Focus on yourself: every workout builds personal mastery.")

        profile = getattr(user, 'profile', None)
        target_days = profile.days_per_week if profile else 4

        return Response({
            'totalXP': total_xp,
            'currentRank': current_rank,
            'nextRank': next_rank,
            'progressPercentage': progress_pct,
            'xpInCurrentTier': xp_in_tier,
            'xpRequiredForTier': tier_span,
            'xpToNextRank': xp_to_next,
            'streak': {
                'weekStreak': streak_count,
                'targetDaysPerWeek': target_days,
                'workoutsThisWeek': this_week_workouts,
            },
            'performanceComparison': {
                'thisWeekWorkouts': this_week_workouts,
                'lastWeekWorkouts': last_week_workouts,
                'thisWeekVolumeKg': round(this_week_volume),
                'lastWeekVolumeKg': round(last_week_volume),
                'thisWeekRunKm': this_week_km,
                'lastWeekRunKm': last_week_km,
                'encouragingInsights': encouraging_insights,
            },
            'xpBreakdown': {
                'workouts': workout_xp,
                'runs': run_xp,
                'personalRecords': pr_xp,
                'streaks': streak_xp,
                'goals': goals_xp,
            },
            'recentXPActivities': recent_activities,
            'allRanks': MILITARY_RANKS,
        }, status=status.HTTP_200_OK)


