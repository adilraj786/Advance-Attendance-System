import { createFileRoute } from "@tanstack/react-router";
import { SemestersView } from "@/features/admin";

export const Route = createFileRoute("/_admin/semesters")({
  head: () => ({
    meta: [
      { title: "Smart Attendance System" },
      { name: "description", content: "Academic terms, active semester spans and working day allocations." },
      { property: "og:title", content: "Smart Attendance System" },
      { property: "og:description", content: "Semester management for academic terms." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SemestersView,
});
