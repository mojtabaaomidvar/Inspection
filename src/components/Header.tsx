import { Bell, HelpCircle, Command, Menu, PanelLeftClose, ShieldCheck, Sun, Moon } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  isSidebarExpanded: boolean;
  onToggleSidebar: () => void;
}

export function Header({ title, subtitle, action, isSidebarExpanded, onToggleSidebar }: HeaderProps) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className={`flex items-center justify-between border-b px-8 py-4 backdrop-blur transition-colors ${
      isDark 
        ? "border-slate-800 bg-slate-900/80" 
        : "border-slate-200 bg-white/80"
    }`}>
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
            isDark
              ? "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
          }`}
          title={isSidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isSidebarExpanded ? <PanelLeftClose className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>

        <div>
          <h1 className={`text-xl font-semibold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
            {title}
          </h1>
          {subtitle && <p className={`mt-0.5 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2">
        

        {/* 🔑 دکمه تغییر تم */}
        <button
          onClick={toggleTheme}
          className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
            isDark
              ? "border-slate-700 bg-slate-800 text-amber-400 hover:bg-slate-700"
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
          }`}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <button className={`relative flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
          isDark
            ? "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
        }`}>
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500" />
        </button>
        <button className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
          isDark
            ? "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
        }`}>
          <HelpCircle className="h-4 w-4" />
        </button>
        {action}
      </div>
    </header>
  );
}