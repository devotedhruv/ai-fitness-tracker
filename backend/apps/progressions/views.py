from rest_framework import views, status, permissions, serializers
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, inline_serializer
from .models import ExerciseProgression, UserProgressionState, SkillBranch
from .serializers import ProgressionNodeSerializer

class ProgressionTreeSerializer(serializers.Serializer):
    skill = serializers.CharField()
    currentLevel = serializers.IntegerField()
    totalLevels = serializers.IntegerField()
    nodes = ProgressionNodeSerializer(many=True)

class ProgressionEvaluateRequestSerializer(serializers.Serializer):
    skill = serializers.ChoiceField(choices=SkillBranch.choices)

class ProgressionTreesView(views.APIView):
    permission_classes = [permissions.AllowAny]

    @extend_schema(responses={200: ProgressionTreeSerializer(many=True)})
    def get(self, request):
        user_levels = {}
        if request.user and request.user.is_authenticated:
            states = UserProgressionState.objects.filter(user=request.user)
            user_levels = {s.skill: s.current_level for s in states}

        trees = []
        for skill in SkillBranch.values:
            nodes = ExerciseProgression.objects.filter(skill=skill).select_related('exercise').order_by('level')
            serializer = ProgressionNodeSerializer(nodes, many=True, context={'user_levels': user_levels})
            current_lvl = user_levels.get(skill, 1)

            trees.append({
                'skill': skill,
                'currentLevel': current_lvl,
                'totalLevels': nodes.count(),
                'nodes': serializer.data,
            })

        return Response(trees, status=status.HTTP_200_OK)

class ProgressionEvaluateView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        request=ProgressionEvaluateRequestSerializer,
        responses={
            200: inline_serializer(
                name='ProgressionEvaluateResponse',
                fields={
                    'unlocked': serializers.BooleanField(),
                    'currentLevel': serializers.IntegerField(required=False),
                    'previousLevel': serializers.IntegerField(required=False),
                    'newLevel': serializers.IntegerField(required=False),
                    'required': serializers.CharField(required=False),
                    'loggedQualifyingSets': serializers.IntegerField(required=False),
                    'message': serializers.CharField(),
                }
            )
        }
    )
    def post(self, request):
        serializer = ProgressionEvaluateRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'code': 'VALIDATION_ERROR', 'message': 'Invalid skill branch', 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        skill = serializer.validated_data['skill']

        state, _ = UserProgressionState.objects.get_or_create(user=request.user, skill=skill, defaults={'current_level': 1})
        current_node = ExerciseProgression.objects.filter(skill=skill, level=state.current_level).first()

        if not current_node:
            return Response({'unlocked': False, 'message': 'Already at max mastery level'}, status=status.HTTP_200_OK)

        # Look up recent completed sets for this exercise from workouts
        from apps.workouts.models import WorkoutSet
        recent_sets = WorkoutSet.objects.filter(
            session__user=request.user,
            session__is_completed=True,
            exercise_id=current_node.exercise_id,
            is_completed=True,
            reps__gte=current_node.target_reps,
        )[:current_node.target_sets]

        if recent_sets.count() >= current_node.target_sets:
            next_level = state.current_level + 1
            has_next = ExerciseProgression.objects.filter(skill=skill, level=next_level).exists()
            if has_next:
                state.current_level = next_level
                state.save()
                return Response({
                    'unlocked': True,
                    'previousLevel': next_level - 1,
                    'newLevel': next_level,
                    'message': f"Congratulations! Level {next_level} unlocked in {skill} progression!"
                }, status=status.HTTP_200_OK)

        return Response({
            'unlocked': False,
            'currentLevel': state.current_level,
            'required': f"{current_node.target_sets} sets of {current_node.target_reps} reps",
            'loggedQualifyingSets': recent_sets.count(),
            'message': 'Keep training! Target unlock criteria not yet met.'
        }, status=status.HTTP_200_OK)
