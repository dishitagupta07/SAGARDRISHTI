import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Search,
  Filter,
  Satellite,
  Droplets,
  Activity,
  Clock,
  MapPin,
  Eye,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Waves,
  Download,
} from "lucide-react";

import Sidebar from "../components/Sidebar";

export default function SpillDetection() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedDetection, setSelectedDetection] = useState(null);
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sarFile, setSarFile] = useState(null);
  const [detecting, setDetecting] = useState(false);
  const [mlResult, setMlResult] = useState(null);
  const [mlError, setMlError] = useState("");


  useEffect(() => {
    const fetchDetections = async () => {
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

        const formattedDetections = data.map((incident) => ({
          id: incident._id,
          location: `${incident.latitude}° N · ${incident.longitude}° E`,
          area: `${incident.area_km2} km²`,
          confidence: incident.confidence,
          status: incident.status
            ? incident.status.charAt(0).toUpperCase() +
            incident.status.slice(1).toLowerCase()
            : "—",
          severity: incident.severity,
        }));

        setDetections(formattedDetections);
      } catch (err) {
        console.error("Error fetching detections:", err);
        setError("Unable to load detections from backend.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetections();
  }, []);
  const detectSpill = async () => {
    if (!sarFile) {
      setMlError("Please select a SAR image first.");
      return;
    }

    try {
      setDetecting(true);
      setMlError("");
      setMlResult(null);

      const formData = new FormData();
      formData.append("file", sarFile);
      formData.append("checkpoint_path", "checkpoints/unet_best.pt");
      formData.append("pixel_size_m", "100");

      const response = await fetch(
        "http://127.0.0.1:8001/detect-spill",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || "Spill detection failed."
        );
      }

      const result = await response.json();
      setMlResult(result);
    } catch (err) {
      console.error("ML spill detection error:", err);
      setMlError(err.message || "Unable to connect to ML service.");
    } finally {
      setDetecting(false);
    }
  };
  <div className="sar-upload-section">
    <h2>SAR Spill Detection</h2>

    <input
      type="file"
      accept="image/*"
      onChange={(e) => {
        setSarFile(e.target.files[0]);
        setMlError("");
        setMlResult(null);
      }}
    />

    <button
      onClick={detectSpill}
      disabled={detecting || !sarFile}
    >
      {detecting ? "Detecting..." : "Detect Spill"}
    </button>

    {mlError && (
      <p style={{ color: "red" }}>
        {mlError}
      </p>
    )}
  </div>
  const filteredDetections = detections.filter((item) => {
    const matchesSearch =
      item.id.toLowerCase().includes(search.toLowerCase()) ||
      item.location.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" || item.status === filter;

    return matchesSearch && matchesFilter;
  });

  // EXPORT CSV
  const exportData = () => {
    const headers = [
      "Spill ID",
      "Location",
      "Date",
      "Time",
      "Area",
      "Confidence",
      "Status",
      "Type",
      "Estimated Age",
    ];

    const rows = detections.map((item) => [
      item.id,
      item.location,
      "—",
      "—",
      item.area,
      `${item.confidence}%`,
      item.status,
      "—",
      "—",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "SagarDrishti_Spill_Detections.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

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
                Satellite Intelligence
              </p>

              <h2 className="mt-1 text-lg font-semibold">
                Spill Detection
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
              onClick={exportData}
              className="flex items-center gap-2 rounded-lg bg-[#087cae] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#0a91c9]"
            >
              <Download size={14} />
              Export Data
            </button>
          </div>
        </header>

        <main className="p-6">

          {/* SAR UPLOAD */}
          <div className="mb-5 rounded-xl border border-[#1a3e55] bg-[#082238] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] uppercase tracking-[0.16em] text-[#63899e]">
                  AI Analysis
                </p>

                <h3 className="mt-1 text-base font-semibold">
                  Upload SAR Image
                </h3>
              </div>

              <button
                onClick={detectSpill}
                disabled={detecting || !sarFile}
                className="rounded-lg bg-[#087cae] px-4 py-2.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {detecting ? "Detecting..." : "Detect Spill"}
              </button>
            </div>

            <div className="mt-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  setSarFile(e.target.files[0]);
                  setMlError("");
                  setMlResult(null);
                }}
                className="w-full rounded-lg border border-[#24485d] bg-[#0a2940] p-3 text-xs text-[#a5bdc9]"
              />
            </div>

            {mlError && (
              <p className="mt-3 text-xs text-[#ff6474]">
                {mlError}
              </p>
            )}
            {mlResult && (
              <div className="mt-4 rounded-xl border border-[#24485d] bg-[#071f32] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.16em] text-[#63899e]">
                      AI Detection Result
                    </p>

                    <h3 className="mt-1 text-sm font-semibold">
                      SAR Analysis Complete
                    </h3>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-[9px] font-semibold ${mlResult.spill_detected
                        ? "bg-red-500/15 text-[#ff6474]"
                        : "bg-[#35d69f]/10 text-[#5ee5b0]"
                      }`}
                  >
                    {mlResult.spill_detected ? "SPILL DETECTED" : "NO SPILL"}
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3">

                  {/* CONFIDENCE */}
                  <div className="rounded-lg bg-[#0a2940] p-3">
                    <p className="text-[9px] text-[#63899e]">
                      Confidence
                    </p>

                    <p className="mt-1 text-lg font-semibold">
                      {mlResult.confidence != null
                        ? `${(mlResult.confidence * 100).toFixed(1)}%`
                        : "—"}
                    </p>
                  </div>

                  {/* SPILL PIXEL FRACTION */}
                  <div className="rounded-lg bg-[#0a2940] p-3">
                    <p className="text-[9px] text-[#63899e]">
                      Spill Coverage
                    </p>

                    <p className="mt-1 text-lg font-semibold">
                      {mlResult.spill_pixel_fraction != null
                        ? `${(mlResult.spill_pixel_fraction * 100).toFixed(2)}%`
                        : "—"}
                    </p>
                  </div>

                  {/* AREA */}
                  <div className="rounded-lg bg-[#0a2940] p-3">
                    <p className="text-[9px] text-[#63899e]">
                      Estimated Area
                    </p>

                    <p className="mt-1 text-lg font-semibold">
                      {mlResult.estimated_area_km2 != null
                        ? `${mlResult.estimated_area_km2} km²`
                        : "N/A"}
                    </p>
                  </div>

                </div>
              </div>
            )}
          </div>


          {/* STATS */}
          <div className="grid grid-cols-4 gap-4">

            <div className="rounded-xl border border-[#1a3e55] bg-[#082238] p-5">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0a3047]">
                  <Droplets size={19} className="text-[#ff6474]" />
                </div>

                <span className="text-[9px] font-semibold text-[#35d69f]">
                  +12.4%
                </span>
              </div>

              <p className="mt-4 text-[9px] uppercase tracking-wider text-[#63899e]">
                Total Detections
              </p>

              <p className="mt-1 text-2xl font-bold">
                126
              </p>
            </div>

            <div className="rounded-xl border border-[#1a3e55] bg-[#082238] p-5">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0a3047]">
                  <Satellite size={19} className="text-[#20bce9]" />
                </div>

                <span className="text-[9px] font-semibold text-[#35d69f]">
                  94%
                </span>
              </div>

              <p className="mt-4 text-[9px] uppercase tracking-wider text-[#63899e]">
                Avg Confidence
              </p>

              <p className="mt-1 text-2xl font-bold">
                88.7%
              </p>
            </div>

            <div className="rounded-xl border border-[#1a3e55] bg-[#082238] p-5">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0a3047]">
                  <Activity size={19} className="text-[#a875ff]" />
                </div>

                <span className="text-[9px] font-semibold text-[#f6c55f]">
                  Monitoring
                </span>
              </div>

              <p className="mt-4 text-[9px] uppercase tracking-wider text-[#63899e]">
                Active Incidents
              </p>

              <p className="mt-1 text-2xl font-bold">
                14
              </p>
            </div>

            <div className="rounded-xl border border-[#1a3e55] bg-[#082238] p-5">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0a3047]">
                  <Waves size={19} className="text-[#35d69f]" />
                </div>

                <span className="text-[9px] font-semibold text-[#35d69f]">
                  Updated
                </span>
              </div>

              <p className="mt-4 text-[9px] uppercase tracking-wider text-[#63899e]">
                Area Monitored
              </p>

              <p className="mt-1 text-2xl font-bold">
                2.8M km²
              </p>
            </div>

          </div>

          {/* DETECTION ANALYSIS */}
          <div className="mt-5 grid grid-cols-[1.25fr_1fr] gap-5">

            {/* SATELLITE IMAGE */}
            <div className="rounded-xl border border-[#1a3e55] bg-[#082238] p-5">

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.16em] text-[#63899e]">
                    Latest Detection
                  </p>

                  <h3 className="mt-1 text-base font-semibold">
                    Sentinel-1 SAR Analysis
                  </h3>
                </div>

                <span className="rounded-full bg-[#35d69f]/10 px-3 py-1 text-[9px] font-semibold text-[#35d69f]">
                  94% CONFIDENCE
                </span>
              </div>

              <div className="mt-5 h-[330px] overflow-hidden rounded-lg border border-[#24485d] bg-[#071a29]">

                <div className="relative flex h-full items-center justify-center overflow-hidden">

                  <div className="absolute inset-0 bg-gradient-to-br from-[#173a49] via-[#071923] to-[#0f2b3b]" />

                  <div className="absolute inset-0 opacity-30">
                    <div className="h-full w-full bg-[radial-gradient(circle_at_center,#8aa1a8_1px,transparent_1px)] [background-size:13px_13px]" />
                  </div>

                  <div className="absolute left-[10%] top-[18%] h-32 w-52 rotate-12 rounded-full bg-[#244c59] opacity-30 blur-2xl" />

                  <div className="absolute right-[5%] top-[40%] h-44 w-64 -rotate-12 rounded-full bg-[#1b4654] opacity-30 blur-2xl" />

                  <div className="absolute left-[35%] top-[31%] h-32 w-48 rotate-[-18deg] rounded-[50%] bg-[#293f45] opacity-90 blur-md" />

                  <div className="absolute left-[34%] top-[31%] h-32 w-48 rotate-[-18deg] rounded-[50%] border-2 border-[#ff5265] bg-red-500/10" />

                  <div className="absolute left-[39%] top-[38%] h-16 w-32 rotate-[-18deg] rounded-[50%] border border-[#ff8a8a]" />

                  <div className="absolute left-4 top-4 rounded-lg border border-[#3a5664] bg-black/60 px-3 py-2 backdrop-blur">
                    <p className="text-[9px] text-[#a5bac5]">
                      SENTINEL-1
                    </p>

                    <p className="mt-0.5 text-[9px] text-[#6f91a4]">
                      VV Polarization · 10 m
                    </p>
                  </div>

                  <div className="absolute bottom-4 right-4 rounded-lg border border-[#3a5664] bg-black/60 px-3 py-2 backdrop-blur">
                    <p className="text-[9px] text-[#ff7b88]">
                      OIL-LIKE SIGNATURE
                    </p>

                    <p className="mt-0.5 text-[9px] text-[#a4b6c0]">
                      42.6 km² detected
                    </p>
                  </div>

                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">

                <div>
                  <p className="text-[9px] text-[#63899e]">
                    Incident
                  </p>

                  <p className="mt-1 text-xs font-semibold">
                    SP-026 · Bay of Bengal
                  </p>
                </div>

                <button
                  onClick={() => navigate("/incidents")}
                  className="flex items-center gap-1 text-[10px] font-semibold text-[#20bce9] hover:text-white"
                >
                  Open Incident
                  <ChevronRight size={13} />
                </button>

              </div>
            </div>

            {/* ANALYSIS PANEL */}
            <div className="rounded-xl border border-[#1a3e55] bg-[#082238] p-5">

              <div className="flex items-center gap-2">
                <Activity size={16} className="text-[#20bce9]" />

                <h3 className="text-sm font-semibold">
                  Detection Analysis
                </h3>
              </div>

              <div className="mt-6 space-y-5">

                {[
                  ["Oil-like Signature", 94, "#ff5265"],
                  ["Segmentation Confidence", 91, "#20bce9"],
                  ["Classification", 89, "#35d69f"],
                  ["Geometry Extraction", 96, "#a875ff"],
                ].map(([label, value, color]) => (
                  <div key={label}>

                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[10px] text-[#7999aa]">
                        {label}
                      </span>

                      <span className="text-xs font-semibold">
                        {value}%
                      </span>
                    </div>

                    <div className="h-2 rounded-full bg-[#16384e]">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${value}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>

                  </div>
                ))}

              </div>

              <div className="mt-7 rounded-lg border border-[#173d55] bg-[#0a2940] p-4">

                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#35d69f]" />

                  <p className="text-xs font-semibold">
                    Detection Verified
                  </p>
                </div>

                <p className="mt-2 text-[10px] leading-relaxed text-[#718fa0]">
                  The detected signature is consistent with
                  an oil-like surface anomaly. Geometry and
                  confidence thresholds have been satisfied.
                </p>

              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">

                <div className="rounded-lg bg-[#0a2940] p-3">
                  <p className="text-[9px] text-[#63899e]">
                    Estimated Age
                  </p>

                  <p className="mt-1 text-sm font-semibold">
                    4–7 hrs
                  </p>
                </div>

                <div className="rounded-lg bg-[#0a2940] p-3">
                  <p className="text-[9px] text-[#63899e]">
                    Area
                  </p>

                  <p className="mt-1 text-sm font-semibold">
                    42.6 km²
                  </p>
                </div>

              </div>

            </div>
          </div>

          {/* HISTORY */}
          <div className="mt-5 rounded-xl border border-[#1a3e55] bg-[#082238]">

            <div className="flex items-center justify-between border-b border-[#173d55] p-5">

              <div>
                <p className="text-[9px] uppercase tracking-[0.16em] text-[#63899e]">
                  Detection History
                </p>

                <h3 className="mt-1 text-base font-semibold">
                  Recent Satellite Detections
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
                    placeholder="Search..."
                    className="h-8 w-44 rounded-lg border border-[#24485d] bg-[#0a2940] pl-8 pr-3 text-[10px] text-white outline-none placeholder:text-[#63899e] focus:border-[#168fc0]"
                  />
                </div>

                <div className="flex items-center gap-1 rounded-lg border border-[#24485d] bg-[#0a2940] p-1">

                  <Filter
                    size={13}
                    className="ml-1 text-[#63899e]"
                  />

                  {["All", "Active", "Investigated", "Closed"].map(
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

              <table className="w-full">

                <thead>
                  <tr className="bg-[#0a2940] text-left">

                    <th className="px-5 py-3 text-[9px] uppercase tracking-wider text-[#63899e]">
                      Incident
                    </th>

                    <th className="px-5 py-3 text-[9px] uppercase tracking-wider text-[#63899e]">
                      Location
                    </th>

                    <th className="px-5 py-3 text-[9px] uppercase tracking-wider text-[#63899e]">
                      Detected
                    </th>

                    <th className="px-5 py-3 text-[9px] uppercase tracking-wider text-[#63899e]">
                      Area
                    </th>

                    <th className="px-5 py-3 text-[9px] uppercase tracking-wider text-[#63899e]">
                      Confidence
                    </th>

                    <th className="px-5 py-3 text-[9px] uppercase tracking-wider text-[#63899e]">
                      Status
                    </th>

                    <th className="px-5 py-3" />

                  </tr>
                </thead>

                <tbody>

                  {filteredDetections.map((item) => (

                    <tr
                      key={item.id}
                      className="border-t border-[#173d55] transition hover:bg-[#0a2940]"
                    >

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0b3047]">
                            <Droplets
                              size={14}
                              className="text-[#ff6474]"
                            />
                          </div>

                          <div>

                            <p className="text-xs font-semibold">
                              {item.id}
                            </p>

                            <p className="mt-1 text-[9px] text-[#63899e]">
                              —
                            </p>

                          </div>

                        </div>

                      </td>

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2">

                          <MapPin
                            size={13}
                            className="text-[#63899e]"
                          />

                          <span className="text-xs text-[#a1b6c1]">
                            {item.location}
                          </span>

                        </div>

                      </td>

                      <td className="px-5 py-4">

                        <p className="text-xs text-[#a1b6c1]">
                          —
                        </p>

                        <p className="mt-1 text-[9px] text-[#63899e]">
                          —
                        </p>

                      </td>

                      <td className="px-5 py-4">
                        <span className="text-xs font-semibold">
                          {item.area}
                        </span>
                      </td>

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2">

                          <div className="h-1.5 w-14 rounded-full bg-[#17384d]">

                            <div
                              className="h-full rounded-full bg-[#20bce9]"
                              style={{
                                width: `${item.confidence}%`,
                              }}
                            />

                          </div>

                          <span className="text-xs font-semibold">
                            {item.confidence}%
                          </span>

                        </div>

                      </td>

                      <td className="px-5 py-4">

                        <span
                          className={`rounded-full px-2.5 py-1 text-[9px] font-semibold ${item.status === "Active"
                            ? "bg-red-500/15 text-[#ff6474]"
                            : item.status === "Investigated"
                              ? "bg-yellow-500/15 text-[#f6c55f]"
                              : "bg-[#35d69f]/10 text-[#5ee5b0]"
                            }`}
                        >
                          {item.status}
                        </span>

                      </td>

                      <td className="px-5 py-4">

                        <button
                          onClick={() => {
                            setSelectedDetection(item);
                            navigate(`/incidents?id=${item.id}`);
                          }}
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

              {filteredDetections.length === 0 && (
                <div className="py-12 text-center">

                  <AlertTriangle
                    size={20}
                    className="mx-auto text-[#63899e]"
                  />

                  <p className="mt-2 text-xs text-[#718fa0]">
                    No detections found
                  </p>

                </div>
              )}

            </div>
          </div>

          {/* BOTTOM INFO */}
          <div className="mt-5 flex items-center justify-between rounded-xl border border-[#1a3e55] bg-[#082238] px-5 py-4">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0a3047]">
                <Clock
                  size={16}
                  className="text-[#20bce9]"
                />
              </div>

              <div>

                <p className="text-xs font-semibold">
                  Automated Monitoring Active
                </p>

                <p className="mt-0.5 text-[9px] text-[#63899e]">
                  Sentinel-1 imagery is being monitored for new
                  oil-like surface anomalies.
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

        </main>
      </div>
    </div>
  );
}