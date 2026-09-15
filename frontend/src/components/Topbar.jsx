import { Search, Bell, ChevronDown } from "lucide-react";

export default function Topbar() {
  return (
    <header className="fixed left-[245px] right-0 top-0 z-20 flex h-[76px] items-center justify-between border-b border-slate-200 bg-white/95 px-7 backdrop-blur">

      <div>
        <h2 className="text-lg font-bold text-[#102a43]">
          Command Center
        </h2>
        <p className="mt-0.5 text-xs text-slate-400">
          Maritime environmental intelligence overview
        </p>
      </div>

      <div className="flex items-center gap-5">

        <div className="hidden h-9 w-64 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 md:flex">
          <Search size={16} className="text-slate-400" />
          <input
            placeholder="Search incidents, vessels..."
            className="w-full bg-transparent text-xs outline-none placeholder:text-slate-400"
          />
        </div>

        <button className="relative text-slate-500 hover:text-[#07567a]">
          <Bell size={19} />
          <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <div className="flex items-center gap-2 border-l border-slate-200 pl-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#dceff5] text-xs font-bold text-[#07567a]">
            DY
          </div>

          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-slate-700">
              Analyst
            </p>
            <p className="text-[10px] text-slate-400">
              Operations
            </p>
          </div>

          <ChevronDown size={14} className="text-slate-400" />
        </div>

      </div>
    </header>
  );
}