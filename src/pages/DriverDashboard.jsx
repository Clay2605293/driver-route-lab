// src/pages/DriverDashboard.jsx
import React, { useState } from "react";
import Navbar from "../components/layout/Navbar";
import MainLayout from "../components/layout/MainLayout";
import useTrips from "../hooks/useTrips";

/**
 * DriverDashboard
 *
 * Página principal del sistema "Uber para choferes".
 * Aquí vive el estado global de UI de alto nivel, como:
 * - Qué panel está activo (Viajes, Servicios, Laboratorio).
 *
 * Esta página no sabe todavía nada de backend ni de mapas reales;
 * solo orquesta el layout principal en combinación con MainLayout.
 */
function DriverDashboard() {
  // Panel activo en el sidebar: "trips" | "services" | "lab"
  const [activePanel, setActivePanel] = useState("trips");

  const {
    trips,
    selectedTripId,
    setSelectedTripId,
    summary,
    preferredAlgorithm,
    setPreferredAlgorithm,
  } = useTrips();

  return (
    <div className="driver-dashboard">
      {/* Barra superior fija con el branding y estado del chofer */}
      <Navbar />

      {/* Contenedor principal del mapa + sidebar */}
      <main className="driver-dashboard__main">
        {/*
          MainLayout recibirá:
          - activePanel: qué panel debe mostrarse en el sidebar.
          - onChangePanel: callback para cambiar de pestaña desde el sidebar.
        */}
        <MainLayout
          activePanel={activePanel}
          onChangePanel={setActivePanel}
          // Pasamos los datos de trips hacia MainLayout / MapView / Sidebar
          trips={trips}
          selectedTripId={selectedTripId}
          setSelectedTripId={setSelectedTripId}
          preferredAlgorithm={preferredAlgorithm}
        />
      </main>
    </div>
  );
}

export default DriverDashboard;
