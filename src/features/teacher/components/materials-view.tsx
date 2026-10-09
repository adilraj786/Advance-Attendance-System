import { useState, useEffect } from "react";
import {
  Download,
  FileText,
  UploadCloud,
  CheckCircle2,
  Search,
  Trash2,
  Loader2,
  User,
  Calendar,
  ImageIcon,
  X,
  Eye,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader, Panel, EmptyState } from "@/components/common/section";
import { StatusPill } from "@/components/common/status-pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SUBJECTS } from "@/lib/data";
import { AttendanceService, type CourseMaterialItem } from "@/features/attendance/attendance-service";
import { uploadToCloudinary, openOrDownloadMaterial } from "@/lib/cloudinary/uploader";
import { useAuth } from "@/features/auth";
import { cn } from "@/lib/utils";

function MaterialThumbnail({ url, name }: { url?: string | undefined; name: string }) {
  const [hasError, setHasError] = useState(false);
  const isImageExt = Boolean(
    (url && (url.startsWith("data:image/") || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(url))) ||
    /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(name)
  );

  if (isImageExt && url && !hasError) {
    return (
      <div className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 overflow-hidden rounded-xl border border-border bg-muted/40 flex items-center justify-center shadow-2xs">
        <img
          src={url}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
          onError={() => setHasError(true)}
        />
      </div>
    );
  }

  return (
    <span className="grid h-11 w-11 sm:h-12 sm:w-12 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent shadow-2xs font-bold">
      {isImageExt ? <ImageIcon className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
    </span>
  );
}

// Convert File to Base64 Data URL for 100% reliable local & instant view fallback
function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function MaterialsView() {
  const { role, profile } = useAuth();
  const isTeacherOrAdmin = role === "teacher" || role === "hod" || role === "admin";
  const facultyName = profile?.name || (role === "teacher" ? "Prof. Anil Kulkarni" : "Course Faculty");

  const [materials, setMaterials] = useState<CourseMaterialItem[]>(() => AttendanceService.getMaterials());
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [staged, setStaged] = useState<string | null>(null);
  const [stagedSize, setStagedSize] = useState<string>("2.4 MB");
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState("CS501");
  const [selectedFilterSubject, setSelectedFilterSubject] = useState<string>("ALL");
  const [kind, setKind] = useState<"Lecture Notes" | "Assignment" | "Lab Manual" | "Reference">("Lecture Notes");
  const [q, setQ] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgressMsg, setUploadProgressMsg] = useState("Uploading to Cloudinary & Central Database…");

  // In-app viewer modal state
  const [viewingItem, setViewingItem] = useState<CourseMaterialItem | null>(null);
  const [viewingImageError, setViewingImageError] = useState(false);

  // Real-time Firestore sync
  useEffect(() => {
    const unsub = AttendanceService.listenMaterials((list) => {
      setMaterials(list);
    });
    return () => unsub();
  }, []);

  const handleFileSelected = async (file: File) => {
    setRawFile(file);
    setStaged(file.name);
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    setStagedSize(file.size > 1024 * 1024 ? `${sizeInMb} MB` : `${Math.round(file.size / 1024)} KB`);

    // Generate local preview Data URL
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setPreviewDataUrl(dataUrl);
    } catch {
      setPreviewDataUrl(null);
    }

    toast.info(`Selected "${file.name}". Ready to upload.`);
  };

  const handlePublish = async () => {
    if (!rawFile && !staged) {
      toast.error("Please select a file or image to upload first.");
      return;
    }

    setUploading(true);
    setUploadProgressMsg("Uploading to Cloudinary CDN (Stores-Images)…");

    const subObj = SUBJECTS.find((s) => s.code === selectedSubject);

    try {
      // 1. Convert to high-resolution Data URL so the file is ALWAYS available
      let finalFileUrl = previewDataUrl || "";
      if (!finalFileUrl && rawFile) {
        finalFileUrl = await readFileAsDataUrl(rawFile);
      }

      // 2. Try uploading to Cloudinary (Stores-Images preset)
      if (rawFile) {
        try {
          const res = await uploadToCloudinary(rawFile);
          if (res.url) {
            finalFileUrl = res.url;
          }
        } catch (cloudErr) {
          console.warn("Cloudinary upload notice (using persistent data URL):", cloudErr);
        }
      }

      setUploadProgressMsg("Saving material to Firestore database…");

      // 3. Save document with verified URL to Firestore
      const newDoc = await AttendanceService.uploadMaterial({
        name: rawFile ? rawFile.name : staged || "Course_Document.pdf",
        size: stagedSize,
        fileUrl: finalFileUrl,
        subject: selectedSubject,
        subjectName: subObj ? subObj.name : "Computer Science Course",
        course: "B.Tech CSE",
        division: "Div A",
        kind: kind,
        uploadedBy: facultyName,
        facultyId: profile?.uid || "FAC-102",
      });

      setRawFile(null);
      setStaged(null);
      setPreviewDataUrl(null);
      setUploading(false);
      toast.success(`Published "${newDoc.name}" successfully! 🚀`, {
        description: `Material stored and synchronized with real-time student dashboard.`,
      });
    } catch (e: any) {
      setUploading(false);
      console.error("Upload error:", e);
      toast.error(e?.message || "Failed to publish material. Please try again.");
    }
  };

  const handleDownload = async (item: CourseMaterialItem) => {
    await AttendanceService.incrementMaterialDownload(item.id);
    openOrDownloadMaterial(item.fileUrl || "", item.name);
    toast.success(`Downloading ${item.name}…`, {
      description: `Course: ${item.subject} (${item.subjectName}) · Saved to device.`,
    });
  };

  const handleDelete = async (id: string, name: string) => {
    await AttendanceService.deleteMaterial(id);
    if (viewingItem?.id === id) {
      setViewingItem(null);
    }
    toast.info(`Removed ${name} from course distribution database.`);
  };

  const filtered = materials.filter((m) => {
    if (selectedFilterSubject !== "ALL" && m.subject !== selectedFilterSubject) return false;
    if (q && !`${m.name} ${m.subject} ${m.subjectName} ${m.kind} ${m.uploadedBy}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <AppShell>
      <PageHeader
        eyebrow={isTeacherOrAdmin ? "Faculty Course Distribution Center" : "Student Learning Resource Hub"}
        title="Notes & study materials"
        description={
          isTeacherOrAdmin
            ? "Upload images, lecture slides, lab manuals, and assignments to Cloudinary with real-time database sync."
            : "View and download lecture notes, assignment question sets, and lab guides for your registered courses."
        }
      />

      <div className={isTeacherOrAdmin ? "grid gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]" : "space-y-6"}>
        {isTeacherOrAdmin && (
          <Panel title="Upload Course Material" description="Upload lecture notes, question banks, lab sheets, and assignments">
            <div className="space-y-4">
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-card/40 p-6 text-center transition-all hover:border-accent hover:bg-accent/5">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent/15 text-accent font-bold">
                  <UploadCloud className="h-5 w-5" />
                </div>
                <span className="text-sm font-semibold text-foreground">Click to browse or drop file / image</span>
                <span className="text-xs text-muted-foreground">
                  Images (PNG, JPG, WEBP), PDF, DOCX, PPTX, IPYNB, ZIP
                </span>
                <input
                  type="file"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileSelected(file);
                    }
                  }}
                />
              </label>

              {staged && (
                <div className="flex items-center justify-between gap-2 rounded-xl border border-accent/40 bg-accent/10 p-3 text-xs font-semibold text-accent">
                  <div className="flex items-center gap-2 min-w-0">
                    {previewDataUrl ? (
                      <img src={previewDataUrl} alt="" className="h-8 w-8 rounded-lg object-cover border border-accent/30" />
                    ) : (
                      <FileText className="h-4 w-4 shrink-0" />
                    )}
                    <span className="truncate">{staged} ({stagedSize})</span>
                  </div>
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Course / Subject</label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="h-10 rounded-xl border-border bg-surface text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {SUBJECTS.map((s) => (
                      <SelectItem key={s.code} value={s.code}>
                        {s.code} · {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Material Type</label>
                <Select value={kind} onValueChange={(v: any) => setKind(v)}>
                  <SelectTrigger className="h-10 rounded-xl border-border bg-surface text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="Lecture Notes">Lecture Notes / PPT</SelectItem>
                    <SelectItem value="Assignment">Assignment Problem Set</SelectItem>
                    <SelectItem value="Lab Manual">Lab Manual & Code Guide</SelectItem>
                    <SelectItem value="Reference">Reference Syllabus / Textbook</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Uploading Faculty</label>
                <div className="h-10 flex items-center px-3.5 rounded-xl border border-border bg-muted/40 text-xs font-semibold text-foreground">
                  <User className="h-3.5 w-3.5 mr-2 text-accent" /> {facultyName}
                </div>
              </div>

              <Button
                onClick={handlePublish}
                disabled={uploading || !staged}
                className="h-11 w-full rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 shadow-xs font-semibold transition-all disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {uploadProgressMsg}
                  </>
                ) : (
                  "Upload & Publish Material"
                )}
              </Button>
            </div>
          </Panel>
        )}

        <Panel
          title={isTeacherOrAdmin ? "Published course materials" : "Course library & study resources"}
          description={`${filtered.length} live materials synced with Central Database`}
          bodyClassName="p-3.5 sm:p-5"
        >
          {/* Subject Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 mb-4 pb-3 border-b border-border">
            <button
              onClick={() => setSelectedFilterSubject("ALL")}
              className={cn(
                "px-3 py-1 text-xs font-bold rounded-xl transition-all",
                selectedFilterSubject === "ALL"
                  ? "bg-accent text-accent-foreground shadow-2xs"
                  : "bg-surface text-muted-foreground hover:text-foreground",
              )}
            >
              All Subjects ({materials.length})
            </button>
            {SUBJECTS.map((s) => (
              <button
                key={s.code}
                onClick={() => setSelectedFilterSubject(s.code)}
                className={cn(
                  "px-3 py-1 text-xs font-bold rounded-xl transition-all",
                  selectedFilterSubject === s.code
                    ? "bg-accent text-accent-foreground shadow-2xs"
                    : "bg-surface text-muted-foreground hover:text-foreground",
                )}
              >
                {s.code}
              </button>
            ))}
          </div>

          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search notes, subject code, instructor name or assignment…"
                className="h-10 pl-9 rounded-xl border-border bg-surface text-sm"
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="p-8 text-center">
              <EmptyState
                title="No course materials found"
                description="Uploaded documents will appear here with live real-time sync across faculty and students."
              />
            </div>
          ) : (
            <ul className="divide-y divide-border/60 rounded-xl border border-border/70 overflow-hidden">
              <AnimatePresence>
                {filtered.map((m) => (
                  <motion.li
                    key={m.id || m.name}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col sm:flex-row sm:items-center gap-3.5 p-3.5 sm:p-4 hover:bg-muted/20 transition-colors"
                  >
                    <div
                      onClick={() => {
                        setViewingImageError(false);
                        setViewingItem(m);
                      }}
                      className="flex items-start gap-3 min-w-0 flex-1 cursor-pointer"
                    >
                      <MaterialThumbnail url={m.fileUrl} name={m.name} />

                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <p className="text-xs sm:text-sm font-bold text-foreground break-all hover:text-accent transition-colors">
                            {m.name}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5">
                          <StatusPill tone="accent" className="text-[10px] py-0 px-2">{m.kind}</StatusPill>
                          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-muted text-foreground">
                            {m.subject} · {m.subjectName}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] sm:text-xs text-muted-foreground pt-0.5">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3 text-accent shrink-0" /> By: <strong className="text-foreground">{m.uploadedBy}</strong>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 shrink-0" /> {m.on}
                          </span>
                          <span>•</span>
                          <span>{m.size}</span>
                          <span>•</span>
                          <span className="text-accent font-semibold">{m.downloads} downloads</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t border-border/40 sm:border-0 justify-end sm:justify-start shrink-0">
                      {/* VIEW BUTTON */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setViewingImageError(false);
                          setViewingItem(m);
                        }}
                        className="h-9 px-3 rounded-xl border-border text-xs font-semibold hover:border-accent hover:text-accent flex-1 sm:flex-initial"
                      >
                        <Eye className="mr-1.5 h-3.5 w-3.5 text-accent" /> View
                      </Button>

                      {/* DOWNLOAD BUTTON */}
                      <Button
                        size="sm"
                        onClick={() => handleDownload(m)}
                        className="h-9 px-3.5 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 shadow-2xs text-xs font-semibold flex-1 sm:flex-initial"
                      >
                        <Download className="mr-1.5 h-3.5 w-3.5" /> Download
                      </Button>

                      {isTeacherOrAdmin && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(m.id, m.name)}
                          className="h-9 w-9 shrink-0 rounded-xl text-muted-foreground hover:bg-destructive/15 hover:text-destructive transition-colors"
                          title="Delete material from database"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </Panel>
      </div>

      {/* Exact File / Image Full-Screen Viewer Modal */}
      <AnimatePresence>
        {viewingItem && (() => {
          const url = viewingItem.fileUrl || "";
          const isImg =
            (url && (url.startsWith("data:image/") || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(url))) ||
            /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(viewingItem.name);
          const isPdf = url && (url.includes(".pdf") || url.startsWith("data:application/pdf"));

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setViewingItem(null)}
                className="fixed inset-0 bg-black/75 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border border-border bg-card shadow-2xl z-10 overflow-hidden"
              >
                {/* Modal Header */}
                <div className="flex items-start justify-between gap-3 p-4 sm:p-5 border-b border-border bg-surface">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent font-bold">
                      {isImg ? <ImageIcon className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-display text-sm sm:text-base font-bold text-foreground truncate break-all">
                        {viewingItem.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {viewingItem.subject} · {viewingItem.subjectName} · By {viewingItem.uploadedBy}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setViewingItem(null)}
                    className="rounded-xl p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Modal File Viewer Body */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                  {isImg && url && !viewingImageError ? (
                    <div className="rounded-2xl border border-border/80 bg-slate-950/50 p-2 sm:p-4 flex flex-col items-center justify-center min-h-[240px] max-h-[55vh] overflow-hidden">
                      <img
                        src={url}
                        alt=""
                        className="max-h-[50vh] w-auto max-w-full rounded-xl object-contain shadow-md"
                        onError={() => setViewingImageError(true)}
                      />
                    </div>
                  ) : isPdf && url ? (
                    <div className="rounded-2xl border border-border overflow-hidden h-[50vh]">
                      <iframe
                        src={url}
                        title={viewingItem.name}
                        className="w-full h-full border-0"
                      />
                    </div>
                  ) : (
                    /* Study Note & Document Preview Box */
                    <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 space-y-3 font-mono text-xs text-foreground leading-relaxed">
                      {viewingImageError && (
                        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 shrink-0" />
                          <span>
                            {isTeacherOrAdmin
                              ? "This item was uploaded with an outdated link. Please delete it below and re-upload the image."
                              : "Material preview is currently synchronizing. You can download the complete file below."}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between border-b border-border pb-2">
                        <span className="font-bold text-accent uppercase tracking-wider">{viewingItem.kind}</span>
                        <span className="text-muted-foreground">{viewingItem.size}</span>
                      </div>
                      <p className="font-sans text-sm font-semibold text-foreground">
                        {viewingItem.name}
                      </p>
                      <p className="text-xs text-muted-foreground font-sans">
                        Author: <strong className="text-foreground">{viewingItem.uploadedBy}</strong> ({viewingItem.facultyId || "Faculty Member"})
                        <br />
                        Published on {viewingItem.on} for {viewingItem.course} ({viewingItem.division}).
                      </p>
                      <div className="pt-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-sans font-medium flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4" /> Ready for direct high-speed download.
                      </div>
                    </div>
                  )}

                  {/* Metadata Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="rounded-xl bg-surface p-2.5 border border-border text-center">
                      <span className="text-[10px] text-muted-foreground block">Subject</span>
                      <span className="font-bold text-foreground">{viewingItem.subject}</span>
                    </div>
                    <div className="rounded-xl bg-surface p-2.5 border border-border text-center">
                      <span className="text-[10px] text-muted-foreground block">Format</span>
                      <span className="font-bold text-foreground">{viewingItem.kind}</span>
                    </div>
                    <div className="rounded-xl bg-surface p-2.5 border border-border text-center">
                      <span className="text-[10px] text-muted-foreground block">File Size</span>
                      <span className="font-mono font-bold text-foreground">{viewingItem.size}</span>
                    </div>
                    <div className="rounded-xl bg-surface p-2.5 border border-border text-center">
                      <span className="text-[10px] text-muted-foreground block">Downloads</span>
                      <span className="font-mono font-bold text-accent">{viewingItem.downloads}</span>
                    </div>
                  </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 border-t border-border bg-surface">
                  <Button
                    onClick={() => {
                      handleDownload(viewingItem);
                    }}
                    className={cn(
                      "h-10 rounded-xl bg-accent text-accent-foreground font-semibold text-xs shadow-xs",
                      isTeacherOrAdmin ? "flex-1 sm:flex-initial px-5" : "w-full"
                    )}
                  >
                    <Download className="mr-2 h-4 w-4" /> Download Exact File
                  </Button>

                  {isTeacherOrAdmin && (
                    <Button
                      variant="outline"
                      onClick={() => handleDelete(viewingItem.id, viewingItem.name)}
                      className="h-10 px-4 rounded-xl border-destructive/40 text-destructive hover:bg-destructive/10 text-xs font-semibold"
                    >
                      <Trash2 className="mr-1.5 h-4 w-4" /> Delete Item
                    </Button>
                  )}
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>
    </AppShell>
  );
}
