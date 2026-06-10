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
import { Roadmap } from "./views/Roadmap";

const meta: Record<ViewKey, { title: string; subtitle: string }> = {
  dashboard: { title: "Operations Dashboard", subtitle: "Live overview of inspections, revenue, and inspector workload" },
  clients: { title: "Client Registry", subtitle: "Legal entities and individuals under management" },
  contracts: { title: "Contracts & Tariffs", subtitle: "Master service agreements and work orders" },
  inspectors: { title: "Inspector Roster", subtitle: "Certified engineers, specialties, and availability" },
  inspections: { title: "Inspection Workflow", subtitle: "5-step pipeline from request to completion" },
  billing: { title: "Billing & Invoices", subtitle: "Financial records tied to completed inspections" },
  reports: { title: "Reports & Analytics", subtitle: "Performance, quality, and financial intelligence" },
  roadmap: { title: "Production Roadmap", subtitle: "The plan to take ICS from prototype to enterprise" },
};

export default function App() {
  const [view, setView] = useState<ViewKey>("dashboard");
  const m = meta[view];

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
      <Sidebar active={view} onSelect={setView} />
      <main className="flex flex-1 flex-col overflow-hidden">
        <Header title={m.title} subtitle={m.subtitle} />
        <div className="flex-1 overflow-auto p-6 lg:p-8">
          {view === "dashboard" && <Dashboard />}
          {view === "clients" && <Clients />}
          {view === "contracts" && <Contracts />}
          {view === "inspectors" && <Inspectors />}
          {view === "inspections" && <Inspections />}
          {view === "billing" && <Billing />}
          {view === "reports" && <Reports />}
          {view === "roadmap" && <Roadmap />}
        </div>
      </main>
    </div>
  );
}