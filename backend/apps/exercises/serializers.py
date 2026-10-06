from rest_framework import serializers
from .models import Exercise

class ExerciseSerializer(serializers.ModelSerializer):
    primaryMuscle = serializers.CharField(source='primary_muscle')
    secondaryMuscles = serializers.ListField(source='secondary_muscles', read_only=True)
    muscleGroups = serializers.ListField(source='muscle_groups', read_only=True)
    formTips = serializers.ListField(source='form_tips', read_only=True)
    commonMistakes = serializers.ListField(source='common_mistakes', read_only=True)
    mediaUrl = serializers.URLField(source='media_url', read_only=True, allow_null=True)
    media = serializers.SerializerMethodField()
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)

    class Meta:
        model = Exercise
        fields = [
            'id',
            'name',
            'type',
            'primaryMuscle',
            'secondaryMuscles',
            'muscleGroups',
            'equipment',
            'difficulty',
            'overview',
            'instructions',
            'formTips',
            'breathing',
            'commonMistakes',
            'variations',
            'mediaUrl',
            'media',
            'createdAt',
            'updatedAt',
        ]

    def get_media(self, obj):
        return {
            'type': obj.media_type,
            'animationUrl': obj.animation_url,
            'videoUrl': obj.video_url,
            'thumbnailUrl': obj.thumbnail_url,
            'mediaUrl': obj.media_url,
            'source': obj.media_source,
            'isActive': obj.is_media_active,
        }
