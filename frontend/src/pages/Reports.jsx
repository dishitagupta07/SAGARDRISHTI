import { useMemo, useState } from "react";
import {
  FileText,
  Search,
  Download,
  ArrowLeft,
  Eye,
  Ship,
  Waves,
  CalendarDays,
  FileBarChart2,
  ShieldCheck,
  Clock3,
  Plus,
  X,
  CheckCircle2,
  MapPin,
  Wind,
  Navigation,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const incidentData = {
  "SP-026": {
    location: "Bay of Bengal",
    status: "Active Oil Spill",
    risk: "HIGH RISK",
    area: "42.6 km²",
    confidence: "94%",
    vessels: 7,
  },
  "SP-025": {
    location: "Arabian Sea",
    status: "Investigated Oil Spill",
    risk: "MEDIUM RISK",
    area: "18.4 km²",
    confidence: "89%",
    vessels: 5,
  },
  "SP-024": {
    location: "Bay of Bengal",
    status: "Investigated Oil Spill",
    risk: "HIGH RISK",
    area: "31.8 km²",
    confidence: "91%",
    vessels: 9,
  },
  "SP-023": {
    location: "Indian Ocean",
    status: "Unknown",
    risk: "LOW RISK",
    area: "12.7 km²",
    confidence: "82%",
    vessels: 4,
  },
  "SP-022": {
    location: "Arabian Sea",
    status: "Natural Seep",
    risk: "LOW RISK",
    area: "8.9 km²",
    confidence: "76%",
    vessels: 2,
  },
  "SP-021": {
    location: "Bay of Bengal",
    status: "Investigated Oil Spill",
    risk: "MEDIUM RISK",
    area: "25.3 km²",
    confidence: "88%",
    vessels: 6,
  },
};

const reports = [
  {
    id: "RPT-026",
    title: "Oil Spill Incident Report",
    type: "Incident Report",
    related: "SP-026",
    date: "24 Aug 2025",
    time: "14:32 UTC",
    status: "Generated",
    confidence: "94%",
  },
  {
    id: "RPT-025",
    title: "Vessel Responsibility Analysis",
    type: "Vessel Report",
    related: "SP-025",
    date: "21 Aug 2025",
    time: "11:18 UTC",
    status: "Generated",
    confidence: "89%",
  },
  {
    id: "RPT-024",
    title: "Oil Spill Detection Summary",
    type: "Detection Report",
    related: "SP-024",
    date: "18 Aug 2025",
    time: "09:42 UTC",
    status: "Generated",
    confidence: "91%",
  },
  {
    id: "RPT-023",
    title: "Maritime Incident Investigation",
    type: "Incident Report",
    related: "SP-023",
    date: "14 Aug 2025",
    time: "16:05 UTC",
    status: "Generated",
    confidence: "82%",
  },
  {
    id: "RPT-022",
    title: "Historical Vessel Correlation",
    type: "Vessel Report",
    related: "SP-022",
    date: "09 Aug 2025",
    time: "12:24 UTC",
    status: "Generated",
    confidence: "76%",
  },
  {
    id: "RPT-021",
    title: "Regional Spill Intelligence Report",
    type: "Regional Report",
    related: "SP-021",
    date: "03 Aug 2025",
    time: "10:16 UTC",
    status: "Generated",
    confidence: "88%",
  },
];

const reportTypes = [
  {
    title: "Incident Report",
    description: "Complete analysis of a detected oil spill incident.",
    icon: FileText,
    count: 48,
    color: "#ff5265",
  },
  {
    title: "Vessel Report",
    description: "AIS correlation and vessel responsibility analysis.",
    icon: Ship,
    count: 37,
    color: "#20bce9",
  },
  {
    title: "Detection Report",
    description: "Satellite-based spill detection and characterization.",
    icon: Waves,
    count: 26,
    color: "#35d69f",
  },
  {
    title: "Regional Report",
    description: "Historical spill intelligence across a region.",
    icon: FileBarChart2,
    count: 15,
    color: "#a875ff",
  },
];

export default function Reports() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const incomingIncident = searchParams.get("incident");

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [generatedReports, setGeneratedReports] = useState(reports);

  const [showModal, setShowModal] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(
    incomingIncident || "SP-026"
  );
  const [selectedType, setSelectedType] = useState("Incident Report");

  const [includeSatellite, setIncludeSatellite] = useState(true);
  const [includeAIS, setIncludeAIS] = useState(true);
  const [includeDrift, setIncludeDrift] = useState(true);
  const [includeRisk, setIncludeRisk] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const filteredReports = useMemo(() => {
    return generatedReports.filter((report) => {
      const value = search.toLowerCase();

      const matchesSearch =
        report.id.toLowerCase().includes(value) ||
        report.title.toLowerCase().includes(value) ||
        report.type.toLowerCase().includes(value) ||
        report.related.toLowerCase().includes(value);

      const matchesFilter =
        activeFilter === "All" || report.type === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [search, activeFilter, generatedReports]);

  const selectedData =
    incidentData[selectedIncident] || incidentData["SP-026"];

  const downloadReport = (report) => {
    const content = `
SAGARDRISHTI
MARITIME INTELLIGENCE SYSTEM
========================================

REPORT ID: ${report.id}
REPORT TITLE: ${report.title}
REPORT TYPE: ${report.type}
RELATED INCIDENT / REGION: ${report.related}

DATE: ${report.date}
TIME: ${report.time}
STATUS: ${report.status}
CONFIDENCE: ${report.confidence}

----------------------------------------
INTELLIGENCE SUMMARY
----------------------------------------

SagarDrishti combines satellite imagery,
AIS vessel data and environmental information
to support maritime oil-spill investigation.

----------------------------------------
SATELLITE ANALYSIS
----------------------------------------

Source: Sentinel-1 SAR
Detection: Oil Spill
Estimated Confidence: ${report.confidence}

----------------------------------------
AIS VESSEL ANALYSIS
----------------------------------------

Vessel traffic around ${report.related}
was correlated using historical AIS tracks.

----------------------------------------
DRIFT ANALYSIS
----------------------------------------

Wind and ocean-current information can be
used to estimate spill movement and probable
origin location.

----------------------------------------
RISK ANALYSIS
----------------------------------------

The system ranks vessel candidates using
proximity, trajectory overlap and behavioural
anomalies.

----------------------------------------
END OF REPORT
----------------------------------------
`;

    const blob = new Blob([content], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${report.id}_SagarDrishti_Report.txt`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const generateReport = () => {
    setIsGenerating(true);

    setTimeout(() => {
      const reportNumber =
        generatedReports.length + 27;

      const titles = {
        "Incident Report": "Oil Spill Incident Report",
        "Vessel Report": "Vessel Responsibility Analysis",
        "Detection Report": "Oil Spill Detection Summary",
        "Regional Report": "Regional Spill Intelligence Report",
      };

      const newReport = {
        id: `RPT-${String(reportNumber).padStart(3, "0")}`,
        title: titles[selectedType],
        type: selectedType,
        related:
          selectedType === "Regional Report"
            ? selectedData.location
            : selectedIncident,
        date: "14 Sep 2026",
        time: "19:00 UTC",
        status: "Generated",
        confidence: selectedData.confidence,
      };

      setGeneratedReports((prev) => [
        newReport,
        ...prev,
      ]);

      setIsGenerating(false);
      setShowModal(false);
    }, 1200);
  };

  const viewReport = (report) => {
    if (incidentData[report.related]) {
      navigate(`/incidents?id=${report.related}`);
      return;
    }

    if (report.type === "Vessel Report") {
      navigate("/vessel-intelligence");
    } else if (report.type === "Detection Report") {
      navigate("/spill-detection");
    } else {
      navigate("/incidents");
    }
  };

  return (
    <div className="min-h-screen bg-[#061b2b] text-white">
      <Sidebar />

      <div className="ml-[245px] min-h-screen">
        {/* HEADER */}
        <header className="flex h-[76px] items-center justify-between border-b border-[#173d55] bg-[#071f32] px-8">
          <div>
            <h1 className="text-xl font-semibold">
              Reports
            </h1>

            <p className="mt-1 text-xs text-[#7296aa]">
              Maritime intelligence reports and analysis
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 rounded-lg border border-[#21465d] bg-[#0a2940] px-4 py-2 text-sm text-[#a7c1d0] transition hover:bg-[#103852] hover:text-white"
            >
              <ArrowLeft size={16} />
              Back
            </button>

            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 rounded-lg bg-[#087cae] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0994cf]"
            >
              <Plus size={17} />
              Create Report
            </button>
          </div>
        </header>

        <main className="space-y-6 p-8">
          {/* STATS */}
          <section className="grid grid-cols-4 gap-5">
            <div className="rounded-xl border border-[#1a3e55] bg-[#09263b] p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wider text-[#7195aa]">
                  Total Reports
                </p>
                <FileText size={19} className="text-[#20bce9]" />
              </div>

              <h2 className="mt-3 text-3xl font-bold">
                126
              </h2>

              <p className="mt-1 text-xs text-[#35d69f]">
                +12 this month
              </p>
            </div>

            <div className="rounded-xl border border-[#1a3e55] bg-[#09263b] p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wider text-[#7195aa]">
                  Incident Reports
                </p>
                <ShieldCheck size={19} className="text-[#ff5265]" />
              </div>

              <h2 className="mt-3 text-3xl font-bold">
                48
              </h2>

              <p className="mt-1 text-xs text-[#7195aa]">
                Spill investigations
              </p>
            </div>

            <div className="rounded-xl border border-[#1a3e55] bg-[#09263b] p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wider text-[#7195aa]">
                  Vessel Reports
                </p>
                <Ship size={19} className="text-[#a875ff]" />
              </div>

              <h2 className="mt-3 text-3xl font-bold">
                37
              </h2>

              <p className="mt-1 text-xs text-[#7195aa]">
                AIS intelligence
              </p>
            </div>

            <div className="rounded-xl border border-[#1a3e55] bg-[#09263b] p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wider text-[#7195aa]">
                  This Month
                </p>
                <Clock3 size={19} className="text-[#35d69f]" />
              </div>

              <h2 className="mt-3 text-3xl font-bold">
                18
              </h2>

              <p className="mt-1 text-xs text-[#35d69f]">
                Reports generated
              </p>
            </div>
          </section>

          {/* REPORT TYPES */}
          <section>
            <div className="mb-4">
              <h2 className="text-base font-semibold">
                Report Types
              </h2>

              <p className="mt-1 text-xs text-[#6f93a8]">
                Generate and review different maritime intelligence reports
              </p>
            </div>

            <div className="grid grid-cols-4 gap-5">
              {reportTypes.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.title}
                    onClick={() =>
                      setActiveFilter(item.title)
                    }
                    className="group rounded-xl border border-[#1a3e55] bg-[#09263b] p-5 text-left transition hover:-translate-y-0.5 hover:border-[#28617e] hover:bg-[#0b2b42]"
                  >
                    <div className="flex items-start justify-between">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-lg"
                        style={{
                          backgroundColor: `${item.color}18`,
                        }}
                      >
                        <Icon
                          size={20}
                          style={{
                            color: item.color,
                          }}
                        />
                      </div>

                      <span className="rounded-full bg-[#0d334a] px-2.5 py-1 text-[11px] text-[#8caabd]">
                        {item.count}
                      </span>
                    </div>

                    <h3 className="mt-4 text-sm font-semibold">
                      {item.title}
                    </h3>

                    <p className="mt-2 min-h-[38px] text-xs leading-5 text-[#7899ab]">
                      {item.description}
                    </p>

                    <div className="mt-4 text-xs font-medium text-[#20bce9]">
                      View reports →
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* GENERATED REPORTS */}
          <section className="overflow-hidden rounded-xl border border-[#1a3e55] bg-[#09263b]">
            <div className="flex items-center justify-between border-b border-[#1a3e55] px-6 py-5">
              <div>
                <h2 className="text-base font-semibold">
                  Generated Reports
                </h2>

                <p className="mt-1 text-xs text-[#6f93a8]">
                  Recently generated intelligence reports
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
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    placeholder="Search reports..."
                    className="w-[220px] rounded-lg border border-[#21465d] bg-[#071f32] py-2 pl-9 pr-3 text-xs text-white outline-none placeholder:text-[#5f8194] focus:border-[#287da3]"
                  />
                </div>

                <select
                  value={activeFilter}
                  onChange={(e) =>
                    setActiveFilter(e.target.value)
                  }
                  className="rounded-lg border border-[#21465d] bg-[#071f32] px-3 py-2 text-xs text-[#a7c1d0] outline-none"
                >
                  <option>All</option>
                  <option>Incident Report</option>
                  <option>Vessel Report</option>
                  <option>Detection Report</option>
                  <option>Regional Report</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#173d55] bg-[#071f32] text-[10px] uppercase tracking-wider text-[#6f93a8]">
                    <th className="px-6 py-3">
                      Report
                    </th>
                    <th className="px-4 py-3">
                      Type
                    </th>
                    <th className="px-4 py-3">
                      Related
                    </th>
                    <th className="px-4 py-3">
                      Generated
                    </th>
                    <th className="px-4 py-3">
                      Confidence
                    </th>
                    <th className="px-4 py-3">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredReports.length > 0 ? (
                    filteredReports.map((report) => (
                      <tr
                        key={report.id}
                        className="border-b border-[#15384d] last:border-0 hover:bg-[#0b2b42]"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0d344b]">
                              <FileText
                                size={17}
                                className="text-[#20bce9]"
                              />
                            </div>

                            <div>
                              <p className="text-sm font-medium text-white">
                                {report.title}
                              </p>

                              <p className="mt-1 text-[10px] text-[#65889c]">
                                {report.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <span className="text-xs text-[#a4bdcb]">
                            {report.type}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <button
                            onClick={() =>
                              incidentData[report.related] &&
                              navigate(
                                `/incidents?id=${report.related}`
                              )
                            }
                            className="rounded-md bg-[#0c3147] px-2 py-1 text-[11px] text-[#81aabd] transition hover:bg-[#124766] hover:text-white"
                          >
                            {report.related}
                          </button>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <CalendarDays
                              size={14}
                              className="text-[#64899d]"
                            />

                            <div>
                              <p className="text-xs text-[#a4bdcb]">
                                {report.date}
                              </p>

                              <p className="text-[10px] text-[#64899d]">
                                {report.time}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <span className="font-semibold text-[#35d69f]">
                            {report.confidence}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#123d36] px-2.5 py-1 text-[10px] font-medium text-[#5ee4b5]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#35d69f]" />
                            {report.status}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() =>
                                viewReport(report)
                              }
                              className="flex items-center gap-1.5 rounded-md border border-[#21465d] bg-[#0a2940] px-3 py-1.5 text-[11px] text-[#9db8c7] transition hover:border-[#287da3] hover:text-white"
                            >
                              <Eye size={14} />
                              View
                            </button>

                            <button
                              onClick={() =>
                                downloadReport(report)
                              }
                              className="flex items-center gap-1.5 rounded-md bg-[#0c5576] px-3 py-1.5 text-[11px] text-white transition hover:bg-[#087cae]"
                            >
                              <Download size={14} />
                              Export
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-6 py-12 text-center text-sm text-[#66899d]"
                      >
                        No reports found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-[#173d55] px-6 py-4">
              <p className="text-[11px] text-[#64899d]">
                Showing{" "}
                <span className="text-[#a5bdca]">
                  {filteredReports.length}
                </span>{" "}
                of{" "}
                <span className="text-[#a5bdca]">
                  {generatedReports.length}
                </span>{" "}
                reports
              </p>

              <button
                onClick={() => navigate("/incidents")}
                className="text-xs font-medium text-[#20bce9] hover:text-[#5ddcff]"
              >
                Open all incidents →
              </button>
            </div>
          </section>

          {/* BOTTOM CARDS */}
          <section className="grid grid-cols-3 gap-5">
            <div className="rounded-xl border border-[#1a3e55] bg-[#09263b] p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#103a50]">
                  <Waves size={18} className="text-[#20bce9]" />
                </div>

                <div>
                  <p className="text-sm font-semibold">
                    Spill Detection
                  </p>
                  <p className="text-[11px] text-[#6f93a8]">
                    Satellite intelligence
                  </p>
                </div>
              </div>

              <button
                onClick={() =>
                  navigate("/spill-detection")
                }
                className="mt-4 text-xs text-[#20bce9] hover:text-[#5ddcff]"
              >
                Open detection →
              </button>
            </div>

            <div className="rounded-xl border border-[#1a3e55] bg-[#09263b] p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#17384e]">
                  <Ship
                    size={18}
                    className="text-[#a875ff]"
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold">
                    Vessel Intelligence
                  </p>
                  <p className="text-[11px] text-[#6f93a8]">
                    AIS correlation
                  </p>
                </div>
              </div>

              <button
                onClick={() =>
                  navigate("/vessel-intelligence")
                }
                className="mt-4 text-xs text-[#20bce9] hover:text-[#5ddcff]"
              >
                Open vessel intelligence →
              </button>
            </div>

            <div className="rounded-xl border border-[#1a3e55] bg-[#09263b] p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#123d36]">
                  <FileBarChart2
                    size={18}
                    className="text-[#35d69f]"
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold">
                    Digital Twin
                  </p>
                  <p className="text-[11px] text-[#6f93a8]">
                    Maritime operational view
                  </p>
                </div>
              </div>

              <button
                onClick={() =>
                  navigate("/digital-twin")
                }
                className="mt-4 text-xs text-[#20bce9] hover:text-[#5ddcff]"
              >
                Open maritime view →
              </button>
            </div>
          </section>
        </main>
      </div>

      {/* CREATE REPORT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="w-[620px] overflow-hidden rounded-2xl border border-[#28516a] bg-[#082238] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1a3e55] px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold">
                  Generate Intelligence Report
                </h2>

                <p className="mt-1 text-xs text-[#6f93a8]">
                  Select the data you want to include in the report
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-2 text-[#7195aa] hover:bg-[#0d3048] hover:text-white"
              >
                <X size={19} />
              </button>
            </div>

            <div className="space-y-6 p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-xs font-medium text-[#8da9b8]">
                    Select Incident
                  </label>

                  <select
                    value={selectedIncident}
                    onChange={(e) =>
                      setSelectedIncident(e.target.value)
                    }
                    className="w-full rounded-lg border border-[#21465d] bg-[#071f32] px-3 py-3 text-sm text-white outline-none focus:border-[#287da3]"
                  >
                    {Object.keys(incidentData).map(
                      (id) => (
                        <option key={id}>
                          {id}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-[#8da9b8]">
                    Report Type
                  </label>

                  <select
                    value={selectedType}
                    onChange={(e) =>
                      setSelectedType(e.target.value)
                    }
                    className="w-full rounded-lg border border-[#21465d] bg-[#071f32] px-3 py-3 text-sm text-white outline-none focus:border-[#287da3]"
                  >
                    <option>Incident Report</option>
                    <option>Vessel Report</option>
                    <option>Detection Report</option>
                    <option>Regional Report</option>
                  </select>
                </div>
              </div>

              {/* DYNAMIC INCIDENT PREVIEW */}
              <div className="rounded-xl border border-[#1a3e55] bg-[#071f32] p-4">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#10384e]">
                    <MapPin
                      size={18}
                      className="text-[#20bce9]"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-semibold">
                      {selectedIncident}
                    </p>

                    <p className="text-[11px] text-[#698c9f]">
                      {selectedData.location} ·{" "}
                      {selectedData.status}
                    </p>
                  </div>

                  <span
                    className={`ml-auto rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                      selectedData.risk === "HIGH RISK"
                        ? "bg-[#54202a] text-[#ff7180]"
                        : selectedData.risk ===
                          "MEDIUM RISK"
                        ? "bg-[#493d1c] text-[#f6c55f]"
                        : "bg-[#123d36] text-[#5ee5b0]"
                    }`}
                  >
                    {selectedData.risk}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg bg-[#09263b] p-3">
                    <p className="text-[10px] text-[#66899d]">
                      Spill Area
                    </p>
                    <p className="mt-1 text-sm font-semibold">
                      {selectedData.area}
                    </p>
                  </div>

                  <div className="rounded-lg bg-[#09263b] p-3">
                    <p className="text-[10px] text-[#66899d]">
                      Confidence
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#35d69f]">
                      {selectedData.confidence}
                    </p>
                  </div>

                  <div className="rounded-lg bg-[#09263b] p-3">
                    <p className="text-[10px] text-[#66899d]">
                      Vessels
                    </p>
                    <p className="mt-1 text-sm font-semibold">
                      {selectedData.vessels}
                    </p>
                  </div>
                </div>
              </div>

              {/* DATA SOURCES */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">
                      Include Intelligence
                    </p>

                    <p className="mt-1 text-[11px] text-[#698c9f]">
                      Choose the analysis layers for this report
                    </p>
                  </div>

                  <span className="text-[10px] text-[#5e8296]">
                    {
                      [
                        includeSatellite,
                        includeAIS,
                        includeDrift,
                        includeRisk,
                      ].filter(Boolean).length
                    }{" "}
                    selected
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    [
                      includeSatellite,
                      setIncludeSatellite,
                      "Satellite Detection",
                      "Sentinel-1 SAR analysis",
                      Waves,
                      "#20bce9",
                    ],
                    [
                      includeAIS,
                      setIncludeAIS,
                      "AIS Correlation",
                      "Vessel movement analysis",
                      Ship,
                      "#a875ff",
                    ],
                    [
                      includeDrift,
                      setIncludeDrift,
                      "Drift & Trajectory",
                      "Wind and current modelling",
                      Wind,
                      "#35d69f",
                    ],
                    [
                      includeRisk,
                      setIncludeRisk,
                      "Risk Analysis",
                      "Vessel ranking & evidence",
                      Navigation,
                      "#f6b52d",
                    ],
                  ].map(
                    ([
                      enabled,
                      setter,
                      title,
                      description,
                      Icon,
                      iconColor,
                    ]) => (
                      <button
                        key={title}
                        onClick={() =>
                          setter(!enabled)
                        }
                        className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                          enabled
                            ? "border-[#17617e] bg-[#0b3046]"
                            : "border-[#1a3e55] bg-[#071f32]"
                        }`}
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#103c53]">
                          <Icon
                            size={18}
                            style={{
                              color: iconColor,
                            }}
                          />
                        </div>

                        <div className="flex-1">
                          <p className="text-xs font-semibold">
                            {title}
                          </p>

                          <p className="mt-1 text-[10px] text-[#678a9e]">
                            {description}
                          </p>
                        </div>

                        {enabled && (
                          <CheckCircle2
                            size={17}
                            className="text-[#35d69f]"
                          />
                        )}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-[#1a3e55] bg-[#071f32] px-6 py-4">
              <p className="text-[10px] text-[#5f8194]">
                Report will be added to your generated reports.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-[#21465d] px-4 py-2 text-xs text-[#8faaba] hover:bg-[#0d3048] hover:text-white"
                >
                  Cancel
                </button>

                <button
                  onClick={generateReport}
                  disabled={isGenerating}
                  className="flex min-w-[145px] items-center justify-center gap-2 rounded-lg bg-[#087cae] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#0994cf] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isGenerating ? (
                    <>
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText size={15} />
                      Generate Report
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}