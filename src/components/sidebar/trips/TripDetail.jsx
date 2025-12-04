// src/components/sidebar/trips/TripDetail.jsx
import React from "react";

/**
 * TripDetail
 * Defensive formatting to avoid runtime errors when some numeric fields are missing.
 */
function TripDetail({ trip, preferredAlgorithm }) {
  if (!trip) {
    return null;
  }

  const {
    clientName,
    pickupLabel,
    dropoffLabel,
    estimatedDistanceKm,
    estimatedDurationMin,
    lengthCategory,
    status,
    pickupDistanceKm,
    pickupDurationMin,
    dropoffDistanceKm,
    dropoffDurationMin,
    kdSearchMs,
    naiveSearchMs,
    id,
  } = trip;

  const formatDistance = (km) => {
    if (km === null || km === undefined || Number.isNaN(Number(km))) return "—";
    const n = Number(km);
    if (n < 1) {
      return `${Math.round(n * 1000)} m`;
    }
    return `${n.toFixed(1)} km`;
  };

  const formatDuration = (minutes) => {
    if (minutes === null || minutes === undefined || Number.isNaN(Number(minutes))) return "—";
    const m = Number(minutes);
    if (m < 60) {
      return `${Math.round(m)} min`;
    }
    const hours = Math.floor(m / 60);
    const mins = Math.round(m % 60);
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

  const statusCaption = (() => {
    if (status === "pending") {
      return "The client has requested this trip but pickup has not started yet.";
    }
    if (status === "in_progress") {
      return "You are currently serving this trip.";
    }
    if (status === "completed") {
      return "This trip has already been completed.";
    }
    return "Trip status is not available.";
  })();

  const algorithmLabel = (() => {
    if (preferredAlgorithm === "auto") return "Best option (auto)";
    if (preferredAlgorithm === "astar") return "A* search";
    if (preferredAlgorithm === "ucs") return "Uniform Cost Search";
    if (preferredAlgorithm === "bfs") return "Breadth-First Search";
    if (preferredAlgorithm === "dfs") return "Depth-First Search";
    if (preferredAlgorithm === "iddfs") return "Iterative Deepening DFS";
    return "Unknown";
  })();

  // Valores derivados para pickup/dropoff si no se definieron explícitamente en el mock.
  const pickupKm =
    typeof pickupDistanceKm === "number"
      ? pickupDistanceKm
      : typeof estimatedDistanceKm === "number"
      ? estimatedDistanceKm * 0.25
      : null;

  const dropoffKm =
    typeof dropoffDistanceKm === "number"
      ? dropoffDistanceKm
      : typeof estimatedDistanceKm === "number"
      ? estimatedDistanceKm * 0.75
      : null;

  const pickupMin =
    typeof pickupDurationMin === "number"
      ? pickupDurationMin
      : typeof estimatedDurationMin === "number"
      ? estimatedDurationMin * 0.25
      : null;

  const dropoffMin =
    typeof dropoffDurationMin === "number"
      ? dropoffDurationMin
      : typeof estimatedDurationMin === "number"
      ? estimatedDurationMin * 0.75
      : null;

  const hasSearchMetrics =
    Number.isFinite(kdSearchMs) && Number.isFinite(naiveSearchMs);

  return (
    <div className="trip-detail">
      {/* Encabezado del detalle */}
      <header className="trip-detail__header">
        <div className="trip-detail__title-block">
          <h2 className="trip-detail__title">Trip details</h2>
          <p className="trip-detail__subtitle">
            Detailed breakdown of pickup and dropoff for this client request.
          </p>
        </div>

        <div className="trip-detail__tags">
          <span className={`trip-detail__tag trip-detail__tag--length-${lengthCategory}`}>
            {lengthLabel}
          </span>
          <span className={`trip-detail__tag trip-detail__tag--status-${status}`}>
            {statusLabel}
          </span>
        </div>
      </header>

      {/* Sección: información general del cliente y viaje */}
      <section className="trip-detail__section">
        <h3 className="trip-detail__section-title">Client & journey</h3>
        <div className="trip-detail__section-body">
          <div className="trip-detail__row">
            <div className="trip-detail__field">
              <span className="trip-detail__field-label">Client</span>
              <span className="trip-detail__field-value">{clientName}</span>
            </div>
            <div className="trip-detail__field trip-detail__field--right">
              <span className="trip-detail__field-label">Trip ID</span>
              <span className="trip-detail__field-value trip-detail__field-value--mono">
                {id}
              </span>
            </div>
          </div>

          <div className="trip-detail__row">
            <div className="trip-detail__field">
              <span className="trip-detail__field-label">Pickup location</span>
              <span className="trip-detail__field-value">{pickupLabel}</span>
            </div>
          </div>

          <div className="trip-detail__row">
            <div className="trip-detail__field">
              <span className="trip-detail__field-label">Dropoff location</span>
              <span className="trip-detail__field-value">{dropoffLabel}</span>
            </div>
          </div>

          <div className="trip-detail__row trip-detail__Row--compact">
            <div className="trip-detail__field">
              <span className="trip-detail__field-label">Total distance</span>
              <span className="trip-detail__field-value">
                {formatDistance(estimatedDistanceKm)}
              </span>
            </div>
            <div className="trip-detail__field">
              <span className="trip-detail__field-label">Estimated duration</span>
              <span className="trip-detail__field-value">
                {formatDuration(estimatedDurationMin)}
              </span>
            </div>
          </div>

          <p className="trip-detail__status-caption">{statusCaption}</p>
        </div>
      </section>

      {/* Sección: desglose de pickup y dropoff */}
      <section className="trip-detail__section">
        <h3 className="trip-detail__section-title">Routing breakdown</h3>
        <div className="trip-detail__section-body trip-detail__section-body--split">
          <div className="trip-detail__card trip-detail__card--pickup">
            <h4 className="trip-detail__card-title">Pickup segment</h4>
            <p className="trip-detail__card-text">
              Route from your current position to the client's location.
            </p>
            <div className="trip-detail__metrics-row">
              <div className="trip-detail__metric">
                <span className="trip-detail__metric-label">Distance</span>
                <span className="trip-detail__metric-value">
                  {formatDistance(pickupKm)}
                </span>
              </div>
              <div className="trip-detail__metric">
                <span className="trip-detail__metric-label">Estimated time</span>
                <span className="trip-detail__metric-value">
                  {formatDuration(pickupMin)}
                </span>
              </div>
            </div>
          </div>

          <div className="trip-detail__card trip-detail__card--dropoff">
            <h4 className="trip-detail__card-title">Dropoff segment</h4>
            <p className="trip-detail__card-text">
              Route from the client&apos;s pickup point to the final destination.
            </p>
            <div className="trip-detail__metrics-row">
              <div className="trip-detail__metric">
                <span className="trip-detail__metric-label">Distance</span>
                <span className="trip-detail__metric-value">
                  {formatDistance(dropoffKm)}
                </span>
              </div>
              <div className="trip-detail__metric">
                <span className="trip-detail__metric-label">Estimated time</span>
                <span className="trip-detail__metric-value">
                  {formatDuration(dropoffMin)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección: algoritmos y métricas de búsqueda */}
      <section className="trip-detail__section">
        <h3 className="trip-detail__section-title">Search & algorithms</h3>
        <div className="trip-detail__section-body trip-detail__section-body--grid">
          <div className="trip-detail__card trip-detail__card--algorithm">
            <h4 className="trip-detail__card-title">Preferred algorithm</h4>
            <p className="trip-detail__card-text">
              The map will use this algorithm when computing both pickup and
              dropoff routes.
            </p>
            <div className="trip-detail__highlight">
              <span className="trip-detail__highlight-label">
                Current setting
              </span>
              <span className="trip-detail__highlight-value">
                {algorithmLabel}
              </span>
            </div>
          </div>

          <div className="trip-detail__card trip-detail__card--metrics">
            <h4 className="trip-detail__card-title">Node search performance</h4>
            <p className="trip-detail__card-text">
              Each trip uses the closest graph nodes to your position and the
              client&apos;s position. These values illustrate the impact of
              using a KD-Tree versus an exhaustive search.
            </p>

            {hasSearchMetrics ? (
              <div className="trip-detail__table">
                <div className="trip-detail__table-header">
                  <span className="trip-detail__table-col trip-detail__table-col--method">
                    Method
                  </span>
                  <span className="trip-detail__table-col">Avg time (ms)</span>
                </div>
                <div className="trip-detail__table-row">
                  <span className="trip-detail__table-col trip-detail__table-col--method">
                    KD-Tree
                  </span>
                  <span className="trip-detail__table-col">
                    {Number(kdSearchMs).toFixed(2)}
                  </span>
                </div>
                <div className="trip-detail__table-row">
                  <span className="trip-detail__table-col trip-detail__table-col--method">
                    Exhaustive
                  </span>
                  <span className="trip-detail__table-col">
                    {Number(naiveSearchMs).toFixed(2)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="trip-detail__placeholder">
                <p className="trip-detail__placeholder-text">
                  Search metrics are not available for this trip yet. Once you
                  run KD-Tree vs exhaustive experiments on this dataset, the
                  average times will appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default TripDetail;
