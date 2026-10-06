from rest_framework import views, status, permissions
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema
from .models import Run
from .serializers import RunSerializer

class RunListCreateView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(responses={200: RunSerializer(many=True)})
    def get(self, request):
        runs = Run.objects.filter(user=request.user).prefetch_related('splits')
        serializer = RunSerializer(runs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(request=RunSerializer, responses={201: RunSerializer})
    def post(self, request):
        serializer = RunSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            run = serializer.save()
            return Response(RunSerializer(run).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
