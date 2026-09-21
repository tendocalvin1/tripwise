import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    getTrip,
    getItineraryItems,
    createItineraryItem,
    updateItineraryItem,
    deleteItineraryItem,
} from "../services/api";

function TripDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [trip, setTrip] = useState(null);
    const [itineraryItems, setItineraryItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showActivityForm, setShowActivityForm] = useState(false);

    const [activityTitle, setActivityTitle] = useState("");
    const [activityDate, setActivityDate] = useState("");
    const [activityDescription, setActivityDescription] = useState("");
    const [activityStartTime, setActivityStartTime] = useState("");
    const [activityEndTime, setActivityEndTime] = useState("");
    const [activityOrder, setActivityOrder] = useState(1);

    const [activityLoading, setActivityLoading] = useState(false);
    const [activityError, setActivityError] = useState("");

    const [editingActivityId, setEditingActivityId] = useState(null);

    useEffect(() => {
        async function loadTrip() {
            const accessToken = localStorage.getItem("accessToken");

            if (!accessToken) {
                navigate("/login");
                return;
            }

            try {
                const tripData = await getTrip(accessToken, id);

                const itineraryData = await getItineraryItems(
                    accessToken,
                    id
                );

                setTrip(tripData);
                setItineraryItems(
                    itineraryData.results || itineraryData
                );
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        }

        loadTrip();
    }, [id, navigate]);

    async function handleAddActivity(event) {
        event.preventDefault();

        setActivityError("");
        setActivityLoading(true);

        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
            navigate("/login");
            return;
        }

        try {
            const newActivity = await createItineraryItem(
                accessToken,
                {
                    trip: id,
                    date: activityDate,
                    title: activityTitle,
                    description: activityDescription,
                    start_time: activityStartTime || null,
                    end_time: activityEndTime || null,
                    order: Number(activityOrder),
                }
            );

            setItineraryItems((currentItems) => [
                ...currentItems,
                newActivity,
            ]);

            setActivityTitle("");
            setActivityDate("");
            setActivityDescription("");
            setActivityStartTime("");
            setActivityEndTime("");
            setActivityOrder(1);

            setShowActivityForm(false);
        } catch (error) {
            setActivityError(error.message);
        } finally {
            setActivityLoading(false);
        }
    }

    async function handleUpdateActivity(event) {
        event.preventDefault();

        setActivityError("");
        setActivityLoading(true);

        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
            navigate("/login");
            return;
        }

        try {
            const updatedActivity = await updateItineraryItem(
                accessToken,
                editingActivityId,
                {
                    trip: id,
                    date: activityDate,
                    title: activityTitle,
                    description: activityDescription,
                    start_time: activityStartTime || null,
                    end_time: activityEndTime || null,
                    order: Number(activityOrder),
                }
            );

            setItineraryItems((currentItems) =>
                currentItems.map((item) =>
                    item.id === editingActivityId
                        ? updatedActivity
                        : item
                )
            );

            setEditingActivityId(null);

            setActivityTitle("");
            setActivityDate("");
            setActivityDescription("");
            setActivityStartTime("");
            setActivityEndTime("");
            setActivityOrder(1);

            setShowActivityForm(false);
        } catch (error) {
            setActivityError(error.message);
        } finally {
            setActivityLoading(false);
        }
    }

    async function handleDeleteActivity(activityId) {
        const confirmed = window.confirm(
            "Are you sure you want to delete this activity?"
        );

        if (!confirmed) {
            return;
        }

        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
            navigate("/login");
            return;
        }

        try {
            await deleteItineraryItem(
                accessToken,
                activityId
            );

            setItineraryItems((currentItems) =>
                currentItems.filter(
                    (item) => item.id !== activityId
                )
            );

            setActivityError("");
        } catch (error) {
            setActivityError(error.message);
        }
    }

    function handleEditActivity(item) {
        setEditingActivityId(item.id);

        setActivityTitle(item.title);
        setActivityDate(item.date);
        setActivityDescription(item.description || "");
        setActivityStartTime(item.start_time || "");
        setActivityEndTime(item.end_time || "");
        setActivityOrder(item.order);

        setActivityError("");
        setShowActivityForm(true);
    }

    function handleCancelActivityForm() {
        setShowActivityForm(false);
        setEditingActivityId(null);

        setActivityTitle("");
        setActivityDate("");
        setActivityDescription("");
        setActivityStartTime("");
        setActivityEndTime("");
        setActivityOrder(1);

        setActivityError("");
    }

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

            {itineraryItems.length === 0 ? (
                <p>No itinerary items yet.</p>
            ) : (
                <div>
                    {itineraryItems.map((item) => (
                        <article key={item.id}>
                            <h3>{item.title}</h3>

                            <p>Date: {item.date}</p>

                            {item.start_time && item.end_time && (
                                <p>
                                    {item.start_time} → {item.end_time}
                                </p>
                            )}

                            {item.description && (
                                <p>{item.description}</p>
                            )}

                            <div>
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleEditActivity(item)
                                    }
                                >
                                    Edit
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        handleDeleteActivity(item.id)
                                    }
                                >
                                    Delete
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            <button
                type="button"
                onClick={() => {
                    if (showActivityForm) {
                        handleCancelActivityForm();
                    } else {
                        setShowActivityForm(true);
                        setActivityError("");
                    }
                }}
            >
                {showActivityForm
                    ? "Cancel"
                    : "Add Activity"}
            </button>

            {showActivityForm && (
                <form
                    onSubmit={
                        editingActivityId
                            ? handleUpdateActivity
                            : handleAddActivity
                    }
                >
                    <div>
                        <label>Activity Title</label>

                        <input
                            type="text"
                            value={activityTitle}
                            onChange={(event) =>
                                setActivityTitle(event.target.value)
                            }
                            required
                        />
                    </div>

                    <div>
                        <label>Date</label>

                        <input
                            type="date"
                            value={activityDate}
                            onChange={(event) =>
                                setActivityDate(event.target.value)
                            }
                            required
                        />
                    </div>

                    <div>
                        <label>Description</label>

                        <textarea
                            value={activityDescription}
                            onChange={(event) =>
                                setActivityDescription(event.target.value)
                            }
                        />
                    </div>

                    <div>
                        <label>Start Time</label>

                        <input
                            type="time"
                            value={activityStartTime}
                            onChange={(event) =>
                                setActivityStartTime(event.target.value)
                            }
                        />
                    </div>

                    <div>
                        <label>End Time</label>

                        <input
                            type="time"
                            value={activityEndTime}
                            onChange={(event) =>
                                setActivityEndTime(event.target.value)
                            }
                        />
                    </div>

                    <div>
                        <label>Order</label>

                        <input
                            type="number"
                            min="1"
                            value={activityOrder}
                            onChange={(event) =>
                                setActivityOrder(event.target.value)
                            }
                            required
                        />
                    </div>

                    {activityError && (
                        <p>{activityError}</p>
                    )}

                    <button
                        type="submit"
                        disabled={activityLoading}
                    >
                        {activityLoading
                            ? editingActivityId
                                ? "Updating..."
                                : "Adding..."
                            : editingActivityId
                                ? "Update Activity"
                                : "Save Activity"}
                    </button>
                </form>
            )}

            <hr />

            <h2>Budget</h2>

            <p>No budget information yet.</p>

            <button type="button">
                Add Budget Item
            </button>
        </div>
    );
}

export default TripDetails;