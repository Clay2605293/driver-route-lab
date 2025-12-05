// src/hooks/useServices.js
import { useEffect, useState, useCallback } from "react";
import client from "../api/client";

/**
 * useServices
 *
 * Obtiene hasta `limitPerType` servicios por tipo (gas_station, tire_shop, workshop)
 * y devuelve { services, summary, loading, error, refresh }.
 */
export default function useServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const defaultSummary = {
    totalServices: 0,
    countByType: { gas_station: 0, tire_shop: 0, workshop: 0 },
    coverageLabel: "—",
  };
  const [summary, setSummary] = useState(defaultSummary);

  const fetchServices = useCallback(async (opts = {}) => {
    setLoading(true);
    setError(null);

    const driver_lat = opts.driver_lat ?? 20.673;
    const driver_lon = opts.driver_lon ?? -103.375;
    const limitPerType = opts.limitPerType ?? 10;

    const types = [
      { key: "gas_station", label: "gas_station" },
      { key: "tire_shop", label: "tire_shop" },
      { key: "workshop", label: "workshop" },
    ];

    try {
      // Ejecutar peticiones en paralelo por tipo
      const promises = types.map((t) =>
        client.get("/api/services/nearby", {
          params: {
            driver_lat,
            driver_lon,
            service_type: t.label,
            limit: limitPerType,
          },
        })
      );

      const settled = await Promise.allSettled(promises);

      // recolectar respuestas válidas
      const byType = {};
      const errors = [];
      settled.forEach((s, idx) => {
        const typeKey = types[idx].key;
        if (s.status === "fulfilled") {
          const data = s.value?.data ?? {};
          const list = Array.isArray(data.services) ? data.services : [];
          byType[typeKey] = list;
        } else {
          byType[typeKey] = [];
          errors.push(`${types[idx].key}: ${s.reason?.message ?? JSON.stringify(s.reason)}`);
        }
      });

      // combinar y deduplicar por id (manteniendo el primero encontrado)
      const map = new Map();
      // preferir mantener orden por tipo: gas_station, tire_shop, workshop
      for (const t of types) {
        const arr = byType[t.key] || [];
        for (const svc of arr) {
          const id = svc?.id ?? svc?.osm_id ?? `${svc?.lat}_${svc?.lon}`;
          if (!id) continue;
          if (!map.has(id)) {
            // normalize some fields if needed
            const normalized = {
              ...svc,
              id,
              distanceKm: svc.distanceKm ?? svc.distance_km ?? svc.distance ?? null,
              estimatedTimeMin: svc.estimatedTimeMin ?? svc.estimated_time_min ?? svc.eta_min ?? null,
            };
            map.set(id, normalized);
          }
        }
      }

      const combined = Array.from(map.values());

      // construir summary
      const totalServices = combined.length;
      const countByType = {
        gas_station: (byType.gas_station || []).length,
        tire_shop: (byType.tire_shop || []).length,
        workshop: (byType.workshop || []).length,
      };

      const maxDist = combined.reduce((m, s) => {
        const d = Number(s.distanceKm ?? s.distance_km ?? 0);
        return Number.isFinite(d) ? Math.max(m, d) : m;
      }, 0);

      const coverageLabel = maxDist > 0 ? `~${maxDist.toFixed(1)} km radius` : "~8 km radius";

      setServices(combined);
      setSummary({ totalServices, countByType, coverageLabel });

      if (errors.length > 0) {
        // mantener el resultado pero informar parcialmente
        setError(`Partial error: ${errors.join("; ")}`);
      } else {
        setError(null);
      }
    } catch (err) {
      console.error("fetchServices aggregated error:", err);
      setError(err?.message ?? String(err));
      setServices([]);
      setSummary(defaultSummary);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  return { services, summary, loading, error, refresh: fetchServices };
}
