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
        throw new Error(data.detail || "Failed to fetch destinations.");
    }

    return data;
}


export async function getTrip(accessToken, tripId) {
    const response = await fetch(`${API_BASE_URL}/trips/${tripId}/`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "Failed to fetch trip.");
    }

    return data;
}