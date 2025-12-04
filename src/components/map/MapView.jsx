// src/components/map/MapView.jsx
import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Polyline,
  Tooltip,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import useTrips from "../../hooks/useTrips";

/**
 * MapView
 *
 * Ahora:
 * - Consume /api/demo/trips via useTrips
 * - Muestra markers para pickup y destination de cada trip
 * - Al hacer click en un marker se selecciona el trip y se dibuja la polyline pickup->destination
 */
function MapView() {
  const defaultCenter = [20.6736, -103.344];
  const initialZoom = 12.5;

  const { trips, loading } = useTrips();
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);

  // defensivo: asegurarnos de que sea un array
  const tripsArray = Array.isArray(trips)
    ? trips
    : (trips && Array.isArray(trips.points))
    ? trips.points
    : (trips && Array.isArray(trips.results))
    ? trips.results
    : [];

  useEffect(() => {
    const trip = tripsArray.find((t) => (t.id ?? t.index ?? t.client_id) === selectedTripId);
    if (!trip || !mapInstance) return;

    const p = trip.pickup ? [trip.pickup.lat, trip.pickup.lon] : null;
    const d = trip.destination ? [trip.destination.lat, trip.destination.lon] : null;
    if (p && d) {
      try {
        mapInstance.fitBounds([p, d], { padding: [40, 40] });
      } catch (e) {}
    }
  }, [selectedTripId, tripsArray, mapInstance]);

  const selectedTrip = tripsArray.find((t) => (t.id ?? t.index ?? t.client_id) === selectedTripId) || null;
  const polylinePositions = selectedTrip && selectedTrip.pickup && selectedTrip.destination
    ? [
        [selectedTrip.pickup.lat, selectedTrip.pickup.lon],
        [selectedTrip.destination.lat, selectedTrip.destination.lon],
      ]
    : null;

  return (
    <div className="map-view">
      <MapContainer
        center={defaultCenter}
        zoom={initialZoom}
        scrollWheelZoom
        className="map-view__map"
        whenCreated={setMapInstance}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {tripsArray.map((t, idx) => {
          const pickup = t.pickup || t.pickupLocation || t.pickup_point;
          const destination = t.destination || t.dropoff || t.destination_point;
          const id = t.id ?? t.index ?? `trip_${idx}`;
          if (!pickup || !destination) return null;

          return (
            <React.Fragment key={id}>
              <CircleMarker
                center={[pickup.lat, pickup.lon]}
                radius={6}
                pathOptions={{ color: "#F2994A", fillColor: "#F2994A", fillOpacity: 0.95 }}
                eventHandlers={{ click: () => setSelectedTripId(id) }}
              >
                <Tooltip direction="top">{t.client_name ?? t.clientName ?? `Trip ${id}`} (pickup)</Tooltip>
              </CircleMarker>

              <CircleMarker
                center={[destination.lat, destination.lon]}
                radius={6}
                pathOptions={{ color: "#56CCF2", fillColor: "#56CCF2", fillOpacity: 0.95 }}
                eventHandlers={{ click: () => setSelectedTripId(id) }}
              >
                <Tooltip direction="top">{t.client_name ?? t.clientName ?? `Trip ${id}`} (destination)</Tooltip>
              </CircleMarker>
            </React.Fragment>
          );
        })}

        {polylinePositions && (
          <Polyline positions={polylinePositions} pathOptions={{ color: "#F2994A", weight: 3, opacity: 0.8 }} />
        )}
      </MapContainer>

      <div className="map-view__overlay">
        <div className="map-view__overlay-card">
          <h3 className="map-view__overlay-title">Map preview</h3>
          <p className="map-view__overlay-text">
            {loading ? "Loading trips..." : "Click a pickup or destination marker to select a trip and show its route."}
          </p>
        </div>
      </div>
    </div>
  );
}

export default MapView;
