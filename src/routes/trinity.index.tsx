import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { atmClusters, clusterById, inr, riskLevel, type AtmCluster } from "@/lib/trinity/data";
import { useTrinity } from "@/lib/trinity/store";
import { Panel, RiskPill, SectionTitle, StatCard } from "@/components/trinity/ui";
import { RiskMap } from "@/components/trinity/RiskMap";
import { ClusterDetail } from "@/components/trinity/ClusterDetail";
import { ArrowUpRight } from "lucide-react";
import { ArchitectureStrip } from "@/components/trinity/ArchitectureStrip";

export const Route = createFileRoute("/trinity/")({
  component: Dashboard,
});

function Dashboard() {
  const { cases, alerts, audit } = useTrinity();
  const [cluster, setCluster] = useState<AtmCluster | null>(null);
  const navigate = useNavigate();

  const high = cases.filter((c) => c.riskScore >= 75).length;
  const medium = cases.filter((c) => c.riskScore >= 55 && c.riskScore < 75).length;
  const low = cases.filter((c) => c.riskScore < 55).length;
  const activeAlerts = alerts.filter((a) => a.status !== "Closed").length;
  const ranked = [...atmClusters].sort((a, b) => b.riskScore - a.riskScore).slice(0, 4);
  const priority = alerts.filter((a) => a.priority === "high" && a.status !== "Closed").slice(0, 3);

  return (
    <div className="space-y-7">
      <header>
        <p className="label-xs">Operational overview</p>
        <h1 className="mt-1 text-2xl font-light">What is happening right now</h1>
      </header>

      <ArchitectureStrip />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="High risk cases" value={high} tone="high" sub="Risk ≥ 75/100" />
        <StatCard label="Medium risk cases" value={medium} tone="medium" sub="Risk 55–74" />
        <StatCard label="Low risk cases" value={low} tone="low" sub="Risk < 55" />
        <StatCard label="Active alerts" value={activeAlerts} sub="Awaiting or under action" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <div>
          <SectionTitle
            title="Risk heatmap"
            hint="Synthetic Bengaluru clusters — click a hotspot for detail"
            action={
              <Link to="/trinity/heatmap" className="text-xs text-primary">
                Full GIS view →
              </Link>
            }
          />
          <RiskMap selectedId={cluster?.id ?? null} onSelect={setCluster} height={360} />
        </div>
        <div>
          <SectionTitle title="Priority alerts" hint="High-priority actionable intelligence" />
          <div className="space-y-3">
            {priority.map((a) => {
              const c = clusterById(a.clusterId);
              return (
                <button
                  key={a.id}
                  onClick={() => void navigate({ to: "/trinity/cases/$caseId", params: { caseId: a.caseId } })}
                  className="panel panel-hover w-full p-4 text-left"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-risk-high">HIGH PRIORITY</span>
                    <span className="font-mono text-xs text-muted-foreground">{a.caseId}</span>
                  </div>
                  <p className="mt-2 text-sm">{a.note}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {c?.label} · {c?.area} · {c?.predictedTime}
                  </p>
                </button>
              );
            })}
            <Link
              to="/trinity/alerts"
              className="inline-flex items-center gap-1 text-xs text-primary"
            >
              All alerts <ArrowUpRight className="size-3" />
            </Link>
          </div>
        </div>
      </div>

      {cluster ? <ClusterDetail cluster={cluster} onClose={() => setCluster(null)} /> : null}

      <div className="grid gap-5 xl:grid-cols-3">
        <Panel>
          <p className="label-xs">Top predicted cash-out zones</p>
          <ul className="mt-4 space-y-3">
            {ranked.map((c, i) => (
              <li key={c.id} className="flex items-center gap-3">
                <span className="font-mono text-xs text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">
                    {c.label} — {c.area}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {c.atmCount} ATMs · {c.predictedTime}
                  </p>
                </div>
                <RiskPill score={c.riskScore} />
              </li>
            ))}
          </ul>
        </Panel>

        <Panel>
          <p className="label-xs">Recent cases</p>
          <ul className="mt-4 space-y-3">
            {cases.slice(0, 5).map((c) => (
              <li key={c.caseId}>
                <Link
                  to="/trinity/cases/$caseId"
                  params={{ caseId: c.caseId }}
                  className="flex items-center gap-3 text-sm"
                >
                  <span className="font-mono text-xs text-primary">{c.caseId}</span>
                  <span className="text-muted-foreground">{inr(c.amount)}</span>
                  <span className="ml-auto">
                    <RiskPill score={c.riskScore} level={riskLevel(c.riskScore)} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel>
          <p className="label-xs">System activity</p>
          <ul className="mt-4 space-y-3">
            {audit.slice(0, 5).map((a) => (
              <li key={a.id} className="border-b border-border/40 pb-2 last:border-0">
                <p className="font-mono text-[10px] text-muted-foreground">
                  {a.time} · {a.role}
                </p>
                <p className="text-xs">{a.action}</p>
              </li>
            ))}
          </ul>
          <Link to="/trinity/audit" className="mt-3 inline-block text-xs text-primary">
            Open audit log →
          </Link>
        </Panel>
      </div>
    </div>
  );
}
