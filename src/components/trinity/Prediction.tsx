import { useEffect, useRef, useState } from "react";
import { Play, Check, Loader2, MapPin, Clock, Building2, AlertTriangle } from "lucide-react";
import {
  clusterById,
  riskLevel,
  stationForCluster,
  type CaseRecord,
} from "@/lib/trinity/data";
import { ConfidenceBar, Panel, RiskPill } from "./ui";
import { cn } from "@/lib/utils";

export const PIPELINE_STEPS = [
  "Receiving case",
  "Analyzing money flow",
  "Finding connected accounts",
  "Matching historical patterns",
  "Analyzing geographic patterns",
  "Clustering ATM locations",
  "Calculating risk",
  "Ranking clusters",
  "Generating prediction",
  "Creating alert",
];

export function usePipeline(onComplete: () => void, onStep?: (index: number) => void) {
  const [step, setStep] = useState(-1);
  const [done, setDone] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const complete = useRef(onComplete);
  const stepCb = useRef(onStep);
  complete.current = onComplete;
  stepCb.current = onStep;

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const run = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setDone(false);
    setStep(0);
    PIPELINE_STEPS.forEach((_, i) => {
      timers.current.push(
        setTimeout(
          () => {
            setStep(i + 1);
            stepCb.current?.(i);
            if (i === PIPELINE_STEPS.length - 1) {
              setDone(true);
              complete.current();
            }
          },
          (i + 1) * 620,
        ),
      );
    });
  };

  return { step, done, running: step >= 0 && !done, run };
}

export function PipelinePanel({
  step,
  running,
  done,
  onRun,
}: {
  step: number;
  running: boolean;
  done: boolean;
  onRun: () => void;
}) {
  return (
    <Panel>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="label-xs">Prototype Predictive Model</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Transparent demo scoring pipeline — not trained on real government data.
          </p>
        </div>
        <button
          onClick={onRun}
          disabled={running}
          className="inline-flex shrink-0 items-center gap-2 rounded-md border border-primary/40 bg-primary/10 px-3.5 py-2 text-sm text-primary transition-colors hover:bg-primary/20 disabled:opacity-60"
        >
          {running ? <Loader2 className="size-3.5 animate-spin" /> : <Play className="size-3.5" />}
          {running ? "Running" : done ? "Re-run Prediction" : "Run Prediction"}
        </button>
      </div>

      <ol className="mt-5 grid gap-2 sm:grid-cols-2">
        {PIPELINE_STEPS.map((label, i) => {
          const state = step > i ? "done" : step === i ? "active" : "idle";
          return (
            <li
              key={label}
              className={cn(
                "flex items-center gap-2.5 rounded-md border px-3 py-2 text-xs transition-all duration-300",
                state === "done"
                  ? "border-primary/30 bg-primary/8 text-foreground"
                  : state === "active"
                    ? "border-primary/50 bg-primary/12 text-primary"
                    : "border-border/60 text-muted-foreground",
              )}
            >
              <span className="font-mono text-[10px] opacity-70">
                {String(i + 1).padStart(2, "0")}
              </span>
              {state === "done" ? (
                <Check className="size-3.5 text-primary" />
              ) : state === "active" ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <span className="size-3.5 rounded-full border border-current opacity-40" />
              )}
              {label}
            </li>
          );
        })}
      </ol>
    </Panel>
  );
}

export function WhereWhenCard({ record }: { record: CaseRecord }) {
  const cluster = clusterById(record.clusterId);
  const station = stationForCluster(record.clusterId);
  if (record.riskScore === 0) {
    return (
      <Panel className="text-sm text-muted-foreground">
        No prediction yet for this case. Run the prediction pipeline to generate a WHERE + WHEN
        forecast.
      </Panel>
    );
  }
  if (record.lowConfidence) {
    return (
      <Panel className="border-risk-medium/40">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 size-5 text-risk-medium" />
          <div>
            <p className="font-display text-lg text-risk-medium">Low confidence</p>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              Insufficient evidence for a reliable location prediction. Manual investigation
              recommended.
            </p>
            <div className="mt-3 flex gap-2">
              <RiskPill score={record.riskScore} />
              <RiskPill level="low" label={`Confidence ${record.confidence}%`} />
            </div>
          </div>
        </div>
      </Panel>
    );
  }
  const lvl = riskLevel(record.riskScore);
  return (
    <div className="panel overflow-hidden">
      <div
        className="grid gap-px bg-border/60 md:grid-cols-[1.3fr_1fr_0.8fr_0.8fr]"
        style={{ minHeight: 150 }}
      >
        <div className="bg-surface/70 p-5">
          <p className="label-xs flex items-center gap-1.5">
            <MapPin className="size-3" /> Where
          </p>
          <p className="mt-2 font-display text-2xl leading-tight">
            {cluster?.label} — {cluster?.area}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {cluster?.atmCount} ATMs in predicted cluster
          </p>
        </div>
        <div className="bg-surface/70 p-5">
          <p className="label-xs flex items-center gap-1.5">
            <Clock className="size-3" /> When
          </p>
          <p className="mt-2 font-display text-2xl leading-tight">{record.predictedTime}</p>
          <p className="mt-1 text-xs text-muted-foreground">Predicted cash-out window</p>
        </div>
        <div className="bg-surface/70 p-5">
          <p className="label-xs">Risk</p>
          <p
            className={cn(
              "mt-2 font-display text-3xl",
              lvl === "high"
                ? "text-risk-high"
                : lvl === "medium"
                  ? "text-risk-medium"
                  : "text-risk-low",
            )}
          >
            {record.riskScore}
            <span className="text-base text-muted-foreground">/100</span>
          </p>
        </div>
        <div className="bg-surface/70 p-5">
          <p className="label-xs">Confidence</p>
          <p className="mt-2 font-display text-3xl text-primary">{record.confidence}%</p>
          <div className="mt-2">
            <ConfidenceBar value={record.confidence} />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 border-t border-border/60 bg-surface-2/50 px-5 py-3 text-sm">
        <Building2 className="size-3.5 text-primary" />
        <span className="text-muted-foreground">Nearest police station:</span>
        <span>{station?.name}</span>
      </div>
    </div>
  );
}

export function ExplainPanel({ record }: { record: CaseRecord }) {
  if (!record.factors.length) {
    return (
      <Panel className="text-sm text-muted-foreground">
        Evidence factors appear once a prediction has been generated.
      </Panel>
    );
  }
  const max = Math.max(...record.factors.map((f) => f.points));
  return (
    <Panel>
      <p className="label-xs">Why this cluster?</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Illustrative demo scoring contributions — not claimed scientific weights.
      </p>
      <div className="mt-5 space-y-4">
        {record.factors.map((f) => (
          <div key={f.label}>
            <div className="flex items-baseline justify-between text-sm">
              <span>{f.label}</span>
              <span className="font-mono text-primary">+{f.points}</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary/70 transition-all duration-700"
                style={{ width: `${(f.points / max) * 100}%` }}
              />
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">{f.detail}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-4">
        <span className="text-sm">Final risk score</span>
        <RiskPill score={record.riskScore} />
      </div>
    </Panel>
  );
}

export function PredictionTimeline({
  record,
  activeStep,
}: {
  record: CaseRecord;
  activeStep: number;
}) {
  const base = record.complaintTime.slice(11);
  const [h, m] = base.split(":").map(Number);
  const stamp = (add: number) => {
    const total = (h ?? 10) * 60 + (m ?? 0) + add;
    return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
  };
  const events = [
    { t: stamp(0), label: "Complaint received" },
    { t: stamp(1), label: "Transaction analyzed" },
    { t: stamp(2), label: "Connected accounts identified" },
    { t: stamp(3), label: "Historical patterns matched" },
    { t: stamp(4), label: "ATM clusters generated" },
    {
      t: stamp(4),
      label: `${clusterById(record.clusterId)?.label ?? "Cluster"} ranked highest`,
    },
    { t: stamp(4), label: "Time window predicted" },
    { t: stamp(5), label: "Alert generated" },
  ];
  const reached = activeStep < 0 ? events.length : Math.ceil((activeStep / 10) * events.length);
  return (
    <Panel>
      <p className="label-xs">Prediction timeline</p>
      <ol className="mt-4 space-y-0">
        {events.map((e, i) => {
          const on = i < reached;
          return (
            <li key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    "mt-1.5 size-2 rounded-full transition-colors duration-500",
                    on ? "bg-primary" : "bg-muted",
                  )}
                />
                {i < events.length - 1 ? (
                  <span
                    className={cn(
                      "w-px flex-1 transition-colors duration-500",
                      on ? "bg-primary/40" : "bg-border",
                    )}
                  />
                ) : null}
              </div>
              <div className={cn("pb-4 transition-opacity duration-500", on ? "opacity-100" : "opacity-40")}>
                <p className="font-mono text-[11px] text-muted-foreground">{e.t}</p>
                <p className="text-sm">{e.label}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </Panel>
  );
}
