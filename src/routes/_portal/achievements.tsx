import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_portal/achievements")({
  head: () => ({
    meta: [
      { title: "Smart Attendance System" },
    ],
  }),
  component: () => <Navigate to="/student" />,
});
