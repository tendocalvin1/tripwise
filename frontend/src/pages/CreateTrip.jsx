import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTrip, getDestinations } from "../services/api";

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

                console.log("DESTINATIONS RESPONSE:", data);

                const destinationList = data.results || data;

                console.log("DESTINATION LIST:", destinationList);

                setDestinations(destinationList);
            } catch (error) {
                console.error("DESTINATIONS ERROR:", error);
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
        <div>
            <h1>Create Trip</h1>

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Trip Name</label>

                    <input
                        type="text"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        required
                    />
                </div>

                <div>
                    <label>Destination</label>

                    {loadingDestinations ? (
                        <p>Loading destinations...</p>
                    ) : destinations.length === 0 ? (
                        <p>No destinations available.</p>
                    ) : (
                        <select
                            value={destination}
                            onChange={(event) =>
                                setDestination(event.target.value)
                            }
                            required
                        >
                            <option value="">
                                Select a destination
                            </option>

                            {destinations.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.name}, {item.country}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                <div>
                    <label>Start Date</label>

                    <input
                        type="date"
                        value={startDate}
                        onChange={(event) =>
                            setStartDate(event.target.value)
                        }
                        required
                    />
                </div>

                <div>
                    <label>End Date</label>

                    <input
                        type="date"
                        value={endDate}
                        onChange={(event) =>
                            setEndDate(event.target.value)
                        }
                        required
                    />
                </div>

                <div>
                    <label>Notes</label>

                    <textarea
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                    />
                </div>

                {error && <p>{error}</p>}

                <button
                    type="submit"
                    disabled={loading || loadingDestinations}
                >
                    {loading ? "Creating..." : "Create Trip"}
                </button>
            </form>

            <button onClick={() => navigate("/dashboard")}>
                Cancel
            </button>
        </div>
    );
}

export default CreateTrip;