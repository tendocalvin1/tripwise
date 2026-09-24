import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./TripDetails.css";
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

    const totalEstimated = budgetItems.reduce(
    (total, item) => total + Number(item.estimated_amount || 0),
    0
);

const totalActual = budgetItems.reduce(
    (total, item) => total + Number(item.actual_amount || 0),
    0
);

const budgetDifference = totalEstimated - totalActual;

function formatAmount(amount) {
    return amount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

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
    <main className="trip-details">
        <button
            className="trip-back-button"
            type="button"
            onClick={() => navigate("/dashboard")}
        >
            ← Back to Dashboard
        </button>

        <header className="trip-header">
            <h1>{trip.name}</h1>

            <p className="trip-date-range">
                {trip.start_date} → {trip.end_date}
            </p>

            <span className="trip-status">
                {trip.status}
            </span>

            {trip.notes && (
                <div className="trip-notes">
                    <h2>Notes</h2>
                    <p>{trip.notes}</p>
                </div>
            )}
        </header>

        <section className="trip-section">
            <div className="trip-section-heading">
                <h2>Itinerary</h2>

                <button
                    className="trip-primary-button"
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
                    {showActivityForm ? "Cancel" : "+ Add Activity"}
                </button>
            </div>

            {itineraryItems.length === 0 ? (
                <div className="trip-empty-state">
                    No itinerary items yet. Add an activity to start planning.
                </div>
            ) : (
                <div className="trip-activity-list">
                    {itineraryItems.map((item) => (
                        <article
                            className="trip-activity-card"
                            key={item.id}
                        >
                            <h3>{item.title}</h3>

                            <p className="trip-activity-meta">
                                {item.date}
                                {item.start_time && ` · ${item.start_time}`}
                                {item.end_time && ` – ${item.end_time}`}
                            </p>

                            {item.description && (
                                <p className="trip-activity-description">
                                    {item.description}
                                </p>
                            )}

                            <div className="trip-card-actions">
                                <button
                                    className="secondary-button"
                                    type="button"
                                    onClick={() => handleEditActivity(item)}
                                >
                                    Edit
                                </button>

                                <button
                                    className="danger-button"
                                    type="button"
                                    onClick={() => handleDeleteActivity(item.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            {showActivityForm && (
                <form
                    className="trip-form"
                    onSubmit={
                        editingActivityId
                            ? handleUpdateActivity
                            : handleAddActivity
                    }
                >
                    <div className="trip-form-field">
                        <label htmlFor="activity-title">Activity title</label>
                        <input
                            id="activity-title"
                            type="text"
                            value={activityTitle}
                            onChange={(event) =>
                                setActivityTitle(event.target.value)
                            }
                            required
                        />
                    </div>

                    <div className="trip-form-field">
                        <label htmlFor="activity-date">Date</label>
                        <input
                            id="activity-date"
                            type="date"
                            value={activityDate}
                            onChange={(event) =>
                                setActivityDate(event.target.value)
                            }
                            required
                        />
                    </div>

                    <div className="trip-form-field">
                        <label htmlFor="activity-description">Description</label>
                        <textarea
                            id="activity-description"
                            value={activityDescription}
                            onChange={(event) =>
                                setActivityDescription(event.target.value)
                            }
                        />
                    </div>

                    <div className="trip-form-field">
                        <label htmlFor="activity-start">Start time</label>
                        <input
                            id="activity-start"
                            type="time"
                            value={activityStartTime}
                            onChange={(event) =>
                                setActivityStartTime(event.target.value)
                            }
                        />
                    </div>

                    <div className="trip-form-field">
                        <label htmlFor="activity-end">End time</label>
                        <input
                            id="activity-end"
                            type="time"
                            value={activityEndTime}
                            onChange={(event) =>
                                setActivityEndTime(event.target.value)
                            }
                        />
                    </div>

                    <div className="trip-form-field">
                        <label htmlFor="activity-order">Order</label>
                        <input
                            id="activity-order"
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
                        <p className="trip-form-error" role="alert">
                            {activityError}
                        </p>
                    )}

                    <div className="trip-card-actions">
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

                        <button
                            className="secondary-button"
                            type="button"
                            onClick={handleCancelActivityForm}
                            disabled={activityLoading}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}
        </section>

        <section className="trip-section">
            <div className="trip-section-heading">
                <h2>Budget</h2>

                <button
                    className="trip-primary-button"
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
                    {showBudgetForm ? "Cancel" : "+ Add Budget Item"}
                </button>
            </div>

            <div className="budget-overview">
    <div className="budget-overview-card">
        <span>Estimated</span>
        <strong>{formatAmount(totalEstimated)}</strong>
    </div>

    <div className="budget-overview-card">
        <span>Actual spent</span>
        <strong>{formatAmount(totalActual)}</strong>
    </div>

    <div className="budget-overview-card">
        <span>
            {budgetDifference >= 0 ? "Remaining" : "Over estimate"}
        </span>
        <strong className={budgetDifference < 0 ? "over-budget" : ""}>
            {formatAmount(Math.abs(budgetDifference))}
        </strong>
    </div>
</div>

            {budgetItems.length === 0 ? (
                <div className="trip-empty-state">
                    No budget items yet. Add an item to track your trip costs.
                </div>
            ) : (
                <div className="trip-budget-list">
                    {budgetItems.map((item) => (
                        <article className="trip-budget-card" key={item.id}>
                            <h3>{item.category}</h3>

                            <p className="trip-activity-meta">
                                Estimated: {item.estimated_amount}
                                {" · "}
                                Actual: {item.actual_amount}
                            </p>

                            <div className="trip-card-actions">
                                <button
                                    className="secondary-button"
                                    type="button"
                                    onClick={() => handleEditBudget(item)}
                                >
                                    Edit
                                </button>

                                <button
                                    className="danger-button"
                                    type="button"
                                    onClick={() => handleDeleteBudget(item.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            {showBudgetForm && (
                <form
                    className="trip-form"
                    onSubmit={
                        editingBudgetId
                            ? handleUpdateBudget
                            : handleAddBudget
                    }
                >
                    <div className="trip-form-field">
                        <label htmlFor="budget-category">Category</label>
                        <select
                            id="budget-category"
                            value={budgetCategory}
                            onChange={(event) =>
                                setBudgetCategory(event.target.value)
                            }
                            required
                        >
                            <option value="">Select category</option>
                            <option value="ACCOMMODATION">Accommodation</option>
                            <option value="TRANSPORTATION">Transportation</option>
                            <option value="FOOD">Food</option>
                            <option value="ACTIVITIES">Activities</option>
                            <option value="SHOPPING">Shopping</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>

                    <div className="trip-form-field">
                        <label htmlFor="budget-estimated">Estimated amount</label>
                        <input
                            id="budget-estimated"
                            type="number"
                            min="0"
                            step="0.01"
                            value={budgetEstimatedAmount}
                            onChange={(event) =>
                                setBudgetEstimatedAmount(event.target.value)
                            }
                            required
                        />
                    </div>

                    <div className="trip-form-field">
                        <label htmlFor="budget-actual">Actual amount</label>
                        <input
                            id="budget-actual"
                            type="number"
                            min="0"
                            step="0.01"
                            value={budgetActualAmount}
                            onChange={(event) =>
                                setBudgetActualAmount(event.target.value)
                            }
                        />
                    </div>

                    {budgetError && (
                        <p className="trip-form-error" role="alert">
                            {budgetError}
                        </p>
                    )}

                    <div className="trip-card-actions">
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

                        <button
                            className="secondary-button"
                            type="button"
                            onClick={handleCancelBudgetForm}
                            disabled={budgetLoading}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}
        </section>
    </main>
);
}

export default TripDetails;