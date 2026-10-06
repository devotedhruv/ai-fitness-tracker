from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers
import datetime

@extend_schema(
    responses={
        200: inline_serializer(
            name='HealthCheckResponse',
            fields={
                'status': serializers.CharField(),
                'service': serializers.CharField(),
                'timestamp': serializers.DateTimeField(),
            }
        )
    }
)
@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    return Response({
        'status': 'ok',
        'service': 'fittrack-django',
        'timestamp': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    })
