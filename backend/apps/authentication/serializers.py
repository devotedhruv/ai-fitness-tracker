from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, UserProfile
from django.contrib.auth import authenticate

import re

class UserProfileSerializer(serializers.ModelSerializer):
    displayName = serializers.CharField(source='display_name', required=False)
    username = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    avatarUrl = serializers.CharField(source='avatar_url', required=False, allow_blank=True)
    bio = serializers.CharField(required=False, allow_blank=True)
    instagramHandle = serializers.CharField(source='instagram_handle', required=False, allow_blank=True)
    xHandle = serializers.CharField(source='x_handle', required=False, allow_blank=True)
    stravaUrl = serializers.CharField(source='strava_url', required=False, allow_blank=True)
    location = serializers.CharField(required=False, allow_blank=True)
    experienceLevel = serializers.CharField(source='experience_level', required=False)
    fitnessGoal = serializers.CharField(source='fitness_goal', required=False, allow_null=True, allow_blank=True)
    daysPerWeek = serializers.IntegerField(source='days_per_week', required=False)

    class Meta:
        model = UserProfile
        fields = [
            'id', 'displayName', 'username', 'avatarUrl', 'bio',
            'instagramHandle', 'xHandle', 'stravaUrl', 'location',
            'units', 'experienceLevel', 'fitnessGoal', 'daysPerWeek', 'equipment'
        ]

    def validate_username(self, value):
        if not value:
            return None
        value = value.strip().lower()
        if not re.match(r'^[a-z0-9_.-]{3,30}$', value):
            raise serializers.ValidationError(
                "Username must be 3-30 characters and contain only lowercase letters, numbers, underscores, hyphens, or dots."
            )
        qs = UserProfile.objects.filter(username__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("This username is already taken. Please choose another.")
        return value

class UserDetailSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'profile', 'created_at']

class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, write_only=True)
    displayName = serializers.CharField(min_length=2, required=False, default='Athlete')
    units = serializers.ChoiceField(choices=UserProfile.UnitSystem.choices, default=UserProfile.UnitSystem.METRIC)
    experienceLevel = serializers.ChoiceField(choices=UserProfile.ExperienceLevel.choices, default=UserProfile.ExperienceLevel.BEGINNER)
    fitnessGoal = serializers.CharField(required=False, allow_blank=True)
    daysPerWeek = serializers.IntegerField(min_value=1, max_value=7, default=3)
    equipment = serializers.ListField(child=serializers.CharField(), required=False, default=list)

    def validate_email(self, value):
        if User.objects.filter(email=value.lower()).exists():
            raise serializers.ValidationError("An account with this email already exists")
        return value.lower()

    def create(self, validated_data):
        email = validated_data.pop('email')
        password = validated_data.pop('password')
        display_name = validated_data.pop('displayName', 'Athlete')
        units = validated_data.pop('units', 'METRIC')
        experience_level = validated_data.pop('experienceLevel', 'BEGINNER')
        fitness_goal = validated_data.pop('fitnessGoal', None)
        days_per_week = validated_data.pop('daysPerWeek', 3)
        equipment = validated_data.pop('equipment', [])

        user = User.objects.create_user(email=email, password=password)
        UserProfile.objects.create(
            user=user,
            display_name=display_name,
            units=units,
            experience_level=experience_level,
            fitness_goal=fitness_goal,
            days_per_week=days_per_week,
            equipment=equipment,
        )

        # Initialize default progression states
        from apps.progressions.models import UserProgressionState, SkillBranch
        for skill in SkillBranch.values:
            UserProgressionState.objects.get_or_create(user=user, skill=skill, defaults={'current_level': 1})

        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get('email', '').lower()
        password = attrs.get('password')

        user = authenticate(username=email, password=password)
        if not user:
            raise serializers.ValidationError("Invalid email or password")
        if not user.is_active:
            raise serializers.ValidationError("User account is disabled")

        attrs['user'] = user
        return attrs
