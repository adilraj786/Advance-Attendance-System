import { useEffect, useState } from "react";
import { Plus, Calendar, Save, Trash2, Clock, Check, X, Building, BookOpen, User, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader, Panel } from "@/components/common/section";
import { StatusPill } from "@/components/common/status-pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AttendanceService,
  type TimetableSlot,
} from "@/features/attendance/attendance-service";
import { TT_DAYS, TT_SLOTS } from "@/lib/data";
import { useAuth } from "@/features/auth";
import { cn } from "@/lib/utils";

type DayType = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat";

interface SectionDef {
  id: string;
  label: string;
  course: string;
  division: string;
  dept: string;
}

const SECTIONS: SectionDef[] = [
  { id: "cse-a", label: "B.Tech CSE — Division A (LH-301)", course: "B.Tech CSE", division: "Div A", dept: "Computer Science & Engineering" },
  { id: "cse-b", label: "B.Tech CSE — Division B (LH-204)", course: "B.Tech CSE", division: "Div B", dept: "Computer Science & Engineering" },
  { id: "mca-d", label: "MCA — Division D (CL-509 Lab / Class)", course: "MCA", division: "Div D", dept: "Master of Computer Applications" },
  { id: "aiml-a", label: "M.Tech AIML — Division A (LH-108)", course: "M.Tech AIML", division: "Div A", dept: "Artificial Intelligence & ML" },
  { id: "ece-a", label: "B.Tech ECE — Division A (LH-201)", course: "B.Tech ECE", division: "Div A", dept: "Electronics & Communication" },
];

const ROOMS = ["CL-509", "LH-301", "Lab C-3", "LH-204", "LH-108", "LH-201", "CL-502"];
const FACULTY_LIST = ["Prof. Anil Kulkarni", "Prof. Rajeev Iyer", "Dr. Kavita Nair", "Dr. Suresh M.", "Dr. Shweta Bhosale"];

const PRESET_TIME_SLOTS = [
  "09:00 - 10:00",
  "10:00 - 11:00",
  "11:15 - 12:15",
  "12:15 - 13:15",
  "14:00 - 15:00",
  "15:00 - 16:00",
  "09:00 - 11:00",
  "11:15 - 13:15",
  "14:00 - 16:00",
];

export function TimetableView() {
  const { role, profile } = useAuth();
  const isAdminOrHod = role === "admin" || role === "hod";

  const defaultSection = role === "student" || role === "parent" ? "cse-a" : role === "teacher" ? "cse-a" : "mca-d";
  const [slots, setSlots] = useState<TimetableSlot[]>(() => AttendanceService.getTimetable());
  const [selectedSection, setSelectedSection] = useState(defaultSection);
  const [selSlot, setSelSlot] = useState<TimetableSlot | null>(null);
  const [previewSlot, setPreviewSlot] = useState<TimetableSlot | null>(null);

  // Form states (Only for Admin)
  const [editDay, setEditDay] = useState<DayType>("Mon");
  const [editSlotTime, setEditSlotTime] = useState("09:00 - 10:00");
  const [editRoom, setEditRoom] = useState("LH-301");
  const [editType, setEditType] = useState<"Lecture" | "Lab / Practical">("Lecture");
  const [editSubCode, setEditSubCode] = useState("CS501");
  const [editSubName, setEditSubName] = useState("Design & Analysis of Algorithms");
  const [editFaculty, setEditFaculty] = useState("Prof. Rajeev Iyer");
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const unsub = AttendanceService.listenTimetable((updated) => {
      if (updated && updated.length > 0) {
        setSlots(updated);
      }
    });
    return () => unsub();
  }, []);

  const [mobileDay, setMobileDay] = useState<DayType>("Mon");

  const currentSectionObj: SectionDef = SECTIONS.find((s) => s.id === selectedSection) ?? SECTIONS[0]!;
  const sectionSlots = slots.filter(
    (s) => s.course === currentSectionObj.course && s.division === currentSectionObj.division,
  );
  const mobileSlots = sectionSlots.filter((s) => s.day === mobileDay);

  const handleSlotClick = (slot: TimetableSlot) => {
    if (isAdminOrHod) {
      setSelSlot(slot);
      setEditDay(slot.day);
      setEditSlotTime(slot.timeSlot);
      setEditRoom(slot.room);
      setEditType(slot.type);
      setEditSubCode(slot.subjectCode);
      setEditSubName(slot.subjectName);
      setEditFaculty(slot.facultyName);
    } else {
      setPreviewSlot(slot);
    }
  };

  const handleSaveSlot = async () => {
    if (!isAdminOrHod || !selSlot) return;
    const startTime = editSlotTime.split("-")[0]?.trim() || selSlot.startTime || "09:00";
    const endTime = editSlotTime.split("-")[1]?.trim() || selSlot.endTime || "10:00";

    const updated: TimetableSlot = {
      ...selSlot,
      day: editDay,
      timeSlot: editSlotTime,
      startTime,
      endTime,
      room: editRoom,
      type: editType,
      subjectCode: editSubCode,
      subjectName: editSubName,
      facultyName: editFaculty,
    };

    setSelSlot(null);
    const saved = await AttendanceService.saveTimetableSlot(updated);
    setSlots((prev) => prev.map((x) => (x.id === saved.id ? saved : x)));
    toast.success(`Slot updated for ${updated.course} ${updated.division} in ${updated.room}!`, {
      description: "Synchronized across faculty and student portals via Firestore.",
    });
  };

  const handleDeleteSlot = async (id: string) => {
    if (!isAdminOrHod) return;
    setSelSlot(null);
    await AttendanceService.deleteTimetableSlot(id);
    setSlots((prev) => prev.filter((x) => x.id !== id));
    toast.info("Classroom slot removed from timetable master.");
  };

  const handleCreateNewSlot = async (e?: React.FormEvent) => {
    if (!isAdminOrHod) return;
    if (e && e.preventDefault) e.preventDefault();
    try {
      const selectedTime = editSlotTime || "09:00 - 10:00";
      const startTime = selectedTime.split("-")[0]?.trim() || "09:00";
      const endTime = selectedTime.split("-")[1]?.trim() || "10:00";

      const newSlot: Omit<TimetableSlot, "id"> = {
        day: editDay,
        timeSlot: selectedTime,
        startTime,
        endTime,
        course: currentSectionObj.course,
        department: currentSectionObj.dept,
        division: currentSectionObj.division,
        type: editType,
        room: editRoom,
        subjectCode: editSubCode.trim() || (currentSectionObj.course === "MCA" ? "MCA204" : "CS501"),
        subjectName: editSubName.trim() || (currentSectionObj.course === "MCA" ? "Cloud Infrastructure & DevOps" : "Design & Analysis of Algorithms"),
        facultyId: "FAC-102",
        facultyName: editFaculty,
        totalStudents: 62,
        status: "upcoming",
      };

      setShowAddModal(false);
      const saved = await AttendanceService.saveTimetableSlot(newSlot);
      setSlots((prev) => [saved, ...prev]);

      toast.success(`New slot created for ${saved.course} ${saved.division} in ${saved.room}!`, {
        description: `${saved.subjectCode} (${saved.day} ${saved.timeSlot}) added to database.`,
      });
    } catch (err: any) {
      console.error("Error adding timetable slot:", err);
      toast.error("Could not add timetable slot: " + (err?.message || "Unknown error"));
    }
  };

  // Dynamic header based on role
  const eyebrowText =
    role === "parent"
      ? "Ward · Ananya Deshpande · 21CS042"
      : role === "student"
        ? "Student Academic Schedule · Semester V"
        : role === "teacher"
          ? `${profile?.name || "Prof. Anil Kulkarni"} · Faculty Master Schedule`
          : "Academic Term Schedules & Room Allocation";

  const titleText =
    role === "parent"
      ? "Ward's weekly timetable"
      : role === "student"
        ? "My class timetable"
        : role === "teacher"
          ? "Faculty & cohort schedule"
          : "Weekly master timetable";

  const descriptionText =
    role === "parent"
      ? "Real-time class schedule, room allocations, and faculty mentors for your ward's registered courses."
      : role === "student"
        ? "Verified weekly lecture and laboratory schedule synchronized with central campus database."
        : role === "teacher"
          ? "View classroom assignments, cohort distribution, and teaching schedules."
          : "Configure recurring lecture slots, assigned laboratory halls and teacher allocations.";

  return (
    <AppShell>
      <PageHeader
        eyebrow={eyebrowText}
        title={titleText}
        description={descriptionText}
        action={
          <div className="flex items-center gap-3">
            <Select value={selectedSection} onValueChange={setSelectedSection}>
              <SelectTrigger className="h-10 min-w-[280px] rounded-xl border-border bg-card text-xs font-semibold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {SECTIONS.map((sec) => (
                  <SelectItem key={sec.id} value={sec.id}>
                    {sec.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {isAdminOrHod && (
              <Button
                onClick={() => {
                  setEditDay("Mon");
                  setEditSlotTime("09:00 - 10:00");
                  setEditRoom(currentSectionObj.course === "MCA" ? "CL-509" : "LH-301");
                  setEditType(currentSectionObj.course === "MCA" ? "Lab / Practical" : "Lecture");
                  setEditSubCode(currentSectionObj.course === "MCA" ? "MCA204" : "CS501");
                  setEditSubName(currentSectionObj.course === "MCA" ? "Cloud Infrastructure & DevOps" : "Design & Analysis of Algorithms");
                  setShowAddModal(true);
                }}
                className="h-10 px-4 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 shadow-xs font-semibold text-xs"
              >
                <Plus className="mr-1.5 h-4 w-4" /> Add Slot
              </Button>
            )}
          </div>
        }
      />

      {/* Grid view of slots for this section */}
      <Panel
        title={`${currentSectionObj.course} ${currentSectionObj.division} — Weekly Schedule Matrix`}
        description={`${currentSectionObj.dept} · Real-time schedule synchronized with faculty rosters`}
        bodyClassName="p-0"
      >
        {/* Mobile Day Selector Bar (Visible on phones & small screens) */}
        <div className="p-3 sm:hidden border-b border-border bg-surface/50">
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
            {TT_DAYS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setMobileDay(d as DayType)}
                className={cn(
                  "flex-1 min-w-[50px] py-2 text-xs font-bold rounded-xl transition-all text-center",
                  mobileDay === d
                    ? "bg-accent text-accent-foreground shadow-2xs"
                    : "bg-card text-muted-foreground hover:text-foreground border border-border/60",
                )}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Vertical Schedule Cards (Visible on phones & small screens) */}
        <div className="sm:hidden p-3 space-y-2.5">
          {mobileSlots.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground font-medium">
              No scheduled classes on {mobileDay} for {currentSectionObj.division}.
            </div>
          ) : (
            mobileSlots.map((match) => (
              <div
                key={match.id}
                onClick={() => handleSlotClick(match)}
                className={cn(
                  "p-3.5 rounded-2xl border transition-all cursor-pointer",
                  match.type === "Lab / Practical"
                    ? "border-purple-500/30 bg-purple-500/5 hover:border-purple-500/60"
                    : "border-border bg-card hover:border-accent/60 shadow-2xs",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-accent shrink-0" />
                    <span className="font-mono text-xs font-bold text-foreground">{match.timeSlot}</span>
                  </div>
                  <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-lg bg-muted text-foreground">
                    {match.room}
                  </span>
                </div>
                <div className="mt-2">
                  <span className="font-mono text-xs font-bold text-accent mr-1.5">{match.subjectCode}</span>
                  <span className="text-xs font-semibold text-foreground">{match.subjectName}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground pt-1.5 border-t border-border/40">
                  <span>Faculty: <strong className="text-foreground">{match.facultyName}</strong></span>
                  <span
                    className={cn(
                      "text-[9px] font-semibold px-2 py-0.5 rounded",
                      match.type === "Lab / Practical"
                        ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                        : "bg-blue-500/10 text-blue-600 dark:text-blue-400",
                    )}
                  >
                    {match.type}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Weekly Grid Table (Hidden on small screens, shown on desktop) */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-surface">
                <th className="w-24 p-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Day
                </th>
                {TT_SLOTS.map((s) => (
                  <th key={s} className="p-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    {s}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {TT_DAYS.map((d) => (
                <tr key={d} className="hover:bg-muted/20 transition-colors">
                  <td className="p-3.5 font-display text-xs font-bold text-foreground bg-surface/50">
                    {d}
                  </td>
                  {TT_SLOTS.map((s) => {
                    const match = sectionSlots.find((x) => {
                      if (x.day !== d) return false;
                      if (x.startTime === s || x.timeSlot.startsWith(s)) return true;
                      const startH = parseInt(x.startTime.split(":")[0] || "0", 10);
                      const endH = parseInt(x.endTime.split(":")[0] || "0", 10);
                      const slotH = parseInt(s.split(":")[0] || "0", 10);
                      return slotH >= startH && slotH < endH;
                    });

                    return (
                      <td key={s} className="p-2 align-top">
                        {match ? (
                          <button
                            type="button"
                            onClick={() => handleSlotClick(match)}
                            className={cn(
                              "w-full rounded-xl border p-2.5 text-left transition-all",
                              match.type === "Lab / Practical"
                                ? "border-purple-500/30 bg-purple-500/5 hover:border-purple-500/60"
                                : "border-border bg-card hover:border-accent/60",
                              !isAdminOrHod && "cursor-pointer hover:shadow-xs",
                            )}
                            title={isAdminOrHod ? "Click to edit slot" : "Click to view session details"}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-mono text-xs font-bold text-accent">{match.subjectCode}</span>
                              <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted text-foreground">
                                {match.room}
                              </span>
                            </div>
                            <p className="mt-1 truncate text-xs font-semibold text-foreground">{match.subjectName}</p>
                            <p className="truncate text-[10px] text-muted-foreground mt-0.5">{match.facultyName}</p>
                            <span
                              className={cn(
                                "inline-block mt-1 text-[9px] font-semibold px-1.5 py-0.5 rounded",
                                match.type === "Lab / Practical"
                                  ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                                  : "bg-blue-500/10 text-blue-600 dark:text-blue-400",
                              )}
                            >
                              {match.type}
                            </span>
                          </button>
                        ) : isAdminOrHod ? (
                          <button
                            type="button"
                            onClick={() => {
                              setEditDay(d as DayType);
                              const startH = parseInt(s.split(":")[0] ?? "9", 10);
                              const nextH = startH + 1;
                              const slotStr = `${s} - ${nextH < 10 ? "0" + nextH : nextH}:00`;
                              setEditSlotTime(slotStr);
                              setEditRoom(currentSectionObj.course === "MCA" ? "CL-509" : "LH-301");
                              setEditType(currentSectionObj.course === "MCA" ? "Lab / Practical" : "Lecture");
                              setEditSubCode(currentSectionObj.course === "MCA" ? "MCA204" : "CS501");
                              setEditSubName(
                                currentSectionObj.course === "MCA"
                                  ? "Cloud Infrastructure & DevOps"
                                  : "Design & Analysis of Algorithms",
                              );
                              setShowAddModal(true);
                            }}
                            className="flex h-[96px] w-full flex-col items-center justify-center rounded-xl border border-dashed border-border/70 p-2 text-center text-xs text-muted-foreground/60 transition-all hover:border-accent hover:text-accent"
                          >
                            <span className="text-[10px] font-medium">+ Open Slot</span>
                          </button>
                        ) : (
                          <div className="flex h-[96px] w-full items-center justify-center rounded-xl border border-border/30 text-xs text-muted-foreground/40 font-mono">
                            -
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* 1. Read-Only Preview Modal for Student / Parent / Faculty */}
      <AnimatePresence>
        {previewSlot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewSlot(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl z-10 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-display text-lg font-bold text-foreground">
                  <Calendar className="h-5 w-5 text-accent" />
                  Class Schedule Information
                </div>
                <button
                  onClick={() => setPreviewSlot(null)}
                  className="rounded-xl p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="rounded-xl border border-border bg-surface p-4 space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5" /> Subject:
                  </span>
                  <span className="font-bold text-foreground">{previewSlot.subjectCode} · {previewSlot.subjectName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" /> Timing:
                  </span>
                  <span className="font-mono text-xs font-semibold">{previewSlot.day} ({previewSlot.timeSlot})</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" /> Instructor:
                  </span>
                  <span className="font-semibold text-foreground">{previewSlot.facultyName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                    <Building className="h-3.5 w-3.5" /> Classroom:
                  </span>
                  <span className="font-mono text-xs font-semibold text-accent">{previewSlot.room}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground font-medium">Session Type:</span>
                  <StatusPill tone={previewSlot.type === "Lab / Practical" ? "accent" : "muted"}>
                    {previewSlot.type}
                  </StatusPill>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-accent/10 p-3 border border-accent/20 text-xs text-accent">
                <span className="flex items-center gap-1.5 font-semibold">
                  <ShieldCheck className="h-4 w-4" /> Official Campus Timetable
                </span>
                <span>{previewSlot.course} ({previewSlot.division})</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Admin-Only Edit Slot Drawer/Modal */}
      {isAdminOrHod && selSlot && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-accent/40 bg-card p-6 shadow-xl space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent/15 text-accent font-bold">
                <Calendar className="h-5 w-5" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-foreground">
                  Editing Slot: {selSlot.course} {selSlot.division} · {selSlot.day} ({selSlot.timeSlot})
                </h4>
                <p className="text-xs text-muted-foreground">Adjust room, faculty instructor or class type.</p>
              </div>
            </div>

            <Button variant="ghost" size="icon" onClick={() => setSelSlot(null)} className="h-8 w-8 rounded-lg">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Day of Week</label>
              <Select value={editDay} onValueChange={(v: DayType) => setEditDay(v)}>
                <SelectTrigger className="h-10 rounded-xl border-border bg-surface text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {TT_DAYS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Time Slot</label>
              <Select value={editSlotTime} onValueChange={setEditSlotTime}>
                <SelectTrigger className="h-10 rounded-xl border-border bg-surface text-xs font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {PRESET_TIME_SLOTS.map((t) => (
                    <SelectItem key={t} value={t} className="font-mono">
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Classroom / Lab Hall</label>
              <Select value={editRoom} onValueChange={setEditRoom}>
                <SelectTrigger className="h-10 rounded-xl border-border bg-surface text-xs font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {ROOMS.map((r) => (
                    <SelectItem key={r} value={r} className="font-mono">
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Type</label>
              <Select value={editType} onValueChange={(v: "Lecture" | "Lab / Practical") => setEditType(v)}>
                <SelectTrigger className="h-10 rounded-xl border-border bg-surface text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="Lecture">Lecture</SelectItem>
                  <SelectItem value="Lab / Practical">Lab / Practical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Subject Code</label>
              <Input
                value={editSubCode}
                onChange={(e) => setEditSubCode(e.target.value)}
                className="h-10 rounded-xl border-border bg-surface text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Subject Title</label>
              <Input
                value={editSubName}
                onChange={(e) => setEditSubName(e.target.value)}
                className="h-10 rounded-xl border-border bg-surface text-xs"
              />
            </div>

            <div className="space-y-1.5 lg:col-span-2">
              <label className="text-xs font-semibold text-muted-foreground">Assigned Faculty</label>
              <Select value={editFaculty} onValueChange={setEditFaculty}>
                <SelectTrigger className="h-10 rounded-xl border-border bg-surface text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {FACULTY_LIST.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <Button
              variant="ghost"
              onClick={() => handleDeleteSlot(selSlot.id)}
              className="h-9 px-3 rounded-xl text-destructive hover:bg-destructive/10 text-xs font-semibold"
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Remove Slot
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setSelSlot(null)}
                className="h-9 px-4 rounded-xl border-border text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveSlot}
                className="h-9 px-5 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 shadow-xs text-xs font-semibold"
              >
                <Save className="mr-1.5 h-3.5 w-3.5" /> Save Changes
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* 3. Admin-Only Add Slot Modal */}
      {isAdminOrHod && showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setShowAddModal(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl z-10 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent/15 text-accent font-bold">
                  <Plus className="h-5 w-5" />
                </span>
                <div>
                  <h4 className="text-base font-bold text-foreground">
                    Add New Slot — {currentSectionObj.course} ({currentSectionObj.division})
                  </h4>
                  <p className="text-xs text-muted-foreground">{currentSectionObj.dept}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowAddModal(false)} className="h-8 w-8 rounded-lg">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleCreateNewSlot} className="space-y-4 pt-2">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Day</label>
                  <Select value={editDay} onValueChange={(v: DayType) => setEditDay(v)}>
                    <SelectTrigger className="h-10 rounded-xl border-border bg-surface text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {TT_DAYS.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Time Slot</label>
                  <Select value={editSlotTime} onValueChange={setEditSlotTime}>
                    <SelectTrigger className="h-10 rounded-xl border-border bg-surface text-xs font-mono">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {PRESET_TIME_SLOTS.map((t) => (
                        <SelectItem key={t} value={t} className="font-mono">
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Room</label>
                  <Select value={editRoom} onValueChange={setEditRoom}>
                    <SelectTrigger className="h-10 rounded-xl border-border bg-surface text-xs font-mono">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {ROOMS.map((r) => (
                        <SelectItem key={r} value={r} className="font-mono">
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Session Type</label>
                  <Select value={editType} onValueChange={(v: "Lecture" | "Lab / Practical") => setEditType(v)}>
                    <SelectTrigger className="h-10 rounded-xl border-border bg-surface text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="Lecture">Lecture</SelectItem>
                      <SelectItem value="Lab / Practical">Lab / Practical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Subject Code</label>
                  <Input
                    value={editSubCode}
                    onChange={(e) => setEditSubCode(e.target.value)}
                    placeholder="e.g. CS501"
                    className="h-10 rounded-xl border-border bg-surface text-xs font-mono"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Subject Name</label>
                  <Input
                    value={editSubName}
                    onChange={(e) => setEditSubName(e.target.value)}
                    placeholder="e.g. Design & Analysis of Algorithms"
                    className="h-10 rounded-xl border-border bg-surface text-xs"
                    required
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-muted-foreground">Instructor</label>
                  <Select value={editFaculty} onValueChange={setEditFaculty}>
                    <SelectTrigger className="h-10 rounded-xl border-border bg-surface text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {FACULTY_LIST.map((f) => (
                        <SelectItem key={f} value={f}>
                          {f}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  className="h-10 px-4 rounded-xl border-border text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="h-10 px-5 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 shadow-xs text-xs font-semibold"
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" /> Create Slot
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AppShell>
  );
}
