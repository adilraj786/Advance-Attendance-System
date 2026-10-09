import { createFileRoute } from "@tanstack/react-router";
import { ParentMessagesView } from "@/features/parent";

export const Route = createFileRoute("/_parent/messages")({
  head: () => ({
    meta: [
      { title: "Smart Attendance System" },
      { name: "description", content: "Direct communication channel between parents and assigned faculty mentors." },
      { property: "og:title", content: "Smart Attendance System" },
      { property: "og:description", content: "Mentor chat and parent enquiry messaging thread." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ParentMessagesView,
});
