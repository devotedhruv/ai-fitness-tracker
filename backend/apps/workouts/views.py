from rest_framework import views, status, permissions
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema
from .models import Routine, WorkoutSession, PersonalRecord
from .serializers import RoutineSerializer, WorkoutSessionSerializer, PersonalRecordSerializer

class RoutineListCreateView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(responses={200: RoutineSerializer(many=True)})
    def get(self, request):
        routines = Routine.objects.filter(user=request.user).prefetch_related('exercises__exercise')
        serializer = RoutineSerializer(routines, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(request=RoutineSerializer, responses={201: RoutineSerializer})
    def post(self, request):
        serializer = RoutineSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            routine = serializer.save()
            return Response(RoutineSerializer(routine).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RoutineDetailView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(responses={200: RoutineSerializer})
    def get(self, request, pk):
        try:
            routine = Routine.objects.prefetch_related('exercises__exercise').get(pk=pk, user=request.user)
            return Response(RoutineSerializer(routine).data, status=status.HTTP_200_OK)
        except Routine.DoesNotExist:
            return Response({'code': 'NOT_FOUND', 'message': 'Routine not found'}, status=status.HTTP_404_NOT_FOUND)

    @extend_schema(request=RoutineSerializer, responses={200: RoutineSerializer})
    def put(self, request, pk):
        try:
            routine = Routine.objects.get(pk=pk, user=request.user)
        except Routine.DoesNotExist:
            return Response({'code': 'NOT_FOUND', 'message': 'Routine not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = RoutineSerializer(routine, data=request.data, context={'request': request}, partial=True)
        if serializer.is_valid():
            updated = serializer.save()
            return Response(RoutineSerializer(updated).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(request=RoutineSerializer, responses={200: RoutineSerializer})
    def patch(self, request, pk):
        return self.put(request, pk)

    def delete(self, request, pk):
        try:
            routine = Routine.objects.get(pk=pk, user=request.user)
            routine.delete()
            return Response({'message': 'Routine deleted successfully'}, status=status.HTTP_200_OK)
        except Routine.DoesNotExist:
            return Response({'code': 'NOT_FOUND', 'message': 'Routine not found'}, status=status.HTTP_404_NOT_FOUND)

class WorkoutSessionListCreateView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(responses={200: WorkoutSessionSerializer(many=True)})
    def get(self, request):
        sessions = WorkoutSession.objects.filter(user=request.user).prefetch_related('sets')
        serializer = WorkoutSessionSerializer(sessions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(request=WorkoutSessionSerializer, responses={201: WorkoutSessionSerializer})
    def post(self, request):
        serializer = WorkoutSessionSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            session = serializer.save()
            return Response(WorkoutSessionSerializer(session).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RecordsListView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(responses={200: PersonalRecordSerializer(many=True)})
    def get(self, request):
        records = PersonalRecord.objects.filter(user=request.user).select_related('exercise')
        serializer = PersonalRecordSerializer(records, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
