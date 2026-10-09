import { createFileRoute } from "@tanstack/react-router";
import { QrScannerView } from "@/features/attendance";

export const Route = createFileRoute("/_student/scan")({
  head: () => ({
    meta: [
      { title: "Smart Attendance System" },
      { name: "description", content: "Scan classroom dynamic QR codes with device location and token validation." },
      { property: "og:title", content: "Smart Attendance System" },
      { property: "og:description", content: "Dynamic QR capture for rapid class attendance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: QrScannerView,
});
