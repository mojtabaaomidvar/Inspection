import { LayoutDashboard, Users, FileText, UserCheck, ClipboardCheck, Receipt, BarChart3, ShieldCheck, Settings } from "lucide-react";
import { cn } from "../utils/cn";

export type ViewKey = "dashboard" | "clients" | "contracts" | "inspectors" | "inspections" | "billing" | "reports";

interface SidebarProps {
  active: ViewKey;
  onSelect: (key: ViewKey) => void;
  isExpanded: boolean;
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

export function Sidebar({ active, onSelect, isExpanded }: SidebarProps) {
  return (
    <aside
      className={cn(
        "fixed left-0 top-16 z-40 flex flex-col border-r border-slate-800/60 bg-slate-950 text-slate-300 transition-all duration-300 ease-in-out overflow-hidden",
        "h-[calc(100vh-4rem)]", // 🔑 ارتفاع داینامیک: کل صفحه منهای هدر
        isExpanded ? "w-64" : "w-20"
      )}
    >
      {/* Navigation Menu */}
      <nav className="flex-1 space-y-0.5 px-3 py-4 overflow-y-auto overflow-x-hidden">
        <div className={cn(
          "px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500",
          !isExpanded && "text-center"
        )}></div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onSelect(item.key)}
              title={!isExpanded ? item.label : undefined}
              className={cn(
                "group relative flex w-full items-center rounded-lg transition-colors",
                isExpanded ? "gap-3 px-2.5 py-2 text-sm" : "justify-center px-2 py-2.5",
                isActive
                  ? "bg-gradient-to-r from-indigo-500/15 to-violet-500/10 text-white"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100"
              )}
            >
              <Icon className={cn(
                "h-4 w-4 shrink-0",
                isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"
              )} />
              
              {isExpanded && (
                <>
                  <span className="flex-1 text-left truncate">{item.label}</span>
                  {item.badge && (
                    <span className="rounded-full bg-rose-500/15 px-1.5 py-0.5 text-[10px] font-medium text-rose-300 ring-1 ring-inset ring-rose-500/30">
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                  )}
                </>
              )}

              {/* Badge نقطه‌ای وقتی بسته است */}
              {!isExpanded && item.badge && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500" />
              )}

              {/* Tooltip وقتی بسته است */}
              {!isExpanded && (
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 pointer-events-none shadow-lg border border-slate-800">
                  {item.label}
                  <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45 border-l border-b border-slate-800" />
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer - User Profile */}
      <div className="border-t border-slate-800/70 p-3 shrink-0">
        <div className={cn(
          "flex items-center rounded-lg p-2 hover:bg-slate-800/60 transition-colors",
          isExpanded ? "gap-3" : "justify-center"
        )}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-semibold text-white">
            MO
          </div>
          {isExpanded && (
            <>
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-medium text-white">Mojtaba Omidvar</div>
                <div className="text-[10px] text-slate-500">Department Manager</div>
              </div>
              <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
            </>
          )}
        </div>
      </div>
    </aside>
  );
}