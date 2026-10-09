import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { CalendarDays, MessageSquare, TrendingDown, MailCheck } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { AttendanceRing } from "@/features/student/components/attendance-ring";
import { NotificationList } from "@/components/layout/notifications-panel";
import { WeeklyAiSummary } from "@/features/engagement/components/ai-summary";
import { PageHeader, Panel } from "@/components/common/section";
import { StatCard } from "@/components/common/stat-card";
import { StatusPill } from "@/components/common/status-pill";
import { Button } from "@/components/ui/button";
import { OVERALL, PARENT_WEEK, SUBJECTS, pct } from "@/lib/data";
import { useAuth } from "@/features/auth";

export function ParentDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const risky = SUBJECTS.filter((s) => pct(s.attended, s.total) < 75);
  const [resending, setResending] = useState(false);

  const wardDisplay = profile?.wardName || "Ananya Deshpande (21CS042)";
  const parentPhone = profile?.phone || "+91 98220 41123";

  const handleContactMentor = () => {
    navigate({ to: "/messages" });
    toast.info("Connecting to Class Teacher (Prof. Rajeev Iyer)…");
  };

  const handleResendDigest = () => {
    setResending(true);
    toast.info("Generating weekly attendance digest…");

    setTimeout(() => {
      setResending(false);
      toast.success("Weekly attendance digest dispatched!", {
        description: `SMS & Email sent to registered parent contact (${parentPhone}).`,
      });
    }, 1000);
  };

  return (
    <AppShell>
      <PageHeader
        eyebrow={`Ward · ${wardDisplay}`}
        title="Parent attendance portal"
        description="B.Tech Computer Science & Engineering · Semester V · Section A"
        action={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => navigate({ to: "/timetable" })}
              className="h-10 px-4 rounded-xl border-border hover:bg-muted font-medium transition-all text-xs"
            >
              <CalendarDays className="mr-2 h-4 w-4 text-accent" /> Ward's Timetable
            </Button>
            <Button
              variant="outline"
              onClick={handleResendDigest}
              disabled={resending}
              className="h-10 px-4 rounded-xl border-border hover:bg-muted/50 font-medium transition-all text-xs"
            >
              <MailCheck className="mr-2 h-4 w-4" /> Send Weekly Digest
            </Button>
            <Button
              onClick={handleContactMentor}
              className="h-10 px-4 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 shadow-xs font-semibold transition-all text-xs"
            >
              <MessageSquare className="mr-2 h-4 w-4" /> Chat With Class Mentor
            </Button>
          </div>
        }
      />

      <WeeklyAiSummary subject="Ananya" />

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Panel className="flex flex-col items-center gap-4 p-6 text-center">
          <AttendanceRing percent={OVERALL.percent} label="Term Aggregate" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            Current aggregate is <strong className="text-foreground">{OVERALL.percent}%</strong>. Ward is safely above the 75% threshold with 9 permissible leaves remaining.
          </p>
        </Panel>

        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard label="Classes this week" value="18/26" hint="Fri absent (fever notice)" icon={CalendarDays} tone="leave" />
          <StatCard label="Subjects at risk" value={String(risky.length)} hint="DAA & Computer Networks" icon={TrendingDown} tone="absent" />
          <StatCard label="Active leave requests" value="1" hint="Medical exemption pending" tone="leave" />
          <StatCard label="Mentor conversations" value="2" hint="Last note from Prof. Iyer" icon={MessageSquare} tone="present" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Panel
          title="Weekly Class Attendance Distribution"
          description="10 – 16 August 2026 · Automated QR Session Records"
          action={<StatusPill tone="accent">SMS + WhatsApp Enabled</StatusPill>}
          bodyClassName="p-5"
        >
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
            {PARENT_WEEK.map((d) => {
              const ratio = d.classes ? d.attended / d.classes : 0;
              const barColor = d.classes === 0 ? "bg-muted" : ratio === 1 ? "bg-present" : ratio === 0 ? "bg-absent" : "bg-leave";
              return (
                <div key={d.day} className="flex flex-col items-center gap-2">
                  <div className="flex h-28 w-full items-end rounded-xl bg-muted/40 p-1">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(ratio * 100, 8)}%` }}
                      transition={{ duration: 0.5 }}
                      className={`w-full rounded-lg ${barColor} shadow-2xs`}
                    />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground">{d.day}</span>
                  <span className="tabular text-xs font-bold text-foreground">
                    {d.attended}/{d.classes}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-6 rounded-2xl border border-border/80 bg-surface p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-accent">Mentor Advisory Note</p>
              <span className="text-[11px] text-muted-foreground">14 Aug 2026</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-foreground/90 font-medium">
              “Ananya had to miss Friday sessions due to fever. Her Computer Networks attendance is currently at 68.4% — please advise her to attend the compensatory review session this Tuesday.”
            </p>
            <p className="mt-2 text-[11px] text-muted-foreground text-right">— Prof. Rajeev Iyer (HOD Mentor)</p>
          </div>
        </Panel>

        <Panel title="Recent Campus SMS Alerts" description="Dispatched to primary guardian (+91 98220 41123)" bodyClassName="px-4 py-0">
          <NotificationList compact />
        </Panel>
      </div>
    </AppShell>
  );
}
