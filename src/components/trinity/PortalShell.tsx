import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { ShieldCheck, Database, ScrollText, LogOut, Lock } from "lucide-react";
import { ROLE_LABEL, useTrinity, type Role } from "@/lib/trinity/store";
import { cn } from "@/lib/utils";

export interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
  exact?: boolean;
}

export function PortalShell({
  role,
  portalName,
  portalTag,
  nav,
  children,
}: {
  role: Role;
  portalName: string;
  portalTag: string;
  nav: NavItem[];
  children: ReactNode;
}) {
  const { role: current, logout, hydrated } = useTrinity();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

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
            limited to <strong>{ROLE_LABEL[role]}</strong> — role-based access is enforced in this
            prototype.
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

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border/60 bg-sidebar/70 backdrop-blur-xl md:flex">
        <div className="px-5 py-6">
          <p className="label-xs">{portalTag}</p>
          <p className="mt-1 font-display text-sm tracking-[0.18em] text-primary">{portalName}</p>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {nav.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-primary/12 text-primary"
                    : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                )}
              >
                <span className={cn("shrink-0", active ? "text-primary" : "text-muted-foreground")}>
                  {item.icon}
                </span>
                {item.label}
                {active ? <span className="ml-auto h-4 w-0.5 rounded bg-primary" /> : null}
              </Link>
            );
          })}
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
          <div className="min-w-0">
            <p className="label-xs">Prototype environment</p>
            <p className="truncate text-sm">{portalName}</p>
          </div>
          <nav className="ml-auto hidden max-w-[52%] gap-1 overflow-x-auto scroll-slim md:hidden">
            {nav.map((i) => (
              <Link key={i.to} to={i.to} className="whitespace-nowrap px-2 py-1 text-xs">
                {i.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-[11px] text-primary sm:inline">
              {ROLE_LABEL[role]}
            </span>
            <button
              onClick={() => {
                logout();
                void navigate({ to: "/", replace: true });
              }}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              <LogOut className="size-3.5" /> Exit
            </button>
          </div>
        </header>

        <div className="md:hidden">
          <nav className="flex gap-1 overflow-x-auto border-b border-border/60 px-3 py-2 scroll-slim">
            {nav.map((i) => {
              const active = i.exact ? pathname === i.to : pathname.startsWith(i.to);
              return (
                <Link
                  key={i.to}
                  to={i.to}
                  className={cn(
                    "whitespace-nowrap rounded-md px-3 py-1.5 text-xs",
                    active ? "bg-primary/12 text-primary" : "text-muted-foreground",
                  )}
                >
                  {i.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <main key={pathname} className="fade-up min-w-0 flex-1 p-5 lg:p-7">
          {children}
        </main>
      </div>
    </div>
  );
}
