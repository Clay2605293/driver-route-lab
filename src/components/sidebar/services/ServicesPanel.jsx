// src/components/sidebar/services/ServicesPanel.jsx
import React, { useMemo, useState } from "react";
import ServiceCard from "./ServiceCard";
import useServices from "../../../hooks/useServices";

/**
 * ServicesPanel
 *
 * Vista de “On-route services”:
 * - Modo LIST: muestra filtros + lista de ServiceCard.
 * - Modo DETAIL: reemplaza la lista por el detalle del servicio seleccionado.
 *
 * El cambio entre modos se controla con `viewMode`:
 *   - "list"   → solo se ve la lista.
 *   - "detail" → solo se ve el detalle + botón Back.
 */
function ServicesPanel() {
  const { services, summary } = useServices();

  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [typeFilter, setTypeFilter] = useState("all"); // all | gas_station | tire_shop | workshop
  const [viewMode, setViewMode] = useState("list"); // "list" | "detail"

  const handleSelectService = (serviceId) => {
    setSelectedServiceId(serviceId);
    setViewMode("detail");
  };

  const handleBackToList = () => {
    setViewMode("list");
  };

  const filteredServices = useMemo(() => {
    if (typeFilter === "all") return services;
    return services.filter((s) => s.type === typeFilter);
  }, [services, typeFilter]);

  const selectedService =
    filteredServices.find((s) => s.id === selectedServiceId) ||
    services.find((s) => s.id === selectedServiceId) ||
    null;

  const formatDistance = (km) => {
    if (km == null) return "-";
    if (km < 1) return `${Math.round(km * 1000)} m`;
    return `${km.toFixed(1)} km`;
  };

  const formatDuration = (minutes) => {
    if (minutes == null) return "-";
    if (minutes < 1) return "< 1 min";
    return `${Math.round(minutes)} min`;
  };

  return (
    <div className="services-panel">
      {/* Header: resumen + contexto de cobertura */}
      <header className="services-panel__header">
        <div className="services-panel__summary">
          <h2 className="services-panel__title">On-route services</h2>
          <p className="services-panel__description">
            Find nearby gas stations, tire shops and workshops along your
            operating area.
          </p>

          <div className="services-panel__metrics">
            <div className="services-panel__metric">
              <span className="services-panel__metric-label">Total services</span>
              <span className="services-panel__metric-value">
                {summary.totalServices}
              </span>
            </div>
            <div className="services-panel__metric">
              <span className="services-panel__metric-label">Gas stations</span>
              <span className="services-panel__metric-value">
                {summary.countByType.gas_station}
              </span>
            </div>
            <div className="services-panel__metric">
              <span className="services-panel__metric-label">Tire shops</span>
              <span className="services-panel__metric-value">
                {summary.countByType.tire_shop}
              </span>
            </div>
            <div className="services-panel__metric">
              <span className="services-panel__metric-label">Workshops</span>
              <span className="services-panel__metric-value">
                {summary.countByType.workshop}
              </span>
            </div>
          </div>
        </div>

        <div className="services-panel__context">
          <span className="services-panel__context-label">Coverage radius</span>
          <span className="services-panel__context-value">
            {summary.coverageLabel}
          </span>
          <p className="services-panel__context-hint">
            Services are simulated within a realistic driving radius around your
            current operating area.
          </p>
        </div>
      </header>

      {/* Body: drill-in (lista o detalle, nunca los dos a la vez) */}
      <div className="services-panel__body">
        {/* LISTA */}
        <div
          className={
            "services-panel__column services-panel__column--list" +
            (viewMode === "detail" ? " services-panel__column--hidden" : "")
          }
        >
          {/* Filtros de tipo */}
          <div className="services-panel__filters">
            <span className="services-panel__filters-label">Service type</span>
            <div className="services-panel__filters-pills">
              <button
                type="button"
                className={
                  "services-panel__filter-pill" +
                  (typeFilter === "all"
                    ? " services-panel__filter-pill--active"
                    : "")
                }
                onClick={() => setTypeFilter("all")}
              >
                All
              </button>
              <button
                type="button"
                className={
                  "services-panel__filter-pill" +
                  (typeFilter === "gas_station"
                    ? " services-panel__filter-pill--active"
                    : "")
                }
                onClick={() => setTypeFilter("gas_station")}
              >
                Gas stations
              </button>
              <button
                type="button"
                className={
                  "services-panel__filter-pill" +
                  (typeFilter === "tire_shop"
                    ? " services-panel__filter-pill--active"
                    : "")
                }
                onClick={() => setTypeFilter("tire_shop")}
              >
                Tire shops
              </button>
              <button
                type="button"
                className={
                  "services-panel__filter-pill" +
                  (typeFilter === "workshop"
                    ? " services-panel__filter-pill--active"
                    : "")
                }
                onClick={() => setTypeFilter("workshop")}
              >
                Workshops
              </button>
            </div>
          </div>

          {/* Lista de servicios */}
          <div className="services-panel__list">
            {filteredServices.length === 0 ? (
              <div className="services-panel__empty">
                <h3 className="services-panel__empty-title">
                  No services found
                </h3>
                <p className="services-panel__empty-text">
                  Try switching the service type filter to see more options
                  along your route.
                </p>
              </div>
            ) : (
              filteredServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  isSelected={service.id === selectedServiceId}
                  onSelect={() => handleSelectService(service.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* DETALLE */}
        <div
          className={
            "services-panel__column services-panel__column--detail" +
            (viewMode === "list" ? " services-panel__column--hidden" : "")
          }
        >
          {selectedService ? (
            <div className="services-panel__detail">
              {/* Botón Back siempre visible en detalle */}
              <button
                type="button"
                className="services-panel__back-button"
                onClick={handleBackToList}
              >
                ← Back to services
              </button>

              <h3 className="services-panel__detail-title">
                Selected service
              </h3>
              <p className="services-panel__detail-name">
                {selectedService.name}
              </p>

              <div className="services-panel__detail-row">
                <div className="services-panel__detail-field">
                  <span className="services-panel__detail-label">Type</span>
                  <span className="services-panel__detail-value">
                    {selectedService.typeLabel}
                  </span>
                </div>
                <div className="services-panel__detail-field">
                  <span className="services-panel__detail-label">
                    Distance from you
                  </span>
                  <span className="services-panel__detail-value">
                    {formatDistance(selectedService.distanceKm)}
                  </span>
                </div>
              </div>

              <div className="services-panel__detail-row">
                <div className="services-panel__detail-field">
                  <span className="services-panel__detail-label">
                    ETA by car
                  </span>
                  <span className="services-panel__detail-value">
                    {formatDuration(selectedService.estimatedTimeMin)}
                  </span>
                </div>
                <div className="services-panel__detail-field">
                  <span className="services-panel__detail-label">Area</span>
                  <span className="services-panel__detail-value">
                    {selectedService.areaLabel}
                  </span>
                </div>
              </div>

              <div className="services-panel__detail-row services-panel__detail-row--flags">
                <div className="services-panel__flag">
                  <span className="services-panel__flag-dot services-panel__flag-dot--primary" />
                  <span className="services-panel__flag-label">
                    {selectedService.is24h ? "Open 24/7" : "Limited hours"}
                  </span>
                </div>
                {selectedService.hasTowing && (
                  <div className="services-panel__flag">
                    <span className="services-panel__flag-dot services-panel__flag-dot--secondary" />
                    <span className="services-panel__flag-label">
                      Towing / roadside assistance available
                    </span>
                  </div>
                )}
              </div>

              <p className="services-panel__detail-note">
                Once route planning is connected, selecting{" "}
                <strong>{selectedService.name}</strong> will highlight the
                shortest path on the map using the same routing engine as your
                client trips.
              </p>

              <div className="services-panel__detail-actions">
                <button
                  type="button"
                  className="services-panel__primary-button"
                >
                  Preview route to this service
                </button>
                <button
                  type="button"
                  className="services-panel__secondary-button"
                  onClick={() => {
                    console.debug("ServicesPanel: toggleVoronoi clicked");
                    window.dispatchEvent(new CustomEvent("toggleVoronoi"));
                  }}
                >
                  Show coverage area (Voronoi)
                </button>
              </div>
            </div>
          ) : (
            <div className="services-panel__detail services-panel__detail--empty">
              <h3 className="services-panel__detail-title">
                Select a service point
              </h3>
              <p className="services-panel__detail-text">
                Use the filters to browse nearby services and select one to see
                its details and plan a route from your current position.
              </p>
              <button
                type="button"
                className="services-panel__back-button"
                onClick={handleBackToList}
              >
                ← Back to services
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ServicesPanel;
