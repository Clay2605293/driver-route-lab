// src/App.jsx
import React, { useEffect } from "react";
import DriverDashboard from "./pages/DriverDashboard";

// Estilos globales y de layout.
// Aunque aún no tengan contenido, los importamos desde ya
// para centralizar el pipeline de estilos.
import "./styles/base.css";
import "./styles/layout.css";
import "./styles/sidebar.css";
import "./styles/map.css";

function App() {
  // Pequeño detalle de UX: ajustar el título del documento.
  useEffect(() => {
    document.title = "Driver Route Lab";
  }, []);

  return (
    <div className="app-root">
      {/*
        app-root será nuestro contenedor principal.
        En CSS le daremos:
        - Fondo plano
        - Tipografía base
        - Ocupación de toda la pantalla
      */}
      <DriverDashboard />
    </div>
  );
}

export default App;
