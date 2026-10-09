import { createFileRoute } from "@tanstack/react-router";
import { LeaderboardView } from "@/features/engagement";

export const Route = createFileRoute("/_portal/leaderboard")({
  head: () => ({
    meta: [
      { title: "Smart Attendance System" },
      { name: "description", content: "Campus attendance streaks, batch rankings and department standings." },
      { property: "og:title", content: "Smart Attendance System" },
      { property: "og:description", content: "Department standings, batch champions and attendance streak badges." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LeaderboardView,
});
