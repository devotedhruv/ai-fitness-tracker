from rest_framework import status, views, permissions, serializers
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from drf_spectacular.utils import extend_schema, OpenApiResponse, inline_serializer
from .serializers import RegisterSerializer, LoginSerializer, UserDetailSerializer, UserProfileSerializer
from .models import User

class TokenRefreshRequestSerializer(serializers.Serializer):
    refreshToken = serializers.CharField(required=True)

class TokenRefreshResponseSerializer(serializers.Serializer):
    tokens = inline_serializer(
        name='TokensPayload',
        fields={
            'accessToken': serializers.CharField(),
            'refreshToken': serializers.CharField(),
            'expiresIn': serializers.IntegerField(),
        }
    )

class LogoutRequestSerializer(serializers.Serializer):
    refreshToken = serializers.CharField(required=False)

class ForgotPasswordRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

class MessageResponseSerializer(serializers.Serializer):
    message = serializers.CharField()

class RegisterView(views.APIView):
    permission_classes = [permissions.AllowAny]

    @extend_schema(request=RegisterSerializer, responses={201: UserDetailSerializer})
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserDetailSerializer(user).data,
                'tokens': {
                    'accessToken': str(refresh.access_token),
                    'refreshToken': str(refresh),
                    'expiresIn': 900,
                }
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(views.APIView):
    permission_classes = [permissions.AllowAny]

    @extend_schema(request=LoginSerializer, responses={200: UserDetailSerializer})
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserDetailSerializer(user).data,
                'tokens': {
                    'accessToken': str(refresh.access_token),
                    'refreshToken': str(refresh),
                    'expiresIn': 900,
                }
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)

class CustomTokenRefreshView(views.APIView):
    permission_classes = [permissions.AllowAny]

    @extend_schema(request=TokenRefreshRequestSerializer, responses={200: TokenRefreshResponseSerializer})
    def post(self, request):
        token = request.data.get('refreshToken')
        if not token:
            return Response({'code': 'VALIDATION_ERROR', 'message': 'Refresh token is required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            refresh = RefreshToken(token)
            new_access_token = str(refresh.access_token)
            refresh.set_jti()
            refresh.set_exp()
            new_refresh_token = str(refresh)

            return Response({
                'tokens': {
                    'accessToken': new_access_token,
                    'refreshToken': new_refresh_token,
                    'expiresIn': 900,
                }
            }, status=status.HTTP_200_OK)
        except Exception:
            return Response({'code': 'UNAUTHORIZED', 'message': 'Invalid or expired refresh token'}, status=status.HTTP_401_UNAUTHORIZED)

class LogoutView(views.APIView):
    permission_classes = [permissions.AllowAny]

    @extend_schema(request=LogoutRequestSerializer, responses={200: MessageResponseSerializer})
    def post(self, request):
        token = request.data.get('refreshToken')
        if token:
            try:
                refresh = RefreshToken(token)
                refresh.blacklist()
            except Exception:
                pass
        return Response({'message': 'Logged out successfully'}, status=status.HTTP_200_OK)

class ForgotPasswordView(views.APIView):
    permission_classes = [permissions.AllowAny]

    @extend_schema(request=ForgotPasswordRequestSerializer, responses={200: MessageResponseSerializer})
    def post(self, request):
        return Response({'message': 'If an account exists with this email, a password reset link has been dispatched.'}, status=status.HTTP_200_OK)

class UserProfileView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(responses={200: UserDetailSerializer})
    def get(self, request):
        serializer = UserDetailSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(request=UserProfileSerializer, responses={200: UserProfileSerializer})
    def patch(self, request):
        profile = getattr(request.user, 'profile', None)
        if not profile:
            from .models import UserProfile
            profile = UserProfile.objects.create(user=request.user)

        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(responses={200: MessageResponseSerializer})
    def delete(self, request):
        user = request.user
        user.delete()
        return Response({'message': 'Account and all associated personal fitness data permanently deleted.'}, status=status.HTTP_200_OK)


class ChangePasswordView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        current_password = request.data.get('currentPassword')
        new_password = request.data.get('newPassword')
        if not new_password or len(new_password) < 6:
            return Response({'message': 'New password must be at least 6 characters long.'}, status=status.HTTP_400_BAD_REQUEST)
        if current_password and not request.user.check_password(current_password):
            return Response({'message': 'Current password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)
        request.user.set_password(new_password)
        request.user.save()
        return Response({'message': 'Password changed successfully.'}, status=status.HTTP_200_OK)
