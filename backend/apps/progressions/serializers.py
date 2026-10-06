from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from .models import ExerciseProgression, UserProgressionState

class ProgressionNodeSerializer(serializers.ModelSerializer):
    exerciseId = serializers.UUIDField(source='exercise.id')
    exerciseName = serializers.CharField(source='exercise.name')
    primaryMuscle = serializers.CharField(source='exercise.primary_muscle')
    unlockCriteria = serializers.CharField(source='unlock_criteria')
    targetSets = serializers.IntegerField(source='target_sets')
    targetReps = serializers.IntegerField(source='target_reps')
    targetHoldSec = serializers.IntegerField(source='target_hold_sec', allow_null=True)
    status = serializers.SerializerMethodField()

    class Meta:
        model = ExerciseProgression
        fields = [
            'id',
            'level',
            'skill',
            'exerciseId',
            'exerciseName',
            'primaryMuscle',
            'unlockCriteria',
            'targetSets',
            'targetReps',
            'targetHoldSec',
            'status',
        ]

    @extend_schema_field(serializers.CharField())
    def get_status(self, obj):
        user_level = self.context.get('user_levels', {}).get(obj.skill, 1)
        if obj.level < user_level:
            return 'MASTERED'
        elif obj.level == user_level:
            return 'CURRENT'
        return 'LOCKED'
