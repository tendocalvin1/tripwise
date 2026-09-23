import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    getTrip,
    getItineraryItems,
    createItineraryItem,
    updateItineraryItem,
    deleteItineraryItem,
    getBudgetItems,
    createBudgetItem,
    updateBudgetItem,
    deleteBudgetItem,
} from "../services/api";

function TripDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [trip, setTrip] = useState(null);
    const [itineraryItems, setItineraryItems] = useState([]);
    const [budgetItems, setBudgetItems] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // =========================
    // Itinerary state
    // =========================

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

    // =========================
    // Budget state
    // =========================

    const [showBudgetForm, setShowBudgetForm] = useState(false);

    const [budgetCategory, setBudgetCategory] = useState("");
    const [budgetEstimatedAmount, setBudgetEstimatedAmount] = useState("");
    const [budgetActualAmount, setBudgetActualAmount] = useState(0);

    const [budgetLoading, setBudgetLoading] = useState(false);
    const [budgetError, setBudgetError] = useState("");

    const [editingBudgetId, setEditingBudgetId] = useState(null);

    // =========================
    // Load trip
    // =========================

    useEffect(() => {
        async function loadTrip() {
            const accessToken = localStorage.getItem("accessToken");

            if (!accessToken) {
                navigate("/login");
                return;
            }

            try {
                const tripData = await getTrip(
                    accessToken,
                    id
                );

                const itineraryData = await getItineraryItems(
                    accessToken,
                    id
                );

                const budgetData = await getBudgetItems(
                    accessToken,
                    id
                );

                setTrip(tripData);

                setItineraryItems(
                    itineraryData.results || itineraryData
                );

                setBudgetItems(
                    budgetData.results || budgetData
                );
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        }

        loadTrip();
    }, [id, navigate]);

    // =========================
    // Create itinerary item
    // =========================

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

    // =========================
    // Update itinerary item
    // =========================

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

    // =========================
    // Delete itinerary item
    // =========================

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

    // =========================
    // Edit itinerary item
    // =========================

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

    // =========================
    // Cancel itinerary form
    // =========================

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

    // =========================
    // Create budget item
    // =========================

    async function handleAddBudget(event) {
        event.preventDefault();

        setBudgetError("");
        setBudgetLoading(true);

        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
            navigate("/login");
            return;
        }

        try {
            const newBudgetItem = await createBudgetItem(
                accessToken,
                {
                    trip: id,
                    category: budgetCategory,
                    estimated_amount: budgetEstimatedAmount,
                    actual_amount: budgetActualAmount,
                }
            );

            setBudgetItems((currentItems) => [
                ...currentItems,
                newBudgetItem,
            ]);

            setBudgetCategory("");
            setBudgetEstimatedAmount("");
            setBudgetActualAmount(0);

            setShowBudgetForm(false);
        } catch (error) {
            setBudgetError(error.message);
        } finally {
            setBudgetLoading(false);
        }
    }

    // =========================
    // Update budget item
    // =========================

    async function handleUpdateBudget(event) {
        event.preventDefault();

        setBudgetError("");
        setBudgetLoading(true);

        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
            navigate("/login");
            return;
        }

        try {
            const updatedBudgetItem = await updateBudgetItem(
                accessToken,
                editingBudgetId,
                {
                    trip: id,
                    category: budgetCategory,
                    estimated_amount: budgetEstimatedAmount,
                    actual_amount: budgetActualAmount,
                }
            );

            setBudgetItems((currentItems) =>
                currentItems.map((item) =>
                    item.id === editingBudgetId
                        ? updatedBudgetItem
                        : item
                )
            );

            setEditingBudgetId(null);
            setBudgetCategory("");
            setBudgetEstimatedAmount("");
            setBudgetActualAmount(0);
            setShowBudgetForm(false);
        } catch (error) {
            setBudgetError(error.message);
        } finally {
            setBudgetLoading(false);
        }
    }

    // =========================
    // Delete budget item
    // =========================

    async function handleDeleteBudget(budgetId) {
        const confirmed = window.confirm(
            "Are you sure you want to delete this budget item?"
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
            await deleteBudgetItem(
                accessToken,
                budgetId
            );

            setBudgetItems((currentItems) =>
                currentItems.filter(
                    (item) => item.id !== budgetId
                )
            );

            setBudgetError("");
        } catch (error) {
            setBudgetError(error.message);
        }
    }

    // =========================
    // Edit budget item
    // =========================

    function handleEditBudget(item) {
        setEditingBudgetId(item.id);

        setBudgetCategory(item.category);
        setBudgetEstimatedAmount(item.estimated_amount);
        setBudgetActualAmount(item.actual_amount);

        setBudgetError("");
        setShowBudgetForm(true);
    }

    // =========================
    // Cancel budget form
    // =========================

    function handleCancelBudgetForm() {
        setShowBudgetForm(false);
        setEditingBudgetId(null);

        setBudgetCategory("");
        setBudgetEstimatedAmount("");
        setBudgetActualAmount(0);

        setBudgetError("");
    }

    // =========================
    // Loading state
    // =========================

    if (loading) {
        return <p>Loading trip...</p>;
    }

    // =========================
    // Error state
    // =========================

    if (error) {
        return (
            <div>
                <p>{error}</p>

                <button
                    onClick={() => navigate("/dashboard")}
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    if (!trip) {
        return <p>Trip not found.</p>;
    }

    // =========================
    // Page
    // =========================

    return (
        <div>
            <button
                onClick={() => navigate("/dashboard")}
            >
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

            {/* =========================
                ITINERARY
            ========================= */}

            <h2>Itinerary</h2>

            {itineraryItems.length === 0 ? (
                <p>No itinerary items yet.</p>
            ) : (
                <div>
                    {itineraryItems.map((item) => (
                        <article key={item.id}>
                            <h3>{item.title}</h3>

                            <p>
                                Date: {item.date}
                            </p>

                            {item.start_time &&
                                item.end_time && (
                                    <p>
                                        {item.start_time} →{" "}
                                        {item.end_time}
                                    </p>
                                )}

                            {item.description && (
                                <p>
                                    {item.description}
                                </p>
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
                                        handleDeleteActivity(
                                            item.id
                                        )
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
                        <label>
                            Activity Title
                        </label>

                        <input
                            type="text"
                            value={activityTitle}
                            onChange={(event) =>
                                setActivityTitle(
                                    event.target.value
                                )
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
                                setActivityDate(
                                    event.target.value
                                )
                            }
                            required
                        />
                    </div>

                    <div>
                        <label>
                            Description
                        </label>

                        <textarea
                            value={activityDescription}
                            onChange={(event) =>
                                setActivityDescription(
                                    event.target.value
                                )
                            }
                        />
                    </div>

                    <div>
                        <label>
                            Start Time
                        </label>

                        <input
                            type="time"
                            value={activityStartTime}
                            onChange={(event) =>
                                setActivityStartTime(
                                    event.target.value
                                )
                            }
                        />
                    </div>

                    <div>
                        <label>
                            End Time
                        </label>

                        <input
                            type="time"
                            value={activityEndTime}
                            onChange={(event) =>
                                setActivityEndTime(
                                    event.target.value
                                )
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
                                setActivityOrder(
                                    event.target.value
                                )
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

            {/* =========================
                BUDGET
            ========================= */}

            <h2>Budget</h2>

            {budgetItems.length === 0 ? (
                <p>No budget items yet.</p>
            ) : (
                <div>
                    {budgetItems.map((item) => (
                        <article key={item.id}>
                            <h3>
                                {item.category}
                            </h3>

                            <p>
                                Estimated:{" "}
                                {item.estimated_amount}
                            </p>

                            <p>
                                Actual:{" "}
                                {item.actual_amount}
                            </p>

                            <div>
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleEditBudget(item)
                                    }
                                >
                                    Edit
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        handleDeleteBudget(
                                            item.id
                                        )
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
                    if (showBudgetForm) {
                        handleCancelBudgetForm();
                    } else {
                        setShowBudgetForm(true);
                        setBudgetError("");
                    }
                }}
            >
                {showBudgetForm
                    ? "Cancel"
                    : "Add Budget Item"}
            </button>

            {showBudgetForm && (
                <form
                    onSubmit={
                        editingBudgetId
                            ? handleUpdateBudget
                            : handleAddBudget
                    }
                >
                    <div>
                        <label>
                            Category
                        </label>

                        <select
                            value={budgetCategory}
                            onChange={(event) =>
                                setBudgetCategory(
                                    event.target.value
                                )
                            }
                            required
                        >
                            <option value="">
                                Select category
                            </option>

                            <option value="ACCOMMODATION">
                                Accommodation
                            </option>

                            <option value="TRANSPORTATION">
                                Transportation
                            </option>

                            <option value="FOOD">
                                Food
                            </option>

                            <option value="ACTIVITIES">
                                Activities
                            </option>

                            <option value="SHOPPING">
                                Shopping
                            </option>

                            <option value="OTHER">
                                Other
                            </option>
                        </select>
                    </div>

                    <div>
                        <label>
                            Estimated Amount
                        </label>

                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={
                                budgetEstimatedAmount
                            }
                            onChange={(event) =>
                                setBudgetEstimatedAmount(
                                    event.target.value
                                )
                            }
                            required
                        />
                    </div>

                    <div>
                        <label>
                            Actual Amount
                        </label>

                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={
                                budgetActualAmount
                            }
                            onChange={(event) =>
                                setBudgetActualAmount(
                                    event.target.value
                                )
                            }
                        />
                    </div>

                    {budgetError && (
                        <p>{budgetError}</p>
                    )}

                    <button
                        type="submit"
                        disabled={budgetLoading}
                    >
                        {budgetLoading
                            ? editingBudgetId
                                ? "Updating..."
                                : "Adding..."
                            : editingBudgetId
                                ? "Update Budget Item"
                                : "Save Budget Item"}
                    </button>
                </form>
            )}
        </div>
    );
}

export default TripDetails;