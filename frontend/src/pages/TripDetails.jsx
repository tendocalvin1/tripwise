import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getTrip } from "../services/api";

function TripDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadTrip() {
            const accessToken = localStorage.getItem("accessToken");

            if (!accessToken) {
                navigate("/login");
                return;
            }

            try {
                const data = await getTrip(accessToken, id);

                setTrip(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        }

        loadTrip();
    }, [id, navigate]);

    if (loading) {
        return <p>Loading trip...</p>;
    }

    if (error) {
        return (
            <div>
                <p>{error}</p>

                <button onClick={() => navigate("/dashboard")}>
                    Back to Dashboard
                </button>
            </div>
        );
    }

    if (!trip) {
        return <p>Trip not found.</p>;
    }

    return (
        <div>
            <button onClick={() => navigate("/dashboard")}>
                ← Back to Dashboard
            </button>

            <h1>{trip.name}</h1>

            <p>
                {trip.start_date} → {trip.end_date}
            </p>

            <p>Status: {trip.status}</p>

            {trip.notes && (
                <div>
                    <h2>Notes</h2>
                    <p>{trip.notes}</p>
                </div>
            )}

            <hr />

            <h2>Itinerary</h2>

            <p>No itinerary items yet.</p>

            <button>
                Add Activity
            </button>

            <hr />

            <h2>Budget</h2>

            <p>No budget information yet.</p>

            <button>
                Add Budget Item
            </button>
        </div>
    );
}

export default TripDetails;