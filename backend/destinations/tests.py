from django.test import TestCase

# Create your tests here.

from unittest.mock import patch

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Destination, SavedDestination
from .weather import WeatherProviderError


class DestinationWeatherTests(APITestCase):
    def setUp(self):
        self.destination = Destination.objects.create(
            name="Murchison Falls National Park",
            country="Uganda",
            city="Masindi",
            latitude="2.251900",
            longitude="31.537000",
        )
        self.url = reverse(
            "destination-weather",
            kwargs={"pk": self.destination.id},
        )

        # The app's user model is users.User.
        from django.contrib.auth import get_user_model

        User = get_user_model()
        self.user = User.objects.create_user(
            email="weather-test@example.com",
            password="test-password-123",
        )
        self.client.force_authenticate(user=self.user)

    @patch("destinations.views.get_destination_weather")
    def test_authenticated_user_can_get_destination_weather(
        self, mock_get_weather
    ):
        expected_data = {
            "destination": {
                "id": str(self.destination.id),
                "name": "Murchison Falls National Park",
                "city": "Masindi",
                "country": "Uganda",
            },
            "timezone": "Africa/Kampala",
            "current": {
                "temperature_2m": 25.4,
                "apparent_temperature": 28.8,
                "weather_code": 2,
                "wind_speed_10m": 8.4,
            },
            "forecast": [
                {
                    "date": "2026-09-26",
                    "weather_code": 2,
                    "temperature_max": 29.0,
                    "temperature_min": 20.0,
                    "precipitation_probability": 30,
                    "precipitation_sum": 2.1,
                }
            ],
        }
        mock_get_weather.return_value = expected_data

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, expected_data)
        mock_get_weather.assert_called_once_with(self.destination)

    @patch("destinations.views.get_destination_weather")
    def test_weather_returns_400_when_destination_has_no_coordinates(
        self, mock_get_weather
    ):
        destination_without_coordinates = Destination.objects.create(
            name="Destination Without Coordinates",
            country="Uganda",
        )
        url = reverse(
            "destination-weather",
            kwargs={"pk": destination_without_coordinates.id},
        )

        response = self.client.get(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )
        mock_get_weather.assert_not_called()

    @patch("destinations.views.get_destination_weather")
    def test_weather_returns_502_when_provider_fails(
        self, mock_get_weather
    ):
        mock_get_weather.side_effect = WeatherProviderError()

        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_502_BAD_GATEWAY,
        )
        self.assertEqual(
            response.data["detail"],
            "The weather service is temporarily unavailable.",
        )
        mock_get_weather.assert_called_once_with(self.destination)

    def test_unauthenticated_user_cannot_get_destination_weather(self):
        self.client.force_authenticate(user=None)

        response = self.client.get(self.url)

        self.assertIn(
            response.status_code,
            [
                status.HTTP_401_UNAUTHORIZED,
                status.HTTP_403_FORBIDDEN,
            ],
        )
        
        

class SavedDestinationAPITests(APITestCase):
    def setUp(self):
        from django.contrib.auth import get_user_model

        User = get_user_model()
        self.user = User.objects.create_user(
            email="saved-test@example.com",
            password="test-password-123",
        )
        self.other_user = User.objects.create_user(
            email="other-saved-test@example.com",
            password="test-password-123",
        )

        self.destination = Destination.objects.create(
            name="Murchison Falls National Park",
            country="Uganda",
        )
        self.other_destination = Destination.objects.create(
            name="Lake Bunyonyi",
            country="Uganda",
        )

        self.list_url = reverse("saved-destination-list")
        self.client.force_authenticate(user=self.user)

    def test_user_can_save_a_destination(self):
        response = self.client.post(
            self.list_url,
            {"destination": str(self.destination.id)},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            SavedDestination.objects.filter(
                user=self.user,
                destination=self.destination,
            ).count(),
            1,
        )

    def test_saved_destination_is_assigned_to_authenticated_user(self):
        response = self.client.post(
            self.list_url,
            {
                "destination": str(self.destination.id),
                "user": self.other_user.id,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        saved = SavedDestination.objects.get(
            destination=self.destination
        )
        self.assertEqual(saved.user, self.user)

    def test_user_only_sees_their_own_saved_destinations(self):
        SavedDestination.objects.create(
            user=self.user,
            destination=self.destination,
        )
        SavedDestination.objects.create(
            user=self.other_user,
            destination=self.other_destination,
        )

        response = self.client.get(self.list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(
        str(response.data[0]["destination"]),
        str(self.destination.id),
        )

    def test_user_cannot_access_another_users_saved_destination(self):
        other_saved = SavedDestination.objects.create(
            user=self.other_user,
            destination=self.other_destination,
        )
        detail_url = reverse(
            "saved-destination-detail",
            kwargs={"pk": other_saved.id},
        )

        response = self.client.get(detail_url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_user_cannot_delete_another_users_saved_destination(self):
        other_saved = SavedDestination.objects.create(
            user=self.other_user,
            destination=self.other_destination,
        )
        detail_url = reverse(
            "saved-destination-detail",
            kwargs={"pk": other_saved.id},
        )

        response = self.client.delete(detail_url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertTrue(
            SavedDestination.objects.filter(pk=other_saved.id).exists()
        )

    def test_user_cannot_save_the_same_destination_twice(self):
        SavedDestination.objects.create(
            user=self.user,
            destination=self.destination,
        )

        response = self.client.post(
            self.list_url,
            {"destination": str(self.destination.id)},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )
        self.assertEqual(
            SavedDestination.objects.filter(
                user=self.user,
                destination=self.destination,
            ).count(),
            1,
        )

    def test_unauthenticated_user_cannot_list_saved_destinations(self):
        self.client.force_authenticate(user=None)

        response = self.client.get(self.list_url)

        self.assertIn(
            response.status_code,
            [
                status.HTTP_401_UNAUTHORIZED,
                status.HTTP_403_FORBIDDEN,
            ],
        )
