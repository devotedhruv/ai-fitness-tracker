import uuid
from django.db import models
from django.conf import settings
from apps.exercises.models import Exercise

class SkillBranch(models.TextChoices):
    PUSH = 'PUSH', 'Push'
    PULL = 'PULL', 'Pull'
    LEGS = 'LEGS', 'Legs'
    CORE = 'CORE', 'Core'
    HANDSTAND = 'HANDSTAND', 'Handstand'

class ExerciseProgression(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    skill = models.CharField(max_length=20, choices=SkillBranch.choices, db_index=True)
    level = models.PositiveSmallIntegerField()
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE, related_name='progressions')
    unlock_criteria = models.CharField(max_length=255)
    target_sets = models.PositiveSmallIntegerField(default=3)
    target_reps = models.PositiveSmallIntegerField(default=10)
    target_hold_sec = models.PositiveSmallIntegerField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('skill', 'level')
        ordering = ['skill', 'level']

    def __str__(self):
        return f"{self.skill} Lvl {self.level}: {self.exercise.name}"

class UserProgressionState(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='progressions')
    skill = models.CharField(max_length=20, choices=SkillBranch.choices)
    current_level = models.PositiveSmallIntegerField(default=1)
    unlocked_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'skill')

    def __str__(self):
        return f"{self.user.email} - {self.skill} Lvl {self.current_level}"
