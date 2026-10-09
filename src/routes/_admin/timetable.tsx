import { createFileRoute } from "@tanstack/react-router";
import { TimetableView } from "@/features/admin";

export const Route = createFileRoute("/_admin/timetable")({
  head: () => ({
    meta: [
      { title: "Smart Attendance System" },
      { name: "description", content: "Manage lecture slots, laboratory allocations and teacher rosters." },
      { property: "og:title", content: "Smart Attendance System" },
      { property: "og:description", content: "Configure campus-wide master timetable and section matrices." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TimetableView,
});
