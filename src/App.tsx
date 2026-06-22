import { useState } from "react";
import { Sidebar, ViewKey } from "./components/Sidebar";
import { Header } from "./components/Header";
import { Dashboard } from "./views/Dashboard";
import { Clients } from "./views/Clients";
import { Contracts } from "./views/Contracts";
import { Inspectors } from "./views/Inspectors";
import { Inspections } from "./views/Inspections";
import { Billing } from "./views/Billing";
import { Reports } from "./views/Reports";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";

const meta: Record<ViewKey, { title: string; subtitle: string }> = {
  dashboard: { title: "Operations Dashboard", subtitle: "Live overview of inspections, revenue, and inspector workload" },
  clients: { title: "Client Registry", subtitle: "Legal entities and individuals under management" },
  contracts: { title: "Contracts & Tariffs", subtitle: "Master service agreements and work orders" },
  inspectors: { title: "Inspector Roster", subtitle: "Certified engineers, specialties, and availability" },
  inspections: { title: "Inspection Workflow", subtitle: "5-step pipeline from request to completion" },
  billing: { title: "Billing & Invoices", subtitle: "Financial records tied to completed inspections" },
  reports: { title: "Reports & Analytics", subtitle: "Performance, quality, and financial intelligence" },
};

function AppContent() {
  const [view, setView] = useState<ViewKey>("dashboard");
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const { isDark } = useTheme();
  
  const m = meta[view] ?? meta.dashboard;

  return (
    <div className={`min-h-screen font-sans antialiased transition-colors ${
      isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
    }`}>
      {/* 🔑 هدر: کل عرض، ثابت در بالا */}
      <Header
        title={m.title}
        subtitle={m.subtitle}
        isSidebarExpanded={sidebarExpanded}
        onToggleSidebar={() => setSidebarExpanded(!sidebarExpanded)}
      />

      {/* 🔑 سایدبار: ثابت، زیر هدر */}
      <Sidebar
        active={view}
        onSelect={setView}
        isExpanded={sidebarExpanded}
      />

      {/* 🔑 محتوای اصلی: با margin مناسب */}
      <main
        className="transition-all duration-300"
        style={{
          marginLeft: sidebarExpanded ? "16rem" : "5rem",
          paddingTop: "4rem", // ارتفاع هدر
        }}
      >
        <div className="p-6 lg:p-8">
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

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}