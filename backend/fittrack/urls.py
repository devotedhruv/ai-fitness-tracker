from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from apps.core.views import health_check

urlpatterns = [
    path('', RedirectView.as_view(url='/api/docs/', permanent=False), name='root-redirect'),
    path('admin/', admin.site.urls),
    path('health', health_check, name='health-check'),


    # OpenAPI 3.0 & Swagger UI
    path('api/docs.json', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),

    # Versioned API
    path('api/v1/', include('apps.authentication.urls')),
    path('api/v1/', include('apps.exercises.urls')),
    path('api/v1/', include('apps.progressions.urls')),
    path('api/v1/', include('apps.workouts.urls')),
    path('api/v1/', include('apps.runs.urls')),
    path('api/v1/', include('apps.social.urls')),
]

if settings.MEDIA_URL:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


