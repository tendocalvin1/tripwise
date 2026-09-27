import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    getDestinations,
    getSavedDestinations,
    getDestinationWeather,
    saveDestination,
    unsaveDestination,
} from "../services/api";

import "./Destinations.css";

function getList(data) {
    // Supports both a plain array and Django REST Framework pagination.
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    return [];
}

function getWeatherLabel(code) {
    const labels = {
        0: "Clear sky",
        1: "Mainly clear",
        2: "Partly cloudy",
        3: "Overcast",
        45: "Fog",
        48: "Depositing rime fog",
        51: "Light drizzle",
        53: "Moderate drizzle",
        55: "Dense drizzle",
        56: "Light freezing drizzle",
        57: "Dense freezing drizzle",
        61: "Slight rain",
        63: "Moderate rain",
        65: "Heavy rain",
        66: "Light freezing rain",
        67: "Heavy freezing rain",
        71: "Slight snow",
        73: "Moderate snow",
        75: "Heavy snow",
        77: "Snow grains",
        80: "Slight rain showers",
        81: "Moderate rain showers",
        82: "Violent rain showers",
        85: "Slight snow showers",
        86: "Heavy snow showers",
        95: "Thunderstorm",
        96: "Thunderstorm with slight hail",
        99: "Thunderstorm with heavy hail",
    };

    return labels[code] || "Conditions unavailable";
}

function Destinations() {
    const navigate = useNavigate();

    const [destinations, setDestinations] = useState([]);
    const [savedDestinations, setSavedDestinations] = useState([]);
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("ALL");
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState("");
    const [savingId, setSavingId] = useState(null);
    const [actionError, setActionError] = useState("");

    const [weatherById, setWeatherById] = useState({});
    const [weatherLoadingId, setWeatherLoadingId] = useState(null);
    const [weatherErrors, setWeatherErrors] = useState({});
    const [openWeatherId, setOpenWeatherId] = useState(null);

    const token = localStorage.getItem("accessToken");

    const loadPage = useCallback(async () => {
        if (!token) {
            navigate("/login");
            return;
        }

        setLoading(true);
        setPageError("");

        try {
            const [destinationData, savedData] = await Promise.all([
                getDestinations(token),
                getSavedDestinations(token),
            ]);

            setDestinations(getList(destinationData));
            setSavedDestinations(getList(savedData));
        } catch (error) {
            setPageError(error.message || "Could not load destinations.");
        } finally {
            setLoading(false);
        }
    }, [navigate, token]);

    useEffect(() => {
        loadPage();
    }, [loadPage]);

    const savedByDestinationId = useMemo(() => {
        return new Map(
            savedDestinations.map((saved) => [
                String(saved.destination),
                saved,
            ])
        );
    }, [savedDestinations]);

    const destinationTypes = useMemo(() => {
        return [
            "ALL",
            ...new Set(
                destinations
                    .map((destination) => destination.destination_type)
                    .filter(Boolean)
            ),
        ];
    }, [destinations]);

    const filteredDestinations = useMemo(() => {
        const query = search.trim().toLowerCase();

        return destinations.filter((destination) => {
            const matchesType =
                typeFilter === "ALL" ||
                destination.destination_type === typeFilter;

            const searchableText = [
                destination.name,
                destination.country,
                destination.city,
                destination.description,
                destination.destination_type,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return matchesType && searchableText.includes(query);
        });
    }, [destinations, search, typeFilter]);

    async function handleSaveToggle(destination) {
        const destinationId = String(destination.id);
        const savedRecord = savedByDestinationId.get(destinationId);

        setSavingId(destinationId);
        setActionError("");

        try {
            if (savedRecord) {
                await unsaveDestination(token, savedRecord.id);
                setSavedDestinations((current) =>
                    current.filter((item) => item.id !== savedRecord.id)
                );
            } else {
                const createdSavedRecord = await saveDestination(
                    token,
                    destination.id
                );
                setSavedDestinations((current) => [
                    ...current,
                    createdSavedRecord,
                ]);
            }
        } catch (error) {
            setActionError(
                error.message || "Could not update your saved destinations."
            );
        } finally {
            setSavingId(null);
        }
    }

    async function handleWeatherToggle(destination) {
        const destinationId = String(destination.id);

        // Close the panel if it is already open and has loaded data.
        if (
            openWeatherId === destinationId &&
            weatherById[destinationId]
        ) {
            setOpenWeatherId(null);
            return;
        }

        setOpenWeatherId(destinationId);
        setWeatherErrors((current) => ({
            ...current,
            [destinationId]: "",
        }));

        // Use the cached weather data if this destination was loaded before.
        if (weatherById[destinationId]) {
            return;
        }

        setWeatherLoadingId(destinationId);

        try {
            const weatherData = await getDestinationWeather(
                token,
                destination.id
            );

            setWeatherById((current) => ({
                ...current,
                [destinationId]: weatherData,
            }));
        } catch (error) {
            setWeatherErrors((current) => ({
                ...current,
                [destinationId]:
                    error.message || "Could not load weather for this destination.",
            }));
        } finally {
            setWeatherLoadingId(null);
        }
    }

    function formatType(type) {
        if (!type) return "Destination";

        return type
            .toLowerCase()
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    }

    return (
        <main className="destinations-page">
            <header className="destinations-header">
                <div>
                    <p className="destinations-eyebrow">EXPLORE</p>
                    <h1>Find your next destination</h1>
                    <p className="destinations-subtitle">
                        Browse places and save the ones you want to plan for.
                    </p>
                </div>

                <button
                    className="destinations-secondary-button"
                    type="button"
                    onClick={() => navigate("/dashboard")}
                >
                    Back to dashboard
                </button>
            </header>

            <section className="destinations-controls">
                <label className="destinations-search">
                    <span>Search destinations</span>
                    <input
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search by place, country, or description"
                    />
                </label>

                <label className="destinations-filter">
                    <span>Destination type</span>
                    <select
                        value={typeFilter}
                        onChange={(event) => setTypeFilter(event.target.value)}
                    >
                        {destinationTypes.map((type) => (
                            <option key={type} value={type}>
                                {type === "ALL" ? "All types" : formatType(type)}
                            </option>
                        ))}
                    </select>
                </label>
            </section>

            {actionError && (
                <div className="destinations-alert" role="alert">
                    {actionError}
                </div>
            )}

            {loading ? (
                <div className="destinations-message" role="status">
                    Loading destinations…
                </div>
            ) : pageError ? (
                <div className="destinations-empty">
                    <h2>We couldn’t load destinations</h2>
                    <p>{pageError}</p>
                    <button
                        className="destinations-primary-button"
                        type="button"
                        onClick={loadPage}
                    >
                        Try again
                    </button>
                </div>
            ) : filteredDestinations.length === 0 ? (
                <div className="destinations-empty">
                    <h2>No destinations found</h2>
                    <p>
                        {destinations.length === 0
                            ? "There are no destinations available yet."
                            : "Try changing your search or destination type."}
                    </p>
                    {destinations.length > 0 && (
                        <button
                            className="destinations-secondary-button"
                            type="button"
                            onClick={() => {
                                setSearch("");
                                setTypeFilter("ALL");
                            }}
                        >
                            Clear filters
                        </button>
                    )}
                </div>
            ) : (
                <section
                    className="destinations-grid"
                    aria-label="Destinations"
                >
                    {filteredDestinations.map((destination) => {
                        const destinationId = String(destination.id);
                        const isSaved =
                            savedByDestinationId.has(destinationId);
                        const isSaving = savingId === destinationId;
                        const isWeatherLoading =
                            weatherLoadingId === destinationId;
                        const weather = weatherById[destinationId];
                        const isWeatherOpen =
                            openWeatherId === destinationId;

                        const hasCoordinates =
                            destination.latitude != null &&
                            destination.longitude != null;

                        const location = [
                            destination.city,
                            destination.country,
                        ]
                            .filter(Boolean)
                            .join(", ");

                        return (
                            <article
                                className="destination-card"
                                key={destination.id}
                            >
                                {destination.image_url ? (
                                    <img
                                        className="destination-image"
                                        src={destination.image_url}
                                        alt={destination.name}
                                        loading="lazy"
                                    />
                                ) : (
                                    <div
                                        className="destination-image destination-image-placeholder"
                                        aria-label="No destination image available"
                                    >
                                        <span>Explore</span>
                                    </div>
                                )}

                                <div className="destination-card-content">
                                    <div className="destination-card-heading">
                                        <div>
                                            <span className="destination-type">
                                                {formatType(
                                                    destination.destination_type
                                                )}
                                            </span>
                                            <h2>{destination.name}</h2>
                                            {location && (
                                                <p className="destination-location">
                                                    {location}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {destination.description && (
                                        <p className="destination-description">
                                            {destination.description}
                                        </p>
                                    )}

                                    <section className="destination-weather">
                                        <button
                                            className="destination-weather-button"
                                            type="button"
                                            disabled={
                                                isWeatherLoading ||
                                                !hasCoordinates
                                            }
                                            onClick={() =>
                                                handleWeatherToggle(destination)
                                            }
                                            aria-expanded={isWeatherOpen}
                                        >
                                            {isWeatherLoading
                                                ? "Loading weather…"
                                                : isWeatherOpen && weather
                                                  ? "Hide weather"
                                                  : "View weather"}
                                        </button>

                                        {!hasCoordinates && (
                                            <p className="destination-weather-note">
                                                Weather unavailable: coordinates
                                                have not been added.
                                            </p>
                                        )}

                                        {weatherErrors[destinationId] && (
                                            <p
                                                className="destination-weather-error"
                                                role="alert"
                                            >
                                                {weatherErrors[destinationId]}
                                            </p>
                                        )}

                                        {isWeatherOpen && weather && (
                                            <div className="destination-weather-panel">
                                                <h3>Current weather</h3>

                                                <p className="destination-weather-temperature">
                                                    {weather.current?.temperature_2m ??
                                                        "—"}
                                                    °C
                                                </p>

                                                <p className="destination-weather-detail">
                                                    {getWeatherLabel(
                                                        weather.current?.weather_code
                                                    )}
                                                    {" · "}Feels like{" "}
                                                    {weather.current?.apparent_temperature ??
                                                        "—"}
                                                    °C
                                                </p>

                                                <p className="destination-weather-detail">
                                                    Wind:{" "}
                                                    {weather.current?.wind_speed_10m ??
                                                        "—"}{" "}
                                                    km/h
                                                </p>

                                                <h3 className="destination-weather-forecast-title">
                                                    7-day forecast
                                                </h3>

                                                <div className="destination-weather-forecast">
                                                    {weather.forecast?.map(
                                                        (day) => (
                                                            <div
                                                                className="destination-weather-day"
                                                                key={day.date}
                                                            >
                                                                <span>
                                                                    {new Date(
                                                                        `${day.date}T00:00:00`
                                                                    ).toLocaleDateString(
                                                                        undefined,
                                                                        {
                                                                            weekday:
                                                                                "short",
                                                                            month: "short",
                                                                            day: "numeric",
                                                                        }
                                                                    )}
                                                                </span>

                                                                <strong>
                                                                    {day.temperature_max ??
                                                                        "—"}
                                                                    ° /{" "}
                                                                    {day.temperature_min ??
                                                                        "—"}
                                                                    °
                                                                </strong>

                                                                <small>
                                                                    Rain:{" "}
                                                                    {day.precipitation_probability ==
                                                                    null
                                                                        ? "—"
                                                                        : `${day.precipitation_probability}%`}
                                                                </small>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </section>

                                    <button
                                        className={
                                            isSaved
                                                ? "destination-save-button is-saved"
                                                : "destination-save-button"
                                        }
                                        type="button"
                                        disabled={isSaving}
                                        onClick={() =>
                                            handleSaveToggle(destination)
                                        }
                                    >
                                        {isSaving
                                            ? "Updating…"
                                            : isSaved
                                              ? "Saved · Remove"
                                              : "Save destination"}
                                    </button>
                                </div>
                            </article>
                        );
                    })}
                </section>
            )}
        </main>
    );
}

export default Destinations;