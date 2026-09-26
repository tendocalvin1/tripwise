import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    getDestinations,
    getSavedDestinations,
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
                <section className="destinations-grid" aria-label="Destinations">
                    {filteredDestinations.map((destination) => {
                        const destinationId = String(destination.id);
                        const isSaved =
                            savedByDestinationId.has(destinationId);
                        const isSaving = savingId === destinationId;
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