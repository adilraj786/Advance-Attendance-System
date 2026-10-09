import { createFileRoute } from "@tanstack/react-router";
import { AdminDashboard } from "@/features/admin";

export const Route = createFileRoute("/_admin/admin")({
  head: () => ({
    meta: [
      { title: "Smart Attendance System" },
      { name: "description", content: "Institution-wide attendance trends, low-attendance alerts and academic master data." },
      { property: "og:title", content: "Smart Attendance System" },
      { property: "og:description", content: "Departments, courses and subjects at a glance for the registrar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminDashboard,
});
