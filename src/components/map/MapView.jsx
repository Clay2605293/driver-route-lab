// src/components/map/MapView.jsx
import React from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Polyline,
  Tooltip,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

/**
 * MapView
 *
 * Contenedor del mapa principal.
 * Por ahora:
 * - Usa coordenadas mock centradas en la zona metropolitana de Guadalajara.
 * - Muestra:
 *   - Un "driver" en azul.
 *   - Varios "clientes" en naranja.
 *   - Una ruta de ejemplo en línea tenue.
 *
 * Más adelante:
 * - Se conectará con el estado real de trips (driver, pickup, dropoff).
 * - Dibujará rutas reales generadas por el backend.
 */
function MapView() {
  // Centro aproximado de la ciudad de Guadalajara
  const mapCenter = [20.6736, -103.344];

  // Zoom inicial cómodo para ver una zona urbana
  const initialZoom = 12.5;

  // Posición mock del chofer
  const driverPosition = [20.673, -103.375];

  // Clientes mock distribuidos alrededor
  const clientPositions = [
    {
      id: "C1",
      label: "Client A",
      coords: [20.682, -103.385],
    },
    {
      id: "C2",
      label: "Client B",
      coords: [20.667, -103.358],
    },
    {
      id: "C3",
      label: "Client C",
      coords: [20.691, -103.345],
    },
    {
      id: "C4",
      label: "Client D",
      coords: [20.658, -103.332],
    },
    {
      id: "C5",
      label: "Client E",
      coords: [20.676, -103.320],
    },
  ];

  // Ejemplo de ruta mock (driver -> un cliente -> destino)
  const exampleRoute = [
    driverPosition,
    clientPositions[0].coords,
    [20.702, -103.330], // destino ficticio
  ];

  return (
    <div className="map-view">
      <MapContainer
        center={mapCenter}
        zoom={initialZoom}
        scrollWheelZoom={true}
        className="map-view__map"
      >
        {/* Capa base */}
        <TileLayer
          // Puedes cambiar este URL por otro estilo de tiles si quieres.
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Driver marker (azul) */}
        <CircleMarker
          center={driverPosition}
          radius={8}
          pathOptions={{ color: "#2F80ED", fillColor: "#2F80ED", fillOpacity: 1 }}
        >
          <Tooltip direction="top" offset={[0, -8]} opacity={0.9}>
            <span>Driver (you)</span>
          </Tooltip>
        </CircleMarker>

        {/* Client markers (naranja) */}
        {clientPositions.map((client) => (
          <CircleMarker
            key={client.id}
            center={client.coords}
            radius={6}
            pathOptions={{ color: "#F2994A", fillColor: "#F2994A", fillOpacity: 0.95 }}
          >
            <Tooltip direction="top" offset={[0, -8]} opacity={0.9}>
              <span>{client.label}</span>
            </Tooltip>
          </CircleMarker>
        ))}

        {/* Ruta de ejemplo (driver -> client A -> destino) */}
        <Polyline
          positions={exampleRoute}
          pathOptions={{ color: "#56CCF2", weight: 4, opacity: 0.8 }}
        />
      </MapContainer>

      {/* Overlay UI plano sobre el mapa */}
      <div className="map-view__overlay">
        <div className="map-view__overlay-card">
          <h3 className="map-view__overlay-title">Map preview</h3>
          <p className="map-view__overlay-text">
            This map shows a mock driver position and several client requests
            around the city. When you select a trip on the left, the pickup and
            dropoff routes will be highlighted here.
          </p>
          <div className="map-view__legend">
            <div className="map-view__legend-item">
              <span className="map-view__legend-dot map-view__legend-dot--driver" />
              <span className="map-view__legend-label">Driver</span>
            </div>
            <div className="map-view__legend-item">
              <span className="map-view__legend-dot map-view__legend-dot--client" />
              <span className="map-view__legend-label">Clients</span>
            </div>
            <div className="map-view__legend-item">
              <span className="map-view__legend-line" />
              <span className="map-view__legend-label">Example route</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MapView;
