from django.db import models
import uuid

# Create your models here.
class Destination(models.Model):
    class DestinationType(models.TextChoices):
        CITY = "CITY", "City"
        ATTRACTION = "ATTRACTION", "Attraction"
        NATIONAL_PARK = "NATIONAL_PARK", "National Park"
        BEACH = "BEACH", "Beach"
        LANDMARK = "LANDMARK", "Landmark"
        OTHER = "OTHER", "Other"

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    name = models.CharField(max_length=200)
    country = models.CharField(max_length=100)
    city = models.CharField(max_length=100,blank=True,)
    description = models.TextField(blank=True)
    destination_type = models.CharField(max_length=20,choices=DestinationType.choices,
                                        default=DestinationType.OTHER)
    latitude = models.DecimalField(max_digits=9,decimal_places=6,blank=True,null=True)
    longitude = models.DecimalField(max_digits=9,decimal_places=6,blank=True,null=True)
    image_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["country"]),
            models.Index(fields=["city"]),
            models.Index(fields=["destination_type"]),
        ]

    def __str__(self):
        return f"{self.name}, {self.country}"