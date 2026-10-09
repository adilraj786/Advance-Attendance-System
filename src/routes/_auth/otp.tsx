import { createFileRoute } from "@tanstack/react-router";
import { OtpView } from "@/features/auth";

export const Route = createFileRoute("/_auth/otp")({
  head: () => ({
    meta: [
      { title: "Smart Attendance System" },
      { name: "description", content: "Enter your 6-digit one-time password to complete two-factor authentication." },
      { property: "og:title", content: "Smart Attendance System" },
      { property: "og:description", content: "Two-factor authentication code entry." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OtpView,
});
