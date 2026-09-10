import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { clusterById, riskLevel, type RiskLevel } from "@/lib/trinity/data";
import { useTrinity } from "@/lib/trinity/store";
import { BackLink, ConfidenceBar, RiskPill } from "@/components/trinity/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/trinity/predictions")({
  component: PredictionsPage,
});

const RISKS: (RiskLevel | "all")[] = ["all", "high", "medium", "low"];
const STATUSES = ["All", "Active", "Monitoring", "Resolved"] as const;

function PredictionsPage() {
  const { cases } = useTrinity();
  const [risk, setRisk] = useState<RiskLevel | "all">("all");
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("All");
  const navigate = useNavigate();

  const rows = cases.filter(
    (c) =>
      c.riskScore > 0 &&
      (risk === "all" || riskLevel(c.riskScore) === risk) &&
      (status === "All" || c.status === status),
  );

  return (
    <div className="space-y-5">
      <BackLink fallback="/trinity" />
      <header>
        <p className="label-xs">Prototype Predictive Model output</p>
        <h1 className="mt-1 text-2xl font-light">AI Predictions</h1>
      </header>

      <div className="flex flex-wrap gap-4">
        <div className="flex gap-1.5">
          {RISKS.map((r) => (
            <button
              key={r}
              onClick={() => setRisk(r)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs capitalize",
                risk === r
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-border text-muted-foreground",
              )}
            >
              {r}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs",
                status === s
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-border text-muted-foreground",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((c) => {
          const cluster = clusterById(c.clusterId);
          return (
            <button
              key={c.caseId}
              onClick={() =>
                void navigate({ to: "/trinity/cases/$caseId", params: { caseId: c.caseId } })
              }
              className="panel panel-hover p-5 text-left"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-primary">{c.caseId}</span>
                <RiskPill score={c.riskScore} />
              </div>
              {c.lowConfidence ? (
                <p className="mt-3 text-sm text-risk-medium">
                  Low confidence — manual investigation recommended
                </p>
              ) : (
                <p className="mt-3 font-display text-lg">
                  {cluster?.label} — {cluster?.area}
                </p>
              )}
              <p className="mt-1 font-mono text-xs text-muted-foreground">{c.predictedTime}</p>
              <div className="mt-4">
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>Confidence</span>
                  <span className="font-mono">{c.confidence}%</span>
                </div>
                <div className="mt-1.5">
                  <ConfidenceBar value={c.confidence} />
                </div>
              </div>
              <p className="mt-4 text-[11px] text-muted-foreground">Status · {c.status}</p>
            </button>
          );
        })}
      </div>
      {!rows.length ? (
        <p className="text-sm text-muted-foreground">No predictions match these filters.</p>
      ) : null}
    </div>
  );
}
