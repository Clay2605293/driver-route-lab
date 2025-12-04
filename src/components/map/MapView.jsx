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

  useEffect(() => {
    // si hay selección, ajustar bounds para pickup + destination
    const trip = trips.find((t) => t.id === selectedTripId);
    if (!trip || !mapInstance) return;

    const p = [trip.pickup.lat, trip.pickup.lon];
    const d = [trip.destination.lat, trip.destination.lon];
    try {
      mapInstance.fitBounds([p, d], { padding: [40, 40] });
    } catch (e) {
      // ignore
    }
  }, [selectedTripId, trips, mapInstance]);

  // helper para dibujar polyline si hay selección
  const selectedTrip = trips.find((t) => t.id === selectedTripId) || null;
  const polylinePositions = selectedTrip
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

        {trips.map((t) => (
          <React.Fragment key={t.id}>
            <CircleMarker
              center={[t.pickup.lat, t.pickup.lon]}
              radius={6}
              pathOptions={{ color: "#F2994A", fillColor: "#F2994A", fillOpacity: 0.95 }}
              eventHandlers={{
                click: () => setSelectedTripId(t.id),
              }}
            >
              <Tooltip direction="top">{t.client_name} (pickup)</Tooltip>
            </CircleMarker>

            <CircleMarker
              center={[t.destination.lat, t.destination.lon]}
              radius={6}
              pathOptions={{ color: "#56CCF2", fillColor: "#56CCF2", fillOpacity: 0.95 }}
              eventHandlers={{
                click: () => setSelectedTripId(t.id),
              }}
            >
              <Tooltip direction="top">{t.client_name} (destination)</Tooltip>
            </CircleMarker>
          </React.Fragment>
        ))}

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
