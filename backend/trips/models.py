from django.db import models
import uuid
# Create your models here.
class Trip(models.Model):
    class TripStatus(models.TextChoices):
        PLANNING = "PLANNING", "Planning"
        UPCOMING = "UPCOMING", "Upcoming"
        ONGOING = "ONGOING", "Ongoing"
        COMPLETED = "COMPLETED", "Completed"
        CANCELLED = "CANCELLED", "Cancelled"
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey("users.User", on_delete=models.CASCADE, related_name="trips")
    destination = models.ForeignKey("destinations.Destination", on_delete=models.PROTECT,
                                    related_name="trips")
    name = models.CharField(max_length=200)
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=20,choices=TripStatus.choices,
                              default=TripStatus.PLANNING)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
   
   
    class Meta:
        constraints = [
            models.CheckConstraint(
                condition=models.Q(
                    end_date__gte=models.F("start_date")
                ),
                name="trip_end_date_after_start_date",
            ),
        ]

    def __str__(self):
        return f"{self.name} - {self.user.email}"
    
    

class ItineraryItem(models.Model):
    id = models.UUIDField(primary_key=True,default=uuid.uuid4,editable=False)
    trip = models.ForeignKey(Trip,on_delete=models.CASCADE,related_name="itinerary_items")
    date = models.DateField()
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    start_time = models.TimeField(blank=True,null=True)
    end_time = models.TimeField(blank=True,null=True)
    order = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

  
    
    class Meta:
        constraints = [
            models.CheckConstraint(
                condition=(
                    models.Q(start_time__isnull=True)
                    | models.Q(end_time__isnull=True)
                    | models.Q(end_time__gte=models.F("start_time"))
                ),
                name="itinerary_end_time_after_start_time",
            ),

            models.UniqueConstraint(
                fields=["trip", "date", "order"],
                name="unique_itinerary_item_order",
            ),
        ]

    def __str__(self):
        return f"{self.title} - {self.trip.name}"
    