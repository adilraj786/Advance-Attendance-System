import { useState, useEffect, useRef } from "react";
import {
  Paperclip,
  Loader2,
  CheckCircle2,
  FileText,
  X,
  UploadCloud,
  Eye,
  Download,
  Image as ImageIcon,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { DataTable, type Column } from "@/components/common/data-table";
import { PageHeader, Panel } from "@/components/common/section";
import { StatusPill } from "@/components/common/status-pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AttendanceService, type LeaveRequest } from "@/features/attendance/attendance-service";
import { useAuth } from "@/features/auth";
import { uploadToCloudinary, openOrDownloadMaterial } from "@/lib/cloudinary/uploader";
import { cn } from "@/lib/utils";

const leaveTone: Record<"Pending" | "Approved" | "Rejected", "present" | "absent" | "leave"> = {
  Approved: "present",
  Rejected: "absent",
  Pending: "leave",
};

export function LeaveView() {
  const { profile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [leaves, setLeaves] = useState<LeaveRequest[]>(() => AttendanceService.getLeaves());
  const [fromDate, setFromDate] = useState("2026-08-20");
  const [toDate, setToDate] = useState("2026-08-22");
  const [leaveType, setLeaveType] = useState<"Medical" | "Casual" | "Duty" | "On-Duty">("Medical");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastSubmittedId, setLastSubmittedId] = useState<string | null>(null);

  // File Attachment State
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [attachmentName, setAttachmentName] = useState("");
  const [attachmentSize, setAttachmentSize] = useState("");
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  // Document Viewer Modal State
  const [viewingDoc, setViewingDoc] = useState<{ name: string; url?: string | undefined } | null>(null);

  useEffect(() => {
    const unsub = AttendanceService.listenLeaves((list) => {
      setLeaves(list);
    });
    return () => unsub();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File is too large. Maximum allowed size is 10 MB.");
      return;
    }

    setAttachedFile(file);
    setAttachmentName(file.name);
    const sizeInMb = file.size / (1024 * 1024);
    const formattedSize = sizeInMb >= 1 ? `${sizeInMb.toFixed(1)} MB` : `${Math.round(file.size / 1024)} KB`;
    setAttachmentSize(formattedSize);

    // If it's an image, read preview data URL
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        setAttachmentPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setAttachmentPreview(null);
    }

    toast.success(`Attached "${file.name}" (${formattedSize})`);
  };

  const handleRemoveAttachment = () => {
    setAttachedFile(null);
    setAttachmentName("");
    setAttachmentSize("");
    setAttachmentPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error("Please enter a reason for your leave request.");
      return;
    }

    setLoading(true);
    const fromD = new Date(fromDate);
    const toD = new Date(toDate);
    const diffTime = Math.abs(toD.getTime() - fromD.getTime());
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    let finalAttachmentUrl = "";
    if (attachedFile) {
      setUploadingDoc(true);
      try {
        const uploaded = await uploadToCloudinary(attachedFile);
        finalAttachmentUrl = uploaded.url;
      } catch (err) {
        console.warn("Cloudinary upload fallback to preview data URL:", err);
        if (attachmentPreview) {
          finalAttachmentUrl = attachmentPreview;
        }
      } finally {
        setUploadingDoc(false);
      }
    }

    try {
      const activeName = profile?.name || "Ananya Deshpande";
      const activeRoll = profile?.rollNumber || "21CS042";

      const created = await AttendanceService.submitLeave({
        studentName: activeName,
        studentRoll: activeRoll,
        type: leaveType,
        fromDate,
        toDate,
        days: days > 0 ? days : 1,
        reason,
        attachmentName: attachmentName || undefined,
        attachmentSize: attachmentSize || undefined,
        attachmentUrl: finalAttachmentUrl || undefined,
      });

      setLastSubmittedId(created.id);
      setReason("");
      handleRemoveAttachment();
      toast.success("Leave application submitted!", {
        description: `Reference #${created.id} queued for class-teacher verification.`,
      });
    } catch {
      toast.error("Failed to submit request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const columns: Column<LeaveRequest>[] = [
    { key: "id", header: "Ref", width: "96px", render: (r) => <span className="tabular font-mono text-xs font-semibold text-muted-foreground">{r.id}</span> },
    { key: "type", header: "Type", sortable: true, render: (r) => <span className="font-medium text-xs">{r.type}</span> },
    {
      key: "fromDate",
      header: "Dates",
      render: (r) => (
        <span className="tabular text-xs text-muted-foreground">
          {r.fromDate} → {r.toDate} ({r.days}d)
        </span>
      ),
    },
    {
      key: "reason",
      header: "Details & Document",
      render: (r) => (
        <div className="max-w-[220px]">
          <p className="truncate text-xs text-foreground/90">{r.reason}</p>
          {r.attachmentName && (
            <button
              type="button"
              onClick={() => setViewingDoc({ name: r.attachmentName!, url: r.attachmentUrl })}
              className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-accent hover:underline"
            >
              <Paperclip className="h-3 w-3" /> {r.attachmentName}
            </button>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      align: "right",
      sortable: true,
      render: (r) => (
        <div className="flex justify-end">
          <StatusPill tone={leaveTone[r.status]}>
            {r.status}
          </StatusPill>
        </div>
      ),
    },
  ];

  return (
    <AppShell>
      <PageHeader
        eyebrow="Semester V · Student Academic Portal"
        title="Leave request & medical condonation"
        description="Approved leave is excluded from attendance penalty calculations when verified by your proctor or HOD."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        {/* NEW APPLICATION FORM */}
        <Panel title="New application" description="Submit medical or on-duty certificates for verification">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="from" className="text-xs font-semibold text-muted-foreground">From date</Label>
                <Input
                  id="from"
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="h-10 rounded-xl border-border bg-surface text-sm font-medium"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="to" className="text-xs font-semibold text-muted-foreground">To date</Label>
                <Input
                  id="to"
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="h-10 rounded-xl border-border bg-surface text-sm font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Category</Label>
              <Select value={leaveType} onValueChange={(v: any) => setLeaveType(v)}>
                <SelectTrigger className="h-10 w-full rounded-xl border-border bg-surface text-sm">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="Medical">🏥 Medical Leave (Doctor's Certificate)</SelectItem>
                  <SelectItem value="On-Duty">🏆 On-Duty / Hackathon / Sports</SelectItem>
                  <SelectItem value="Casual">🏡 Casual / Family Function</SelectItem>
                  <SelectItem value="Duty">🏛️ Institute Institutional Duty</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reason" className="text-xs font-semibold text-muted-foreground">Reason & Explanatory Details</Label>
              <Textarea
                id="reason"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="State the reason clearly. Attach doctor prescription, hospital discharge slip, or event invitation letter…"
                className="resize-none rounded-xl border-border bg-surface text-sm"
                required
              />
            </div>

            {/* REAL WORKING FILE ATTACHMENT DROPZONE / BUTTON */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground">Supporting Document Attachment</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf,.doc,.docx"
                onChange={handleFileChange}
                className="sr-only"
              />

              {!attachedFile ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border px-4 py-5 text-center transition-all hover:border-accent hover:bg-accent/5 bg-card/40 cursor-pointer"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent/15 text-accent font-bold">
                    <UploadCloud className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-foreground block">
                      Click to upload medical certificate or proof
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      PNG, JPG, PDF, DOCX up to 10 MB
                    </span>
                  </div>
                </button>
              ) : (
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-accent/40 bg-accent/10 p-3.5 transition-all">
                  <div className="flex items-center gap-3 min-w-0">
                    {attachmentPreview ? (
                      <img
                        src={attachmentPreview}
                        alt="Preview"
                        className="h-10 w-10 rounded-lg object-cover border border-accent/30 shrink-0"
                      />
                    ) : (
                      <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent/20 text-accent shrink-0">
                        <FileText className="h-5 w-5" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-foreground">{attachmentName}</p>
                      <p className="text-[11px] text-accent font-semibold">{attachmentSize} · Ready for upload</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setViewingDoc({ name: attachmentName, url: attachmentPreview || undefined })}
                      className="grid h-8 w-8 place-items-center rounded-lg bg-card text-muted-foreground hover:text-foreground border border-border"
                      title="Preview Document"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveAttachment}
                      className="grid h-8 w-8 place-items-center rounded-lg bg-card text-muted-foreground hover:text-destructive border border-border"
                      title="Remove Attachment"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="h-11 px-5 flex-1 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 shadow-xs font-semibold transition-all"
              >
                {loading || uploadingDoc ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {uploadingDoc ? "Uploading Document…" : "Submitting Application…"}
                  </>
                ) : (
                  "Submit Leave Application"
                )}
              </Button>
            </div>

            <AnimatePresence>
              {lastSubmittedId && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 rounded-xl border border-present/30 bg-present/10 px-3.5 py-2.5 text-xs font-medium text-present"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  Application #{lastSubmittedId} active in Firestore queue.
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </Panel>

        {/* APPLICATION LOGS & HISTORY */}
        <Panel title="My Leave & Exemption Requests" description={`This semester · ${leaves.length} applications recorded`} bodyClassName="p-4">
          <DataTable
            columns={columns}
            rows={leaves}
            searchKeys={["type", "id", "reason"]}
            searchPlaceholder="Search by ref or reason…"
          />

          <div className="mt-6 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Detailed Application Timeline</p>
            {leaves.map((l) => (
              <motion.div
                key={l.id}
                layout
                className="rounded-2xl border border-border/70 bg-card p-4 shadow-xs transition-all hover:shadow-sm space-y-2.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-muted text-foreground">{l.id}</span>
                    <span className="text-xs font-semibold text-foreground">· {l.type}</span>
                  </div>
                  <StatusPill tone={leaveTone[l.status]}>{l.status}</StatusPill>
                </div>

                <p className="text-xs leading-relaxed text-foreground/90 font-medium bg-surface/70 p-3 rounded-xl border border-border/50">
                  {l.reason}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground border-t border-border/40 pt-2.5">
                  <span className="font-semibold text-foreground">
                    📅 {l.fromDate} to {l.toDate} ({l.days} day{l.days > 1 ? "s" : ""})
                  </span>
                  <span>Applied: {l.appliedAt}</span>
                </div>

                {l.attachmentName && (
                  <div className="flex items-center justify-between gap-2 rounded-xl bg-accent/5 border border-accent/20 p-2.5 text-xs">
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
                  <p className="text-[11px] text-muted-foreground italic">
                    Review Decision by: <strong className="text-foreground font-semibold">{l.actionBy}</strong>
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </Panel>
      </div>

      {/* DOCUMENT PREVIEW MODAL */}
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
                    <p className="text-xs text-muted-foreground mt-0.5">Verified Institutional Supporting Document</p>
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
                <Download className="mr-1.5 h-4 w-4" /> Download File
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
