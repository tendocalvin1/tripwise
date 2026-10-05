from django.db import migrations


DESTINATIONS = [
    {
        "name": "Kampala",
        "country": "Uganda",
        "city": "Kampala",
        "destination_type": "CITY",
        "latitude": 0.3476,
        "longitude": 32.5825,
    },
    {
        "name": "Entebbe",
        "country": "Uganda",
        "city": "Entebbe",
        "destination_type": "CITY",
        "latitude": 0.0512,
        "longitude": 32.4637,
    },
    {
        "name": "Jinja",
        "country": "Uganda",
        "city": "Jinja",
        "destination_type": "CITY",
        "latitude": 0.4479,
        "longitude": 33.2026,
    },
    {
        "name": "Murchison Falls National Park",
        "country": "Uganda",
        "city": "Masindi",
        "destination_type": "NATIONAL_PARK",
        "latitude": 2.2519,
        "longitude": 31.5370,
    },
    {
        "name": "Queen Elizabeth National Park",
        "country": "Uganda",
        "city": "Kasese",
        "destination_type": "NATIONAL_PARK",
        "latitude": -0.1833,
        "longitude": 29.9667,
    },
    {
        "name": "Bwindi Impenetrable National Park",
        "country": "Uganda",
        "city": "Kanungu",
        "destination_type": "NATIONAL_PARK",
        "latitude": -1.0667,
        "longitude": 29.7167,
    },
    {
        "name": "Kidepo Valley National Park",
        "country": "Uganda",
        "city": "Kaabong",
        "destination_type": "NATIONAL_PARK",
        "latitude": 3.9167,
        "longitude": 33.8667,
    },
    {
        "name": "Lake Bunyonyi",
        "country": "Uganda",
        "city": "Kabale",
        "destination_type": "OTHER",
        "latitude": -1.2833,
        "longitude": 29.9333,
    },
    {
        "name": "Fort Portal",
        "country": "Uganda",
        "city": "Fort Portal",
        "destination_type": "CITY",
        "latitude": 0.6710,
        "longitude": 30.2750,
    },
    {
        "name": "Kasese",
        "country": "Uganda",
        "city": "Kasese",
        "destination_type": "CITY",
        "latitude": 0.1833,
        "longitude": 30.0833,
    },
]


def seed_destinations(apps, schema_editor):
    Destination = apps.get_model("destinations", "Destination")

    for destination in DESTINATIONS:
        name = destination["name"]
        country = destination["country"]

        defaults = {
            key: value
            for key, value in destination.items()
            if key not in {"name", "country"}
        }

        Destination.objects.update_or_create(
            name=name,
            country=country,
            defaults=defaults,
        )


def reverse_seed_destinations(apps, schema_editor):
    Destination = apps.get_model("destinations", "Destination")

    names = [destination["name"] for destination in DESTINATIONS]

    Destination.objects.filter(
        country="Uganda",
        name__in=names,
    ).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("destinations", "0002_saveddestination"),
    ]

    operations = [
        migrations.RunPython(
            seed_destinations,
            reverse_seed_destinations,
        ),
    ]
