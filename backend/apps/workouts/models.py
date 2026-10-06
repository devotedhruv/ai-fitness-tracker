import uuid
from django.db import models
from django.conf import settings
from apps.exercises.models import Exercise

class Routine(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='routines')
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=50, blank=True, null=True, default='Custom Routine')
    description = models.TextField(blank=True, null=True)
    is_public = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.user.email})"

class RoutineExercise(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    routine = models.ForeignKey(Routine, on_delete=models.CASCADE, related_name='exercises')
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE, related_name='routine_exercises')
    order_index = models.PositiveSmallIntegerField(default=1)
    superset_group_id = models.CharField(max_length=50, blank=True, null=True)
    target_sets = models.PositiveSmallIntegerField(default=3)
    target_reps = models.PositiveSmallIntegerField(default=10)
    target_rest_sec = models.PositiveSmallIntegerField(default=90)
    target_duration = models.PositiveSmallIntegerField(default=0, blank=True, null=True)
    target_weight = models.FloatField(default=0.0, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['order_index']

class WorkoutSession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='workout_sessions')
    routine = models.ForeignKey(Routine, on_delete=models.SET_NULL, null=True, blank=True, related_name='workouts')
    name = models.CharField(max_length=200, default='Workout')
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(blank=True, null=True)
    duration_seconds = models.PositiveIntegerField(default=0)
    total_volume_kg = models.FloatField(default=0.0)
    notes = models.TextField(blank=True, null=True)
    is_completed = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-start_time']

class WorkoutSet(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(WorkoutSession, on_delete=models.CASCADE, related_name='sets')
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE, related_name='workout_sets')
    set_number = models.PositiveSmallIntegerField(default=1)
    weight_kg = models.FloatField(default=0.0)
    reps = models.PositiveSmallIntegerField(default=0)
    hold_duration_sec = models.PositiveSmallIntegerField(blank=True, null=True)
    is_completed = models.BooleanField(default=True)
    is_warmup = models.BooleanField(default=False)
    rpe = models.FloatField(blank=True, null=True)
    notes = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['set_number']

class PersonalRecord(models.Model):
    class PRType(models.TextChoices):
        MAX_WEIGHT = 'MAX_WEIGHT', 'Max Weight'
        MAX_REPS = 'MAX_REPS', 'Max Reps'
        MAX_VOLUME = 'MAX_VOLUME', 'Max Volume'
        ESTIMATED_1RM = 'ESTIMATED_1RM', 'Estimated 1RM'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='records')
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE, related_name='records')
    type = models.CharField(max_length=20, choices=PRType.choices)
    value = models.FloatField()
    previous_value = models.FloatField(blank=True, null=True)
    achieved_at = models.DateTimeField(auto_now_add=True)
    session_id = models.UUIDField(blank=True, null=True)

    class Meta:
        ordering = ['-achieved_at']

class BodyMetric(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='body_metrics')
    weight_kg = models.FloatField()
    body_fat_percentage = models.FloatField(blank=True, null=True)
    logged_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-logged_at']

class Goal(models.Model):
    class GoalType(models.TextChoices):
        WEEKLY_WORKOUTS = 'WEEKLY_WORKOUTS', 'Weekly Workouts'
        WEEKLY_DISTANCE_KM = 'WEEKLY_DISTANCE_KM', 'Weekly Distance (km)'
        CALORIES = 'CALORIES', 'Calories'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='goals')
    type = models.CharField(max_length=30, choices=GoalType.choices)
    target_value = models.FloatField()
    current_value = models.FloatField(default=0.0)
    week_start_date = models.DateField()
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
