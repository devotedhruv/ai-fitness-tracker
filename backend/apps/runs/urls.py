from django.urls import path
from .views import RunListCreateView

urlpatterns = [
    path('runs', RunListCreateView.as_view(), name='run-list-create'),
]
