import { createFileRoute } from "@tanstack/react-router";
import { HolidaysView } from "@/features/admin";

export const Route = createFileRoute("/_admin/holidays")({
  head: () => ({
    meta: [
      { title: "Smart Attendance System" },
      { name: "description", content: "Campus holiday calendar, institutional observances and non-instructional days." },
      { property: "og:title", content: "Smart Attendance System" },
      { property: "og:description", content: "Academic holiday schedule for the term." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HolidaysView,
});
