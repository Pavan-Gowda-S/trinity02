import { Panel } from "./ui";
import { ChevronRight } from "lucide-react";

const STAGES = [
  { name: "NCRP / Citizen", note: "Citizen reports the cybercrime on NCRP" },
  { name: "Bank / FI + CFCFRMS", note: "Transaction trail shared for investigation" },
  { name: "TRINITY", note: "Predictive intelligence layer — WHERE + WHEN" },
  { name: "Police / LEA + I4C", note: "Actionable alert to nearest jurisdiction" },
];

/**
 * Explains where TRINITY sits in the ecosystem. TRINITY is an additional
 * predictive layer only — it never replaces NCRP, I4C, CFCFRMS, banks or
 * police systems.
 */
export function ArchitectureStrip() {
  return (
    <Panel>
      <p className="label-xs">Where TRINITY sits</p>
      <div className="mt-4 flex flex-wrap items-stretch gap-2">
        {STAGES.map((s, i) => (
          <div key={s.name} className="flex min-w-[190px] flex-1 items-center gap-2">
            <div
              className={
                "flex-1 rounded-md border px-3 py-2.5 " +
                (s.name === "TRINITY"
                  ? "border-primary/45 bg-primary/10"
                  : "border-border/70 bg-surface-2/40")
              }
            >
              <p className={"text-sm " + (s.name === "TRINITY" ? "text-primary" : "")}>{s.name}</p>
              <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{s.note}</p>
            </div>
            {i < STAGES.length - 1 ? (
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            ) : null}
          </div>
        ))}
      </div>
      <p className="mt-4 border-t border-border/60 pt-3 text-[11px] leading-relaxed text-muted-foreground">
        Citizens report through NCRP. TRINITY is only the predictive intelligence layer on top of
        that reporting chain — it does <strong>not</strong> replace NCRP, I4C, CFCFRMS, bank or
        police systems, and this prototype is not connected to any of them. All data shown is
        synthetic and masked.
      </p>
    </Panel>
  );
}
