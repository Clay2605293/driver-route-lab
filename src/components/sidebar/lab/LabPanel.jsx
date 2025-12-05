// src/components/sidebar/lab/LabPanel.jsx
import React, { useState, useMemo } from "react";
import client from "../../../api/client";

// --- CONFIGURACIÓN DE ESTILOS (Paleta Dark Mode) ---
const THEME = {
  bg: "#0f172a",
  cardBg: "#1e293b",
  borderColor: "#334155",
  textMain: "#f1f5f9",
  textMuted: "#94a3b8",
  accentKD: "linear-gradient(90deg, #06b6d4 0%, #3b82f6 100%)",
  accentBF: "linear-gradient(90deg, #8b5cf6 0%, #d946ef 100%)",
  success: "#10b981",
  danger: "#ef4444",
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

const ALGORITHMS = [
  { key: "bfs", label: "BFS" },
  { key: "dfs", label: "DFS" },
  { key: "ucs", label: "UCS" },
  { key: "iddfs", label: "IDDFS" },
  { key: "astar", label: "A*" },
];

export default function LabPanel() {
  // existing KD vs BF states
  const [randomPoints, setRandomPoints] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // New: route-evaluate flow
  const [routePairs, setRoutePairs] = useState(null); // array of { id, origin:{lat,lon}, destination:{lat,lon} }
  const [pairsLoading, setPairsLoading] = useState(false);
  const [pairsError, setPairsError] = useState(null);

  const [evalState, setEvalState] = useState(() => {
    // object per algorithm: { loading, error, summary }
    const initial = {};
    ALGORITHMS.forEach(a => initial[a.key] = { loading: false, error: null, summary: null });
    return initial;
  });
  const [runAllLoading, setRunAllLoading] = useState(false);

  // --- API CALLS (existing) ---
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

  // --- New: route pairs & evaluation calls ---
  const fetchRoutePairs = async () => {
    setPairsLoading(true);
    setPairsError(null);
    setRoutePairs(null);

    try {
      const res = await client.get("/api/demo/route-pairs");
      console.debug("fetchRoutePairs: raw response", res);

      const data = res.data ?? {};

      // Si backend devuelve { short: [...], medium: [...], long: [...] }, concatenar.
      let pairs = [];
      if (Array.isArray(data.short) || Array.isArray(data.medium) || Array.isArray(data.long)) {
        const shortArr = Array.isArray(data.short) ? data.short : [];
        const mediumArr = Array.isArray(data.medium) ? data.medium : [];
        const longArr = Array.isArray(data.long) ? data.long : [];
        pairs = [...shortArr, ...mediumArr, ...longArr];
      } else {
        // antiguas formas: array directo o { pairs: [...] } o nested
        if (Array.isArray(data.pairs)) {
          pairs = data.pairs;
        } else if (Array.isArray(data)) {
          pairs = data;
        } else if (Array.isArray(data.data?.pairs)) {
          pairs = data.data.pairs;
        } else if (Array.isArray(data.items)) {
          pairs = data.items;
        } else {
          // buscar la primera propiedad que parezca lista de pares
          const maybe = Object.values(data).find((v) => Array.isArray(v) && v.length > 0 && (v[0].origin || v[0].originLat || v[0].origin_lat));
          if (Array.isArray(maybe)) pairs = maybe;
        }
      }

      // DEBUG: ids and counts by prefix
      const ids = pairs.map(p => p.id ?? p.pair_id ?? "");
      console.debug("fetchRoutePairs: ids present (sample)", ids.slice(0, 50));
      const countsByPrefix = ids.reduce((acc, id) => {
        const m = (id || "").match(/^(short|medium|long)_/);
        const k = m ? m[1] : "other";
        acc[k] = (acc[k] || 0) + 1;
        return acc;
      }, {});
      console.debug("fetchRoutePairs: countsByPrefix", countsByPrefix);

      if (!Array.isArray(pairs) || pairs.length === 0) {
        setPairsError("No pairs returned from server (check Network / logs).");
        setRoutePairs([]);
      } else {
        setRoutePairs(pairs);
        // Reset evalState summaries when new pairs generated
        setEvalState(prev => {
          const next = { ...prev };
          ALGORITHMS.forEach(a => next[a.key] = { loading: false, error: null, summary: null });
          return next;
        });

        // If some categories missing, warn the user (show message in UI)
        const missing = [];
        if (!Array.isArray(data.short) || data.short.length === 0) missing.push("short");
        if (!Array.isArray(data.medium) || data.medium.length === 0) missing.push("medium");
        if (!Array.isArray(data.long) || data.long.length === 0) missing.push("long");
        if (missing.length > 0) {
          setPairsError(`Warning: missing categories from server: ${missing.join(", ")}`);
        }
      }
    } catch (err) {
      console.error("fetchRoutePairs error:", err);
      const msg = err?.message ?? err?.data?.detail ?? (err?.status ? `HTTP ${err.status}` : "Unknown error");
      setPairsError(msg);
      setRoutePairs([]);
    } finally {
      setPairsLoading(false);
    }
  };

  const evaluateAlgorithm = async (algorithmKey) => {
    if (!Array.isArray(routePairs) || routePairs.length === 0) {
      setPairsError("Generate route pairs first.");
      return;
    }
    // mark loading for this algorithm
    setEvalState(prev => ({ ...prev, [algorithmKey]: { ...prev[algorithmKey], loading: true, error: null } }));
    try {
      const payload = {
        pairs: routePairs,
        algorithm: algorithmKey,
        cost_metric: "distance",
      };
      // longer timeout in case backend takes time
      const res = await client.post("/api/demo/route-evaluate-batch", payload, { timeout: 120000 });
      const data = res.data || {};
      // expected response shape: { algorithm, cost_metric, results: [...], summary: { avg_distance_m, avg_travel_time_s, avg_time_ms, count, found_count } }
      const summary = data.summary || null;
      setEvalState(prev => ({ ...prev, [algorithmKey]: { ...prev[algorithmKey], loading: false, error: null, summary } }));
    } catch (err) {
      console.error("evaluateAlgorithm error:", err);
      const errMsg = (err && err.code === "ECONNABORTED") ? "Timeout" : (err?.response?.data?.detail || err?.message || "Error");
      setEvalState(prev => ({ ...prev, [algorithmKey]: { ...prev[algorithmKey], loading: false, error: errMsg, summary: null } }));
    }
  };

  const runAllEvaluations = async () => {
    if (!Array.isArray(routePairs) || routePairs.length === 0) {
      setPairsError("Generate route pairs first.");
      return;
    }
    setRunAllLoading(true);
    for (const a of ALGORITHMS) {
      // skip if already has summary
      const current = evalState[a.key];
      if (current?.summary) continue;
      // run sequentially
      // eslint-disable-next-line no-await-in-loop
      await evaluateAlgorithm(a.key);
    }
    setRunAllLoading(false);
  };

  // --- STATS CALCULATION (existing) ---
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
        <div style={{ fontSize: 13, color: THEME.textMuted }}>Benchmark: KD-Tree vs Brute Force — and Route Evaluations</div>
      </header>

      {/* CONTROLS (existing kd vs bf) */}
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

      {/* GENERATED POINTS (existing) */}
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
            <div style={{
              display: "grid", gridTemplateColumns: "40px 1fr 1fr",
              padding: "8px 12px", borderBottom: `1px solid ${THEME.borderColor}`,
              background: "rgba(0,0,0,0.2)", fontSize: 11, fontWeight: 700, color: THEME.textMuted 
            }}>
              <div>#</div>
              <div>LATITUDE</div>
              <div>LONGITUDE</div>
            </div>

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

      {/* --- SECTION: BATCH RESULTS DASHBOARD (existing) --- */}
      {results && results.length > 0 && stats && (
        <section style={{ marginBottom: 24 }}>
          <h4 style={{ margin: "0 0 12px 0", fontSize: 12, color: THEME.textMuted, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Batch Analysis Results
          </h4>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            <div style={{
              background: THEME.cardBg, borderRadius: 12, padding: 16,
              border: `1px solid ${THEME.borderColor}`, position: "relative", overflow: "hidden"
            }}>
              <div style={{ width: 4, height: "100%", position: "absolute", left: 0, top: 0, background: THEME.accentKD }}></div>
              <div style={{ fontSize: 11, color: THEME.textMuted, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>
                Avg KD-Tree
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#f1f5f9" }}>
                {stats.averages["kd"] ? stats.averages["kd"].toFixed(3) : "—"} <span style={{ fontSize: 14, color: "#64748b" }}>ms</span>
              </div>
            </div>

            <div style={{
              background: THEME.cardBg, borderRadius: 12, padding: 16,
              border: `1px solid ${THEME.borderColor}`, position: "relative", overflow: "hidden"
            }}>
              <div style={{ width: 4, height: "100%", position: "absolute", left: 0, top: 0, background: THEME.accentBF }}></div>
              <div style={{ fontSize: 11, color: THEME.textMuted, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>
                Avg Brute Force
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#f1f5f9" }}>
                {stats.averages["bruteforce"] ? stats.averages["bruteforce"].toFixed(3) : "—"} <span style={{ fontSize: 14, color: "#64748b" }}>ms</span>
              </div>
            </div>
          </div>

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

                  <div style={{ fontSize: 12, color: "#475569", width: 24, fontWeight: 700 }}>#{i}</div>

                  <div style={{ flex: 1, margin: "0 16px" }}>
                    <NeonTimeBar time={kdTime} maxTime={rowMax} isKd={true} />
                    <NeonTimeBar time={bfTime} maxTime={rowMax} isKd={false} />
                  </div>

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

      {/* --- NEW SECTION: Route Evaluation (BFS/DFS/UCS/IDDFS/A*) --- */}
      <section style={{ marginTop: 8 }}>
        <h4 style={{ margin: "0 0 12px 0", fontSize: 12, color: THEME.textMuted, textTransform: "uppercase", letterSpacing: "0.5px" }}>
          Route Evaluation (BFS / DFS / UCS / IDDFS / A*)
        </h4>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <button
            onClick={() => fetchRoutePairs()}
            disabled={pairsLoading}
            style={{
              cursor: pairsLoading ? "not-allowed" : "pointer",
              padding: "10px",
              background: routePairs ? "transparent" : THEME.cardBg,
              color: routePairs ? THEME.textMain : THEME.textMain,
              border: `1px solid ${THEME.borderColor}`,
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            {pairsLoading ? "Generating..." : (routePairs ? `Pairs: ${routePairs.length} (regenerate)` : "1. Generate Pairs")}
          </button>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => runAllEvaluations()}
              disabled={runAllLoading || !routePairs || routePairs.length === 0}
              style={{
                cursor: (!runAllLoading && routePairs) ? "pointer" : "not-allowed",
                padding: "10px",
                background: (!runAllLoading && routePairs) ? "#7c3aed" : THEME.cardBg,
                color: (!runAllLoading && routePairs) ? "#fff" : THEME.textMuted,
                border: "none",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                opacity: (!runAllLoading && routePairs) ? 1 : 0.6
              }}
            >
              {runAllLoading ? "Running all..." : "2. Evaluate All"}
            </button>
            <div style={{ alignSelf: "center", color: THEME.textMuted, fontSize: 12 }}>{pairsError ? String(pairsError) : ""}</div>
          </div>
        </div>

        {/* Pairs preview */}
        {routePairs && routePairs.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: THEME.textMuted, marginBottom: 8 }}>Pairs ({routePairs.length})</div>
            <div style={{ background: THEME.cardBg, border: `1px solid ${THEME.borderColor}`, borderRadius: 8, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "120px 1fr 1fr", padding: "8px 12px", borderBottom: `1px solid ${THEME.borderColor}`, fontSize: 11, color: THEME.textMuted }}>
                <div>ID</div>
                <div>ORIGIN (lat,lon)</div>
                <div>DEST (lat,lon)</div>
              </div>
              <div style={{ maxHeight: 160, overflowY: "auto" }}>
                {routePairs.map((p, i) => (
                  <div key={p.id ?? i} style={{ display: "grid", gridTemplateColumns: "120px 1fr 1fr", padding: "8px 12px", borderBottom: `1px solid ${THEME.borderColor}`, fontSize: 12, color: THEME.textMain }}>
                    <div style={{ color: "#64748b" }}>{p.id ?? `pair_${i}`}</div>
                    <div>{Number(p.origin?.lat ?? p.originLat ?? 0).toFixed(6)}, {Number(p.origin?.lon ?? p.originLon ?? 0).toFixed(6)}</div>
                    <div>{Number(p.destination?.lat ?? p.destinationLat ?? 0).toFixed(6)}, {Number(p.destination?.lon ?? p.destinationLon ?? 0).toFixed(6)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Evaluation table */}
        <div style={{ background: THEME.cardBg, border: `1px solid ${THEME.borderColor}`, borderRadius: 8, padding: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "200px 1fr 1fr 1fr 120px", gap: 8, padding: "8px 4px", borderBottom: `1px solid ${THEME.borderColor}`, color: THEME.textMuted, fontSize: 12, fontWeight: 700 }}>
            <div>Algoritmo</div>
            <div>Avg distancia (m)</div>
            <div>Avg tiempo físico (s)</div>
            <div>Avg tiempo cómputo (ms)</div>
            <div>Acción</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
            {ALGORITHMS.map(a => {
              const st = evalState[a.key] || { loading: false, error: null, summary: null };
              const sum = st.summary;
              return (
                <div key={a.key} style={{ display: "grid", gridTemplateColumns: "200px 1fr 1fr 1fr 120px", gap: 8, padding: "10px 4px", borderBottom: `1px solid ${THEME.borderColor}`, alignItems: "center" }}>
                  <div style={{ fontWeight: 700 }}>{a.label}</div>
                  <div style={{ color: THEME.textMain }}>{sum ? (sum.avg_distance_m != null ? Number(sum.avg_distance_m).toFixed(1) : "—") : "—"}</div>
                  <div style={{ color: THEME.textMain }}>{sum ? (sum.avg_travel_time_s != null ? Number(sum.avg_travel_time_s).toFixed(1) : "—") : "—"}</div>
                  <div style={{ color: THEME.textMain }}>{sum ? (sum.avg_time_ms != null ? Number(sum.avg_time_ms).toFixed(3) : "—") : "—"}</div>
                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <button
                      onClick={() => evaluateAlgorithm(a.key)}
                      disabled={st.loading || !routePairs || routePairs.length === 0}
                      style={{
                        padding: "8px 10px",
                        background: st.loading ? "#374151" : "#10b981",
                        color: "#fff",
                        border: "none",
                        borderRadius: 8,
                        cursor: st.loading ? "not-allowed" : "pointer",
                        fontWeight: 700,
                        fontSize: 12
                      }}
                    >
                      {st.loading ? "Running..." : (st.summary ? "Re-run" : "Run")}
                    </button>
                    {st.error && <div style={{ color: THEME.danger, fontSize: 12, alignSelf: "center" }}>{String(st.error)}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
}