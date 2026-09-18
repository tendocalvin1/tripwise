
from rest_framework import serializers

from .models import Destination, SavedDestination


class DestinationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Destination
        fields = [
            "id",
            "name",
            "country",
            "city",
            "description",
            "destination_type",
            "latitude",
            "longitude",
            "image_url",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class SavedDestinationSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedDestination
        fields = [
            "id",
            "user",
            "destination",
            "created_at",
        ]
        read_only_fields = ["id", "user", "created_at"]

