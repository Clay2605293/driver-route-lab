// src/contexts/RouteContext.jsx
import React, { createContext, useContext, useState } from "react";

const RouteContext = createContext(null);

export function RouteProvider({ children }) {
  const [route, setRoute] = useState(null);
  // route: { path_coords: [ {lat, lon}, ... ], meta: { algorithm, distance_m, travel_time_s, ... } }

  return (
    <RouteContext.Provider value={{ route, setRoute }}>
      {children}
    </RouteContext.Provider>
  );
}

export function useRoute() {
  const ctx = useContext(RouteContext);
  if (!ctx) {
    throw new Error("useRoute must be used inside RouteProvider");
  }
  return ctx;
}