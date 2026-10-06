import uuid
from django.db import models

class ExerciseType(models.TextChoices):
    GYM = 'GYM', 'Gym'
    CALISTHENICS = 'CALISTHENICS', 'Calisthenics'

class MuscleGroup(models.TextChoices):
    CHEST = 'CHEST', 'Chest'
    BACK = 'BACK', 'Back'
    LEGS = 'LEGS', 'Legs'
    SHOULDERS = 'SHOULDERS', 'Shoulders'
    BICEPS = 'BICEPS', 'Biceps'
    TRICEPS = 'TRICEPS', 'Triceps'
    CORE = 'CORE', 'Core'
    GLUTES = 'GLUTES', 'Glutes'
    FULL_BODY = 'FULL_BODY', 'Full Body'

class DifficultyLevel(models.TextChoices):
    BEGINNER = 'BEGINNER', 'Beginner'
    INTERMEDIATE = 'INTERMEDIATE', 'Intermediate'
    ADVANCED = 'ADVANCED', 'Advanced'

class MediaType(models.TextChoices):
    ANIMATION = 'ANIMATION', 'Animation'
    VECTOR = 'VECTOR', 'Vector Animation'
    VIDEO = 'VIDEO', 'Video'
    GIF = 'GIF', 'GIF'
    MODEL3D = 'MODEL3D', '3D Model'
    IMAGE = 'IMAGE', 'Static Image'

class Exercise(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200, db_index=True)
    type = models.CharField(max_length=20, choices=ExerciseType.choices, db_index=True)
    primary_muscle = models.CharField(max_length=20, choices=MuscleGroup.choices, db_index=True)
    secondary_muscles = models.JSONField(default=list, blank=True)
    muscle_groups = models.JSONField(default=list, blank=True)
    equipment = models.JSONField(default=list, blank=True)
    difficulty = models.CharField(max_length=20, choices=DifficultyLevel.choices, default=DifficultyLevel.INTERMEDIATE)
    overview = models.TextField(blank=True, default='')
    instructions = models.JSONField(default=list, blank=True)
    form_tips = models.JSONField(default=list, blank=True)
    breathing = models.CharField(max_length=500, blank=True, default='')
    common_mistakes = models.JSONField(default=list, blank=True)
    variations = models.JSONField(default=list, blank=True)
    media_url = models.URLField(max_length=500, blank=True, null=True)
    media_type = models.CharField(max_length=20, choices=MediaType.choices, default=MediaType.ANIMATION)
    animation_url = models.URLField(max_length=500, blank=True, null=True)
    video_url = models.URLField(max_length=500, blank=True, null=True)
    thumbnail_url = models.URLField(max_length=500, blank=True, null=True)
    media_source = models.CharField(max_length=100, default='NATIVE_VECTOR', blank=True)
    is_media_active = models.BooleanField(default=True)
    easier_variation_id = models.UUIDField(blank=True, null=True)
    harder_variation_id = models.UUIDField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.type})"
