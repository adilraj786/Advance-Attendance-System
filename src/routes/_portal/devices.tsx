import { createFileRoute } from "@tanstack/react-router";
import { DevicesView } from "@/features/security";

export const Route = createFileRoute("/_portal/devices")({
  head: () => ({
    meta: [
      { title: "Smart Attendance System" },
      { name: "description", content: "Active browser sessions, device fingerprints and authorized hardware." },
      { property: "og:title", content: "Smart Attendance System" },
      { property: "og:description", content: "Hardware fingerprint binding and active session manager." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DevicesView,
});
