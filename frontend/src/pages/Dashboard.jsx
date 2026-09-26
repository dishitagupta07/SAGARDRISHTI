import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowUpRight,
  Clock3,
  Droplets,
  MapPin,
  Ship,
  TrendingUp,
  Wind,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

const incidents = [
  {
    id: "SP-026",
    location: "Bay of Bengal",
    status: "Critical",
    size: "42.6 km²",
    time: "2h 14m ago",
  },
  {
    id: "SP-025",
    location: "Arabian Sea",
    status: "Monitoring",
    size: "18.4 km²",
    time: "6h 42m ago",
  },
  {
    id: "SP-024",
    location: "Bay of Bengal",
    status: "Critical",
    size: "31.8 km²",
    time: "1d ago",
  },
];

export default function Dashboard() {
    const navigate = useNavigate();
  return (
    <div className="dark-dashboard min-h-screen">
      <Sidebar />
      <Topbar />

      <main className="ml-[245px] pt-[76px]">

        <div className="p-7">

          {/* PAGE HEADER */}
          <div className="mb-6 flex items-end justify-between">

            <div>
              <p className="mb-1 text-xs font-medium text-[#087ea4]">
                OVERVIEW
              </p>

              <h1 className="text-2xl font-bold text-[#102a43]">
                Maritime Situation
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Real-time overview of monitored marine incidents.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Systems operational
            </div>

          </div>


          {/* STAT CARDS */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <StatCard
              icon={Droplets}
              title="Active Oil Spills"
              value="12"
              change="+3 this week"
              positive={false}
            />

            <StatCard
              icon={AlertTriangle}
              title="Critical Incidents"
              value="03"
              change="Requires attention"
              positive={false}
            />

            <StatCard
              icon={Ship}
              title="Vessels Tracked"
              value="1,284"
              change="+8.4% this week"
              positive
            />

            <StatCard
              icon={TrendingUp}
              title="Avg. Detection Confidence"
              value="91.6%"
              change="+2.1% this month"
              positive
            />

          </div>


          {/* MAIN GRID */}
          <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1.55fr_1fr]">

            {/* MAP */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">

              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

                <div>
                  <h3 className="text-sm font-bold text-[#102a43]">
                    Incident Overview
                  </h3>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Active incidents across monitored waters
                  </p>
                </div>

                <button
                  onClick={() => navigate("/digital-twin")}
                  className="flex items-center gap-1 text-xs font-semibold text-[#087ea4]"
                >
                  Open Digital Twin
                  <ArrowUpRight size={14} />
                </button>

              </div>

              <div className="relative h-[390px] overflow-hidden bg-[#dcecf0]">

                {/* Fake map */}
                <div className="absolute inset-0 opacity-60">
                  <div className="h-full w-full bg-[radial-gradient(circle_at_30%_40%,#b7d6dc_0,transparent_28%),radial-gradient(circle_at_70%_65%,#b7d6dc_0,transparent_25%),linear-gradient(135deg,#e7f2f3,#cfe5e8)]" />

                  <div className="absolute left-[16%] top-[25%] h-[140px] w-[210px] rotate-12 rounded-[45%] bg-[#b5c6ae]" />
                  <div className="absolute right-[12%] top-[18%] h-[180px] w-[150px] -rotate-12 rounded-[45%] bg-[#b5c6ae]" />
                </div>

                <div className="absolute left-[43%] top-[38%]">
                  <MapMarker critical />
                </div>

                <div className="absolute left-[64%] top-[61%]">
                  <MapMarker />
                </div>

                <div className="absolute left-[26%] top-[66%]">
                  <MapMarker />
                </div>

                <div className="absolute bottom-4 left-4 rounded-lg border border-slate-200 bg-white/95 px-3 py-2 shadow-sm">
                  <div className="flex items-center gap-3 text-[10px] text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-red-500" />
                      Critical
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-[#087ea4]" />
                      Active
                    </span>
                  </div>
                </div>

              </div>
            </div>


            {/* PRIORITY INCIDENTS */}
            <div className="rounded-xl border border-slate-200 bg-white">

              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

                <div>
                  <h3 className="text-sm font-bold text-[#102a43]">
                    Priority Incidents
                  </h3>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Incidents requiring attention
                  </p>
                </div>

                <span className="rounded-full bg-red-50 px-2 py-1 text-[10px] font-semibold text-red-500">
                  3 urgent
                </span>

              </div>

              <div className="divide-y divide-slate-100">

                {incidents.map((incident) => (
                  <button
                    key={incident.id}
                    onClick={() => navigate("/incidents")}
                    className="w-full text-left p-5 transition hover:bg-slate-50"
                  >

                    <div className="flex items-start justify-between">

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[#102a43]">
                            {incident.id}
                          </span>

                          <span
                            className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${
                              incident.status === "Critical"
                                ? "bg-red-50 text-red-500"
                                : incident.status === "Monitoring"
                                ? "bg-amber-50 text-amber-600"
                                : "bg-blue-50 text-blue-600"
                            }`}
                          >
                            {incident.status}
                          </span>
                        </div>

                        <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-400">
                          <MapPin size={12} />
                          {incident.location}
                        </div>
                      </div>

                      <ArrowUpRight
                        size={15}
                        className="text-slate-300"
                      />

                    </div>

                    <div className="mt-4 flex items-center justify-between text-[11px]">

                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Droplets size={13} />
                        {incident.size}
                      </span>

                      <span className="flex items-center gap-1.5 text-slate-400">
                        <Clock3 size={13} />
                        {incident.time}
                      </span>

                    </div>

                  </button>
                ))}

              </div>

              <button
                onClick={() => navigate("/incidents")}
                className="w-full border-t border-slate-100 py-3 text-xs font-semibold text-[#087ea4] hover:bg-slate-50"
              >
                View all incidents →
              </button>

            </div>

          </div>


          {/* BOTTOM CARDS */}
          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">

            <InfoCard
              icon={Wind}
              title="Ocean Conditions"
              value="Moderate"
              detail="Wind 14 km/h · NE"
            />

            <InfoCard
              icon={Ship}
              title="Vessel Activity"
              value="High"
              detail="284 vessels in monitored area"
            />

            <InfoCard
              icon={Clock3}
              title="Next Satellite Pass"
              value="02h 37m"
              detail="Sentinel-1 · Arabian Sea"
            />

          </div>

        </div>

      </main>
    </div>
  );
}


function StatCard({
  icon: Icon,
  title,
  value,
  change,
  positive,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">

      <div className="flex items-center justify-between">

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e9f4f8] text-[#087ea4]">
          <Icon size={18} />
        </div>

        <ArrowUpRight
          size={15}
          className="text-slate-300"
        />

      </div>

      <p className="mt-4 text-xs text-slate-400">
        {title}
      </p>

      <div className="mt-1 flex items-end gap-3">

        <span className="text-2xl font-bold text-[#102a43]">
          {value}
        </span>

        <span
          className={`mb-1 text-[10px] font-semibold ${
            positive ? "text-emerald-500" : "text-red-400"
          }`}
        >
          {change}
        </span>

      </div>

    </div>
  );
}


function MapMarker({ critical = false }) {
  return (
    <div className="relative">
      <div
        className={`absolute -inset-3 rounded-full ${
          critical ? "animate-pulse bg-red-400/20" : "bg-[#087ea4]/15"
        }`}
      />

      <div
        className={`relative flex h-7 w-7 items-center justify-center rounded-full border-2 border-white shadow-lg ${
          critical ? "bg-red-500" : "bg-[#087ea4]"
        }`}
      >
        <Droplets size={13} className="text-white" />
      </div>
    </div>
  );
}


function InfoCard({ icon: Icon, title, value, detail }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5">

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#e9f4f8] text-[#087ea4]">
        <Icon size={19} />
      </div>

      <div>
        <p className="text-[11px] text-slate-400">{title}</p>
        <p className="mt-0.5 text-sm font-bold text-[#102a43]">
          {value}
        </p>
        <p className="mt-1 text-[10px] text-slate-400">
          {detail}
        </p>
      </div>

    </div>
  );
}