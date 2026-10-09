import { createFileRoute } from "@tanstack/react-router";
import { AnnouncementsView } from "@/features/academics";

export const Route = createFileRoute("/_portal/announcements")({
  head: () => ({
    meta: [
      { title: "Smart Attendance System" },
      { name: "description", content: "Campus circulars, exam notifications and timetable revisions." },
      { property: "og:title", content: "Smart Attendance System" },
      { property: "og:description", content: "Broadcast circulars, notices and holiday alerts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AnnouncementsView,
});
