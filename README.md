# TRINITY — Predictive Cybercrime Intelligence Prototype

A polished, demo-ready **SIH 2026** prototype for predictive cybercrime intelligence.
TRINITY is a **predictive intelligence layer only** — it does **not** replace NCRP,
I4C, CFCFRMS, banks or police systems. Citizens report through **NCRP**; TRINITY
consumes those complaint records and produces transparent, explainable
predictions (WHERE + WHEN cash-out is likely, nearest police station, actionable
alert) using a clearly-labelled **Prototype Predictive Model**.

> ⚠️ **All data is synthetic / masked.** No real NCRP, I4C, CFCFRMS, bank or
> police data is used or accessed. The model is **not** trained machine learning.

**Live app**: https://trinity02.lovable.app

---

## Core demo workflow

The pipeline runs progressively and dynamically updates the case, prediction and
alerts — not just precomputed static results:

```
Case → Transaction analysis → Connected/split money-flow
     → Historical pattern matching → Time analysis
     → Geographic proximity → ATM clustering
     → Transparent risk scoring → Ranked clusters
     → WHERE + WHEN prediction → Nearest police station
     → Actionable alert → Audit log
```

Each factor is explainable and points-based (historical match, geographic
proximity, time-window alignment, ATM density, money-flow velocity). When
evidence is weak the model deliberately **abstains** rather than guessing.

---

## Portals & role-based visibility

| Role | Home | Sees |
| --- | --- | --- |
| NCRP / Citizen | `/citizen` | File complaint, track complaint status |
| Police / LEA | `/trinity` | Dashboard, Cases, Case Intelligence, Money Flow, Predictions, Heatmap, Alerts, Reports, Audit |
| Bank / FI | `/bank` | Live cases for own bank, Account / Money-Flow Trail, Acknowledge alerts |
| I4C | `/i4c` | National Dashboard, India Risk Map, Cross-State Intelligence, Priority Alerts, Audit |
| Admin | `/admin` | System overview, role & data governance |

Every internal/detail page has a **← Back** control that returns to its
previous tab/context, preserving tab history.

---

## Visual identity

- Huge faint **GREEN "TRINITY"** wordmark floating across the entire background
  behind content (never a navbar/logo), low opacity with subtle glow, vertically
  floating and gently bouncing, plus extremely slow 360° rotation.
- ~64 tiny green particles roam/orbit like atoms across three depth layers with
  slight parallax — calm, premium, government-grade, readable. No neon,
  cyberpunk, flashing or distracting animation.

---

## Where the demo data lives

All synthetic demo data is concentrated in a small set of files:

### `src/lib/trinity/data.ts` — the core synthetic dataset

This single file holds **all** seed/demo data. Nothing is fetched from a real
backend. Contents:

| Export | What it is |
| --- | --- |
| `policeStations` | 6 fictional Bengaluru police stations (Kengeri, Rajajinagar, Electronic City, Whitefield, Yelahanka, Jayanagar) with demo-grid coordinates |
| `atmClusters` | 6 ATM clusters with ATM count, risk score, confidence, predicted time window, hourly activity, recent activity notes |
| `atms` | Auto-generated ATM nodes positioned around each cluster |
| `historicalCases` | 7 synthetic historical cash-out cases (HIS-001 … HIS-007) used for pattern matching |
| `seedCases` | 8 seeded NCRP cases (NCRP-001 … NCRP-008) with precomputed risk scores, factors, similar cases — the cases visible on first load |
| `seedAlerts` | 10 seeded alerts (ALT-1001 … ALT-1010) across priorities and statuses |
| `seedAudit` | 9 seeded audit log entries (AUD-2001 … AUD-2009) |
| `stateRisk` | National risk table — 7 states with case counts, risk scores, hotspots |
| `alertTrend` | Weekly alert trend (Mon–Sun) |
| `buildFlow(case)` | Deterministically builds a synthetic money-flow graph (victim → layer → mule → cash-out) for any case |
| `riskLevel`, `inr`, `clusterById`, `stationForCluster` | Helper utilities |

### `src/lib/trinity/store.tsx` — live state + seed complaints

- Seeds the in-memory state from `data.ts` exports above on first load.
- Persists everything to `localStorage` (`trinity-demo-state-v1`) so new
  complaints, predictions, alert/status changes and audit entries survive
  refreshes.
- Holds **2 initial complaints** (CMP-1, CMP-2) linked to NCRP-001 and NCRP-006.
- `addComplaint()` creates a new `NCRP-2026-###` case + complaint and routes it
  into the live case list — the Bank/FI portal picks it up immediately because
  it reads live `useTrinity()` cases.

### `src/lib/trinity/engine.ts` — the Prototype Predictive Model

- Deterministic, fully explainable heuristic scoring engine (no ML training).
- Scores every ATM cluster against a case using five transparent factors and
  returns ranked clusters, risk score, confidence, predicted time window,
  similar historical cases, low-confidence abstention, nearest police station,
  priority and a plain-language narrative.

### Other demo-data references

- `src/routes/i4c.tsx`, `src/routes/admin.tsx` — read `stateRisk`, `alertTrend`
  and live cases/alerts/audit from the store.
- `src/routes/bank.tsx` — reads **live** cases from `useTrinity()` filtered by
  bank, plus the money-flow trail built by `buildFlow()`.
- `src/routes/trinity.*.tsx` — Police portal routes read live cases/alerts/audit
  from the store and run the engine on demand.

---

## Tech stack

- **TanStack Start v1** (React 19, SSR) + **Vite 7**
- **Tailwind CSS v4** via `src/styles.css`
- TypeScript, edge-function target

## Development

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Build with Lovable

Continue developing in the [Lovable editor](https://lovable.dev/projects/bc8113b3-ee74-49a7-bd20-2a3ba306f867).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.
