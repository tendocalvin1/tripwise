from rest_framework.routers import DefaultRouter

from .views import (
    TripViewSet,
    ItineraryItemViewSet,
    BudgetItemViewSet,
)

router = DefaultRouter()

router.register("trips", TripViewSet, basename="trip")

router.register(
    "itinerary-items",
    ItineraryItemViewSet,
    basename="itinerary-item"
)

router.register(
    "budget-items",
    BudgetItemViewSet,
    basename="budget-item"
)

urlpatterns = router.urls