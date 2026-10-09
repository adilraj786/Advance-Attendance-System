import { createFileRoute } from "@tanstack/react-router";
import { SettingsView } from "@/features/security";

export const Route = createFileRoute("/_portal/settings")({
  head: () => ({
    meta: [
      { title: "Smart Attendance System" },
      { name: "description", content: "Manage security settings, notifications and theme preferences." },
      { property: "og:title", content: "Smart Attendance System" },
      { property: "og:description", content: "User profile, notifications, biometric auth and theme settings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SettingsView,
});
