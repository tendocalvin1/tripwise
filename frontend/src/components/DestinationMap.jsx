
import { useEffect } from "react";
import {
    MapContainer,
    Marker,
    Popup,
    TileLayer,
    useMap,
} from "react-leaflet";
import L from "leaflet";

import "leaflet/dist/leaflet.css";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIconRetina from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import "./DestinationMap.css";

const destinationIcon = L.icon({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIconRetina,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

function isValidCoordinate(value, min, max) {
    if (value === null || value === undefined || value === "") {
        return false;
    }

    const number = Number(value);

    return Number.isFinite(number) && number >= min && number <= max;
}

function MapViewport({ destinations }) {
    const map = useMap();

    useEffect(() => {
        if (destinations.length === 0) {
            return;
        }

        const points = destinations.map((destination) => [
            Number(destination.latitude),
            Number(destination.longitude),
        ]);

        if (points.length === 1) {
            map.setView(points[0], 10);
        } else {
            map.fitBounds(points, {
                padding: [35, 35],
                maxZoom: 10,
            });
        }
    }, [destinations, map]);

    return null;
}

function DestinationMap({
    destinations = [],
    onPlanDestination,
}) {
    const mappedDestinations = destinations.filter(
        (destination) =>
            isValidCoordinate(destination.latitude, -90, 90) &&
            isValidCoordinate(destination.longitude, -180, 180)
    );

    if (mappedDestinations.length === 0) {
        return (
            <section className="destination-map-empty">
                <h2>No map locations available</h2>
                <p>
                    The destinations matching your search do not have valid
                    coordinates to display on the map.
                </p>
            </section>
        );
    }

    return (
        <section className="destination-map-section">
            <div className="destination-map-heading">
                <div>
                    <h2>Explore the map</h2>
                    <p>
                        Select a marker to discover a destination.
                    </p>
                </div>

                <span className="destination-map-count">
                    {mappedDestinations.length}{" "}
                    {mappedDestinations.length === 1
                        ? "location"
                        : "locations"}
                </span>
            </div>

            <MapContainer
                className="destination-map"
                center={[0.3476, 32.5825]}
                zoom={7}
                scrollWheelZoom={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapViewport destinations={mappedDestinations} />

                {mappedDestinations.map((destination) => (
                    <Marker
                        key={destination.id}
                        position={[
                            Number(destination.latitude),
                            Number(destination.longitude),
                        ]}
                        icon={destinationIcon}
                    >
                        <Popup>
                            <div className="destination-map-popup">
                                <strong>{destination.name}</strong>

                                <p>
                                    {[destination.city, destination.country]
                                        .filter(Boolean)
                                        .join(", ")}
                                </p>

                                {destination.destination_type && (
                                    <span>
                                        {destination.destination_type
                                            .toLowerCase()
                                            .replaceAll("_", " ")}
                                    </span>
                                )}

                                {typeof onPlanDestination === "function" && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            onPlanDestination(destination)
                                        }
                                    >
                                        Plan a trip
                                    </button>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </section>
    );
}

export default DestinationMap;
