import { useState, useEffect } from "react";
import { Check, X, Search, Clock, CheckCircle2, XCircle, Paperclip, Eye, Download, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader, Panel, EmptyState } from "@/components/common/section";
import { StatCard } from "@/components/common/stat-card";
import { StatusPill } from "@/components/common/status-pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { AttendanceService, type LeaveRequest } from "@/features/attendance/attendance-service";
import { useAuth } from "@/features/auth";
import { openOrDownloadMaterial } from "@/lib/cloudinary/uploader";

const tone: Record<"Pending" | "Approved" | "Rejected", "present" | "absent" | "leave"> = {
  Approved: "present",
  Rejected: "absent",
  Pending: "leave",
};

const FILTERS = ["all", "Pending", "Approved", "Rejected"] as const;

export function ApprovalsView() {
  const { profile } = useAuth();
  const [leaves, setLeaves] = useState<LeaveRequest[]>(() => AttendanceService.getLeaves());
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("Pending");
  const [q, setQ] = useState("");
  const [viewingDoc, setViewingDoc] = useState<{ name: string; url?: string | undefined } | null>(null);

  useEffect(() => {
    const unsub = AttendanceService.listenLeaves((updated) => {
      setLeaves(updated);
    });
    return () => unsub();
  }, []);

  const handleAction = async (id: string, status: "Approved" | "Rejected") => {
    try {
      const reviewerName = profile?.name || "Prof. Anil Kulkarni";
      await AttendanceService.updateLeaveStatus(id, status, reviewerName);
      if (status === "Approved") {
        toast.success(`Leave request #${id} approved!`, {
          description: "Attendance ledger updated to exempt corresponding class hours.",
        });
      } else {
        toast.error(`Leave request #${id} rejected.`, {
          description: "Notification dispatched to student and parent portal.",
        });
      }
    } catch {
      toast.error("Failed to update status. Please try again.");
    }
  };

  const rows = leaves.filter((l) => {
    if (filter !== "all" && l.status !== filter) return false;
    if (q && !`${l.studentName} ${l.studentRoll} ${l.type} ${l.reason}`.toLowerCase().includes(q.toLowerCase())) {
      return false;
    }
    return true;
  });

  const count = (s: "Pending" | "Approved" | "Rejected") => leaves.filter((x) => x.status === s).length;

  return (
    <AppShell>
      <PageHeader
        eyebrow="Dept. of Computer Science & Engineering"
        title="Leave approvals & condonation"
        description="Review student medical certificates, hackathon invitations, and sanction attendance exemptions."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Pending queue" value={count("Pending")} hint="awaiting faculty action" tone="leave" icon={Clock} />
        <StatCard label="Approved this term" value={count("Approved")} hint="verified certificates" tone="present" icon={CheckCircle2} />
        <StatCard label="Rejected" value={count("Rejected")} hint="insufficient reason" tone="absent" icon={XCircle} />
      </div>

      <Panel title="Request queue" description="Live synchronization with student applications">
        <div className="mb-4 grid gap-3 sm:flex sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search student, roll number, reason…"
              className="h-10 pl-9 rounded-xl border-border bg-surface text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-xl border px-3.5 py-1.5 text-xs font-medium capitalize transition-all",
                  filter === f
                    ? "border-accent bg-accent/15 text-foreground shadow-xs font-semibold"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {f} ({f === "all" ? leaves.length : count(f)})
              </button>
            ))}
          </div>
        </div>

        {rows.length === 0 ? (
          <EmptyState
            title="No requests in this filter"
            description="All student applications in this category have been processed."
          />
        ) : (
          <ul className="divide-y divide-border/60 rounded-xl border border-border overflow-hidden">
            <AnimatePresence>
              {rows.map((l) => (
                <motion.li
                  key={l.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center hover:bg-muted/30 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <p className="text-sm font-semibold text-foreground">{l.studentName}</p>
                      <span className="font-mono text-xs font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                        {l.studentRoll}
                      </span>
                      <StatusPill tone={tone[l.status]}>{l.status}</StatusPill>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{l.type}</span> · {l.fromDate} to {l.toDate} ({l.days} day{l.days > 1 ? "s" : ""}) · Applied {l.appliedAt}
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-foreground/80 bg-surface/80 p-2.5 rounded-lg border border-border/50">
                      "{l.reason}"
                    </p>

                    {l.attachmentName && (
                      <div className="mt-2 flex items-center justify-between gap-2 rounded-xl bg-accent/5 border border-accent/20 p-2 text-xs max-w-md">
                        <div className="flex items-center gap-2 min-w-0">
                          <Paperclip className="h-3.5 w-3.5 text-accent shrink-0" />
                          <span className="truncate font-semibold text-foreground">{l.attachmentName}</span>
                          {l.attachmentSize && <span className="text-muted-foreground text-[10px]">({l.attachmentSize})</span>}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setViewingDoc({ name: l.attachmentName!, url: l.attachmentUrl })}
                          className="h-7 px-2.5 text-xs text-accent hover:bg-accent/15 font-semibold shrink-0"
                        >
                          <Eye className="mr-1 h-3 w-3" /> View Proof
                        </Button>
                      </div>
                    )}

                    {l.actionBy && (
                      <p className="mt-1.5 text-[11px] text-muted-foreground">
                        Actioned by: <span className="font-medium text-foreground">{l.actionBy}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 gap-2 w-full sm:w-auto sm:self-center">
                    <Button
                      size="sm"
                      className="h-9 px-3.5 flex-1 sm:flex-initial rounded-lg bg-present text-white hover:bg-present/90 shadow-xs font-medium transition-all"
                      onClick={() => handleAction(l.id, "Approved")}
                      disabled={l.status === "Approved"}
                    >
                      <Check className="mr-1.5 h-4 w-4" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 px-3.5 flex-1 sm:flex-initial rounded-lg border-absent/40 text-absent hover:bg-absent/10 hover:text-absent font-medium transition-all"
                      onClick={() => handleAction(l.id, "Rejected")}
                      disabled={l.status === "Rejected"}
                    >
                      <X className="mr-1.5 h-4 w-4" /> Reject
                    </Button>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </Panel>

      {/* DOCUMENT VIEWER MODAL */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-accent" />
                <h3 className="font-display font-bold text-base text-foreground truncate max-w-xs">{viewingDoc.name}</h3>
              </div>
              <button
                onClick={() => setViewingDoc(null)}
                className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-surface p-6 text-center space-y-3 min-h-[220px]">
              {viewingDoc.url && (viewingDoc.url.startsWith("data:image") || viewingDoc.url.includes("cloudinary")) ? (
                <img
                  src={viewingDoc.url}
                  alt={viewingDoc.name}
                  className="max-h-64 max-w-full rounded-lg object-contain shadow-sm"
                />
              ) : (
                <>
                  <div className="grid h-16 w-16 place-items-center rounded-2xl bg-accent/15 text-accent">
                    <FileText className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{viewingDoc.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Attached Student Supporting Document</p>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => openOrDownloadMaterial(viewingDoc.url || "", viewingDoc.name)}
                className="flex-1 rounded-xl h-10 text-xs font-semibold"
              >
                <Download className="mr-1.5 h-4 w-4" /> Download Document
              </Button>
              <Button
                onClick={() => setViewingDoc(null)}
                className="flex-1 rounded-xl h-10 bg-accent text-accent-foreground font-semibold text-xs"
              >
                Close Preview
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AppShell>
  );
}
