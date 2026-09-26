import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateTrip from "./pages/CreateTrip";
import TripDetails from "./pages/TripDetails";
import Destinations from "./pages/Destinations";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />

    <Route path="/dashboard" element={<Dashboard />} />

    <Route path="/trips/new" element={<CreateTrip />} />

    <Route path="/trips/:id" element={<TripDetails />} />

    <Route path="/destinations" element={<Destinations />} />

    <Route
        path="*"
        element={<Navigate to="/login" replace />}
    />
            </Routes>
        </BrowserRouter>
    );
}

export default App;