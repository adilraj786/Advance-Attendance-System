import { createFileRoute } from "@tanstack/react-router";
import { TeacherDashboard } from "@/features/teacher";

export const Route = createFileRoute("/_teacher/teacher")({
  head: () => ({
    meta: [
      { title: "Smart Attendance System" },
      { name: "description", content: "Broadcast dynamic QR codes, monitor live student attendance and manually record entries." },
      { property: "og:title", content: "Smart Attendance System" },
      { property: "og:description", content: "Live classroom session console and manual attendance roster." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TeacherDashboard,
});
