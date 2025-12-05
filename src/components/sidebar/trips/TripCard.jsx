// src/components/sidebar/trips/TripCard.jsx
import React from "react";

/**
 * TripCard
 * - Ahora utiliza las propiedades que devuelve el nuevo endpoint demo:
 *   - totalDistanceKm, totalDurationMin, pickupDistanceKm, pickupDurationMin, etc.
 * - Mantiene fallbacks a clientName / pickupLabel / dropoffLabel y a estimatedDistanceKm si vienen.
 */
function TripCard({ trip = {}, isSelected, onSelect }) {
  // campos nuevos (según schema)
  const clientName = trip.clientName ?? trip.client_name ?? "Client";
  const pickupLabel = trip.pickupLabel ?? trip.pickup_label ?? trip.pickupLabelName ?? "Pickup";
  const dropoffLabel = trip.dropoffLabel ?? trip.dropoff_label ?? trip.dropoffLabelName ?? "Dropoff";
  const lengthCategory = trip.lengthCategory ?? trip.length_category ?? "short";
  const status = trip.status ?? "pending";

  // Distancias / tiempos: preferimos los nuevos totals si vienen
  const totalDistanceKm = typeof trip.totalDistanceKm === "number" ? trip.totalDistanceKm : trip.estimatedDistanceKm;
  const totalDurationMin = typeof trip.totalDurationMin === "number" ? trip.totalDurationMin : trip.estimatedDurationMin;

  // pickup/dropoff specific (si quieres mostrar por segmento)
  const pickupDistanceKm = typeof trip.pickupDistanceKm === "number" ? trip.pickupDistanceKm : null;
  const pickupDurationMin = typeof trip.pickupDurationMin === "number" ? trip.pickupDurationMin : null;
  const dropoffDistanceKm = typeof trip.dropoffDistanceKm === "number" ? trip.dropoffDistanceKm : null;
  const dropoffDurationMin = typeof trip.dropoffDurationMin === "number" ? trip.dropoffDurationMin : null;

  // Coordenadas (opcional para map highlight o cálculo adicional)
  const driverLat = trip.driverLat ?? trip.driver_lat;
  const driverLon = trip.driverLon ?? trip.driver_lon;
  const clientLat = trip.clientLat ?? trip.client_lat ?? trip.pickup?.lat ?? trip.pickupLat;
  const clientLon = trip.clientLon ?? trip.client_lon ?? trip.pickup?.lon ?? trip.pickupLon;
  const destinationLat = trip.destinationLat ?? trip.destination_lat ?? trip.dropoff?.lat ?? trip.destinationLat;
  const destinationLon = trip.destinationLon ?? trip.destination_lon ?? trip.dropoff?.lon ?? trip.destinationLon;

  // helper: formato distancia y tiempo
  const formatDistance = (km) => {
    if (km === null || km === undefined || Number.isNaN(km)) return "—";
    if (km < 1) return `${Math.round(km * 1000)} m`;
    return `${Number(km).toFixed(1)} km`;
  };

  const formatDuration = (minutes) => {
    if (minutes === null || minutes === undefined || Number.isNaN(minutes)) return "—";
    if (minutes < 60) return `${Math.round(minutes)} min`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (mins === 0) return `${hours} h`;
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
    return String(status);
  })();

  return (
    <button
      type="button"
      className={"trip-card" + (isSelected ? " trip-card--selected" : "")}
      onClick={onSelect}
    >
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

      <div className="trip-card__footer">
        <div className="trip-card__metric">
          <span className="trip-card__metric-label">Total distance</span>
          <span className="trip-card__metric-value">
            {formatDistance(totalDistanceKm)}
          </span>
        </div>

        <div className="trip-card__metric">
          <span className="trip-card__metric-label">Total time</span>
          <span className="trip-card__metric-value">
            {formatDuration(totalDurationMin)}
          </span>
        </div>
      </div>

      { /* Opcional: mostrar breakdown pickup/dropoff si están presentes */ }
      {(pickupDistanceKm != null || dropoffDistanceKm != null) && (
        <div className="trip-card__breakdown" style={{ marginTop: 8, fontSize: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ color: "#666" }}>Pickup</div>
            <div>{formatDistance(pickupDistanceKm)} · {formatDuration(pickupDurationMin)}</div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ color: "#666" }}>Dropoff</div>
            <div>{formatDistance(dropoffDistanceKm)} · {formatDuration(dropoffDurationMin)}</div>
          </div>
        </div>
      )}
    </button>
  );
}

export default TripCard;
