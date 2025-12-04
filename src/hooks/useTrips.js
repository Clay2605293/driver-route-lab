// src/hooks/useTrips.js
import { useEffect, useState, useCallback } from "react";
import client from "../api/client";

/**
 * useTrips
 * Consume /api/demo/trips y devuelve lista, loading, error y refresh.
 */
export default function useTrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await client.get("/api/demo/trips");
      setTrips(res.data || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  return { trips, loading, error, refresh: fetchTrips };
}
