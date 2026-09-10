/**
 * TRINITY — Prototype Predictive Model (transparent demo scoring engine).
 *
 * This is a deterministic, fully explainable heuristic engine that runs in the
 * browser over synthetic demo data. It is NOT a trained machine-learning model
 * and it does not use, access or represent real NCRP / I4C / CFCFRMS / bank /
 * police data. Every score below is illustrative.
 */
import {
  atmClusters,
  buildFlow,
  historicalCases,
  riskLevel,
  stationForCluster,
  type AtmCluster,
  type CaseRecord,
  type RiskFactor,
  type RiskLevel,
} from "./data";

export interface ClusterScore {
  cluster: AtmCluster;
  score: number;
  confidence: number;
  predictedTime: string;
  factors: RiskFactor[];
  matchedCases: string[];
}

export interface PredictionResult {
  clusterId: string;
  riskScore: number;
  confidence: number;
  predictedTime: string;
  factors: RiskFactor[];
  similarCases: string[];
  lowConfidence: boolean;
  ranked: ClusterScore[];
  stationName: string;
  priority: RiskLevel;
  narrative: string;
}

/** Stable pseudo-random jitter so a case always scores identically. */
function seed(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h % 1000) / 1000;
}

const PEAK_BASE_HOUR = 10; // hourlyActivity[0] represents 10:00

function fmt12(totalMinutes: number): string {
  const h24 = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  const suffix = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

function windowFor(cluster: AtmCluster): { text: string; peakHour: number } {
  const peakIdx = cluster.hourlyActivity.indexOf(Math.max(...cluster.hourlyActivity));
  const peakHour = PEAK_BASE_HOUR + Math.max(peakIdx, 0);
  const start = peakHour * 60 + 40;
  return { text: `${fmt12(start)} – ${fmt12(start + 50)}`, peakHour };
}

function complaintHour(record: CaseRecord): number {
  const hh = Number(record.complaintTime.slice(11, 13));
  return Number.isFinite(hh) ? hh : 10;
}

const HIGH_VELOCITY_TYPES = [
  "UPI / Digital Payment Fraud",
  "Digital Arrest Impersonation",
  "Investment / Trading Scam",
];

/** Score a single ATM cluster against a case — every factor is explainable. */
function scoreCluster(record: CaseRecord, cluster: AtmCluster): ClusterScore {
  const jitter = seed(`${record.caseId}:${cluster.id}`);
  const flow = buildFlow(record);
  const mules = flow.nodes.filter((n) => n.type === "mule" || n.type === "cashout").length;
  const splits = flow.edges.length;

  // 1. Historical pattern matching — similar synthetic cases cashed out here.
  const matches = historicalCases.filter(
    (h) =>
      h.clusterId === cluster.id && Math.abs(h.amount - record.amount) / record.amount <= 0.55,
  );
  const historyPts = Math.min(28, matches.length * 9 + (matches.length ? 4 : 0));

  // 2. Geographic proximity to the closest-amount historical cash-out point.
  const anchor = [...historicalCases].sort(
    (a, b) => Math.abs(a.amount - record.amount) - Math.abs(b.amount - record.amount),
  )[0];
  const anchorCluster = atmClusters.find((c) => c.id === anchor?.clusterId);
  const dist = anchorCluster
    ? Math.hypot(cluster.x - anchorCluster.x, cluster.y - anchorCluster.y)
    : 50;
  const geoPts = Math.max(0, Math.round(22 - dist * 0.34));

  // 3. Time-window alignment between complaint hour and cluster cash-out peak.
  const { text: predictedTime, peakHour } = windowFor(cluster);
  const gap = Math.abs(peakHour - complaintHour(record));
  const timePts = Math.max(2, Math.round(18 - gap * 1.6));

  // 4. ATM density inside the cluster — more machines, easier layered cash-out.
  const densityPts = Math.min(14, Math.round(cluster.atmCount * 2.1));

  // 5. Money-flow velocity — split transactions and mule hops.
  const velocityBase = Math.min(20, splits * 2 + mules * 2.5);
  const velocityPts = Math.round(
    velocityBase * (HIGH_VELOCITY_TYPES.includes(record.crimeType) ? 1 : 0.75),
  );

  const raw = historyPts + geoPts + timePts + densityPts + velocityPts + jitter * 4;
  const score = Math.max(4, Math.min(99, Math.round(raw)));

  const factors: RiskFactor[] = [
    {
      label: "Historical pattern match",
      points: historyPts,
      detail: matches.length
        ? `${matches.length} similar synthetic case(s) cashed out in ${cluster.area}: ${matches
            .map((m) => m.id)
            .join(", ")}`
        : `No comparable synthetic cash-out history recorded for ${cluster.area}`,
    },
    {
      label: "Geographic proximity",
      points: geoPts,
      detail: anchorCluster
        ? `Cluster sits ${dist.toFixed(1)} demo-grid units from ${anchorCluster.area}, the closest matching cash-out corridor`
        : "No geographic anchor available",
    },
    {
      label: "Time-window alignment",
      points: timePts,
      detail: `Complaint logged at ${String(complaintHour(record)).padStart(2, "0")}:00; cluster cash-out peak observed around ${fmt12(peakHour * 60)}`,
    },
    {
      label: "ATM clustering density",
      points: densityPts,
      detail: `${cluster.atmCount} ATMs within the cluster boundary — prediction stays cluster-level, never a single machine`,
    },
    {
      label: "Money-flow velocity",
      points: velocityPts,
      detail: `${splits} split transfers across ${mules} mule / cash-out accounts for ${record.crimeType}`,
    },
  ];

  const evidence = (matches.length ? 1 : 0) + (geoPts > 10 ? 1 : 0) + (splits >= 3 ? 1 : 0);
  const confidence = Math.max(
    28,
    Math.min(94, Math.round(score * 0.72 + evidence * 7 + jitter * 5)),
  );

  return {
    cluster,
    score,
    confidence,
    predictedTime,
    factors,
    matchedCases: matches.map((m) => m.id),
  };
}

/** Full ranked prediction for a case. Deterministic for a given case. */
export function runPredictionEngine(record: CaseRecord): PredictionResult {
  const ranked = atmClusters
    .map((c) => scoreCluster(record, c))
    .sort((a, b) => b.score - a.score);

  const top = ranked[0]!;
  const runnerUp = ranked[1];
  const separation = runnerUp ? top.score - runnerUp.score : 20;

  // Weak evidence => refuse to over-claim a location.
  const lowConfidence =
    top.matchedCases.length === 0 || separation < 4 || top.confidence < 55 || record.amount < 20000;

  const station = stationForCluster(top.cluster.id);
  const narrative = lowConfidence
    ? "Evidence is insufficient for a reliable location prediction. Manual investigation is recommended — the prototype model deliberately abstains rather than guessing."
    : `Money-flow layering, ${top.matchedCases.length} matching synthetic precedent(s) and cash-out timing all converge on ${top.cluster.label} (${top.cluster.area}). Predicted cash-out window ${top.predictedTime}. Nearest jurisdiction: ${station?.name ?? "—"}.`;

  return {
    clusterId: top.cluster.id,
    riskScore: top.score,
    confidence: lowConfidence ? Math.min(top.confidence, 52) : top.confidence,
    predictedTime: lowConfidence ? "Not predicted — manual review" : top.predictedTime,
    factors: top.factors,
    similarCases: top.matchedCases,
    lowConfidence,
    ranked,
    stationName: station?.name ?? "—",
    priority: riskLevel(top.score),
    narrative,
  };
}
