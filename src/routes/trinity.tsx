import { createFileRoute, Outlet } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FolderSearch,
  BrainCircuit,
  Map,
  BellRing,
  FileText,
  ScrollText,
} from "lucide-react";
import { PortalShell } from "@/components/trinity/PortalShell";

export const Route = createFileRoute("/trinity")({
  head: () => ({
    meta: [
      { title: "TRINITY Predictive Intelligence Portal" },
      {
        name: "description",
        content:
          "Authorized investigator workspace: cases, AI predictions, risk heatmap, alerts, reports and audit log on synthetic demo data.",
      },
      { property: "og:title", content: "TRINITY Predictive Intelligence Portal" },
      {
        property: "og:description",
        content: "Investigator workspace forecasting likely cash-out clusters and time windows.",
      },
    ],
  }),
  component: TrinityLayout,
});

function TrinityLayout() {
  return (
    <PortalShell
      role="police"
      portalName="TRINITY Predictive Intelligence"
      portalTag="Police / State & UT LEA"
      nav={[
        { to: "/trinity", label: "Dashboard", icon: <LayoutDashboard className="size-4" />, exact: true },
        { to: "/trinity/cases", label: "Cases", icon: <FolderSearch className="size-4" /> },
        { to: "/trinity/predictions", label: "AI Predictions", icon: <BrainCircuit className="size-4" /> },
        { to: "/trinity/heatmap", label: "Risk Heatmap", icon: <Map className="size-4" /> },
        { to: "/trinity/alerts", label: "Alerts", icon: <BellRing className="size-4" /> },
        { to: "/trinity/reports", label: "Reports", icon: <FileText className="size-4" /> },
        { to: "/trinity/audit", label: "Audit Log", icon: <ScrollText className="size-4" /> },
      ]}
    >
      <Outlet />
    </PortalShell>
  );
}
