import { useState, useEffect } from "react";
import { Pin, Send, Megaphone, AlertTriangle, Sparkles, Bell, ShieldCheck, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader, Panel } from "@/components/common/section";
import { StatusPill } from "@/components/common/status-pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AttendanceService, type AnnouncementItem } from "@/features/attendance/attendance-service";
import { useAuth } from "@/features/auth";

export function AnnouncementsView() {
  const { role, profile } = useAuth();
  const isFacultyOrAdmin = role === "teacher" || role === "hod" || role === "admin";

  const [posts, setPosts] = useState<AnnouncementItem[]>(() => AttendanceService.getAnnouncements());
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<"Urgent" | "Academic" | "Event" | "General">("Academic");
  const [pinned, setPinned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("ALL");

  useEffect(() => {
    const unsub = AttendanceService.listenAnnouncements((list: AnnouncementItem[]) => {
      setPosts(list);
    });
    return () => unsub();
  }, []);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFacultyOrAdmin) {
      toast.error("Access Denied: Only Faculty and Administrators can publish announcements.");
      return;
    }

    if (!title.trim() || !body.trim()) {
      toast.error("Please enter both a title and details for the announcement.");
      return;
    }

    setLoading(true);
    try {
      const authorName = profile?.name || (role === "admin" ? "Campus Administration" : "Prof. Anil Kulkarni");
      const authorRole = role === "admin"
        ? "Registrar · Campus Administration"
        : role === "hod"
        ? "Dean of Academics & HOD"
        : `${profile?.department || "Faculty CSE"} · Authorized`;

      await AttendanceService.postAnnouncement({
        title: title.trim(),
        body: body.trim(),
        author: authorName,
        role: authorRole,
        category,
        pinned,
      });

      setTitle("");
      setBody("");
      setPinned(false);
      toast.success("Announcement published across campus channels!", {
        description: "Notification broadcast to student & guardian portals in real-time.",
      });
    } catch {
      toast.error("Failed to post announcement. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter((p) => {
    if (filterCategory !== "ALL" && p.category !== filterCategory) return false;
    return true;
  });

  return (
    <AppShell>
      <PageHeader
        eyebrow={isFacultyOrAdmin ? "Faculty & Institutional Broadcast Desk" : "Campus Notice Board · Live Feed"}
        title={isFacultyOrAdmin ? "Publish & manage announcements" : "Official campus announcements"}
        description={
          isFacultyOrAdmin
            ? "Broadcast verified attendance notices, examination schedules, and institutional circulars to students and parents."
            : "Official circulars, attendance warnings, examination alerts, and academic notices published by faculty & administration."
        }
      />

      <div className={isFacultyOrAdmin ? "grid gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]" : "space-y-6"}>
        {/* COMPOSE PANEL (STRICTLY ADMIN & FACULTY ONLY) */}
        {isFacultyOrAdmin && (
          <Panel
            title="Compose announcement"
            description="Broadcasts instantly to student and parent dashboards"
          >
            <form onSubmit={handlePost} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Notice Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Mid-Term Examination Schedule Released"
                  className="h-10 rounded-xl border-border bg-surface text-sm font-semibold"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Category</label>
                <Select value={category} onValueChange={(v: any) => setCategory(v)}>
                  <SelectTrigger className="h-10 rounded-xl border-border bg-surface text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="Urgent">🚨 Urgent / Attendance Alert</SelectItem>
                    <SelectItem value="Academic">📚 Academic / Syllabus</SelectItem>
                    <SelectItem value="Event">🎉 Campus Event / Hackathon</SelectItem>
                    <SelectItem value="General">📢 General Notification</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Message Body</label>
                <Textarea
                  rows={4}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Detailed announcement text for student & parent feed…"
                  className="resize-none rounded-xl border-border bg-surface text-sm"
                  required
                />
              </div>

              <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={pinned}
                  onChange={(e) => setPinned(e.target.checked)}
                  className="rounded border-border text-accent focus:ring-accent"
                />
                <span>Pin to top of notice board</span>
              </label>

              <Button
                type="submit"
                disabled={loading}
                className="h-11 w-full rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 shadow-xs font-semibold transition-all"
              >
                <Send className="mr-1.5 h-4 w-4" /> Broadcast Notice
              </Button>
            </form>
          </Panel>
        )}

        {/* ANNOUNCEMENT FEED (VIEWABLE BY ALL, READ-ONLY FOR STUDENT & PARENT) */}
        <Panel
          title="Institutional Notice Feed"
          description={
            isFacultyOrAdmin
              ? "Live feed synchronized with Firestore & cross-portal broadcast network"
              : "Official notices issued by campus administration and departmental professors"
          }
          action={
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {["ALL", "Urgent", "Academic", "Event", "General"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                    filterCategory === cat
                      ? "bg-accent text-accent-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  {cat === "ALL" ? "All Notices" : cat}
                </button>
              ))}
            </div>
          }
          bodyClassName="p-4"
        >
          <div className="space-y-3">
            <AnimatePresence>
              {filteredPosts.length > 0 ? (
                filteredPosts.map((a) => {
                  const isUrgent = a.category === "Urgent";
                  return (
                    <motion.article
                      key={a.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`rounded-2xl border p-4 shadow-xs transition-all hover:shadow-md ${
                        isUrgent
                          ? "border-destructive/40 bg-destructive/5"
                          : "border-border/80 bg-card"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {a.pinned && (
                            <span className="flex items-center gap-1 rounded-md bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-accent">
                              <Pin className="h-3 w-3" /> Pinned
                            </span>
                          )}
                          <StatusPill tone={isUrgent ? "absent" : "accent"}>{a.category}</StatusPill>
                        </div>
                        <span className="text-[11px] font-medium text-muted-foreground">{a.date}</span>
                      </div>

                      <h3 className="mt-2.5 font-display text-base font-bold text-foreground">{a.title}</h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-foreground/80 whitespace-pre-line">{a.body}</p>

                      <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-2.5 text-[11px] text-muted-foreground">
                        <span className="font-semibold text-foreground flex items-center gap-1">
                          <ShieldCheck className="h-3.5 w-3.5 text-accent" />
                          {a.author}
                        </span>
                        <span className="font-mono text-[10px]">{a.role}</span>
                      </div>
                    </motion.article>
                  );
                })
              ) : (
                <div className="py-12 text-center text-xs text-muted-foreground">
                  No announcements found in the selected category.
                </div>
              )}
            </AnimatePresence>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
