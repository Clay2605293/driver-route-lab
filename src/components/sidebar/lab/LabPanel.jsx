// src/components/sidebar/lab/LabPanel.jsx
import React, { useMemo } from "react";

/**
 * LabPanel
 *
 * Panel de laboratorio para comparar algoritmos de búsqueda sobre el grafo:
 * - BFS
 * - DFS
 * - UCS
 * - IDDFS
 * - A*
 *
 * Aquí se presentan:
 * - Una breve descripción de cada algoritmo.
 * - Métricas simuladas de desempeño por rango de distancia:
 *   - Short trips  (< 1 km)
 *   - Medium trips (1–5 km)
 *   - Long trips   (> 5 km)
 * - Una comparación visual plana (barras) de:
 *   - Tiempo de cómputo
 *   - Nodos explorados
 *
 * Por ahora, los datos son mock; más adelante puedes conectar
 * estas métricas con resultados reales generados desde el backend.
 */
function LabPanel() {
  // Datos simulados de desempeño por algoritmo y rango de distancia.
  const metrics = useMemo(
    () => [
      {
        id: "bfs",
        name: "BFS",
        label: "Breadth-First Search",
        recommended: false,
        description:
          "Explores the graph level by level. Guarantees shortest path in unweighted graphs but can explore many nodes.",
        ranges: {
          short: { timeMs: 4, nodes: 250 },
          medium: { timeMs: 15, nodes: 1300 },
          long: { timeMs: 48, nodes: 5200 },
        },
      },
      {
        id: "dfs",
        name: "DFS",
        label: "Depth-First Search",
        recommended: false,
        description:
          "Goes as deep as possible along each branch. Does not guarantee shortest path and can wander in large graphs.",
        ranges: {
          short: { timeMs: 3, nodes: 180 },
          medium: { timeMs: 22, nodes: 2800 },
          long: { timeMs: 75, nodes: 9800 },
        },
      },
      {
        id: "ucs",
        name: "UCS",
        label: "Uniform Cost Search",
        recommended: false,
        description:
          "Expands the cheapest node first according to edge cost. Guarantees optimal paths but can be expensive on large maps.",
        ranges: {
          short: { timeMs: 5, nodes: 320 },
          medium: { timeMs: 19, nodes: 1800 },
          long: { timeMs: 60, nodes: 7200 },
        },
      },
      {
        id: "iddfs",
        name: "IDDFS",
        label: "Iterative Deepening DFS",
        recommended: false,
        description:
          "Performs depth-limited searches with increasing limits. Combines low memory usage with completeness guarantees.",
        ranges: {
          short: { timeMs: 6, nodes: 260 },
          medium: { timeMs: 20, nodes: 1700 },
          long: { timeMs: 63, nodes: 7600 },
        },
      },
      {
        id: "astar",
        name: "A*",
        label: "A* Search (with distance heuristic)",
        recommended: true,
        description:
          "Uses both path cost and a heuristic (straight-line distance) to guide the search. Typically explores fewer nodes while keeping routes near optimal.",
        ranges: {
          short: { timeMs: 3, nodes: 150 },
          medium: { timeMs: 9, nodes: 620 },
          long: { timeMs: 25, nodes: 2400 },
        },
      },
    ],
    []
  );

  // Para la comparación visual, necesitamos el máximo de tiempo y nodos.
  const maxValues = useMemo(() => {
    const allRanges = metrics.flatMap((algo) => [
      algo.ranges.short,
      algo.ranges.medium,
      algo.ranges.long,
    ]);

    const maxTime = Math.max(...allRanges.map((r) => r.timeMs));
    const maxNodes = Math.max(...allRanges.map((r) => r.nodes));

    return { maxTime, maxNodes };
  }, [metrics]);

  const formatTime = (ms) => `${ms.toFixed(1)} ms`;
  const formatNodes = (nodes) => nodes.toLocaleString("en-US");

  const renderRangeRow = (algo, rangeKey, rangeLabel) => {
    const range = algo.ranges[rangeKey];
    const timeWidth = Math.max(
      8,
      (range.timeMs / maxValues.maxTime) * 100
    );
    const nodesWidth = Math.max(
      8,
      (range.nodes / maxValues.maxNodes) * 100
    );

    return (
      <div key={rangeKey} className="lab-panel__range-row">
        <div className="lab-panel__range-label">{rangeLabel}</div>

        <div className="lab-panel__range-metric">
          <div className="lab-panel__metric-header">
            <span className="lab-panel__metric-name">Time</span>
            <span className="lab-panel__metric-value">{formatTime(range.timeMs)}</span>
          </div>
          <div className="lab-panel__metric-bar-wrapper">
            <div
              className="lab-panel__metric-bar lab-panel__metric-bar--time"
              style={{ width: `${timeWidth}%` }}
            />
          </div>
        </div>

        <div className="lab-panel__range-metric">
          <div className="lab-panel__metric-header">
            <span className="lab-panel__metric-name">Nodes explored</span>
            <span className="lab-panel__metric-value">
              {formatNodes(range.nodes)}
            </span>
          </div>
          <div className="lab-panel__metric-bar-wrapper">
            <div
              className="lab-panel__metric-bar lab-panel__metric-bar--nodes"
              style={{ width: `${nodesWidth}%` }}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="lab-panel">
      {/* Encabezado del laboratorio */}
      <header className="lab-panel__header">
        <div className="lab-panel__title-block">
          <h2 className="lab-panel__title">Algorithm lab</h2>
          <p className="lab-panel__subtitle">
            Compare how different search algorithms behave on short, medium and
            long trips over the same urban road network.
          </p>
        </div>

        <div className="lab-panel__context">
          <h3 className="lab-panel__context-title">
            What are we measuring here?
          </h3>
          <p className="lab-panel__context-text">
            Each algorithm is evaluated on the same set of routes, separated in
            three categories: short trips (under 1 km), medium trips (1–5 km)
            and long trips (above 5 km). For each category we record:
          </p>
          <ul className="lab-panel__context-list">
            <li>Average computation time needed to find a route.</li>
            <li>Number of graph nodes explored during the search.</li>
          </ul>
          <p className="lab-panel__context-text">
            The goal is to justify which algorithm should be the default choice
            for the driver&apos;s route planner in real usage.
          </p>
        </div>
      </header>

      {/* Sección: KD-Tree vs búsqueda exhaustiva */}
      <section className="lab-panel__section lab-panel__section--compact">
        <h3 className="lab-panel__section-title">
          Node lookup: KD-Tree vs exhaustive search
        </h3>
        <div className="lab-panel__section-body lab-panel__section-body--columns">
          <div className="lab-panel__card lab-panel__card--lookup">
            <p className="lab-panel__card-text">
              Before any route can be computed, both the driver position and
              the client positions must be mapped to the closest graph nodes.
              Two strategies are considered:
            </p>
            <ul className="lab-panel__bullets">
              <li>
                KD-Tree: optimized spatial index built once from all graph nodes
                and reused for fast lookups.
              </li>
              <li>
                Exhaustive search: scanning all nodes every time a new position
                is queried.
              </li>
            </ul>
            <p className="lab-panel__card-text">
              In the final report you can plug in real numbers here, but the UI
              already shows how the comparison would look from a product
              perspective.
            </p>
          </div>

          <div className="lab-panel__card lab-panel__card--lookup-metrics">
            <div className="lab-panel__lookup-table">
              <div className="lab-panel__lookup-header">
                <span className="lab-panel__lookup-col lab-panel__lookup-col--method">
                  Method
                </span>
                <span className="lab-panel__lookup-col">
                  Avg time per lookup
                </span>
                <span className="lab-panel__lookup-col">
                  Relative cost
                </span>
              </div>
              <div className="lab-panel__lookup-row">
                <span className="lab-panel__lookup-col lab-panel__lookup-col--method">
                  KD-Tree
                </span>
                <span className="lab-panel__lookup-col">0.4 ms</span>
                <span className="lab-panel__lookup-col">
                  Baseline (1x)
                </span>
              </div>
              <div className="lab-panel__lookup-row">
                <span className="lab-panel__lookup-col lab-panel__lookup-col--method">
                  Exhaustive
                </span>
                <span className="lab-panel__lookup-col">25.0 ms</span>
                <span className="lab-panel__lookup-col">
                  About 60x slower
                </span>
              </div>
            </div>
            <p className="lab-panel__lookup-note">
              These values are placeholders. In the actual project, you would
              compute them by running 20 random client positions both with
              KD-Tree and with a naive scan over all graph nodes.
            </p>
          </div>
        </div>
      </section>

      {/* Sección: comparación por algoritmo */}
      <section className="lab-panel__section">
        <h3 className="lab-panel__section-title">
          Route search performance by algorithm
        </h3>
        <div className="lab-panel__grid">
          {metrics.map((algo) => (
            <article
              key={algo.id}
              className={
                "lab-panel__algo-card" +
                (algo.recommended ? " lab-panel__algo-card--recommended" : "")
              }
            >
              <header className="lab-panel__algo-header">
                <div className="lab-panel__algo-title-block">
                  <h4 className="lab-panel__algo-name">{algo.name}</h4>
                  <p className="lab-panel__algo-label">{algo.label}</p>
                </div>
                {algo.recommended && (
                  <span className="lab-panel__algo-badge">Recommended</span>
                )}
              </header>

              <p className="lab-panel__algo-description">
                {algo.description}
              </p>

              <div className="lab-panel__ranges">
                {renderRangeRow(algo, "short", "Short trips")}
                {renderRangeRow(algo, "medium", "Medium trips")}
                {renderRangeRow(algo, "long", "Long trips")}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Conclusión textual para el reporte */}
      <section className="lab-panel__section lab-panel__section--conclusion">
        <h3 className="lab-panel__section-title">Interpretation</h3>
        <p className="lab-panel__conclusion-text">
          Even with simulated values, the pattern is clear: algorithms that
          use domain knowledge through a heuristic, such as A*, explore fewer
          nodes and reach solutions faster, especially for longer trips. BFS,
          DFS and IDDFS are useful as baseline strategies, but they do not
          scale as gracefully when the graph grows and routes become longer.
        </p>
        <p className="lab-panel__conclusion-text">
          From a product perspective, this justifies selecting A* as the default
          algorithm in the driver app, while still keeping the other strategies
          available for experimentation in the lab view and in the written
          report for the course.
        </p>
      </section>
    </div>
  );
}

export default LabPanel;
