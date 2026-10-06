from rest_framework import views, status, permissions
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema
from apps.workouts.models import WorkoutSession, PersonalRecord
from apps.runs.models import Run
from apps.workouts.serializers import WorkoutSessionSerializer, PersonalRecordSerializer
from apps.runs.serializers import RunSerializer
from .serializers import UserDetailSerializer

class UserDataExportView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(responses={200: dict})
    def get(self, request):
        user = request.user
        workouts = WorkoutSession.objects.filter(user=user).prefetch_related('sets')
        records = PersonalRecord.objects.filter(user=user)
        runs = Run.objects.filter(user=user).prefetch_related('splits')

        export_data = {
            'profile': UserDetailSerializer(user).data,
            'workouts': WorkoutSessionSerializer(workouts, many=True).data,
            'personalRecords': PersonalRecordSerializer(records, many=True).data,
            'runs': RunSerializer(runs, many=True).data,
            'exportTimestamp': request.user.updated_at.isoformat() if hasattr(request.user, 'updated_at') else None,
        }
        return Response(export_data, status=status.HTTP_200_OK)
