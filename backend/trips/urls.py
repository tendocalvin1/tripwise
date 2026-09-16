from rest_framework.routers import DefaultRouter

from .views import TripViewSet, ItineraryItemViewSet

router = DefaultRouter()

router.register("trips", TripViewSet, basename="trip")
router.register(
    "itinerary-items",
    ItineraryItemViewSet,
    basename="itinerary-item"
)

urlpatterns = router.urls