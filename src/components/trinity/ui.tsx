import { cn } from "@/lib/utils";
import { useRouter } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { riskLevel, type RiskLevel } from "@/lib/trinity/data";
import type { ReactNode } from "react";

export function Panel({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div className={cn("panel p-5", className)} {...rest}>
      {children}
    </div>
  );
}

export function SectionTitle({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-sm font-semibold tracking-wide">{title}</h2>
        {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      </div>
      {action}
    </div>
  );
}

const riskClass: Record<RiskLevel, string> = {
  high: "border-risk-high/40 bg-risk-high/10 text-risk-high",
  medium: "border-risk-medium/40 bg-risk-medium/10 text-risk-medium",
  low: "border-risk-low/40 bg-risk-low/10 text-risk-low",
};

export function RiskPill({
  score,
  level,
  label,
  className,
}: {
  score?: number;
  level?: RiskLevel;
  label?: string;
  className?: string;
}) {
  const lvl = level ?? riskLevel(score ?? 0);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[11px] tracking-wide",
        riskClass[lvl],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {label ?? (score !== undefined ? `${score}/100` : lvl.toUpperCase())}
    </span>
  );
}

export function StatCard({
  label,
  value,
  sub,
  tone = "default",
}: {
  label: string;
  value: string | number;
  sub?: string;
  tone?: "default" | "high" | "medium" | "low";
}) {
  const toneText =
    tone === "high"
      ? "text-risk-high"
      : tone === "medium"
        ? "text-risk-medium"
        : tone === "low"
          ? "text-risk-low"
          : "text-foreground";
  return (
    <div className="panel panel-hover p-4">
      <p className="label-xs">{label}</p>
      <p className={cn("mt-2 font-display text-3xl font-light", toneText)}>{value}</p>
      {sub ? <p className="mt-1 text-xs text-muted-foreground">{sub}</p> : null}
    </div>
  );
}

export function MetaRow({ k, v }: { k: string; v: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border/50 py-2 last:border-0">
      <span className="text-xs text-muted-foreground">{k}</span>
      <span className="text-right text-sm">{v}</span>
    </div>
  );
}

export function Chip({ children, active }: { children: ReactNode; active?: boolean }) {
  return (
    <span
      className={cn(
        "rounded-full border px-2.5 py-1 text-[11px] tracking-wide",
        active
          ? "border-primary/50 bg-primary/10 text-primary"
          : "border-border text-muted-foreground",
      )}
    >
      {children}
    </span>
  );
}

export function ConfidenceBar({ value }: { value: number }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-primary transition-all duration-700"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}


/**
 * Universal "Back" control. Returns to the actual previous context (which
 * preserves in-page filters/search kept in component state on that screen);
 * falls back to a sensible parent route when there is no history entry.
 */
export function BackLink({
  fallback = "/trinity",
  label = "Back",
  className,
}: {
  fallback?: string;
  label?: string;
  className?: string;
}) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window !== "undefined" && window.history.length > 1) {
          router.history.back();
        } else {
          void router.navigate({ to: fallback });
        }
      }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary",
        className,
      )}
    >
      <ArrowLeft className="size-3.5" /> {label}
    </button>
  );
}
