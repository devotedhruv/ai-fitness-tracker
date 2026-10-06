from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from apps.authentication.models import User
from apps.exercises.models import Exercise, ExerciseType, MuscleGroup
from .models import ExerciseProgression, UserProgressionState, SkillBranch

class ProgressionTests(APITestCase):
    def setUp(self):
        self.trees_url = reverse('progression-trees')
        self.user = User.objects.create_user(
            email='athlete@fittrack.app',
            password='TestPassword123!'
        )
        self.wall_pushup = Exercise.objects.create(
            name='Wall Push-up',
            type=ExerciseType.CALISTHENICS,
            primary_muscle=MuscleGroup.CHEST,
            muscle_groups=[MuscleGroup.CHEST, MuscleGroup.TRICEPS],
            equipment=[],
            instructions=['Push from wall']
        )
        self.knee_pushup = Exercise.objects.create(
            name='Knee Push-up',
            type=ExerciseType.CALISTHENICS,
            primary_muscle=MuscleGroup.CHEST,
            muscle_groups=[MuscleGroup.CHEST, MuscleGroup.TRICEPS],
            equipment=[],
            instructions=['Push from knees']
        )

        self.node1 = ExerciseProgression.objects.create(
            skill=SkillBranch.PUSH,
            level=1,
            exercise=self.wall_pushup,
            unlock_criteria='Unlocked by default',
            target_sets=3,
            target_reps=10
        )
        self.node2 = ExerciseProgression.objects.create(
            skill=SkillBranch.PUSH,
            level=2,
            exercise=self.knee_pushup,
            unlock_criteria='3 sets of 10 reps',
            target_sets=3,
            target_reps=10
        )

    def test_list_progression_trees(self):
        response = self.client.get(self.trees_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        push_tree = next((t for t in response.data if t['skill'] == 'PUSH'), None)
        self.assertIsNotNone(push_tree)
        self.assertEqual(len(push_tree['nodes']), 2)

    def test_authenticated_user_progression_level_state(self):
        UserProgressionState.objects.create(user=self.user, skill=SkillBranch.PUSH, current_level=2)
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.trees_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        push_tree = next((t for t in response.data if t['skill'] == 'PUSH'), None)
        self.assertEqual(push_tree['currentLevel'], 2)
        self.assertEqual(push_tree['nodes'][0]['status'], 'MASTERED')
        self.assertEqual(push_tree['nodes'][1]['status'], 'CURRENT')
