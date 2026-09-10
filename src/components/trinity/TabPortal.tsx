import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ShieldCheck, Database, ScrollText, LogOut, Lock, ArrowLeft } from "lucide-react";
import { ROLE_LABEL, useTrinity, type Role } from "@/lib/trinity/store";
import { cn } from "@/lib/utils";

export interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
  render: () => ReactNode;
}

/** Sidebar portal driven by local tab state (used by portals without deep routes). */
export function TabPortal({
  role,
  portalName,
  portalTag,
  tabs,
}: {
  role: Role;
  portalName: string;
  portalTag: string;
  tabs: Tab[];
}) {
  const [active, setActive] = useState(tabs[0]?.id ?? "");
  const [history, setHistory] = useState<string[]>([]);
  const { role: current, logout, hydrated } = useTrinity();
  const navigate = useNavigate();

  const openTab = (id: string) => {
    if (id === active) return;
    setHistory((h) => [...h, active]);
    setActive(id);
  };

  const goBack = () => {
    if (history.length > 0) {
      setActive(history[history.length - 1]!);
      setHistory((h) => h.slice(0, -1));
    } else {
      void navigate({ to: "/" });
    }
  };

  useEffect(() => {
    if (hydrated && current === null) void navigate({ to: "/", replace: true });
  }, [current, hydrated, navigate]);

  if (!hydrated) return null;

  if (current !== null && current !== role) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="panel max-w-md p-8 text-center">
          <Lock className="mx-auto size-6 text-primary" />
          <h1 className="mt-4 text-lg">Access restricted</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your demo session is signed in as <strong>{ROLE_LABEL[current]}</strong>. This portal is
            limited to <strong>{ROLE_LABEL[role]}</strong>.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex rounded-md border border-primary/40 bg-primary/10 px-4 py-2 text-sm text-primary"
          >
            Switch role
          </Link>
        </div>
      </div>
    );
  }

  const current_tab = tabs.find((t) => t.id === active) ?? tabs[0];

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border/60 bg-sidebar/70 backdrop-blur-xl md:flex">
        <div className="px-5 py-6">
          <p className="label-xs">{portalTag}</p>
          <p className="mt-1 font-display text-sm tracking-[0.18em] text-primary">{portalName}</p>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => openTab(t.id)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition-colors",
                active === t.id
                  ? "bg-primary/12 text-primary"
                  : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60",
              )}
            >
              <span className={active === t.id ? "text-primary" : "text-muted-foreground"}>
                {t.icon}
              </span>
              {t.label}
              {active === t.id ? <span className="ml-auto h-4 w-0.5 rounded bg-primary" /> : null}
            </button>
          ))}
        </nav>
        <div className="space-y-2 border-t border-border/60 px-5 py-4 text-[11px] text-muted-foreground">
          <p className="flex items-center gap-2">
            <ShieldCheck className="size-3.5 text-primary" /> Authorized access
          </p>
          <p className="flex items-center gap-2">
            <Database className="size-3.5 text-primary" /> Synthetic demo data
          </p>
          <p className="flex items-center gap-2">
            <ScrollText className="size-3.5 text-primary" /> Activity logged
          </p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-border/60 bg-background/70 px-5 py-3 backdrop-blur-xl">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
          >
            <ArrowLeft className="size-3.5" /> Back
          </button>
          <div className="min-w-0">
            <p className="label-xs">Prototype environment</p>
            <p className="truncate text-sm">{portalName}</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-[11px] text-primary sm:inline">
              {ROLE_LABEL[role]}
            </span>
            <button
              onClick={() => {
                logout();
                void navigate({ to: "/", replace: true });
              }}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground"
            >
              <LogOut className="size-3.5" /> Exit
            </button>
          </div>
        </header>

        <nav className="flex gap-1 overflow-x-auto border-b border-border/60 px-3 py-2 scroll-slim md:hidden">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => openTab(t.id)}
              className={cn(
                "whitespace-nowrap rounded-md px-3 py-1.5 text-xs",
                active === t.id ? "bg-primary/12 text-primary" : "text-muted-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <main key={active} className="fade-up min-w-0 flex-1 p-5 lg:p-7">
          {current_tab?.render()}
        </main>
      </div>
    </div>
  );
}
