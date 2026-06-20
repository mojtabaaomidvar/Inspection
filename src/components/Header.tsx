import { Search, Bell, HelpCircle, Command, Menu, PanelLeftClose, ShieldCheck } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  isSidebarExpanded: boolean;
  onToggleSidebar: () => void;
}

export function Header({ title, subtitle, action, isSidebarExpanded, onToggleSidebar }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-50 flex items-center justify-between border-b border-slate-200 bg-white/95 backdrop-blur px-4 lg:px-6 shadow-sm">
      {/* 🔑 سمت چپ: دکمه Toggle + لوگو + عنوان */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* دکمه باز/بسته کردن سایدبار */}
        <button
          onClick={onToggleSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-indigo-600 transition-colors shrink-0"
          title={isSidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isSidebarExpanded ? (
            <PanelLeftClose className="h-4 w-4" />
          ) : (
            <Menu className="h-4 w-4" />
          )}
        </button>

        {/* لوگو + عنوان اپلیکیشن */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 shadow-md shadow-indigo-500/30">
            <ShieldCheck className="h-4 w-4 text-white" />
          </div>
          <div className="min-w-0 hidden sm:block">
            <h1 className="text-sm font-bold text-slate-900 truncate leading-tight">
              Offshore & Energy Inspection Platform
            </h1>
            {subtitle && (
              <p className="text-[10px] text-slate-500 truncate leading-tight">{subtitle}</p>
            )}
          </div>
        </div>
      </div>

      {/* 🔑 سمت راست: جستجو و آیکون‌ها */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Search clients, contracts, inspections…"
            className="w-72 rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-20 text-sm text-slate-700 placeholder-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
          <span className="absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-500 md:inline-flex">
            <Command className="h-3 w-3" /> K
          </span>
        </div>
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500" />
        </button>
        <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50">
          <HelpCircle className="h-4 w-4" />
        </button>
        {action}
      </div>
    </header>
  );
}