import { createFileRoute } from "@tanstack/react-router";
import { useTrinity } from "@/lib/trinity/store";
import { BackLink, Panel } from "@/components/trinity/ui";

export const Route = createFileRoute("/trinity/audit")({
  component: AuditPage,
});

function AuditPage() {
  const { audit } = useTrinity();
  return (
    <div className="space-y-5">
      <BackLink fallback="/trinity" />
      <header>
        <p className="label-xs">Accountability trail</p>
        <h1 className="mt-1 text-2xl font-light">Audit Log</h1>
      </header>

      <Panel className="p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 text-left">
              {["Time", "User role", "Action", "Case ID"].map((h) => (
                <th key={h} className="label-xs px-4 py-3 font-normal">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {audit.map((a) => (
              <tr key={a.id} className="border-b border-border/40 last:border-0">
                <td className="px-4 py-2.5 font-mono text-[11px] text-muted-foreground">{a.time}</td>
                <td className="px-4 py-2.5 text-xs">{a.role}</td>
                <td className="px-4 py-2.5">{a.action}</td>
                <td className="px-4 py-2.5 font-mono text-xs text-primary">{a.caseId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
      <p className="text-[11px] text-muted-foreground">
        Every prototype action — complaint intake, analysis, prediction, alert handling and report
        generation — is recorded with role attribution.
      </p>
    </div>
  );
}
