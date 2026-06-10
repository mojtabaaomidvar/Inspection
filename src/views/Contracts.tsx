import { Card, CardHeader, Badge, Button, StatusPill } from "../components/ui";
import { contracts } from "../data/mockData";
import { formatCurrency } from "../lib/formatters";
import { contractHealth } from "../lib/formatters";

export function Contracts() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="All Contracts"
          subtitle={`${contracts.length} total agreements`}
          action={<Button size="sm">+ New Contract</Button>}
        />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3">Contract #</th>
                <th className="px-5 py-3">Client</th>
                <th className="px-5 py-3">Scope</th>
                <th className="px-5 py-3">Value</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {contracts.map((c) => {
                const health = contractHealth(c);
                return (
                  <tr key={c.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3 font-mono text-xs font-semibold text-indigo-600">
                      {c.contract_no}
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-800">{c.client_name}</td>
                    <td className="px-5 py-3 text-sm text-slate-700 max-w-xs truncate">
                      {c.contract_title}
                    </td>
                    <td className="px-5 py-3">
                      <div className="text-sm font-semibold text-slate-900">
                        {formatCurrency(c.total_value, c.currency)}
                      </div>
                      <div className="mt-1 h-1.5 w-32 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${
                            health.budgetTone === "emerald"
                              ? "bg-emerald-500"
                              : health.budgetTone === "amber"
                              ? "bg-amber-500"
                              : "bg-rose-500"
                          }`}
                          style={{ width: `${Math.min(health.spent, 100)}%` }}
                        />
                      </div>
                      <div className="mt-0.5 text-[10px] text-slate-500">
                        {health.spent.toFixed(0)}% used
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <StatusPill status={c.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}