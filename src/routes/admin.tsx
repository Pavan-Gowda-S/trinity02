import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Users, SlidersHorizontal, ScrollText } from "lucide-react";
import { TabPortal } from "@/components/trinity/TabPortal";
import { MetaRow, Panel } from "@/components/trinity/ui";
import { useTrinity } from "@/lib/trinity/store";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Console — TRINITY Prototype" },
      {
        name: "description",
        content:
          "Prototype admin console: demo user/role management, model factor configuration and system audit log.",
      },
      { property: "og:title", content: "Admin Console — TRINITY Prototype" },
      {
        property: "og:description",
        content: "Demo role management and prototype model configuration for TRINITY.",
      },
    ],
  }),
  component: AdminPortal,
});

function AdminPortal() {
  return (
    <TabPortal
      role="admin"
      portalName="Administration"
      portalTag="System owner"
      tabs={[
        { id: "users", label: "Users & Roles", icon: <Users className="size-4" />, render: () => <UsersTab /> },
        {
          id: "config",
          label: "System Configuration",
          icon: <SlidersHorizontal className="size-4" />,
          render: () => <ConfigTab />,
        },
        { id: "audit", label: "Audit Logs", icon: <ScrollText className="size-4" />, render: () => <AuditTab /> },
      ]}
    />
  );
}

const USERS = [
  { id: "USR-01", name: "Demo Citizen", role: "NCRP / Citizen", scope: "Own complaints only" },
  { id: "USR-02", name: "Investigator K. Rao", role: "Police / LEA", scope: "Authorized demo cases" },
  { id: "USR-03", name: "Bank Officer S. Iyer", role: "Bank / FI", scope: "Network-relevant advisories" },
  { id: "USR-04", name: "I4C Analyst M. Verma", role: "I4C", scope: "Aggregated national data" },
  { id: "USR-05", name: "System Admin", role: "Admin", scope: "Roles, config, audit" },
];

function UsersTab() {
  return (
    <div className="space-y-5">
      <header>
        <p className="label-xs">Demo directory</p>
        <h1 className="mt-1 text-2xl font-light">Users &amp; Roles</h1>
      </header>
      <Panel className="overflow-x-auto p-0 scroll-slim">
        <table className="w-full min-w-[620px] text-sm">
          <thead>
            <tr className="border-b border-border/60 text-left">
              {["User ID", "Name", "Role", "Data scope"].map((h) => (
                <th key={h} className="label-xs px-4 py-3 font-normal">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {USERS.map((u) => (
              <tr key={u.id} className="border-b border-border/40 last:border-0">
                <td className="px-4 py-2.5 font-mono text-xs text-primary">{u.id}</td>
                <td className="px-4 py-2.5">{u.name}</td>
                <td className="px-4 py-2.5 text-xs">{u.role}</td>
                <td className="px-4 py-2.5 text-xs text-muted-foreground">{u.scope}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
      <p className="text-[11px] text-muted-foreground">
        Prototype directory only — no real accounts, credentials or identities.
      </p>
    </div>
  );
}

const FACTORS = [
  { key: "Historical pattern", weight: 25 },
  { key: "Recent activity", weight: 20 },
  { key: "Geographic proximity", weight: 18 },
  { key: "Time similarity", weight: 15 },
  { key: "Similar cases", weight: 13 },
];

function ConfigTab() {
  const [weights, setWeights] = useState(FACTORS);
  return (
    <div className="max-w-2xl space-y-5">
      <header>
        <p className="label-xs">Prototype Predictive Model</p>
        <h1 className="mt-1 text-2xl font-light">System Configuration</h1>
      </header>
      <Panel>
        <p className="text-sm text-muted-foreground">
          Demo scoring factors used to rank ATM clusters. These are illustrative configuration values
          for the prototype, not scientifically validated weights, and the model is not trained on
          real government data.
        </p>
        <div className="mt-5 space-y-4">
          {weights.map((f, i) => (
            <div key={f.key}>
              <div className="flex justify-between text-sm">
                <span>{f.key}</span>
                <span className="font-mono text-primary">{f.weight}</span>
              </div>
              <input
                type="range"
                min={0}
                max={40}
                value={f.weight}
                onChange={(e) =>
                  setWeights((w) =>
                    w.map((x, xi) => (xi === i ? { ...x, weight: Number(e.target.value) } : x)),
                  )
                }
                className="mt-2 w-full accent-primary"
              />
            </div>
          ))}
        </div>
        <div className="mt-5 flex justify-between border-t border-border/60 pt-4 text-sm">
          <span>Maximum achievable score</span>
          <span className="font-mono text-primary">
            {weights.reduce((s, f) => s + f.weight, 0)}
          </span>
        </div>
      </Panel>
      <Panel>
        <MetaRow k="Demo geography" v="Bengaluru (synthetic)" />
        <MetaRow k="Data source" v="Internal synthetic dataset" />
        <MetaRow k="External integrations" v="Simulated only" />
      </Panel>
    </div>
  );
}

function AuditTab() {
  const { audit } = useTrinity();
  return (
    <div className="space-y-5">
      <header>
        <p className="label-xs">Full system trail</p>
        <h1 className="mt-1 text-2xl font-light">Audit Logs</h1>
      </header>
      <Panel className="p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 text-left">
              {["Time", "Role", "Action", "Case ID"].map((h) => (
                <th key={h} className="label-xs px-4 py-3 font-normal">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {audit.map((a) => (
              <tr key={a.id} className="border-b border-border/40 last:border-0">
                <td className="px-4 py-2.5 font-mono text-[11px] text-muted-foreground">{a.time}</td>
                <td className="px-4 py-2.5 text-xs">{a.role}</td>
                <td className="px-4 py-2.5">{a.action}</td>
                <td className="px-4 py-2.5 font-mono text-xs text-primary">{a.caseId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}
