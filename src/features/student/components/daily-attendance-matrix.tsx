import { useState, useEffect } from "react";
import { ChevronDown, Calendar, X, History, BookOpen, Clock, User, Building, Radio, RefreshCw, Sparkles, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { AttendanceService, type DailyMatrixRow, type DailyMatrixSlot } from "@/features/attendance/attendance-service";
import { useAuth } from "@/features/auth";
import { EmptyState } from "@/components/common/section";
import { StatusPill } from "@/components/common/status-pill";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PreviousTerm {
  id: string;
  semester: string;
  termLabel: string;
  academicYear: string;
  percentage: number;
  present: number;
  total: number;
  absent: number;
  pending: number;
  noAttendance: number;
}

const PREVIOUS_TERMS_MOCK: PreviousTerm[] = [
  {
    id: "sem-4",
    semester: "4",
    termLabel: "Sem 4 · A.Y. 2025-26 - Even Semester",
    academicYear: "2025-26",
    percentage: 86.4,
    present: 142,
    total: 164,
    absent: 20,
    pending: 0,
    noAttendance: 2,
  },
  {
    id: "sem-3",
    semester: "3",
    termLabel: "Sem 3 · A.Y. 2025-26 - Odd Semester",
    academicYear: "2025-26",
    percentage: 88.1,
    present: 148,
    total: 168,
    absent: 18,
    pending: 0,
    noAttendance: 2,
  },
];

export function DailyAttendanceMatrix() {
  const { profile } = useAuth();
  const targetRoll = profile?.rollNumber || "21CS042";

  const [tab, setTab] = useState<"Current" | "Previous">("Current");
  const [data, setData] = useState(() => AttendanceService.getDailyAttendanceMatrix(targetRoll));
  const [selectedSlot, setSelectedSlot] = useState<{ row: DailyMatrixRow; slot: DailyMatrixSlot } | null>(null);
  const [selectedPrevTerm, setSelectedPrevTerm] = useState<string>("sem-4");
  const [markingSimulation, setMarkingSimulation] = useState(false);

  // Previous semester records
  const [previousTerms] = useState<PreviousTerm[]>(PREVIOUS_TERMS_MOCK);

  // Real-Time Live Subscription to Attendance Matrix Updates
  useEffect(() => {
    const unsub = AttendanceService.listenDailyAttendanceMatrix(
      (freshData: ReturnType<typeof AttendanceService.getDailyAttendanceMatrix>) => {
        setData(freshData);
      },
      targetRoll,
    );

    return () => unsub();
  }, [targetRoll]);

  const { stats, rows } = data;
  const currentPrev = previousTerms.find((t) => t.id === selectedPrevTerm) || previousTerms[0];

  // Quick simulation / check-in handler to demonstrate real-time live matrix updating
  const handleQuickCheckin = async () => {
    setMarkingSimulation(true);
    try {
      await AttendanceService.markAttendance({
        subject: "Design & Analysis of Algorithms (CS501)",
        room: "LH-301",
        faculty: "Prof. Rajeev Iyer",
        course: "B.Tech CSE",
        division: "Div A",
        studentId: targetRoll,
        studentName: profile?.name || "Ananya Deshpande",
        status: "present",
        timestamp: "Today · " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        device: "Client Web Dashboard",
      });

      toast.success("Attendance Marked & Matrix Live Updated! 🚀", {
        description: `Logged attendance for ${targetRoll}. Ledger refreshed in real-time.`,
      });
    } catch {
      toast.error("Could not complete check-in.");
    } finally {
      setMarkingSimulation(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header Tabs & Live Synchronized Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setTab("Current")}
            className={cn(
              "pb-2 font-display text-sm sm:text-base font-bold transition-all relative",
              tab === "Current"
                ? "text-primary after:absolute after:bottom-[-13px] after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Current Semester
          </button>
          <button
            onClick={() => setTab("Previous")}
            className={cn(
              "pb-2 font-display text-sm sm:text-base font-bold transition-all relative",
              tab === "Previous"
                ? "text-primary after:absolute after:bottom-[-13px] after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Previous Terms
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Live Sync Active</span>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={handleQuickCheckin}
            disabled={markingSimulation}
            className="h-7 text-[11px] font-semibold rounded-lg border-accent/40 bg-accent/10 text-accent hover:bg-accent/20"
          >
            <Sparkles className="h-3 w-3 mr-1" />
            {markingSimulation ? "Updating Matrix…" : "Simulate Live Check-in"}
          </Button>
        </div>
      </div>

      {tab === "Current" ? (
        <>
          {/* Current Semester Header Card with Progress Bar */}
          <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex flex-col items-center justify-center rounded-xl border border-border bg-surface px-3 py-1 text-center">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Sem</span>
                  <span className="font-display text-sm font-bold text-foreground">5</span>
                </span>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-foreground">A.Y. 2026-27 - Odd Semester</p>
                  <p className="text-[11px] text-muted-foreground">
                    {profile?.department || "B.Tech Computer Science & Engineering"} · Roll: {targetRoll}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-display text-base sm:text-lg font-bold tabular text-emerald-600 dark:text-emerald-400">
                  {stats.percentage}%
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* Aggregate Progress Bar */}
            <div className="mt-3.5 h-2.5 w-full overflow-hidden rounded-full bg-muted/60">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, stats.percentage)}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  stats.percentage >= 75 ? "bg-emerald-500" : "bg-rose-500",
                )}
              />
            </div>

            {/* 4 Summary Stat Badges (Present / Absent / Pending / No Attendance) */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-border/60 text-xs">
              <div className="flex items-center justify-between rounded-xl bg-emerald-500/10 px-3 py-2 border border-emerald-500/20">
                <span className="font-semibold text-emerald-700 dark:text-emerald-300">Present :</span>
                <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">
                  {stats.present} / {stats.total}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-rose-500/10 px-3 py-2 border border-rose-500/20">
                <span className="font-semibold text-rose-700 dark:text-rose-300">Absent :</span>
                <span className="font-mono font-bold text-rose-700 dark:text-rose-300">
                  {stats.absent} / {stats.total}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-amber-500/10 px-3 py-2 border border-amber-500/20">
                <span className="font-semibold text-amber-700 dark:text-amber-300">Pending :</span>
                <span className="font-mono font-bold text-amber-700 dark:text-amber-300">
                  {stats.pending} / {stats.total}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-sky-500/10 px-3 py-2 border border-sky-500/20">
                <span className="font-semibold text-sky-700 dark:text-sky-300">No Attendance :</span>
                <span className="font-mono font-bold text-sky-700 dark:text-sky-300">
                  {stats.noAttendance} / {stats.total}
                </span>
              </div>
            </div>
          </div>

          {/* Matrix Legend */}
          <div className="rounded-xl border border-border/80 bg-surface/80 px-4 py-2.5 text-xs leading-relaxed text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <span className="font-medium text-foreground">Legend:</span>
            <span className="inline-flex items-center gap-1.5"><strong className="text-emerald-600 dark:text-emerald-400">P</strong> = Present</span>
            <span className="inline-flex items-center gap-1.5"><strong className="text-rose-600 dark:text-rose-400">A</strong> = Absent</span>
            <span className="inline-flex items-center gap-1.5"><strong className="text-amber-600 dark:text-amber-400">H</strong> = Declared Holiday</span>
            <span className="inline-flex items-center gap-1.5"><strong className="text-sky-600 dark:text-sky-400">NA</strong> = No Attendance Recorded</span>
            <span className="inline-flex items-center gap-1.5"><strong className="text-muted-foreground">-</strong> = No Lecture / Lab Slot</span>
          </div>

          {/* Ledger Table Structure */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
                    <th className="py-3 px-3 sm:px-4 w-32">Date</th>
                    <th className="py-3 px-2 sm:px-3 text-center w-16 sm:w-20">Slot 1</th>
                    <th className="py-3 px-2 sm:px-3 text-center w-16 sm:w-20">Slot 2</th>
                    <th className="py-3 px-2 sm:px-3 text-center w-16 sm:w-20">Slot 3</th>
                    <th className="py-3 px-2 sm:px-3 text-center w-16 sm:w-20">Slot 4</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 font-medium">
                  {rows.map((r: DailyMatrixRow) => {
                    return (
                      <tr key={r.id} className="hover:bg-muted/20 transition-colors">
                        {/* Date Column */}
                        <td className="py-2.5 px-3 sm:px-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-semibold text-foreground text-xs">{r.dateDisplay}</span>
                            <span className="text-[10px] text-muted-foreground font-mono">{r.dayOfWeek}</span>
                          </div>
                        </td>

                        {/* Holiday Row Span or Slot Columns */}
                        {r.isHoliday ? (
                          <td colSpan={4} className="py-2.5 px-3 text-center bg-amber-500/5">
                            <span className="inline-flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400 text-xs tracking-wide">
                              <Calendar className="h-3.5 w-3.5" />
                              {r.holidayName || "Declared Holiday"} (H)
                            </span>
                          </td>
                        ) : (
                          r.slots.map((slot: DailyMatrixSlot) => {
                            const isPresent = slot.status === "P";
                            const isAbsent = slot.status === "A";
                            const isHoliday = slot.status === "H";
                            const isNone = slot.status === "-";

                            return (
                              <td key={slot.slotIndex} className="py-2 px-1 sm:px-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => setSelectedSlot({ row: r, slot })}
                                  className={cn(
                                    "w-10 h-8 sm:w-14 sm:h-9 mx-auto rounded-lg text-xs font-bold transition-all flex items-center justify-center border",
                                    isPresent && "bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25 shadow-2xs",
                                    isAbsent && "bg-rose-500/15 border-rose-500/30 text-rose-700 dark:text-rose-300 hover:bg-rose-500/25",
                                    isHoliday && "bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-300",
                                    isNone && "bg-muted/30 border-transparent text-muted-foreground/60 hover:border-border cursor-default",
                                  )}
                                >
                                  {slot.status}
                                </button>
                              </td>
                            );
                          })
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Previous Terms View */
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Select Past Academic Term</span>
            <div className="flex gap-2">
              {previousTerms.map((term) => (
                <button
                  key={term.id}
                  onClick={() => setSelectedPrevTerm(term.id)}
                  className={cn(
                    "px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all",
                    selectedPrevTerm === term.id
                      ? "bg-accent text-accent-foreground shadow-xs"
                      : "bg-surface border border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  Sem {term.semester} ({term.percentage}%)
                </button>
              ))}
            </div>
          </div>

          {currentPrev && (
            <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex flex-col items-center justify-center rounded-xl border border-border bg-surface px-3 py-1 text-center">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Sem</span>
                    <span className="font-display text-sm font-bold text-foreground">{currentPrev.semester}</span>
                  </span>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-foreground">{currentPrev.termLabel}</p>
                    <p className="text-[11px] text-muted-foreground">Archived Official Term Transcript</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-base sm:text-lg font-bold tabular text-emerald-600 dark:text-emerald-400">
                    {currentPrev.percentage}%
                  </span>
                </div>
              </div>

              <div className="h-2 w-full overflow-hidden rounded-full bg-muted/60">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${currentPrev.percentage}%` }}
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-border/60 text-xs">
                <div className="flex items-center justify-between rounded-xl bg-emerald-500/10 px-3 py-2 border border-emerald-500/20">
                  <span className="font-semibold text-emerald-700 dark:text-emerald-300">Present :</span>
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">{currentPrev.present} / {currentPrev.total}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-rose-500/10 px-3 py-2 border border-rose-500/20">
                  <span className="font-semibold text-rose-700 dark:text-rose-300">Absent :</span>
                  <span className="font-mono font-bold text-rose-700 dark:text-rose-300">{currentPrev.absent} / {currentPrev.total}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-amber-500/10 px-3 py-2 border border-amber-500/20">
                  <span className="font-semibold text-amber-700 dark:text-amber-300">Pending :</span>
                  <span className="font-mono font-bold text-amber-700 dark:text-amber-300">{currentPrev.pending} / {currentPrev.total}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-sky-500/10 px-3 py-2 border border-sky-500/20">
                  <span className="font-semibold text-sky-700 dark:text-sky-300">No Attendance :</span>
                  <span className="font-mono font-bold text-sky-700 dark:text-sky-300">{currentPrev.noAttendance} / {currentPrev.total}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Slot Inspection Modal */}
      <AnimatePresence>
        {selectedSlot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="font-display font-bold text-sm text-foreground">
                  Lecture Slot Record
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedSlot(null)}
                  className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between rounded-xl bg-muted/40 p-3">
                  <span className="text-muted-foreground font-medium">Session Status</span>
                  <StatusPill
                    tone={
                      selectedSlot.slot.status === "P"
                        ? "present"
                        : selectedSlot.slot.status === "A"
                          ? "absent"
                          : selectedSlot.slot.status === "H"
                            ? "leave"
                            : "muted"
                    }
                  >
                    {selectedSlot.slot.status === "P"
                      ? "PRESENT · VERIFIED"
                      : selectedSlot.slot.status === "A"
                        ? "ABSENT"
                        : selectedSlot.slot.status === "H"
                          ? "HOLIDAY"
                          : "NO LECTURE"}
                  </StatusPill>
                </div>

                <div className="space-y-2 rounded-xl border border-border p-3 text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>Date</span>
                    <strong className="text-foreground">{selectedSlot.row.dateDisplay} ({selectedSlot.row.dayOfWeek})</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Time Window</span>
                    <strong className="text-foreground">{selectedSlot.slot.time}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Subject</span>
                    <strong className="text-foreground">{selectedSlot.slot.subjectCode} · {selectedSlot.slot.subjectName}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Faculty</span>
                    <strong className="text-foreground">{selectedSlot.slot.faculty}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Classroom</span>
                    <strong className="text-foreground">{selectedSlot.slot.room}</strong>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() => setSelectedSlot(null)}
                className="w-full h-9 rounded-xl text-xs"
              >
                Close
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
