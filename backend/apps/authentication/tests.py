from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from .models import User

class AuthenticationTests(APITestCase):
    def setUp(self):
        self.register_url = reverse('auth-register')
        self.login_url = reverse('auth-login')
        self.profile_url = reverse('user-me')
        self.refresh_url = reverse('auth-refresh')
        self.valid_user_data = {
            'email': 'testuser@fittrack.app',
            'password': 'SecurePassword123!',
            'displayName': 'Test Athlete'
        }

    def test_register_user_success(self):
        response = self.client.post(self.register_url, self.valid_user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('tokens', response.data)
        self.assertIn('accessToken', response.data['tokens'])
        self.assertIn('refreshToken', response.data['tokens'])
        self.assertEqual(response.data['user']['email'], 'testuser@fittrack.app')
        self.assertEqual(response.data['user']['profile']['displayName'], 'Test Athlete')

    def test_register_duplicate_email_fails(self):
        self.client.post(self.register_url, self.valid_user_data, format='json')
        response = self.client.post(self.register_url, self.valid_user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_success(self):
        self.client.post(self.register_url, self.valid_user_data, format='json')
        login_payload = {
            'email': self.valid_user_data['email'],
            'password': self.valid_user_data['password']
        }
        response = self.client.post(self.login_url, login_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('tokens', response.data)

    def test_login_invalid_credentials_fails(self):
        self.client.post(self.register_url, self.valid_user_data, format='json')
        login_payload = {
            'email': self.valid_user_data['email'],
            'password': 'WrongPassword999!'
        }
        response = self.client.post(self.login_url, login_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_profile_access(self):
        reg_resp = self.client.post(self.register_url, self.valid_user_data, format='json')
        access_token = reg_resp.data['tokens']['accessToken']

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], self.valid_user_data['email'])

    def test_unauthenticated_profile_access_forbidden(self):
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_update_profile_success(self):
        reg_resp = self.client.post(self.register_url, self.valid_user_data, format='json')
        access_token = reg_resp.data['tokens']['accessToken']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')

        patch_payload = {
            'displayName': 'Dhruv Lift',
            'username': 'dhruv_lifts',
            'bio': 'Lifting weights and running trails 🏃‍♂️🏋️',
            'avatarUrl': 'https://example.com/avatar.png',
            'instagramHandle': 'dhruv_lifts',
            'location': 'Kathmandu, NP'
        }
        response = self.client.patch(self.profile_url, patch_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['displayName'], 'Dhruv Lift')
        self.assertEqual(response.data['username'], 'dhruv_lifts')
        self.assertEqual(response.data['bio'], 'Lifting weights and running trails 🏃‍♂️🏋️')
        self.assertEqual(response.data['avatarUrl'], 'https://example.com/avatar.png')
        self.assertEqual(response.data['instagramHandle'], 'dhruv_lifts')
        self.assertEqual(response.data['location'], 'Kathmandu, NP')

    def test_update_duplicate_username_fails(self):
        # User 1
        reg1 = self.client.post(self.register_url, self.valid_user_data, format='json')
        token1 = reg1.data['tokens']['accessToken']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token1}')
        self.client.patch(self.profile_url, {'username': 'iron_athlete'}, format='json')

        # User 2
        user2_data = {
            'email': 'athlete2@fittrack.app',
            'password': 'SecurePassword123!',
            'displayName': 'Athlete 2'
        }
        reg2 = self.client.post(self.register_url, user2_data, format='json')
        token2 = reg2.data['tokens']['accessToken']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token2}')

        # Try claiming existing username
        dup_resp = self.client.patch(self.profile_url, {'username': 'iron_athlete'}, format='json')
        self.assertEqual(dup_resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('username', dup_resp.data)

    def test_invalid_username_format_fails(self):
        reg = self.client.post(self.register_url, self.valid_user_data, format='json')
        token = reg.data['tokens']['accessToken']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        invalid_resp = self.client.patch(self.profile_url, {'username': 'ab!@#$'}, format='json')
        self.assertEqual(invalid_resp.status_code, status.HTTP_400_BAD_REQUEST)
