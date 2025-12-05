// src/components/sidebar/TripsPanel.jsx
import React, { useState, useMemo } from "react";
import TripList from "./trips/TripList";
import TripDetail from "./trips/TripDetail";
import useTrips from "../../hooks/useTrips";
import client from "../../api/client";
import { useRoute } from "../../contexts/RouteContext";

function TripsPanel() {
  const {
    trips,
    selectedTripId,
    setSelectedTripId,
    summary,
    preferredAlgorithm,
    setPreferredAlgorithm,
  } = useTrips();
  const { setRoute } = useRoute();

  // Vista dentro del panel de trips (solo afecta mobile)
  const [tripViewMode, setTripViewMode] = useState("list"); // "list" | "detail"

  const [distanceFilter, setDistanceFilter] = useState("all"); // all | short | medium | long
  const [searchQuery, setSearchQuery] = useState("");

  const selectedTrip = useMemo(
    () => trips.find((t) => t.id === selectedTripId) || null,
    [trips, selectedTripId]
  );

  const handleSelectTrip = async (tripOrId) => {
    const tripObj =
      tripOrId && typeof tripOrId === "object"
        ? tripOrId
        : trips.find((t) => t.id === tripOrId);
    const tripId = tripObj?.id ?? tripOrId;
    if (!tripId) return;

    setSelectedTripId(tripId);
    setTripViewMode("detail");

    const origin =
      tripObj?.clientLat != null && tripObj?.clientLon != null
        ? { lat: tripObj.clientLat, lon: tripObj.clientLon }
        : tripObj?.pickup?.lat != null && tripObj?.pickup?.lon != null
        ? { lat: tripObj.pickup.lat, lon: tripObj.pickup.lon }
        : null;

    const destination =
      tripObj?.destinationLat != null && tripObj?.destinationLon != null
        ? { lat: tripObj.destinationLat, lon: tripObj.destinationLon }
        : tripObj?.destination?.lat != null && tripObj?.destination?.lon != null
        ? { lat: tripObj.destination.lat, lon: tripObj.destination.lon }
        : null;

    const algorithm = tripObj?.algorithmUsed ?? preferredAlgorithm ?? "astar";

    if (!origin || !destination) {
      setRoute(null);
      return;
    }

    try {
      const payload = {
        origin,
        destination,
        algorithm,
        cost_metric: "time",
      };
      const res = await client.post("/api/route", payload, {
        timeout: 120000000,
      });
      const data = res.data || {};
      const path_coords = Array.isArray(data.path_coords) ? data.path_coords : [];
      setRoute({ path_coords, meta: data });
    } catch (err) {
      console.error("Error fetching /api/route", err);
      setRoute(null);
    }
  };

  const handleBackToTripList = () => {
    setTripViewMode("list");
  };

  // Sólo renderizamos el contenido del panel de viajes.
  return (
    <div className="trips-panel">
      <div className="trips-panel__body">
        <div
          className={
            "trips-panel__column trips-panel__column--list" +
            (tripViewMode === "detail" ? " trips-panel__column--hidden" : "")
          }
        >
          <TripList
            trips={trips}
            selectedTripId={selectedTripId}
            onSelectTrip={handleSelectTrip}
            distanceFilter={distanceFilter}
            setDistanceFilter={setDistanceFilter}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </div>

        <div
          className={
            "trips-panel__column trips-panel__column--detail" +
            (tripViewMode === "list" ? " trips-panel__column--hidden" : "")
          }
        >
          {selectedTrip ? (
            <div className="trip-detail-wrapper">
              <button
                type="button"
                className="trips-panel__back-button"
                onClick={handleBackToTripList}
              >
                ← Back to trips
              </button>
              <TripDetail
                trip={selectedTrip}
                preferredAlgorithm={preferredAlgorithm}
              />
            </div>
          ) : (
            <div className="trips-panel__empty-state">
              <h3 className="trips-panel__empty-title">
                No trip selected yet
              </h3>
              <p className="trips-panel__empty-text">
                Choose a client request from the list to inspect its pickup and
                dropoff routes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TripsPanel;
