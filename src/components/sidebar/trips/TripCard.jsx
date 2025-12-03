// src/components/sidebar/trips/TripCard.jsx
import React from "react";

/**
 * TripCard
 *
 * Tarjeta plana que resume un viaje:
 * - Cliente
 * - Pickup y dropoff
 * - Distancia y tiempo estimado
 * - Categoría de longitud (short/medium/long)
 * - Estado del viaje
 *
 * Props:
 * - trip: objeto con al menos:
 *   - id: string
 *   - clientName: string
 *   - pickupLabel: string
 *   - dropoffLabel: string
 *   - estimatedDistanceKm: number
 *   - estimatedDurationMin: number
 *   - lengthCategory: "short" | "medium" | "long"
 *   - status: "pending" | "in_progress" | "completed"
 * - isSelected: boolean que indica si esta tarjeta está activa.
 * - onSelect: función() -> void, se ejecuta al hacer clic.
 */
function TripCard({ trip, isSelected, onSelect }) {
  const {
    clientName,
    pickupLabel,
    dropoffLabel,
    estimatedDistanceKm,
    estimatedDurationMin,
    lengthCategory,
    status,
  } = trip;

  const formatDistance = (km) => {
    if (km < 1) {
      return `${Math.round(km * 1000)} m`;
    }
    return `${km.toFixed(1)} km`;
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${Math.round(minutes)} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (mins === 0) {
      return `${hours} h`;
    }
    return `${hours} h ${mins} min`;
  };

  const lengthLabel = (() => {
    if (lengthCategory === "short") return "Short trip";
    if (lengthCategory === "medium") return "Medium trip";
    if (lengthCategory === "long") return "Long trip";
    return "Trip";
  })();

  const statusLabel = (() => {
    if (status === "pending") return "Pending";
    if (status === "in_progress") return "In progress";
    if (status === "completed") return "Completed";
    return "Unknown";
  })();

  return (
    <button
      type="button"
      className={
        "trip-card" + (isSelected ? " trip-card--selected" : "")
      }
      onClick={onSelect}
    >
      {/* Primera fila: cliente + badges */}
      <div className="trip-card__header">
        <div className="trip-card__client">
          <span className="trip-card__client-label">Client</span>
          <span className="trip-card__client-name">{clientName}</span>
        </div>

        <div className="trip-card__badges">
          <span className={`trip-card__badge trip-card__badge--length-${lengthCategory}`}>
            {lengthLabel}
          </span>
          <span className={`trip-card__badge trip-card__badge--status-${status}`}>
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Segunda fila: origen y destino */}
      <div className="trip-card__route">
        <div className="trip-card__endpoint">
          <span className="trip-card__endpoint-label">Pickup</span>
          <span className="trip-card__endpoint-value">{pickupLabel}</span>
        </div>
        <div className="trip-card__endpoint">
          <span className="trip-card__endpoint-label">Dropoff</span>
          <span className="trip-card__endpoint-value">{dropoffLabel}</span>
        </div>
      </div>

      {/* Tercera fila: distancia y tiempo estimado */}
      <div className="trip-card__footer">
        <div className="trip-card__metric">
          <span className="trip-card__metric-label">Distance</span>
          <span className="trip-card__metric-value">
            {formatDistance(estimatedDistanceKm)}
          </span>
        </div>
        <div className="trip-card__metric">
          <span className="trip-card__metric-label">Estimated time</span>
          <span className="trip-card__metric-value">
            {formatDuration(estimatedDurationMin)}
          </span>
        </div>
      </div>
    </button>
  );
}

export default TripCard;
