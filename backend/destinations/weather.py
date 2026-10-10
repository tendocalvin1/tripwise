
import hashlib
import json
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import urlopen

from django.core.cache import cache
from rest_framework.exceptions import APIException


WEATHER_CACHE_TTL = 600


class WeatherProviderError(APIException):
    status_code = 502
    default_detail = "The weather service is temporarily unavailable."
    default_code = "weather_service_error"


def get_destination_weather(destination):
    latitude = float(destination.latitude)
    longitude = float(destination.longitude)

    params = {
        "latitude": latitude,
        "longitude": longitude,
        "current": (
            "temperature_2m,apparent_temperature,"
            "weather_code,wind_speed_10m"
        ),
        "daily": (
            "weather_code,temperature_2m_max,temperature_2m_min,"
            "precipitation_probability_max,precipitation_sum"
        ),
        "forecast_days": 7,
        "timezone": "auto",
    }

    # Include the coordinates and forecast configuration in the key.
    # Hashing keeps the cache key compact and avoids unsafe key characters.
    cache_input = json.dumps(params, sort_keys=True)
    cache_hash = hashlib.sha256(cache_input.encode()).hexdigest()
    cache_key = f"weather:v1:{cache_hash}"

    forecast_data = cache.get(cache_key)

    if forecast_data is None:
        url = (
            "https://api.open-meteo.com/v1/forecast?"
            + urlencode(params)
        )

        try:
            with urlopen(url, timeout=8) as response:
                data = json.loads(response.read().decode("utf-8"))
        except (
            HTTPError,
            URLError,
            TimeoutError,
            OSError,
            ValueError,
        ) as exc:
            raise WeatherProviderError() from exc

        daily = data.get("daily", {})
        dates = daily.get("time", [])

        forecast = []
        for index, date in enumerate(dates):
            forecast.append({
                "date": date,
                "weather_code": daily["weather_code"][index],
                "temperature_max": (
                    daily["temperature_2m_max"][index]
                ),
                "temperature_min": (
                    daily["temperature_2m_min"][index]
                ),
                "precipitation_probability": (
                    daily["precipitation_probability_max"][index]
                ),
                "precipitation_sum": (
                    daily["precipitation_sum"][index]
                ),
            })

        forecast_data = {
            "timezone": data.get("timezone"),
            "current": data.get("current"),
            "forecast": forecast,
        }

        # Cache only a successfully retrieved and normalized forecast.
        cache.set(
            cache_key,
            forecast_data,
            timeout=WEATHER_CACHE_TTL,
        )

    return {
        "destination": {
            "id": str(destination.id),
            "name": destination.name,
            "city": destination.city,
            "country": destination.country,
        },
        **forecast_data,
    }
