// src/hooks/useTrips.js
import { useEffect, useState, useCallback } from "react";
import client from "../api/client";

export default function useTrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const normalize = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.points)) return data.points;
    if (Array.isArray(data.results)) return data.results;
    if (Array.isArray(data.trips)) return data.trips;
    return [];
  };

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await client.get("/api/demo/trips");
      const normalized = normalize(res.data);
      setTrips(normalized);
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
