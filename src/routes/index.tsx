import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck, Database, ScrollText, ArrowRight } from "lucide-react";
import { ROLE_HOME, ROLE_LABEL, useTrinity, type Role } from "@/lib/trinity/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TRINITY — Predictive Cybercrime Intelligence" },
      {
        name: "description",
        content:
          "Sign in to the TRINITY prototype as NCRP / Citizen, Police/LEA, Bank/FI, I4C or Admin. Predictive cash-out location and time-window intelligence on synthetic demo data.",
      },
      { property: "og:title", content: "TRINITY — Predictive Cybercrime Intelligence" },
      {
        property: "og:description",
        content: "Prototype role-based access to a predictive cybercrime intelligence layer.",
      },
    ],
  }),
  component: Login,
});

const ROLES: { role: Role; blurb: string }[] = [
  { role: "citizen", blurb: "Report and track complaints via NCRP" },
  { role: "police", blurb: "Predictive intelligence portal" },
  { role: "bank", blurb: "Network-relevant advisories" },
  { role: "i4c", blurb: "National intelligence view" },
  { role: "admin", blurb: "Roles, config and audit" },
];

function Login() {
  const [selected, setSelected] = useState<Role>("police");
  const { login } = useTrinity();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="fade-up w-full max-w-md">
        <div className="panel p-7">
          <div className="flex items-center justify-between">
            <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 font-mono text-[10px] tracking-widest text-primary">
              PROTOTYPE ENVIRONMENT
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">SIH 2026</span>
          </div>

          <h1 className="mt-6 font-display text-3xl font-light tracking-[0.22em] text-primary">
            TRINITY
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Predictive Cybercrime Intelligence</p>

          <p className="mt-6 label-xs">Demo role selector</p>
          <div className="mt-3 space-y-2">
            {ROLES.map(({ role, blurb }) => (
              <button
                key={role}
                onClick={() => setSelected(role)}
                className={cn(
                  "flex w-full items-center justify-between rounded-md border px-3.5 py-3 text-left transition-colors",
                  selected === role
                    ? "border-primary/50 bg-primary/10"
                    : "border-border hover:border-primary/30",
                )}
              >
                <span>
                  <span className="block text-sm">{ROLE_LABEL[role]}</span>
                  <span className="block text-[11px] text-muted-foreground">{blurb}</span>
                </span>
                <span
                  className={cn(
                    "size-3 rounded-full border",
                    selected === role ? "border-primary bg-primary" : "border-border",
                  )}
                />
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              login(selected);
              void navigate({ to: ROLE_HOME[selected] });
            }}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md border border-primary/50 bg-primary/15 px-4 py-2.5 text-sm text-primary transition-colors hover:bg-primary/25"
          >
            Enter {ROLE_LABEL[selected]} portal <ArrowRight className="size-4" />
          </button>

          <div className="mt-6 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-border/60 pt-4 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-3 text-primary" /> Role-based access
            </span>
            <span className="flex items-center gap-1.5">
              <Database className="size-3 text-primary" /> Synthetic demo data
            </span>
            <span className="flex items-center gap-1.5">
              <ScrollText className="size-3 text-primary" /> Activity logged
            </span>
          </div>
        </div>
        <p className="mt-4 text-center text-[11px] leading-relaxed text-muted-foreground">
          Prototype only. Citizens report through NCRP; TRINITY is purely the predictive
          intelligence layer and does not replace NCRP, I4C, CFCFRMS, banks or police systems. No
          authentication and no connection to any real system — all data shown is synthetic.
        </p>
      </div>
    </div>
  );
}
