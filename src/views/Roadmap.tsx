import { Card, Badge } from "../components/ui";

export function Roadmap() {
  const phases = [
    { title: "Foundation", weeks: "Weeks 1-4", status: "current", icon: "🏗️" },
    { title: "Core CRUD", weeks: "Weeks 5-10", status: "next", icon: "📋" },
    { title: "Inspection Workflow", weeks: "Weeks 11-14", status: "planned", icon: "🔍" },
    { title: "Financial Module", weeks: "Weeks 15-17", status: "planned", icon: "💰" },
    { title: "Reports & Analytics", weeks: "Weeks 18-20", status: "planned", icon: "📊" },
    { title: "Hardening & Production", weeks: "Weeks 21-26", status: "planned", icon: "🛡️" },
  ];

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950 p-6 text-white">
        <div className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
          🚀 Production Roadmap
        </div>
        <h2 className="mt-2 text-2xl font-semibold">From prototype to production in 6 months</h2>
        <p className="mt-1 text-sm text-slate-300">
          A 6-phase transformation plan taking ICS to a hardened enterprise platform.
        </p>
      </div>

      <div className="space-y-3">
        {phases.map((p, i) => (
          <Card
            key={i}
            className={p.status === "current" ? "border-indigo-300 bg-indigo-50/30" : ""}
          >
            <div className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-lg shadow-md">
                {p.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Badge tone={p.status === "current" ? "indigo" : p.status === "next" ? "sky" : "slate"}>
                    Phase {i + 1}
                  </Badge>
                  {p.status === "current" && <Badge tone="emerald">In Progress</Badge>}
                  {p.status === "next" && <Badge tone="sky">Up Next</Badge>}
                  <span className="text-xs text-slate-500">{p.weeks}</span>
                </div>
                <h3 className="mt-1.5 text-base font-semibold text-slate-900">{p.title}</h3>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}