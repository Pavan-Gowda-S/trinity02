import { createFileRoute } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Map,
  Network,
  TrendingUp,
  BellRing,
  FolderSearch,
  FileText,
  ShieldCheck,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TabPortal } from "@/components/trinity/TabPortal";
import { Panel, RiskPill, StatCard, MetaRow } from "@/components/trinity/ui";
import {
  alertTrend,
  atmClusters,
  clusterById,
  inr,
  seedAlerts,
  seedCases,
  stateRisk,
} from "@/lib/trinity/data";

export const Route = createFileRoute("/i4c")({
  head: () => ({
    meta: [
      { title: "I4C Intelligence Dashboard — TRINITY Prototype" },
      {
        name: "description",
        content:
          "Prototype national view: state-level cybercrime risk, emerging hotspots, cross-state case relationships and alert trends on synthetic data.",
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
        { id: "trend", label: "Analytics & Trends", icon: <TrendingUp className="size-4" />, render: () => <Trends /> },
        { id: "alerts", label: "Priority Alerts", icon: <BellRing className="size-4" />, render: () => <Prio /> },
        { id: "cases", label: "Cases", icon: <FolderSearch className="size-4" />, render: () => <Cases /> },
        { id: "reports", label: "Reports", icon: <FileText className="size-4" />, render: () => <Reports /> },
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

function Nat() {
  const totalCases = stateRisk.reduce((s, r) => s + r.cases, 0);
  return (
    <div className="space-y-5">
      <header>
        <p className="label-xs">National synthetic overview</p>
        <h1 className="mt-1 text-2xl font-light">National Dashboard</h1>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Cases under prediction" value={totalCases} />
        <StatCard label="States reporting" value={stateRisk.length} />
        <StatCard label="High-risk clusters" value={atmClusters.filter((c) => c.riskScore >= 75).length} tone="high" />
        <StatCard label="Alerts this week" value={alertTrend.reduce((s, d) => s + d.alerts, 0)} tone="medium" />
      </div>
      <Panel>
        <p className="label-xs">State-level risk index</p>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stateRisk}>
              <CartesianGrid stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="state" stroke="var(--color-muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
              <Tooltip {...chartTip} />
              <Bar dataKey="risk" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>
    </div>
  );
}

function IndiaMap() {
  return (
    <div className="space-y-5">
      <header>
        <p className="label-xs">Synthetic national view</p>
        <h1 className="mt-1 text-2xl font-light">India Risk Map</h1>
      </header>
      <div className="grid gap-4 lg:grid-cols-2">
        {stateRisk.map((s) => (
          <Panel key={s.state} className="panel-hover">
            <div className="flex items-center justify-between">
              <p className="text-sm">{s.state}</p>
              <RiskPill score={s.risk} />
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

function Trends() {
  return (
    <div className="space-y-5">
      <header>
        <p className="label-xs">Weekly synthetic trend</p>
        <h1 className="mt-1 text-2xl font-light">Analytics &amp; Trends</h1>
      </header>
      <Panel>
        <p className="label-xs">Alert volume and high-priority share</p>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={alertTrend}>
              <CartesianGrid stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
              <Tooltip {...chartTip} />
              <Line type="monotone" dataKey="alerts" stroke="var(--color-primary)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="high" stroke="var(--color-risk-high)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Panel>
      <Panel>
        <p className="label-xs">High-priority clusters</p>
        <ul className="mt-3 space-y-2">
          {[...atmClusters]
            .sort((a, b) => b.riskScore - a.riskScore)
            .slice(0, 4)
            .map((c) => (
              <li key={c.id} className="flex items-center gap-3 text-sm">
                <span className="min-w-0 flex-1 truncate">
                  {c.label} — {c.area}
                </span>
                <span className="text-[11px] text-muted-foreground">{c.predictedTime}</span>
                <RiskPill score={c.riskScore} />
              </li>
            ))}
        </ul>
      </Panel>
    </div>
  );
}

function Prio() {
  return (
    <div className="space-y-5">
      <header>
        <p className="label-xs">National escalation queue</p>
        <h1 className="mt-1 text-2xl font-light">Priority Alerts</h1>
      </header>
      <div className="space-y-3">
        {seedAlerts
          .filter((a) => a.priority === "high")
          .map((a) => (
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
      </div>
    </div>
  );
}

function Cases() {
  return (
    <div className="space-y-5">
      <header>
        <p className="label-xs">Aggregated synthetic cases</p>
        <h1 className="mt-1 text-2xl font-light">Cases</h1>
      </header>
      <Panel className="overflow-x-auto p-0 scroll-slim">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-border/60 text-left">
              {["Case ID", "State", "Amount", "Risk", "Predicted zone", "Status"].map((h) => (
                <th key={h} className="label-xs px-4 py-3 font-normal">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {seedCases.map((c) => (
              <tr key={c.caseId} className="border-b border-border/40 last:border-0">
                <td className="px-4 py-2.5 font-mono text-xs text-primary">{c.caseId}</td>
                <td className="px-4 py-2.5 text-xs">{c.state}</td>
                <td className="px-4 py-2.5">{inr(c.amount)}</td>
                <td className="px-4 py-2.5">
                  <RiskPill score={c.riskScore} />
                </td>
                <td className="px-4 py-2.5 text-xs">{clusterById(c.clusterId)?.area}</td>
                <td className="px-4 py-2.5 text-xs text-muted-foreground">{c.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}

function Reports() {
  return (
    <div className="space-y-5">
      <header>
        <p className="label-xs">National summaries</p>
        <h1 className="mt-1 text-2xl font-light">Reports</h1>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        {[
          { id: "RPT-N-01", title: "Weekly national cash-out risk digest", period: "Week 10, 2026" },
          { id: "RPT-N-02", title: "Emerging hotspot advisory — Karnataka", period: "March 2026" },
          { id: "RPT-N-03", title: "Cross-state mule network overview", period: "Q1 2026" },
          { id: "RPT-N-04", title: "Prototype model factor review", period: "March 2026" },
        ].map((r) => (
          <Panel key={r.id} className="panel-hover">
            <p className="font-mono text-[11px] text-muted-foreground">{r.id}</p>
            <p className="mt-1 text-sm">{r.title}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">{r.period} · Synthetic</p>
          </Panel>
        ))}
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
