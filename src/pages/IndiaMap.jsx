import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { geoCentroid } from "d3-geo";
import Layout from "../components/Layout/Layout";
import { getAthletes } from "../services/athleteService";
import "./IndiaMap.css";

const GEO_URL = "/data/india-states.geojson";
const BASE_COLOR = "#1f2937"; // no champions recorded
const LOW_COLOR = "#4c1d95"; // at least one champion
const HIGH_COLOR = "#e11d85"; // the most champions

function hexToRgb(hex) {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex([r, g, b]) {
  return (
    "#" +
    [r, g, b]
      .map((v) => Math.round(v).toString(16).padStart(2, "0"))
      .join("")
  );
}

function interpolateColor(from, to, t) {
  const a = hexToRgb(from);
  const b = hexToRgb(to);
  return rgbToHex(a.map((v, i) => v + (b[i] - v) * t));
}

function getStateColor(count, maxCount) {
  if (!count) return BASE_COLOR;
  // sqrt so one outlier state doesn't wash out every other state's shade
  const t = maxCount > 0 ? Math.sqrt(count / maxCount) : 0;
  return interpolateColor(LOW_COLOR, HIGH_COLOR, t);
}

function IndiaMap() {
  const [athletes, setAthletes] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [geoData, setGeoData] = useState(null);
  const [mapFailed, setMapFailed] = useState(false);
  const [selectedState, setSelectedState] = useState(null);
  const [hoveredState, setHoveredState] = useState(null);
  const [sportFilter, setSportFilter] = useState("All");

  useEffect(() => {
    let cancelled = false;

    async function loadAthletes() {
      try {
        const data = await getAthletes();
        if (!cancelled) {
          setAthletes(data);
          setStatus("ready");
        }
      } catch (err) {
        console.error("Failed to load athletes for the map:", err);
        if (!cancelled) setStatus("error");
      }
    }

    loadAthletes();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetch(GEO_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`Map data request failed (${res.status})`);
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setGeoData(data);
      })
      .catch((err) => {
        console.error("Falling back to the state grid — map data failed to load:", err);
        if (!cancelled) setMapFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const sports = useMemo(
    () => [
      "All",
      ...[...new Set(athletes.map((a) => a.sport).filter(Boolean))].sort(),
    ],
    [athletes]
  );

  const filteredAthletes = useMemo(
    () =>
      sportFilter === "All"
        ? athletes
        : athletes.filter((a) => a.sport === sportFilter),
    [athletes, sportFilter]
  );

  const stateData = useMemo(() => {
    const map = {};
    filteredAthletes.forEach((athlete) => {
      if (!athlete.state) return;
      if (!map[athlete.state]) map[athlete.state] = [];
      map[athlete.state].push(athlete);
    });
    return map;
  }, [filteredAthletes]);

  const maxCount = useMemo(
    () => Object.values(stateData).reduce((max, list) => Math.max(max, list.length), 0),
    [stateData]
  );

  const selectedAthletes = selectedState ? stateData[selectedState] || [] : [];
  const showMap = status === "ready" && geoData && !mapFailed;
  const showFallback = status === "ready" && mapFailed;

  return (
    <Layout>
      <div className="map-page">
        <p className="map-eyebrow">EVERY STATE HAS A CHAMPION</p>
        <h1>Map of Champions</h1>
        <p className="map-sub">Click any state to discover the women who made it proud.</p>

        {status === "loading" && <p className="map-status">Loading champions...</p>}
        {status === "error" && (
          <p className="map-status">Couldn't load athlete data. Please try again shortly.</p>
        )}

        {status === "ready" && (
          <div className="map-filter-bar">
            {sports.map((sport) => (
              <button
                key={sport}
                type="button"
                className={`map-filter-chip ${sportFilter === sport ? "active" : ""}`}
                onClick={() => {
                  setSportFilter(sport);
                  setSelectedState(null);
                }}
              >
                {sport}
              </button>
            ))}
          </div>
        )}

        {showMap && (
          <div className="map-layout">
            <div className="map-container">
              <ComposableMap
                projection="geoMercator"
                projectionConfig={{ center: [83, 22.5], scale: 1050 }}
                width={480}
                height={520}
              >
                <Geographies geography={geoData}>
                  {({ geographies }) =>
                    geographies.map((geo) => {
                      const name = geo.properties.ST_NM;
                      const count = stateData[name]?.length || 0;

                      const centroid = geoCentroid(geo);

                      return (
                        <g key={geo.rsmKey}>
                          <Geography
                            geography={geo}
                            onClick={() => setSelectedState(name)}
                            onMouseEnter={() => setHoveredState({ name, count })}
                            onMouseLeave={() => setHoveredState(null)}
                            style={{
                              default: {
                                fill: getStateColor(count, maxCount),
                                stroke: "#04080f",
                                strokeWidth: 0.75,
                                outline: "none",
                              },
                              hover: {
                                fill: "#e11d85",
                                stroke: "#04080f",
                                strokeWidth: 0.75,
                                outline: "none",
                                cursor: "pointer",
                              },
                              pressed: {
                                fill: "#be185d",
                                outline: "none",
                              },
                            }}
                          />
                          {Number.isFinite(centroid[0]) && Number.isFinite(centroid[1]) && (
                            <Marker coordinates={centroid}>
                              <text textAnchor="middle" className="state-count-label">
                                {count}
                              </text>
                            </Marker>
                          )}
                        </g>
                      );
                    })
                  }
                </Geographies>
              </ComposableMap>

              {hoveredState && (
                <div className="map-tooltip">
                  <strong>{hoveredState.name}</strong>
                  <span>
                    {hoveredState.count} champion{hoveredState.count === 1 ? "" : "s"}
                  </span>
                </div>
              )}

              <div className="map-legend">
                <span className="legend-label">Fewer</span>
                <span className="legend-bar" />
                <span className="legend-label">More champions</span>
              </div>
            </div>

            <div className={`map-panel ${selectedState ? "open" : ""}`}>
              {selectedState ? (
                <>
                  <button
                    type="button"
                    className="map-panel-close"
                    onClick={() => setSelectedState(null)}
                    aria-label="Close"
                  >
                    ×
                  </button>
                  <h2>{selectedState}</h2>
                  <p className="map-panel-count">
                    {selectedAthletes.length} champion{selectedAthletes.length === 1 ? "" : "s"}
                  </p>

                  {selectedAthletes.length === 0 ? (
                    <p className="map-panel-empty">No athletes recorded from this state yet.</p>
                  ) : (
                    <ul className="map-panel-list">
                      {selectedAthletes.map((athlete) => (
                        <li key={athlete.id}>
                          <Link to={`/athletes/${athlete.id}`}>
                            <span className="map-panel-name">{athlete.name}</span>
                            <span className="map-panel-sport">{athlete.sport}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <p className="map-panel-placeholder">Select a state to see its champions.</p>
              )}
            </div>
          </div>
        )}

        {showFallback && <StateCardsFallback stateData={stateData} />}
      </div>
    </Layout>
  );
}

function StateCardsFallback({ stateData }) {
  const states = Object.entries(stateData).sort((a, b) => b[1].length - a[1].length);

  if (states.length === 0) {
    return <p className="map-status">No athlete data available yet.</p>;
  }

  return (
    <div className="map-fallback-grid">
      {states.map(([state, list]) => (
        <div className="map-fallback-card" key={state}>
          <h3>{state}</h3>
          <p className="map-fallback-count">
            {list.length} champion{list.length === 1 ? "" : "s"}
          </p>
          <ul>
            {list.map((athlete) => (
              <li key={athlete.id}>
                <Link to={`/athletes/${athlete.id}`}>
                  {athlete.name} — {athlete.sport}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default IndiaMap;
