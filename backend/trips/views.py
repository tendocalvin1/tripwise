from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Trip, ItineraryItem, BudgetItem
from .serializers import TripSerializer, ItineraryItemSerializer, BudgetItemSerializer
# Create your views here.
class TripViewSet(viewsets.ModelViewSet):
    serializer_class = TripSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Trip.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        
class ItineraryItemViewSet(viewsets.ModelViewSet):
    serializer_class = ItineraryItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ItineraryItem.objects.filter(
            trip__user=self.request.user
        )

    def perform_create(self, serializer):
        trip = serializer.validated_data["trip"]

        if trip.user != self.request.user:
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied(
                "You do not have permission to add an item to this trip."
            )

        serializer.save()
        
        
class BudgetItemViewSet(viewsets.ModelViewSet):
    serializer_class = BudgetItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return BudgetItem.objects.filter(
            trip__user=self.request.user
        )

    def perform_create(self, serializer):
        trip = serializer.validated_data["trip"]

        if trip.user != self.request.user:
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied(
                "You do not have permission to add a budget item to this trip."
            )

        serializer.save()
