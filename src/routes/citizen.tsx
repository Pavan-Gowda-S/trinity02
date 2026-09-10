import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Home, FilePlus2, Files, Search, Bell, User } from "lucide-react";
import { TabPortal } from "@/components/trinity/TabPortal";
import { Panel, MetaRow } from "@/components/trinity/ui";
import { inr } from "@/lib/trinity/data";
import { useTrinity } from "@/lib/trinity/store";

export const Route = createFileRoute("/citizen")({
  head: () => ({
    meta: [
      { title: "NCRP / Citizen Portal — TRINITY Prototype" },
      {
        name: "description",
        content:
          "Prototype citizen portal to register, view and track synthetic cybercrime complaints feeding the TRINITY predictive layer.",
      },
      { property: "og:title", content: "NCRP / Citizen Portal — TRINITY Prototype" },
      {
        property: "og:description",
        content: "Register and track synthetic cybercrime complaints in the TRINITY prototype.",
      },
    ],
  }),
  component: CitizenPortal,
});

const CRIME_TYPES = [
  "UPI / Digital Payment Fraud",
  "Investment / Trading Scam",
  "Job Offer Fraud",
  "Digital Arrest Impersonation",
  "Card Skimming",
  "Loan App Extortion",
];

function CitizenPortal() {
  return (
    <TabPortal
      role="citizen"
      portalName="NCRP / Citizen Portal"
      portalTag="NCRP / Citizen (prototype)"
      tabs={[
        { id: "home", label: "Home", icon: <Home className="size-4" />, render: () => <HomeTab /> },
        {
          id: "register",
          label: "Register Complaint",
          icon: <FilePlus2 className="size-4" />,
          render: () => <RegisterTab />,
        },
        {
          id: "mine",
          label: "My Complaints",
          icon: <Files className="size-4" />,
          render: () => <MyComplaints />,
        },
        {
          id: "track",
          label: "Track Complaint",
          icon: <Search className="size-4" />,
          render: () => <TrackTab />,
        },
        {
          id: "notify",
          label: "Notifications",
          icon: <Bell className="size-4" />,
          render: () => <NotificationsTab />,
        },
        {
          id: "profile",
          label: "Profile",
          icon: <User className="size-4" />,
          render: () => <ProfileTab />,
        },
      ]}
    />
  );
}

function HomeTab() {
  const { complaints } = useTrinity();
  return (
    <div className="space-y-5">
      <header>
        <p className="label-xs">NCRP / Citizen services</p>
        <h1 className="mt-1 text-2xl font-light">Report cybercrime</h1>
      </header>
      <Panel>
        <p className="text-sm text-muted-foreground">
          Register a cybercrime complaint and track its progress. Complaints registered here are
          passed to the TRINITY predictive intelligence layer for authorized investigators. This is a
          prototype using synthetic data only.
        </p>
      </Panel>
      <div className="grid gap-4 sm:grid-cols-3">
        <Panel>
          <p className="label-xs">My complaints</p>
          <p className="mt-2 font-display text-3xl font-light">{complaints.length}</p>
        </Panel>
        <Panel>
          <p className="label-xs">Under analysis</p>
          <p className="mt-2 font-display text-3xl font-light">
            {complaints.filter((c) => c.status !== "Registered").length}
          </p>
        </Panel>
        <Panel>
          <p className="label-xs">Helpline (demo)</p>
          <p className="mt-2 font-display text-2xl font-light">1930</p>
          <p className="mt-1 text-[11px] text-muted-foreground">Illustrative reference only</p>
        </Panel>
      </div>
    </div>
  );
}

function RegisterTab() {
  const { addComplaint } = useTrinity();
  const [amount, setAmount] = useState("");
  const [crimeType, setCrimeType] = useState(CRIME_TYPES[0]!);
  const [description, setDescription] = useState("");
  const [done, setDone] = useState<string | null>(null);

  return (
    <div className="max-w-2xl space-y-5">
      <header>
        <p className="label-xs">Prototype form</p>
        <h1 className="mt-1 text-2xl font-light">Register Complaint</h1>
      </header>

      {done ? (
        <Panel className="border-primary/40">
          <p className="font-display text-lg text-primary">Complaint successfully registered.</p>
          <p className="mt-2 text-sm">
            Your complaint ID is <span className="font-mono text-primary">{done}</span>
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            The complaint is now queued for TRINITY money-flow analysis and appears in the
            investigator workspace.
          </p>
          <button
            onClick={() => setDone(null)}
            className="mt-4 rounded-md border border-border px-3 py-1.5 text-xs"
          >
            Register another
          </button>
        </Panel>
      ) : (
        <Panel>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const value = Number(amount);
              if (!value || value <= 0) {
                toast.error("Enter the defrauded amount");
                return;
              }
              const c = addComplaint({ amount: value, crimeType, description });
              setDone(c.caseId);
              setAmount("");
              setDescription("");
              toast.success("Complaint successfully registered", { description: c.caseId });
            }}
          >
            <div>
              <label className="label-xs" htmlFor="amount">
                Amount defrauded (₹)
              </label>
              <input
                id="amount"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="85000"
                className="mt-1.5 w-full rounded-md border border-input bg-background/60 px-3 py-2 text-sm outline-none focus:border-primary/50"
              />
            </div>
            <div>
              <label className="label-xs" htmlFor="type">
                Type of cybercrime
              </label>
              <select
                id="type"
                value={crimeType}
                onChange={(e) => setCrimeType(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-input bg-background/60 px-3 py-2 text-sm outline-none focus:border-primary/50"
              >
                {CRIME_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-xs" htmlFor="desc">
                What happened
              </label>
              <textarea
                id="desc"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the incident"
                className="mt-1.5 w-full rounded-md border border-input bg-background/60 px-3 py-2 text-sm outline-none focus:border-primary/50"
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Do not enter real personal, Aadhaar, card or bank account details — this is a prototype
              with synthetic data.
            </p>
            <button
              type="submit"
              className="rounded-md border border-primary/50 bg-primary/15 px-4 py-2 text-sm text-primary hover:bg-primary/25"
            >
              Submit complaint
            </button>
          </form>
        </Panel>
      )}
    </div>
  );
}

function MyComplaints() {
  const { complaints } = useTrinity();
  return (
    <div className="space-y-5">
      <header>
        <p className="label-xs">Own complaints only</p>
        <h1 className="mt-1 text-2xl font-light">My Complaints</h1>
      </header>
      <div className="space-y-3">
        {complaints.map((c) => (
          <Panel key={c.id}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="font-mono text-xs text-primary">{c.caseId}</span>
              <span className="text-sm">{inr(c.amount)}</span>
              <span className="text-xs text-muted-foreground">{c.crimeType}</span>
              <span className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
                {c.status}
              </span>
            </div>
            {c.description ? <p className="mt-2 text-sm">{c.description}</p> : null}
            <p className="mt-2 font-mono text-[11px] text-muted-foreground">{c.timestamp}</p>
          </Panel>
        ))}
      </div>
    </div>
  );
}

function TrackTab() {
  const { complaints } = useTrinity();
  const [query, setQuery] = useState("");
  const found = complaints.find((c) => c.caseId.toLowerCase() === query.trim().toLowerCase());
  return (
    <div className="max-w-2xl space-y-5">
      <header>
        <p className="label-xs">Status lookup</p>
        <h1 className="mt-1 text-2xl font-light">Track Complaint</h1>
      </header>
      <Panel>
        <div className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter complaint ID e.g. NCRP-001"
            className="w-full rounded-md border border-input bg-background/60 px-3 py-2 text-sm outline-none focus:border-primary/50"
          />
        </div>
        <div className="mt-4">
          {query.trim() === "" ? (
            <p className="text-sm text-muted-foreground">
              Enter a complaint ID from “My Complaints”.
            </p>
          ) : found ? (
            <div>
              <MetaRow k="Complaint ID" v={<span className="font-mono">{found.caseId}</span>} />
              <MetaRow k="Status" v={found.status} />
              <MetaRow k="Date" v={found.timestamp} />
              <MetaRow k="Current stage" v={found.stage} />
            </div>
          ) : (
            <p className="text-sm text-risk-medium">No complaint found with that ID.</p>
          )}
        </div>
      </Panel>
    </div>
  );
}

function NotificationsTab() {
  const { complaints } = useTrinity();
  return (
    <div className="max-w-2xl space-y-5">
      <header>
        <p className="label-xs">Updates</p>
        <h1 className="mt-1 text-2xl font-light">Notifications</h1>
      </header>
      <div className="space-y-3">
        {complaints.map((c) => (
          <Panel key={c.id}>
            <p className="text-sm">
              <span className="font-mono text-primary">{c.caseId}</span> — {c.stage}
            </p>
            <p className="mt-1 font-mono text-[11px] text-muted-foreground">{c.timestamp}</p>
          </Panel>
        ))}
      </div>
    </div>
  );
}

function ProfileTab() {
  return (
    <div className="max-w-lg space-y-5">
      <header>
        <p className="label-xs">Demo profile</p>
        <h1 className="mt-1 text-2xl font-light">Profile</h1>
      </header>
      <Panel>
        <MetaRow k="Name" v="Demo Citizen" />
        <MetaRow k="Citizen reference" v={<span className="font-mono">CIT-0001</span>} />
        <MetaRow k="State" v="Karnataka" />
        <MetaRow k="Verification" v="Prototype account (no real identity)" />
      </Panel>
      <p className="text-[11px] text-muted-foreground">
        No Aadhaar, card, bank or personal identity data is stored in this prototype.
      </p>
    </div>
  );
}
