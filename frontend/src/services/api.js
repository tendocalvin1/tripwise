const API_BASE_URL = "http://127.0.0.1:8000/api";


export async function loginUser(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email,
            password,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.detail || "Login failed. Please check your credentials."
        );
    }

    return data;
}


export async function getTrips(accessToken) {
    const response = await fetch(`${API_BASE_URL}/trips/`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "Failed to fetch trips.");
    }

    return data;
}


export async function createTrip(accessToken, tripData) {
    const response = await fetch(`${API_BASE_URL}/trips/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(tripData),
    });

    const data = await response.json();

    if (!response.ok) {
        const firstError = Object.values(data)[0];

        throw new Error(
            Array.isArray(firstError)
                ? firstError[0]
                : "Failed to create trip."
        );
    }

    return data;
}


export async function getDestinations(accessToken) {
    const response = await fetch(`${API_BASE_URL}/destinations/`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.detail || "Failed to fetch destinations."
        );
    }

    return data;
}


export async function getTrip(accessToken, tripId) {
    const response = await fetch(
        `${API_BASE_URL}/trips/${tripId}/`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.detail || "Failed to fetch trip."
        );
    }

    return data;
}


export async function getItineraryItems(
    accessToken,
    tripId
) {
    const response = await fetch(
        `${API_BASE_URL}/itinerary-items/?trip=${tripId}`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.detail || "Failed to fetch itinerary items."
        );
    }

    return data;
}


export async function createItineraryItem(
    accessToken,
    itineraryData
) {
    const response = await fetch(
        `${API_BASE_URL}/itinerary-items/`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(itineraryData),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        console.error(
            "CREATE ITINERARY ERROR:",
            data
        );

        const firstError = Object.values(data)[0];

        throw new Error(
            Array.isArray(firstError)
                ? firstError[0]
                : typeof firstError === "string"
                    ? firstError
                    : JSON.stringify(data)
        );
    }

    return data;
}


export async function updateItineraryItem(
    accessToken,
    itineraryId,
    itineraryData
) {
    const response = await fetch(
        `${API_BASE_URL}/itinerary-items/${itineraryId}/`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(itineraryData),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        console.error(
            "UPDATE ITINERARY ERROR:",
            data
        );

        const firstError = Object.values(data)[0];

        throw new Error(
            Array.isArray(firstError)
                ? firstError[0]
                : typeof firstError === "string"
                    ? firstError
                    : JSON.stringify(data)
        );
    }

    return data;
}


export async function deleteItineraryItem(
    accessToken,
    itineraryId
) {
    const response = await fetch(
        `${API_BASE_URL}/itinerary-items/${itineraryId}/`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );

    if (!response.ok) {
        let data = {};

        try {
            data = await response.json();
        } catch {
            // DELETE may return an empty response body
        }

        console.error(
            "DELETE ITINERARY ERROR:",
            data
        );

        throw new Error(
            data.detail ||
            "Failed to delete itinerary item."
        );
    }
}


/* =========================
   BUDGET
   ========================= */


export async function getBudgetItems(
    accessToken,
    tripId
) {
    const response = await fetch(
        `${API_BASE_URL}/budget-items/?trip=${tripId}`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.detail ||
            "Failed to fetch budget items."
        );
    }

    return data;
}


export async function createBudgetItem(
    accessToken,
    budgetData
) {
    const response = await fetch(
        `${API_BASE_URL}/budget-items/`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(budgetData),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        console.error(
            "CREATE BUDGET ERROR:",
            data
        );

        const firstError = Object.values(data)[0];

        throw new Error(
            Array.isArray(firstError)
                ? firstError[0]
                : typeof firstError === "string"
                    ? firstError
                    : JSON.stringify(data)
        );
    }

    return data;
}


export async function updateBudgetItem(
    accessToken,
    budgetId,
    budgetData
) {
    const response = await fetch(
        `${API_BASE_URL}/budget-items/${budgetId}/`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(budgetData),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        console.error("UPDATE BUDGET ERROR:", data);

        const firstError = Object.values(data)[0];

        throw new Error(
            Array.isArray(firstError)
                ? firstError[0]
                : typeof firstError === "string"
                    ? firstError
                    : JSON.stringify(data)
        );
    }

    return data;
}

export async function deleteBudgetItem(
    accessToken,
    budgetId
) {
    const response = await fetch(
        `${API_BASE_URL}/budget-items/${budgetId}/`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );

    if (!response.ok) {
        let data = {};

        try {
            data = await response.json();
        } catch {

        console.error("DELETE BUDGET ERROR:", data);}

        throw new Error(
            data.detail || "Failed to delete budget item."
        );
    }
}