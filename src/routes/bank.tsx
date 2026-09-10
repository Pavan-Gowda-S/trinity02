import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  LayoutDashboard,
  BellRing,
  MapPin,
  ArrowLeftRight,
  Link2,
  CheckCircle2,
  History,
} from "lucide-react";
import { TabPortal } from "@/components/trinity/TabPortal";
import { Panel, RiskPill, StatCard, MetaRow } from "@/components/trinity/ui";
import { buildFlow, clusterById, inr, seedCases, atms } from "@/lib/trinity/data";
import { useTrinity } from "@/lib/trinity/store";

export const Route = createFileRoute("/bank")({
  head: () => ({
    meta: [
      { title: "Bank / FI Advisory Portal — TRINITY Prototype" },
      {
        name: "description",
        content:
          "Prototype bank/financial-institution view of TRINITY cash-out risk advisories limited to the institution's own network.",
      },
      { property: "og:title", content: "Bank / FI Advisory Portal — TRINITY Prototype" },
      {
        property: "og:description",
        content: "Network-relevant cash-out risk advisories on synthetic demo data.",
      },
    ],
  }),
  component: BankPortal,
});

const BANK = "Synthetic National Bank";

function bankCases() {
  return seedCases.filter((c) => c.bank === BANK);
}

function BankPortal() {
  return (
    <TabPortal
      role="bank"
      portalName="Bank / FI Advisory"
      portalTag={BANK}
      tabs={[
        { id: "dash", label: "Dashboard", icon: <LayoutDashboard className="size-4" />, render: () => <Dash /> },
        { id: "alerts", label: "Alerts", icon: <BellRing className="size-4" />, render: () => <Alerts /> },
        { id: "atm", label: "ATM/Location Risk", icon: <MapPin className="size-4" />, render: () => <AtmRisk /> },
        {
          id: "txn",
          label: "Relevant Transactions",
          icon: <ArrowLeftRight className="size-4" />,
          render: () => <Txns />,
        },
        { id: "linked", label: "Linked Cases", icon: <Link2 className="size-4" />, render: () => <Linked /> },
        {
          id: "action",
          label: "Action Status",
          icon: <CheckCircle2 className="size-4" />,
          render: () => <ActionStatus />,
        },
        { id: "history", label: "Alert History", icon: <History className="size-4" />, render: () => <Hist /> },
      ]}
    />
  );
}

function Notice() {
  return (
    <p className="text-[11px] text-muted-foreground">
      Scope-limited view: only information relevant to {BANK}'s own network is shown. Police
      investigation detail, victim identity and full case intelligence are not exposed to this role.
    </p>
  );
}

function Dash() {
  const { alerts } = useTrinity();
  const mine = bankCases();
  const relevant = alerts.filter((a) => mine.some((c) => c.caseId === a.caseId));
  return (
    <div className="space-y-5">
      <header>
        <p className="label-xs">Institution overview</p>
        <h1 className="mt-1 text-2xl font-light">Cash-out risk advisories</h1>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Advisories received" value={relevant.length} />
        <StatCard
          label="High priority"
          value={relevant.filter((a) => a.priority === "high").length}
          tone="high"
        />
        <StatCard label="Linked cases" value={mine.length} />
        <StatCard
          label="Open actions"
          value={relevant.filter((a) => a.status === "New").length}
          tone="medium"
        />
      </div>
      <Panel>
        <p className="text-sm">
          High-risk cash-out prediction associated with your network — review flagged ATMs and
          beneficiary accounts in the relevant tabs.
        </p>
      </Panel>
      <Notice />
    </div>
  );
}

function Alerts() {
  const { alerts } = useTrinity();
  const mine = bankCases();
  const relevant = alerts.filter((a) => mine.some((c) => c.caseId === a.caseId));
  return (
    <div className="space-y-5">
      <header>
        <p className="label-xs">Advisories</p>
        <h1 className="mt-1 text-2xl font-light">Alerts</h1>
      </header>
      <div className="space-y-3">
        {relevant.map((a) => {
          const cluster = clusterById(a.clusterId);
          const c = mine.find((x) => x.caseId === a.caseId);
          return (
            <Panel key={a.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <RiskPill level={a.priority} label={`${a.priority.toUpperCase()} PRIORITY`} />
                <span className="font-mono text-xs text-primary">Ref {a.caseId}</span>
                <span className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
                  {a.status}
                </span>
              </div>
              <p className="mt-3 text-sm">
                High-risk cash-out prediction associated with your network.
              </p>
              <div className="mt-3 grid gap-x-8 gap-y-1 text-xs text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
                <span>
                  Predicted zone · <span className="text-foreground">{cluster?.area}</span>
                </span>
                <span>
                  Time window · <span className="text-foreground">{cluster?.predictedTime}</span>
                </span>
                <span>
                  Risk · <span className="text-foreground">{c?.riskScore}/100</span>
                </span>
                <span>
                  ATMs in zone · <span className="text-foreground">{cluster?.atmCount}</span>
                </span>
              </div>
              <button
                onClick={() => toast.success("Advisory acknowledged by bank/FI")}
                className="mt-3 rounded-md border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs text-primary"
              >
                Acknowledge advisory
              </button>
            </Panel>
          );
        })}
      </div>
      <Notice />
    </div>
  );
}

function AtmRisk() {
  const mine = bankCases();
  const clusterIds = [...new Set(mine.map((c) => c.clusterId))];
  return (
    <div className="space-y-5">
      <header>
        <p className="label-xs">Network exposure</p>
        <h1 className="mt-1 text-2xl font-light">ATM / Location Risk</h1>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        {clusterIds.map((id) => {
          const c = clusterById(id)!;
          return (
            <Panel key={id}>
              <div className="flex items-center justify-between">
                <p className="text-sm">
                  {c.label} — {c.area}
                </p>
                <RiskPill score={c.riskScore} />
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Predicted window {c.predictedTime} · Confidence {c.confidence}%
              </p>
              <ul className="mt-3 space-y-1 text-xs">
                {atms
                  .filter((a) => a.clusterId === id)
                  .map((a) => (
                    <li key={a.id} className="flex justify-between">
                      <span className="font-mono text-muted-foreground">{a.id}</span>
                      <span>{a.label}</span>
                    </li>
                  ))}
              </ul>
            </Panel>
          );
        })}
      </div>
      <Notice />
    </div>
  );
}

function Txns() {
  const mine = bankCases();
  return (
    <div className="space-y-5">
      <header>
        <p className="label-xs">Masked identifiers only</p>
        <h1 className="mt-1 text-2xl font-light">Relevant Transactions</h1>
      </header>
      <Panel className="overflow-x-auto p-0 scroll-slim">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-border/60 text-left">
              {["Case ref", "From", "To", "Amount", "Time", "Pattern"].map((h) => (
                <th key={h} className="label-xs px-4 py-3 font-normal">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mine.flatMap((c) =>
              buildFlow(c)
                .edges.filter((e) => e.relationship !== "Secondary cash-out path")
                .slice(0, 4)
                .map((e, i) => (
                  <tr key={`${c.caseId}-${i}`} className="border-b border-border/40 last:border-0">
                    <td className="px-4 py-2.5 font-mono text-xs text-primary">{c.caseId}</td>
                    <td className="px-4 py-2.5 font-mono text-xs">{e.from}</td>
                    <td className="px-4 py-2.5 font-mono text-xs">{e.to}</td>
                    <td className="px-4 py-2.5">{inr(e.amount)}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                      {e.timestamp}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">{e.relationship}</td>
                  </tr>
                )),
            )}
          </tbody>
        </table>
      </Panel>
      <Notice />
    </div>
  );
}

function Linked() {
  const mine = bankCases();
  return (
    <div className="space-y-5">
      <header>
        <p className="label-xs">Case references</p>
        <h1 className="mt-1 text-2xl font-light">Linked Cases</h1>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        {mine.map((c) => (
          <Panel key={c.caseId}>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-primary">{c.caseId}</span>
              <RiskPill score={c.riskScore} />
            </div>
            <MetaRow k="Amount" v={inr(c.amount)} />
            <MetaRow k="Predicted zone" v={clusterById(c.clusterId)?.area ?? "—"} />
            <MetaRow k="Time window" v={c.predictedTime} />
            <MetaRow k="Status" v={c.status} />
          </Panel>
        ))}
      </div>
      <Notice />
    </div>
  );
}

function ActionStatus() {
  const { alerts } = useTrinity();
  const mine = bankCases();
  const relevant = alerts.filter((a) => mine.some((c) => c.caseId === a.caseId));
  return (
    <div className="space-y-5">
      <header>
        <p className="label-xs">Institution response</p>
        <h1 className="mt-1 text-2xl font-light">Action Status</h1>
      </header>
      <Panel className="p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 text-left">
              {["Advisory", "Case ref", "Priority", "Status", "Created"].map((h) => (
                <th key={h} className="label-xs px-4 py-3 font-normal">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {relevant.map((a) => (
              <tr key={a.id} className="border-b border-border/40 last:border-0">
                <td className="px-4 py-2.5 font-mono text-xs">{a.id}</td>
                <td className="px-4 py-2.5 font-mono text-xs text-primary">{a.caseId}</td>
                <td className="px-4 py-2.5">
                  <RiskPill level={a.priority} label={a.priority} />
                </td>
                <td className="px-4 py-2.5 text-xs">{a.status}</td>
                <td className="px-4 py-2.5 font-mono text-[11px] text-muted-foreground">
                  {a.createdAt}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
      <Notice />
    </div>
  );
}

function Hist() {
  const { alerts } = useTrinity();
  const mine = bankCases();
  const relevant = alerts.filter((a) => mine.some((c) => c.caseId === a.caseId));
  return (
    <div className="space-y-5">
      <header>
        <p className="label-xs">Archive</p>
        <h1 className="mt-1 text-2xl font-light">Alert History</h1>
      </header>
      <div className="space-y-2">
        {relevant.map((a) => (
          <Panel key={a.id} className="flex flex-wrap items-center gap-3 py-3 text-sm">
            <span className="font-mono text-[11px] text-muted-foreground">{a.createdAt}</span>
            <span className="font-mono text-xs text-primary">{a.caseId}</span>
            <span className="text-muted-foreground">{clusterById(a.clusterId)?.area}</span>
            <span className="ml-auto text-xs">{a.status}</span>
          </Panel>
        ))}
      </div>
      <Notice />
    </div>
  );
}
