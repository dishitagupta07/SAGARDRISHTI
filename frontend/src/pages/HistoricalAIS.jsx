import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Search,
  Ship,
  History,
  MapPin,
  CalendarDays,
  Waves,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Eye,
  Filter,
} from "lucide-react";

import Sidebar from "../components/Sidebar";

export default function HistoricalAIS() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [selectedVessel, setSelectedVessel] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");

  const vessels = [
    {
      name: "MV Ocean Star",
      imo: "IMO 9384721",
      flag: "India",
      type: "Tanker",
      totalSpills: 7,
      highConfidence: 4,
      investigated: 5,
      regions: 2,
      lastSpill: "24 Aug 2025",
    },
    {
      name: "MT Coral",
      imo: "IMO 9216384",
      flag: "Panama",
      type: "Oil Tanker",
      totalSpills: 4,
      highConfidence: 2,
      investigated: 3,
      regions: 2,
      lastSpill: "11 Jul 2025",
    },
    {
      name: "MV Sunrise",
      imo: "IMO 9472163",
      flag: "Singapore",
      type: "Cargo",
      totalSpills: 2,
      highConfidence: 1,
      investigated: 2,
      regions: 1,
      lastSpill: "28 May 2025",
    },
    {
      name: "MV Bright",
      imo: "IMO 9351842",
      flag: "Liberia",
      type: "Cargo",
      totalSpills: 1,
      highConfidence: 0,
      investigated: 1,
      regions: 1,
      lastSpill: "16 Apr 2025",
    },
    {
      name: "FV Golden",
      imo: "IMO 9084217",
      flag: "India",
      type: "Fishing Vessel",
      totalSpills: 0,
      highConfidence: 0,
      investigated: 0,
      regions: 0,
      lastSpill: "No linked records",
    },
  ];

  const spillHistory = {
    "IMO 9384721": [
      {
        id: "SP-026",
        date: "24 Aug 2025",
        region: "Bay of Bengal",
        size: "42.6 km²",
        correlation: 92,
        status: "Investigating",
        evidence: "Trajectory + timing + proximity",
      },
      {
        id: "SP-019",
        date: "17 Jul 2025",
        region: "Bay of Bengal",
        size: "18.2 km²",
        correlation: 87,
        status: "Investigated",
        evidence: "AIS trajectory overlap",
      },
      {
        id: "SP-014",
        date: "03 Jun 2025",
        region: "Arabian Sea",
        size: "11.6 km²",
        correlation: 81,
        status: "Investigated",
        evidence: "Proximity + drift corridor",
      },
      {
        id: "SP-011",
        date: "19 May 2025",
        region: "Arabian Sea",
        size: "8.4 km²",
        correlation: 79,
        status: "Investigated",
        evidence: "Trajectory correlation",
      },
      {
        id: "SP-008",
        date: "27 Apr 2025",
        region: "Bay of Bengal",
        size: "14.8 km²",
        correlation: 74,
        status: "Investigated",
        evidence: "AIS timing match",
      },
      {
        id: "SP-004",
        date: "12 Mar 2025",
        region: "Bay of Bengal",
        size: "9.7 km²",
        correlation: 68,
        status: "Closed",
        evidence: "Route proximity",
      },
      {
        id: "SP-002",
        date: "21 Feb 2025",
        region: "Arabian Sea",
        size: "6.3 km²",
        correlation: 63,
        status: "Closed",
        evidence: "Historical AIS overlap",
      },
    ],

    "IMO 9216384": [
      {
        id: "SP-025",
        date: "21 Aug 2025",
        region: "Arabian Sea",
        size: "18.4 km²",
        correlation: 78,
        status: "Investigated",
        evidence: "Trajectory + proximity",
      },
      {
        id: "SP-017",
        date: "02 Jul 2025",
        region: "Arabian Sea",
        size: "13.1 km²",
        correlation: 72,
        status: "Investigated",
        evidence: "AIS trajectory overlap",
      },
      {
        id: "SP-009",
        date: "09 May 2025",
        region: "Bay of Bengal",
        size: "7.6 km²",
        correlation: 64,
        status: "Closed",
        evidence: "Route proximity",
      },
      {
        id: "SP-003",
        date: "18 Feb 2025",
        region: "Arabian Sea",
        size: "5.2 km²",
        correlation: 58,
        status: "Closed",
        evidence: "Historical AIS overlap",
      },
    ],

    "IMO 9472163": [
      {
        id: "SP-016",
        date: "28 May 2025",
        region: "Bay of Bengal",
        size: "10.3 km²",
        correlation: 71,
        status: "Investigated",
        evidence: "Trajectory proximity",
      },
      {
        id: "SP-006",
        date: "14 Mar 2025",
        region: "Bay of Bengal",
        size: "6.8 km²",
        correlation: 59,
        status: "Closed",
        evidence: "AIS timing match",
      },
    ],

    "IMO 9351842": [
      {
        id: "SP-005",
        date: "16 Apr 2025",
        region: "Indian Ocean",
        size: "4.7 km²",
        correlation: 52,
        status: "Closed",
        evidence: "Route proximity",
      },
    ],

    "IMO 9084217": [],
  };

  const filteredVessels = vessels.filter((vessel) => {
    const query = search.toLowerCase();

    return (
      vessel.name.toLowerCase().includes(query) ||
      vessel.imo.toLowerCase().includes(query) ||
      vessel.flag.toLowerCase().includes(query) ||
      vessel.type.toLowerCase().includes(query)
    );
  });

  const records = selectedVessel
    ? spillHistory[selectedVessel.imo] || []
    : [];

  const filteredRecords =
    statusFilter === "All"
      ? records
      : records.filter((record) => record.status === statusFilter);

  const getCorrelationClass = (score) => {
    if (score >= 80) return "text-[#ff6474]";
    if (score >= 65) return "text-[#f6c55f]";
    return "text-[#35d69f]";
  };

  const getStatusClass = (status) => {
    if (status === "Investigating") {
      return "bg-red-500/15 text-[#ff6474]";
    }

    if (status === "Investigated") {
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
              onClick={() => navigate("/vessel-intelligence")}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#24485d] bg-[#0a2940] text-[#89a7b7] transition hover:bg-[#0d344d] hover:text-white"
            >
              <ArrowLeft size={17} />
            </button>

            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#62889e]">
                AIS Intelligence
              </p>

              <h2 className="mt-1 text-lg font-semibold">
                Historical AIS & Spill Intelligence
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
              onClick={() => navigate("/incidents")}
              className="flex items-center gap-2 rounded-lg bg-[#087cae] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#0a91c9]"
            >
              <AlertTriangle size={14} />
              Open Incident
            </button>
          </div>
        </header>

        <main className="p-6">

          {/* INTRO */}
          <div className="rounded-xl border border-[#1a3e55] bg-[#082238] p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0a3047]">
                <History
                  size={22}
                  className="text-[#a875ff]"
                />
              </div>

              <div>
                <p className="text-[9px] uppercase tracking-[0.18em] text-[#63899e]">
                  Historical Vessel Intelligence
                </p>

                <h3 className="mt-1 text-base font-semibold">
                  Trace a vessel's historical association with oil-spill incidents
                </h3>

                <p className="mt-2 max-w-3xl text-[10px] leading-relaxed text-[#7898a8]">
                  Select a vessel to review previous spill incidents where
                  its AIS trajectory showed spatial and temporal correlation
                  with detected spill locations.
                </p>
              </div>
            </div>
          </div>

          {/* VESSEL SELECTOR */}
          <div className="mt-5 rounded-xl border border-[#1a3e55] bg-[#082238] p-5">

            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] uppercase tracking-[0.16em] text-[#63899e]">
                  Step 01
                </p>

                <h3 className="mt-1 text-base font-semibold">
                  Select Vessel
                </h3>
              </div>

              <span className="rounded-full bg-[#20bce9]/10 px-3 py-1 text-[9px] font-semibold text-[#20bce9]">
                {filteredVessels.length} VESSELS
              </span>
            </div>

            {/* SEARCH */}
            <div className="relative mt-5">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#63899e]"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by vessel name, IMO, flag or vessel type..."
                className="h-10 w-full rounded-lg border border-[#24485d] bg-[#0a2940] pl-9 pr-4 text-xs text-white outline-none placeholder:text-[#63899e] focus:border-[#168fc0]"
              />
            </div>

            {/* VESSEL CARDS */}
            <div className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-3">

              {filteredVessels.map((vessel) => {
                const selected =
                  selectedVessel?.imo === vessel.imo;

                return (
                  <button
                    key={vessel.imo}
                    onClick={() => {
                      setSelectedVessel(vessel);
                      setStatusFilter("All");
                    }}
                    className={`text-left rounded-xl border p-4 transition ${
                      selected
                        ? "border-[#168fc0] bg-[#0b344b]"
                        : "border-[#24485d] bg-[#0a2940] hover:border-[#35657b] hover:bg-[#0d3047]"
                    }`}
                  >
                    <div className="flex items-start justify-between">

                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                            selected
                              ? "bg-[#087cae]"
                              : "bg-[#12384d]"
                          }`}
                        >
                          <Ship size={18} className="text-white" />
                        </div>

                        <div>
                          <p className="text-xs font-semibold">
                            {vessel.name}
                          </p>

                          <p className="mt-1 text-[9px] text-[#63899e]">
                            {vessel.imo}
                          </p>
                        </div>
                      </div>

                      {selected && (
                        <CheckCircle2
                          size={16}
                          className="text-[#35d69f]"
                        />
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-[9px] text-[#7898a8]">
                        {vessel.flag} · {vessel.type}
                      </span>

                      <span
                        className={`text-[10px] font-bold ${
                          vessel.totalSpills > 0
                            ? "text-[#ff6474]"
                            : "text-[#35d69f]"
                        }`}
                      >
                        {vessel.totalSpills} spills
                      </span>
                    </div>
                  </button>
                );
              })}

            </div>

            {filteredVessels.length === 0 && (
              <div className="py-10 text-center">
                <Ship
                  size={22}
                  className="mx-auto text-[#63899e]"
                />

                <p className="mt-2 text-xs text-[#718fa0]">
                  No vessels found
                </p>
              </div>
            )}
          </div>

          {/* EMPTY STATE */}
          {!selectedVessel && (
            <div className="mt-5 rounded-xl border border-dashed border-[#24485d] bg-[#071f32] py-16 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0a3047]">
                <History
                  size={25}
                  className="text-[#a875ff]"
                />
              </div>

              <h3 className="mt-4 text-sm font-semibold">
                Select a vessel to view historical records
              </h3>

              <p className="mx-auto mt-2 max-w-md text-[10px] leading-relaxed text-[#63899e]">
                Historical spill associations, AIS correlation scores,
                incident dates and affected regions will appear here.
              </p>
            </div>
          )}

          {/* SELECTED VESSEL */}
          {selectedVessel && (
            <>
              {/* VESSEL HEADER */}
              <div className="mt-5 rounded-xl border border-[#1a3e55] bg-[#082238] p-5">

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-4">

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#12384d]">
                      <Ship
                        size={23}
                        className="text-[#20bce9]"
                      />
                    </div>

                    <div>
                      <p className="text-[9px] uppercase tracking-[0.16em] text-[#63899e]">
                        Selected Vessel
                      </p>

                      <h3 className="mt-1 text-lg font-bold">
                        {selectedVessel.name}
                      </h3>

                      <p className="mt-1 text-[9px] text-[#63899e]">
                        {selectedVessel.imo} · {selectedVessel.flag} ·{" "}
                        {selectedVessel.type}
                      </p>
                    </div>

                  </div>

                  <button
                    onClick={() =>
                      navigate("/vessel-intelligence")
                    }
                    className="flex items-center gap-1.5 text-[10px] font-semibold text-[#20bce9] hover:text-white"
                  >
                    Current Vessel Intelligence
                    <ChevronRight size={13} />
                  </button>

                </div>

                {/* SUMMARY */}
                <div className="mt-5 grid grid-cols-5 gap-3">

                  <div className="rounded-lg bg-[#0a2940] p-3">
                    <p className="text-[8px] uppercase text-[#63899e]">
                      Total Associated Spills
                    </p>

                    <p className="mt-1 text-xl font-bold text-[#ff6474]">
                      {selectedVessel.totalSpills}
                    </p>
                  </div>

                  <div className="rounded-lg bg-[#0a2940] p-3">
                    <p className="text-[8px] uppercase text-[#63899e]">
                      High Confidence
                    </p>

                    <p className="mt-1 text-xl font-bold text-[#f6c55f]">
                      {selectedVessel.highConfidence}
                    </p>
                  </div>

                  <div className="rounded-lg bg-[#0a2940] p-3">
                    <p className="text-[8px] uppercase text-[#63899e]">
                      Investigated
                    </p>

                    <p className="mt-1 text-xl font-bold">
                      {selectedVessel.investigated}
                    </p>
                  </div>

                  <div className="rounded-lg bg-[#0a2940] p-3">
                    <p className="text-[8px] uppercase text-[#63899e]">
                      Regions
                    </p>

                    <p className="mt-1 text-xl font-bold">
                      {selectedVessel.regions}
                    </p>
                  </div>

                  <div className="rounded-lg bg-[#0a2940] p-3">
                    <p className="text-[8px] uppercase text-[#63899e]">
                      Last Association
                    </p>

                    <p className="mt-2 text-xs font-semibold">
                      {selectedVessel.lastSpill}
                    </p>
                  </div>

                </div>
              </div>

              {/* RECORDS */}
              <div className="mt-5 rounded-xl border border-[#1a3e55] bg-[#082238]">

                <div className="flex items-center justify-between border-b border-[#173d55] p-5">

                  <div>
                    <p className="text-[9px] uppercase tracking-[0.16em] text-[#63899e]">
                      Step 02
                    </p>

                    <h3 className="mt-1 text-base font-semibold">
                      Historical Spill Records
                    </h3>

                    <p className="mt-1 text-[9px] text-[#63899e]">
                      {records.length} historical association
                      {records.length !== 1 ? "s" : ""} found
                    </p>
                  </div>

                  <div className="flex items-center gap-1 rounded-lg border border-[#24485d] bg-[#0a2940] p-1">

                    <Filter
                      size={13}
                      className="ml-1 text-[#63899e]"
                    />

                    {["All", "Investigating", "Investigated", "Closed"].map(
                      (item) => (
                        <button
                          key={item}
                          onClick={() => setStatusFilter(item)}
                          className={`rounded px-2 py-1.5 text-[9px] transition ${
                            statusFilter === item
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

                {filteredRecords.length > 0 ? (
                  <div className="overflow-x-auto">

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
                            Region
                          </th>

                          <th className="px-5 py-3 text-[9px] uppercase tracking-wider text-[#63899e]">
                            Spill Size
                          </th>

                          <th className="px-5 py-3 text-[9px] uppercase tracking-wider text-[#63899e]">
                            Correlation
                          </th>

                          <th className="px-5 py-3 text-[9px] uppercase tracking-wider text-[#63899e]">
                            Evidence
                          </th>

                          <th className="px-5 py-3 text-[9px] uppercase tracking-wider text-[#63899e]">
                            Status
                          </th>

                          <th className="px-5 py-3" />

                        </tr>
                      </thead>

                      <tbody>

                        {filteredRecords.map((record) => (
                          <tr
                            key={record.id}
                            className="border-t border-[#173d55] transition hover:bg-[#0a2940]"
                          >

                            <td className="px-5 py-4">

                              <p className="text-xs font-bold text-[#20bce9]">
                                {record.id}
                              </p>

                              <p className="mt-1 text-[8px] text-[#63899e]">
                                Spill incident
                              </p>

                            </td>

                            <td className="px-5 py-4">

                              <div className="flex items-center gap-2">
                                <CalendarDays
                                  size={12}
                                  className="text-[#63899e]"
                                />

                                <span className="text-[10px] text-[#a1b6c1]">
                                  {record.date}
                                </span>
                              </div>

                            </td>

                            <td className="px-5 py-4">

                              <div className="flex items-center gap-2">
                                <MapPin
                                  size={12}
                                  className="text-[#63899e]"
                                />

                                <span className="text-[10px] text-[#a1b6c1]">
                                  {record.region}
                                </span>
                              </div>

                            </td>

                            <td className="px-5 py-4">

                              <span className="text-xs font-semibold">
                                {record.size}
                              </span>

                            </td>

                            <td className="px-5 py-4">

                              <div className="flex items-center gap-2">

                                <div className="h-1.5 w-14 rounded-full bg-[#17384d]">
                                  <div
                                    className={`h-full rounded-full ${
                                      record.correlation >= 80
                                        ? "bg-[#ff5265]"
                                        : record.correlation >= 65
                                        ? "bg-[#f6b52d]"
                                        : "bg-[#35d69f]"
                                    }`}
                                    style={{
                                      width: `${record.correlation}%`,
                                    }}
                                  />
                                </div>

                                <span
                                  className={`text-xs font-bold ${getCorrelationClass(
                                    record.correlation
                                  )}`}
                                >
                                  {record.correlation}%
                                </span>

                              </div>

                            </td>

                            <td className="px-5 py-4">

                              <span className="text-[9px] text-[#a1b6c1]">
                                {record.evidence}
                              </span>

                            </td>

                            <td className="px-5 py-4">

                              <span
                                className={`rounded-full px-2.5 py-1 text-[8px] font-semibold ${getStatusClass(
                                  record.status
                                )}`}
                              >
                                {record.status}
                              </span>

                            </td>

                            <td className="px-5 py-4">

                              <button
                                onClick={() =>
                                  navigate(
                                    `/incidents?id=${record.id}`
                                  )
                                }
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

                  </div>
                ) : (
                  <div className="py-14 text-center">

                    <CheckCircle2
                      size={24}
                      className="mx-auto text-[#35d69f]"
                    />

                    <p className="mt-3 text-xs font-semibold">
                      No records found
                    </p>

                    <p className="mt-1 text-[9px] text-[#63899e]">
                      No historical spill associations match this filter.
                    </p>

                  </div>
                )}

              </div>

              {/* CORRELATION NOTE */}
              <div className="mt-5 rounded-xl border border-[#24485d] bg-[#071f32] p-4">

                <div className="flex items-start gap-3">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0a3047]">
                    <Waves
                      size={16}
                      className="text-[#20bce9]"
                    />
                  </div>

                  <div>
                    <p className="text-xs font-semibold">
                      How historical association is determined
                    </p>

                    <p className="mt-1 text-[9px] leading-relaxed text-[#63899e]">
                      Historical records are identified by correlating
                      vessel AIS position and timing with detected spill
                      origin, estimated drift corridor and surrounding
                      vessel activity. A higher correlation score indicates
                      stronger spatial and temporal agreement — it does not
                      by itself establish responsibility.
                    </p>
                  </div>

                </div>

              </div>
            </>
          )}

        </main>
      </div>
    </div>
  );
}