import { createFileRoute } from "@tanstack/react-router";
import { AnalyticsDashboard } from "@/features/analytics";

export const Route = createFileRoute("/_portal/analytics")({
  head: () => ({
    meta: [
      { title: "Smart Attendance System" },
      { name: "description", content: "Department-wise attendance histograms, low-attendance alerts and trends." },
      { property: "og:title", content: "Smart Attendance System" },
      { property: "og:description", content: "Detailed attendance trends, course averages and compliance charts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AnalyticsDashboard,
});
