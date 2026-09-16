from django.contrib import admin
from .models import Trip, ItineraryItem, BudgetItem

# Register your models here.
admin.site.register([
    Trip,
    ItineraryItem,
    BudgetItem
])