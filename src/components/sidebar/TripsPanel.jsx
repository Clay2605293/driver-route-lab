// src/components/sidebar/TripsPanel.jsx
import React, { useState, useMemo } from "react";
import SidebarTabs from "./SidebarTabs";
import TripList from "./trips/TripList";
import TripDetail from "./trips/TripDetail";
import ServicesPanel from "./services/ServicesPanel";
import LabPanel from "./lab/LabPanel";
import useTripsMock from "../../hooks/useTripsMock";

function TripsPanel() {
  const {
    trips,
    selectedTripId,
    setSelectedTripId,
    summary,
    preferredAlgorithm,
    setPreferredAlgorithm,
  } = useTripsMock();

  const [activeTab, setActiveTab] = useState("trips"); // "trips" | "services" | "lab"

  // Nuevo: modo de vista dentro del tab de Trips (solo afecta mobile)
  const [tripViewMode, setTripViewMode] = useState("list"); // "list" | "detail"

  const [distanceFilter, setDistanceFilter] = useState("all"); // all | short | medium | long
  const [searchQuery, setSearchQuery] = useState("");

  const selectedTrip = useMemo(
    () => trips.find((t) => t.id === selectedTripId) || null,
    [trips, selectedTripId]
  );

  const handleSelectTrip = (tripId) => {
      setSelectedTripId(tripId);
      setTripViewMode("detail");
    };

    const handleBackToTripList = () => {
      setTripViewMode("list");
    };

    const renderTripsTab = () => (
      <div className="trips-panel">
        {/* header igual */}

        <div className="trips-panel__body">
          {/* LISTA */}
          <div
            className={
              "trips-panel__column trips-panel__column--list" +
              (tripViewMode === "detail"
                ? " trips-panel__column--hidden"
                : "")
            }
          >
            <TripList
              trips={trips}
              selectedTripId={selectedTripId}
              onSelectTrip={handleSelectTrip}
              distanceFilter={distanceFilter}
              setDistanceFilter={setDistanceFilter}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          </div>

          {/* DETALLE */}
          <div
            className={
              "trips-panel__column trips-panel__column--detail" +
              (tripViewMode === "list"
                ? " trips-panel__column--hidden"
                : "")
            }
          >
            {selectedTrip ? (
              <div className="trip-detail-wrapper">
                <button
                  type="button"
                  className="trips-panel__back-button"
                  onClick={handleBackToTripList}
                >
                  ← Back to trips
                </button>
                <TripDetail
                  trip={selectedTrip}
                  preferredAlgorithm={preferredAlgorithm}
                />
              </div>
            ) : (
              <div className="trips-panel__empty-state">
                <h3 className="trips-panel__empty-title">
                  No trip selected yet
                </h3>
                <p className="trips-panel__empty-text">
                  Choose a client request from the list to inspect its pickup and
                  dropoff routes.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );

  // Tabs principales del sidebar
  return (
    <div className="sidebar">
      <header className="sidebar__header">
        <div className="sidebar__title-block">
          <h1 className="sidebar__title">Driver console</h1>
          <p className="sidebar__subtitle">
            View pickup and dropoff routes for your clients.
          </p>
        </div>
        <div className="sidebar__tabs-wrapper">
          <SidebarTabs activeTab={activeTab} onChangeTab={setActiveTab} />
        </div>
      </header>

      <div className="sidebar__content">
        {activeTab === "trips" && renderTripsTab()}
        {activeTab === "services" && <ServicesPanel />}
        {activeTab === "lab" && <LabPanel />}
      </div>
    </div>
  );
}

export default TripsPanel;
