from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.utils import timezone
from apps.authentication.models import User
from apps.exercises.models import Exercise, ExerciseType, MuscleGroup
from .models import Routine, WorkoutSession, WorkoutSet, PersonalRecord

class WorkoutTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='workout@fittrack.app',
            password='TestPassword123!'
        )
        self.client.force_authenticate(user=self.user)
        self.exercise = Exercise.objects.create(
            name='Barbell Deadlift',
            type=ExerciseType.GYM,
            primary_muscle=MuscleGroup.BACK,
            muscle_groups=[MuscleGroup.BACK, MuscleGroup.LEGS],
            equipment=['barbell'],
            instructions=['Lift bar from floor']
        )
        self.routine_url = reverse('routine-list-create')
        self.session_url = reverse('workout-list-create')
        self.records_url = reverse('records-list')

    def test_create_routine(self):
        payload = {
            'name': 'Deadlift Day',
            'description': 'Heavy pulls',
            'exercises': [
                {
                    'exerciseId': str(self.exercise.id),
                    'orderIndex': 1,
                    'targetSets': 4,
                    'targetReps': 5,
                    'targetRestSec': 120
                }
            ]
        }
        response = self.client.post(self.routine_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'Deadlift Day')
        self.assertEqual(len(response.data['exercises']), 1)

    def test_log_workout_session_and_record_pr(self):
        now = timezone.now()
        payload = {
            'name': 'Deadlift PR Session',
            'startTime': now.isoformat(),
            'endTime': now.isoformat(),
            'durationSeconds': 3600,
            'totalVolumeKg': 1000.0,
            'isCompleted': True,
            'sets': [
                {
                    'exerciseId': str(self.exercise.id),
                    'setNumber': 1,
                    'weightKg': 100.0,
                    'reps': 5,
                    'isCompleted': True
                },
                {
                    'exerciseId': str(self.exercise.id),
                    'setNumber': 2,
                    'weightKg': 120.0,
                    'reps': 5,
                    'isCompleted': True
                }
            ]
        }
        response = self.client.post(self.session_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'Deadlift PR Session')
        self.assertEqual(len(response.data['sets']), 2)

        # Personal Record should be automatically updated for max weight 120kg
        records_resp = self.client.get(self.records_url)
        self.assertEqual(records_resp.status_code, status.HTTP_200_OK)
        self.assertTrue(len(records_resp.data) >= 1)
        pr = records_resp.data[0]
        self.assertEqual(pr['value'], 120.0)
