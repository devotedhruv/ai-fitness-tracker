from rest_framework import serializers
from .models import Routine, RoutineExercise, WorkoutSession, WorkoutSet, PersonalRecord, BodyMetric, Goal
from apps.exercises.serializers import ExerciseSerializer

class RoutineExerciseSerializer(serializers.ModelSerializer):
    exercise = ExerciseSerializer(read_only=True)
    exerciseId = serializers.UUIDField(write_only=True, source='exercise_id')
    targetSets = serializers.IntegerField(source='target_sets', default=3)
    targetReps = serializers.IntegerField(source='target_reps', default=10)
    targetRestSec = serializers.IntegerField(source='target_rest_sec', default=90)
    targetDuration = serializers.IntegerField(source='target_duration', default=0, required=False)
    targetWeight = serializers.FloatField(source='target_weight', default=0.0, required=False)
    supersetGroupId = serializers.CharField(source='superset_group_id', allow_null=True, required=False)

    class Meta:
        model = RoutineExercise
        fields = [
            'id', 'exercise', 'exerciseId', 'order_index', 'supersetGroupId',
            'targetSets', 'targetReps', 'targetRestSec', 'targetDuration', 'targetWeight', 'notes'
        ]

class RoutineSerializer(serializers.ModelSerializer):
    exercises = RoutineExerciseSerializer(many=True, required=False)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)

    class Meta:
        model = Routine
        fields = ['id', 'name', 'category', 'description', 'is_public', 'exercises', 'createdAt', 'updatedAt']

    def create(self, validated_data):
        exercises_data = validated_data.pop('exercises', [])
        user = self.context['request'].user
        routine = Routine.objects.create(user=user, **validated_data)

        for i, ex_data in enumerate(exercises_data, start=1):
            RoutineExercise.objects.create(
                routine=routine,
                order_index=i,
                **ex_data
            )
        return routine

    def update(self, instance, validated_data):
        exercises_data = validated_data.pop('exercises', None)
        instance.name = validated_data.get('name', instance.name)
        instance.category = validated_data.get('category', instance.category)
        instance.description = validated_data.get('description', instance.description)
        instance.is_public = validated_data.get('is_public', instance.is_public)
        instance.save()

        if exercises_data is not None:
            instance.exercises.all().delete()
            for i, ex_data in enumerate(exercises_data, start=1):
                RoutineExercise.objects.create(
                    routine=instance,
                    order_index=i,
                    **ex_data
                )
        return instance

class WorkoutSetSerializer(serializers.ModelSerializer):
    exerciseId = serializers.UUIDField(source='exercise_id')
    weightKg = serializers.FloatField(source='weight_kg', default=0.0)
    reps = serializers.IntegerField(default=0)
    holdDurationSec = serializers.IntegerField(source='hold_duration_sec', allow_null=True, required=False)
    isCompleted = serializers.BooleanField(source='is_completed', default=True)
    isWarmup = serializers.BooleanField(source='is_warmup', default=False)

    class Meta:
        model = WorkoutSet
        fields = ['id', 'exerciseId', 'set_number', 'weightKg', 'reps', 'holdDurationSec', 'isCompleted', 'isWarmup', 'rpe', 'notes']

class WorkoutSessionSerializer(serializers.ModelSerializer):
    sets = WorkoutSetSerializer(many=True, required=False)
    routineId = serializers.UUIDField(source='routine_id', allow_null=True, required=False)
    startTime = serializers.DateTimeField(source='start_time')
    endTime = serializers.DateTimeField(source='end_time', allow_null=True, required=False)
    durationSeconds = serializers.IntegerField(source='duration_seconds', default=0)
    totalVolumeKg = serializers.FloatField(source='total_volume_kg', default=0.0)

    class Meta:
        model = WorkoutSession
        fields = ['id', 'routineId', 'name', 'startTime', 'endTime', 'durationSeconds', 'totalVolumeKg', 'notes', 'is_completed', 'sets']

    def create(self, validated_data):
        sets_data = validated_data.pop('sets', [])
        user = self.context['request'].user
        session = WorkoutSession.objects.create(user=user, **validated_data)

        calculated_volume = 0.0
        for s in sets_data:
            w_set = WorkoutSet.objects.create(session=session, **s)
            if w_set.is_completed and not w_set.is_warmup:
                calculated_volume += (w_set.weight_kg * w_set.reps)

        if calculated_volume > 0:
            session.total_volume_kg = calculated_volume
            session.save(update_fields=['total_volume_kg'])

        # Auto-detect and store Personal Records
        for s in sets_data:
            if s.get('is_completed', True) and not s.get('is_warmup', False):
                weight = s.get('weight_kg', 0.0)
                ex_id = s.get('exercise_id')
                if weight > 0 and ex_id:
                    existing_pr = PersonalRecord.objects.filter(
                        user=user,
                        exercise_id=ex_id,
                        type=PersonalRecord.PRType.MAX_WEIGHT
                    ).first()

                    if not existing_pr or weight > existing_pr.value:
                        prev = existing_pr.value if existing_pr else None
                        if existing_pr:
                            existing_pr.previous_value = prev
                            existing_pr.value = weight
                            existing_pr.session_id = session.id
                            existing_pr.save()
                        else:
                            PersonalRecord.objects.create(
                                user=user,
                                exercise_id=ex_id,
                                type=PersonalRecord.PRType.MAX_WEIGHT,
                                value=weight,
                                previous_value=prev,
                                session_id=session.id
                            )

        return session

class PersonalRecordSerializer(serializers.ModelSerializer):
    exerciseName = serializers.CharField(source='exercise.name', read_only=True)
    achievedAt = serializers.DateTimeField(source='achieved_at')

    class Meta:
        model = PersonalRecord
        fields = ['id', 'exercise_id', 'exerciseName', 'type', 'value', 'previous_value', 'achievedAt', 'session_id']
