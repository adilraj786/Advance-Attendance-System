import { createFileRoute } from "@tanstack/react-router";
import { MaterialsView } from "@/features/teacher";

export const Route = createFileRoute("/_teacher/materials")({
  head: () => ({
    meta: [
      { title: "Smart Attendance System" },
      { name: "description", content: "Distribute lecture slides, syllabus notes, lab sheets and assignments." },
      { property: "og:title", content: "Smart Attendance System" },
      { property: "og:description", content: "Curriculum repository and coursework distribution." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MaterialsView,
});
