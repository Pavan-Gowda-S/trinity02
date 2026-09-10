import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { clusterById, stationForCluster, type RiskLevel } from "@/lib/trinity/data";
import { useTrinity } from "@/lib/trinity/store";
import { BackLink, Panel, RiskPill } from "@/components/trinity/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/trinity/alerts")({
  component: AlertsPage,
});

const FILTERS: (RiskLevel | "all")[] = ["all", "high", "medium", "low"];

function AlertsPage() {
  const { alerts, cases, setAlertStatus, log } = useTrinity();
  const [filter, setFilter] = useState<RiskLevel | "all">("all");
  const navigate = useNavigate();
  const rows = alerts.filter((a) => filter === "all" || a.priority === filter);

  return (
    <div className="space-y-5">
      <BackLink fallback="/trinity" />
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label-xs">Actionable intelligence</p>
          <h1 className="mt-1 text-2xl font-light">Alerts</h1>
        </div>
        <div className="flex gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs capitalize",
                filter === f
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-border text-muted-foreground",
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      <div className="space-y-3">
        {rows.map((a) => {
          const cluster = clusterById(a.clusterId);
          const record = cases.find((c) => c.caseId === a.caseId);
          return (
            <Panel key={a.id} className="fade-up">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <RiskPill level={a.priority} label={`${a.priority.toUpperCase()} PRIORITY`} />
                    <span className="font-mono text-xs text-primary">{a.caseId}</span>
                    <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
                      {a.status}
                    </span>
                  </div>
                  <p className="mt-3 text-sm">{a.note}</p>
                  <div className="mt-3 grid gap-x-8 gap-y-1 text-xs text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
                    <span>
                      Location · <span className="text-foreground">{cluster?.label}</span>
                    </span>
                    <span>
                      Time · <span className="text-foreground">{cluster?.predictedTime}</span>
                    </span>
                    <span>
                      Risk ·{" "}
                      <span className="text-foreground">{record?.riskScore ?? cluster?.riskScore}/100</span>
                    </span>
                    <span>
                      Confidence ·{" "}
                      <span className="text-foreground">
                        {record?.confidence ?? cluster?.confidence}%
                      </span>
                    </span>
                  </div>
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    Nearest station · {stationForCluster(a.clusterId)?.name} · Created {a.createdAt}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() =>
                      void navigate({ to: "/trinity/cases/$caseId", params: { caseId: a.caseId } })
                    }
                    className="rounded-md border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs text-primary"
                  >
                    View case
                  </button>
                  <button
                    onClick={() => {
                      setAlertStatus(a.id, "Acknowledged");
                      log("Alert acknowledged", a.caseId);
                      toast.success("Alert acknowledged");
                    }}
                    className="rounded-md border border-border px-3 py-1.5 text-xs hover:border-primary/40"
                  >
                    Acknowledge
                  </button>
                  <button
                    onClick={() => {
                      setAlertStatus(a.id, "Monitoring");
                      log("Alert marked for monitoring", a.caseId);
                      toast("Marked as monitoring");
                    }}
                    className="rounded-md border border-border px-3 py-1.5 text-xs hover:border-primary/40"
                  >
                    Mark monitoring
                  </button>
                  <Link
                    to="/trinity/reports"
                    search={{ caseId: a.caseId }}
                    className="rounded-md border border-border px-3 py-1.5 text-xs hover:border-primary/40"
                  >
                    Generate report
                  </Link>
                </div>
              </div>
            </Panel>
          );
        })}
      </div>
      <p className="text-[11px] text-muted-foreground">
        Prototype alerts are advisory only — no real dispatch, notification or agency action occurs.
      </p>
    </div>
  );
}
