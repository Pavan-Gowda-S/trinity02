import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { atmClusters, riskLevel, stationForCluster, type AtmCluster, type RiskLevel } from "@/lib/trinity/data";
import { RiskMap } from "@/components/trinity/RiskMap";
import { ClusterDetail } from "@/components/trinity/ClusterDetail";
import { BackLink, Panel, RiskPill } from "@/components/trinity/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/trinity/heatmap")({
  component: HeatmapPage,
});

const TIME_BANDS = ["All day", "Morning", "Afternoon", "Evening", "Night"] as const;

function bandMatch(band: (typeof TIME_BANDS)[number], predicted: string) {
  if (band === "All day") return true;
  const hour = Number(predicted.slice(0, 2).trim());
  const pm = predicted.includes("PM");
  const h24 = pm && hour < 12 ? hour + 12 : hour;
  if (band === "Morning") return h24 < 12;
  if (band === "Afternoon") return h24 >= 12 && h24 < 17;
  if (band === "Evening") return h24 >= 17 && h24 < 21;
  return h24 >= 21;
}

function HeatmapPage() {
  const [risks, setRisks] = useState<RiskLevel[]>(["high", "medium", "low"]);
  const [band, setBand] = useState<(typeof TIME_BANDS)[number]>("All day");
  const [selected, setSelected] = useState<AtmCluster | null>(null);
  const [focus, setFocus] = useState<string | null>(null);

  const visible = atmClusters.filter(
    (c) => risks.includes(riskLevel(c.riskScore)) && bandMatch(band, c.predictedTime),
  );
  const ranked = [...visible].sort((a, b) => b.riskScore - a.riskScore);

  const toggle = (r: RiskLevel) =>
    setRisks((s) => (s.includes(r) ? s.filter((x) => x !== r) : [...s, r]));

  return (
    <div className="space-y-5">
      <BackLink fallback="/trinity" />
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label-xs">Synthetic GIS view</p>
          <h1 className="mt-1 text-2xl font-light">Risk Heatmap</h1>
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="flex gap-1.5">
            {(["high", "medium", "low"] as RiskLevel[]).map((r) => (
              <button
                key={r}
                onClick={() => toggle(r)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs capitalize",
                  risks.includes(r)
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-border text-muted-foreground",
                )}
              >
                {r}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5">
            {TIME_BANDS.map((b) => (
              <button
                key={b}
                onClick={() => setBand(b)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs",
                  band === b
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-border text-muted-foreground",
                )}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="grid gap-5 xl:grid-cols-[1.7fr_1fr]">
        <RiskMap
          visibleRisk={risks}
          focusId={focus}
          selectedId={selected?.id ?? null}
          onSelect={(c) => {
            setSelected(c);
            setFocus(c.id);
          }}
          height={520}
        />
        <div className="space-y-4">
          <Panel>
            <p className="label-xs">Cluster ranking</p>
            <ul className="mt-3 space-y-2">
              {ranked.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => {
                      setSelected(c);
                      setFocus(c.id);
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md border px-3 py-2.5 text-left transition-colors",
                      selected?.id === c.id
                        ? "border-primary/50 bg-primary/8"
                        : "border-border/60 hover:border-primary/30",
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">
                        {c.label} — {c.area}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {c.atmCount} ATMs · Confidence {c.confidence}%
                      </p>
                    </div>
                    <RiskPill score={c.riskScore} />
                  </button>
                </li>
              ))}
              {!ranked.length ? (
                <li className="text-sm text-muted-foreground">No clusters match these filters.</li>
              ) : null}
            </ul>
          </Panel>

          {selected ? (
            <Panel>
              <p className="label-xs">Hotspot summary</p>
              <p className="mt-2 font-display text-lg">
                {selected.label} — {selected.area}
              </p>
              <dl className="mt-3 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Risk</dt>
                  <dd>{selected.riskScore}/100</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Confidence</dt>
                  <dd>{selected.confidence}%</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Predicted time</dt>
                  <dd className="font-mono text-xs">{selected.predictedTime}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">ATMs</dt>
                  <dd>{selected.atmCount}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="shrink-0 text-muted-foreground">Nearest station</dt>
                  <dd className="text-right text-xs">{stationForCluster(selected.id)?.name}</dd>
                </div>
              </dl>
            </Panel>
          ) : (
            <Panel className="text-sm text-muted-foreground">
              Click a hotspot on the map to view cluster intelligence.
            </Panel>
          )}
        </div>
      </div>

      {selected ? <ClusterDetail cluster={selected} onClose={() => setSelected(null)} /> : null}
    </div>
  );
}
