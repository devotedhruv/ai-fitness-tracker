from rest_framework import serializers
from .models import Run, RunSplit

class RunSplitSerializer(serializers.ModelSerializer):
    splitNumber = serializers.IntegerField(source='split_number')
    distanceMeters = serializers.FloatField(source='distance_meters')
    durationSeconds = serializers.IntegerField(source='duration_seconds')
    paceSecKm = serializers.IntegerField(source='pace_sec_km')
    elevationChange = serializers.FloatField(source='elevation_change')

    class Meta:
        model = RunSplit
        fields = ['id', 'splitNumber', 'distanceMeters', 'durationSeconds', 'paceSecKm', 'elevationChange']

class RunSerializer(serializers.ModelSerializer):
    splits = RunSplitSerializer(many=True, required=False)
    distanceMeters = serializers.FloatField(source='distance_meters')
    durationSeconds = serializers.IntegerField(source='duration_seconds')
    avgPaceSecKm = serializers.IntegerField(source='avg_pace_sec_km')
    elevationGainMeters = serializers.FloatField(source='elevation_gain_meters', default=0.0)
    caloriesBurned = serializers.IntegerField(source='calories_burned', allow_null=True, required=False)
    startedAt = serializers.DateTimeField(source='started_at')
    completedAt = serializers.DateTimeField(source='completed_at')

    class Meta:
        model = Run
        fields = [
            'id', 'title', 'distanceMeters', 'durationSeconds', 'avgPaceSecKm',
            'elevationGainMeters', 'caloriesBurned', 'polyline', 'startedAt',
            'completedAt', 'notes', 'splits'
        ]

    def create(self, validated_data):
        splits_data = validated_data.pop('splits', [])
        user = self.context['request'].user
        run = Run.objects.create(user=user, **validated_data)

        for s in splits_data:
            RunSplit.objects.create(run=run, **s)

        return run
