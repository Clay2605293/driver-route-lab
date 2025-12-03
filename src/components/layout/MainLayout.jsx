// src/components/layout/MainLayout.jsx
import React from "react";
import Sidebar from "../sidebar/Sidebar";
import MapView from "../map/MapView";

/**
 * MainLayout
 *
 * Contenedor principal debajo del Navbar.
 * Se divide en:
 * - Lado izquierdo: Sidebar (tabs: Viajes, Servicios, Laboratorio).
 * - Lado derecho: MapView (mapa interactivo).
 *
 * Aplica un layout tipo "dashboard profesional" en flat design:
 * bloques bien definidos, sin sombras agresivas, con mucho énfasis
 * en la claridad visual.
 *
 * Props:
 * - activePanel: "trips" | "services" | "lab"
 * - onChangePanel: función para cambiar el panel activo desde el sidebar.
 */
function MainLayout({ activePanel, onChangePanel }) {
  return (
    <div className="main-layout">
      <div className="main-layout__inner">
        {/* Columna izquierda: sidebar con tabs y contenido contextual */}
        <aside className="main-layout__sidebar">
          <Sidebar activePanel={activePanel} onChangePanel={onChangePanel} />
        </aside>

        {/* Columna derecha: mapa principal */}
        <section className="main-layout__map">
          {/*
            MapView se enfocará en mostrar el mapa y overlays de rutas.
            MainLayout no se mete con lógica de mapas, solo define el espacio.
          */}
          <MapView />
        </section>
      </div>
    </div>
  );
}

export default MainLayout;
