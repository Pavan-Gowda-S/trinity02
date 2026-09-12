import { createFileRoute } from "@tanstack/react-router";
import { LayoutDashboard, Map, Network, BellRing, ShieldCheck } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TabPortal } from "@/components/trinity/TabPortal";
import { Panel, RiskPill, StatCard, MetaRow } from "@/components/trinity/ui";
import { clusterById, riskLevel, type CaseRecord } from "@/lib/trinity/data";
import { useTrinity } from "@/lib/trinity/store";

export const Route = createFileRoute("/i4c")({
  head: () => ({
    meta: [
      { title: "I4C Intelligence Dashboard — TRINITY Prototype" },
      {
        name: "description",
        content:
          "Prototype national view: state-level cybercrime risk, emerging hotspots, cross-state case relationships and priority alerts on synthetic data.",
      },
      { property: "og:title", content: "I4C Intelligence Dashboard — TRINITY Prototype" },
      {
        property: "og:description",
        content: "National and cross-state synthetic cybercrime intelligence overview.",
      },
    ],
  }),
  component: I4CPortal,
});

function I4CPortal() {
  return (
    <TabPortal
      role="i4c"
      portalName="I4C Intelligence"
      portalTag="National coordination"
      tabs={[
        { id: "nat", label: "National Dashboard", icon: <LayoutDashboard className="size-4" />, render: () => <Nat /> },
        { id: "map", label: "India Risk Map", icon: <Map className="size-4" />, render: () => <IndiaMap /> },
        { id: "cross", label: "Cross-State Intelligence", icon: <Network className="size-4" />, render: () => <Cross /> },
        { id: "alerts", label: "Priority Alerts", icon: <BellRing className="size-4" />, render: () => <Prio /> },
        { id: "audit", label: "Audit & Access", icon: <ShieldCheck className="size-4" />, render: () => <Access /> },
      ]}
    />
  );
}

const chartTip = {
  contentStyle: {
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: 8,
    fontSize: 12,
  },
  labelStyle: { color: "var(--color-muted-foreground)" },
};

interface StateAgg {
  state: string;
  cases: number;
  risk: number;
  hotspot: string;
}

/** Aggregate live cases to state level — no victim, bank or money-flow detail. */
function useStateAggregates(cases: CaseRecord[]): StateAgg[] {
  const byState = new Map<string, CaseRecord[]>();
  for (const c of cases) {
    const list = byState.get(c.state) ?? [];
    list.push(c);
    byState.set(c.state, list);
  }
  return [...byState.entries()]
    .map(([state, list]) => {
      const risk = Math.round(list.reduce((s, c) => s + c.riskScore, 0) / list.length);
      const top = [...list].sort((a, b) => b.riskScore - a.riskScore)[0]!;
      return {
        state,
        cases: list.length,
        risk,
        hotspot: clusterById(top.clusterId)?.area ?? "—",
      };
    })
    .sort((a, b) => b.risk - a.risk);
}

function Nat() {
  const { cases, alerts } = useTrinity();
  const states = useStateAggregates(cases);
  const highRisk = [...cases].filter((c) => c.riskScore >= 75).sort((a, b) => b.riskScore - a.riskScore);
  const highAlerts = alerts.filter((a) => a.priority === "high");
  const clusterCount = new Set(cases.filter((c) => c.riskScore >= 75).map((c) => c.clusterId)).size;

  return (
    <div className="space-y-5">
      <header>
        <p className="label-xs">National synthetic overview</p>
        <h1 className="mt-1 text-2xl font-light">National Dashboard</h1>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Cases under prediction" value={cases.length} />
        <StatCard label="States reporting" value={states.length} />
        <StatCard label="High-risk clusters" value={clusterCount} tone="high" />
        <StatCard label="High-priority alerts" value={highAlerts.length} tone="medium" />
      </div>
      <Panel>
        <p className="label-xs">State-level risk index (live aggregate)</p>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={states}>
              <CartesianGrid stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="state" stroke="var(--color-muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
              <Tooltip {...chartTip} />
              <Bar dataKey="risk" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>
      <Panel>
        <p className="label-xs">Recent high-risk cases</p>
        <ul className="mt-3 space-y-2">
          {highRisk.slice(0, 6).map((c) => (
            <li key={c.caseId} className="flex flex-wrap items-center gap-3 text-sm">
              <span className="font-mono text-xs text-primary">{c.caseId}</span>
              <span className="text-xs text-muted-foreground">{c.state}</span>
              <span className="min-w-0 flex-1 truncate text-xs">
                {clusterById(c.clusterId)?.area ?? "—"}
              </span>
              <RiskPill score={c.riskScore} />
            </li>
          ))}
          {highRisk.length === 0 ? (
            <li className="text-xs text-muted-foreground">No high-risk cases in the current window.</li>
          ) : null}
        </ul>
      </Panel>
      <p className="text-[11px] text-muted-foreground">
        Aggregate-only national view on synthetic data. Victim references, institution names and
        money-flow detail are not exposed to this role.
      </p>
    </div>
  );
}

function IndiaMap() {
  const { cases } = useTrinity();
  const states = useStateAggregates(cases);
  return (
    <div className="space-y-5">
      <header>
        <p className="label-xs">Synthetic national view</p>
        <h1 className="mt-1 text-2xl font-light">India Risk Map</h1>
      </header>
      <div className="grid gap-4 lg:grid-cols-2">
        {states.map((s) => (
          <Panel key={s.state} className="panel-hover">
            <div className="flex items-center justify-between">
              <p className="text-sm">{s.state}</p>
              <RiskPill score={s.risk} level={riskLevel(s.risk)} />
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {s.cases} synthetic cases · Emerging hotspot: {s.hotspot}
            </p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary/70" style={{ width: `${s.risk}%` }} />
            </div>
          </Panel>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground">
        State-level aggregation of synthetic prototype predictions. No real geospatial intelligence.
      </p>
    </div>
  );
}

function Cross() {
  return (
    <div className="space-y-5">
      <header>
        <p className="label-xs">Multi-jurisdiction relationships</p>
        <h1 className="mt-1 text-2xl font-light">Cross-State Intelligence</h1>
      </header>
      <div className="space-y-3">
        {[
          {
            id: "REL-01",
            cases: ["NCRP-001", "NCRP-007"],
            note: "Shared mule network operating across Karnataka and Maharashtra synthetic zones.",
          },
          {
            id: "REL-02",
            cases: ["NCRP-004", "NCRP-002"],
            note: "Overlapping beneficiary accounts detected between Cluster 09 and Cluster 12.",
          },
          {
            id: "REL-03",
            cases: ["NCRP-003", "NCRP-008"],
            note: "Similar split-transaction pattern reported from Delhi NCR synthetic zone D-2.",
          },
        ].map((r) => (
          <Panel key={r.id}>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-primary">{r.id}</span>
              {r.cases.map((c) => (
                <span key={c} className="rounded-full border border-border px-2 py-0.5 font-mono text-[11px]">
                  {c}
                </span>
              ))}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{r.note}</p>
          </Panel>
        ))}
      </div>
    </div>
  );
}

function Prio() {
  const { alerts } = useTrinity();
  const high = alerts.filter((a) => a.priority === "high");
  return (
    <div className="space-y-5">
      <header>
        <p className="label-xs">National escalation queue</p>
        <h1 className="mt-1 text-2xl font-light">Priority Alerts</h1>
      </header>
      <div className="space-y-3">
        {high.map((a) => (
          <Panel key={a.id}>
            <div className="flex flex-wrap items-center gap-3">
              <RiskPill level={a.priority} label="HIGH PRIORITY" />
              <span className="font-mono text-xs text-primary">{a.caseId}</span>
              <span className="text-xs text-muted-foreground">
                {clusterById(a.clusterId)?.area} · {clusterById(a.clusterId)?.predictedTime}
              </span>
              <span className="ml-auto text-xs">{a.status}</span>
            </div>
            <p className="mt-2 text-sm">{a.note}</p>
          </Panel>
        ))}
        {high.length === 0 ? (
          <p className="text-xs text-muted-foreground">No high-priority alerts at present.</p>
        ) : null}
      </div>
    </div>
  );
}

function Access() {
  return (
    <div className="max-w-xl space-y-5">
      <header>
        <p className="label-xs">Governance</p>
        <h1 className="mt-1 text-2xl font-light">Audit &amp; Access</h1>
      </header>
      <Panel>
        <MetaRow k="Role" v="I4C analyst (prototype)" />
        <MetaRow k="Data scope" v="Aggregated national synthetic intelligence" />
        <MetaRow k="Case-level PII" v="Not accessible" />
        <MetaRow k="Activity logging" v="Enabled" />
      </Panel>
      <p className="text-[11px] text-muted-foreground">
        Role-based access limits this portal to aggregated intelligence. No victim identity or account
        credentials are exposed in any role.
      </p>
    </div>
  );
}
