// src/components/map/MapView.jsx
import React, { useEffect, useState, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Polyline,
  Tooltip,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import useTrips from "../../hooks/useTrips";
import { useRoute } from "../../contexts/RouteContext";

function MapView() {
  const defaultCenter = [20.6736, -103.344];
  const initialZoom = 12.5;

  const { trips, loading, selectedTripId, setSelectedTripId } = useTrips();
  const { route } = useRoute();

  const [mapInstance, setMapInstance] = useState(null);

  // Asegurar array
  const tripsArray = Array.isArray(trips)
    ? trips
    : (trips && Array.isArray(trips.points))
    ? trips.points
    : (trips && Array.isArray(trips.results))
    ? trips.results
    : [];

  // --- util helpers ---
  const toNumberPair = (a, b) => [Number(a), Number(b)];

  const haversineKm = ([lat1, lon1], [lat2, lon2]) => {
    if (![lat1, lon1, lat2, lon2].every((v) => Number.isFinite(Number(v)))) return Infinity;
    const toRad = (v) => (v * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // extrae [lat,lon] desde varios formatos comunes
  const extractPointSafely = (p) => {
    if (!p) return null;
    if (Array.isArray(p) && p.length >= 2) return [Number(p[0]), Number(p[1])];
    if (typeof p === "object") {
      // GeoJSON Feature
      if (p.type === "Feature" && Array.isArray(p.geometry?.coordinates)) {
        const c = p.geometry.coordinates;
        // c puede ser [lon,lat] o [lat,lon]; devolver como nos llegue para que la heurística lo decida
        return Array.isArray(c[0]) ? null : [Number(c[0]), Number(c[1])];
      }
      if (Array.isArray(p.geometry?.coordinates)) return [Number(p.geometry.coordinates[0]), Number(p.geometry.coordinates[1])];
      if (Array.isArray(p.coordinates)) return [Number(p.coordinates[0]), Number(p.coordinates[1])];

      const lat = p.lat ?? p.latitude ?? p.latitud ?? p.y ?? p.clientLat ?? null;
      const lon = p.lon ?? p.lng ?? p.longitude ?? p.long ?? p.clientLon ?? null;
      if (lat != null && lon != null) return [Number(lat), Number(lon)];
      if (0 in p && 1 in p) return [Number(p[1]), Number(p[0])];
    }
    return null;
  };

  const mapRawToPairs = (rawCoords) =>
    rawCoords
      .map((p) => {
        if (p && typeof p === "object" && !Array.isArray(p)) {
          if (Array.isArray(p.geometry?.coordinates)) return p.geometry.coordinates;
          if (Array.isArray(p.coordinates)) return p.coordinates;
        }
        return extractPointSafely(p);
      })
      .filter(Boolean)
      .map(([a, b]) => [Number(a), Number(b)]);

  // Encuentra mejor trip comparando start/end contra pickups/destinations
  const scoreTripAgainstPath = (mapped, t) => {
    if (!mapped || mapped.length === 0) return Infinity;
    const pu = t.pickup ?? (t.clientLat != null && t.clientLon != null ? { lat: t.clientLat, lon: t.clientLon } : null);
    const dest = t.destination ?? (t.destinationLat != null && t.destinationLon != null ? { lat: t.destinationLat, lon: t.destinationLon } : null);
    const normPu = pu ? [Number(pu.lat ?? pu.clientLat), Number(pu.lon ?? pu.clientLon)] : null;
    const normDest = dest ? [Number(dest.lat ?? dest.destinationLat ?? dest.clientLat), Number(dest.lon ?? dest.destinationLon ?? dest.clientLon)] : null;

    let score = 0;
    if (normPu) score += haversineKm(mapped[0], normPu);
    if (normDest && mapped.length > 1) score += haversineKm(mapped[mapped.length - 1], normDest);
    return score;
  };

  // Normaliza + decide orientación + intenta emparejar con trip
  const normalizePathCoords = (rawCoords, pickup, destination) => {
    if (!Array.isArray(rawCoords) || rawCoords.length === 0) return null;
    const mapped = mapRawToPairs(rawCoords);
    if (!mapped || mapped.length === 0) return null;

    // normalizar pickup/destination si existen
    const normPickup = pickup && (pickup.lat != null || pickup.clientLat != null)
      ? toNumberPair(pickup.lat ?? pickup.clientLat, pickup.lon ?? pickup.clientLon)
      : null;
    const normDest = destination && (destination.lat != null || destination.destinationLat != null)
      ? toNumberPair(destination.destination?.lat ?? destination.destinationLat ?? destination.lat ?? destination.clientLat, destination.destination?.lon ?? destination.destinationLon ?? destination.lon ?? destination.clientLon)
      : null;

    // si no hay pickup/destination válidos, intentamos emparejar con el mejor trip de la lista
    let usedPickup = normPickup, usedDest = normDest;
    if (!usedPickup && !usedDest && tripsArray.length > 0) {
      // buscar mejor trip para mapped (sin modificar selectedTrip aquí)
      let best = null, bestScore = Infinity;
      for (const t of tripsArray) {
        const sc = scoreTripAgainstPath(mapped, t);
        if (sc < bestScore) { bestScore = sc; best = t; }
      }
      if (best) {
        usedPickup = best.pickup ? [Number(best.pickup.lat), Number(best.pickup.lon)] : (best.clientLat != null ? [Number(best.clientLat), Number(best.clientLon)] : null);
        usedDest = best.destination ? [Number(best.destination.lat), Number(best.destination.lon)] : (best.destinationLat != null ? [Number(best.destinationLat), Number(best.destinationLon)] : null);
        console.debug("normalizePathCoords: matched best trip for path", { tripId: best.id ?? best.index ?? null, score: bestScore, pickup: usedPickup, destination: usedDest });
      }
    }

    const safeHav = (a, b) => (a && b ? haversineKm(a, b) : Infinity);

    let origScore = 0;
    if (usedPickup) origScore += safeHav(mapped[0], usedPickup);
    if (usedDest && mapped.length > 1) origScore += safeHav(mapped[mapped.length - 1], usedDest);

    const inverted = mapped.map(([a, b]) => [Number(b), Number(a)]);
    let invScore = 0;
    if (usedPickup) invScore += safeHav(inverted[0], usedPickup);
    if (usedDest && inverted.length > 1) invScore += safeHav(inverted[inverted.length - 1], usedDest);

    console.debug("normalizePathCoords: scores", { origScore, invScore, usedPickup, usedDest, firstOrig: mapped[0], firstInv: inverted[0], lastOrig: mapped[mapped.length - 1], lastInv: inverted[inverted.length - 1] });

    const THRESH_KM = 0.05;
    const chosen = (invScore + THRESH_KM < origScore) ? inverted : mapped;
    return chosen;
  };

  // --- FIN helpers ---

  const selectedTrip = tripsArray.find((t) => (t.id ?? t.index ?? null) === selectedTripId) || null;
  const rawPath = route && Array.isArray(route.path_coords) ? route.path_coords : null;

  // pathPositions normalizadas (aquí sólo decide orientación)
  const normalizedPath = rawPath ? normalizePathCoords(rawPath, selectedTrip?.pickup ?? selectedTrip, selectedTrip?.destination ?? selectedTrip) : null;

  // Ahora: intento "snappear" endpoints a pickup/destination y autopick si hace falta
  const { finalPath, autoSelectedTripId } = useMemo(() => {
    if (!normalizedPath || normalizedPath.length === 0) return { finalPath: null, autoSelectedTripId: null };

    // calcular candidato mejor trip para esta ruta (mirando inicio/fin)
    let best = null;
    let bestScore = Infinity;
    let secondBest = Infinity;
    for (const t of tripsArray) {
      const sc = scoreTripAgainstPath(normalizedPath, t);
      if (sc < bestScore) { secondBest = bestScore; bestScore = sc; best = t; }
      else if (sc < secondBest) secondBest = sc;
    }

    const bestTripId = best ? (best.id ?? best.index ?? null) : null;
    console.debug("MapView: bestTripForNormalizedPath", { bestTripId, bestScore, secondBest });

    // umbrales para auto-select: mejorScore < 0.5km y diferencia con segundo > 0.2km OR no hay seleccionado actual
    const AUTO_SELECT_SCORE_KM = 0.5;
    const AUTO_SELECT_MARGIN_KM = 0.2;
    const shouldAutoSelect = bestTripId && ( (bestScore < AUTO_SELECT_SCORE_KM && (secondBest - bestScore) > AUTO_SELECT_MARGIN_KM) || !selectedTripId );

    // snap endpoints: si pickup/dest están dentro de 200m (0.2km) del primer/último punto, reemplazarlos
    const SNAP_KM = 0.2;
    let pathCopy = normalizedPath.slice();

    if (best && best.pickup) {
      const pu = [Number(best.pickup.lat), Number(best.pickup.lon)];
      const d0 = haversineKm(pathCopy[0], pu);
      if (d0 <= SNAP_KM) { pathCopy[0] = pu; }
    } else if (best && best.clientLat != null) {
      const pu = [Number(best.clientLat), Number(best.clientLon)];
      if (haversineKm(pathCopy[0], pu) <= SNAP_KM) pathCopy[0] = pu;
    }

    if (best && best.destination) {
      const dest = [Number(best.destination.lat), Number(best.destination.lon)];
      const dend = haversineKm(pathCopy[pathCopy.length - 1], dest);
      if (dend <= SNAP_KM) { pathCopy[pathCopy.length - 1] = dest; }
    } else if (best && best.destinationLat != null) {
      const dest = [Number(best.destinationLat), Number(best.destinationLon)];
      if (haversineKm(pathCopy[pathCopy.length - 1], dest) <= SNAP_KM) pathCopy[pathCopy.length - 1] = dest;
    }

    return { finalPath: pathCopy, autoSelectedTripId: shouldAutoSelect ? bestTripId : null };
  }, [normalizedPath, tripsArray, selectedTripId]);

  // Si auto-selected trip es distinto del seleccionado actualmente, actualizar (una sola vez)
  useEffect(() => {
    if (autoSelectedTripId && (selectedTripId !== autoSelectedTripId)) {
      console.debug("MapView: auto-selecting trip:", autoSelectedTripId);
      setSelectedTripId(autoSelectedTripId);
    }
  }, [autoSelectedTripId, selectedTripId, setSelectedTripId]);

  // logs de llegada de ruta
  useEffect(() => {
    if (!rawPath) return;
    console.debug("MapView: rawPath sample", { tripId: selectedTripId, rawFirst: rawPath[0], rawLast: rawPath[rawPath.length - 1], pathLen: rawPath.length });
  }, [rawPath, selectedTripId]);

  // ajustar vista cuando cambian selection o finalPath
  useEffect(() => {
    if (!mapInstance) return;
    if (finalPath && finalPath.length > 0) {
      try {
        mapInstance.fitBounds(finalPath, { padding: [40, 40] });
        return;
      } catch (e) {
        // ignore
      }
    }
    const trip = selectedTrip;
    if (!trip) return;
    const pickup = trip.pickup || (trip.clientLat != null && trip.clientLon != null ? { lat: trip.clientLat, lon: trip.clientLon } : null);
    const destination = trip.destination || (trip.destinationLat != null && trip.destinationLon != null ? { lat: trip.destinationLat, lon: trip.destinationLon } : null);
    if (pickup && destination) {
      try {
        mapInstance.fitBounds([[pickup.lat, pickup.lon], [destination.lat, destination.lon]], { padding: [40, 40] });
      } catch (e) {}
    }
  }, [selectedTripId, finalPath, tripsArray, mapInstance, selectedTrip]);

  const fallbackPolyline = selectedTrip && (selectedTrip.pickup || selectedTrip.clientLat)
    ? [
        [selectedTrip.pickup?.lat ?? selectedTrip.clientLat, selectedTrip.pickup?.lon ?? selectedTrip.clientLon],
        [selectedTrip.destination?.lat ?? selectedTrip.destinationLat, selectedTrip.destination?.lon ?? selectedTrip.destinationLon],
      ]
    : null;

  const polylineToRender = (finalPath && finalPath.length > 0) ? finalPath : fallbackPolyline;

  return (
    <div className="map-view">
      <MapContainer
        center={defaultCenter}
        zoom={initialZoom}
        scrollWheelZoom
        className="map-view__map"
        whenCreated={setMapInstance}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {tripsArray.map((t, idx) => {
          const pickup = t.pickup || (t.clientLat != null ? { lat: t.clientLat, lon: t.clientLon } : null);
          const destination = t.destination || (t.destinationLat != null ? { lat: t.destinationLat, lon: t.destinationLon } : null);
          const id = t.id ?? t.index ?? `trip_${idx}`;
          if (!pickup || !destination) return null;

          return (
            <React.Fragment key={id}>
              <CircleMarker
                center={[pickup.lat, pickup.lon]}
                radius={6}
                pathOptions={{ color: "#F2994A", fillColor: "#F2994A", fillOpacity: 1.00 }}
                eventHandlers={{ click: () => setSelectedTripId(id) }}
              >
                <Tooltip direction="top">{t.client_name ?? t.clientName ?? `Trip ${id}`} (pickup)</Tooltip>
              </CircleMarker>

              <CircleMarker
                center={[destination.lat, destination.lon]}
                radius={6}
                pathOptions={{ color: "#56CCF2", fillColor: "#56CCF2", fillOpacity: 0.95 }}
                eventHandlers={{ click: () => setSelectedTripId(id) }}
              >
                <Tooltip direction="top">{t.client_name ?? t.clientName ?? `Trip ${id}`} (destination)</Tooltip>
              </CircleMarker>
            </React.Fragment>
          );
        })}

        {polylineToRender && (
          <Polyline
            positions={polylineToRender}
            pathOptions={{ color: "#8A2BE2", weight: 6, opacity: 0.95, lineCap: "round", lineJoin: "round" }}
          />
        )}
      </MapContainer>

      <div className="map-view__overlay">
        <div className="map-view__overlay-card">
          <h3 className="map-view__overlay-title">Map preview</h3>
          <p className="map-view__overlay-text">
            {loading ? "Loading trips..." : "Click a pickup or destination marker to select a trip and show its route."}
          </p>
        </div>
      </div>
    </div>
  );
}

export default MapView;
