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
  // 🔑 State برای کنترل باز/بسته بودن سایدبار
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  const m = meta[view] ?? meta.dashboard;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
      {/* 🔑 Header: ثابت در بالا، کل عرض صفحه */}
      <Header
        title={m.title}
        subtitle={m.subtitle}
        isSidebarExpanded={sidebarExpanded}
        onToggleSidebar={() => setSidebarExpanded(!sidebarExpanded)}
      />

      {/*  Sidebar: از زیر هدر شروع می‌شود */}
      <Sidebar
        active={view}
        onSelect={setView}
        isExpanded={sidebarExpanded}
      />

      {/* 🔑 Main Content: با margin-top و margin-left داینامیک */}
      <main
        className="transition-all duration-300 ease-in-out pt-16"
        style={{
          marginLeft: sidebarExpanded ? "16rem" : "5rem", // 16rem = w-64, 5rem = w-20
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