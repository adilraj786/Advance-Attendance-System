import { createFileRoute } from "@tanstack/react-router";
import { EligibilityView } from "@/features/student";

export const Route = createFileRoute("/_student/eligibility")({
  head: () => ({
    meta: [
      { title: "Smart Attendance System" },
      { name: "description", content: "End-semester examination eligibility forecast and hall ticket issuance status." },
      { property: "og:title", content: "Smart Attendance System" },
      { property: "og:description", content: "75% attendance criterion simulator and hall ticket readiness." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EligibilityView,
});
