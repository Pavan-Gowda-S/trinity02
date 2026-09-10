import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BellRing, FileText } from "lucide-react";
import {
  clusterById,
  atmClusters,
  historicalCases,
  inr,
  riskLevel,
  stationForCluster,
  type AtmCluster,
} from "@/lib/trinity/data";
import { useTrinity } from "@/lib/trinity/store";
import { BackLink, MetaRow, Panel, RiskPill, SectionTitle } from "@/components/trinity/ui";
import { runPredictionEngine, type PredictionResult } from "@/lib/trinity/engine";
import { MoneyFlowGraph, SplitTransactionView } from "@/components/trinity/MoneyFlowGraph";
import {
  ExplainPanel,
  PipelinePanel,
  PredictionTimeline,
  WhereWhenCard,
  usePipeline,
} from "@/components/trinity/Prediction";
import { RiskMap } from "@/components/trinity/RiskMap";
import { ClusterDetail } from "@/components/trinity/ClusterDetail";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/trinity/cases/$caseId")({
  component: CaseIntelligence,
});

function CaseIntelligence() {
  const { caseId } = useParams({ from: "/trinity/cases/$caseId" });
  const { cases, log, addAlert, setAlertStatus, alerts, updateCase } = useTrinity();
  const record = cases.find((c) => c.caseId === caseId);
  const [openCluster, setOpenCluster] = useState<AtmCluster | null>(null);
  const [focusCluster, setFocusCluster] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);

  const pipeline = usePipeline(
    () => {
      if (!record) return;
      // Prototype Predictive Model — recomputed live from the case's synthetic
      // money-flow, timing, geography and ATM clustering signals.
      const out = runPredictionEngine(record);
      setResult(out);
      setFocusCluster(out.clusterId);
      updateCase(caseId, {
        clusterId: out.clusterId,
        riskScore: out.riskScore,
        confidence: out.confidence,
        predictedTime: out.predictedTime,
        factors: out.factors,
        similarCases: out.similarCases,
        lowConfidence: out.lowConfidence,
        status: "Active",
      });
      addAlert({
        id: `ALT-${Math.floor(Math.random() * 9000 + 1000)}`,
        caseId,
        clusterId: out.clusterId,
        priority: out.priority,
        status: "New",
        createdAt: new Date().toISOString().slice(0, 16).replace("T", " "),
        note: out.lowConfidence
          ? "Insufficient evidence for reliable location prediction — manual investigation recommended."
          : `Potential cash-out activity predicted in ${clusterById(out.clusterId)?.label} (${clusterById(out.clusterId)?.area}), ${out.predictedTime}.`,
      });
      log(
        `Prediction generated — ${clusterById(out.clusterId)?.label}, risk ${out.riskScore}/100, confidence ${out.confidence}%`,
        caseId,
        "Prototype Predictive Model",
      );
      log(`Alert routed to ${out.stationName}`, caseId, "System");
      toast.success(
        out.lowConfidence
          ? "Prediction complete — low confidence"
          : `Prediction generated — ${clusterById(out.clusterId)?.label} · Risk ${out.riskScore}/100`,
        {
          description: out.lowConfidence
            ? "Manual investigation recommended."
            : `${out.predictedTime} · Confidence ${out.confidence}% · ${out.stationName}`,
        },
      );
    },
    (index) => {
      if (index === 1) log("Money-flow analysis started on synthetic transactions", caseId, "Prototype Predictive Model");
      if (index === 5) log("ATM clustering completed for Bengaluru demo grid", caseId, "Prototype Predictive Model");
    },
  );

  useEffect(() => {
    if (record) log("Investigator opened case intelligence workspace", caseId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  if (!record) {
    return (
      <Panel>
        <p className="text-sm">Case not found in the demo dataset.</p>
        <Link to="/trinity/cases" className="mt-3 inline-block text-xs text-primary">
          ← Back to cases
        </Link>
      </Panel>
    );
  }

  const ranked = (
    result
      ? result.ranked.map((r) => ({ ...r.cluster, riskScore: r.score, confidence: r.confidence, predictedTime: r.predictedTime }))
      : [...atmClusters].sort((a, b) => b.riskScore - a.riskScore)
  ).slice(0, 3);
  const caseAlert = alerts.find((a) => a.caseId === caseId && a.status !== "Closed");
  const similar = historicalCases.filter((h) => record.similarCases.includes(h.id));

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <BackLink fallback="/trinity/cases" label="Back to cases" />
        <div className="flex gap-2">
          {caseAlert ? (
            <button
              onClick={() => {
                setAlertStatus(caseAlert.id, "Acknowledged");
                log("Alert acknowledged", caseId);
                toast.success("Alert acknowledged");
              }}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs hover:border-primary/40"
            >
              <BellRing className="size-3.5" /> Acknowledge alert
            </button>
          ) : null}
          <Link
            to="/trinity/reports"
            search={{ caseId }}
            className="inline-flex items-center gap-1.5 rounded-md border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs text-primary"
          >
            <FileText className="size-3.5" /> Generate report
          </Link>
        </div>
      </div>

      <header className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        <Panel>
          <p className="label-xs">Case overview</p>
          <h1 className="mt-1 font-display text-2xl">{record.caseId}</h1>
          <div className="mt-3">
            <MetaRow k="Fraud amount" v={inr(record.amount)} />
            <MetaRow k="Complaint received" v={record.complaintTime} />
            <MetaRow k="Crime category" v={record.crimeType} />
            <MetaRow k="Current status" v={record.status} />
            <MetaRow k="Victim reference" v={<span className="font-mono">{record.victimRef}</span>} />
            <MetaRow k="Reporting bank" v={record.bank} />
          </div>
        </Panel>
        <div className="space-y-4">
          <WhereWhenCard record={record} />
          {result ? (
            <Panel className="text-sm text-muted-foreground">
              <p className="label-xs">Prototype Predictive Model — reasoning</p>
              <p className="mt-2">{result.narrative}</p>
            </Panel>
          ) : null}
          <PipelinePanel
            step={pipeline.step}
            running={pipeline.running}
            done={pipeline.done}
            onRun={pipeline.run}
          />
        </div>
      </header>

      <section>
        <SectionTitle
          title="Money-flow graph"
          hint="TRINITY connects financial dots before predicting a location — masked synthetic identifiers only"
        />
        <MoneyFlowGraph record={record} />
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <SplitTransactionView record={record} />
        <PredictionTimeline record={record} activeStep={pipeline.step} />
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
        <ExplainPanel record={record} />
        <div className="space-y-4">
          <div>
            <SectionTitle title="Ranked ATM clusters" hint="Cluster-level prediction, never a single ATM" />
            <div className="space-y-2">
              {ranked.map((c, i) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setOpenCluster(c);
                    setFocusCluster(c.id);
                  }}
                  className={cn(
                    "panel panel-hover flex w-full items-center gap-4 p-4 text-left",
                    c.id === record.clusterId && "border-primary/40",
                  )}
                >
                  <span className="font-mono text-xs text-muted-foreground">
                    #{String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">
                      {c.label} — {c.area}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {c.atmCount} ATMs · Confidence {c.confidence}% · {c.predictedTime}
                    </p>
                  </div>
                  <RiskPill score={c.riskScore} />
                </button>
              ))}
            </div>
          </div>
          <RiskMap
            focusId={focusCluster}
            selectedId={openCluster?.id ?? record.clusterId}
            onSelect={setOpenCluster}
            height={280}
          />
        </div>
      </section>

      {openCluster ? (
        <ClusterDetail cluster={openCluster} onClose={() => setOpenCluster(null)} />
      ) : null}

      <section className="grid gap-5 lg:grid-cols-2">
        <Panel>
          <p className="label-xs">Similar synthetic cases</p>
          {similar.length ? (
            <ul className="mt-3 space-y-2">
              {similar.map((h) => (
                <li key={h.id} className="flex items-center justify-between text-sm">
                  <span className="font-mono text-xs text-primary">{h.id}</span>
                  <span className="text-muted-foreground">{h.area}</span>
                  <span>{inr(h.amount)}</span>
                  <span className="font-mono text-[11px] text-muted-foreground">{h.timestamp}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              No strong historical analogue found for this money-flow shape.
            </p>
          )}
        </Panel>
        <Panel>
          <p className="label-xs">Action</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Actionable intelligence is routed to the nearest jurisdiction unit for review. This
            prototype does not dispatch teams or contact any real agency.
          </p>
          <p className="mt-4 text-sm">
            Nearest police station:{" "}
            <span className="text-primary">{stationForCluster(record.clusterId)?.name}</span>
          </p>
          <Link to="/trinity/alerts" className="mt-4 inline-block text-xs text-primary">
            Open alerts →
          </Link>
        </Panel>
      </section>
    </div>
  );
}
