from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.utils import timezone
from apps.authentication.models import User

class RunTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='runner@fittrack.app',
            password='TestPassword123!'
        )
        self.client.force_authenticate(user=self.user)
        self.run_url = reverse('run-list-create')

    def test_record_outdoor_run_with_splits(self):
        now = timezone.now()
        payload = {
            'title': 'Morning 5K',
            'distanceMeters': 5000.0,
            'durationSeconds': 1500,
            'avgPaceSecKm': 300,
            'startedAt': now.isoformat(),
            'completedAt': now.isoformat(),
            'polyline': '_p~iF~ps|U_ulLnnqC_mqNvxq`@',
            'splits': [
                {
                    'splitNumber': 1,
                    'distanceMeters': 1000.0,
                    'durationSeconds': 300,
                    'paceSecKm': 300,
                    'elevationChange': 2.5
                }
            ]
        }
        response = self.client.post(self.run_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'Morning 5K')
        self.assertEqual(response.data['distanceMeters'], 5000.0)
        self.assertEqual(len(response.data['splits']), 1)

    def test_list_user_runs(self):
        self.test_record_outdoor_run_with_splits()
        response = self.client.get(self.run_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
