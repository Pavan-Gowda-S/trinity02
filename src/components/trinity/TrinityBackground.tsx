import type { CSSProperties } from "react";

/** Tiny green particles on varied slow orbits, in three depth layers. */
const PARTICLES = [
  { top: "18%", left: "12%", r: 90, dur: 78, size: 3, depth: 1 },
  { top: "31%", left: "27%", r: 62, dur: 96, size: 2, depth: 2 },
  { top: "26%", left: "46%", r: 128, dur: 132, size: 3, depth: 1 },
  { top: "42%", left: "63%", r: 74, dur: 108, size: 2, depth: 2 },
  { top: "20%", left: "78%", r: 104, dur: 88, size: 3, depth: 1 },
  { top: "54%", left: "38%", r: 146, dur: 152, size: 2, depth: 3 },
  { top: "62%", left: "72%", r: 68, dur: 116, size: 2, depth: 2 },
  { top: "14%", left: "60%", r: 54, dur: 84, size: 2, depth: 3 },
  { top: "72%", left: "22%", r: 118, dur: 140, size: 2, depth: 3 },
  { top: "80%", left: "54%", r: 82, dur: 104, size: 3, depth: 1 },
  { top: "66%", left: "88%", r: 96, dur: 124, size: 2, depth: 2 },
  { top: "36%", left: "8%", r: 70, dur: 92, size: 2, depth: 3 },
  { top: "48%", left: "50%", r: 172, dur: 168, size: 2, depth: 3 },
  { top: "12%", left: "36%", r: 58, dur: 100, size: 2, depth: 2 },
  { top: "86%", left: "78%", r: 64, dur: 112, size: 2, depth: 1 },
  { top: "58%", left: "14%", r: 88, dur: 136, size: 2, depth: 2 },
  { top: "28%", left: "90%", r: 76, dur: 120, size: 2, depth: 3 },
  { top: "76%", left: "40%", r: 110, dur: 148, size: 3, depth: 2 },
];

const DEPTH: Record<number, { opacity: number; glow: number }> = {
  1: { opacity: 0.6, glow: 45 },
  2: { opacity: 0.38, glow: 30 },
  3: { opacity: 0.22, glow: 18 },
};

/**
 * The TRINITY atmosphere: an oversized, low-opacity green wordmark behind every
 * screen, rotating a full 360° extremely slowly, with tiny particles orbiting
 * like electrons at varied speeds and depths. Never used as a header logo.
 */
export function TrinityBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-background" />

      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ animation: "trinity-drift 96s ease-in-out infinite" }}
      >
        <div
          className="w-full text-center font-display text-primary/[0.065] glow-green select-none"
          style={{
            fontSize: "clamp(5rem, 21vw, 22rem)",
            fontWeight: 300,
            letterSpacing: "0.16em",
            lineHeight: 1,
            animation: "trinity-spin 900s linear infinite",
            transformOrigin: "50% 50%",
            willChange: "transform",
          }}
        >
          TRINITY
        </div>
      </div>

      {PARTICLES.map((p, i) => {
        const d = DEPTH[p.depth]!;
        return (
          <div key={i} className="absolute" style={{ top: p.top, left: p.left }}>
            <div
              className="rounded-full bg-primary"
              style={
                {
                  width: p.size,
                  height: p.size,
                  opacity: d.opacity,
                  boxShadow: `0 0 ${d.glow / 4}px 1.5px color-mix(in oklab, var(--color-primary) ${d.glow}%, transparent)`,
                  ["--orbit-r" as string]: `${p.r}px`,
                  animation: `trinity-orbit ${p.dur}s linear infinite`,
                  animationDelay: `-${i * 3.7}s`,
                } as CSSProperties
              }
            />
          </div>
        );
      })}

      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(1100px 600px at 50% 40%, color-mix(in oklab, var(--color-primary) 6%, transparent), transparent 70%)",
        }}
      />
    </div>
  );
}
