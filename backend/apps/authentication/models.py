import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email address is required')
        email = self.normalize_email(email).lower()
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, db_index=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email

class UserProfile(models.Model):
    class UnitSystem(models.TextChoices):
        METRIC = 'METRIC', 'Metric'
        IMPERIAL = 'IMPERIAL', 'Imperial'

    class ExperienceLevel(models.TextChoices):
        BEGINNER = 'BEGINNER', 'Beginner'
        INTERMEDIATE = 'INTERMEDIATE', 'Intermediate'
        ADVANCED = 'ADVANCED', 'Advanced'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    display_name = models.CharField(max_length=150, default='Athlete')
    username = models.CharField(max_length=50, unique=True, null=True, blank=True, db_index=True)
    avatar_url = models.TextField(blank=True, default='')
    bio = models.CharField(max_length=280, blank=True, default='')
    instagram_handle = models.CharField(max_length=100, blank=True, default='')
    x_handle = models.CharField(max_length=100, blank=True, default='')
    strava_url = models.CharField(max_length=255, blank=True, default='')
    location = models.CharField(max_length=120, blank=True, default='')
    units = models.CharField(max_length=10, choices=UnitSystem.choices, default=UnitSystem.METRIC)
    experience_level = models.CharField(max_length=15, choices=ExperienceLevel.choices, default=ExperienceLevel.BEGINNER)
    fitness_goal = models.CharField(max_length=255, blank=True, null=True)
    days_per_week = models.PositiveSmallIntegerField(default=3)
    equipment = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        handle = f" (@{self.username})" if self.username else ""
        return f"{self.display_name}{handle} ({self.user.email})"
