// src/components/sidebar/trips/TripList.jsx
import React, { useMemo, useState } from "react";
import TripCard from "./TripCard";

/**
 * TripList
 *
 * Lista de viajes actuales del chofer.
 * Incluye:
 * - Campo de búsqueda por texto (cliente, origen, destino).
 * - Filtros rápidos por tipo de trayecto (corto, medio, largo).
 * - Listado scrollable de tarjetas de viaje (TripCard).
 *
 * Props:
 * - trips: array de viajes (mock por ahora).
 * - selectedTripId: id del viaje actualmente seleccionado.
 * - onSelectTrip: función(tripId: string) -> void
 */
function TripList({ trips, selectedTripId, onSelectTrip }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [lengthFilter, setLengthFilter] = useState("all"); // "all" | "short" | "medium" | "long"

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleLengthFilterChange = (newFilter) => {
    setLengthFilter(newFilter);
  };

  /**
   * Aplica búsqueda por texto y filtro de longitud en memoria.
   * Para el proyecto real, esto podría moverse al backend si la lista crece mucho.
   */
  const filteredTrips = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return trips.filter((trip) => {
      const matchesLength =
        lengthFilter === "all" || trip.lengthCategory === lengthFilter;

      if (!matchesLength) return false;

      if (term === "") return true;

      const haystack = [
        trip.clientName,
        trip.pickupLabel,
        trip.dropoffLabel,
        trip.id,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [trips, searchTerm, lengthFilter]);

  return (
    <div className="trip-list">
      {/* Controles superiores: búsqueda y filtros rápidos */}
      <div className="trip-list__controls">
        <div className="trip-list__search-group">
          <label className="trip-list__search-label" htmlFor="trip-search">
            Search trips
          </label>
          <input
            id="trip-search"
            type="text"
            className="trip-list__search-input"
            placeholder="Search by client, pickup or destination..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        <div className="trip-list__filters">
          <span className="trip-list__filters-label">Distance</span>
          <div className="trip-list__filters-pills">
            <button
              type="button"
              className={
                "trip-list__filter-pill" +
                (lengthFilter === "all"
                  ? " trip-list__filter-pill--active"
                  : "")
              }
              onClick={() => handleLengthFilterChange("all")}
            >
              All
            </button>
            <button
              type="button"
              className={
                "trip-list__filter-pill" +
                (lengthFilter === "short"
                  ? " trip-list__filter-pill--active"
                  : "")
              }
              onClick={() => handleLengthFilterChange("short")}
            >
              Short
            </button>
            <button
              type="button"
              className={
                "trip-list__filter-pill" +
                (lengthFilter === "medium"
                  ? " trip-list__filter-pill--active"
                  : "")
              }
              onClick={() => handleLengthFilterChange("medium")}
            >
              Medium
            </button>
            <button
              type="button"
              className={
                "trip-list__filter-pill" +
                (lengthFilter === "long"
                  ? " trip-list__filter-pill--active"
                  : "")
              }
              onClick={() => handleLengthFilterChange("long")}
            >
              Long
            </button>
          </div>
        </div>
      </div>

      {/* Lista scrollable de tarjetas de viaje */}
      <div className="trip-list__items">
        {filteredTrips.length === 0 ? (
          <div className="trip-list__empty">
            <h3 className="trip-list__empty-title">No trips found</h3>
            <p className="trip-list__empty-text">
              Try adjusting the search text or distance filter to see more
              client requests.
            </p>
          </div>
        ) : (
          filteredTrips.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              isSelected={trip.id === selectedTripId}
              onSelect={() => onSelectTrip(trip.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default TripList;
