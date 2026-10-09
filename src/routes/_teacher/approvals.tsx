import { createFileRoute } from "@tanstack/react-router";
import { ApprovalsView } from "@/features/teacher";

export const Route = createFileRoute("/_teacher/approvals")({
  head: () => ({
    meta: [
      { title: "Smart Attendance System" },
      { name: "description", content: "Review and approve medical, on-duty and sports leave applications." },
      { property: "og:title", content: "Smart Attendance System" },
      { property: "og:description", content: "Student leave request inbox and duty sanction approvals." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ApprovalsView,
});
