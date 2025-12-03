// src/components/sidebar/services/ServiceCard.jsx
import React from "react";

/**
 * ServiceCard
 *
 * Tarjeta plana que representa un punto de servicio en ruta:
 * - Tipo de servicio (gas station, tire shop, workshop)
 * - Nombre del lugar
 * - Distancia estimada desde el chofer
 * - Tiempo estimado de llegada
 * - Indicadores de horario y asistencia adicional
 *
 * Props:
 * - service: objeto con al menos:
 *   - id: string
 *   - type: "gas_station" | "tire_shop" | "workshop"
 *   - typeLabel: string
 *   - name: string
 *   - distanceKm: number
 *   - estimatedTimeMin: number
 *   - areaLabel: string
 *   - is24h: boolean
 *   - hasTowing: boolean
 * - isSelected: boolean indicando si esta tarjeta está activa.
 * - onSelect: función() -> void, se ejecuta al hacer clic.
 */
function ServiceCard({ service, isSelected, onSelect }) {
  const {
    type,
    typeLabel,
    name,
    distanceKm,
    estimatedTimeMin,
    areaLabel,
    is24h,
    hasTowing,
  } = service;

  const formatDistance = (km) => {
    if (km < 1) return `${Math.round(km * 1000)} m`;
    return `${km.toFixed(1)} km`;
  };

  const formatDuration = (minutes) => {
    if (minutes < 1) return "< 1 min";
    return `${Math.round(minutes)} min`;
  };

  const typeIcon = (() => {
    if (type === "gas_station") return "⛽";
    if (type === "tire_shop") return "🔧";
    if (type === "workshop") return "🛠️";
    return "📍";
  })();

  return (
    <button
      type="button"
      className={
        "service-card" + (isSelected ? " service-card--selected" : "")
      }
      onClick={onSelect}
    >
      {/* Encabezado: tipo de servicio + nombre */}
      <div className="service-card__header">
        <div className="service-card__type">
          <span className="service-card__type-icon" aria-hidden="true">
            {typeIcon}
          </span>
          <div className="service-card__type-text">
            <span className="service-card__type-label">{typeLabel}</span>
            <span className="service-card__name">{name}</span>
          </div>
        </div>

        <div className="service-card__tags">
          {is24h && (
            <span className="service-card__tag service-card__tag--primary">
              24/7
            </span>
          )}
          {hasTowing && (
            <span className="service-card__tag service-card__tag--secondary">
              Towing
            </span>
          )}
        </div>
      </div>

      {/* Cuerpo: distancia y tiempo */}
      <div className="service-card__body">
        <div className="service-card__metric">
          <span className="service-card__metric-label">Distance</span>
          <span className="service-card__metric-value">
            {formatDistance(distanceKm)}
          </span>
        </div>
        <div className="service-card__metric">
          <span className="service-card__metric-label">ETA</span>
          <span className="service-card__metric-value">
            {formatDuration(estimatedTimeMin)}
          </span>
        </div>
      </div>

      {/* Pie: área / zona */}
      <div className="service-card__footer">
        <span className="service-card__area-label">{areaLabel}</span>
      </div>
    </button>
  );
}

export default ServiceCard;
