from django.urls import path
from .views import ProgressionTreesView, ProgressionEvaluateView

urlpatterns = [
    path('progressions', ProgressionTreesView.as_view(), name='progression-trees'),
    path('progressions/evaluate', ProgressionEvaluateView.as_view(), name='progression-evaluate'),
]
