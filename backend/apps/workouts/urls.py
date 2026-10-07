from django.urls import path
from .views import RoutineListCreateView, RoutineDetailView, WorkoutSessionListCreateView, RecordsListView

urlpatterns = [
    path('routines', RoutineListCreateView.as_view(), name='routine-list-create'),
    path('routines/<uuid:pk>', RoutineDetailView.as_view(), name='routine-detail'),
    path('workouts/routines', RoutineListCreateView.as_view(), name='workouts-routine-list-create'),
    path('workouts/routines/<uuid:pk>', RoutineDetailView.as_view(), name='workouts-routine-detail'),
    path('workouts', WorkoutSessionListCreateView.as_view(), name='workout-list-create'),
    path('workouts/sessions', WorkoutSessionListCreateView.as_view(), name='workouts-sessions-list-create'),
    path('records', RecordsListView.as_view(), name='records-list'),
]
