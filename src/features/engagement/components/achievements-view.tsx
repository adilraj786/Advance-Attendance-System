import { useState } from "react";
import { Award, Lock, Sparkles, Trophy, Download, CheckCircle2, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader, Panel } from "@/components/common/section";
import { StatCard } from "@/components/common/stat-card";
import { Button } from "@/components/ui/button";
import { BADGES, STREAK_MILESTONES } from "@/lib/data";
import { cn } from "@/lib/utils";

import { useAuth } from "@/features/auth";

const INITIAL_STREAK = 11;

type BadgeType = (typeof BADGES)[number];

export function AchievementsView() {
  const { profile } = useAuth();
  const [streak, setStreak] = useState(INITIAL_STREAK);
  const [badges] = useState(BADGES);
  const [selectedBadge, setSelectedBadge] = useState<BadgeType | null>(null);

  const next = STREAK_MILESTONES.find((m) => m > streak) ?? STREAK_MILESTONES[STREAK_MILESTONES.length - 1]!;
  const progress = Math.min(100, Math.round((streak / next) * 100));

  const handleClaimCertificate = (badgeName: string) => {
    const studentName = profile?.name || "Ananya Deshpande";
    const studentRoll = profile?.rollNumber || "21CS042";
    const studentDept = profile?.department || "Computer Science & Engineering";
    const timestamp = new Date().toLocaleDateString("en-IN", { dateStyle: "full" });
    const certId = "SVIT-CERT-" + Math.random().toString(36).substring(2, 9).toUpperCase();

    const certHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Certificate of Achievement - ${badgeName}</title>
  <style>
    body { font-family: 'Georgia', serif; background: #0f172a; margin: 0; padding: 40px; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
    .cert-frame { width: 850px; background: #ffffff; border: 12px double #ca8a04; border-radius: 16px; padding: 48px; text-align: center; color: #1e293b; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); position: relative; }
    .gold-crest { width: 72px; height: 72px; margin: 0 auto 16px; background: linear-gradient(135deg, #eab308, #ca8a04); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 32px; box-shadow: 0 4px 12px rgba(202,138,4,0.4); }
    .inst-name { font-size: 26px; font-weight: 800; letter-spacing: 2px; color: #0f172a; text-transform: uppercase; font-family: 'Segoe UI', sans-serif; }
    .inst-sub { font-size: 12px; color: #64748b; letter-spacing: 1px; text-transform: uppercase; margin-top: 4px; font-family: 'Segoe UI', sans-serif; }
    .cert-title { font-size: 32px; font-style: italic; color: #ca8a04; margin: 28px 0 16px; font-family: 'Georgia', serif; }
    .awarded-to { font-size: 14px; text-transform: uppercase; letter-spacing: 2px; color: #64748b; font-family: 'Segoe UI', sans-serif; }
    .student-name { font-size: 32px; font-weight: 800; color: #1e3a8a; margin: 12px 0 6px; font-family: 'Segoe UI', sans-serif; text-decoration: underline decoration-gold; }
    .student-details { font-size: 14px; color: #475569; font-family: 'Segoe UI', sans-serif; }
    .reason { max-width: 650px; margin: 20px auto; font-size: 16px; line-height: 1.6; color: #334155; }
    .badge-pill { display: inline-block; background: #fef08a; color: #854d0e; padding: 8px 24px; border-radius: 9999px; font-weight: 700; font-size: 16px; margin-top: 10px; font-family: 'Segoe UI', sans-serif; }
    .cert-footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 48px; padding-top: 24px; border-top: 1px solid #e2e8f0; font-family: 'Segoe UI', sans-serif; }
    .sign-block { text-align: center; }
    .sign-line { width: 160px; border-top: 1.5px solid #0f172a; margin-bottom: 6px; }
    .cert-id { font-size: 11px; color: #94a3b8; text-align: left; }
    @media print { body { background: #ffffff; padding: 0; } .cert-frame { box-shadow: none; border: 8px solid #ca8a04; } }
  </style>
</head>
<body>
  <div class="cert-frame">
    <div class="gold-crest">★</div>
    <div class="inst-name">SVIT INSTITUTION OF TECHNOLOGY</div>
    <div class="inst-sub">Office of Academic Affairs & Student Governance</div>
    
    <div class="cert-title">Certificate of Academic Punctuality & Excellence</div>
    
    <div class="awarded-to">This credential is proud to be presented to</div>
    <div class="student-name">${studentName}</div>
    <div class="student-details">Roll No: <strong>${studentRoll}</strong> · Department of ${studentDept}</div>
    
    <div class="reason">
      For exemplary commitment and outstanding attendance performance in the Academic Term 2026-27, successfully earning the institutional credential:
      <br>
      <div class="badge-pill">🏆 ${badgeName}</div>
    </div>

    <div class="cert-footer">
      <div class="cert-id">
        <strong>Credential ID:</strong> ${certId}<br>
        <strong>Verified Date:</strong> ${timestamp}<br>
        <strong>Smart Attendance Blockchain Hash:</strong> VERIFIED-0x9a8b7c
      </div>
      <div class="sign-block">
        <div class="sign-line"></div>
        <strong>Prof. Anil Kulkarni</strong><br>
        <span style="font-size: 11px; color: #64748b;">Class Mentor</span>
      </div>
      <div class="sign-block">
        <div class="sign-line"></div>
        <strong>Dr. Kavita Nair</strong><br>
        <span style="font-size: 11px; color: #64748b;">Dean of Academics</span>
      </div>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([certHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `SVIT_Certificate_${badgeName.replace(/[^a-zA-Z0-9]/g, "_")}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 2000);

    toast.success(`Certificate for "${badgeName}" downloaded!`, {
      description: `Saved SVIT_Certificate_${badgeName.replace(/[^a-zA-Z0-9]/g, "_")}.html`,
    });
  };

  const handleShare = (badgeName: string) => {
    toast.info(`Sharing badge "${badgeName}"`, {
      description: "Link copied to clipboard for LinkedIn / portfolio verification.",
    });
  };

  const handleBoostStreak = () => {
    setStreak((s) => s + 1);
    toast.success("Attendance streak increased to " + (streak + 1) + " days! 🔥", {
      description: "Verified through real-time attendance scan.",
    });
  };

  return (
    <AppShell>
      <PageHeader
        eyebrow="Semester V · CSE-A"
        title="Achievements & Badges"
        description="Earn verified institutional credentials and rewards for punctual attendance."
        action={
          <Button
            onClick={handleBoostStreak}
            className="h-10 px-4 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 shadow-xs font-semibold text-xs transition-all"
          >
            <Sparkles className="mr-1.5 h-4 w-4" /> Simulate Next Class Scan
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Current unbroken streak" value={streak} unit="days" delta="+1 today" hint={`Next milestone at ${next} days`} tone="present" />
        <StatCard label="Unlocked credentials" value={badges.filter((b) => b.unlocked).length} hint={`of ${badges.length} available honors`} tone="accent" />
        <StatCard label="Campus streak ranking" value="#14" hint="Top 2% across 2,500 scholars" tone="present" />
      </div>

      <Panel
        title="Active Streak Progress"
        description={`Current run: ${streak} consecutive scheduled sessions attended without absence`}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground">
              {streak} Days Reached · Target: {next} Days
            </span>
            <span className="font-mono font-bold text-accent">{progress}% Milestone</span>
          </div>

          <div className="h-3 w-full overflow-hidden rounded-full bg-muted/60 p-0.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6 }}
              className="h-full rounded-full bg-accent shadow-xs shadow-accent/40"
            />
          </div>

          <div className="flex justify-between text-[11px] text-muted-foreground pt-1">
            {STREAK_MILESTONES.map((m) => (
              <span
                key={m}
                className={cn(
                  "font-medium",
                  streak >= m ? "text-accent font-bold" : "text-muted-foreground",
                )}
              >
                {m}d {streak >= m ? "✓" : ""}
              </span>
            ))}
          </div>
        </div>
      </Panel>

      <Panel
        title="Badges & Honor Gallery"
        description="Click any unlocked badge to view cryptographic certificate or share"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {badges.map((b) => (
            <motion.div
              key={b.name}
              whileHover={{ y: -2 }}
              onClick={() => setSelectedBadge(b)}
              className={cn(
                "group relative cursor-pointer rounded-2xl border p-5 transition-all",
                b.unlocked
                  ? "border-border/80 bg-card hover:border-accent hover:shadow-md"
                  : "border-border/40 bg-muted/20 opacity-60",
              )}
            >
              <div className="flex items-start justify-between">
                <span
                  className={cn(
                    "grid h-12 w-12 place-items-center rounded-2xl text-xl shadow-xs transition-transform group-hover:scale-105",
                    b.unlocked
                      ? "bg-accent/15 text-accent"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {b.unlocked ? <Award className="h-6 w-6" /> : <Lock className="h-5 w-5" />}
                </span>
                {b.unlocked ? (
                  <span className="flex items-center gap-1 rounded-full bg-present/15 px-2.5 py-0.5 text-[10px] font-bold text-present">
                    <CheckCircle2 className="h-3 w-3" /> Unlocked
                  </span>
                ) : (
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    Locked
                  </span>
                )}
              </div>

              <h4 className="mt-4 font-display text-base font-bold text-foreground group-hover:text-accent transition-colors">
                {b.name}
              </h4>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{b.detail}</p>
            </motion.div>
          ))}
        </div>
      </Panel>

      {/* Badge Details Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4 text-center"
          >
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-accent/20 text-accent">
              <Trophy className="h-8 w-8" />
            </div>
            <div>
              <h3 className="font-display font-bold text-xl text-foreground">{selectedBadge.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">{selectedBadge.detail}</p>
            </div>

            {selectedBadge.unlocked ? (
              <div className="space-y-2 pt-2">
                <Button
                  onClick={() => handleClaimCertificate(selectedBadge.name)}
                  className="w-full rounded-xl bg-accent text-accent-foreground font-semibold text-xs h-10 shadow-xs"
                >
                  <Download className="mr-1.5 h-4 w-4" /> Download Certificate (PDF)
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleShare(selectedBadge.name)}
                  className="w-full rounded-xl text-xs h-10 border-border"
                >
                  <Share2 className="mr-1.5 h-4 w-4" /> Share Credential
                </Button>
              </div>
            ) : (
              <p className="text-xs text-absent font-medium bg-absent/10 p-2.5 rounded-xl border border-absent/20">
                Continue regular attendance scans to unlock this milestone.
              </p>
            )}

            <Button
              variant="ghost"
              onClick={() => setSelectedBadge(null)}
              className="w-full rounded-xl text-xs h-9"
            >
              Close
            </Button>
          </motion.div>
        </div>
      )}
    </AppShell>
  );
}
