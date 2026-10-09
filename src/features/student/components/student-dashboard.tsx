import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  CalendarRange,
  Clock,
  QrCode,
  TrendingDown,
  Radio,
  Building,
  Table2,
  LayoutDashboard,
  BarChart3,
  CalendarDays,
  FileUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/layout/app-shell";
import { AttendanceRing } from "./attendance-ring";
import { AttendanceHeatmap } from "./attendance-heatmap";
import { DailyAttendanceMatrix } from "./daily-attendance-matrix";
import { DataTable, type Column } from "@/components/common/data-table";
import { PageHeader, Panel } from "@/components/common/section";
import { StatCard } from "@/components/common/stat-card";
import { StatusPill } from "@/components/common/status-pill";
import { WeeklyAiSummary } from "@/features/engagement/components/ai-summary";
import { Button } from "@/components/ui/button";
import { OVERALL, SUBJECTS, pct, type SubjectRow } from "@/lib/data";
import { AttendanceService, type LiveSessionState, type TimetableSlot } from "@/features/attendance/attendance-service";
import { cn } from "@/lib/utils";

import { useAuth } from "@/features/auth";

const columns: Column<SubjectRow>[] = [
  { key: "code", header: "Code", width: "88px", sortable: true, render: (r) => <span className="tabular text-xs text-muted-foreground">{r.code}</span> },
  { key: "name", header: "Subject", sortable: true, render: (r) => <span className="font-medium">{r.name}</span> },
  { key: "faculty", header: "Faculty", render: (r) => <span className="text-xs text-muted-foreground">{r.faculty}</span> },
  { key: "attended", header: "Attended", align: "right", sortable: true, render: (r) => <span className="tabular text-xs">{r.attended}/{r.total}</span> },
  {
    key: "total",
    header: "Attendance",
    align: "right",
    sortable: true,
    render: (r) => {
      const p = pct(r.attended, r.total);
      return (
        <div className="flex items-center justify-end gap-2">
          <div className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-muted sm:block">
            <div
              className={p >= 75 ? "h-full bg-present" : "h-full bg-absent"}
              style={{ width: `${p}%` }}
            />
          </div>
          <span className={"tabular text-sm font-medium " + (p >= 75 ? "" : "text-absent")}>{p}%</span>
        </div>
      );
    },
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 350, damping: 30 } },
};

export function StudentDashboard() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<"matrix" | "overview" | "timetable">("matrix");
  const [session, setSession] = useState<LiveSessionState>(AttendanceService.getLiveSession());
  const [studentTimetable, setStudentTimetable] = useState<TimetableSlot[]>(AttendanceService.getStudentTimetable("Div A"));
  const [selectedDay, setSelectedDay] = useState<"Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat">("Mon");

  useEffect(() => {
    const unsubSession = AttendanceService.listenLiveSession((s: LiveSessionState) => setSession(s));
    const unsubTimetable = AttendanceService.listenTimetable(() => {
      setStudentTimetable(AttendanceService.getStudentTimetable("Div A"));
    });
    return () => {
      unsubSession();
      unsubTimetable();
    };
  }, []);

  const atRisk = SUBJECTS.filter((s) => pct(s.attended, s.total) < 75);
  const daySlots = studentTimetable.filter((s) => s.day === selectedDay);
  const studentName = profile?.name ? profile.name.split(" ")[0] : "Ananya";
  const studentEyebrow = profile?.department ? `Semester V · ${profile.department}` : "Semester V · Computer Science Div A";

  return (
    <AppShell>
      <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-6">
        <motion.div variants={item}>
          <PageHeader
            eyebrow={studentEyebrow}
            title={`Good day, ${studentName}`}
            description={
              session.active
                ? `Live session open: ${session.code} ${session.subject} in ${session.room} with ${session.faculty}.`
                : "You have verified presence across 7 registered courses. Detention line: 75%."
            }
            action={
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <Button asChild variant="outline" className="h-10 px-4 rounded-xl border-border hover:bg-muted font-medium text-xs flex-1 sm:flex-initial">
                  <Link to="/materials">
                    <FileUp className="mr-2 h-4 w-4" /> Study Materials
                  </Link>
                </Button>
                <Button asChild className="h-10 px-5 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 shadow-xs font-semibold text-xs transition-all flex-1 sm:flex-initial">
                  <Link to="/scan">
                    <QrCode className="mr-2 h-4 w-4" /> Scan Attendance
                  </Link>
                </Button>
              </div>
            }
          />
        </motion.div>

        {/* Live Active Class Banner */}
        {session.active && (
          <motion.div
            variants={item}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border-2 border-accent/70 bg-card p-4 sm:p-5 shadow-md"
          >
            <div className="flex items-start gap-3.5 min-w-0 flex-1">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent/20 text-accent font-bold">
                <Radio className="h-5 w-5 animate-pulse" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill tone="accent">SESSION BROADCASTING NOW</StatusPill>
                  <span className="font-mono text-xs font-bold text-foreground">
                    Room {session.room}
                  </span>
                  <span className="text-[11px] font-semibold text-accent">
                    {session.course} · {session.division}
                  </span>
                </div>
                <h4 className="font-display text-sm font-bold text-foreground mt-1 break-words">
                  {session.code} · {session.subject} ({session.type})
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5 break-words">
                  Instructor: <strong className="text-foreground">{session.faculty}</strong> · {session.department}
                </p>
              </div>
            </div>

            <Button asChild className="h-10 px-5 rounded-xl bg-accent text-accent-foreground font-semibold text-xs shadow-xs w-full sm:w-auto shrink-0">
              <Link to="/scan">
                <QrCode className="mr-2 h-4 w-4" /> Mark My Attendance
              </Link>
            </Button>
          </motion.div>
        )}

        {/* Navigation View Switcher */}
        <motion.div variants={item} className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
          <Button
            variant={activeTab === "matrix" ? "default" : "outline"}
            onClick={() => setActiveTab("matrix")}
            className={cn(
              "h-10 px-3.5 rounded-xl font-semibold text-xs transition-all flex-1 sm:flex-initial text-center justify-center",
              activeTab === "matrix" ? "bg-accent text-accent-foreground shadow-xs" : "border-border text-muted-foreground",
            )}
          >
            <BarChart3 className="mr-1.5 h-4 w-4" /> Daily Ledger Matrix
          </Button>
          <Button
            variant={activeTab === "overview" ? "default" : "outline"}
            onClick={() => setActiveTab("overview")}
            className={cn(
              "h-10 px-3.5 rounded-xl font-semibold text-xs transition-all flex-1 sm:flex-initial text-center justify-center",
              activeTab === "overview" ? "bg-accent text-accent-foreground shadow-xs" : "border-border text-muted-foreground",
            )}
          >
            <LayoutDashboard className="mr-1.5 h-4 w-4" /> Subject Analytics
          </Button>
          <Button
            variant={activeTab === "timetable" ? "default" : "outline"}
            onClick={() => setActiveTab("timetable")}
            className={cn(
              "h-10 px-3.5 rounded-xl font-semibold text-xs transition-all flex-1 sm:flex-initial text-center justify-center",
              activeTab === "timetable" ? "bg-accent text-accent-foreground shadow-xs" : "border-border text-muted-foreground",
            )}
          >
            <Table2 className="mr-1.5 h-4 w-4" /> Timetable
          </Button>
        </motion.div>

        {/* TAB 1: DAILY ATTENDANCE LEDGER MATRIX (EXACT FROM SCREENSHOT) */}
        {activeTab === "matrix" && (
          <motion.div variants={item} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <DailyAttendanceMatrix />
          </motion.div>
        )}

        {/* TAB 2: OVERVIEW & SUBJECT BREAKDOWN */}
        {activeTab === "overview" && (
          <motion.div variants={item} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
              <Panel className="flex flex-col items-center justify-center gap-4 p-6 text-center">
                <AttendanceRing percent={OVERALL.percent} />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {OVERALL.attended} of {OVERALL.total} sessions
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    You may miss <span className="font-semibold text-foreground">9 more</span> classes this term
                    before dropping below 75%.
                  </p>
                </div>
              </Panel>

              <div className="grid gap-4 sm:grid-cols-2">
                <StatCard label="This week" value="22/26" hint="sessions attended" icon={CalendarRange} tone="present" delta="+4.1%" />
                <StatCard label="Subjects at risk" value={atRisk.length} hint="below 75%" icon={TrendingDown} tone="absent" />
                <StatCard label="Current streak" value="11" unit="days" hint="best this term: 19" icon={Clock} />
                <StatCard label="Leaves taken" value="3" hint="2 medical · 1 casual" tone="leave" />
              </div>
            </div>

            <WeeklyAiSummary />

            <Panel
              title="Subject-wise breakdown"
              description="Sortable · updated in real time with backend ledger"
              action={<StatusPill tone="accent">Semester V</StatusPill>}
            >
              <DataTable columns={columns} rows={SUBJECTS} searchKeys={["name", "code", "faculty"]} searchPlaceholder="Search subject or faculty…" />
            </Panel>

            <Panel title="Attendance calendar heatmap" description="April – August 2026 · Mon to Sun columns">
              <AttendanceHeatmap />
            </Panel>
          </motion.div>
        )}

        {/* TAB 3: MY WEEKLY CLASS TIMETABLE */}
        {activeTab === "timetable" && (
          <motion.div variants={item} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-12">
            <Panel
              title="Weekly Academic Timetable (B.Tech CSE Div A)"
              description="Live timetable synchronized with Firestore"
              action={
                <div className="flex gap-1.5 bg-muted/60 p-1 rounded-xl">
                  {(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setSelectedDay(d)}
                      className={cn(
                        "px-3 py-1 text-xs font-bold rounded-lg transition-all",
                        selectedDay === d ? "bg-accent text-accent-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              }
            >
              {daySlots.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  No lectures or practical labs scheduled for {selectedDay}.
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {daySlots.map((slot) => {
                    const isLive = session.active && session.room === slot.room;
                    return (
                      <div
                        key={slot.id}
                        className={cn(
                          "rounded-2xl border p-4 transition-all shadow-2xs space-y-2.5",
                          isLive ? "border-accent bg-accent/5 ring-2 ring-accent/30" : "border-border bg-card",
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-accent px-2 py-0.5 rounded bg-accent/10">
                            {slot.timeSlot}
                          </span>
                          <StatusPill tone={isLive ? "present" : slot.type === "Lab / Practical" ? "accent" : "muted"}>
                            {isLive ? "LIVE NOW" : slot.type}
                          </StatusPill>
                        </div>

                        <div>
                          <h4 className="font-display text-sm font-bold text-foreground">
                            {slot.subjectCode} · {slot.subjectName}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Faculty: <strong className="text-foreground">{slot.facultyName}</strong>
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                          <span className="font-mono font-semibold text-accent flex items-center gap-1">
                            <Building className="h-3.5 w-3.5" /> {slot.room}
                          </span>
                          <span className="text-[11px] text-muted-foreground font-medium">
                            {slot.course} ({slot.division})
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Panel>
          </motion.div>
        )}
      </motion.div>
    </AppShell>
  );
}
