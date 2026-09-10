import {
  atms,
  historicalCases,
  inr,
  policeStations,
  seedCases,
  type AtmCluster,
} from "@/lib/trinity/data";
import { ConfidenceBar, MetaRow, RiskPill } from "./ui";
import { RiskMap } from "./RiskMap";
import { X } from "lucide-react";

export function ClusterDetail({
  cluster,
  onClose,
}: {
  cluster: AtmCluster;
  onClose?: () => void;
}) {
  const inside = atms.filter((a) => a.clusterId === cluster.id);
  const station = policeStations.find((p) => p.id === cluster.stationId);
  const history = historicalCases.filter((h) => h.clusterId === cluster.id);
  const linked = seedCases.filter((c) => c.clusterId === cluster.id);
  const maxAct = Math.max(...cluster.hourlyActivity);

  return (
    <div className="panel p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="label-xs">ATM cluster detail</p>
          <h2 className="mt-1 font-display text-xl">
            ATM {cluster.label} — {cluster.area}
          </h2>
        </div>
        {onClose ? (
          <button
            onClick={onClose}
            className="rounded-md border border-border p-1.5 text-muted-foreground hover:text-primary"
          >
            <X className="size-3.5" />
          </button>
        ) : null}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div>
          <MetaRow k="Cluster ID" v={<span className="font-mono">{cluster.id}</span>} />
          <MetaRow k="Area" v={cluster.area} />
          <MetaRow k="ATMs in cluster" v={cluster.atmCount} />
          <MetaRow k="Risk score" v={<RiskPill score={cluster.riskScore} />} />
          <MetaRow
            k="Confidence"
            v={
              <span className="inline-flex w-32 items-center gap-2">
                <span className="font-mono text-xs">{cluster.confidence}%</span>
                <ConfidenceBar value={cluster.confidence} />
              </span>
            }
          />
          <MetaRow k="Predicted window" v={cluster.predictedTime} />
          <MetaRow k="Nearest police station" v={station?.name ?? "—"} />
          <MetaRow
            k="Geographic relationship"
            v={`${history.length} synthetic prior cash-outs within 4 km radius`}
          />
        </div>
        <RiskMap focusId={cluster.id} selectedId={cluster.id} height={260} />
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-3">
        <div>
          <p className="label-xs">ATMs inside cluster</p>
          <ul className="mt-3 space-y-1.5">
            {inside.map((a) => (
              <li key={a.id} className="flex justify-between text-xs">
                <span className="font-mono text-muted-foreground">{a.id}</span>
                <span>{a.label}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="label-xs">Recent activity</p>
          <ul className="mt-3 space-y-2">
            {cluster.recentActivity.map((r, i) => (
              <li key={i} className="rounded-md border border-border/60 bg-surface/50 p-2.5">
                <p className="font-mono text-[10px] text-muted-foreground">{r.time}</p>
                <p className="text-xs">{r.note}</p>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="label-xs">Historical activity (hourly index)</p>
          <div className="mt-3 flex h-24 items-end gap-1">
            {cluster.hourlyActivity.map((v, i) => (
              <div
                key={i}
                className="flex-1 rounded-t bg-primary/40"
                style={{ height: `${(v / maxAct) * 100}%` }}
                title={`Band ${i + 1}: ${v}`}
              />
            ))}
          </div>
          <p className="mt-2 text-[10px] text-muted-foreground">
            Synthetic 10 AM → 10 PM withdrawal intensity
          </p>
          <p className="label-xs mt-4">Similar cases</p>
          <ul className="mt-2 space-y-1 text-xs">
            {[...history, ...[]].map((h) => (
              <li key={h.id} className="flex justify-between">
                <span className="font-mono text-muted-foreground">{h.id}</span>
                <span>{inr(h.amount)}</span>
              </li>
            ))}
            {linked.map((c) => (
              <li key={c.caseId} className="flex justify-between">
                <span className="font-mono text-muted-foreground">{c.caseId}</span>
                <span>{inr(c.amount)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
