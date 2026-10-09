import { useState } from "react";
import { Download, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader, Panel } from "@/components/common/section";
import { StatusPill } from "@/components/common/status-pill";
import { Button } from "@/components/ui/button";
import { ELIGIBILITY, OVERALL } from "@/lib/data";
import { cn } from "@/lib/utils";

import { useAuth } from "@/features/auth";

export function EligibilityView() {
  const { profile } = useAuth();
  const [downloading, setDownloading] = useState(false);
  const risky = ELIGIBILITY.filter((e) => e.state !== "Eligible");
  const overallState = OVERALL.percent >= 80 ? "Eligible" : OVERALL.percent >= 75 ? "Borderline" : "Not eligible";
  const tone = overallState === "Eligible" ? "present" : overallState === "Borderline" ? "leave" : "absent";

  const handleDownloadHallTicket = () => {
    setDownloading(true);
    toast.info("Verifying departmental ledger and signatures…");

    setTimeout(() => {
      setDownloading(false);
      const studentName = profile?.name || "Ananya Deshpande";
      const studentRoll = profile?.rollNumber || "21CS042";
      const studentDept = profile?.department || "Computer Science & Engineering";
      const timestamp = new Date().toLocaleDateString("en-IN", { dateStyle: "full" });

      const hallTicketHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SVIT - Examination Hall Ticket - ${studentRoll}</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 30px; }
    .ticket { max-width: 800px; margin: 0 auto; background: #ffffff; border: 2px solid #0f172a; border-radius: 12px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
    .header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
    .logo { font-size: 24px; font-weight: 800; letter-spacing: 1px; color: #1e3a8a; }
    .subhead { font-size: 13px; color: #64748b; margin-top: 4px; }
    .title { font-size: 18px; font-weight: 700; margin-top: 14px; text-transform: uppercase; background: #f1f5f9; display: inline-block; padding: 6px 16px; border-radius: 6px; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin: 24px 0; background: #f8fafc; padding: 18px; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 14px; }
    .meta-item strong { color: #475569; }
    .status-badge { display: inline-block; background: #dcfce7; color: #166534; padding: 4px 10px; border-radius: 9999px; font-weight: 700; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
    th { background: #1e293b; color: #ffffff; text-align: left; padding: 10px 12px; }
    td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; }
    tr:nth-child(even) { background: #f8fafc; }
    .barcode { margin-top: 30px; text-align: center; font-family: monospace; font-size: 24px; letter-spacing: 8px; background: #f1f5f9; padding: 12px; border: 1px dashed #94a3b8; border-radius: 6px; }
    .footer { margin-top: 36px; display: flex; justify-content: space-between; align-items: flex-end; padding-top: 20px; border-top: 1px solid #cbd5e1; }
    .sign-box { text-align: center; font-size: 12px; }
    .sign-line { width: 160px; border-top: 1px solid #334155; margin-bottom: 4px; }
    @media print { body { background: #ffffff; padding: 0; } .ticket { box-shadow: none; border: 1px solid #000; } }
  </style>
</head>
<body>
  <div class="ticket">
    <div class="header">
      <div class="logo">SVIT INSTITUTION OF TECHNOLOGY</div>
      <div class="subhead">Autonomous Campus · Affiliated with Technological University · ISO 9001:2015</div>
      <div class="title">End-Semester Examination Admit Card · Odd Term 2026-27</div>
    </div>

    <div class="meta-grid">
      <div class="meta-item"><strong>Student Name:</strong> ${studentName}</div>
      <div class="meta-item"><strong>University Roll No:</strong> ${studentRoll}</div>
      <div class="meta-item"><strong>Department:</strong> ${studentDept}</div>
      <div class="meta-item"><strong>Semester:</strong> Semester V (Third Year)</div>
      <div class="meta-item"><strong>Overall Attendance:</strong> ${OVERALL.percent}% (${OVERALL.attended}/${OVERALL.total} Hrs)</div>
      <div class="meta-item"><strong>Status:</strong> <span class="status-badge">PROVISIONALLY CLEARED</span></div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Course Code</th>
          <th>Course Title</th>
          <th>Type</th>
          <th>Attendance</th>
          <th>Clearance</th>
        </tr>
      </thead>
      <tbody>
        ${ELIGIBILITY.map(
          (c) => `<tr>
            <td style="font-family: monospace; font-weight: bold;">${c.code}</td>
            <td>${c.name}</td>
            <td>Theory / Lab</td>
            <td>${c.percent}%</td>
            <td style="color: ${c.percent >= 75 ? "#16a34a" : "#ca8a04"}; font-weight: bold;">${c.state.toUpperCase()}</td>
          </tr>`
        ).join("")}
      </tbody>
    </table>

    <div class="barcode">
      |||| | ||||| ||| ||||||| | |||| || ||| | ${studentRoll}
    </div>

    <div class="footer">
      <div style="font-size: 11px; color: #64748b;">
        Issued on: ${timestamp}<br>
        Security Hash: SVIT-AUTH-${Math.random().toString(36).substring(2, 9).toUpperCase()}
      </div>
      <div class="sign-box">
        <div class="sign-line"></div>
        <strong>Dr. Kavita Nair</strong><br>
        Dean of Academics & Examination
      </div>
    </div>
  </div>
</body>
</html>`;

      const blob = new Blob([hallTicketHtml], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `SVIT_Exam_Hall_Ticket_${studentRoll}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 2000);

      toast.success("Provisional Hall Ticket Downloaded!", {
        description: `Downloaded SVIT_Exam_Hall_Ticket_${studentRoll}.html`,
      });
    }, 800);
  };

  return (
    <AppShell>
      <PageHeader
        eyebrow="Semester V · End-Term Examination Clearance"
        title="Exam eligibility status"
        description="University statutory norm: ≥75% aggregate attendance required prior to issuing examination admit cards."
        action={
          <Button
            onClick={handleDownloadHallTicket}
            disabled={downloading}
            className="h-10 px-4 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 shadow-xs font-semibold transition-all"
          >
            <Download className="mr-2 h-4 w-4" />
            {downloading ? "Generating Admit Card…" : "Download Admit Card"}
          </Button>
        }
      />

      <Panel bodyClassName="p-6">
        <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <StatusPill tone={tone}>{overallState}</StatusPill>
              <span className="text-xs text-muted-foreground">Audit timestamp: 17 Aug 2026 · Verified by Registrar</span>
            </div>
            <p className="mt-3 font-display text-2xl font-bold text-foreground">
              You are provisionally eligible for all 7 theory & practical papers
            </p>
            <p className="mt-2 max-w-xl text-xs leading-relaxed text-muted-foreground">
              Aggregate attendance is <strong className="text-foreground">{OVERALL.percent}%</strong> ({OVERALL.attended}/{OVERALL.total} lecture hours). Two courses sit near the threshold; attending the remaining scheduled sessions secures unconditional hall ticket issue.
            </p>
          </div>

          <div className="shrink-0 rounded-2xl border border-border bg-card p-5 text-center shadow-2xs">
            <p className="font-display text-4xl font-bold tabular leading-none text-accent">{OVERALL.percent}%</p>
            <p className="mt-2 text-xs font-semibold text-muted-foreground">Institutional Cutoff 75%</p>
            <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-present">
              <CheckCircle2 className="h-3.5 w-3.5" /> +8.4% Safety Buffer
            </span>
          </div>
        </div>
      </Panel>

      <Panel
        title="Per-Course Clearance Breakdown"
        description={`${risky.length} course${risky.length === 1 ? "" : "s"} requiring attention prior to term closure`}
        bodyClassName="p-0"
      >
        <ul className="divide-y divide-border/60">
          {ELIGIBILITY.map((e) => {
            const t = e.state === "Eligible" ? "present" : e.state === "Borderline" ? "leave" : "absent";
            return (
              <li key={e.code} className="grid gap-3 p-4 sm:grid-cols-[minmax(0,1.2fr)_180px_auto] sm:items-center hover:bg-muted/20 transition-colors">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{e.name}</p>
                  <p className="font-mono text-xs text-muted-foreground mt-0.5">{e.code} · Theory Course</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, e.percent)}%` }}
                      transition={{ duration: 0.6 }}
                      className={cn("h-full", e.percent >= 75 ? "bg-present" : "bg-absent")}
                    />
                  </div>
                  <span className="tabular text-xs font-bold text-foreground w-12 text-right">{e.percent}%</span>
                </div>

                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <span className="text-xs text-muted-foreground font-medium">
                    {e.need > 0 ? (
                      <span className="text-absent font-semibold">{e.need} more classes needed</span>
                    ) : (
                      <span className="text-present font-semibold flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Requirement cleared
                      </span>
                    )}
                  </span>
                  <StatusPill tone={t}>{e.state}</StatusPill>
                </div>
              </li>
            );
          })}
        </ul>
      </Panel>
    </AppShell>
  );
}
