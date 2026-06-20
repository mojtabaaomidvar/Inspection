import { useState, useEffect } from "react";
import { Sidebar, ViewKey } from "./components/Sidebar";
import { Header } from "./components/Header";
import { Dashboard } from "./views/Dashboard";
import { Clients } from "./views/Clients";
import { Contracts } from "./views/Contracts";
import { Inspectors } from "./views/Inspectors";
import { Inspections } from "./views/Inspections";
import { Billing } from "./views/Billing";
import { Reports } from "./views/Reports";

const meta: Record<ViewKey, { title: string; subtitle: string }> = {
  dashboard: { title: "Operations Dashboard", subtitle: "Live overview of inspections, revenue, and inspector workload" },
  clients: { title: "Client Registry", subtitle: "Legal entities and individuals under management" },
  contracts: { title: "Contracts & Tariffs", subtitle: "Master service agreements and work orders" },
  inspectors: { title: "Inspector Roster", subtitle: "Certified engineers, specialties, and availability" },
  inspections: { title: "Inspection Workflow", subtitle: "5-step pipeline from request to completion" },
  billing: { title: "Billing & Invoices", subtitle: "Financial records tied to completed inspections" },
  reports: { title: "Reports & Analytics", subtitle: "Performance, quality, and financial intelligence" },
};

export default function App() {
  const [view, setView] = useState<ViewKey>("dashboard");
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  
  //  State برای تم - ذخیره در localStorage
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved === "dark";
  });

  // 🔑 اعمال تم به document
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const m = meta[view] ?? meta.dashboard;

  return (
    <div className={`min-h-screen font-sans antialiased transition-colors duration-300 ${
      isDarkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
    }`}>
      {/* Header */}
      <Header
        title={m.title}
        subtitle={m.subtitle}
        isSidebarExpanded={sidebarExpanded}
        onToggleSidebar={() => setSidebarExpanded(!sidebarExpanded)}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
      />

      {/* Sidebar */}
      <Sidebar
        active={view}
        onSelect={setView}
        isExpanded={sidebarExpanded}
        isDarkMode={isDarkMode}
      />

      {/* Main Content */}
      <main
        className="transition-all duration-300 ease-in-out pt-16"
        style={{
          marginLeft: sidebarExpanded ? "16rem" : "5rem",
        }}
      >
        <div className="p-4 lg:p-6">
          {view === "dashboard" && <Dashboard />}
          {view === "clients" && <Clients />}
          {view === "contracts" && <Contracts />}
          {view === "inspectors" && <Inspectors />}
          {view === "inspections" && <Inspections />}
          {view === "billing" && <Billing />}
          {view === "reports" && <Reports />}
        </div>
      </main>
    </div>
  );
}