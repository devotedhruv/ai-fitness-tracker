from rest_framework import views, status, permissions
from rest_framework.response import Response
from django.db.models import Q
from drf_spectacular.utils import extend_schema, OpenApiParameter
from .models import Exercise, ExerciseType, MuscleGroup
from .serializers import ExerciseSerializer
import math

class ExerciseListView(views.APIView):
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        parameters=[
            OpenApiParameter('search', str, description='Search exercise by name'),
            OpenApiParameter('type', str, enum=ExerciseType.values, description='GYM or CALISTHENICS'),
            OpenApiParameter('muscleGroup', str, enum=MuscleGroup.values, description='Filter by muscle group'),
            OpenApiParameter('equipment', str, description='Filter by equipment keyword'),
            OpenApiParameter('page', int, default=1),
            OpenApiParameter('limit', int, default=20),
        ],
        responses={200: ExerciseSerializer(many=True)},
    )
    def get(self, request):
        queryset = Exercise.objects.all()

        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(name__icontains=search.strip())

        ex_type = request.query_params.get('type')
        if ex_type:
            queryset = queryset.filter(type=ex_type.upper())

        muscle_group = request.query_params.get('muscleGroup')
        if muscle_group:
            mg = muscle_group.upper()
            queryset = queryset.filter(
                Q(primary_muscle=mg) | Q(muscle_groups__contains=[mg])
            )

        equipment = request.query_params.get('equipment')
        if equipment:
            queryset = queryset.filter(equipment__contains=[equipment])

        total = queryset.count()
        page = max(1, int(request.query_params.get('page', 1)))
        limit = min(100, max(1, int(request.query_params.get('limit', 20))))

        start = (page - 1) * limit
        end = start + limit
        paginated_items = queryset[start:end]

        serializer = ExerciseSerializer(paginated_items, many=True)

        return Response({
            'items': serializer.data,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total,
                'totalPages': math.ceil(total / limit) if total > 0 else 0,
            }
        }, status=status.HTTP_200_OK)

class ExerciseDetailView(views.APIView):
    permission_classes = [permissions.AllowAny]

    @extend_schema(responses={200: ExerciseSerializer})
    def get(self, request, pk):
        try:
            exercise = Exercise.objects.get(pk=pk)
            serializer = ExerciseSerializer(exercise)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exercise.DoesNotExist:
            return Response({'code': 'NOT_FOUND', 'message': f'Exercise with ID {pk} not found'}, status=status.HTTP_404_NOT_FOUND)
