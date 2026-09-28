
# Create your tests here.

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from destinations.models import Destination
from .models import Trip, ItineraryItem, BudgetItem


User = get_user_model()


class TripAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="trip-test@example.com",
            password="test-password-123",
            first_name="Tendo",
            last_name="Calvin",
        )
        self.other_user = User.objects.create_user(
            email="other-trip-test@example.com",
            password="test-password-123",
            first_name="Other",
            last_name="User",
        )

        self.destination = Destination.objects.create(
            name="Murchison Falls National Park",
            country="Uganda",
            city="Masindi",
        )

        self.trip = Trip.objects.create(
            user=self.user,
            destination=self.destination,
            name="Murchison Adventure",
            start_date="2026-10-10",
            end_date="2026-10-14",
        )

        self.list_url = reverse("trip-list")
        self.detail_url = reverse(
            "trip-detail",
            kwargs={"pk": self.trip.id},
        )
        self.client.force_authenticate(user=self.user)

    def test_authenticated_user_can_create_trip(self):
            response = self.client.post(
            self.list_url,
            {
                "destination": str(self.destination.id),
                "name": "Weekend Getaway",
                "start_date": "2026-11-01",
                "end_date": "2026-11-03",
                "status": "PLANNING",
                "notes": "Pack hiking shoes.",
            },
            format="json",
        )

            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
            created_trip = Trip.objects.get(name="Weekend Getaway")
            self.assertEqual(created_trip.user, self.user)
            self.assertEqual(created_trip.destination, self.destination)

    def test_user_only_sees_their_own_trips(self):
        other_trip = Trip.objects.create(
            user=self.other_user,
            destination=self.destination,
            name="Private Trip",
            start_date="2026-12-01",
            end_date="2026-12-05",
        )

        response = self.client.get(self.list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        returned_ids = {str(item["id"]) for item in response.data}
        self.assertIn(str(self.trip.id), returned_ids)
        self.assertNotIn(str(other_trip.id), returned_ids)

    def test_user_can_retrieve_their_own_trip(self):
        response = self.client.get(self.detail_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(str(response.data["id"]), str(self.trip.id))
        self.assertEqual(response.data["name"], self.trip.name)

    def test_user_cannot_retrieve_another_users_trip(self):
        other_trip = Trip.objects.create(
            user=self.other_user,
            destination=self.destination,
            name="Other User Trip",
            start_date="2026-12-01",
            end_date="2026-12-05",
        )
        url = reverse("trip-detail", kwargs={"pk": other_trip.id})

        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_user_can_update_their_own_trip(self):
        response = self.client.patch(
            self.detail_url,
            {"name": "Updated Murchison Adventure"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.trip.refresh_from_db()
        self.assertEqual(self.trip.name, "Updated Murchison Adventure")

    def test_user_can_delete_their_own_trip(self):
        response = self.client.delete(self.detail_url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Trip.objects.filter(pk=self.trip.id).exists())

    def test_user_cannot_update_another_users_trip(self):
        other_trip = Trip.objects.create(
            user=self.other_user,
            destination=self.destination,
            name="Other User Trip",
            start_date="2026-12-01",
            end_date="2026-12-05",
        )
        url = reverse("trip-detail", kwargs={"pk": other_trip.id})

        response = self.client.patch(
            url,
            {"name": "Attempted Update"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        other_trip.refresh_from_db()
        self.assertEqual(other_trip.name, "Other User Trip")

    def test_create_rejects_end_date_before_start_date(self):
        response = self.client.post(
            self.list_url,
            {
                "destination": str(self.destination.id),
                "name": "Invalid Date Trip",
                "start_date": "2026-10-14",
                "end_date": "2026-10-10",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )
        self.assertIn("end_date", response.data)
        self.assertFalse(
            Trip.objects.filter(name="Invalid Date Trip").exists()
        )

    def test_unauthenticated_user_cannot_list_trips(self):
        self.client.force_authenticate(user=None)

        response = self.client.get(self.list_url)

        self.assertIn(
            response.status_code,
            [
                status.HTTP_401_UNAUTHORIZED,
                status.HTTP_403_FORBIDDEN,
            ],
        )
        
    def test_user_can_create_itinerary_item_for_their_trip(self):
        response = self.client.post(
        reverse("itinerary-item-list"),
        {
            "trip": str(self.trip.id),
            "date": "2026-10-11",
            "title": "Visit the falls",
            "description": "Explore the park.",
            "order": 1,
        },
        format="json",
    )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        item = ItineraryItem.objects.get(title="Visit the falls")
        self.assertEqual(item.trip, self.trip)

    def test_user_only_sees_itinerary_items_for_their_trips(self):
        own_item = ItineraryItem.objects.create(
            trip=self.trip,
            date="2026-10-11",
            title="My activity",
        )

        other_trip = Trip.objects.create(
            user=self.other_user,
            destination=self.destination,
            name="Other User Trip",
            start_date="2026-10-10",
            end_date="2026-10-14",
        )
        other_item = ItineraryItem.objects.create(
            trip=other_trip,
            date="2026-10-11",
            title="Other activity",
        )

        response = self.client.get(reverse("itinerary-item-list"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        returned_ids = {str(item["id"]) for item in response.data}
        self.assertIn(str(own_item.id), returned_ids)
        self.assertNotIn(str(other_item.id), returned_ids)

    def test_user_cannot_create_itinerary_item_for_another_users_trip(self):
        other_trip = Trip.objects.create(
            user=self.other_user,
            destination=self.destination,
            name="Other User Trip",
            start_date="2026-10-10",
            end_date="2026-10-14",
        )

        response = self.client.post(
            reverse("itinerary-item-list"),
            {
                "trip": str(other_trip.id),
                "date": "2026-10-11",
                "title": "Unauthorized activity",
                "order": 1,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(
            ItineraryItem.objects.filter(
                title="Unauthorized activity"
            ).exists()
        )

    def test_itinerary_item_rejects_date_outside_trip(self):
        response = self.client.post(
            reverse("itinerary-item-list"),
            {
                "trip": str(self.trip.id),
                "date": "2026-10-20",
                "title": "Out-of-range activity",
                "order": 1,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("date", response.data)
        self.assertFalse(
            ItineraryItem.objects.filter(
                title="Out-of-range activity"
            ).exists()
        )

    def test_user_cannot_reassign_itinerary_item_to_another_users_trip(self):
        item = ItineraryItem.objects.create(
            trip=self.trip,
            date="2026-10-11",
            title="My activity",
            order=1,
        )
        other_trip = Trip.objects.create(
            user=self.other_user,
            destination=self.destination,
            name="Other User Trip",
            start_date="2026-10-10",
            end_date="2026-10-14",
        )

        response = self.client.patch(
            reverse("itinerary-item-detail", kwargs={"pk": item.id}),
            {"trip": str(other_trip.id)},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        item.refresh_from_db()
        self.assertEqual(item.trip, self.trip)

    def test_user_can_create_budget_item_for_their_trip(self):
        response = self.client.post(
            reverse("budget-item-list"),
            {
                "trip": str(self.trip.id),
                "category": "FOOD",
                "estimated_amount": "150.00",
                "actual_amount": "25.00",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        item = BudgetItem.objects.get(trip=self.trip, category="FOOD")
        self.assertEqual(item.estimated_amount, 150)
        self.assertEqual(item.actual_amount, 25)

    def test_user_only_sees_budget_items_for_their_trips(self):
        own_item = BudgetItem.objects.create(
            trip=self.trip,
            category="FOOD",
            estimated_amount="150.00",
            actual_amount="25.00",
        )

        other_trip = Trip.objects.create(
            user=self.other_user,
            destination=self.destination,
            name="Other User Trip",
            start_date="2026-10-10",
            end_date="2026-10-14",
        )
        other_item = BudgetItem.objects.create(
            trip=other_trip,
            category="FOOD",
            estimated_amount="200.00",
            actual_amount="50.00",
        )

        response = self.client.get(reverse("budget-item-list"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        returned_ids = {str(item["id"]) for item in response.data}
        self.assertIn(str(own_item.id), returned_ids)
        self.assertNotIn(str(other_item.id), returned_ids)

    def test_user_cannot_create_budget_item_for_another_users_trip(self):
        other_trip = Trip.objects.create(
            user=self.other_user,
            destination=self.destination,
            name="Other User Trip",
            start_date="2026-10-10",
            end_date="2026-10-14",
        )

        response = self.client.post(
            reverse("budget-item-list"),
            {
                "trip": str(other_trip.id),
                "category": "FOOD",
                "estimated_amount": "150.00",
                "actual_amount": "0.00",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(
            BudgetItem.objects.filter(trip=other_trip).exists()
        )

    def test_user_cannot_reassign_budget_item_to_another_users_trip(self):
        item = BudgetItem.objects.create(
            trip=self.trip,
            category="FOOD",
            estimated_amount="150.00",
            actual_amount="25.00",
        )
        other_trip = Trip.objects.create(
            user=self.other_user,
            destination=self.destination,
            name="Other User Trip",
            start_date="2026-10-10",
            end_date="2026-10-14",
        )

        response = self.client.patch(
            reverse("budget-item-detail", kwargs={"pk": item.id}),
            {"trip": str(other_trip.id)},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        item.refresh_from_db()
        self.assertEqual(item.trip, self.trip)