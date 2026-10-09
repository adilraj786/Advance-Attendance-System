import { createFileRoute } from "@tanstack/react-router";
import { LeaveView } from "@/features/academics";

export const Route = createFileRoute("/_portal/leave")({
  head: () => ({
    meta: [
      { title: "Smart Attendance System" },
      { name: "description", content: "Apply for medical leave, on-duty permissions or institutional duty waivers." },
      { property: "og:title", content: "Smart Attendance System" },
      { property: "og:description", content: "Leave request filing and digital medical certificate submission." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LeaveView,
});
