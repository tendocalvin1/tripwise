from django.contrib import admin
from .models import Destination, SavedDestination


# Register your models here.
admin.site.register([
    Destination,
    SavedDestination
])