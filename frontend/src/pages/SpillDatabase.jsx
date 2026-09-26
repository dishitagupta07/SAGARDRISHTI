import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Search,
  Filter,
  Database,
  Droplets,
  MapPin,
  CalendarDays,
  Ship,
  AlertTriangle,
  Eye,
  Download,
  ChevronRight,
  Activity,
  CheckCircle2,
  Clock,
  Waves,
} from "lucide-react";

import Sidebar from "../components/Sidebar";

export default function SpillDatabase() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
`${import.meta.env.VITE_BACKEND_URL}/api/incidents/`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch incidents");
        }

        const data = await response.json();

        const formattedIncidents = data.map((incident) => ({
          id: incident._id,
          date: "—",
          location: `${incident.latitude}° N · ${incident.longitude}° E`,
          area: `${incident.area_km2} km²`,
          cause: "—",
          vessels: "—",
          risk: incident.severity?.toUpperCase() || "—",
          status: incident.status?.toUpperCase() || "—",
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

  const filteredIncidents = incidents.filter((incident) => {
    const query = search.toLowerCase();

    const matchesSearch =
      incident.id.toLowerCase().includes(query) ||
      incident.location.toLowerCase().includes(query) ||
      incident.cause.toLowerCase().includes(query);

    const matchesFilter =
      filter === "All" || incident.status === filter;

    return matchesSearch && matchesFilter;
  });

  const exportDatabase = () => {
    const headers = [
      "Incident ID",
      "Date",
      "Location",
      "Area",
      "Cause",
      "Vessels Analyzed",
      "Risk",
      "Status",
    ];

    const rows = incidents.map((item) => [
      item.id,
      item.date,
      item.location,
      item.area,
      item.cause,
      item.vessels,
      item.risk,
      item.status,
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "SagarDrishti_Spill_Database.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const riskClass = (risk) => {
    if (risk === "HIGH") {
      return "bg-red-500/15 text-[#ff6474]";
    }

    if (risk === "MEDIUM") {
      return "bg-yellow-500/15 text-[#f6c55f]";
    }

    return "bg-[#35d69f]/10 text-[#5ee5b0]";
  };

  const statusClass = (status) => {
    if (status === "ACTIVE") {
      return "bg-red-500/15 text-[#ff6474]";
    }

    if (status === "INVESTIGATED") {
      return "bg-yellow-500/15 text-[#f6c55f]";
    }

    return "bg-[#35d69f]/10 text-[#5ee5b0]";
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
                Historical Intelligence
              </p>

              <h2 className="mt-1 text-lg font-semibold">
                Spill Database
              </h2>
            </div>

          </div>

          <div className="flex items-center gap-3">

            <button
              onClick={() => navigate("/spill-detection")}
              className="flex items-center gap-2 rounded-lg border border-[#24485d] bg-[#0a2940] px-4 py-2.5 text-xs font-semibold text-[#a5bdc9] transition hover:bg-[#0d344d] hover:text-white"
            >
              <Droplets size={14} />
              Spill Detection
            </button>

            <button
              onClick={exportDatabase}
              className="flex items-center gap-2 rounded-lg bg-[#087cae] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#0a91c9]"
            >
              <Download size={14} />
              Export Database
            </button>

          </div>

        </header>

        <main className="p-6">

          {/* STATS */}
          <div className="grid grid-cols-4 gap-4">

            <div className="rounded-xl border border-[#1a3e55] bg-[#082238] p-5">

              <div className="flex items-center justify-between">

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0a3047]">
                  <Database
                    size={19}
                    className="text-[#20bce9]"
                  />
                </div>

                <span className="text-[9px] font-semibold text-[#35d69f]">
                  UPDATED
                </span>

              </div>

              <p className="mt-4 text-[9px] uppercase tracking-wider text-[#63899e]">
                Total Records
              </p>

              <p className="mt-1 text-2xl font-bold">
  {incidents.length}
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
                  ACTIVE
                </span>

              </div>

              <p className="mt-4 text-[9px] uppercase tracking-wider text-[#63899e]">
                Active Incidents
              </p>

              <p className="mt-1 text-2xl font-bold">
  {incidents.filter((incident) => incident.status === "ACTIVE").length}
</p>

            </div>

            <div className="rounded-xl border border-[#1a3e55] bg-[#082238] p-5">

              <div className="flex items-center justify-between">

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0a3047]">
                  <Ship
                    size={19}
                    className="text-[#ff6474]"
                  />
                </div>

                <span className="text-[9px] font-semibold text-[#ff6474]">
                  CORRELATED
                </span>

              </div>

              <p className="mt-4 text-[9px] uppercase tracking-wider text-[#63899e]">
                Vessel-Linked Spills
              </p>

              <p className="mt-1 text-2xl font-bold">
                82
              </p>

            </div>

            <div className="rounded-xl border border-[#1a3e55] bg-[#082238] p-5">

              <div className="flex items-center justify-between">

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0a3047]">
                  <Waves
                    size={19}
                    className="text-[#35d69f]"
                  />
                </div>

                <span className="text-[9px] font-semibold text-[#35d69f]">
                  2025
                </span>

              </div>

              <p className="mt-4 text-[9px] uppercase tracking-wider text-[#63899e]">
                Regions Covered
              </p>

              <p className="mt-1 text-2xl font-bold">
                3
              </p>

            </div>

          </div>

          {/* DATABASE OVERVIEW */}
          <div className="mt-5 grid grid-cols-[1fr_1.2fr] gap-5">

            {/* LEFT */}
            <div className="rounded-xl border border-[#1a3e55] bg-[#082238] p-5">

              <div className="flex items-center gap-2">
                <Database
                  size={16}
                  className="text-[#20bce9]"
                />

                <h3 className="text-sm font-semibold">
                  Historical Spill Intelligence
                </h3>
              </div>

              <p className="mt-3 text-[10px] leading-relaxed text-[#718fa0]">
                SagarDrishti maintains a historical record of
                detected marine surface anomalies, their
                characteristics, vessel correlations and
                investigation outcomes.
              </p>

              <div className="mt-5 space-y-3">

                <div className="flex items-center justify-between rounded-lg bg-[#0a2940] p-3">

                  <div className="flex items-center gap-3">
                    <Droplets
                      size={15}
                      className="text-[#ff6474]"
                    />

                    <span className="text-[10px] text-[#9ab1bd]">
                      Oil Spill Events
                    </span>
                  </div>

                  <span className="text-xs font-bold">
                    97
                  </span>

                </div>

                <div className="flex items-center justify-between rounded-lg bg-[#0a2940] p-3">

                  <div className="flex items-center gap-3">
                    <Ship
                      size={15}
                      className="text-[#20bce9]"
                    />

                    <span className="text-[10px] text-[#9ab1bd]">
                      Vessel Discharge
                    </span>
                  </div>

                  <span className="text-xs font-bold">
                    68
                  </span>

                </div>

                <div className="flex items-center justify-between rounded-lg bg-[#0a2940] p-3">

                  <div className="flex items-center gap-3">
                    <Waves
                      size={15}
                      className="text-[#35d69f]"
                    />

                    <span className="text-[10px] text-[#9ab1bd]">
                      Natural Seep
                    </span>
                  </div>

                  <span className="text-xs font-bold">
                    17
                  </span>

                </div>

              </div>

              <div className="mt-5 rounded-lg border border-[#173d55] bg-[#0a2940] p-4">

                <div className="flex items-center gap-2">
                  <CheckCircle2
                    size={15}
                    className="text-[#35d69f]"
                  />

                  <p className="text-[10px] font-semibold">
                    Historical Data Linked
                  </p>
                </div>

                <p className="mt-2 text-[9px] leading-relaxed text-[#718fa0]">
                  Historical spill records can be compared with
                  AIS vessel tracks to identify recurring
                  high-risk patterns.
                </p>

              </div>

            </div>

            {/* RIGHT */}
            <div className="rounded-xl border border-[#1a3e55] bg-[#082238] p-5">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-[9px] uppercase tracking-[0.16em] text-[#63899e]">
                    Regional Distribution
                  </p>

                  <h3 className="mt-1 text-base font-semibold">
                    Spill Records by Region
                  </h3>
                </div>

                <span className="rounded-full bg-[#20bce9]/10 px-3 py-1 text-[9px] font-semibold text-[#20bce9]">
  {incidents.length} RECORDS
</span>

              </div>

              <div className="mt-6 space-y-5">

                {[
                  ["Bay of Bengal", 54, "43%"],
                  ["Arabian Sea", 42, "33%"],
                  ["Indian Ocean", 30, "24%"],
                ].map(([region, count, percentage]) => (

                  <div key={region}>

                    <div className="mb-2 flex items-center justify-between">

                      <div className="flex items-center gap-2">
                        <MapPin
                          size={13}
                          className="text-[#63899e]"
                        />

                        <span className="text-[10px] text-[#9ab1bd]">
                          {region}
                        </span>
                      </div>

                      <span className="text-[10px] font-semibold">
                        {count} records
                      </span>

                    </div>

                    <div className="h-2 rounded-full bg-[#16384e]">

                      <div
                        className="h-full rounded-full bg-[#20bce9]"
                        style={{
                          width: percentage,
                        }}
                      />

                    </div>

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* TABLE */}
          <div className="mt-5 rounded-xl border border-[#1a3e55] bg-[#082238]">

            <div className="flex items-center justify-between border-b border-[#173d55] p-5">

              <div>
                <p className="text-[9px] uppercase tracking-[0.16em] text-[#63899e]">
                  Historical Records
                </p>

                <h3 className="mt-1 text-base font-semibold">
                  Spill Incident Database
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
                    placeholder="Search records..."
                    className="h-8 w-48 rounded-lg border border-[#24485d] bg-[#0a2940] pl-8 pr-3 text-[10px] text-white outline-none placeholder:text-[#63899e] focus:border-[#168fc0]"
                  />

                </div>

                <div className="flex items-center gap-1 rounded-lg border border-[#24485d] bg-[#0a2940] p-1">

                  <Filter
                    size={13}
                    className="ml-1 text-[#63899e]"
                  />

                  {["All", "ACTIVE", "INVESTIGATED", "CLOSED"].map(
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
                      Date
                    </th>

                    <th className="px-5 py-3 text-[9px] uppercase tracking-wider text-[#63899e]">
                      Location
                    </th>

                    <th className="px-5 py-3 text-[9px] uppercase tracking-wider text-[#63899e]">
                      Area
                    </th>

                    <th className="px-5 py-3 text-[9px] uppercase tracking-wider text-[#63899e]">
                      Cause
                    </th>

                    <th className="px-5 py-3 text-[9px] uppercase tracking-wider text-[#63899e]">
                      Vessels
                    </th>

                    <th className="px-5 py-3 text-[9px] uppercase tracking-wider text-[#63899e]">
                      Risk
                    </th>

                    <th className="px-5 py-3 text-[9px] uppercase tracking-wider text-[#63899e]">
                      Status
                    </th>

                    <th className="px-5 py-3" />

                  </tr>

                </thead>

                <tbody>

                  {filteredIncidents.map((incident) => (

                    <tr
                      key={incident.id}
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

                          <span className="text-xs font-semibold">
                            {incident.id}
                          </span>

                        </div>

                      </td>

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2">

                          <CalendarDays
                            size={13}
                            className="text-[#63899e]"
                          />

                          <span className="text-xs text-[#a1b6c1]">
                            {incident.date}
                          </span>

                        </div>

                      </td>

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2">

                          <MapPin
                            size={13}
                            className="text-[#63899e]"
                          />

                          <span className="text-xs text-[#a1b6c1]">
                            {incident.location}
                          </span>

                        </div>

                      </td>

                      <td className="px-5 py-4">
                        <span className="text-xs font-semibold">
                          {incident.area}
                        </span>
                      </td>

                      <td className="px-5 py-4">

                        <span className="text-[10px] text-[#a1b6c1]">
                          {incident.cause}
                        </span>

                      </td>

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2">

                          <Ship
                            size={13}
                            className="text-[#20bce9]"
                          />

                          <span className="text-xs font-semibold">
                            {incident.vessels}
                          </span>

                        </div>

                      </td>

                      <td className="px-5 py-4">

                        <span
                          className={`rounded-full px-2.5 py-1 text-[9px] font-semibold ${riskClass(
                            incident.risk
                          )}`}
                        >
                          {incident.risk}
                        </span>

                      </td>

                      <td className="px-5 py-4">

                        <span
                          className={`rounded-full px-2.5 py-1 text-[9px] font-semibold ${statusClass(
                            incident.status
                          )}`}
                        >
                          {incident.status}
                        </span>

                      </td>

                      <td className="px-5 py-4">

                        <button
                          onClick={() => navigate(`/incidents?id=${incident.id}`)}
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

              {filteredIncidents.length === 0 && (
                <div className="py-12 text-center">

                  <AlertTriangle
                    size={20}
                    className="mx-auto text-[#63899e]"
                  />

                  <p className="mt-2 text-xs text-[#718fa0]">
                    No records found
                  </p>

                </div>
              )}

            </div>

          </div>

          {/* FOOTER */}
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
                  Historical Intelligence Ready
                </p>

                <p className="mt-0.5 text-[9px] text-[#63899e]">
                  Historical spill records are available for
                  vessel and pattern correlation.
                </p>

              </div>

            </div>

            <button
              onClick={() => navigate("/vessel-intelligence")}
              className="flex items-center gap-2 rounded-lg bg-[#087cae] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#0a91c9]"
            >
              <Ship size={14} />
              Vessel Intelligence
              <ChevronRight size={13} />
            </button>

          </div>

        </main>
      </div>
    </div>
  );
}