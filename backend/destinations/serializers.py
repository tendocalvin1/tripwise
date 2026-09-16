from rest_framework import serializers
from .models import Destination, SavedDestination

class DestinationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Destination
        fields = '__all__'
        

class SavedDestinationSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedDestination
        fields = '__all__'