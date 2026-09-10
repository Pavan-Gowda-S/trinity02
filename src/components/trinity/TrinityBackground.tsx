import type { CSSProperties } from "react";

/** Deterministic pseudo-random so the field is identical on server and client. */
function rand(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

const PARTICLES = Array.from({ length: 64 }, (_, i) => {
  const depth = (i % 3) + 1;
  return {
    top: `${rand(i + 1) * 96}%`,
    left: `${rand(i + 41) * 97}%`,
    r: 40 + rand(i + 7) * 150,
    dur: 70 + rand(i + 13) * 110,
    size: 1.5 + rand(i + 23) * 2,
    driftDur: 16 + rand(i + 31) * 26,
    delay: -rand(i + 53) * 90,
    depth,
  };
});

const DEPTH: Record<number, { opacity: number; glow: number }> = {
  1: { opacity: 0.55, glow: 45 },
  2: { opacity: 0.34, glow: 30 },
  3: { opacity: 0.18, glow: 18 },
};

/**
 * The TRINITY atmosphere: an oversized, low-opacity green wordmark behind every
 * screen, floating slowly up and down and bouncing back, with many tiny green
 * particles roaming on varied slow orbits at three depths. Never a header logo.
 */
export function TrinityBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-background" />

      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ animation: "trinity-bounce 14s cubic-bezier(0.45,0,0.55,1) infinite" }}
      >
        <div
          className="w-full text-center font-display text-primary/[0.07] glow-green select-none"
          style={{
            fontSize: "clamp(5rem, 21vw, 22rem)",
            fontWeight: 300,
            letterSpacing: "0.16em",
            lineHeight: 1,
            animation: "trinity-breathe 26s ease-in-out infinite",
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
          <div
            key={i}
            className="absolute"
            style={{
              top: p.top,
              left: p.left,
              animation: `trinity-roam ${p.driftDur}s ease-in-out infinite alternate`,
              animationDelay: `${p.delay / 6}s`,
            }}
          >
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
                  animationDelay: `${p.delay}s`,
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
