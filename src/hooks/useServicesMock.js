// src/hooks/useServicesMock.js
import { useMemo, useState } from "react";

/**
 * useServicesMock
 *
 * Hook que proporciona datos simulados para el panel de "On-route services".
 * Expone:
 * - services: lista de servicios cercanos al chofer.
 * - summary: métricas de resumen para el encabezado del panel.
 *
 * Más adelante, se puede reemplazar por un hook que consuma un backend real,
 * manteniendo la misma interfaz.
 */
function useServicesMock() {
  const [services] = useState(() => createMockServices());

  const summary = useMemo(() => {
    const totalServices = services.length;

    const countByType = services.reduce(
      (acc, service) => {
        if (service.type === "gas_station") acc.gas_station += 1;
        else if (service.type === "tire_shop") acc.tire_shop += 1;
        else if (service.type === "workshop") acc.workshop += 1;
        return acc;
      },
      { gas_station: 0, tire_shop: 0, workshop: 0 }
    );

    // Etiqueta descriptiva del radio de cobertura (mock)
    const coverageLabel = "~8 km radius from driver position";

    return {
      totalServices,
      countByType,
      coverageLabel,
    };
  }, [services]);

  return {
    services,
    summary,
  };
}

/**
 * Crea una colección de servicios simulados alrededor de Guadalajara.
 *
 * Tipos de servicio:
 * - gas_station
 * - tire_shop
 * - workshop
 *
 * Campos:
 * - id
 * - type
 * - typeLabel
 * - name
 * - distanceKm
 * - estimatedTimeMin
 * - areaLabel
 * - is24h
 * - hasTowing
 * - lat, lon (para futura integración con el mapa)
 */
function createMockServices() {
  return [
    {
      id: "SRV-001",
      type: "gas_station",
      typeLabel: "Gas station",
      name: "Estación Patria Norte",
      distanceKm: 1.2,
      estimatedTimeMin: 4,
      areaLabel: "Near Periférico Norte",
      is24h: true,
      hasTowing: false,
      lat: 20.704,
      lon: -103.377,
    },
    {
      id: "SRV-002",
      type: "gas_station",
      typeLabel: "Gas station",
      name: "Gasolinera Chapalita",
      distanceKm: 3.4,
      estimatedTimeMin: 9,
      areaLabel: "Chapalita / Lázaro Cárdenas",
      is24h: false,
      hasTowing: false,
      lat: 20.668,
      lon: -103.402,
    },
    {
      id: "SRV-003",
      type: "gas_station",
      typeLabel: "Gas station",
      name: "Estación Minerva Oriente",
      distanceKm: 2.1,
      estimatedTimeMin: 6,
      areaLabel: "Zona Minerva",
      is24h: true,
      hasTowing: true,
      lat: 20.675,
      lon: -103.386,
    },
    {
      id: "SRV-004",
      type: "tire_shop",
      typeLabel: "Tire shop",
      name: "Llantera López y Hnos.",
      distanceKm: 1.8,
      estimatedTimeMin: 5,
      areaLabel: "Avenida Vallarta",
      is24h: false,
      hasTowing: true,
      lat: 20.675,
      lon: -103.370,
    },
    {
      id: "SRV-005",
      type: "tire_shop",
      typeLabel: "Tire shop",
      name: "Llantera Metropolitana",
      distanceKm: 4.6,
      estimatedTimeMin: 12,
      areaLabel: "Zona Parque Metropolitano",
      is24h: false,
      hasTowing: false,
      lat: 20.674,
      lon: -103.428,
    },
    {
      id: "SRV-006",
      type: "workshop",
      typeLabel: "Workshop",
      name: "Taller Mecánico América",
      distanceKm: 2.9,
      estimatedTimeMin: 8,
      areaLabel: "Colonia Americana",
      is24h: false,
      hasTowing: true,
      lat: 20.674,
      lon: -103.360,
    },
    {
      id: "SRV-007",
      type: "workshop",
      typeLabel: "Workshop",
      name: "Taller Centro Histórico",
      distanceKm: 5.2,
      estimatedTimeMin: 15,
      areaLabel: "Centro de Guadalajara",
      is24h: false,
      hasTowing: false,
      lat: 20.676,
      lon: -103.347,
    },
    {
      id: "SRV-008",
      type: "workshop",
      typeLabel: "Workshop",
      name: "Garage Zapopan Norte",
      distanceKm: 6.8,
      estimatedTimeMin: 18,
      areaLabel: "Zapopan / Auditorio Telmex",
      is24h: false,
      hasTowing: true,
      lat: 20.732,
      lon: -103.382,
    },
  ];
}

export default useServicesMock;
