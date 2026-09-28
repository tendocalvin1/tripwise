
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

    def validate_destination(self, destination):
        request = self.context.get("request")

        if request and request.user.is_authenticated:
            already_saved = SavedDestination.objects.filter(
                user=request.user,
                destination=destination,
            ).exists()

            if already_saved:
                raise serializers.ValidationError(
                    "You have already saved this destination."
                )

        return destination