// src/components/sidebar/Sidebar.jsx
import React from "react";
import SidebarTabs from "./SidebarTabs";
import TripsPanel from "./TripsPanel";
import ServicesPanel from "./services/ServicesPanel";
import LabPanel from "./lab/LabPanel";

/**
 * Sidebar
 *
 * Panel lateral izquierdo del dashboard.
 * Incluye:
 * - Encabezado con título contextual.
 * - Barra de tabs para cambiar entre:
 *   - Viajes (Trips)
 *   - Servicios en ruta (Services)
 *   - Laboratorio (Lab)
 * - Contenedor de contenido que renderiza el panel correspondiente.
 *
 * Props:
 * - activePanel: "trips" | "services" | "lab"
 * - onChangePanel: función(panelId: string) para cambiar el tab activo.
 */
function Sidebar({ activePanel, onChangePanel }) {
  /**
   * Devuelve el subtítulo contextual que aparece debajo del título principal
   * según el panel activo. Así, el chofer entiende qué está viendo sin
   * leer demasiados elementos en la interfaz.
   */
  const getPanelSubtitle = () => {
    switch (activePanel) {
      case "trips":
        return "View pickup and dropoff routes for your clients.";
      case "services":
        return "Find nearby gas stations, tire shops and workshops.";
      case "lab":
        return "Compare search algorithms and performance metrics.";
      default:
        return "";
    }
  };

  /**
   * Renderiza el panel correspondiente a la pestaña seleccionada.
   */
  const renderActivePanel = () => {
    if (activePanel === "trips") {
      return <TripsPanel />;
    }
    if (activePanel === "services") {
      return <ServicesPanel />;
    }
    if (activePanel === "lab") {
      return <LabPanel />;
    }
    // Fallback defensivo, por si acaso.
    return <TripsPanel />;
  };

  return (
    <div className="sidebar">
      {/* Encabezado del sidebar: título y subtítulo contextual */}
      <header className="sidebar__header">
        <div className="sidebar__title-block">
          <h1 className="sidebar__title">Driver console</h1>
          <p className="sidebar__subtitle">{getPanelSubtitle()}</p>
        </div>
      </header>

      {/* Barra de tabs para cambiar de sección */}
      <div className="sidebar__tabs-wrapper">
        <SidebarTabs activePanel={activePanel} onChangePanel={onChangePanel} />
      </div>

      {/* Contenedor scrollable del contenido de cada panel */}
      <div className="sidebar__content">
        {/*
          Este contenedor será scrollable verticalmente en CSS,
          permitiendo que el mapa a la derecha se mantenga visible mientras
          se navega la lista de viajes o servicios.
        */}
        {renderActivePanel()}
      </div>

      {/* Pie de sidebar con pequeño texto de ayuda / estado */}
      <footer className="sidebar__footer">
        <span className="sidebar__footer-label">Simulation mode</span>
        <span className="sidebar__footer-value">
          Data is currently mocked for demonstration.
        </span>
      </footer>
    </div>
  );
}

export default Sidebar;
