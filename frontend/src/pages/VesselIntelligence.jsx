import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Search,
  Filter,
  Ship,
  MapPin,
  Navigation,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Activity,
  ChevronRight,
  Eye,
  Waves,
  History,
} from "lucide-react";

import Sidebar from "../components/Sidebar";

export default function VesselIntelligence() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [trajectory, setTrajectory] = useState(null);
  const [trajectoryLoading, setTrajectoryLoading] = useState(false);
  const [trajectoryError, setTrajectoryError] = useState("");
  const [attribution, setAttribution] = useState(null);
  const [attributionLoading, setAttributionLoading] = useState(false);
  const [attributionError, setAttributionError] = useState("");

  const vessels = [
    {
      name: "MV Ocean Star",
      imo: "IMO 9384721",
      flag: "India",
      type: "Tanker",
      score: 92,
      risk: "HIGH",
      distance: "3.2 km",
      speed: "12 kn",
      heading: "NE",
      anomaly: "Trajectory overlap",
      status: "Active",
      lastSeen: "14:28 UTC",
    },
    {
      name: "MT Coral",
      imo: "IMO 9216384",
      flag: "Panama",
      type: "Oil Tanker",
      score: 78,
      risk: "MEDIUM",
      distance: "6.8 km",
      speed: "8 kn",
      heading: "NW",
      anomaly: "Speed deviation",
      status: "Active",
      lastSeen: "14:24 UTC",
    },
    {
      name: "MV Sunrise",
      imo: "IMO 9472163",
      flag: "Singapore",
      type: "Cargo",
      score: 61,
      risk: "MEDIUM",
      distance: "9.4 km",
      speed: "11 kn",
      heading: "SE",
      anomaly: "Route proximity",
      status: "Active",
      lastSeen: "14:19 UTC",
    },
    {
      name: "MV Bright",
      imo: "IMO 9351842",
      flag: "Liberia",
      type: "Cargo",
      score: 43,
      risk: "LOW",
      distance: "14.2 km",
      speed: "10 kn",
      heading: "E",
      anomaly: "None detected",
      status: "Active",
      lastSeen: "14:12 UTC",
    },
    {
      name: "FV Golden",
      imo: "IMO 9084217",
      flag: "India",
      type: "Fishing Vessel",
      score: 28,
      risk: "LOW",
      distance: "11.7 km",
      speed: "9 kn",
      heading: "SW",
      anomaly: "None detected",
      status: "Active",
      lastSeen: "14:06 UTC",
    },
  ];

  const displayVessels =
    attribution?.ranked_vessels?.length
      ? attribution.ranked_vessels.map((vessel) => ({
        name: vessel.vessel_name,
        imo: `MMSI ${vessel.mmsi}`,
        flag: "AIS",
        type: vessel.vessel_type,
        score: vessel.attribution_pct,
        risk:
          vessel.attribution_pct >= 80
            ? "HIGH"
            : vessel.attribution_pct >= 60
              ? "MEDIUM"
              : "LOW",
        distance: `${Number(vessel.closest_distance_km).toFixed(1)} km`,
        speed: "—",
        heading: "—",
        anomaly:
          vessel.evidence?.[0] || "AIS correlation detected",
        status: "Matched",
        lastSeen: `${Number(
          vessel.closest_time_delta_hours
        ).toFixed(1)} h delta`,
      }))
      : vessels;

  const filteredVessels = displayVessels.filter((vessel) => {
    const query = search.toLowerCase();

    const matchesSearch =
      vessel.name.toLowerCase().includes(query) ||
      vessel.imo.toLowerCase().includes(query) ||
      vessel.type.toLowerCase().includes(query) ||
      vessel.flag.toLowerCase().includes(query);

    const matchesFilter =
      filter === "All" || vessel.risk === filter;

    return matchesSearch && matchesFilter;
  });

  const getRiskClass = (risk) => {
    if (risk === "HIGH") {
      return "bg-red-500/15 text-[#ff6474]";
    }

    if (risk === "MEDIUM") {
      return "bg-yellow-500/15 text-[#f6c55f]";
    }

    return "bg-[#35d69f]/10 text-[#5ee5b0]";
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-[#ff6474]";
    if (score >= 60) return "text-[#f6c55f]";
    return "text-[#35d69f]";
  };
  const fetchTrajectory = async () => {
    try {
      setTrajectoryLoading(true);
      setTrajectoryError("");

      const response = await fetch(
`${import.meta.env.VITE_ML_URL}/predict-trajectory`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            origin_lat: 19.0760,
            origin_lon: 72.8777,
            forward_hours: 48,
            backward_hours: 12,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        throw new Error(
          errorData.detail || "Trajectory prediction failed."
        );
      }

      const result = await response.json();

      console.log("Trajectory result:", result);

      setTrajectory(result);
    } catch (error) {
      console.error("Trajectory error:", error);
      setTrajectoryError(
        error.message || "Unable to connect to trajectory service."
      );
    } finally {
      setTrajectoryLoading(false);
    }
  };
  const fetchAttribution = async () => {
    try {
      setAttributionLoading(true);
      setAttributionError("");

      const response = await fetch(
        `${import.meta.env.VITE_ML_URL}/attribute-vessel`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ais_csv_path: "data/synthetic/ais_tracks.csv",
            spill_lat: 13.164373629133578,
            spill_lon: 80.31943921987602,
            spill_time: "2026-08-01T14:00:00",
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || "Vessel attribution failed."
        );
      }

      const result = await response.json();

      console.log("Attribution result:", result);

      setAttribution(result);
    } catch (error) {
      console.error("Attribution error:", error);
      setAttributionError(
        error.message || "Unable to connect to attribution service."
      );
    } finally {
      setAttributionLoading(false);
    }
  }; useEffect(() => {
    fetchTrajectory();
    fetchAttribution();
  }, []);
  const topVessel = attribution?.ranked_vessels?.[0];
  return (
    <div className="min-h-screen bg-[#061b2b] text-white">
      <Sidebar />

      <div className="ml-[245px] min-h-screen">

        {/* TOP BAR */}
        <header className="flex h-[76px] items-center justify-between border-b border-[#173d55] bg-[#071f32] px-7">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#24485d] bg-[#0a2940] text-[#89a7b7] transition hover:bg-[#0d344d] hover:text-white"
            >
              <ArrowLeft size={17} />
            </button>

            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#62889e]">
                AIS Intelligence
              </p>

              <h2 className="mt-1 text-lg font-semibold">
                Vessel Intelligence
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/digital-twin")}
              className="flex items-center gap-2 rounded-lg border border-[#24485d] bg-[#0a2940] px-4 py-2.5 text-xs font-semibold text-[#a5bdc9] transition hover:bg-[#0d344d] hover:text-white"
            >
              <MapPin size={14} />
              Digital Twin
            </button>

            <button
              onClick={() => navigate("/historical-ais")}
              className="flex items-center gap-2 rounded-lg border border-[#24485d] bg-[#0a2940] px-4 py-2.5 text-xs font-semibold text-[#a5bdc9] transition hover:bg-[#0d344d] hover:text-white"
            >
              <History size={14} />
              Historical AIS
            </button>

            <button
              onClick={() => navigate("/incidents")}
              className="flex items-center gap-2 rounded-lg bg-[#087cae] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#0a91c9]"
            >
              <AlertTriangle size={14} />
              Open Incident
            </button>
          </div>
        </header>

        <main className="p-6">

          {/* STATS */}
          <div className="grid grid-cols-4 gap-4">

            <div className="rounded-xl border border-[#1a3e55] bg-[#082238] p-5">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0a3047]">
                  <Ship size={19} className="text-[#20bce9]" />
                </div>

                <span className="text-[9px] font-semibold text-[#35d69f]">
                  LIVE
                </span>
              </div>

              <p className="mt-4 text-[9px] uppercase tracking-wider text-[#63899e]">
                Vessels Analyzed
              </p>

              <p className="mt-1 text-2xl font-bold">
                47
              </p>
            </div>

            <div className="rounded-xl border border-[#1a3e55] bg-[#082238] p-5">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0a3047]">
                  <AlertTriangle
                    size={19}
                    className="text-[#ff6474]"
                  />
                </div>

                <span className="text-[9px] font-semibold text-[#ff6474]">
                  PRIORITY
                </span>
              </div>

              <p className="mt-4 text-[9px] uppercase tracking-wider text-[#63899e]">
                High Risk Vessels
              </p>

              <p className="mt-1 text-2xl font-bold">
                3
              </p>
            </div>

            <div className="rounded-xl border border-[#1a3e55] bg-[#082238] p-5">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0a3047]">
                  <Activity
                    size={19}
                    className="text-[#a875ff]"
                  />
                </div>

                <span className="text-[9px] font-semibold text-[#f6c55f]">
                  ANALYZING
                </span>
              </div>

              <p className="mt-4 text-[9px] uppercase tracking-wider text-[#63899e]">
                AIS Correlations
              </p>

              <p className="mt-1 text-2xl font-bold">
                18
              </p>
            </div>

            <div className="rounded-xl border border-[#1a3e55] bg-[#082238] p-5">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0a3047]">
                  <Navigation
                    size={19}
                    className="text-[#35d69f]"
                  />
                </div>

                <span className="text-[9px] font-semibold text-[#35d69f]">
                  UPDATED
                </span>
              </div>

              <p className="mt-4 text-[9px] uppercase tracking-wider text-[#63899e]">
                AIS Coverage
              </p>

              <p className="mt-1 text-2xl font-bold">
                98.4%
              </p>
            </div>

          </div>

          {/* TOP SUSPECT */}
          <div className="mt-5 grid min-w-0 grid-cols-[minmax(0,1.75fr)_minmax(360px,1.25fr)] gap-5">

            {/* VESSEL MAP */}
            <div className="rounded-xl border border-[#1a3e55] bg-[#082238] p-5">

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.16em] text-[#63899e]">
                    AIS Activity
                  </p>

                  <h3 className="mt-1 text-base font-semibold">
                    Vessel Movement Around SP-026
                  </h3>
                </div>

                <span className="flex items-center gap-1.5 rounded-full bg-[#35d69f]/10 px-3 py-1 text-[9px] font-semibold text-[#35d69f]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#35d69f]" />
                  LIVE AIS
                </span>
              </div>

              <div className="relative mt-5 h-[300px] overflow-hidden rounded-lg border border-[#24485d] bg-[#071a29]">

                {/* MAP BACKGROUND */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#0b3448] via-[#071c2c] to-[#08283b]" />

                {/* GRID */}
                <div className="absolute inset-0 opacity-20">
                  <div
                    className="h-full w-full"
                    style={{
                      backgroundImage:
                        "linear-gradient(#4d7180 1px, transparent 1px), linear-gradient(90deg, #4d7180 1px, transparent 1px)",
                      backgroundSize: "42px 42px",
                    }}
                  />
                </div>

                {/* SPILL AREA */}
                <div className="absolute left-[42%] top-[40%] h-28 w-44 rotate-[-20deg] rounded-[50%] border-2 border-[#ff5265] bg-red-500/10 shadow-[0_0_30px_rgba(255,82,101,0.15)]" />

                <div className="absolute left-[47%] top-[45%] h-14 w-24 rotate-[-20deg] rounded-[50%] bg-[#ff5265]/10" />

                {/* TRAJECTORY */}
                {/* ML TRAJECTORY */}
                {trajectory && (
                  <svg
                    className="absolute inset-0 h-full w-full pointer-events-none"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                  >
                    {/* Forward trajectory */}
                    {trajectory.forward?.length > 1 && (
                      <>
                        <polyline
                          points={trajectory.forward
                            .map((point, index) => {
                              const x = 25 + index * 2.2;
                              const y = 68 - index * 0.8;
                              return `${x},${y}`;
                            })
                            .join(" ")}
                          fill="none"
                          stroke="#5cf6dc"
                          strokeWidth="0.6"
                          strokeDasharray="2 1"
                          strokeLinecap="round"
                        />

                        {trajectory.forward.map((point, index) => {
                          const x = 25 + index * 2.2;
                          const y = 68 - index * 0.8;

                          return (
                            <circle
                              key={`forward-${index}`}
                              cx={x}
                              cy={y}
                              r="0.9"
                              fill="#5cf6dc"
                            />
                          );
                        })}
                      </>
                    )}

                    {/* Backward trajectory */}
                    {trajectory.backward?.length > 1 && (
                      <polyline
                        points={trajectory.backward
                          .map((point, index) => {
                            const x = 25 - index * 1.8;
                            const y = 68 + index * 1.2;
                            return `${x},${y}`;
                          })
                          .join(" ")}
                        fill="none"
                        stroke="#8b5cf6"
                        strokeWidth="0.6"
                        strokeDasharray="2 1"
                        strokeLinecap="round"
                      />
                    )}
                  </svg>
                )}

                {/* VESSEL DOTS */}
                <div className="absolute left-[62%] top-[31%] flex items-center gap-1">
                  <span className="h-3 w-3 rounded-full bg-[#ff5265] shadow-[0_0_12px_rgba(255,82,101,0.7)]" />
                  <span className="text-[8px] font-semibold text-[#ff8994]">
                    Ocean Star
                  </span>
                </div>

                <div className="absolute left-[29%] top-[37%] h-2.5 w-2.5 rounded-full bg-[#f6b52d]" />

                <div className="absolute left-[71%] top-[60%] h-2.5 w-2.5 rounded-full bg-[#20bce9]" />

                <div className="absolute left-[18%] top-[25%] h-2.5 w-2.5 rounded-full bg-[#35d69f]" />

                {/* LABELS */}
                <div className="absolute left-3 top-3 rounded-lg border border-[#355366] bg-black/50 px-3 py-2 backdrop-blur">
                  <p className="text-[8px] uppercase tracking-wider text-[#7899a9]">
                    Incident
                  </p>

                  <p className="mt-1 text-[10px] font-semibold">
                    SP-026
                  </p>
                </div>

                <div className="absolute bottom-3 right-3 rounded-lg border border-[#355366] bg-black/50 px-3 py-2 backdrop-blur">
                  <p className="text-[8px] text-[#7899a9]">
                    AIS UPDATE
                  </p>

                  <p className="mt-1 text-[10px] font-semibold">
                    14:32 UTC
                  </p>
                </div>

              </div>

              <div className="mt-4 flex items-center justify-between">

                <div className="flex items-center gap-4 text-[9px] text-[#718fa0]">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#ff5265]" />
                    High Risk
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#f6b52d]" />
                    Medium
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#35d69f]" />
                    Low
                  </div>
                </div>

                <button
                  onClick={() => navigate("/digital-twin")}
                  className="flex items-center gap-1 text-[10px] font-semibold text-[#20bce9] hover:text-white"
                >
                  Open Full Map
                  <ChevronRight size={13} />
                </button>

              </div>
            </div>

            {/* TOP SUSPECT */}
            <div className="rounded-xl border border-[#1a3e55] bg-[#082238] p-5">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-[9px] uppercase tracking-[0.16em] text-[#63899e]">
                    Highest Correlation
                  </p>

                  <h3 className="mt-1 text-base font-semibold">
                    Top Suspect Vessel
                  </h3>
                </div>

                <span className="rounded-full bg-red-500/15 px-3 py-1 text-[9px] font-semibold text-[#ff6474]">
                  HIGH RISK
                </span>

              </div>

              <div className="mt-5 rounded-xl border border-[#24485d] bg-[#0a2940] p-4">

                <div className="flex items-start justify-between">

                  <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#12384d]">
                      <Ship
                        size={22}
                        className="text-[#ff6474]"
                      />
                    </div>

                    <div>
                      <p className="text-sm font-bold">
                        {topVessel?.vessel_name || "Analyzing..."}
                      </p>

                      <p className="mt-1 text-[9px] text-[#63899e]">
                        MMSI {topVessel?.mmsi || "—"} ·{" "}
                        {topVessel?.vessel_type || "—"}
                      </p>
                    </div>

                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold text-[#ff6474]">
                      {topVessel
                        ? `${topVessel.attribution_pct.toFixed(1)}%`
                        : "—"}
                    </p>

                    <p className="text-[8px] uppercase tracking-wider text-[#63899e]">
                      Attribution Score
                    </p>
                  </div>

                </div>

                <div className="mt-5 h-2 rounded-full bg-[#17384d]">
                  <div
                    className="h-full rounded-full bg-[#ff5265]"
                    style={{
                      width: `${topVessel?.attribution_pct || 0}%`,
                    }}
                  />
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">

                  <div className="rounded-lg bg-[#082238] p-3">
                    <p className="text-[8px] uppercase text-[#63899e]">
                      Distance
                    </p>

                    <p className="mt-1 text-sm font-semibold">
                      {topVessel
                        ? `${topVessel.closest_distance_km.toFixed(1)} km`
                        : "—"}
                    </p>
                  </div>

                  <div className="rounded-lg bg-[#082238] p-3">
                    <p className="text-[8px] uppercase text-[#63899e]">
                      Speed
                    </p>

                    <p className="mt-1 text-sm font-semibold">
                      12 km/h
                    </p>
                  </div>

                  <div className="rounded-lg bg-[#082238] p-3">
                    <p className="text-[8px] uppercase text-[#63899e]">
                      Time Delta
                    </p>

                    <p className="mt-1 text-sm font-semibold">
                      {topVessel
                        ? `${Number(topVessel.closest_time_delta_hours).toFixed(1)} hrs`
                        : "—"}
                    </p>
                  </div>

                  <div className="rounded-lg bg-[#082238] p-3">
                    <p className="text-[8px] uppercase text-[#63899e]">
                      Last Seen
                    </p>

                    <p className="mt-1 text-sm font-semibold">
                      {topVessel ? "Matched" : "—"}
                    </p>
                  </div>

                </div>

                <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/5 p-3">

                  <div className="flex items-center gap-2">
                    <AlertTriangle
                      size={14}
                      className="text-[#ff6474]"
                    />

                    <p className="text-[10px] font-semibold">
                      Attribution Evidence
                    </p>
                  </div>

                  <p className="mt-1 text-[9px] leading-relaxed text-[#718fa0]">
                    {topVessel?.evidence?.length
                      ? topVessel.evidence.join(" ")
                      : attributionLoading
                        ? "Analyzing AIS evidence..."
                        : "No evidence available."}
                  </p>

                  <button
                    onClick={() => navigate("/incidents")}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#087cae] py-2.5 text-[10px] font-semibold text-white transition hover:bg-[#0a91c9]"
                  >
                    Investigate Vessel
                    <ChevronRight size={13} />
                  </button>

                </div>
              </div>

            </div>

            {/* VESSEL TABLE */}
            <div className="col-span-2 row-start-1 mt-5 min-w-0 overflow-hidden rounded-xl border border-[#1a3e55] bg-[#082238]">

              <div className="flex items-center justify-between border-b border-[#173d55] p-5">

                <div>
                  <p className="text-[9px] uppercase tracking-[0.16em] text-[#63899e]">
                    Correlation Results
                  </p>

                  <h3 className="mt-1 text-base font-semibold">
                    Suspect Vessel Ranking
                  </h3>
                </div>

                <div className="flex items-center gap-2">

                  <div className="relative">
                    <Search
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#63899e]"
                    />

                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search vessels..."
                      className="h-8 w-48 rounded-lg border border-[#24485d] bg-[#0a2940] pl-8 pr-3 text-[10px] text-white outline-none placeholder:text-[#63899e] focus:border-[#168fc0]"
                    />
                  </div>

                  <div className="flex items-center gap-1 rounded-lg border border-[#24485d] bg-[#0a2940] p-1">

                    <Filter
                      size={13}
                      className="ml-1 text-[#63899e]"
                    />

                    {["All", "HIGH", "MEDIUM", "LOW"].map(
                      (item) => (
                        <button
                          key={item}
                          onClick={() => setFilter(item)}
                          className={`rounded px-2 py-1 text-[9px] transition ${filter === item
                            ? "bg-[#12658c] text-white"
                            : "text-[#718fa0] hover:text-white"
                            }`}
                        >
                          {item}
                        </button>
                      )
                    )}

                  </div>

                </div>
              </div>

              <div className="overflow-hidden">

                <table className="w-full table-fixed">

                  <thead>
                    <tr className="bg-[#0a2940] text-left">

                      <th className="px-5 py-3 text-[9px] uppercase tracking-wider text-[#63899e]">
                        Vessel
                      </th>

                      <th className="px-5 py-3 text-[9px] uppercase tracking-wider text-[#63899e]">
                        Type
                      </th>

                      <th className="px-5 py-3 text-[9px] uppercase tracking-wider text-[#63899e]">
                        Distance
                      </th>

                      <th className="px-5 py-3 text-[9px] uppercase tracking-wider text-[#63899e]">
                        AIS Status
                      </th>

                      <th className="px-5 py-3 text-[9px] uppercase tracking-wider text-[#63899e]">
                        Anomaly
                      </th>

                      <th className="px-5 py-3 text-[9px] uppercase tracking-wider text-[#63899e]">
                        Score
                      </th>

                      <th className="px-5 py-3" />

                    </tr>
                  </thead>

                  <tbody>

                    {filteredVessels.map((vessel, index) => (

                      <tr
                        key={vessel.imo}
                        className="border-t border-[#173d55] transition hover:bg-[#0a2940]"
                      >

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-[#0b3047]">

                              <Ship
                                size={15}
                                className={
                                  index === 0
                                    ? "text-[#ff6474]"
                                    : "text-[#20bce9]"
                                }
                              />

                              {index === 0 && (
                                <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-[#ff5265]" />
                              )}

                            </div>

                            <div>
                              <p className="text-xs font-semibold">
                                {vessel.name}
                              </p>

                              <p className="mt-1 text-[9px] text-[#63899e]">
                                {vessel.imo} · {vessel.flag}
                              </p>
                            </div>

                          </div>

                        </td>

                        <td className="px-5 py-4">
                          <span className="text-xs text-[#a1b6c1]">
                            {vessel.type}
                          </span>
                        </td>

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-2">
                            <MapPin
                              size={12}
                              className="text-[#63899e]"
                            />

                            <span className="text-xs font-semibold">
                              {vessel.distance}
                            </span>
                          </div>

                        </td>

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-2">

                            <span className="h-1.5 w-1.5 rounded-full bg-[#35d69f]" />

                            <div>
                              <p className="text-[10px] text-[#a1b6c1]">
                                {vessel.status}
                              </p>

                              <p className="mt-0.5 text-[8px] text-[#63899e]">
                                {vessel.lastSeen}
                              </p>
                            </div>

                          </div>

                        </td>

                        <td className="px-5 py-4">

                          <span className="text-[10px] text-[#a1b6c1]">
                            {vessel.anomaly}
                          </span>

                        </td>

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-2">

                            <div className="h-1.5 w-12 rounded-full bg-[#17384d]">
                              <div
                                className={`h-full rounded-full ${vessel.score >= 80
                                  ? "bg-[#ff5265]"
                                  : vessel.score >= 60
                                    ? "bg-[#f6b52d]"
                                    : "bg-[#35d69f]"
                                  }`}
                                style={{
                                  width: `${vessel.score}%`,
                                }}
                              />
                            </div>

                            <span
                              className={`text-xs font-bold ${getScoreColor(
                                vessel.score
                              )}`}
                            >
                              {vessel.score}%
                            </span>

                          </div>

                        </td>

                        <td className="px-5 py-4">

                          <button
                            onClick={() => navigate("/incidents")}
                            className="flex items-center gap-1 text-[10px] font-semibold text-[#20bce9] hover:text-white"
                          >
                            <Eye size={13} />
                            View
                          </button>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

                {filteredVessels.length === 0 && (
                  <div className="py-12 text-center">

                    <AlertTriangle
                      size={20}
                      className="mx-auto text-[#63899e]"
                    />

                    <p className="mt-2 text-xs text-[#718fa0]">
                      No vessels found
                    </p>

                  </div>
                )}

              </div>
            </div>

            {/* ANALYSIS FOOTER */}
            <div className="col-span-2 row-start-3 mt-5 grid min-w-0 grid-cols-3 gap-4">

              <div className="rounded-xl border border-[#1a3e55] bg-[#082238] p-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0a3047]">
                    <CheckCircle2
                      size={16}
                      className="text-[#35d69f]"
                    />
                  </div>

                  <div>
                    <p className="text-xs font-semibold">
                      AIS Correlation Complete
                    </p>

                    <p className="mt-0.5 text-[9px] text-[#63899e]">
                      Historical tracks matched against spill origin.
                    </p>
                  </div>

                </div>

              </div>

              <div className="rounded-xl border border-[#1a3e55] bg-[#082238] p-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0a3047]">
                    <Navigation
                      size={16}
                      className="text-[#20bce9]"
                    />
                  </div>

                  <div>
                    <p className="text-xs font-semibold">
                      Drift Corridor Matched
                    </p>

                    <p className="mt-0.5 text-[9px] text-[#63899e]">
                      Wind and current direction considered.
                    </p>
                  </div>

                </div>

              </div>

              <div className="rounded-xl border border-[#1a3e55] bg-[#082238] p-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0a3047]">
                    <History
                      size={16}
                      className="text-[#a875ff]"
                    />
                  </div>

                  <div>
                    <p className="text-xs font-semibold">
                      Historical AIS Available
                    </p>

                    <p className="mt-0.5 text-[9px] text-[#63899e]">
                      Vessel movement history linked to this incident.
                    </p>
                  </div>

                </div>

              </div>

            </div>

            {/* BOTTOM */}
            <div className="col-span-2 row-start-4 mt-5 flex min-w-0 items-center justify-between overflow-hidden rounded-xl border border-[#1a3e55] bg-[#082238] px-5 py-4">
              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0a3047]">
                  <Clock
                    size={16}
                    className="text-[#20bce9]"
                  />
                </div>

                <div>
                  <p className="text-xs font-semibold">
                    AIS Monitoring Active
                  </p>

                  <p className="mt-0.5 text-[9px] text-[#63899e]">
                    Vessel positions are continuously correlated with
                    active spill incidents.
                  </p>
                </div>

              </div>

              <button
                onClick={() => navigate("/digital-twin")}
                className="flex items-center gap-2 rounded-lg bg-[#087cae] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#0a91c9]"
              >
                <Waves size={14} />
                Open Maritime View
              </button>

                       </div>

          </div>

        </main>
      </div>
    </div>
  );
}