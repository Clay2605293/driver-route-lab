// src/hooks/useServices.js
import { useEffect, useState, useCallback } from "react";
import client from "../api/client";

/**
 * useServices
 *
 * Hook que proporciona datos para el panel de "On-route services" consumiendo un backend real.
 * Expone:
 * - services: lista de servicios cercanos al chofer.
 * - loading: estado de carga de los datos.
 * - error: información sobre un posible error en la carga de datos.
 * - refresh: función para volver a cargar los datos manualmente.
 */
export default function useServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Endpoint esperado: /services
      const res = await client.get("/services");
      setServices(res.data || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  return { services, loading, error, refresh: fetchServices };
}
