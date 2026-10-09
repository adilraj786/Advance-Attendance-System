import { createFileRoute } from "@tanstack/react-router";
import { ParentDashboard } from "@/features/parent";

export const Route = createFileRoute("/_parent/parent")({
  head: () => ({
    meta: [
      { title: "Smart Attendance System" },
      { name: "description", content: "Weekly attendance digest, subject risks and alerts for your ward." },
      { property: "og:title", content: "Smart Attendance System" },
      { property: "og:description", content: "Parent oversight portal, weekly summaries and automated notifications." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ParentDashboard,
});
