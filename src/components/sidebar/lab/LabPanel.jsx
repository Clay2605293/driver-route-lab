// src/components/sidebar/lab/LabPanel.jsx
import React, { useState, useMemo } from "react";
import client from "../../../api/client";

// --- CONFIGURACIÓN DE ESTILOS (Paleta Dark Mode) ---
const THEME = {
  bg: "#0f172a",       // Fondo principal (Slate 900)
  cardBg: "#1e293b",   // Fondo de tarjetas (Slate 800)
  borderColor: "#334155", // Bordes sutiles
  textMain: "#f1f5f9", // Blanco casi puro
  textMuted: "#94a3b8", // Gris azulado
  accentKD: "linear-gradient(90deg, #06b6d4 0%, #3b82f6 100%)", // Cyan -> Blue
  accentBF: "linear-gradient(90deg, #8b5cf6 0%, #d946ef 100%)", // Violet -> Pink
  success: "#10b981",  // Verde esmeralda
  danger: "#ef4444",   // Rojo brillante
};

/**
 * Componente de Barra de Progreso Estilizada (Estilo Dashboard)
 */
const NeonTimeBar = ({ time, maxTime, isKd }) => {
  const percent = maxTime > 0 ? (time / maxTime) * 100 : 0;
  const background = isKd ? THEME.accentKD : THEME.accentBF;
  
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 2, color: THEME.textMuted }}>
        <span style={{ fontWeight: 600, color: isKd ? "#38bdf8" : "#e879f9" }}>
          {isKd ? "KD-TREE" : "BRUTE FORCE"}
        </span>
        <span style={{ fontFamily: "monospace", color: THEME.textMain }}>
          {time != null ? Number(time).toFixed(3) : "—"} ms
        </span>
      </div>
      <div style={{ width: "100%", height: 6, background: "#0f172a", borderRadius: 10, overflow: "hidden" }}>
        <div
          style={{
            width: `${percent}%`,
            height: "100%",
            background: background,
            borderRadius: 10,
            transition: "width 0.4s ease-out",
          }}
        />
      </div>
    </div>
  );
};

export default function LabPanel() {
  const [randomPoints, setRandomPoints] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- API CALLS ---
  const fetchRandomPoints = async (count = 20) => {
    setLoading(true);
    setError(null);
    setRandomPoints(null);
    setResults(null);
    try {
      const res = await client.get("/api/demo/random-points", { params: { count } });
      const data = res.data || {};
      setRandomPoints(Array.isArray(data.points) ? data.points : []);
    } catch (err) {
      console.error("fetchRandomPoints error:", err);
      setError(err?.message || "Failed to fetch random points");
      setRandomPoints([]);
    } finally {
      setLoading(false);
    }
  };

  const runNearestNodeBatch = async (methods = ["kd", "bruteforce"]) => {
    if (!Array.isArray(randomPoints) || randomPoints.length === 0) {
      setError("Generate points first.");
      return;
    }
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const payload = { points: randomPoints, methods };
      const res = await client.post("/api/nearest-node/batch", payload, { timeout: 120000 });
      const data = res.data || {};
      const final = Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : data.results ? data.results : [];
      setResults(final);
    } catch (err) {
      console.error("runNearestNodeBatch error:", err);
      const isTimeout = (err && err.code === "ECONNABORTED") || (err?.message?.includes("timeout"));
      setError(isTimeout ? "Timeout. Try again." : (err?.data?.detail || err?.message || "Error"));
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // --- STATS CALCULATION ---
  const stats = useMemo(() => {
    if (!results || results.length === 0) return null;
    const methodsFound = results[0]?.by_method ? Object.keys(results[0].by_method) : [];
    
    const totals = {};
    const counts = {};
    methodsFound.forEach(m => { totals[m] = 0; counts[m] = 0; });

    results.forEach(row => {
      if(row.by_method) {
        methodsFound.forEach(m => {
          const val = row.by_method[m]?.time_ms;
          if (val != null) {
            totals[m] += val;
            counts[m] += 1;
          }
        });
      }
    });

    const averages = {};
    methodsFound.forEach(m => {
      averages[m] = counts[m] > 0 ? (totals[m] / counts[m]) : 0;
    });

    return { methods: methodsFound, averages };
  }, [results]);

  // --- RENDER ---
  return (
    <div className="lab-panel" style={{ 
      padding: 20, 
      fontFamily: "'Inter', sans-serif", 
      background: THEME.bg, 
      color: THEME.textMain,
      minHeight: "100%",
      boxSizing: "border-box"
    }}>
      
      {/* HEADER */}
      <header style={{ marginBottom: 24 }}>
        <h2 style={{ margin: "0 0 6px 0", fontSize: 20, fontWeight: 700, letterSpacing: "-0.5px" }}>Performance Lab</h2>
        <div style={{ fontSize: 13, color: THEME.textMuted }}>Benchmark: KD-Tree vs Brute Force</div>
      </header>

      {/* CONTROLS */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
        <button 
          onClick={() => fetchRandomPoints(20)} 
          disabled={loading}
          style={{ 
            cursor: loading ? "not-allowed" : "pointer", 
            padding: "10px",
            background: "transparent",
            color: THEME.textMain,
            border: `1px solid ${THEME.borderColor}`,
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 500,
            transition: "all 0.2s"
          }}
        >
          {loading ? "Working..." : "1. Generate Points"}
        </button>
        <button 
          onClick={() => runNearestNodeBatch()} 
          disabled={loading || !randomPoints || randomPoints.length === 0}
          style={{ 
            cursor: (!loading && randomPoints) ? "pointer" : "not-allowed",
            padding: "10px",
            background: (!loading && randomPoints) ? "#3b82f6" : THEME.cardBg, 
            color: (!loading && randomPoints) ? "#fff" : THEME.textMuted,
            border: "none",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            opacity: (!loading && randomPoints) ? 1 : 0.6
          }}
        >
          {loading ? "Running..." : "2. Run Batch"}
        </button>
      </div>

      {error && (
        <div style={{ marginBottom: 16, padding: 12, background: "rgba(239, 68, 68, 0.1)", color: THEME.danger, border: `1px solid ${THEME.danger}`, borderRadius: 8, fontSize: 13 }}>
          {String(error)}
        </div>
      )}

      {/* --- SECTION 1: GENERATED POINTS LIST (RESTAURADO) --- */}
      {randomPoints && randomPoints.length > 0 && (
        <section style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
            <h4 style={{ margin: 0, fontSize: 12, color: THEME.textMuted, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Generated Points ({randomPoints.length})
            </h4>
          </div>
          
          <div style={{ 
            background: THEME.cardBg, 
            border: `1px solid ${THEME.borderColor}`,
            borderRadius: 8,
            overflow: "hidden"
          }}>
            {/* Table Header */}
            <div style={{ 
              display: "grid", gridTemplateColumns: "40px 1fr 1fr", 
              padding: "8px 12px", borderBottom: `1px solid ${THEME.borderColor}`,
              background: "rgba(0,0,0,0.2)", fontSize: 11, fontWeight: 700, color: THEME.textMuted 
            }}>
              <div>#</div>
              <div>LATITUDE</div>
              <div>LONGITUDE</div>
            </div>

            {/* Scrollable Body */}
            <div style={{ maxHeight: 160, overflowY: "auto" }}>
              {randomPoints.map((p, i) => (
                <div key={i} style={{ 
                  display: "grid", gridTemplateColumns: "40px 1fr 1fr", 
                  padding: "6px 12px", borderBottom: `1px solid ${THEME.borderColor}`,
                  fontSize: 12, fontFamily: "monospace", color: THEME.textMain
                }}>
                  <div style={{ color: "#64748b" }}>{i}</div>
                  <div>{Number(p.lat).toFixed(6)}</div>
                  <div>{Number(p.lon).toFixed(6)}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* --- SECTION 2: BATCH RESULTS DASHBOARD --- */}
      {results && results.length > 0 && stats && (
        <section>
          <h4 style={{ margin: "0 0 12px 0", fontSize: 12, color: THEME.textMuted, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Batch Analysis Results
          </h4>

          {/* STATS CARDS */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            {/* Card KD */}
            <div style={{ 
              background: THEME.cardBg, borderRadius: 12, padding: 16, 
              border: `1px solid ${THEME.borderColor}`, position: "relative", overflow: "hidden"
            }}>
              <div style={{ width: 4, height: "100%", position: "absolute", left: 0, top: 0, background: THEME.accentKD }}></div>
              <div style={{ fontSize: 11, color: THEME.textMuted, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>
                Avg KD-Tree
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#f1f5f9" }}>
                {stats.averages["kd"] ? stats.averages["kd"].toFixed(3) : "—"} <span style={{fontSize: 14, color: "#64748b"}}>ms</span>
              </div>
            </div>

            {/* Card BF */}
            <div style={{ 
              background: THEME.cardBg, borderRadius: 12, padding: 16, 
              border: `1px solid ${THEME.borderColor}`, position: "relative", overflow: "hidden"
            }}>
              <div style={{ width: 4, height: "100%", position: "absolute", left: 0, top: 0, background: THEME.accentBF }}></div>
              <div style={{ fontSize: 11, color: THEME.textMuted, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>
                Avg Brute Force
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#f1f5f9" }}>
                {stats.averages["bruteforce"] ? stats.averages["bruteforce"].toFixed(3) : "—"} <span style={{fontSize: 14, color: "#64748b"}}>ms</span>
              </div>
            </div>
          </div>

          {/* COMPARISON LIST */}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginBottom: 8, padding: "0 4px" }}>
            <span>PERFORMANCE LOG</span>
            <span>ACCURACY CHECK</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 460, overflowY: "auto", paddingRight: 4 }}>
            {results.map((r, i) => {
              const kd = r.by_method?.kd || {};
              const bf = r.by_method?.bruteforce || {};
              const kdTime = kd.time_ms || 0;
              const bfTime = bf.time_ms || 0;
              
              const rowMax = Math.max(kdTime, bfTime);
              const distDiff = Math.abs((kd.distance_m || 0) - (bf.distance_m || 0));
              const isMatch = distDiff < 0.01;

              return (
                <div key={i} style={{ 
                  background: THEME.cardBg, borderRadius: 10, padding: 12, 
                  border: `1px solid ${THEME.borderColor}`, display: "flex", alignItems: "center", justifyContent: "space-between"
                }}>
                  
                  {/* Left: Index */}
                  <div style={{ fontSize: 12, color: "#475569", width: 24, fontWeight: 700 }}>#{i}</div>

                  {/* Middle: Bars */}
                  <div style={{ flex: 1, margin: "0 16px" }}>
                    <NeonTimeBar time={kdTime} maxTime={rowMax} isKd={true} />
                    <NeonTimeBar time={bfTime} maxTime={rowMax} isKd={false} />
                  </div>

                  {/* Right: Validation Status */}
                  <div style={{ textAlign: "right", minWidth: 60 }}>
                    {isMatch ? (
                      <div style={{ color: THEME.success, fontSize: 10, fontWeight: 700, background: "rgba(16, 185, 129, 0.1)", padding: "4px 8px", borderRadius: 4, display: "inline-block" }}>
                        MATCH
                      </div>
                    ) : (
                      <div style={{ color: THEME.danger, fontSize: 10, fontWeight: 700, background: "rgba(239, 68, 68, 0.1)", padding: "4px 8px", borderRadius: 4, display: "inline-block" }}>
                        ERR
                      </div>
                    )}
                    <div style={{ fontSize: 10, color: "#64748b", marginTop: 4 }}>Δ {distDiff.toFixed(1)}m</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}