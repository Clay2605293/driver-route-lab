// src/hooks/useTripsMock.js
import { useMemo, useState } from "react";

/**
 * useTripsMock
 *
 * Hook que proporciona datos simulados para el panel de viajes.
 * Expone:
 * - trips: lista de viajes
 * - selectedTripId: id del viaje seleccionado
 * - setSelectedTripId: setter para cambiar el viaje seleccionado
 * - summary: métricas de resumen para el encabezado del panel
 * - preferredAlgorithm: algoritmo elegido a alto nivel
 * - setPreferredAlgorithm: setter para cambiar el algoritmo preferido
 *
 * Más adelante, esto se puede reemplazar por un hook que consuma
 * datos reales desde un backend, conservando la misma interfaz.
 */
function useTripsMock() {
  // Datos base simulados: viajes en una ciudad (por ahora hardcodeados).
  const [trips] = useState(() => createMockTrips());

  // Seleccionar el primer viaje por defecto para que el detalle no esté vacío.
  const [selectedTripId, setSelectedTripId] = useState(
    trips.length > 0 ? trips[0].id : null
  );

  // Algoritmo de rutas preferido a nivel de UI.
  const [preferredAlgorithm, setPreferredAlgorithm] = useState("auto");

  // Resumen derivado de la lista de viajes.
  const summary = useMemo(() => {
    const activeTrips = trips.filter(
      (trip) => trip.status === "pending" || trip.status === "in_progress"
    ).length;

    return {
      activeTrips,
      totalClients: trips.length,
      areaLabel: "Urban core, ~10 km radius",
    };
  }, [trips]);

  return {
    trips,
    selectedTripId,
    setSelectedTripId,
    summary,
    preferredAlgorithm,
    setPreferredAlgorithm,
  };
}

/**
 * Crea una lista de viajes simulados con distintos:
 * - Clientes
 * - Orígenes y destinos
 * - Distancias (cortas, medianas, largas)
 * - Estados (pending, in_progress, completed)
 * - Métricas de búsqueda de nodos (KD-tree vs exhaustive)
 *
 * Las distancias están pensadas para mapearse con los rangos del proyecto:
 * - Short: < 1 km
 * - Medium: 1–5 km
 * - Long: > 5 km
 */
function createMockTrips() {
  return [
    {
      id: "TRIP-001",
      clientName: "Ana Martínez",
      pickupLabel: "Av. Patria & Naciones Unidas",
      dropoffLabel: "Andares Shopping District",
      estimatedDistanceKm: 2.8,
      estimatedDurationMin: 12,
      lengthCategory: "medium",
      status: "pending",
      // Breakdown aproximado
      pickupDistanceKm: 0.9,
      pickupDurationMin: 4,
      dropoffDistanceKm: 1.9,
      dropoffDurationMin: 8,
      // Métricas de búsqueda de nodo (simuladas, pero coherentes)
      kdSearchMs: 0.45,
      naiveSearchMs: 22.3,
      // Coordenadas aproximadas (mock, solo para futura integración con el mapa)
      driverLat: 20.702,
      driverLon: -103.405,
      clientLat: 20.707,
      clientLon: -103.412,
      destinationLat: 20.710,
      destinationLon: -103.415,
    },
    {
      id: "TRIP-002",
      clientName: "Luis Gómez",
      pickupLabel: "Parque Metropolitano",
      dropoffLabel: "Plaza del Sol",
      estimatedDistanceKm: 7.4,
      estimatedDurationMin: 24,
      lengthCategory: "long",
      status: "in_progress",
      pickupDistanceKm: 1.2,
      pickupDurationMin: 5,
      dropoffDistanceKm: 6.2,
      dropoffDurationMin: 19,
      kdSearchMs: 0.52,
      naiveSearchMs: 30.1,
      driverLat: 20.673,
      driverLon: -103.437,
      clientLat: 20.676,
      clientLon: -103.429,
      destinationLat: 20.650,
      destinationLon: -103.408,
    },
    {
      id: "TRIP-003",
      clientName: "Carlos Rivera",
      pickupLabel: "Tec de Monterrey GDL Campus",
      dropoffLabel: "La Minerva",
      estimatedDistanceKm: 3.5,
      estimatedDurationMin: 15,
      lengthCategory: "medium",
      status: "pending",
      pickupDistanceKm: 0.7,
      pickupDurationMin: 3,
      dropoffDistanceKm: 2.8,
      dropoffDurationMin: 12,
      kdSearchMs: 0.39,
      naiveSearchMs: 18.7,
      driverLat: 20.737,
      driverLon: -103.455,
      clientLat: 20.736,
      clientLon: -103.454,
      destinationLat: 20.673,
      destinationLon: -103.391,
    },
    {
      id: "TRIP-004",
      clientName: "María López",
      pickupLabel: "Glorieta Chapalita",
      dropoffLabel: "Expo Guadalajara",
      estimatedDistanceKm: 1.2,
      estimatedDurationMin: 6,
      lengthCategory: "short",
      status: "completed",
      pickupDistanceKm: 0.4,
      pickupDurationMin: 2,
      dropoffDistanceKm: 0.8,
      dropoffDurationMin: 4,
      kdSearchMs: 0.33,
      naiveSearchMs: 15.9,
      driverLat: 20.668,
      driverLon: -103.401,
      clientLat: 20.667,
      clientLon: -103.392,
      destinationLat: 20.651,
      destinationLon: -103.391,
    },
    {
      id: "TRIP-005",
      clientName: "Jorge Hernández",
      pickupLabel: "Plaza Patria",
      dropoffLabel: "Auditorio Telmex",
      estimatedDistanceKm: 4.1,
      estimatedDurationMin: 16,
      lengthCategory: "medium",
      status: "pending",
      pickupDistanceKm: 1.0,
      pickupDurationMin: 4,
      dropoffDistanceKm: 3.1,
      dropoffDurationMin: 12,
      kdSearchMs: 0.47,
      naiveSearchMs: 25.2,
      driverLat: 20.706,
      driverLon: -103.392,
      clientLat: 20.708,
      clientLon: -103.387,
      destinationLat: 20.742,
      destinationLon: -103.383,
    },
    {
      id: "TRIP-006",
      clientName: "Sofía Navarro",
      pickupLabel: "Colonia Americana",
      dropoffLabel: "Parque Revolución",
      estimatedDistanceKm: 0.9,
      estimatedDurationMin: 5,
      lengthCategory: "short",
      status: "pending",
      pickupDistanceKm: 0.3,
      pickupDurationMin: 2,
      dropoffDistanceKm: 0.6,
      dropoffDurationMin: 3,
      kdSearchMs: 0.36,
      naiveSearchMs: 17.4,
      driverLat: 20.673,
      driverLon: -103.361,
      clientLat: 20.672,
      clientLon: -103.363,
      destinationLat: 20.676,
      destinationLon: -103.344,
    },
    {
      id: "TRIP-007",
      clientName: "Daniel Torres",
      pickupLabel: "Plaza Galerías",
      dropoffLabel: "Centro Histórico",
      estimatedDistanceKm: 8.2,
      estimatedDurationMin: 28,
      lengthCategory: "long",
      status: "in_progress",
      pickupDistanceKm: 1.5,
      pickupDurationMin: 6,
      dropoffDistanceKm: 6.7,
      dropoffDurationMin: 22,
      kdSearchMs: 0.55,
      naiveSearchMs: 32.8,
      driverLat: 20.674,
      driverLon: -103.430,
      clientLat: 20.682,
      clientLon: -103.431,
      destinationLat: 20.677,
      destinationLon: -103.347,
    },
    {
      id: "TRIP-008",
      clientName: "Paola Castillo",
      pickupLabel: "Centro Zapopan",
      dropoffLabel: "Parque Los Colomos",
      estimatedDistanceKm: 2.0,
      estimatedDurationMin: 9,
      lengthCategory: "medium",
      status: "completed",
      pickupDistanceKm: 0.6,
      pickupDurationMin: 3,
      dropoffDistanceKm: 1.4,
      dropoffDurationMin: 6,
      kdSearchMs: 0.41,
      naiveSearchMs: 21.0,
      driverLat: 20.722,
      driverLon: -103.387,
      clientLat: 20.722,
      clientLon: -103.389,
      destinationLat: 20.702,
      destinationLon: -103.382,
    },
  ];
}

export default useTripsMock;
