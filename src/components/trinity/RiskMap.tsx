import { useEffect, useRef, useState } from "react";
import { Minus, Plus, Crosshair } from "lucide-react";
import {
  atmClusters,
  atms,
  policeStations,
  riskLevel,
  type AtmCluster,
  type RiskLevel,
} from "@/lib/trinity/data";
import { cn } from "@/lib/utils";

const riskStroke: Record<RiskLevel, string> = {
  high: "var(--color-risk-high)",
  medium: "var(--color-risk-medium)",
  low: "var(--color-risk-low)",
};

/** Synthetic GIS canvas — pan, zoom, click clusters. No real geodata. */
export function RiskMap({
  selectedId,
  onSelect,
  focusId,
  visibleRisk = ["high", "medium", "low"],
  showStations = true,
  className,
  height = 420,
}: {
  selectedId?: string | null;
  onSelect?: (cluster: AtmCluster) => void;
  focusId?: string | null;
  visibleRisk?: RiskLevel[];
  showStations?: boolean;
  className?: string;
  height?: number;
}) {
  const [view, setView] = useState({ x: 0, y: 0, z: 1 });
  const drag = useRef<{ px: number; py: number } | null>(null);

  useEffect(() => {
    if (!focusId) return;
    const c = atmClusters.find((k) => k.id === focusId);
    if (!c) return;
    const z = 1.9;
    setView({ x: 50 - c.x * z + (50 * (1 - z)) / 1, y: 50 - c.y * z + (50 * (1 - z)) / 1, z });
  }, [focusId]);

  const clusters = atmClusters.filter((c) => visibleRisk.includes(riskLevel(c.riskScore)));

  return (
    <div
      className={cn("panel relative overflow-hidden select-none", className)}
      style={{ height }}
      onPointerDown={(e) => {
        drag.current = { px: e.clientX, py: e.clientY };
        (e.target as Element).setPointerCapture?.(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!drag.current) return;
        const dx = ((e.clientX - drag.current.px) / e.currentTarget.clientWidth) * 100;
        const dy = ((e.clientY - drag.current.py) / e.currentTarget.clientHeight) * 100;
        drag.current = { px: e.clientX, py: e.clientY };
        setView((v) => ({ ...v, x: v.x + dx, y: v.y + dy }));
      }}
      onPointerUp={() => (drag.current = null)}
      onPointerLeave={() => (drag.current = null)}
    >
      <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="grid" width="5" height="5" patternUnits="userSpaceOnUse">
            <path
              d="M5 0 L0 0 0 5"
              fill="none"
              stroke="var(--color-border)"
              strokeWidth="0.12"
              opacity="0.7"
            />
          </pattern>
          {atmClusters.map((c) => (
            <radialGradient key={c.id} id={`h-${c.id}`}>
              <stop
                offset="0%"
                stopColor={riskStroke[riskLevel(c.riskScore)]}
                stopOpacity={0.38 * (c.riskScore / 100) + 0.12}
              />
              <stop offset="100%" stopColor={riskStroke[riskLevel(c.riskScore)]} stopOpacity="0" />
            </radialGradient>
          ))}
        </defs>
        <rect width="100" height="100" fill="url(#grid)" />
        <g transform={`translate(${view.x} ${view.y}) scale(${view.z})`}>
          {/* synthetic arterial roads */}
          <g stroke="var(--color-border)" strokeWidth="0.35" fill="none" opacity="0.9">
            <path d="M4 70 L30 55 L52 60 L74 78" />
            <path d="M10 20 L36 30 L58 22 L84 34" />
            <path d="M36 30 L30 55 L48 65 L70 80" />
            <path d="M58 22 L62 46 L81 33" />
          </g>

          {clusters.map((c) => {
            const lvl = riskLevel(c.riskScore);
            const active = selectedId === c.id;
            return (
              <g key={c.id} className="cursor-pointer" onClick={() => onSelect?.(c)}>
                <circle cx={c.x} cy={c.y} r={11} fill={`url(#h-${c.id})`} />
                <circle
                  cx={c.x}
                  cy={c.y}
                  r={active ? 4.4 : 3.2}
                  fill="var(--color-background)"
                  stroke={riskStroke[lvl]}
                  strokeWidth={active ? 0.9 : 0.55}
                />
                <text
                  x={c.x}
                  y={c.y + 0.8}
                  textAnchor="middle"
                  fontSize="1.9"
                  fill={riskStroke[lvl]}
                  fontFamily="var(--font-mono)"
                >
                  {c.id.slice(-2)}
                </text>
                <text
                  x={c.x}
                  y={c.y + 7}
                  textAnchor="middle"
                  fontSize="1.9"
                  fill="var(--color-muted-foreground)"
                >
                  {c.area}
                </text>
              </g>
            );
          })}

          {atms
            .filter((a) => clusters.some((c) => c.id === a.clusterId))
            .map((a) => (
              <rect
                key={a.id}
                x={a.x - 0.4}
                y={a.y - 0.4}
                width="0.8"
                height="0.8"
                fill="var(--color-primary)"
                opacity="0.65"
              />
            ))}

          {showStations &&
            policeStations.map((p) => (
              <g key={p.id}>
                <path
                  d={`M${p.x} ${p.y - 1.4} L${p.x + 1.3} ${p.y} L${p.x} ${p.y + 1.4} L${p.x - 1.3} ${p.y} Z`}
                  fill="var(--color-surface-2)"
                  stroke="var(--color-primary)"
                  strokeWidth="0.3"
                />
              </g>
            ))}
        </g>
      </svg>

      <div className="absolute right-3 bottom-3 flex flex-col gap-1">
        {[
          { icon: <Plus className="size-3.5" />, fn: () => setView((v) => ({ ...v, z: Math.min(3, v.z + 0.3) })) },
          { icon: <Minus className="size-3.5" />, fn: () => setView((v) => ({ ...v, z: Math.max(0.7, v.z - 0.3) })) },
          { icon: <Crosshair className="size-3.5" />, fn: () => setView({ x: 0, y: 0, z: 1 }) },
        ].map((b, i) => (
          <button
            key={i}
            onClick={b.fn}
            className="rounded-md border border-border bg-background/80 p-1.5 text-muted-foreground transition-colors hover:text-primary"
          >
            {b.icon}
          </button>
        ))}
      </div>

      <div className="absolute bottom-3 left-3 flex flex-wrap items-center gap-3 rounded-md border border-border bg-background/75 px-3 py-2 text-[10px] text-muted-foreground backdrop-blur">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-risk-high" /> High
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-risk-medium" /> Medium
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-risk-low" /> Low
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 bg-primary" /> ATM
        </span>
        <span>◆ Police station</span>
      </div>
      <p className="absolute top-3 left-3 text-[10px] text-muted-foreground">
        Synthetic Bengaluru demo geography — drag to pan
      </p>
    </div>
  );
}
