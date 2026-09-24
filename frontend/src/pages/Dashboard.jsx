import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTrips } from "../services/api";
import "./Dashboard.css";

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
        return (
            <main className="dashboard-page-state">
                <p>Loading your trips...</p>
            </main>
        );
    }

    if (error) {
        return (
            <main className="dashboard-page-state dashboard-error">
                <p>{error}</p>
            </main>
        );
    }

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <h1 className="dashboard-brand">Tripwise</h1>

                <button
                    className="dashboard-logout"
                    type="button"
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </header>

            <main className="dashboard-content">
                <div className="dashboard-intro">
                    <div>
                        <h2>Your Trips</h2>
                        <p>Keep your travel plans organized in one place.</p>
                    </div>

                    <button
                        className="dashboard-create-button"
                        type="button"
                        onClick={() => navigate("/trips/new")}
                    >
                        + Create Trip
                    </button>
                </div>

                {trips.length === 0 ? (
                    <section className="dashboard-empty-state">
                        <h3>Your next adventure starts here</h3>
                        <p>
                            You don't have any trips yet. Create your first
                            trip to start planning.
                        </p>

                        <button
                            className="dashboard-create-button"
                            type="button"
                            onClick={() => navigate("/trips/new")}
                        >
                            Create your first trip
                        </button>
                    </section>
                ) : (
                    <section className="dashboard-trip-grid">
                        {trips.map((trip) => (
                            <article
                                className="dashboard-trip-card"
                                key={trip.id}
                            >
                                <div>
                                    <h3>{trip.name}</h3>

                                    <p className="dashboard-trip-date">
                                        {trip.start_date} → {trip.end_date}
                                    </p>
                                </div>

                                <span className="dashboard-trip-status">
                                    {trip.status}
                                </span>

                                <button
                                    className="dashboard-view-button"
                                    type="button"
                                    onClick={() =>
                                        navigate(`/trips/${trip.id}`)
                                    }
                                >
                                    View Trip
                                </button>
                            </article>
                        ))}
                    </section>
                )}
            </main>
        </div>
    );
}

export default Dashboard;