

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class AuthenticationTests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="StrongPassword@123"
        )

    def test_user_registration(self):
        """A user should be able to register."""

        response = self.client.post(
            "/api/accounts/register/",
            {
                "username": "newuser",
                "email": "newuser@example.com",
                "password": "NewStrongPassword@123"
            },
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            User.objects.filter(username="newuser").exists()
        )

        new_user = User.objects.get(username="newuser")
        self.assertTrue(new_user.check_password("NewStrongPassword@123"))

    def test_user_login(self):
        """A registered user should receive JWT tokens when logging in."""

        response = self.client.post(
            "/api/accounts/login/",
            {
                "username": "testuser",
                "password": "StrongPassword@123"
            },
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_login_with_invalid_credentials(self):
        """Invalid credentials should not authenticate the user."""

        response = self.client.post(
            "/api/accounts/login/",
            {
                "username": "testuser",
                "password": "WrongPassword@123"
            },
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED
        )

    def test_authenticated_user_can_access_profile(self):
        """An authenticated user should be able to access their profile."""

        self.client.force_authenticate(user=self.user)

        response = self.client.get("/api/accounts/me/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], "testuser")
        self.assertEqual(response.data["email"], "test@example.com")

    def test_unauthenticated_user_cannot_access_profile(self):
        """An unauthenticated user should not access the profile."""

        response = self.client.get("/api/accounts/me/")

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED
        )
