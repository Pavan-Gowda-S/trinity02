import { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import { buildFlow, inr, type CaseRecord } from "@/lib/trinity/data";

interface Positioned {
  id: string;
  type: string;
  bank: string;
  x: number;
  y: number;
}

const LAYERS: Record<string, number> = { victim: 0, layer: 1, mule: 2, cashout: 3 };

export function MoneyFlowGraph({ record }: { record: CaseRecord }) {
  const [focus, setFocus] = useState<string | null>(null);
  const { nodes, edges } = useMemo(() => buildFlow(record), [record]);

  const positioned = useMemo<Positioned[]>(() => {
    const rows: Record<number, typeof nodes> = {};
    for (const n of nodes) {
      const layer = n.type === "layer" ? (n.id.startsWith("ACC-A") ? 1 : 2) : LAYERS[n.type]!;
      const key = n.type === "mule" ? 3 : n.type === "cashout" ? 4 : layer;
      rows[key] = [...(rows[key] ?? []), n];
    }
    const out: Positioned[] = [];
    const keys = Object.keys(rows).map(Number).sort((a, b) => a - b);
    keys.forEach((k, ri) => {
      const list = rows[k]!;
      list.forEach((n, i) => {
        out.push({
          ...n,
          x: ((i + 1) / (list.length + 1)) * 100,
          y: 8 + (ri / (keys.length - 1)) * 84,
        });
      });
    });
    return out;
  }, [nodes]);

  const pos = (id: string) => positioned.find((p) => p.id === id);
  const connected = new Set<string>();
  if (focus) {
    connected.add(focus);
    for (const e of edges) {
      if (e.from === focus) connected.add(e.to);
      if (e.to === focus) connected.add(e.from);
    }
  }
  const dim = (id: string) => (focus && !connected.has(id) ? 0.2 : 1);
  const focusEdges = edges.filter((e) => e.from === focus || e.to === focus);

  return (
    <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
      <div className="panel relative h-[420px] overflow-hidden">
        <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="none">
          {edges.map((e, i) => {
            const a = pos(e.from);
            const b = pos(e.to);
            if (!a || !b) return null;
            const on = !focus || (connected.has(e.from) && connected.has(e.to));
            return (
              <g key={i} opacity={on ? 1 : 0.12}>
                <path
                  d={`M${a.x} ${a.y} C ${a.x} ${(a.y + b.y) / 2}, ${b.x} ${(a.y + b.y) / 2}, ${b.x} ${b.y}`}
                  fill="none"
                  stroke={on && focus ? "var(--color-primary)" : "var(--color-border)"}
                  strokeWidth={on && focus ? 0.7 : 0.45}
                />
                {on && focus ? (
                  <text
                    x={(a.x + b.x) / 2}
                    y={(a.y + b.y) / 2 - 1}
                    fontSize="2.4"
                    textAnchor="middle"
                    fill="var(--color-primary)"
                    fontFamily="var(--font-mono)"
                  >
                    {inr(e.amount)}
                  </text>
                ) : null}
              </g>
            );
          })}
          {positioned.map((n) => (
            <g
              key={n.id}
              opacity={dim(n.id)}
              className="cursor-pointer"
              onClick={() => setFocus(focus === n.id ? null : n.id)}
            >
              <rect
                x={n.x - 11}
                y={n.y - 3.4}
                width="22"
                height="6.8"
                rx="1.4"
                fill={
                  n.type === "cashout"
                    ? "color-mix(in oklab, var(--color-risk-high) 16%, var(--color-surface))"
                    : n.type === "mule"
                      ? "color-mix(in oklab, var(--color-risk-medium) 14%, var(--color-surface))"
                      : "var(--color-surface-2)"
                }
                stroke={
                  focus === n.id
                    ? "var(--color-primary)"
                    : n.type === "cashout"
                      ? "var(--color-risk-high)"
                      : "var(--color-border)"
                }
                strokeWidth={focus === n.id ? 0.7 : 0.35}
              />
              <text
                x={n.x}
                y={n.y + 1}
                fontSize="3"
                textAnchor="middle"
                fill="var(--color-foreground)"
                fontFamily="var(--font-mono)"
              >
                {n.id}
              </text>
            </g>
          ))}
        </svg>
        {focus ? (
          <button
            onClick={() => setFocus(null)}
            className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-md border border-border bg-background/80 px-2.5 py-1 text-[11px] text-muted-foreground hover:text-primary"
          >
            <RotateCcw className="size-3" /> Reset focus
          </button>
        ) : null}
        <p className="absolute top-3 left-3 text-[10px] text-muted-foreground">
          Masked synthetic identifiers — click a node to trace connections
        </p>
      </div>

      <div className="panel p-4">
        <p className="label-xs">Relationship detail</p>
        {focus ? (
          <>
            <p className="mt-2 font-mono text-sm text-primary">{focus}</p>
            <p className="text-xs text-muted-foreground">{pos(focus)?.bank}</p>
            <ul className="mt-4 space-y-3">
              {focusEdges.map((e, i) => (
                <li key={i} className="rounded-md border border-border/70 bg-surface/60 p-3">
                  <p className="font-mono text-xs">
                    {e.from} <span className="text-primary">→</span> {e.to}
                  </p>
                  <p className="mt-1 text-sm">{inr(e.amount)}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {e.relationship} · {e.timestamp}
                  </p>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            Select any account node to highlight its connected accounts, transferred amounts,
            timestamps and relationship type.
          </p>
        )}
      </div>
    </div>
  );
}

export function SplitTransactionView({ record }: { record: CaseRecord }) {
  const { edges } = useMemo(() => buildFlow(record), [record]);
  const splits = edges.filter((e) => e.relationship === "Split distribution");
  const total = splits.reduce((s, e) => s + e.amount, 0);
  return (
    <div className="panel p-5">
      <p className="label-xs">Suspicious money-flow pattern detected</p>
      <p className="mt-2 text-sm text-muted-foreground">
        {inr(record.amount)} entered the network and was distributed across {splits.length}{" "}
        connected accounts before reaching potential cash-out clusters.
      </p>
      <div className="mt-4 space-y-3">
        {splits.map((e, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="w-24 shrink-0 font-mono text-xs text-muted-foreground">{e.to}</span>
            <div className="h-6 flex-1 overflow-hidden rounded bg-muted">
              <div
                className="flex h-full items-center justify-end rounded bg-primary/25 pr-2 font-mono text-[11px] text-primary transition-all duration-700"
                style={{ width: `${(e.amount / total) * 100}%` }}
              >
                {inr(e.amount)}
              </div>
            </div>
            <span className="w-14 shrink-0 text-right text-[11px] text-muted-foreground">
              {Math.round((e.amount / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
