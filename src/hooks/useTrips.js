// src/hooks/useTrips.js
import { useEffect, useState, useCallback } from "react";
import client from "../api/client";

/**
 * useTrips
 * - Llama a GET /api/demo/trips (solo en mount o cuando `refresh` se llame explícitamente)
 * - Normaliza respuesta: acepta Array directo o { trips: [...] } u otras variantes
 * - Mantiene estado de selección (selectedTripId) y preferredAlgorithm
 */
export default function useTrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // UI state shared by consumers
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [preferredAlgorithm, setPreferredAlgorithm] = useState("astar");

  const normalize = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.trips)) return data.trips;
    if (Array.isArray(data.points)) return data.points;
    if (Array.isArray(data.results)) return data.results;
    return [];
  };

  // fetchTrips no depende de selectedTripId para evitar refetches automáticos al seleccionar
  const fetchTrips = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await client.get("/api/demo/trips");
      const normalized = normalize(res.data);
      setTrips(normalized);
    } catch (err) {
      setError(err);
      setTrips([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // solo ejecutamos fetchTrips en mount (y cuando refresh sea llamado explícitamente)
  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  // si la lista cambia y el selectedTripId ya no existe, limpiarlo
  useEffect(() => {
    if (selectedTripId == null) return;
    const exists = Array.isArray(trips) && trips.some((t) => (t.id ?? t.index ?? null) === selectedTripId);
    if (!exists) setSelectedTripId(null);
  }, [trips, selectedTripId]);

  const summary = {
    total: Array.isArray(trips) ? trips.length : 0,
  };

  return {
    trips,
    loading,
    error,
    refresh: fetchTrips,
    // UI helpers
    selectedTripId,
    setSelectedTripId,
    preferredAlgorithm,
    setPreferredAlgorithm,
    summary,
  };
}
