import {
  LayoutDashboard,
  Waves,
  Map,
  Ship,
  Database,
  TriangleAlert,
  FileText,
  Settings,
  LogOut,
} from "lucide-react";

import { useLocation, useNavigate } from "react-router-dom";

const menu = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    name: "Incidents",
    icon: TriangleAlert,
    path: "/incidents",
  },
  {
    name: "Digital Twin",
    icon: Map,
    path: "/digital-twin",
  },
  {
    name: "Spill Detection",
    icon: Waves,
    path: "/spill-detection",
  },
  {
    name: "Vessel Intelligence",
    icon: Ship,
    path: "/vessel-intelligence",
  },
  {
    name: "Spill Database",
    icon: Database,
    path: "/spill-database",
  },
  {
    name: "Reports",
    icon: FileText,
    path: "/reports",
  },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-[245px] flex-col border-r border-[#173d55] bg-[#082238]">

      {/* Logo */}
      <div className="flex h-[76px] items-center gap-3 border-b border-[#173d55] px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#087cae]">
          <Waves size={23} className="text-white" />
        </div>

        <div>
          <h1 className="text-[15px] font-bold tracking-[0.12em] text-white">
            SAGARDRISHTI
          </h1>

          <p className="text-[9px] font-medium tracking-wider text-[#7096ad]">
            MARITIME INTELLIGENCE
          </p>
        </div>
      </div>

      {/* Menu */}
      <div className="px-3 pt-6">

        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-widest text-[#6c91a7]">
          Overview
        </p>

        <nav className="space-y-1">

          {menu.map((item) => {
            const Icon = item.icon;

            const active = location.pathname === item.path;

            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                  active
                    ? "bg-[#12658c] font-semibold text-white"
                    : "text-[#82a7bc] hover:bg-[#0d3048] hover:text-white"
                }`}
              >
                <Icon size={18} strokeWidth={1.8} />
                {item.name}
              </button>
            );
          })}

        </nav>
      </div>

      {/* Bottom */}
      <div className="mt-auto border-t border-[#173d55] px-3 py-4">

        <button
          onClick={() => navigate("/settings")}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
            location.pathname === "/settings"
              ? "bg-[#12658c] font-semibold text-white"
              : "text-[#82a7bc] hover:bg-[#0d3048] hover:text-white"
          }`}
        >
          <Settings size={18} />
          Settings
        </button>

        <button
          onClick={handleLogout}
          className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#82a7bc] transition hover:bg-red-950/40 hover:text-red-400"
        >
          <LogOut size={18} />
          Logout
        </button>

      </div>

    </aside>
  );
}