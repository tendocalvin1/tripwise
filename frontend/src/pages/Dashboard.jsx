import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTrips } from "../services/api";

function Dashboard() {
    const navigate = useNavigate();

    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadTrips() {
            const token = localStorage.getItem("accessToken");

            if (!token) {
                navigate("/login");
                return;
            }

            try {
                const data = await getTrips(token);

                setTrips(data.results || data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        }

        loadTrips();
    }, [navigate]);

    function handleLogout() {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        navigate("/login");
    }

    if (loading) {
        return <p>Loading trips...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div>
            <header>
                <h1>Tripwise</h1>

                <button onClick={handleLogout}>
                    Logout
                </button>
            </header>

            <main>
                <div>
                    <h2>Your Trips</h2>

                    <button onClick={() => navigate("/trips/new")}>
                        Create Trip
                    </button>
                </div>

                {trips.length === 0 ? (
                    <p>
                        You don't have any trips yet. Create your first trip!
                    </p>
                ) : (
                    <div>
                        {trips.map((trip) => (
                            <article key={trip.id}>
                                <h3>{trip.name}</h3>

                                <p>
                                    {trip.start_date} → {trip.end_date}
                                </p>

                                <p>
                                    Status: {trip.status}
                                </p>

                                <button
                                    onClick={() =>
                                        navigate(`/trips/${trip.id}`)
                                    }
                                >
                                    View Trip
                                </button>
                            </article>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default Dashboard;