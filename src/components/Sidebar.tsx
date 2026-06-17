import { LayoutDashboard, Users, FileText, UserCheck, ClipboardCheck, Receipt, BarChart3, Map, ShieldCheck, Bell, Settings } from "lucide-react";


//import { Home, Users, FileText, BarChart3 } from "lucide-react";
import { cn } from "../utils/cn";

export type ViewKey = "dashboard" | "clients" | "contracts" | "inspectors" | "inspections" | "billing" | "reports" ;

interface SidebarProps {
  active: ViewKey;
  onSelect: (key: ViewKey) => void;
}

const navItems: { key: ViewKey; label: string; icon: typeof LayoutDashboard; badge?: string }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "clients", label: "Clients", icon: Users },
  { key: "contracts", label: "Contracts", icon: FileText },
  { key: "inspectors", label: "Inspectors", icon: UserCheck },
  { key: "inspections", label: "Workflow", icon: ClipboardCheck, badge: "3" },
  { key: "billing", label: "Billing", icon: Receipt },
  { key: "reports", label: "Reports", icon: BarChart3 },

];

export function Sidebar({ active, onSelect }: SidebarProps) {
  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-slate-800/60 bg-slate-950 text-slate-300">
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 shadow-lg shadow-indigo-900/50">
          <ShieldCheck className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="text-sm font-semibold text-white">ICS</div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500">Offshore & Energy Department Platform</div>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 px-3">
        <div className="px-2 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Operations</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onSelect(item.key)}
              className={cn(
                "group flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors",
                isActive ? "bg-gradient-to-r from-indigo-500/15 to-violet-500/10 text-white" : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300")} />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span className="rounded-full bg-rose-500/15 px-1.5 py-0.5 text-[10px] font-medium text-rose-300 ring-1 ring-inset ring-rose-500/30">{item.badge}</span>
              )}
              {isActive && <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-slate-800/70 p-3">
        <div className="flex items-center gap-3 rounded-lg p-2 hover:bg-slate-800/60">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-semibold text-white">MO</div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-medium text-white">Mojtaba Omidvar</div>
            <div className="text-[10px] text-slate-500">Department Manager</div>
          </div>
          <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
        </div>
      </div>
    </aside>
  );
}