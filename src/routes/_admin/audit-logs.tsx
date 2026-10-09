import { createFileRoute } from "@tanstack/react-router";
import { AuditLogsView } from "@/features/admin";

export const Route = createFileRoute("/_admin/audit-logs")({
  head: () => ({
    meta: [
      { title: "Smart Attendance System" },
      { name: "description", content: "Immutable security trail of QR rotations, manual overrides and administrative logins." },
      { property: "og:title", content: "Smart Attendance System" },
      { property: "og:description", content: "Security and compliance audit trail." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuditLogsView,
});
