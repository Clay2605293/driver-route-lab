// src/components/layout/Navbar.jsx
import React from "react";

/**
 * Navbar
 *
 * Barra superior fija del sistema.
 * Diseñada en estilo flat:
 * - Fondo sólido.
 * - Tipografía limpia.
 * - Sin sombras duras ni bordes innecesarios.
 *
 * Más adelante puedes conectar esto con:
 * - Datos reales del chofer (nombre, foto).
 * - Selector de ciudad o modo.
 */
function Navbar() {
  // Por ahora, los textos son fijos, pero están pensados para volverse dinámicos.
  const appName = "Driver Route Lab";
  const driverName = "Driver #42";
  const currentCity = "Guadalajara, Jalisco";

  return (
    <header className="navbar">
      {/* Zona izquierda: logo / nombre de la app */}
      <div className="navbar__section navbar__section--left">
        <div className="navbar__logo">
          {/* Pequeño bloque cuadrado como isotipo minimalista */}
          <div className="navbar__logo-mark" aria-hidden="true" />
          <div className="navbar__logo-text">
            <span className="navbar__title">{appName}</span>
            <span className="navbar__subtitle">
              Routing & map exploration for drivers
            </span>
          </div>
        </div>
      </div>

      {/* Zona central: contexto de sesión / ciudad / modo */}
      <div className="navbar__section navbar__section--center">
        <div className="navbar__context">
          <span className="navbar__context-label">Active area</span>
          <span className="navbar__context-value">{currentCity}</span>
        </div>

        {/* Este bloque se puede usar luego para mostrar el modo actual */}
        <div className="navbar__mode">
          <span className="navbar__mode-pill navbar__mode-pill--primary">
            Trips
          </span>
          <span className="navbar__mode-pill navbar__mode-pill--secondary">
            Services on route
          </span>
        </div>
      </div>

      {/* Zona derecha: estado del chofer */}
      <div className="navbar__section navbar__section--right">
        <div className="navbar__status">
          <span className="navbar__status-indicator navbar__status-indicator--online" />
          <span className="navbar__status-text">Online</span>
        </div>

        <div className="navbar__driver-info">
          <div className="navbar__driver-meta">
            <span className="navbar__driver-label">Logged in as</span>
            <span className="navbar__driver-name">{driverName}</span>
          </div>
          <div
            className="navbar__avatar"
            aria-label={`Profile avatar for ${driverName}`}
          >
            {/* Inicial del conductor; luego se puede hacer dinámico. */}
            <span className="navbar__avatar-initial">
              {driverName.charAt(0)}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
