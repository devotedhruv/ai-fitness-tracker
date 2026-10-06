from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Exercise, ExerciseType, MuscleGroup

class ExerciseTests(APITestCase):
    def setUp(self):
        self.list_url = reverse('exercise-list')
        self.bench = Exercise.objects.create(
            name='Barbell Bench Press',
            type=ExerciseType.GYM,
            primary_muscle=MuscleGroup.CHEST,
            muscle_groups=[MuscleGroup.CHEST, MuscleGroup.TRICEPS, MuscleGroup.SHOULDERS],
            equipment=['barbell', 'flat bench'],
            instructions=['Lie on bench', 'Lower bar to chest', 'Press up'],
            form_tips=['Keep wrists straight', 'Plant feet firmly']
        )
        self.pullup = Exercise.objects.create(
            name='Pull-up',
            type=ExerciseType.CALISTHENICS,
            primary_muscle=MuscleGroup.BACK,
            muscle_groups=[MuscleGroup.BACK, MuscleGroup.BICEPS],
            equipment=['pull-up bar'],
            instructions=['Hang from bar', 'Pull chin over bar'],
            form_tips=['Engage lats']
        )

    def test_list_exercises(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['pagination']['total'], 2)

    def test_filter_by_type(self):
        response = self.client.get(self.list_url, {'type': 'CALISTHENICS'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['pagination']['total'], 1)
        self.assertEqual(response.data['items'][0]['name'], 'Pull-up')

    def test_filter_by_muscle_group(self):
        response = self.client.get(self.list_url, {'muscleGroup': 'CHEST'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['pagination']['total'], 1)
        self.assertEqual(response.data['items'][0]['name'], 'Barbell Bench Press')

    def test_search_by_name(self):
        response = self.client.get(self.list_url, {'search': 'bench'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['pagination']['total'], 1)

    def test_exercise_detail(self):
        detail_url = reverse('exercise-detail', kwargs={'pk': str(self.bench.id)})
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Barbell Bench Press')
        self.assertEqual(len(response.data['formTips']), 2)
