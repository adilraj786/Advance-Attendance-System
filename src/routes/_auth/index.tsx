import { createFileRoute } from "@tanstack/react-router";
import { LoginView } from "@/features/auth";

export const Route = createFileRoute("/_auth/")({
  head: () => ({
    meta: [
      { title: "Smart Attendance System" },
      { name: "description", content: "Institutional single sign-on for students, faculty and staff." },
      { property: "og:title", content: "Smart Attendance System" },
      { property: "og:description", content: "Secure portal login with multi-role identity federation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LoginView,
});
