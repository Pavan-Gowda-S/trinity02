import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  atmClusters,
  seedAlerts,
  seedAudit,
  seedCases,
  type AlertRecord,
  type AuditEntry,
  type CaseRecord,
} from "./data";

export type Role = "citizen" | "police" | "bank" | "i4c" | "admin";

export const ROLE_LABEL: Record<Role, string> = {
  citizen: "NCRP / Citizen",
  police: "Police / LEA",
  bank: "Bank / FI",
  i4c: "I4C",
  admin: "Admin",
};

export const ROLE_HOME: Record<Role, string> = {
  citizen: "/citizen",
  police: "/trinity",
  bank: "/bank",
  i4c: "/i4c",
  admin: "/admin",
};

export interface Complaint {
  id: string;
  caseId: string;
  amount: number;
  crimeType: string;
  description: string;
  timestamp: string;
  status: "Registered" | "Under Analysis" | "Prediction Generated" | "Under Investigation";
  stage: string;
}

interface State {
  role: Role | null;
  cases: CaseRecord[];
  alerts: AlertRecord[];
  audit: AuditEntry[];
  complaints: Complaint[];
}

interface Store extends State {
  hydrated: boolean;
  login: (role: Role) => void;
  logout: () => void;
  addComplaint: (input: { amount: number; crimeType: string; description: string }) => Complaint;
  setAlertStatus: (id: string, status: AlertRecord["status"]) => void;
  addAlert: (alert: AlertRecord) => void;
  setCaseStatus: (caseId: string, status: CaseRecord["status"]) => void;
  updateCase: (caseId: string, patch: Partial<CaseRecord>) => void;
  log: (action: string, caseId: string, role?: string) => void;
}

const KEY = "trinity-demo-state-v1";

const initial: State = {
  role: null,
  cases: seedCases,
  alerts: seedAlerts,
  audit: seedAudit,
  complaints: [
    {
      id: "CMP-1",
      caseId: "NCRP-001",
      amount: 85000,
      crimeType: "UPI / Digital Payment Fraud",
      description: "Unauthorised UPI debit after a fake customer-care call (synthetic demo entry).",
      timestamp: "2026-03-09 10:05",
      status: "Prediction Generated",
      stage: "Predictive intelligence generated — alert issued to jurisdiction unit",
    },
    {
      id: "CMP-2",
      caseId: "NCRP-006",
      amount: 26000,
      crimeType: "Card Skimming",
      description: "Card cloned at a merchant terminal (synthetic demo entry).",
      timestamp: "2026-03-07 11:33",
      status: "Under Analysis",
      stage: "Evidence insufficient for reliable location prediction — manual review",
    },
  ],
};

const StoreContext = createContext<Store | null>(null);

function nowStamp() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function TrinityProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState({ ...initial, ...(JSON.parse(raw) as Partial<State>) });
    } catch {
      /* ignore corrupt demo state */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable */
    }
  }, [state, hydrated]);

  const log = useCallback((action: string, caseId: string, role?: string) => {
    setState((s) => ({
      ...s,
      audit: [
        {
          id: `AUD-${Math.floor(Math.random() * 9000 + 1000)}`,
          time: nowStamp(),
          role: role ?? (s.role ? ROLE_LABEL[s.role] : "System"),
          action,
          caseId,
        },
        ...s.audit,
      ],
    }));
  }, []);

  const value = useMemo<Store>(
    () => ({
      ...state,
      hydrated,
      login: (role) => {
        setState((s) => ({ ...s, role }));
        log(`Role session started — ${ROLE_LABEL[role]}`, "—", ROLE_LABEL[role]);
      },
      logout: () => setState((s) => ({ ...s, role: null })),
      addComplaint: ({ amount, crimeType, description }) => {
        const n = 100 + state.complaints.length + 1;
        const caseId = `NCRP-2026-${String(n).padStart(3, "0")}`;
        const complaint: Complaint = {
          id: `CMP-${Date.now()}`,
          caseId,
          amount,
          crimeType,
          description,
          timestamp: nowStamp(),
          status: "Registered",
          stage: "Complaint received — queued for TRINITY money-flow analysis",
        };
        const cluster = atmClusters[(n + 1) % atmClusters.length]!;
        const newCase: CaseRecord = {
          caseId,
          amount,
          crimeType,
          complaintTime: complaint.timestamp,
          status: "Active",
          lastUpdated: complaint.timestamp,
          clusterId: cluster.id,
          riskScore: 0,
          confidence: 0,
          predictedTime: "Awaiting prediction",
          factors: [],
          similarCases: [],
          lowConfidence: false,
          victimRef: `VIC-${Math.floor(Math.random() * 9000 + 1000)}`,
          bank: "Synthetic National Bank",
          state: "Karnataka",
        };
        setState((s) => ({
          ...s,
          complaints: [complaint, ...s.complaints],
          cases: [newCase, ...s.cases],
        }));
        log(`Complaint received from citizen portal (synthetic)`, caseId, "Citizen");
        return complaint;
      },
      setAlertStatus: (id, status) =>
        setState((s) => ({
          ...s,
          alerts: s.alerts.map((a) => (a.id === id ? { ...a, status } : a)),
        })),
      addAlert: (alert) => setState((s) => ({ ...s, alerts: [alert, ...s.alerts] })),
      setCaseStatus: (caseId, status) =>
        setState((s) => ({
          ...s,
          cases: s.cases.map((c) =>
            c.caseId === caseId ? { ...c, status, lastUpdated: nowStamp() } : c,
          ),
        })),
      updateCase: (caseId, patch) =>
        setState((s) => ({
          ...s,
          cases: s.cases.map((c) =>
            c.caseId === caseId ? { ...c, ...patch, lastUpdated: nowStamp() } : c,
          ),
          complaints: s.complaints.map((cp) =>
            cp.caseId === caseId && patch.riskScore
              ? {
                  ...cp,
                  status: "Prediction Generated",
                  stage: patch.lowConfidence
                    ? "Evidence insufficient for reliable location prediction — manual review"
                    : "Predictive intelligence generated — alert issued to jurisdiction unit",
                }
              : cp,
          ),
        })),
      log,
    }),
    [state, hydrated, log],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useTrinity(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useTrinity must be used inside TrinityProvider");
  return ctx;
}
