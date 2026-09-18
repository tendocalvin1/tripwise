# Create your views here.

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Destination, SavedDestination
from .serializers import (
    DestinationSerializer,
    SavedDestinationSerializer,
)


class DestinationViewSet(viewsets.ModelViewSet):
    queryset = Destination.objects.all()
    serializer_class = DestinationSerializer
    permission_classes = [IsAuthenticated]


class SavedDestinationViewSet(viewsets.ModelViewSet):
    serializer_class = SavedDestinationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SavedDestination.objects.filter(
            user=self.request.user
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)



