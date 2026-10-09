import { useEffect, useState } from "react";
import {
  QrCode,
  Radio,
  Timer,
  Users,
  RefreshCw,
  Power,
  UserPlus,
  Play,
  Building,
  GraduationCap,
  Layers,
  MapPin,
  Calendar,
  Sparkles,
  CheckCircle2,
  Clock,
  Laptop,
  BookOpen,
  Search,
  Copy,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader, Panel } from "@/components/common/section";
import { StatCard } from "@/components/common/stat-card";
import { StatusPill } from "@/components/common/status-pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { QrDisplay } from "@/features/attendance/components/qr-display";
import { useAuth } from "@/features/auth/auth-context";
import {
  AttendanceService,
  type LiveSessionState,
  type TimetableSlot,
} from "@/features/attendance/attendance-service";
import { cn } from "@/lib/utils";

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

export function TeacherDashboard() {
  const { profile } = useAuth();
  const facultyName = profile?.name || "Prof. Anil Kulkarni";

  const [session, setSession] = useState<LiveSessionState>(AttendanceService.getLiveSession());
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [filterType, setFilterType] = useState<"All" | "Lecture" | "Lab / Practical">("All");
  const [selectedDay, setSelectedDay] = useState<"Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat">("Mon");

  const [seconds, setSeconds] = useState(214);
  const [rotateSecs, setRotateSecs] = useState(20);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newRoll, setNewRoll] = useState("");
  const [newName, setNewName] = useState("");
  const [rosterSearch, setRosterSearch] = useState("");
  const [copiedToken, setCopiedToken] = useState(false);

  // Sync with Firestore Timetable & Live Session
  useEffect(() => {
    const unsubSession = AttendanceService.listenLiveSession((updated) => {
      setSession(updated);
    });

    const unsubTimetable = AttendanceService.listenTimetable((slots) => {
      setTimetable(slots);
    });

    return () => {
      unsubSession();
      unsubTimetable();
    };
  }, []);

  // Timer countdowns for QR session
  useEffect(() => {
    if (!session.active || seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds, session.active]);

  useEffect(() => {
    if (!session.active) return;
    if (rotateSecs <= 0) {
      AttendanceService.rotateToken();
      setRotateSecs(20);
      return;
    }
    const t = setTimeout(() => setRotateSecs((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [rotateSecs, session.active]);

  const presentCount = session.roster.filter((r) => r.present).length;
  const mm = Math.floor(seconds / 60);
  const ss = String(seconds % 60).padStart(2, "0");

  const handleRotateNow = () => {
    AttendanceService.rotateToken();
    setRotateSecs(20);
    toast.success("QR Token refreshed!", {
      description: `New dynamic token broadcast to projector in ${session.room}.`,
    });
  };

  const handleToggleEndSession = () => {
    const nextState = !session.active;
    const updated = { ...session, active: nextState };
    AttendanceService.saveLiveSession(updated);
    if (nextState) {
      setSeconds(300);
      toast.success(`Live attendance session reopened in ${session.room}.`);
    } else {
      toast.error(`Session closed for ${session.course} ${session.division} in ${session.room}.`, {
        description: `${presentCount} attendance records committed to Firestore database.`,
      });
    }
  };

  const handleLaunchSessionForSlot = (slot: TimetableSlot) => {
    const newSession = AttendanceService.startSessionForSlot(slot);
    setSession(newSession);
    setSeconds(300);
    setRotateSecs(20);
    toast.success(`Live attendance started for ${slot.course} ${slot.division}! 🔥`, {
      description: `Room: ${slot.room} · Subject: ${slot.subjectName} · Roster loaded from database.`,
    });
  };

  const handleToggleStudent = (roll: string, present: boolean) => {
    AttendanceService.toggleRosterPresence(roll, present);
    toast.info(`Updated status for roll ${roll} to ${present ? "Present" : "Absent"}.`);
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoll || !newName) return;
    AttendanceService.markStudentInSession(newRoll, newName);
    setNewRoll("");
    setNewName("");
    setShowAddStudent(false);
    toast.success(`Student ${newName} (${newRoll}) added & marked present!`);
  };

  const handleCopyToken = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(session.token);
      setCopiedToken(true);
      toast.success("Session Token copied to clipboard!");
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  // Filter slots for this faculty or day
  const facultySlots = timetable.filter((s) =>
    s.facultyName.toLowerCase().includes(facultyName.toLowerCase()) ||
    s.facultyName.toLowerCase().includes("anil") ||
    s.facultyName.toLowerCase().includes("kulkarni"),
  );

  const daySlots = facultySlots.filter((s) => s.day === selectedDay);

  const filteredSlots = facultySlots.filter((s) => {
    if (filterType !== "All" && s.type !== filterType) return false;
    return true;
  });

  const filteredRoster = session.roster.filter((s) => {
    if (!rosterSearch) return true;
    return (
      s.name.toLowerCase().includes(rosterSearch.toLowerCase()) ||
      s.roll.toLowerCase().includes(rosterSearch.toLowerCase())
    );
  });

  return (
    <AppShell>
      <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-5 sm:gap-6">
        <motion.div variants={item}>
          <PageHeader
            eyebrow={`${facultyName} · Faculty Console`}
            title={
              session.active
                ? `Live: ${session.course} ${session.division} (${session.room})`
                : "Faculty Attendance & Schedule"
            }
            description={
              session.active
                ? `Taking live attendance for ${session.subject} (${session.type}) in ${session.room}.`
                : "Review your assigned lecture halls, computer labs, and launch instant QR attendance terminals."
            }
            action={
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                {session.active && (
                  <Button
                    variant="outline"
                    onClick={handleRotateNow}
                    className="h-10 px-3.5 rounded-xl border-border hover:bg-muted/50 font-semibold transition-all text-xs w-full sm:w-auto"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" /> Force Rotate
                  </Button>
                )}
                <Button
                  variant={session.active ? "outline" : "default"}
                  onClick={handleToggleEndSession}
                  className={cn(
                    "h-10 px-4 rounded-xl font-semibold text-xs transition-all w-full sm:w-auto",
                    session.active
                      ? "border-destructive/40 text-destructive hover:bg-destructive/10"
                      : "bg-accent text-accent-foreground hover:bg-accent/90 shadow-xs",
                  )}
                >
                  <Power className="mr-2 h-4 w-4" />
                  {session.active ? "End Live Session" : "Re-open Live Session"}
                </Button>
              </div>
            }
          />
        </motion.div>

        {/* 1. Live Session Terminal (Hero Widget - Fully Mobile Optimized) */}
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <motion.div variants={item}>
            <Panel
              className={cn(
                "h-full border-2 transition-all shadow-xs overflow-hidden",
                session.active ? "border-accent/60 bg-card" : "border-border bg-card/60",
              )}
              bodyClassName="p-4 sm:p-6"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusPill tone={session.active ? "accent" : "muted"}>
                      <Radio className={`h-3 w-3 ${session.active ? "animate-pulse" : ""}`} />
                      {session.active ? `LIVE IN ${session.room}` : "TERMINAL OFFLINE"}
                    </StatusPill>
                    <span className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-muted text-foreground">
                      {session.course} · {session.division}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-lg bg-surface border border-border text-muted-foreground">
                      {session.type}
                    </span>
                  </div>

                  <h3 className="mt-3 font-display text-lg sm:text-xl font-bold text-foreground">
                    {session.code} · {session.subject}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {session.department} · Room: <strong className="text-foreground">{session.room}</strong>
                  </p>

                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="font-display text-3xl sm:text-[42px] font-bold leading-none tabular text-foreground">
                      {presentCount}
                    </span>
                    <span className="text-sm sm:text-lg font-medium text-muted-foreground">
                      / {session.roster.length} scholars marked
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-medium">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Timer className="h-4 w-4 text-accent shrink-0" /> Closes in{" "}
                      <span className="tabular font-bold text-foreground">
                        {mm}:{ss}
                      </span>
                    </span>
                    <span className="text-accent bg-accent/10 px-2 py-0.5 rounded-md text-[11px] font-semibold">
                      Auto-rotates in <strong className="tabular">{rotateSecs}s</strong>
                    </span>
                  </div>

                  <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(presentCount / Math.max(1, session.roster.length)) * 100}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full bg-accent"
                    />
                  </div>
                </div>

                {/* QR Code Presentation Box (Centered & Touch-Friendly on Mobile) */}
                <div className="flex flex-col items-center justify-center gap-2 pt-2 sm:pt-0">
                  <div className="grid h-44 w-44 shrink-0 place-items-center rounded-2xl border-2 border-accent/40 bg-card p-2 shadow-md relative overflow-hidden">
                    <QrDisplay value={session.token} size={152} />
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyToken}
                    className="flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground hover:text-foreground font-semibold bg-muted/60 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    {copiedToken ? <Check className="h-3 w-3 text-present" /> : <Copy className="h-3 w-3" />}
                    Token: {session.token}
                  </button>
                </div>
              </div>
            </Panel>
          </motion.div>

          {/* 2. Today's Teaching Schedule Highlight */}
          <motion.div variants={item} className="space-y-4">
            <Panel
              title="Today's Schedule & Rooms"
              description={`Where you teach on ${selectedDay}day`}
              action={
                <div className="flex gap-1 bg-muted/60 p-1 rounded-lg text-[10px] overflow-x-auto max-w-[200px] sm:max-w-none">
                  {(["Mon", "Tue", "Wed", "Thu", "Fri"] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setSelectedDay(d)}
                      className={cn(
                        "px-2 py-0.5 rounded font-semibold transition-all shrink-0",
                        selectedDay === d ? "bg-card text-foreground shadow-2xs" : "text-muted-foreground",
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              }
              bodyClassName="p-3 sm:p-4"
            >
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto">
                {daySlots.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-6 text-center">No classes scheduled for {selectedDay}.</p>
                ) : (
                  daySlots.map((slot) => {
                    const isLiveThis = session.active && session.room === slot.room && session.division === slot.division;
                    return (
                      <div
                        key={slot.id}
                        className={cn(
                          "flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border transition-all",
                          isLiveThis
                            ? "border-accent bg-accent/10 shadow-xs"
                            : "border-border bg-surface hover:border-accent/40",
                        )}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-accent">{slot.timeSlot}</span>
                            <span className="font-bold text-xs px-2 py-0.5 rounded-md bg-muted text-foreground">
                              {slot.room}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-semibold">
                              {slot.course} {slot.division}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-foreground truncate mt-1">
                            {slot.subjectCode} · {slot.subjectName}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {slot.department} · {slot.type}
                          </p>
                        </div>

                        <Button
                          size="sm"
                          onClick={() => handleLaunchSessionForSlot(slot)}
                          className={cn(
                            "h-8 px-3 rounded-lg text-xs font-semibold shadow-2xs w-full sm:w-auto shrink-0",
                            isLiveThis
                              ? "bg-present text-white"
                              : "bg-accent text-accent-foreground hover:bg-accent/90",
                          )}
                        >
                          <Play className="mr-1 h-3 w-3" />
                          {isLiveThis ? "Active Now" : "Start Session"}
                        </Button>
                      </div>
                    );
                  })
                )}
              </div>
            </Panel>
          </motion.div>
        </div>

        {/* 3. Assigned Classes & Labs Directory (Responsive Cards on Mobile + Table on Desktop) */}
        <motion.div variants={item}>
          <Panel
            title="Faculty Class & Lab Load Directory"
            description="All scheduled course sections, branches, divisions, and allocations"
            action={
              <div className="flex flex-wrap items-center gap-1.5">
                {(["All", "Lecture", "Lab / Practical"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setFilterType(t)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-medium border transition-all",
                      filterType === t
                        ? "border-accent bg-accent/15 text-foreground font-semibold shadow-2xs"
                        : "border-border text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {t} ({t === "All" ? facultySlots.length : facultySlots.filter((x) => x.type === t).length})
                  </button>
                ))}
              </div>
            }
            bodyClassName="p-0"
          >
            {/* MOBILE VIEW (CARDS < 768px) */}
            <div className="divide-y divide-border/60 md:hidden">
              {filteredSlots.map((slot) => {
                const isCurrentLive = session.active && session.room === slot.room && session.division === slot.division;
                return (
                  <div key={slot.id} className={cn("p-4 space-y-2.5", isCurrentLive && "bg-accent/5")}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "grid h-7 w-7 place-items-center rounded-lg text-xs font-bold",
                          slot.type === "Lab / Practical" ? "bg-purple-500/15 text-purple-600 dark:text-purple-400" : "bg-blue-500/15 text-blue-600 dark:text-blue-400",
                        )}>
                          {slot.type === "Lab / Practical" ? <Laptop className="h-3.5 w-3.5" /> : <Building className="h-3.5 w-3.5" />}
                        </span>
                        <div>
                          <span className="font-mono font-bold text-sm text-foreground">{slot.room}</span>
                          <span className="text-[10px] text-muted-foreground block">{slot.day} · {slot.timeSlot}</span>
                        </div>
                      </div>
                      <StatusPill tone={slot.type === "Lab / Practical" ? "accent" : "muted"}>
                        {slot.type}
                      </StatusPill>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-foreground">{slot.subjectCode} · {slot.subjectName}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{slot.course} · {slot.division} ({slot.department})</p>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleLaunchSessionForSlot(slot)}
                      className={cn(
                        "h-8 px-3 rounded-lg text-xs font-semibold shadow-2xs w-full",
                        isCurrentLive
                          ? "bg-present text-white hover:bg-present/90"
                          : "bg-accent text-accent-foreground hover:bg-accent/90",
                      )}
                    >
                      <Play className="mr-1 h-3 w-3" />
                      {isCurrentLive ? "Live in Session" : "Open Attendance"}
                    </Button>
                  </div>
                );
              })}
            </div>

            {/* DESKTOP VIEW (TABLE >= 768px) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="p-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Day & Time</th>
                    <th className="p-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Course & Division</th>
                    <th className="p-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Department</th>
                    <th className="p-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Room / Lab</th>
                    <th className="p-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Subject</th>
                    <th className="p-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Type</th>
                    <th className="p-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredSlots.map((slot) => {
                    const isCurrentLive = session.active && session.room === slot.room && session.division === slot.division;
                    return (
                      <tr key={slot.id} className={cn("hover:bg-muted/20 transition-colors", isCurrentLive && "bg-accent/5")}>
                        <td className="p-3.5">
                          <span className="font-display font-bold text-xs text-foreground block">{slot.day}</span>
                          <span className="font-mono text-[11px] text-muted-foreground">{slot.timeSlot}</span>
                        </td>
                        <td className="p-3.5">
                          <span className="font-bold text-xs text-foreground block">{slot.course}</span>
                          <span className="font-mono text-xs text-accent font-semibold px-1.5 py-0.5 rounded bg-accent/10 inline-block mt-0.5">
                            {slot.division}
                          </span>
                        </td>
                        <td className="p-3.5 text-xs text-muted-foreground max-w-[180px] truncate">
                          {slot.department}
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-1.5">
                            <span className={cn(
                              "grid h-7 w-7 place-items-center rounded-lg text-xs font-bold",
                              slot.type === "Lab / Practical" ? "bg-purple-500/15 text-purple-600 dark:text-purple-400" : "bg-blue-500/15 text-blue-600 dark:text-blue-400",
                            )}>
                              {slot.type === "Lab / Practical" ? <Laptop className="h-3.5 w-3.5" /> : <Building className="h-3.5 w-3.5" />}
                            </span>
                            <span className="font-mono font-bold text-sm text-foreground">{slot.room}</span>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span className="font-semibold text-xs text-foreground block">{slot.subjectCode}</span>
                          <span className="text-[11px] text-muted-foreground truncate block max-w-[160px]">{slot.subjectName}</span>
                        </td>
                        <td className="p-3.5">
                          <StatusPill tone={slot.type === "Lab / Practical" ? "accent" : "muted"}>
                            {slot.type}
                          </StatusPill>
                        </td>
                        <td className="p-3.5 text-right">
                          <Button
                            size="sm"
                            onClick={() => handleLaunchSessionForSlot(slot)}
                            className={cn(
                              "h-8 px-3 rounded-lg text-xs font-semibold shadow-2xs",
                              isCurrentLive
                                ? "bg-present text-white hover:bg-present/90"
                                : "bg-accent text-accent-foreground hover:bg-accent/90",
                            )}
                          >
                            <Play className="mr-1 h-3 w-3" />
                            {isCurrentLive ? "Live in Session" : "Open Attendance"}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Panel>
        </motion.div>

        {/* 4. Live Attendee Roster Stream for Active Session */}
        <motion.div variants={item} className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] pb-12">
          <Panel
            title={`Live Class Roster — ${session.course} ${session.division}`}
            description={`Room ${session.room} · Real-time attendance ledger`}
            bodyClassName="p-0"
            action={
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAddStudent(!showAddStudent)}
                  className="h-8 rounded-lg text-xs"
                >
                  <UserPlus className="mr-1 h-3.5 w-3.5" /> Add
                </Button>
                <span className="text-xs font-bold text-present tabular bg-present/10 px-2.5 py-1 rounded-lg">
                  {presentCount} Present
                </span>
              </div>
            }
          >
            {/* Roster Search Bar on Mobile */}
            <div className="p-3 border-b border-border bg-muted/20">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={rosterSearch}
                  onChange={(e) => setRosterSearch(e.target.value)}
                  placeholder="Filter roster by student name or roll…"
                  className="h-8 pl-8 rounded-lg text-xs bg-card"
                />
              </div>
            </div>

            {showAddStudent && (
              <form onSubmit={handleAddStudent} className="p-3 border-b border-border bg-muted/40 flex flex-col sm:flex-row gap-2">
                <Input
                  value={newRoll}
                  onChange={(e) => setNewRoll(e.target.value)}
                  placeholder="Roll No (e.g. 24MCA099)"
                  className="h-9 rounded-lg bg-card text-xs font-mono"
                  required
                />
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Student Full Name"
                  className="h-9 rounded-lg bg-card text-xs"
                  required
                />
                <Button type="submit" size="sm" className="h-9 px-4 rounded-lg bg-accent text-accent-foreground font-semibold shrink-0">
                  Add to Class
                </Button>
              </form>
            )}

            <ul className="divide-y divide-border/60 max-h-[460px] overflow-y-auto">
              <AnimatePresence>
                {filteredRoster.map((s) => (
                  <motion.li
                    layout
                    key={s.roll}
                    className="flex items-center justify-between gap-3 px-3.5 py-3 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-muted text-[11px] font-bold text-muted-foreground">
                        {s.name.split(" ").map((p: string) => p[0]).join("")}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-xs sm:text-sm font-semibold text-foreground">{s.name}</p>
                        <p className="truncate text-[11px] text-muted-foreground font-mono">
                          {s.roll} · {s.percent}% {s.timestamp ? `· ${s.timestamp}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2.5">
                      <span className={"text-xs font-semibold hidden sm:inline-block " + (s.present ? "text-present" : "text-absent")}>
                        {s.present ? "Present" : "Absent"}
                      </span>
                      <Switch
                        checked={s.present}
                        onCheckedChange={(v) => handleToggleStudent(s.roll, v)}
                      />
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </Panel>

          {/* Quick Metrics Panel */}
          <Panel
            title="Classroom & Telemetry"
            description="Verified cryptographic check-ins"
            bodyClassName="p-4 sm:p-5 space-y-4"
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl border border-border bg-surface">
                <span className="text-[11px] font-semibold text-muted-foreground block">Active Room</span>
                <span className="font-display text-base sm:text-lg font-bold text-foreground mt-0.5 block">{session.room}</span>
                <span className="text-[10px] text-accent font-semibold">{session.type}</span>
              </div>
              <div className="p-3.5 rounded-xl border border-border bg-surface">
                <span className="text-[11px] font-semibold text-muted-foreground block">Division</span>
                <span className="font-display text-base sm:text-lg font-bold text-foreground mt-0.5 block">{session.division}</span>
                <span className="text-[10px] text-muted-foreground">{session.course}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-border/80 bg-card space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-present" /> Live Real-time Sync
                </span>
                <span className="font-mono text-[10px] text-present bg-present/10 px-2 py-0.5 rounded-md font-bold">
                  ACTIVE
                </span>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                All scans from student mobile devices point directly to this session slot ({session.room} / {session.course} {session.division}).
              </p>
            </div>
          </Panel>
        </motion.div>
      </motion.div>
    </AppShell>
  );
}
