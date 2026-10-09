import { createFileRoute } from "@tanstack/react-router";
import { StudentDashboard } from "@/features/student";

export const Route = createFileRoute("/_student/student")({
  head: () => ({
    meta: [
      { title: "Smart Attendance System" },
      { name: "description", content: "Overall attendance percentage, subject breakups, and today's schedule." },
      { property: "og:title", content: "Smart Attendance System" },
      { property: "og:description", content: "Personal attendance ledger, lecture stream and academic alerts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StudentDashboard,
});
