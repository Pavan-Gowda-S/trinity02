import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";
import { Download, Printer } from "lucide-react";
import {
  buildFlow,
  clusterById,
  historicalCases,
  inr,
  stationForCluster,
} from "@/lib/trinity/data";
import { useTrinity } from "@/lib/trinity/store";
import { BackLink, Panel, RiskPill } from "@/components/trinity/ui";
import { cn } from "@/lib/utils";

const searchSchema = z.object({ caseId: z.string().optional() });

export const Route = createFileRoute("/trinity/reports")({
  validateSearch: searchSchema,
  component: ReportsPage,
});

function ReportsPage() {
  const { caseId } = Route.useSearch();
  const { cases, alerts, log } = useTrinity();
  const navigate = useNavigate();
  const selected = cases.find((c) => c.caseId === caseId) ?? cases[0];

  if (!selected) return <Panel>No cases available.</Panel>;

  const cluster = clusterById(selected.clusterId);
  const station = stationForCluster(selected.clusterId);
  const alert = alerts.find((a) => a.caseId === selected.caseId);
  const { edges } = buildFlow(selected);
  const splits = edges.filter((e) => e.relationship === "Split distribution");
  const similar = historicalCases.filter((h) => selected.similarCases.includes(h.id));

  return (
    <div className="space-y-5">
      <BackLink fallback="/trinity" />
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label-xs">Synthetic intelligence report</p>
          <h1 className="mt-1 text-2xl font-light">Reports</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              log("Intelligence report generated", selected.caseId);
              toast.success("Report generated", { description: `${selected.caseId} · synthetic` });
            }}
            className="rounded-md border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs text-primary"
          >
            Generate
          </button>
          <button
            onClick={() => {
              log("Intelligence report exported (print / PDF)", selected.caseId);
              window.print();
            }}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs hover:border-primary/40"
          >
            <Download className="size-3.5" /> Download PDF
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs hover:border-primary/40"
          >
            <Printer className="size-3.5" /> Print
          </button>
        </div>
      </header>

      <div className="flex flex-wrap gap-1.5">
        {cases.map((c) => (
          <button
            key={c.caseId}
            onClick={() => void navigate({ to: "/trinity/reports", search: { caseId: c.caseId } })}
            className={cn(
              "rounded-full border px-3 py-1 font-mono text-[11px]",
              c.caseId === selected.caseId
                ? "border-primary/50 bg-primary/10 text-primary"
                : "border-border text-muted-foreground",
            )}
          >
            {c.caseId}
          </button>
        ))}
      </div>

      <Panel className="p-7">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border/60 pb-5">
          <div>
            <p className="font-display tracking-[0.2em] text-primary">TRINITY</p>
            <p className="text-xs text-muted-foreground">
              Predictive Cybercrime Intelligence — Prototype Report
            </p>
          </div>
          <div className="text-right text-[11px] text-muted-foreground">
            <p>Case {selected.caseId}</p>
            <p>Generated {new Date().toISOString().slice(0, 16).replace("T", " ")}</p>
            <p>Synthetic demo data · Not for operational use</p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <section>
            <p className="label-xs">Case summary</p>
            <dl className="mt-2 space-y-1.5 text-sm">
              <Row k="Case ID" v={selected.caseId} />
              <Row k="Crime category" v={selected.crimeType} />
              <Row k="Fraud amount" v={inr(selected.amount)} />
              <Row k="Complaint received" v={selected.complaintTime} />
              <Row k="Status" v={selected.status} />
            </dl>

            <p className="label-xs mt-6">Risk level</p>
            <div className="mt-2 flex items-center gap-3">
              <RiskPill score={selected.riskScore} />
              <span className="text-sm text-muted-foreground">
                Confidence {selected.confidence}%
              </span>
            </div>

            <p className="label-xs mt-6">Money-flow summary</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {inr(selected.amount)} transferred from victim reference {selected.victimRef} through 2
              layering accounts, then split across {splits.length} mule accounts:
            </p>
            <ul className="mt-2 space-y-1 text-xs">
              {splits.map((s, i) => (
                <li key={i} className="flex justify-between font-mono">
                  <span className="text-muted-foreground">{s.to}</span>
                  <span>{inr(s.amount)}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <p className="label-xs">Prediction</p>
            <dl className="mt-2 space-y-1.5 text-sm">
              <Row
                k="Predicted cluster"
                v={selected.lowConfidence ? "Not determinable" : `${cluster?.label} — ${cluster?.area}`}
              />
              <Row k="Predicted time window" v={selected.predictedTime} />
              <Row k="ATMs in cluster" v={String(cluster?.atmCount ?? "—")} />
              <Row k="Nearest police station" v={station?.name ?? "—"} />
              <Row k="Alert status" v={alert?.status ?? "No alert"} />
            </dl>

            <p className="label-xs mt-6">Risk factors</p>
            <ul className="mt-2 space-y-1 text-sm">
              {selected.factors.map((f) => (
                <li key={f.label} className="flex justify-between">
                  <span className="text-muted-foreground">{f.label}</span>
                  <span className="font-mono text-primary">+{f.points}</span>
                </li>
              ))}
              <li className="flex justify-between border-t border-border/60 pt-1">
                <span>Final risk</span>
                <span className="font-mono">{selected.riskScore}/100</span>
              </li>
            </ul>

            <p className="label-xs mt-6">Similar synthetic cases</p>
            <ul className="mt-2 space-y-1 text-xs">
              {similar.length ? (
                similar.map((h) => (
                  <li key={h.id} className="flex justify-between">
                    <span className="font-mono text-muted-foreground">{h.id}</span>
                    <span>
                      {h.area} · {inr(h.amount)} · {h.timestamp}
                    </span>
                  </li>
                ))
              ) : (
                <li className="text-muted-foreground">None</li>
              )}
            </ul>
          </section>
        </div>

        {selected.lowConfidence ? (
          <p className="mt-6 rounded-md border border-risk-medium/40 bg-risk-medium/10 p-3 text-xs text-risk-medium">
            Low confidence: insufficient evidence for a reliable location prediction. Manual
            investigation recommended.
          </p>
        ) : null}

        <p className="mt-6 border-t border-border/60 pt-4 text-[11px] leading-relaxed text-muted-foreground">
          Produced by the TRINITY Prototype Predictive Model on synthetic demo data. This report is
          not derived from NCRP, I4C, CFCFRMS, bank or police systems, and contains no real personal,
          account or financial information.
        </p>
      </Panel>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="text-right">{v}</dd>
    </div>
  );
}
