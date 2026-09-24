import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTrip, getDestinations } from "../services/api";
import "./CreateTrip.css";

function CreateTrip() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [destination, setDestination] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [notes, setNotes] = useState("");

    const [destinations, setDestinations] = useState([]);
    const [loadingDestinations, setLoadingDestinations] = useState(true);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadDestinations() {
            const accessToken = localStorage.getItem("accessToken");

            if (!accessToken) {
                navigate("/login");
                return;
            }

            try {
                const data = await getDestinations(accessToken);
                setDestinations(data.results || data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoadingDestinations(false);
            }
        }

        loadDestinations();
    }, [navigate]);

    async function handleSubmit(event) {
        event.preventDefault();

        setError("");

        if (endDate < startDate) {
            setError("End date cannot be earlier than start date.");
            return;
        }

        setLoading(true);

        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
            navigate("/login");
            return;
        }

        try {
            await createTrip(accessToken, {
                name,
                destination,
                start_date: startDate,
                end_date: endDate,
                notes,
            });

            navigate("/dashboard");
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="create-trip-page">
            <header className="create-trip-header">
                <h1>Create a trip</h1>
                <p>
                    Add the basics now. You can organize activities and
                    track your budget after creating your trip.
                </p>
            </header>

            <section className="create-trip-card">
                <form className="create-trip-form" onSubmit={handleSubmit}>
                    <div className="create-trip-field">
                        <label htmlFor="trip-name">Trip name</label>
                        <input
                            id="trip-name"
                            type="text"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="e.g. Summer in Nairobi"
                            required
                        />
                    </div>

                    <div className="create-trip-field">
                        <label htmlFor="trip-destination">Destination</label>

                        {loadingDestinations ? (
                            <p className="create-trip-status" role="status">
                                Loading destinations...
                            </p>
                        ) : destinations.length === 0 ? (
                            <p className="create-trip-hint">
                                No destinations available. Try again later.
                            </p>
                        ) : (
                            <select
                                id="trip-destination"
                                value={destination}
                                onChange={(event) =>
                                    setDestination(event.target.value)
                                }
                                required
                            >
                                <option value="">Select a destination</option>

                                {destinations.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.name}, {item.country}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    <div className="create-trip-date-grid">
                        <div className="create-trip-field">
                            <label htmlFor="trip-start-date">Start date</label>
                            <input
                                id="trip-start-date"
                                type="date"
                                value={startDate}
                                onChange={(event) =>
                                    setStartDate(event.target.value)
                                }
                                max={endDate || undefined}
                                required
                            />
                        </div>

                        <div className="create-trip-field">
                            <label htmlFor="trip-end-date">End date</label>
                            <input
                                id="trip-end-date"
                                type="date"
                                value={endDate}
                                onChange={(event) =>
                                    setEndDate(event.target.value)
                                }
                                min={startDate || undefined}
                                required
                            />
                        </div>
                    </div>

                    <div className="create-trip-field">
                        <label htmlFor="trip-notes">Notes</label>
                        <textarea
                            id="trip-notes"
                            value={notes}
                            onChange={(event) => setNotes(event.target.value)}
                            placeholder="Anything you want to remember about this trip..."
                        />
                        <span className="create-trip-hint">
                            Optional
                        </span>
                    </div>

                    {error && (
                        <p className="create-trip-error" role="alert">
                            {error}
                        </p>
                    )}

                    <div className="create-trip-actions">
                        <button
                            className="create-trip-submit"
                            type="submit"
                            disabled={loading || loadingDestinations}
                        >
                            {loading ? "Creating..." : "Create Trip"}
                        </button>

                        <button
                            className="create-trip-cancel"
                            type="button"
                            onClick={() => navigate("/dashboard")}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </section>
        </main>
    );
}

export default CreateTrip;