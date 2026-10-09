import { useState, useEffect } from "react";
import { Plus, Trash2, CalendarDays, ShieldAlert, Sparkles, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader, Panel, EmptyState } from "@/components/common/section";
import { StatusPill } from "@/components/common/status-pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AttendanceService, type HolidayItem } from "@/features/attendance/attendance-service";
import { useAuth } from "@/features/auth";

export function HolidaysView() {
  const { role } = useAuth();
  const isAdmin = role === "admin" || role === "hod";

  const [rows, setRows] = useState<HolidayItem[]>(AttendanceService.getHolidays());
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState<"National" | "Institutional" | "UnOfficial" | "Optional">("Institutional");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = AttendanceService.listenHolidays((list) => {
      setRows(list);
    });
    return () => unsub();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !date) {
      toast.error("Please provide both a date and an occasion name.");
      return;
    }

    const formattedDate = new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const newHoliday: HolidayItem = {
      id: "HOL-" + Date.now(),
      name: name.trim(),
      date: formattedDate,
      rawDate: date,
      type,
    };

    setSaving(true);
    try {
      await AttendanceService.saveHoliday(newHoliday);
      setName("");
      setDate("");
      toast.success(`Holiday "${newHoliday.name}" declared & synced!`, {
        description: "Attendance calculations and 'H' status updated in student matrix.",
      });
    } catch {
      toast.error("Failed to save holiday to database.");
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (item: HolidayItem) => {
    await AttendanceService.deleteHoliday(item.id);
    toast.info(`Removed "${item.name}" from holiday schedule.`);
  };

  return (
    <AppShell>
      <PageHeader
        eyebrow="Academic Term Non-Working Day Exclusions"
        title="Institution holiday schedule"
        description="Declared holidays automatically exempt student attendance tracking and appear as 'H' across class matrices."
      />

      <div className={isAdmin ? "grid gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]" : "space-y-6"}>
        {isAdmin && (
          <Panel title="Declare new holiday" description="Saves directly to central database">
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Holiday Name / Occasion</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Founder's Memorial Day"
                  className="h-10 rounded-xl border-border bg-surface text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Date</label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-10 rounded-xl border-border bg-surface text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Classification</label>
                <Select value={type} onValueChange={(v: any) => setType(v)}>
                  <SelectTrigger className="h-10 rounded-xl border-border bg-surface text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="Institutional">Institutional Holiday</SelectItem>
                    <SelectItem value="National">National Holiday</SelectItem>
                    <SelectItem value="UnOfficial">UnOfficial Holiday</SelectItem>
                    <SelectItem value="Optional">Optional / Restricted Holiday</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                disabled={saving}
                className="h-11 w-full rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 font-semibold shadow-xs transition-all"
              >
                <Plus className="mr-1.5 h-4 w-4" /> Declare & Sync Holiday
              </Button>
            </form>
          </Panel>
        )}

        <Panel
          title="Official campus holiday calendar"
          description={`${rows.length} declared non-instructional days in academic year 2026`}
          bodyClassName="p-0"
        >
          {rows.length === 0 ? (
            <div className="p-6">
              <EmptyState title="No declared holidays" description="Add institutional or national holidays to exclude them from attendance tracking." />
            </div>
          ) : (
            <ul className="divide-y divide-border/60">
              <AnimatePresence>
                {rows.map((h) => (
                  <motion.li
                    key={h.id || h.name + h.date}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent shadow-2xs font-bold">
                        <CalendarDays className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">{h.name}</p>
                        <p className="truncate text-[11px] text-muted-foreground mt-0.5">{h.date}</p>
                      </div>
                    </div>

                    <StatusPill tone={h.type === "National" ? "accent" : "muted"} className="hidden sm:inline-flex">
                      {h.type}
                    </StatusPill>

                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemove(h)}
                        className="h-9 w-9 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                        title="Remove holiday"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </Panel>
      </div>
    </AppShell>
  );
}
