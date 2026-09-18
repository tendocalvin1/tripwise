
from rest_framework.routers import DefaultRouter

from .views import (
    DestinationViewSet,
    SavedDestinationViewSet,
)


router = DefaultRouter()

router.register(
    "destinations",
    DestinationViewSet,
    basename="destination",
)

router.register(
    "saved-destinations",
    SavedDestinationViewSet,
    basename="saved-destination",
)

urlpatterns = router.urls

