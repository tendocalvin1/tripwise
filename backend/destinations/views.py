from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Destination, SavedDestination
from .serializers import (
    DestinationSerializer,
    SavedDestinationSerializer,
)
from .weather import get_destination_weather


class DestinationViewSet(viewsets.ModelViewSet):
    queryset = Destination.objects.all()
    serializer_class = DestinationSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=["get"], url_path="weather")
    def weather(self, request, pk=None):
        destination = self.get_object()

        if destination.latitude is None or destination.longitude is None:
            raise ValidationError(
                "Weather is unavailable because this destination has no coordinates."
            )

        weather_data = get_destination_weather(destination)
        return Response(weather_data, status=status.HTTP_200_OK)


class SavedDestinationViewSet(viewsets.ModelViewSet):
    serializer_class = SavedDestinationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SavedDestination.objects.filter(
            user=self.request.user
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)