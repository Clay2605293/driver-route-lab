// src/components/sidebar/SidebarTabs.jsx
import React from "react";

/**
 * SidebarTabs
 *
 * Barra de pestañas plana para cambiar entre:
 * - Trips (viajes)
 * - Services (servicios en ruta)
 * - Lab (laboratorio de algoritmos)
 *
 * Props:
 * - activePanel: "trips" | "services" | "lab"
 * - onChangePanel: función(panelId: string) -> void
 */
function SidebarTabs({ activePanel, onChangePanel }) {
  const tabs = [
    { id: "trips", label: "Trips" },
    { id: "services", label: "On-route services" },
    { id: "lab", label: "Lab" },
  ];

  const handleClick = (tabId) => {
    if (tabId !== activePanel) {
      onChangePanel(tabId);
    }
  };

  return (
    <nav className="sidebar-tabs" aria-label="Sidebar sections">
      <ul className="sidebar-tabs__list">
        {tabs.map((tab) => {
          const isActive = tab.id === activePanel;

          return (
            <li key={tab.id} className="sidebar-tabs__item">
              <button
                type="button"
                className={
                  "sidebar-tabs__button" +
                  (isActive ? " sidebar-tabs__button--active" : "")
                }
                onClick={() => handleClick(tab.id)}
                aria-pressed={isActive}
              >
                <span className="sidebar-tabs__label">{tab.label}</span>
                {isActive && (
                  <span
                    className="sidebar-tabs__indicator"
                    aria-hidden="true"
                  />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default SidebarTabs;
