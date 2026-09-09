from rest_framework import serializers
from .models import Trip, ItineraryItem, BudgetItem


class TripSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trip
        fields = ["id","destination","name","start_date","end_date","status","notes","created_at","updated_at"]
        read_only_fields = ["id","created_at","updated_at"]
        
        def validate(self, attrs):
            start_date = attrs.get(
        "start_date",
        self.instance.start_date if self.instance else None
    )

            end_date = attrs.get(
                "end_date",
            self.instance.end_date if self.instance else None
    )

            if start_date and end_date and end_date < start_date:
                raise serializers.ValidationError({
            "end_date": "End date cannot be before the start date."
        })

            return attrs
    
    
class ItineraryItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItineraryItem
        fields = ["id","date","title","description","start_time","end_time","order","created_at","updated_at"]
        read_only_fields = ["id","created_at","updated_at"]

    def validate(self, attrs):
        start_time = attrs.get("start_time")
        end_time = attrs.get("end_time")

        if start_time is None and end_time is not None:
            raise serializers.ValidationError({
                "start_time": "Start time is required when end time is provided."
            })

        if start_time is not None and end_time is None:
            raise serializers.ValidationError({
                "end_time": "End time is required when start time is provided."
            })

        if start_time and end_time and end_time < start_time:
            raise serializers.ValidationError({
                "end_time": "End time cannot be before start time."
            })

        return attrs
    
class BudgetItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = BudgetItem
        fields = ["id","category","estimated_amount","actual_amount","created_at","updated_at"]
        read_only_fields = ["id","created_at","updated_at"]