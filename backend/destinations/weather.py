import json
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import urlopen

from rest_framework.exceptions import APIException


class WeatherProviderError(APIException):
    status_code = 502
    default_detail = "The weather service is temporarily unavailable."
    default_code = "weather_service_error"


def get_destination_weather(destination):
    params = {
        "latitude": float(destination.latitude),
        "longitude": float(destination.longitude),
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

    url = "https://api.open-meteo.com/v1/forecast?" + urlencode(params)

    try:
        with urlopen(url, timeout=8) as response:
            data = json.loads(response.read().decode("utf-8"))
    except (HTTPError, URLError, TimeoutError, OSError, ValueError) as exc:
        raise WeatherProviderError() from exc

    daily = data.get("daily", {})
    dates = daily.get("time", [])

    forecast = []
    for index, date in enumerate(dates):
        forecast.append({
            "date": date,
            "weather_code": daily["weather_code"][index],
            "temperature_max": daily["temperature_2m_max"][index],
            "temperature_min": daily["temperature_2m_min"][index],
            "precipitation_probability": (
                daily["precipitation_probability_max"][index]
            ),
            "precipitation_sum": daily["precipitation_sum"][index],
        })

    return {
        "destination": {
            "id": str(destination.id),
            "name": destination.name,
            "city": destination.city,
            "country": destination.country,
        },
        "timezone": data.get("timezone"),
        "current": data.get("current"),
        "forecast": forecast,
    }