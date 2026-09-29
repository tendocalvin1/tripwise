from django.test import TestCase

# Create your tests here.
# setting up the tests for various end points in tripwise

from rest_framework import status
from rest_framework.test import APITestCase


class RegistrationTests(APITestCase):
    def setUp(self):
        self.register_url = "/api/auth/register/"
        self.login_url = "/api/auth/login/"
        self.password = "Riv3r!Stone#Atlas928"

    def test_user_can_register(self):
        response = self.client.post(
            self.register_url,
            {
                "email": "traveler@example.com",
                "first_name": "Alex",
                "last_name": "Traveler",
                "password": self.password,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["email"], "traveler@example.com")
        self.assertNotIn("password", response.data)

    def test_registration_rejects_duplicate_email(self):
        payload = {
            "email": "traveler@example.com",
            "first_name": "Alex",
            "last_name": "Traveler",
            "password": self.password,
        }

        first_response = self.client.post(
            self.register_url, payload, format="json"
        )
        second_response = self.client.post(
            self.register_url, payload, format="json"
        )

        self.assertEqual(first_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(second_response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_new_user_can_log_in(self):
        self.client.post(
            self.register_url,
            {
                "email": "traveler@example.com",
                "first_name": "Alex",
                "last_name": "Traveler",
                "password": self.password,
            },
            format="json",
        )

        response = self.client.post(
            self.login_url,
            {
                "email": "traveler@example.com",
                "password": self.password,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)