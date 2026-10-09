import { createFileRoute } from "@tanstack/react-router";
import { AssistantView } from "@/features/engagement";

export const Route = createFileRoute("/_portal/assistant")({
  head: () => ({
    meta: [
      { title: "Smart Attendance System" },
      { name: "description", content: "AI attendance advisor for safe-bunk calculations and eligibility forecasting." },
      { property: "og:title", content: "Smart Attendance System" },
      { property: "og:description", content: "Personal academic planning and attendance simulation assistant." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AssistantView,
});
