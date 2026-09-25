import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  ArrowLeft,
  MapPin,
  Clock,
  Droplets,
  Wind,
  Waves,
  Ship,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Download,
  Navigation,
  Activity,
  Satellite,
  Search,
  Eye,
} from "lucide-react";

import Sidebar from "../components/Sidebar";



export default function IncidentDetails() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const incidentId = searchParams.get("id");

  const [activeTab, setActiveTab] = useState("overview");
  const [search, setSearch] = useState("");

  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [analysisData, setAnalysisData] = useState(null);
const [analysisLoading, setAnalysisLoading] = useState(false);

useEffect(() => {
  const fetchIncidents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://127.0.0.1:8000/api/incidents/"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch incidents");
      }

      const data = await response.json();

      const formattedIncidents = data.map((incident) => ({
        id: incident._id,

        location: `${incident.latitude}° N · ${incident.longitude}° E`,

        description: "Maritime spill incident detected",

        area: `${incident.area_km2} km²`,

        confidence:
          incident.confidence != null
            ? `${Math.round(incident.confidence * 100)}%`
            : "—",

        detectionTime: "—",
        date: "—",
        drift: "—",

        risk: incident.severity?.toUpperCase() || "—",

        status: incident.status?.toUpperCase() || "—",

        age: "—",
        coast: "—",

        coordinates: `${incident.latitude}° N · ${incident.longitude}° E`,

        wind: "—",
        current: "—",
        wave: "—",
        visibility: "—",

        oilSignature: "—",
        classification: "—",
        perimeter: "—",
        majorAxis: "—",
        minorAxis: "—",

        vessels: 0,
      }));

      setIncidents(formattedIncidents);
    } catch (err) {
      console.error("Error fetching incidents:", err);
      setError("Unable to load incidents from backend.");
    } finally {
      setLoading(false);
    }
  };

  fetchIncidents();
}, []);
useEffect(() => {
  if (!incidentId) return;

  const fetchAnalysis = async () => {
    try {
      setAnalysisLoading(true);

      const response = await fetch(
        `http://127.0.0.1:8000/api/incidents/${incidentId}/analysis?start_time=2026-09-14%2010%3A00%3A00&end_time=2026-09-14%2010%3A20%3A00`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch incident analysis");
      }

      const data = await response.json();
      setAnalysisData(data);
    } catch (err) {
      console.error("Error fetching analysis:", err);
    } finally {
      setAnalysisLoading(false);
    }
  };

  fetchAnalysis();
}, [incidentId]);
  const selectedIncident = incidents.find(
    (incident) => incident.id === incidentId
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#061b2b] text-white">
        <p className="text-sm text-[#8faab8]">Loading incidents...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#061b2b] text-white">
        <p className="text-sm text-[#ff6474]">{error}</p>
      </div>
    );
  }

  // If no incident is selected, show the complete incident list.
  if (!selectedIncident) {
    const filteredIncidents = incidents.filter((incident) => {
      const value = search.toLowerCase();
      return (
        incident.id.toLowerCase().includes(value) ||
        incident.location.toLowerCase().includes(value) ||
        incident.status.toLowerCase().includes(value)
      );
    });

    return (
      <div className="min-h-screen bg-[#061b2b] text-white">
        <Sidebar />

        <div className="ml-[245px] min-h-screen">
          <header className="flex h-[76px] items-center justify-between border-b border-[#173d55] bg-[#071f32] px-7">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#62889e]">
                Maritime Intelligence
              </p>
              <h1 className="mt-1 text-xl font-semibold">
                Spill Incidents
              </h1>
            </div>

            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 rounded-lg border border-[#24485d] bg-[#0a2940] px-4 py-2.5 text-xs font-semibold text-[#a5bdc9] transition hover:bg-[#0d344d] hover:text-white"
            >
              <ArrowLeft size={15} />
              Back to Dashboard
            </button>
          </header>

          <main className="p-7">
            <div className="mb-6 grid grid-cols-4 gap-4">
              <div className="rounded-xl border border-[#1a3e55] bg-[#082238] p-5">
                <p className="text-[9px] uppercase tracking-wider text-[#63899e]">
                  Total Incidents
                </p>
                <p className="mt-2 text-3xl font-bold">
                  {incidents.length}
                </p>
              </div>

              <div className="rounded-xl border border-[#1a3e55] bg-[#082238] p-5">
                <p className="text-[9px] uppercase tracking-wider text-[#63899e]">
                  Active
                </p>
                <p className="mt-2 text-3xl font-bold text-[#ff6474]">
                  {
                    incidents.filter(
                      (incident) => incident.status === "ACTIVE"
                    ).length
                  }
                </p>
              </div>

              <div className="rounded-xl border border-[#1a3e55] bg-[#082238] p-5">
                <p className="text-[9px] uppercase tracking-wider text-[#63899e]">
                  Vessel Linked
                </p>
                <p className="mt-2 text-3xl font-bold text-[#20bce9]">
                  82
                </p>
              </div>

              <div className="rounded-xl border border-[#1a3e55] bg-[#082238] p-5">
                <p className="text-[9px] uppercase tracking-wider text-[#63899e]">
                  Regions
                </p>
                <p className="mt-2 text-3xl font-bold text-[#35d69f]">
                  3
                </p>
              </div>
            </div>

            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold">
                  Detected Spill Incidents
                </h2>
                <p className="mt-1 text-xs text-[#6f93a8]">
                  Select an incident to open its complete investigation.
                </p>
              </div>

              <div className="relative">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64899d]"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search incidents..."
                  className="w-[230px] rounded-lg border border-[#21465d] bg-[#071f32] py-2.5 pl-9 pr-3 text-xs text-white outline-none placeholder:text-[#5f8194] focus:border-[#287da3]"
                />
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-[#1a3e55] bg-[#082238]">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#173d55] bg-[#0a2940] text-[9px] uppercase tracking-wider text-[#63899e]">
                    <th className="px-5 py-4">Incident</th>
                    <th className="px-4 py-4">Location</th>
                    <th className="px-4 py-4">Spill Area</th>
                    <th className="px-4 py-4">Confidence</th>
                    <th className="px-4 py-4">Detected</th>
                    <th className="px-4 py-4">Risk</th>
                    <th className="px-5 py-4 text-right">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredIncidents.map((incident) => (
                    <tr
                      key={incident.id}
                      className="border-b border-[#173d55] last:border-0 transition hover:bg-[#0a2940]"
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold">
                          {incident.id}
                        </p>
                        <p className="mt-1 text-[9px] text-[#63899e]">
                          {incident.date}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-[#ff5265]" />
                          <span className="text-xs text-[#a4bdcb]">
                            {incident.location}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-xs font-semibold">
                        {incident.area}
                      </td>

                      <td className="px-4 py-4">
                        <span className="font-semibold text-[#35d69f]">
                          {incident.confidence}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div>
                          <p className="text-xs text-[#a4bdcb]">
                            {incident.detectionTime}
                          </p>
                          <p className="mt-1 text-[9px] text-[#63899e]">
                            {incident.date}
                          </p>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${
                            incident.risk === "HIGH"
                              ? "bg-red-500/15 text-[#ff6474]"
                              : incident.risk === "MEDIUM"
                              ? "bg-yellow-500/15 text-[#f6c55f]"
                              : "bg-green-500/15 text-[#5ee5b0]"
                          }`}
                        >
                          {incident.risk}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() =>
                            navigate(`/incidents?id=${incident.id}`)
                          }
                          className="inline-flex items-center gap-2 rounded-lg bg-[#087cae] px-3 py-2 text-[10px] font-semibold text-white transition hover:bg-[#0994cf]"
                        >
                          <Eye size={13} />
                          View Incident
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const handleGenerateReport = () => {
    navigate(`/reports?incident=${selectedIncident.id}`);
  };

  return (
    <div className="min-h-screen bg-[#061b2b] text-white">
      <Sidebar />

      <div className="ml-[245px] min-h-screen">
        <header className="flex h-[76px] items-center justify-between border-b border-[#173d55] bg-[#071f32] px-7">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/incidents")}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#24485d] bg-[#0a2940] text-[#89a7b7] transition hover:bg-[#0d344d] hover:text-white"
            >
              <ArrowLeft size={17} />
            </button>

            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#62889e]">
                Incident Investigation
              </p>

              <h2 className="mt-1 text-lg font-semibold">
                Spill Incident {selectedIncident.id}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleGenerateReport}
              className="flex items-center gap-2 rounded-lg border border-[#24485d] bg-[#0a2940] px-4 py-2.5 text-xs font-semibold text-[#a5bdc9] transition hover:bg-[#0d344d] hover:text-white"
            >
              <FileText size={14} />
              Generate Report
            </button>

            <button
              onClick={() => navigate("/digital-twin")}
              className="flex items-center gap-2 rounded-lg bg-[#087cae] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#0a91c9]"
            >
              <Navigation size={14} />
              Open Digital Twin
            </button>
          </div>
        </header>

        <main className="p-6">
          {/* INCIDENT HEADER */}
          <div className="mb-5 rounded-xl border border-[#1a3e55] bg-[#082238] p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">
                    {selectedIncident.id}
                  </h1>

                  <span
                    className={`rounded-full px-3 py-1 text-[10px] font-bold ${
                      selectedIncident.risk === "HIGH"
                        ? "bg-red-500/15 text-[#ff6474]"
                        : selectedIncident.risk === "MEDIUM"
                        ? "bg-yellow-500/15 text-[#f6c55f]"
                        : "bg-green-500/15 text-[#5ee5b0]"
                    }`}
                  >
                    {selectedIncident.risk} RISK
                  </span>

                  <span className="flex items-center gap-1.5 rounded-full bg-[#35d69f]/10 px-3 py-1 text-[10px] font-semibold text-[#35d69f]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#35d69f]" />
                    {selectedIncident.status}
                  </span>
                </div>

                <p className="mt-2 text-xs text-[#7597aa]">
                  {selectedIncident.description}
                </p>
              </div>

              <div className="text-right">
                <p className="text-[9px] uppercase tracking-wider text-[#63899e]">
                  Last Updated
                </p>

                <p className="mt-1 text-xs font-medium text-[#a6bdc9]">
                  {selectedIncident.detectionTime} ·{" "}
                  {selectedIncident.date}
                </p>
              </div>
            </div>

            {/* STATS */}
            <div className="mt-6 grid grid-cols-5 gap-3">
              <div className="rounded-lg border border-[#173d55] bg-[#0a2940] p-4">
                <Droplets size={17} className="text-[#ff6474]" />
                <p className="mt-3 text-[9px] uppercase tracking-wider text-[#63899e]">
                  Spill Area
                </p>
                <p className="mt-1 text-lg font-bold">
                  {selectedIncident.area}
                </p>
              </div>

              <div className="rounded-lg border border-[#173d55] bg-[#0a2940] p-4">
                <Satellite size={17} className="text-[#20bce9]" />
                <p className="mt-3 text-[9px] uppercase tracking-wider text-[#63899e]">
                  Confidence
                </p>
                <p className="mt-1 text-lg font-bold">
                  {selectedIncident.confidence}
                </p>
              </div>

              <div className="rounded-lg border border-[#173d55] bg-[#0a2940] p-4">
                <Clock size={17} className="text-[#a875ff]" />
                <p className="mt-3 text-[9px] uppercase tracking-wider text-[#63899e]">
                  Detection Time
                </p>
                <p className="mt-1 text-lg font-bold">
                  {selectedIncident.detectionTime}
                </p>
              </div>

              <div className="rounded-lg border border-[#173d55] bg-[#0a2940] p-4">
                <Wind size={17} className="text-[#35d69f]" />
                <p className="mt-3 text-[9px] uppercase tracking-wider text-[#63899e]">
                  Drift
                </p>
                <p className="mt-1 text-lg font-bold">
                  {selectedIncident.drift}
                </p>
              </div>

              <div className="rounded-lg border border-[#173d55] bg-[#0a2940] p-4">
                <Ship size={17} className="text-[#f6b52d]" />
                <p className="mt-3 text-[9px] uppercase tracking-wider text-[#63899e]">
                  Suspect Vessels
                </p>
                <p className="mt-1 text-lg font-bold">
                  {analysisData?.vessels
  ? new Set(analysisData.vessels.map((v) => v.vessel_id)).size
  : "—"}
                </p>
              </div>
            </div>
          </div>

          {/* TABS */}
          <div className="mb-5 flex items-center gap-1 rounded-xl border border-[#1a3e55] bg-[#082238] p-1.5">
            {[
              ["overview", "Overview"],
              ["detection", "Spill Detection"],
              ["vessels", "Vessel Analysis"],
              ["trajectory", "Drift & Trajectory"],
              ["evidence", "Evidence"],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`rounded-lg px-5 py-2.5 text-xs font-medium transition ${
                  activeTab === key
                    ? "bg-[#12658c] text-white"
                    : "text-[#7597aa] hover:bg-[#0d3048] hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* OVERVIEW */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-[1.4fr_1fr] gap-5">
              <div className="rounded-xl border border-[#1a3e55] bg-[#082238] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.16em] text-[#63899e]">
                      Incident Location
                    </p>

                    <h3 className="mt-1 text-base font-semibold">
                      {selectedIncident.location}
                    </h3>
                  </div>

                  <MapPin size={18} className="text-[#ff5265]" />
                </div>

                <div className="mt-5 h-[260px] overflow-hidden rounded-lg border border-[#24485d] bg-[#092c42]">
                  <div className="relative flex h-full items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 opacity-30">
                      <div className="h-full w-full bg-[radial-gradient(circle_at_center,#1b6685_1px,transparent_1px)] [background-size:22px_22px]" />
                    </div>

                    <div className="relative">
                      <div className="absolute -inset-16 rounded-full border border-red-400/20" />
                      <div className="absolute -inset-10 rounded-full border border-red-400/30" />

                      <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-red-400 bg-red-500/20">
                        <Droplets size={23} className="text-[#ff6474]" />
                      </div>
                    </div>

                    <div className="absolute bottom-4 left-4 rounded-lg border border-[#24485d] bg-[#082238]/90 px-3 py-2">
                      <p className="text-[9px] text-[#63899e]">
                        Coordinates
                      </p>

                      <p className="mt-1 text-xs font-semibold">
                        {selectedIncident.coordinates}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-[9px] text-[#63899e]">
                      Region
                    </p>
                    <p className="mt-1 text-xs font-medium">
                      {selectedIncident.location}
                    </p>
                  </div>

                  <div>
                    <p className="text-[9px] text-[#63899e]">
                      Distance to Coast
                    </p>
                    <p className="mt-1 text-xs font-medium">
                      {selectedIncident.coast}
                    </p>
                  </div>

                  <div>
                    <p className="text-[9px] text-[#63899e]">
                      Estimated Age
                    </p>
                    <p className="mt-1 text-xs font-medium">
                      {selectedIncident.age}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div className="rounded-xl border border-[#1a3e55] bg-[#082238] p-5">
                  <div className="flex items-center gap-2">
                    <Activity size={16} className="text-[#20bce9]" />
                    <h3 className="text-sm font-semibold">
                      Detection Analysis
                    </h3>
                  </div>

                  <div className="mt-5 space-y-4">
                    {[
                      [
                        "SAR Detection Confidence",
                        selectedIncident.confidence,
                        selectedIncident.confidence,
                        "#20bce9",
                      ],
                      [
                        "Oil-like Signature",
                        selectedIncident.oilSignature,
                        selectedIncident.oilSignature,
                        "#35d69f",
                      ],
                      [
                        "Classification Confidence",
                        selectedIncident.classification,
                        selectedIncident.classification,
                        "#a875ff",
                      ],
                    ].map(([label, value, width, color]) => (
                      <div key={label}>
                        <div className="mb-2 flex justify-between">
                          <span className="text-[10px] text-[#7899aa]">
                            {label}
                          </span>
                          <span className="text-[10px] font-semibold">
                            {value}
                          </span>
                        </div>

                        <div className="h-1.5 rounded-full bg-[#16384e]">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width,
                              backgroundColor: color,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-[#1a3e55] bg-[#082238] p-5">
                  <div className="flex items-center gap-2">
                    <Wind size={16} className="text-[#35d69f]" />
                    <h3 className="text-sm font-semibold">
                      Environmental Conditions
                    </h3>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {[
                      [
  "Wind",
  analysisData?.environment?.length
    ? `${analysisData.environment[0].wind_speed} m/s · ${analysisData.environment[0].wind_direction}°`
    : "—",
],
[
  "Current",
  analysisData?.environment?.length
    ? `${analysisData.environment[0].current_speed} m/s · ${analysisData.environment[0].current_direction}°`
    : "—",
],
                      ["Wave Height", selectedIncident.wave],
                      ["Visibility", selectedIncident.visibility],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-lg bg-[#0a2940] p-3"
                      >
                        <p className="text-[9px] text-[#63899e]">
                          {label}
                        </p>
                        <p className="mt-1 text-xs font-semibold">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-[#553c26] bg-[#211d18] p-4">
                  <div className="flex gap-3">
                    <AlertTriangle
                      size={17}
                      className="mt-0.5 text-[#f6b52d]"
                    />

                    <div>
                      <p className="text-xs font-semibold text-[#f6c55f]">
                        Action Required
                      </p>

                      <p className="mt-1 text-[10px] leading-relaxed text-[#a99a7f]">
                        Spill is drifting {selectedIncident.drift}.
                        Nearby vessels require investigation.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DETECTION */}
          {activeTab === "detection" && (
            <div className="grid grid-cols-[1.4fr_1fr] gap-5">
              <div className="rounded-xl border border-[#1a3e55] bg-[#082238] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.16em] text-[#63899e]">
                      Sentinel-1 SAR
                    </p>

                    <h3 className="mt-1 text-base font-semibold">
                      Detected Spill Signature
                    </h3>
                  </div>

                  <Satellite size={18} className="text-[#20bce9]" />
                </div>

                <div className="mt-5 flex h-[430px] items-center justify-center overflow-hidden rounded-lg border border-[#24485d] bg-[#071a29]">
                  <div className="relative h-[310px] w-[90%] overflow-hidden rounded-lg bg-gradient-to-br from-[#132f3d] via-[#071923] to-[#102d3c]">
                    <div className="absolute inset-0 opacity-30">
                      <div className="h-full w-full bg-[radial-gradient(circle_at_center,#6b8790_1px,transparent_1px)] [background-size:14px_14px]" />
                    </div>

                    <div className="absolute left-[38%] top-[30%] h-36 w-48 rotate-[-22deg] rounded-[50%] bg-[#263f47] opacity-80 blur-md" />

                    <div className="absolute left-[35%] top-[34%] h-28 w-44 rotate-[-22deg] rounded-[50%] border-2 border-[#ff5265] bg-red-500/10" />

                    <div className="absolute left-4 top-4 rounded bg-black/60 px-3 py-1.5 text-[9px] text-[#9eb6c2]">
                      Sentinel-1 · VV Polarization
                    </div>

                    <div className="absolute bottom-4 right-4 rounded bg-black/60 px-3 py-1.5 text-[9px] text-[#9eb6c2]">
                      10 m Resolution
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div className="rounded-xl border border-[#1a3e55] bg-[#082238] p-5">
                  <h3 className="text-sm font-semibold">
                    Spill Characteristics
                  </h3>

                  <div className="mt-5 space-y-3">
                    {[
                      ["Estimated Area", selectedIncident.area],
                      ["Perimeter", selectedIncident.perimeter],
                      ["Major Axis", selectedIncident.majorAxis],
                      ["Minor Axis", selectedIncident.minorAxis],
                      ["Estimated Age", selectedIncident.age],
                      ["Confidence", selectedIncident.confidence],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="flex items-center justify-between border-b border-[#173d55] pb-3 last:border-0"
                      >
                        <span className="text-[10px] text-[#6f91a4]">
                          {label}
                        </span>
                        <span className="text-xs font-semibold">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-[#1a3e55] bg-[#082238] p-5">
                  <h3 className="text-sm font-semibold">
                    Detection Pipeline
                  </h3>

                  <div className="mt-5 space-y-4">
                    {[
                      "SAR Image Acquired",
                      "Pre-processing",
                      "Segmentation",
                      "Spill Classification",
                      "Geometry Extraction",
                    ].map((label) => (
                      <div
                        key={label}
                        className="flex items-center gap-3"
                      >
                        <CheckCircle2
                          size={16}
                          className="text-[#35d69f]"
                        />
                        <span className="text-xs text-[#9bb3bf]">
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VESSELS */}
          {activeTab === "vessels" && (
            <div className="rounded-xl border border-[#1a3e55] bg-[#082238]">
              <div className="flex items-center justify-between border-b border-[#173d55] p-5">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.16em] text-[#63899e]">
                    AIS Correlation
                  </p>

                  <h3 className="mt-1 text-base font-semibold">
                    Suspect Vessel Ranking
                  </h3>
                </div>

                <button
                  onClick={() => navigate("/vessel-intelligence")}
                  className="flex items-center gap-2 rounded-lg border border-[#24485d] bg-[#0a2940] px-3 py-2 text-[10px] font-semibold text-[#8eacba] hover:bg-[#0d344d] hover:text-white"
                >
                  <Ship size={14} />
                  Vessel Intelligence
                </button>
              </div>

              <div className="p-5">
                <div className="overflow-hidden rounded-lg border border-[#173d55]">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#0a2940] text-left">
                        <th className="px-4 py-3 text-[9px] uppercase tracking-wider text-[#63899e]">
                          Rank
                        </th>
                        <th className="px-4 py-3 text-[9px] uppercase tracking-wider text-[#63899e]">
                          Vessel
                        </th>
                        <th className="px-4 py-3 text-[9px] uppercase tracking-wider text-[#63899e]">
                          Distance
                        </th>
                        <th className="px-4 py-3 text-[9px] uppercase tracking-wider text-[#63899e]">
                          Speed
                        </th>
                        <th className="px-4 py-3 text-[9px] uppercase tracking-wider text-[#63899e]">
                          Correlation
                        </th>
                        <th className="px-4 py-3 text-[9px] uppercase tracking-wider text-[#63899e]">
                          Risk
                        </th>
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>

                    <tbody>
  {analysisLoading ? (
    <tr>
      <td
        colSpan="7"
        className="px-4 py-8 text-center text-xs text-[#63899e]"
      >
        Loading AIS vessel analysis...
      </td>
    </tr>
  ) : analysisData?.vessels?.length ? (
    analysisData.vessels.map((vessel, index) => (
      <tr
        key={`${vessel.vessel_id}-${vessel.timestamp}`}
        className="border-t border-[#173d55] hover:bg-[#0a2940]"
      >
        <td className="px-4 py-4">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#12364c] text-xs font-bold">
            {index + 1}
          </span>
        </td>

        <td className="px-4 py-4">
          <p className="text-xs font-semibold">
            {vessel.vessel_id}
          </p>
          <p className="mt-1 text-[9px] text-[#63899e]">
            AIS Historical Track
          </p>
        </td>

        <td className="px-4 py-4 text-xs text-[#9bb3bf]">
          {vessel.distance_from_spill_km} km
        </td>

        <td className="px-4 py-4 text-xs text-[#9bb3bf]">
          {vessel.speed} kn
        </td>

        <td className="px-4 py-4 text-xs text-[#9bb3bf]">
          {vessel.heading}°
        </td>

        <td className="px-4 py-4">
          <span className="rounded-full bg-[#20bce9]/10 px-2.5 py-1 text-[9px] font-bold text-[#20bce9]">
            CANDIDATE
          </span>
        </td>

        <td className="px-4 py-4">
          <button
            onClick={() => navigate("/vessel-intelligence")}
            className="text-[10px] font-semibold text-[#20bce9] hover:text-white"
          >
            Investigate
          </button>
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td
        colSpan="7"
        className="px-4 py-8 text-center text-xs text-[#63899e]"
      >
        No nearby vessels found.
      </td>
    </tr>
  )}
</tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TRAJECTORY */}
          {activeTab === "trajectory" && (
            <div className="grid grid-cols-[1.5fr_1fr] gap-5">
              <div className="rounded-xl border border-[#1a3e55] bg-[#082238] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.16em] text-[#63899e]">
                      Drift Modelling
                    </p>
                    <h3 className="mt-1 text-base font-semibold">
                      Spill Trajectory
                    </h3>
                  </div>

                  <Waves size={18} className="text-[#20bce9]" />
                </div>

                <div className="relative mt-5 h-[430px] overflow-hidden rounded-lg border border-[#24485d] bg-[#092b40]">
                  <div className="absolute inset-0 opacity-20">
                    <div className="h-full w-full bg-[linear-gradient(25deg,transparent_45%,#3b7b91_46%,transparent_47%)] [background-size:55px_55px]" />
                  </div>

                  <div className="absolute left-[42%] top-[38%] h-10 w-10 rounded-full border-2 border-red-400 bg-red-500/20" />

                  <div className="absolute left-[45%] top-[43%] h-36 w-1 rotate-[-35deg] origin-top bg-gradient-to-b from-[#ff5265] to-[#20bce9]" />

                  <div className="absolute left-[57%] top-[60%] rounded-full border border-[#20bce9]/40 px-5 py-3 text-center">
                    <p className="text-[9px] text-[#63899e]">
                      Forecast Position
                    </p>
                    <p className="mt-1 text-xs font-semibold">
  {analysisData?.environment?.length
    ? "Environment data available"
    : "Awaiting trajectory model"}
</p>
                  </div>

                  <div className="absolute bottom-4 left-4 rounded-lg border border-[#24485d] bg-[#082238]/90 p-3">
                    <p className="text-[9px] uppercase tracking-wider text-[#63899e]">
                      Model
                    </p>
                    <p className="mt-1 text-xs font-semibold">
                      Ocean + Wind Drift
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div className="rounded-xl border border-[#1a3e55] bg-[#082238] p-5">
                  <h3 className="text-sm font-semibold">
                    Current Conditions
                  </h3>

                  <div className="mt-4 space-y-3">
                    <div className="flex justify-between rounded-lg bg-[#0a2940] p-3">
                      <span className="text-[10px] text-[#63899e]">
                        Ocean Current
                      </span>
                      <span className="text-xs font-semibold">
                        {analysisData?.environment?.length
  ? `${analysisData.environment[0].current_speed} m/s · ${analysisData.environment[0].current_direction}°`
  : "—"}
                      </span>
                    </div>

                    <div className="flex justify-between rounded-lg bg-[#0a2940] p-3">
                      <span className="text-[10px] text-[#63899e]">
                        Wind
                      </span>
                      <span className="text-xs font-semibold">
                        {analysisData?.environment?.length
  ? `${analysisData.environment[0].wind_speed} m/s · ${analysisData.environment[0].wind_direction}°`
  : "—"}
                      </span>
                    </div>

                    <div className="flex justify-between rounded-lg bg-[#0a2940] p-3">
                      <span className="text-[10px] text-[#63899e]">
                        Model Confidence
                      </span>
                      <span className="text-xs font-semibold text-[#35d69f]">
  {selectedIncident.confidence}
</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-[#1a3e55] bg-[#082238] p-5">
  <h3 className="text-sm font-semibold">
    Forecast
  </h3>

  <div className="mt-5 space-y-4">
    {[
      ["Current Position", selectedIncident.coordinates],
      [
        "Wind Influence",
        analysisData?.environment?.length
          ? `${analysisData.environment[0].wind_speed} m/s · ${analysisData.environment[0].wind_direction}°`
          : "—",
      ],
      [
        "Ocean Current",
        analysisData?.environment?.length
          ? `${analysisData.environment[0].current_speed} m/s · ${analysisData.environment[0].current_direction}°`
          : "—",
      ],
      [
        "Trajectory Status",
        analysisData?.environment?.length
          ? "Ready for trajectory modelling"
          : "Awaiting data",
      ],
    ].map(([label, value]) => (
      <div
        key={label}
        className="flex items-center justify-between"
      >
        <span className="text-[10px] text-[#718fa0]">
          {label}
        </span>

        <span className="text-xs font-semibold text-right">
          {value}
        </span>
      </div>
    ))}
  </div>

                </div>
              </div>
            </div>
          )}

          {/* EVIDENCE */}
          {activeTab === "evidence" && (
            <div className="grid grid-cols-2 gap-5">
              <div className="rounded-xl border border-[#1a3e55] bg-[#082238] p-5">
                <div className="flex items-center gap-2">
                  <Satellite size={16} className="text-[#20bce9]" />
                  <h3 className="text-sm font-semibold">
                    Satellite Evidence
                  </h3>
                </div>

                <div className="mt-5 space-y-3">
                  {[
                    [
                      "Sentinel-1 SAR",
                      `${selectedIncident.date} · ${selectedIncident.detectionTime}`,
                    ],
                    ["VV Polarization", "10 m resolution"],
                    ["Detection Model", "U-Net Segmentation"],
                    ["Classification", "Oil-like signature"],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-lg bg-[#0a2940] p-3"
                    >
                      <p className="text-[9px] text-[#63899e]">
                        {label}
                      </p>
                      <p className="mt-1 text-xs font-semibold">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-[#1a3e55] bg-[#082238] p-5">
                <div className="flex items-center gap-2">
                  <Ship size={16} className="text-[#f6b52d]" />
                  <h3 className="text-sm font-semibold">
                    AIS Evidence
                  </h3>
                </div>

                <div className="mt-5 space-y-3">
                  {[
                    [
  ["AIS Window", "2026-09-14 10:00–10:20 UTC"],

  [
    "Vessels Filtered",
    analysisData?.vessels?.length ?? "—",
  ],

  [
    "Nearby Candidates",
    analysisData?.vessels
      ? new Set(analysisData.vessels.map((v) => v.vessel_id)).size
      : "—",
  ],

  [
    "Top Candidate",
    analysisData?.vessels?.length
      ? analysisData.vessels[0].vessel_id
      : "—",
  ],
].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-lg bg-[#0a2940] p-3"
                    >
                      <p className="text-[9px] text-[#63899e]">
                        {label}
                      </p>
                      <p className="mt-1 text-xs font-semibold">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="col-span-2 rounded-xl border border-[#1a3e55] bg-[#082238] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.16em] text-[#63899e]">
                      Investigation Summary
                    </p>

                    <h3 className="mt-1 text-base font-semibold">
                      Evidence Chain
                    </h3>
                  </div>

                  <CheckCircle2
                    size={18}
                    className="text-[#35d69f]"
                  />
                </div>

                <div className="mt-5 grid grid-cols-4 gap-3">
                  {[
                    ["01", "Spill Detected", "Sentinel-1 SAR"],
                    [
                      "02",
                      "Origin Estimated",
                      selectedIncident.coordinates,
                    ],
                    [
                      "03",
                      "Trajectory Reconstructed",
                      "Wind + Ocean Currents",
                    ],
                    [
                      "04",
                      "Vessels Correlated",
                      "AIS Historical Tracks",
                    ],
                  ].map(([num, title, desc]) => (
                    <div
                      key={num}
                      className="rounded-lg border border-[#173d55] bg-[#0a2940] p-4"
                    >
                      <span className="text-[10px] font-bold text-[#20bce9]">
                        {num}
                      </span>

                      <p className="mt-3 text-xs font-semibold">
                        {title}
                      </p>

                      <p className="mt-1 text-[9px] leading-relaxed text-[#6f91a4]">
                        {desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* BOTTOM ACTIONS */}
          <div className="mt-5 flex items-center justify-between rounded-xl border border-[#1a3e55] bg-[#082238] px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0a3047]">
                <AlertTriangle
                  size={16}
                  className="text-[#f6b52d]"
                />
              </div>

              <div>
                <p className="text-xs font-semibold">
                  Investigation Status
                </p>

                <p className="mt-0.5 text-[9px] text-[#63899e]">
                  Vessel attribution is currently under investigation
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => navigate("/spill-detection")}
                className="flex items-center gap-2 rounded-lg border border-[#24485d] bg-[#0a2940] px-4 py-2.5 text-xs font-semibold text-[#9bb3bf] transition hover:bg-[#0d344d] hover:text-white"
              >
                <Search size={14} />
                View Detection
              </button>

              <button
                onClick={handleGenerateReport}
                className="flex items-center gap-2 rounded-lg bg-[#087cae] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#0a91c9]"
              >
                <Download size={14} />
                Generate Report
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}