import { ReactNode } from "react";
import { cn } from "../utils/cn";

// ============ Card ============
export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200/70 bg-white shadow-sm shadow-slate-100",
        className,
      )}
    >
      {children}
    </div>
  );
}

// ============ CardHeader ============
export function CardHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4",
        className,
      )}
    >
      <div className="min-w-0">
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        {subtitle && <div className="mt-0.5 text-xs text-slate-500">{subtitle}</div>}
      </div>
      {action}
    </div>
  );
}

// ============ Badge ============
export type BadgeTone =
  | "slate"
  | "emerald"
  | "amber"
  | "rose"
  | "indigo"
  | "sky"
  | "violet"
  | "zinc"
  | "teal";

export function Badge({
  children,
  tone = "slate",
  className,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  const tones: Record<BadgeTone, string> = {
    slate: "bg-slate-100 text-slate-700 ring-slate-200",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    rose: "bg-rose-50 text-rose-700 ring-rose-200",
    indigo: "bg-indigo-50 text-indigo-700 ring-indigo-200",
    sky: "bg-sky-50 text-sky-700 ring-sky-200",
    violet: "bg-violet-50 text-violet-700 ring-violet-200",
    zinc: "bg-zinc-100 text-zinc-700 ring-zinc-200",
    teal: "bg-teal-50 text-teal-700 ring-teal-200",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

// ============ StatusPill ============
export function StatusPill({ status }: { status: string }) {
  const map: Record<string, { tone: BadgeTone; label: string }> = {
    REQUESTED: { tone: "sky", label: "Requested" },
    DOC_REVIEW: { tone: "indigo", label: "Doc Review" },
    INSPECTOR_ASSIGNED: { tone: "violet", label: "Assigned" },
    EXECUTING: { tone: "amber", label: "Executing" },
    NCR_ISSUED: { tone: "rose", label: "NCR Issued" },
    COMPLETED: { tone: "emerald", label: "Completed" },
    ACTIVE: { tone: "emerald", label: "Active" },
    PENDING: { tone: "amber", label: "Pending" },
    CLOSED: { tone: "zinc", label: "Closed" },
    DRAFT: { tone: "zinc", label: "Draft" },
    ISSUED: { tone: "sky", label: "Issued" },
    PAID: { tone: "emerald", label: "Paid" },
    OVERDUE: { tone: "rose", label: "Overdue" },
    AVAILABLE: { tone: "emerald", label: "Available" },
    BUSY: { tone: "amber", label: "Busy" },
    ON_LEAVE: { tone: "zinc", label: "On Leave" },
  };
  const m = map[status] ?? { tone: "slate" as const, label: status };
  return <Badge tone={m.tone}>{m.label}</Badge>;
}

// ============ Avatar ============
export function Avatar({
  name,
  gradient = "from-indigo-500 to-violet-600",
  size = "md",
}: {
  name: string;
  gradient?: string;
  size?: "sm" | "md" | "lg";
}) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const sizes = { sm: "h-7 w-7 text-[10px]", md: "h-9 w-9 text-xs", lg: "h-11 w-11 text-sm" };
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-lg bg-gradient-to-br font-semibold text-white shadow-sm",
        gradient,
        sizes[size],
      )}
    >
      {initials}
    </div>
  );
}

// ============ Button ============
export type ButtonVariant = "primary" | "ghost" | "outline" | "danger";

export function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  onClick,
  type = "button",
  disabled = false,
}: {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: "sm" | "md";
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}) {
  const variants: Record<ButtonVariant, string> = {
    primary:
      "bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-200 hover:from-indigo-700 hover:to-violet-700",
    ghost: "text-slate-600 hover:bg-slate-100",
    outline: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
    danger: "bg-rose-600 text-white hover:bg-rose-700",
  };
  const sizes = { sm: "px-2.5 py-1.5 text-xs", md: "px-3.5 py-2 text-sm" };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg font-medium transition-colors disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
    >
      {children}
    </button>
  );
}

// ============ Table ============
export function Table({ headers, children }: { headers: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] uppercase tracking-wide text-slate-500">
            {headers.map((h) => (
              <th key={h} className="px-5 py-3 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">{children}</tbody>
      </table>
    </div>
  );
}

// ============ StatCard ============
export type StatCardTone = "indigo" | "emerald" | "rose" | "amber";

export function StatCard({
  label,
  value,
  delta,
  tone,
  icon,
}: {
  label: string;
  value: string;
  delta: string;
  tone: StatCardTone;
  icon: ReactNode;
}) {
  const tones: Record<StatCardTone, string> = {
    indigo: "from-indigo-500 to-violet-600",
    emerald: "from-emerald-500 to-teal-600",
    rose: "from-rose-500 to-pink-600",
    amber: "from-amber-500 to-orange-600",
  };
  return (
    <Card className="overflow-hidden">
      <div className="flex items-start justify-between p-5">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">{value}</div>
          <div className="mt-1 text-xs font-medium text-emerald-600">{delta}</div>
        </div>
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-sm",
            tones[tone],
          )}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
}

// ============ Modal ============
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: "md" | "lg" | "xl";
}) {
  if (!isOpen) return null;
  const sizes = { md: "max-w-2xl", lg: "max-w-4xl", xl: "max-w-6xl" };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div
        className={cn(
          "w-full max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl",
          sizes[size],
        )}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4 rounded-t-2xl">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            ✕
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}