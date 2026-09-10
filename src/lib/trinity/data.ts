/**
 * TRINITY — synthetic prototype dataset.
 * All identifiers, locations, accounts and cases are fictional demo data.
 * No real NCRP / I4C / CFCFRMS / bank / police data is used or accessed.
 */

export type RiskLevel = "high" | "medium" | "low";
export type CaseStatus = "Active" | "Monitoring" | "Resolved";

export interface PoliceStation {
  id: string;
  name: string;
  area: string;
  x: number;
  y: number;
}

export interface Atm {
  id: string;
  label: string;
  clusterId: string;
  x: number;
  y: number;
  area: string;
}

export interface AtmCluster {
  id: string;
  label: string;
  area: string;
  atmCount: number;
  riskScore: number;
  confidence: number;
  predictedTime: string;
  x: number;
  y: number;
  stationId: string;
  hourlyActivity: number[];
  recentActivity: { time: string; note: string }[];
}

export interface AccountNode {
  id: string;
  type: "victim" | "layer" | "mule" | "cashout";
  bank: string;
}

export interface FlowEdge {
  from: string;
  to: string;
  amount: number;
  timestamp: string;
  relationship: string;
}

export interface RiskFactor {
  label: string;
  points: number;
  detail: string;
}

export interface CaseRecord {
  caseId: string;
  amount: number;
  crimeType: string;
  complaintTime: string;
  status: CaseStatus;
  lastUpdated: string;
  clusterId: string;
  riskScore: number;
  confidence: number;
  predictedTime: string;
  factors: RiskFactor[];
  similarCases: string[];
  lowConfidence: boolean;
  victimRef: string;
  bank: string;
  state: string;
}

export interface HistoricalCase {
  id: string;
  area: string;
  amount: number;
  timestamp: string;
  clusterId: string;
}

export interface AlertRecord {
  id: string;
  caseId: string;
  clusterId: string;
  priority: RiskLevel;
  status: "New" | "Acknowledged" | "Monitoring" | "Closed";
  createdAt: string;
  note: string;
}

export interface AuditEntry {
  id: string;
  time: string;
  role: string;
  action: string;
  caseId: string;
}

export const DEMO_GEOGRAPHY = "Bengaluru (synthetic demo geography)";

export const policeStations: PoliceStation[] = [
  { id: "PS-01", name: "Synthetic Kengeri Police Station", area: "Kengeri", x: 18, y: 66 },
  { id: "PS-02", name: "Synthetic Rajajinagar Police Station", area: "Rajajinagar", x: 34, y: 34 },
  {
    id: "PS-03",
    name: "Synthetic Electronic City Police Station",
    area: "Electronic City",
    x: 72,
    y: 84,
  },
  { id: "PS-04", name: "Synthetic Whitefield Police Station", area: "Whitefield", x: 84, y: 36 },
  { id: "PS-05", name: "Synthetic Yelahanka Police Station", area: "Yelahanka", x: 52, y: 12 },
  { id: "PS-06", name: "Synthetic Jayanagar Police Station", area: "Jayanagar", x: 50, y: 68 },
];

export const atmClusters: AtmCluster[] = [
  {
    id: "CLUSTER-07",
    label: "Cluster 07",
    area: "Kengeri",
    atmCount: 6,
    riskScore: 91,
    confidence: 86,
    predictedTime: "6:40 PM – 7:30 PM",
    x: 21,
    y: 62,
    stationId: "PS-01",
    hourlyActivity: [4, 6, 9, 14, 22, 31, 44, 58, 71, 62, 40, 18],
    recentActivity: [
      { time: "Yesterday 7:05 PM", note: "3 high-value withdrawals within 12 minutes" },
      { time: "2 days ago 6:52 PM", note: "Repeat card usage across 2 ATMs in cluster" },
      { time: "4 days ago 7:18 PM", note: "Cash-out linked to synthetic case HIS-002" },
    ],
  },
  {
    id: "CLUSTER-12",
    label: "Cluster 12",
    area: "Rajajinagar",
    atmCount: 4,
    riskScore: 76,
    confidence: 72,
    predictedTime: "7:10 PM – 8:00 PM",
    x: 37,
    y: 30,
    stationId: "PS-02",
    hourlyActivity: [3, 5, 7, 11, 17, 24, 33, 41, 52, 48, 33, 15],
    recentActivity: [
      { time: "Yesterday 7:40 PM", note: "Two withdrawals from newly opened synthetic accounts" },
      { time: "3 days ago 7:22 PM", note: "Cluster flagged in synthetic case HIS-004" },
    ],
  },
  {
    id: "CLUSTER-04",
    label: "Cluster 04",
    area: "Electronic City",
    atmCount: 5,
    riskScore: 63,
    confidence: 65,
    predictedTime: "8:05 PM – 8:50 PM",
    x: 69,
    y: 80,
    stationId: "PS-03",
    hourlyActivity: [2, 4, 6, 9, 13, 19, 26, 33, 38, 44, 30, 12],
    recentActivity: [
      { time: "2 days ago 8:15 PM", note: "Split-transaction withdrawal pattern observed" },
    ],
  },
  {
    id: "CLUSTER-09",
    label: "Cluster 09",
    area: "Whitefield",
    atmCount: 4,
    riskScore: 71,
    confidence: 69,
    predictedTime: "9:15 PM – 10:00 PM",
    x: 81,
    y: 33,
    stationId: "PS-04",
    hourlyActivity: [2, 3, 5, 8, 12, 18, 25, 30, 36, 41, 39, 22],
    recentActivity: [
      { time: "Yesterday 9:35 PM", note: "Late-window withdrawals from 2 mule-linked accounts" },
    ],
  },
  {
    id: "CLUSTER-02",
    label: "Cluster 02",
    area: "Yelahanka",
    atmCount: 3,
    riskScore: 54,
    confidence: 58,
    predictedTime: "5:30 PM – 6:20 PM",
    x: 55,
    y: 16,
    stationId: "PS-05",
    hourlyActivity: [2, 3, 4, 7, 10, 15, 20, 22, 25, 21, 14, 7],
    recentActivity: [{ time: "5 days ago 5:55 PM", note: "Low-value repeat withdrawals" }],
  },
  {
    id: "CLUSTER-15",
    label: "Cluster 15",
    area: "Jayanagar",
    atmCount: 3,
    riskScore: 47,
    confidence: 52,
    predictedTime: "7:45 PM – 8:30 PM",
    x: 48,
    y: 65,
    stationId: "PS-06",
    hourlyActivity: [1, 2, 4, 6, 8, 12, 16, 19, 21, 18, 12, 6],
    recentActivity: [{ time: "6 days ago 8:02 PM", note: "Single flagged withdrawal" }],
  },
];

function makeAtms(): Atm[] {
  const out: Atm[] = [];
  let n = 1;
  for (const c of atmClusters) {
    for (let i = 0; i < c.atmCount; i++) {
      const angle = (i / c.atmCount) * Math.PI * 2;
      out.push({
        id: `ATM-${String(n).padStart(2, "0")}`,
        label: `${c.area} ATM ${i + 1}`,
        clusterId: c.id,
        area: c.area,
        x: Number((c.x + Math.cos(angle) * 2.4).toFixed(2)),
        y: Number((c.y + Math.sin(angle) * 2.4).toFixed(2)),
      });
      n++;
    }
  }
  return out;
}

export const atms: Atm[] = makeAtms();

export const historicalCases: HistoricalCase[] = [
  {
    id: "HIS-001",
    area: "Kengeri",
    amount: 92000,
    timestamp: "2025-11-14 18:55",
    clusterId: "CLUSTER-07",
  },
  {
    id: "HIS-002",
    area: "Kengeri",
    amount: 78000,
    timestamp: "2025-12-02 19:10",
    clusterId: "CLUSTER-07",
  },
  {
    id: "HIS-003",
    area: "Electronic City",
    amount: 145000,
    timestamp: "2025-12-21 20:25",
    clusterId: "CLUSTER-04",
  },
  {
    id: "HIS-004",
    area: "Rajajinagar",
    amount: 64000,
    timestamp: "2026-01-09 19:35",
    clusterId: "CLUSTER-12",
  },
  {
    id: "HIS-005",
    area: "Whitefield",
    amount: 210000,
    timestamp: "2026-01-27 21:40",
    clusterId: "CLUSTER-09",
  },
  {
    id: "HIS-006",
    area: "Kengeri",
    amount: 88000,
    timestamp: "2026-02-11 18:48",
    clusterId: "CLUSTER-07",
  },
  {
    id: "HIS-007",
    area: "Yelahanka",
    amount: 41000,
    timestamp: "2026-02-23 17:50",
    clusterId: "CLUSTER-02",
  },
];

export const seedCases: CaseRecord[] = [
  {
    caseId: "NCRP-001",
    amount: 85000,
    crimeType: "UPI / Digital Payment Fraud",
    complaintTime: "2026-03-09 10:05",
    status: "Active",
    lastUpdated: "2026-03-09 10:10",
    clusterId: "CLUSTER-07",
    riskScore: 91,
    confidence: 86,
    predictedTime: "6:40 PM – 7:30 PM",
    factors: [
      {
        label: "Historical pattern",
        points: 25,
        detail: "3 synthetic historical cash-outs mapped to this cluster in 120 days",
      },
      {
        label: "Recent activity",
        points: 20,
        detail: "Repeat high-value withdrawals in the cluster within the last 48 hours",
      },
      {
        label: "Time similarity",
        points: 15,
        detail: "Complaint-to-cash-out delay matches an evening 6–8 PM withdrawal band",
      },
      {
        label: "Geographic proximity",
        points: 18,
        detail: "Mule accounts operated within 3.2 km of the cluster centroid",
      },
      {
        label: "Similar cases",
        points: 13,
        detail: "Money-flow shape matches HIS-001 and HIS-006 split patterns",
      },
    ],
    similarCases: ["HIS-001", "HIS-006", "HIS-002"],
    lowConfidence: false,
    victimRef: "VIC-7741",
    bank: "Synthetic National Bank",
    state: "Karnataka",
  },
  {
    caseId: "NCRP-002",
    amount: 142000,
    crimeType: "Investment / Trading Scam",
    complaintTime: "2026-03-09 09:12",
    status: "Active",
    lastUpdated: "2026-03-09 09:31",
    clusterId: "CLUSTER-12",
    riskScore: 78,
    confidence: 74,
    predictedTime: "7:10 PM – 8:00 PM",
    factors: [
      { label: "Historical pattern", points: 19, detail: "1 synthetic prior case in cluster" },
      { label: "Recent activity", points: 18, detail: "New-account withdrawals yesterday evening" },
      { label: "Time similarity", points: 14, detail: "Layering completed inside a 7–8 PM window" },
      { label: "Geographic proximity", points: 15, detail: "Mule cluster within 4.8 km" },
      { label: "Similar cases", points: 12, detail: "Shape matches HIS-004" },
    ],
    similarCases: ["HIS-004"],
    lowConfidence: false,
    victimRef: "VIC-3312",
    bank: "Synthetic Metro Bank",
    state: "Karnataka",
  },
  {
    caseId: "NCRP-003",
    amount: 56000,
    crimeType: "Digital Arrest Impersonation",
    complaintTime: "2026-03-08 16:44",
    status: "Monitoring",
    lastUpdated: "2026-03-09 08:05",
    clusterId: "CLUSTER-04",
    riskScore: 66,
    confidence: 67,
    predictedTime: "8:05 PM – 8:50 PM",
    factors: [
      { label: "Historical pattern", points: 15, detail: "1 synthetic prior case in cluster" },
      { label: "Recent activity", points: 13, detail: "Split-withdrawal pattern 2 days ago" },
      { label: "Time similarity", points: 13, detail: "Consistent late-evening band" },
      { label: "Geographic proximity", points: 14, detail: "Mule accounts within 6.1 km" },
      { label: "Similar cases", points: 11, detail: "Partial match with HIS-003" },
    ],
    similarCases: ["HIS-003"],
    lowConfidence: false,
    victimRef: "VIC-9087",
    bank: "Synthetic Coastal Bank",
    state: "Karnataka",
  },
  {
    caseId: "NCRP-004",
    amount: 310000,
    crimeType: "Corporate Email Compromise",
    complaintTime: "2026-03-08 12:20",
    status: "Active",
    lastUpdated: "2026-03-09 07:40",
    clusterId: "CLUSTER-09",
    riskScore: 82,
    confidence: 79,
    predictedTime: "9:15 PM – 10:00 PM",
    factors: [
      { label: "Historical pattern", points: 21, detail: "High-value synthetic precedent HIS-005" },
      { label: "Recent activity", points: 17, detail: "Two mule-linked withdrawals yesterday" },
      { label: "Time similarity", points: 16, detail: "Night-window pattern repeated" },
      { label: "Geographic proximity", points: 16, detail: "Beneficiary devices near cluster" },
      { label: "Similar cases", points: 12, detail: "Layer depth matches HIS-005" },
    ],
    similarCases: ["HIS-005"],
    lowConfidence: false,
    victimRef: "VIC-1029",
    bank: "Synthetic National Bank",
    state: "Karnataka",
  },
  {
    caseId: "NCRP-005",
    amount: 47000,
    crimeType: "Loan App Extortion",
    complaintTime: "2026-03-07 19:05",
    status: "Monitoring",
    lastUpdated: "2026-03-08 18:12",
    clusterId: "CLUSTER-02",
    riskScore: 54,
    confidence: 58,
    predictedTime: "5:30 PM – 6:20 PM",
    factors: [
      { label: "Historical pattern", points: 12, detail: "1 low-value synthetic precedent" },
      { label: "Recent activity", points: 10, detail: "Sparse withdrawals in cluster" },
      { label: "Time similarity", points: 11, detail: "Early-evening band" },
      { label: "Geographic proximity", points: 12, detail: "Accounts within 8 km" },
      { label: "Similar cases", points: 9, detail: "Weak match with HIS-007" },
    ],
    similarCases: ["HIS-007"],
    lowConfidence: false,
    victimRef: "VIC-4450",
    bank: "Synthetic Metro Bank",
    state: "Karnataka",
  },
  {
    caseId: "NCRP-006",
    amount: 26000,
    crimeType: "Card Skimming",
    complaintTime: "2026-03-07 11:33",
    status: "Active",
    lastUpdated: "2026-03-08 09:58",
    clusterId: "CLUSTER-15",
    riskScore: 38,
    confidence: 34,
    predictedTime: "Not determinable",
    factors: [
      { label: "Historical pattern", points: 8, detail: "No consistent synthetic precedent" },
      { label: "Recent activity", points: 7, detail: "Single flagged withdrawal only" },
      { label: "Time similarity", points: 8, detail: "No repeating time band detected" },
      { label: "Geographic proximity", points: 9, detail: "Beneficiary geography dispersed" },
      { label: "Similar cases", points: 6, detail: "No strong money-flow analogue" },
    ],
    similarCases: [],
    lowConfidence: true,
    victimRef: "VIC-6612",
    bank: "Synthetic Coastal Bank",
    state: "Karnataka",
  },
  {
    caseId: "NCRP-007",
    amount: 98000,
    crimeType: "Job Offer Fraud",
    complaintTime: "2026-03-06 15:22",
    status: "Resolved",
    lastUpdated: "2026-03-07 12:15",
    clusterId: "CLUSTER-07",
    riskScore: 74,
    confidence: 71,
    predictedTime: "6:55 PM – 7:45 PM",
    factors: [
      { label: "Historical pattern", points: 20, detail: "Cluster 07 recurrence" },
      { label: "Recent activity", points: 15, detail: "Evening withdrawals confirmed" },
      { label: "Time similarity", points: 13, detail: "Matches evening band" },
      { label: "Geographic proximity", points: 15, detail: "Mules within 3.6 km" },
      { label: "Similar cases", points: 11, detail: "Match with HIS-002" },
    ],
    similarCases: ["HIS-002"],
    lowConfidence: false,
    victimRef: "VIC-2231",
    bank: "Synthetic National Bank",
    state: "Karnataka",
  },
  {
    caseId: "NCRP-008",
    amount: 175000,
    crimeType: "Cryptocurrency Fraud",
    complaintTime: "2026-03-06 10:48",
    status: "Monitoring",
    lastUpdated: "2026-03-08 16:20",
    clusterId: "CLUSTER-04",
    riskScore: 69,
    confidence: 66,
    predictedTime: "8:20 PM – 9:05 PM",
    factors: [
      { label: "Historical pattern", points: 17, detail: "Cluster 04 precedent HIS-003" },
      { label: "Recent activity", points: 14, detail: "Split withdrawals detected" },
      { label: "Time similarity", points: 13, detail: "Late-evening band" },
      { label: "Geographic proximity", points: 14, detail: "Mules within 5.4 km" },
      { label: "Similar cases", points: 11, detail: "Layer shape matches HIS-003" },
    ],
    similarCases: ["HIS-003"],
    lowConfidence: false,
    victimRef: "VIC-7719",
    bank: "Synthetic Metro Bank",
    state: "Karnataka",
  },
];

/** Deterministic synthetic money-flow graph for a case. */
export function buildFlow(c: CaseRecord): { nodes: AccountNode[]; edges: FlowEdge[] } {
  const seed = Number(c.caseId.slice(-3));
  const suffix = (n: number) => String.fromCharCode(65 + ((seed + n) % 26)) + (10 + ((seed * n) % 89));
  const cluster = atmClusters.find((k) => k.id === c.clusterId) ?? atmClusters[0]!;
  const victim = { id: c.victimRef, type: "victim" as const, bank: c.bank };
  const a: AccountNode = { id: `ACC-A${suffix(1)}`, type: "layer", bank: c.bank };
  const b: AccountNode = { id: `ACC-B${suffix(2)}`, type: "layer", bank: "Synthetic Metro Bank" };
  const mules: AccountNode[] = [
    { id: `MULE-${suffix(3)}`, type: "mule", bank: "Synthetic Coastal Bank" },
    { id: `MULE-${suffix(4)}`, type: "mule", bank: "Synthetic National Bank" },
    { id: `MULE-${suffix(5)}`, type: "mule", bank: "Synthetic Metro Bank" },
  ];
  const outs: AccountNode[] = [
    { id: cluster.label, type: "cashout", bank: cluster.area },
    {
      id: (atmClusters.find((k) => k.id !== c.clusterId) ?? atmClusters[1]!).label,
      type: "cashout",
      bank: (atmClusters.find((k) => k.id !== c.clusterId) ?? atmClusters[1]!).area,
    },
  ];
  const t = (m: number) => {
    const base = new Date(c.complaintTime.replace(" ", "T") + ":00");
    base.setMinutes(base.getMinutes() + m);
    return base.toISOString().slice(11, 16);
  };
  const split = [0.4, 0.35, 0.25];
  const edges: FlowEdge[] = [
    {
      from: victim.id,
      to: a.id,
      amount: c.amount,
      timestamp: t(-42),
      relationship: "Initial fraudulent transfer",
    },
    {
      from: a.id,
      to: b.id,
      amount: Math.round(c.amount * 0.96),
      timestamp: t(-30),
      relationship: "Layering transfer",
    },
    ...mules.map((m, i) => ({
      from: b.id,
      to: m.id,
      amount: Math.round(c.amount * 0.96 * (split[i] ?? 0.3)),
      timestamp: t(-22 + i * 4),
      relationship: "Split distribution",
    })),
    {
      from: mules[0]!.id,
      to: outs[0]!.id,
      amount: Math.round(c.amount * 0.96 * 0.4),
      timestamp: t(-6),
      relationship: "Predicted cash-out path",
    },
    {
      from: mules[1]!.id,
      to: outs[0]!.id,
      amount: Math.round(c.amount * 0.96 * 0.35),
      timestamp: t(-4),
      relationship: "Predicted cash-out path",
    },
    {
      from: mules[2]!.id,
      to: outs[1]!.id,
      amount: Math.round(c.amount * 0.96 * 0.25),
      timestamp: t(-2),
      relationship: "Secondary cash-out path",
    },
  ];
  return { nodes: [victim, a, b, ...mules, ...outs], edges };
}

export const seedAlerts: AlertRecord[] = [
  {
    id: "ALT-1001",
    caseId: "NCRP-001",
    clusterId: "CLUSTER-07",
    priority: "high",
    status: "New",
    createdAt: "2026-03-09 10:10",
    note: "Potential cash-out activity predicted in Cluster 07 (Kengeri).",
  },
  {
    id: "ALT-1002",
    caseId: "NCRP-004",
    clusterId: "CLUSTER-09",
    priority: "high",
    status: "Acknowledged",
    createdAt: "2026-03-09 07:42",
    note: "High-value layering with night-window withdrawal pattern.",
  },
  {
    id: "ALT-1003",
    caseId: "NCRP-002",
    clusterId: "CLUSTER-12",
    priority: "high",
    status: "New",
    createdAt: "2026-03-09 09:33",
    note: "New-account withdrawals concentrated in Cluster 12.",
  },
  {
    id: "ALT-1004",
    caseId: "NCRP-008",
    clusterId: "CLUSTER-04",
    priority: "medium",
    status: "Monitoring",
    createdAt: "2026-03-08 16:22",
    note: "Split transactions mapped to Electronic City cluster.",
  },
  {
    id: "ALT-1005",
    caseId: "NCRP-003",
    clusterId: "CLUSTER-04",
    priority: "medium",
    status: "Acknowledged",
    createdAt: "2026-03-09 08:07",
    note: "Impersonation case layering toward Cluster 04.",
  },
  {
    id: "ALT-1006",
    caseId: "NCRP-005",
    clusterId: "CLUSTER-02",
    priority: "low",
    status: "Monitoring",
    createdAt: "2026-03-08 18:14",
    note: "Low-value repeat withdrawal pattern.",
  },
  {
    id: "ALT-1007",
    caseId: "NCRP-006",
    clusterId: "CLUSTER-15",
    priority: "low",
    status: "New",
    createdAt: "2026-03-08 10:02",
    note: "Insufficient evidence — manual investigation recommended.",
  },
  {
    id: "ALT-1008",
    caseId: "NCRP-007",
    clusterId: "CLUSTER-07",
    priority: "medium",
    status: "Closed",
    createdAt: "2026-03-07 12:10",
    note: "Prediction window elapsed; case resolved.",
  },
  {
    id: "ALT-1009",
    caseId: "NCRP-002",
    clusterId: "CLUSTER-07",
    priority: "medium",
    status: "Monitoring",
    createdAt: "2026-03-09 09:50",
    note: "Secondary cash-out path shares Cluster 07 geography.",
  },
  {
    id: "ALT-1010",
    caseId: "NCRP-004",
    clusterId: "CLUSTER-12",
    priority: "medium",
    status: "New",
    createdAt: "2026-03-09 07:55",
    note: "Mule account overlap detected with Cluster 12.",
  },
];

export const seedAudit: AuditEntry[] = [
  {
    id: "AUD-2001",
    time: "2026-03-09 10:05",
    role: "System",
    action: "Complaint received from NCRP citizen portal (synthetic)",
    caseId: "NCRP-001",
  },
  {
    id: "AUD-2002",
    time: "2026-03-09 10:06",
    role: "System",
    action: "Transaction / money-flow analysis completed",
    caseId: "NCRP-001",
  },
  {
    id: "AUD-2003",
    time: "2026-03-09 10:09",
    role: "Prototype Model",
    action: "Prediction generated — Cluster 07, risk 91/100",
    caseId: "NCRP-001",
  },
  {
    id: "AUD-2004",
    time: "2026-03-09 10:10",
    role: "System",
    action: "High-priority alert created",
    caseId: "NCRP-001",
  },
  {
    id: "AUD-2005",
    time: "2026-03-09 09:31",
    role: "Police / LEA",
    action: "Investigator opened case intelligence workspace",
    caseId: "NCRP-002",
  },
  {
    id: "AUD-2006",
    time: "2026-03-09 08:07",
    role: "Police / LEA",
    action: "Alert acknowledged",
    caseId: "NCRP-003",
  },
  {
    id: "AUD-2007",
    time: "2026-03-09 07:42",
    role: "Bank / FI",
    action: "Bank advisory viewed for linked network",
    caseId: "NCRP-004",
  },
  {
    id: "AUD-2008",
    time: "2026-03-08 16:22",
    role: "I4C",
    action: "Cross-state intelligence review",
    caseId: "NCRP-008",
  },
  {
    id: "AUD-2009",
    time: "2026-03-07 12:15",
    role: "Police / LEA",
    action: "Intelligence report generated",
    caseId: "NCRP-007",
  },
];

export const stateRisk = [
  { state: "Karnataka", cases: 42, risk: 88, hotspot: "Kengeri" },
  { state: "Maharashtra", cases: 37, risk: 81, hotspot: "Synthetic Zone M-4" },
  { state: "Delhi NCR", cases: 33, risk: 79, hotspot: "Synthetic Zone D-2" },
  { state: "Telangana", cases: 26, risk: 68, hotspot: "Synthetic Zone T-1" },
  { state: "Tamil Nadu", cases: 22, risk: 61, hotspot: "Synthetic Zone TN-3" },
  { state: "West Bengal", cases: 17, risk: 55, hotspot: "Synthetic Zone WB-2" },
  { state: "Rajasthan", cases: 14, risk: 49, hotspot: "Synthetic Zone R-1" },
];

export const alertTrend = [
  { day: "Mon", alerts: 12, high: 4 },
  { day: "Tue", alerts: 18, high: 6 },
  { day: "Wed", alerts: 15, high: 5 },
  { day: "Thu", alerts: 22, high: 9 },
  { day: "Fri", alerts: 27, high: 11 },
  { day: "Sat", alerts: 19, high: 7 },
  { day: "Sun", alerts: 14, high: 5 },
];

export function riskLevel(score: number): RiskLevel {
  if (score >= 75) return "high";
  if (score >= 55) return "medium";
  return "low";
}

export function inr(n: number): string {
  return "₹" + n.toLocaleString("en-IN");
}

export function clusterById(id: string): AtmCluster | undefined {
  return atmClusters.find((c) => c.id === id);
}

export function stationForCluster(id: string): PoliceStation | undefined {
  const c = clusterById(id);
  return policeStations.find((p) => p.id === c?.stationId);
}
