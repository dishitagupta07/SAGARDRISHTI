import { useState } from "react";
import {
  Search,
  Bell,
  User,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  Navigation,
  Ship,
  Waves,
  AlertTriangle,
  ArrowRight,
  MapPin,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

import {
  MapContainer,
  TileLayer,
  Polygon,
  Polyline,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

const spillPosition = [12.68, 80.58];

const spillPolygon = [
  [12.83, 80.43],
  [12.82, 80.47],
  [12.78, 80.5],
  [12.76, 80.54],
  [12.72, 80.56],
  [12.69, 80.6],
  [12.65, 80.64],
  [12.61, 80.67],
  [12.58, 80.7],
  [12.56, 80.67],
  [12.57, 80.63],
  [12.6, 80.6],
  [12.62, 80.56],
  [12.65, 80.53],
  [12.67, 80.49],
  [12.71, 80.47],
  [12.74, 80.44],
  [12.78, 80.42],
  [12.81, 80.41],
];

const spillInnerPolygon = [
  [12.79, 80.46],
  [12.76, 80.51],
  [12.72, 80.54],
  [12.69, 80.58],
  [12.65, 80.62],
  [12.62, 80.65],
  [12.6, 80.67],
  [12.63, 80.66],
  [12.67, 80.62],
  [12.7, 80.59],
  [12.74, 80.55],
  [12.77, 80.51],
  [12.8, 80.47],
];

const vessels = [
  {
    name: "MV Ocean Star",
    position: [12.91, 80.71],
    distance: "3.2 km",
    speed: "12 kn",
    color: "#ff4055",
    heading: 45,
  },
  {
    name: "MT Coral",
    position: [12.77, 80.39],
    distance: "6.8 km",
    speed: "8 kn",
    color: "#35d69f",
    heading: 315,
  },
  {
    name: "MV Sunrise",
    position: [12.48, 80.73],
    distance: "9.4 km",
    speed: "11 kn",
    color: "#20bce9",
    heading: 135,
  },
  {
    name: "MV Bright",
    position: [12.58, 80.82],
    distance: "14.2 km",
    speed: "10 kn",
    color: "#a875ff",
    heading: 90,
  },
  {
    name: "FV Golden",
    position: [12.4, 80.54],
    distance: "11.7 km",
    speed: "9 kn",
    color: "#f6b52d",
    heading: 225,
  },
];

const trajectory = [
  [12.68, 80.58],
  [12.64, 80.62],
  [12.6, 80.66],
  [12.56, 80.7],
  [12.52, 80.75],
  [12.48, 80.8],
  [12.44, 80.85],
];

/* =========================
   CUSTOM SHIP ICON
========================= */

const createShipIcon = (color, heading = 0) => {
  return L.divIcon({
    className: "custom-ship-marker",
    html: `
      <div style="
        width: 38px;
        height: 38px;
        display: flex;
        align-items: center;
        justify-content: center;
        transform: rotate(${heading}deg);
      ">
        <div style="
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: ${color}22;
          border: 1px solid ${color}66;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 12px ${color}55;
        ">
          <div style="
            width: 0;
            height: 0;
            border-left: 7px solid transparent;
            border-right: 7px solid transparent;
            border-bottom: 20px solid ${color};
            transform: rotate(0deg);
            filter: drop-shadow(0 0 3px ${color});
          "></div>
        </div>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -20],
  });
};

/* =========================
   MAP CONTROLS
========================= */

function MapControls() {
  const map = useMap();

  return (
    <div className="absolute bottom-5 left-5 z-[1000] flex flex-col overflow-hidden rounded-lg border border-[#244b62] bg-[#082238]/95 shadow-xl">
      <button
        onClick={() => map.zoomIn()}
        className="flex h-10 w-10 items-center justify-center border-b border-[#244b62] text-[#b5cbd6] hover:bg-[#123852] hover:text-white"
      >
        <ZoomIn size={17} />
      </button>

      <button
        onClick={() => map.zoomOut()}
        className="flex h-10 w-10 items-center justify-center border-b border-[#244b62] text-[#b5cbd6] hover:bg-[#123852] hover:text-white"
      >
        <ZoomOut size={17} />
      </button>

      <button
        onClick={() => map.setView([12.66, 80.55], 9)}
        className="flex h-10 w-10 items-center justify-center text-[#b5cbd6] hover:bg-[#123852] hover:text-white"
      >
        <RotateCcw size={16} />
      </button>
    </div>
  );
}

export default function DigitalTwin() {
  const navigate = useNavigate();

  const [showSpill, setShowSpill] = useState(true);
  const [showVessels, setShowVessels] = useState(true);
  const [showTrajectory, setShowTrajectory] = useState(true);
  const [search, setSearch] = useState("");

  const filteredVessels = vessels.filter((vessel) =>
    vessel.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#061b2b] text-white">
      <Sidebar />

      <div className="ml-[245px] min-h-screen">
        {/* HEADER */}
        <header className="flex h-[76px] items-center justify-between border-b border-[#173d55] bg-[#071f32] px-8">
          <div>
            <h1 className="text-xl font-semibold">Digital Twin</h1>
            <p className="mt-1 text-xs text-[#7296aa]">
              Live maritime operational intelligence
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64899d]"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search vessel..."
                className="w-[210px] rounded-lg border border-[#21465d] bg-[#09263b] py-2 pl-9 pr-3 text-xs text-white outline-none placeholder:text-[#5f8194] focus:border-[#287da3]"
              />
            </div>

            <button
              onClick={() => alert("No new notifications")}
              className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[#21465d] bg-[#09263b] text-[#8eabb9] hover:text-white"
            >
              <Bell size={17} />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#ff5265]" />
            </button>

            <button
              onClick={() => alert("SagarDrishti Operator")}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#087cae] text-white"
            >
              <User size={17} />
            </button>
          </div>
        </header>

        {/* MAP + RIGHT PANEL */}
        <div className="grid h-[calc(100vh-76px)] grid-cols-[1fr_330px]">
          {/* MAP */}
          <div className="relative overflow-hidden">
            <MapContainer
              center={[12.66, 80.55]}
              zoom={9}
              zoomControl={false}
              className="h-full w-full"
            >
              <TileLayer
                attribution="Tiles © Esri"
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />

              {/* SPILL */}
              {showSpill && (
                <>
                  <Polygon
                    positions={spillPolygon}
                    pathOptions={{
                      color: "#ff4055",
                      fillColor: "#ff4055",
                      fillOpacity: 0.2,
                      weight: 2,
                    }}
                  />

                  <Polygon
                    positions={spillInnerPolygon}
                    pathOptions={{
                      color: "#ff6677",
                      fillColor: "#ff4055",
                      fillOpacity: 0.3,
                      weight: 1,
                    }}
                  />

                  <Marker
                    position={spillPosition}
                    icon={L.divIcon({
                      className: "spill-marker",
                      html: `
                        <div style="
                          width: 42px;
                          height: 42px;
                          border-radius: 50%;
                          background: rgba(255,64,85,0.16);
                          border: 2px solid #ff4055;
                          display:flex;
                          align-items:center;
                          justify-content:center;
                          box-shadow:0 0 20px rgba(255,64,85,0.5);
                        ">
                          <div style="
                            width:12px;
                            height:12px;
                            border-radius:50%;
                            background:#ff4055;
                            box-shadow:0 0 12px #ff4055;
                          "></div>
                        </div>
                      `,
                      iconSize: [42, 42],
                      iconAnchor: [21, 21],
                    })}
                  >
                    <Popup>
                      <div style={{ minWidth: "180px" }}>
                        <strong>SP-026</strong>
                        <br />
                        Active Oil Spill
                        <br />
                        Area: 42.6 km²
                        <br />
                        Confidence: 94%
                      </div>
                    </Popup>
                  </Marker>
                </>
              )}

              {/* TRAJECTORY */}
              {showTrajectory && (
                <Polyline
                  positions={trajectory}
                  pathOptions={{
                    color: "#20bce9",
                    weight: 3,
                    dashArray: "8 8",
                    opacity: 0.9,
                  }}
                />
              )}

              {/* SHIPS */}
              {showVessels &&
                filteredVessels.map((vessel) => (
                  <Marker
                    key={vessel.name}
                    position={vessel.position}
                    icon={createShipIcon(
                      vessel.color,
                      vessel.heading
                    )}
                  >
                    <Popup>
                      <div style={{ minWidth: "190px" }}>
                        <strong>{vessel.name}</strong>
                        <br />
                        Speed: {vessel.speed}
                        <br />
                        Distance: {vessel.distance}
                        <br />
                        <br />

                        <button
                          style={{
                            background: "#087cae",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            padding: "6px 10px",
                            cursor: "pointer",
                          }}
                          onClick={() =>
                            navigate("/vessel-intelligence")
                          }
                        >
                          View Vessel
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                ))}

              <MapControls />
            </MapContainer>

            {/* MAP LABEL */}
            <div className="pointer-events-none absolute left-5 top-5 z-[900] rounded-lg border border-[#21465d] bg-[#061b2b]/90 px-4 py-3 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Navigation size={15} className="text-[#20bce9]" />
                <span className="text-xs font-semibold">
                  Bay of Bengal
                </span>
              </div>

              <p className="mt-1 text-[10px] text-[#7397aa]">
                12.66° N · 80.55° E
              </p>
            </div>

            {/* LEGEND */}
            <div className="absolute bottom-5 right-5 z-[900] rounded-xl border border-[#244b62] bg-[#082238]/95 p-4 shadow-xl backdrop-blur-sm">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-[#7597aa]">
                Map Legend
              </p>

              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#ff4055]" />
                  <span className="text-[11px] text-[#aac0cc]">
                    Active Spill
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#20bce9]" />
                  <span className="text-[11px] text-[#aac0cc]">
                    Vessel
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-5 border-t-2 border-dashed border-[#20bce9]" />
                  <span className="text-[11px] text-[#aac0cc]">
                    Drift Trajectory
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <aside className="overflow-y-auto border-l border-[#173d55] bg-[#071f32]">
            {/* ACTIVE INCIDENT */}
            <div className="border-b border-[#173d55] p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[#6f93a8]">
                    Active Incident
                  </p>
                  <h2 className="mt-1 text-base font-semibold">
                    SP-026
                  </h2>
                </div>

                <span className="rounded-full bg-[#54202a] px-2.5 py-1 text-[9px] font-bold text-[#ff7180]">
                  HIGH RISK
                </span>
              </div>

              <div className="rounded-lg border border-[#2b4554] bg-[#09263b] p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle
                    size={16}
                    className="text-[#ff5265]"
                  />

                  <span className="text-xs font-semibold">
                    Oil Spill Detected
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-[#65899d]">
                      Area
                    </p>
                    <p className="mt-1 text-sm font-semibold">
                      42.6 km²
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] text-[#65899d]">
                      Confidence
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#35d69f]">
                      94%
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/incidents")}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#0b4f6c] py-2 text-xs font-semibold text-white hover:bg-[#087cae]"
                >
                  View Full Incident
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* LAYERS */}
            <div className="border-b border-[#173d55] p-5">
              <div className="mb-4 flex items-center gap-2">
                <Layers size={16} className="text-[#20bce9]" />
                <h3 className="text-sm font-semibold">
                  Map Layers
                </h3>
              </div>

              <div className="space-y-3">
                <label className="flex cursor-pointer items-center justify-between rounded-lg bg-[#09263b] p-3">
                  <div className="flex items-center gap-3">
                    <Waves
                      size={16}
                      className="text-[#ff5265]"
                    />

                    <div>
                      <p className="text-xs font-medium">
                        Active Spill
                      </p>
                      <p className="text-[10px] text-[#65899d]">
                        Oil spill boundary
                      </p>
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    checked={showSpill}
                    onChange={() => setShowSpill(!showSpill)}
                    className="accent-[#20bce9]"
                  />
                </label>

                <label className="flex cursor-pointer items-center justify-between rounded-lg bg-[#09263b] p-3">
                  <div className="flex items-center gap-3">
                    <Ship
                      size={16}
                      className="text-[#20bce9]"
                    />

                    <div>
                      <p className="text-xs font-medium">
                        AIS Vessels
                      </p>
                      <p className="text-[10px] text-[#65899d]">
                        Nearby vessels
                      </p>
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    checked={showVessels}
                    onChange={() =>
                      setShowVessels(!showVessels)
                    }
                    className="accent-[#20bce9]"
                  />
                </label>

                <label className="flex cursor-pointer items-center justify-between rounded-lg bg-[#09263b] p-3">
                  <div className="flex items-center gap-3">
                    <Navigation
                      size={16}
                      className="text-[#35d69f]"
                    />

                    <div>
                      <p className="text-xs font-medium">
                        Drift Trajectory
                      </p>
                      <p className="text-[10px] text-[#65899d]">
                        Predicted spill movement
                      </p>
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    checked={showTrajectory}
                    onChange={() =>
                      setShowTrajectory(!showTrajectory)
                    }
                    className="accent-[#20bce9]"
                  />
                </label>
              </div>
            </div>

            {/* VESSELS */}
            <div className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold">
                    Nearby Vessels
                  </h3>

                  <p className="mt-1 text-[10px] text-[#65899d]">
                    AIS activity around spill
                  </p>
                </div>

                <span className="rounded-full bg-[#0d344b] px-2 py-1 text-[10px] text-[#8fb0bf]">
                  {filteredVessels.length}
                </span>
              </div>

              <div className="space-y-3">
                {filteredVessels.map((vessel) => (
                  <button
                    key={vessel.name}
                    onClick={() =>
                      navigate("/vessel-intelligence")
                    }
                    className="flex w-full items-center gap-3 rounded-lg border border-[#1a3e55] bg-[#09263b] p-3 text-left transition hover:border-[#28617e] hover:bg-[#0b2d43]"
                  >
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-full"
                      style={{
                        backgroundColor: `${vessel.color}20`,
                      }}
                    >
                      <Ship
                        size={17}
                        style={{ color: vessel.color }}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold">
                        {vessel.name}
                      </p>

                      <p className="mt-1 text-[10px] text-[#66899d]">
                        {vessel.distance} · {vessel.speed}
                      </p>
                    </div>

                    <ArrowRight
                      size={14}
                      className="text-[#5f8296]"
                    />
                  </button>
                ))}
              </div>

              <button
                onClick={() =>
                  navigate("/vessel-intelligence")
                }
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-[#21465d] py-2 text-xs text-[#8faaba] hover:bg-[#0d3048] hover:text-white"
              >
                View All Vessels
                <ArrowRight size={14} />
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}