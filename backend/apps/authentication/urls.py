from django.urls import path
from .views import (
    RegisterView,
    LoginView,
    CustomTokenRefreshView,
    LogoutView,
    ForgotPasswordView,
    UserProfileView,
    ChangePasswordView,
)
from .export_views import UserDataExportView

urlpatterns = [
    path('auth/register', RegisterView.as_view(), name='auth-register'),
    path('auth/login', LoginView.as_view(), name='auth-login'),
    path('auth/refresh', CustomTokenRefreshView.as_view(), name='auth-refresh'),
    path('auth/logout', LogoutView.as_view(), name='auth-logout'),
    path('auth/forgot-password', ForgotPasswordView.as_view(), name='auth-forgot-password'),
    path('auth/change-password', ChangePasswordView.as_view(), name='auth-change-password'),
    path('users/me', UserProfileView.as_view(), name='user-me'),
    path('users/export', UserDataExportView.as_view(), name='user-export'),
]


