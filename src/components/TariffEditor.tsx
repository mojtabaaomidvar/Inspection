import { Button, Badge } from "./ui";

interface TariffLine {
  id: string;
  description: string;
  unit: string;
  quantity: number;
  rate: number;
  isLumpSum: boolean;
  total: number;
}

interface TariffEditorProps {
  tariffs: TariffLine[];
  onChange: (tariffs: TariffLine[]) => void;
  error?: string;
}

const UNITS = ["LUMP_SUM", "HOUR", "DAY", "UNIT", "KM", "TON"];

export function TariffEditor({ tariffs, onChange, error }: TariffEditorProps) {
  const addTariff = () => {
    const newTariff: TariffLine = {
      id: `t${Date.now()}`,
      description: "",
      unit: "UNIT",
      quantity: 1,
      rate: 0,
      isLumpSum: false,
      total: 0,
    };
    onChange([...tariffs, newTariff]);
  };

  const removeTariff = (id: string) => {
    // حداقل یک تعرفه باید باقی بماند
    if (tariffs.length <= 1) return;
    onChange(tariffs.filter((t) => t.id !== id));
  };

  const updateTariff = (id: string, field: keyof TariffLine, value: any) => {
    const updated = tariffs.map((t) => {
      if (t.id !== id) return t;
      const newTariff = { ...t, [field]: value };

      // اگر Lump Sum شد، unit را تغییر بده
      if (field === "isLumpSum" && value === true) {
        newTariff.unit = "LUMP_SUM";
        newTariff.quantity = 1;
      }

      // محاسبه خودکار total
      newTariff.total = newTariff.quantity * newTariff.rate;

      return newTariff;
    });
    onChange(updated);
  };

  const totalAmount = tariffs.reduce((sum, t) => sum + t.total, 0);
  const hasLumpSum = tariffs.some((t) => t.isLumpSum);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-900">
            Tariff Lines
          </h3>
          <Badge tone="indigo">{tariffs.length}</Badge>
          {!hasLumpSum && (
            <Badge tone="rose">⚠️ At least one Lump Sum required</Badge>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addTariff}
          className="gap-1.5 text-xs"
        >
          ➕ Add Tariff
        </Button>
      </div>

      {error && (
        <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 p-2 text-xs font-medium text-rose-700">
          ✕ {error}
        </div>
      )}

      <div className="space-y-2">
        {tariffs.map((tariff, index) => (
          <div
            key={tariff.id}
            className={`rounded-lg border p-3 ${
              tariff.isLumpSum
                ? "border-indigo-200 bg-indigo-50/30"
                : "border-slate-200 bg-slate-50/50"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-slate-500">
                #{index + 1}
              </span>
              {tariff.isLumpSum && (
                <Badge tone="indigo">Lump Sum</Badge>
              )}
              <div className="flex-1" />
              {tariffs.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTariff(tariff.id)}
                  className="p-1 text-rose-600 hover:bg-rose-100 rounded transition-colors"
                  title="Remove"
                >
                  🗑️
                </button>
              )}
            </div>

            <div className="grid grid-cols-12 gap-2">
              {/* Description */}
              <div className="col-span-5">
                <input
                  type="text"
                  value={tariff.description}
                  onChange={(e) =>
                    updateTariff(tariff.id, "description", e.target.value)
                  }
                  placeholder="Description..."
                  className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-xs focus:border-indigo-400 focus:outline-none"
                />
              </div>

              {/* Unit */}
              <div className="col-span-2">
                <select
                  value={tariff.unit}
                  onChange={(e) => updateTariff(tariff.id, "unit", e.target.value)}
                  disabled={tariff.isLumpSum}
                  className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-xs focus:border-indigo-400 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500"
                >
                  {UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div className="col-span-2">
                <input
                  type="number"
                  value={tariff.quantity}
                  onChange={(e) =>
                    updateTariff(
                      tariff.id,
                      "quantity",
                      Math.max(0, Number(e.target.value))
                    )
                  }
                  disabled={tariff.isLumpSum}
                  className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-xs font-mono focus:border-indigo-400 focus:outline-none disabled:bg-slate-100"
                  placeholder="Qty"
                />
              </div>

              {/* Rate */}
              <div className="col-span-2">
                <input
                  type="number"
                  value={tariff.rate}
                  onChange={(e) =>
                    updateTariff(
                      tariff.id,
                      "rate",
                      Math.max(0, Number(e.target.value))
                    )
                  }
                  className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-xs font-mono focus:border-indigo-400 focus:outline-none"
                  placeholder="Rate"
                />
              </div>

              {/* Total (Read-only) */}
              <div className="col-span-1">
                <div className="w-full rounded border border-slate-200 bg-slate-100 px-2 py-1.5 text-xs font-mono text-slate-700 text-right">
                  {tariff.total.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Lump Sum Toggle */}
            <div className="mt-2 flex items-center gap-2">
              <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={tariff.isLumpSum}
                  onChange={(e) =>
                    updateTariff(tariff.id, "isLumpSum", e.target.checked)
                  }
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Mark as Lump Sum</span>
              </label>
            </div>
          </div>
        ))}
      </div>

      {/* جمع کل */}
      <div className="mt-3 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3">
        <span className="text-sm font-semibold text-slate-700">
          Total Tariff Amount:
        </span>
        <span className="text-lg font-bold text-emerald-600">
          {totalAmount.toLocaleString()} USD
        </span>
      </div>
    </div>
  );
}