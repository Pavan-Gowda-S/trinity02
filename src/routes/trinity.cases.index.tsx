import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { clusterById, inr, riskLevel } from "@/lib/trinity/data";
import { useTrinity } from "@/lib/trinity/store";
import { BackLink, RiskPill } from "@/components/trinity/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/trinity/cases/")({
  component: CasesPage,
});

const FILTERS = ["All", "Active", "Monitoring", "Resolved"] as const;

function CasesPage() {
  const { cases } = useTrinity();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const navigate = useNavigate();
  const rows = cases.filter((c) => filter === "All" || c.status === filter);

  return (
    <div className="space-y-5">
      <BackLink fallback="/trinity" />
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label-xs">Authorized demo cases</p>
          <h1 className="mt-1 text-2xl font-light">Cases</h1>
        </div>
        <div className="flex gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs transition-colors",
                filter === f
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      <div className="panel overflow-x-auto scroll-slim">
        <table className="w-full min-w-[860px] text-sm">
          <thead>
            <tr className="border-b border-border/60 text-left">
              {[
                "Case ID",
                "Fraud amount",
                "Risk",
                "Predicted zone",
                "Predicted time",
                "Status",
                "Last updated",
              ].map((h) => (
                <th key={h} className="label-xs px-4 py-3 font-normal">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => {
              const cluster = clusterById(c.clusterId);
              return (
                <tr
                  key={c.caseId}
                  onClick={() =>
                    void navigate({ to: "/trinity/cases/$caseId", params: { caseId: c.caseId } })
                  }
                  className="cursor-pointer border-b border-border/40 transition-colors last:border-0 hover:bg-surface-2/60"
                >
                  <td className="px-4 py-3 font-mono text-xs text-primary">{c.caseId}</td>
                  <td className="px-4 py-3">{inr(c.amount)}</td>
                  <td className="px-4 py-3">
                    <RiskPill score={c.riskScore} level={riskLevel(c.riskScore)} />
                  </td>
                  <td className="px-4 py-3">
                    {c.riskScore === 0 ? (
                      <span className="text-muted-foreground">Pending</span>
                    ) : c.lowConfidence ? (
                      <span className="text-risk-medium">Not determinable</span>
                    ) : (
                      <>
                        {cluster?.label}{" "}
                        <span className="text-muted-foreground">· {cluster?.area}</span>
                      </>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{c.predictedTime}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">
                    {c.lastUpdated}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-muted-foreground">
        Select any case to open its intelligence workspace. All records are synthetic.
      </p>
    </div>
  );
}
