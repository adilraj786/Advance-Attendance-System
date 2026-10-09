import { useState, useEffect } from "react";
import {
  UserCheck,
  Smartphone,
  Shield,
  Loader2,
  Lock,
  Moon,
  Sun,
  KeyRound,
  GraduationCap,
  Users,
  Building,
  Heart,
  Sliders,
  Radio,
  Clock,
  Save,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader, Panel } from "@/components/common/section";
import { StatusPill } from "@/components/common/status-pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CURRENT_USER } from "@/lib/data";
import { useRole, useTheme } from "@/lib/utils";
import { useAuth, UserStore } from "@/features/auth";

export function SettingsView() {
  const role = useRole();
  const { dark, toggle } = useTheme();
  const { profile, updateProfileData } = useAuth();
  const fallbackUser = CURRENT_USER[role];

  // User form states
  const [name, setName] = useState(profile?.name || fallbackUser?.name || "");
  const [email, setEmail] = useState(profile?.email || "");
  const [phone, setPhone] = useState(profile?.phone || "+91 98220 41123");
  const [department, setDepartment] = useState(profile?.department || fallbackUser?.sub || "");
  const [mentor, setMentor] = useState(profile?.mentor || "Prof. Anil Kulkarni");
  const [saving, setSaving] = useState(false);

  // Sync state when profile updates
  useEffect(() => {
    if (profile) {
      setName(profile.name || fallbackUser?.name || "");
      setEmail(profile.email || "");
      setPhone(profile.phone || "+91 98220 41123");
      setDepartment(profile.department || fallbackUser?.sub || "");
      if (profile.mentor) setMentor(profile.mentor);
    }
  }, [profile, fallbackUser]);

  // Role-Specific Configuration States
  // 1. Student
  const [studentAlerts, setStudentAlerts] = useState({
    lowAttendance: true,
    qrStart: true,
    weeklyDigest: true,
    mentorMessages: true,
  });

  // 2. Faculty / Teacher
  const [facultySettings, setFacultySettings] = useState({
    qrInterval: "20s",
    autoCloseSession: true,
    lateGraceMinutes: "5",
    notifyOnStudentLeave: true,
  });

  // 3. Admin / HOD
  const [adminSettings, setAdminSettings] = useState({
    minAttendancePercent: "75",
    strictKnoxCheck: true,
    autoDefaulterSms: true,
    auditLogRetentionDays: "180",
  });

  // 4. Parent
  const [parentAlerts, setParentAlerts] = useState({
    dailySmsDigest: true,
    defaulterWarning: true,
    emergencyBroadcasts: true,
  });

  // Password change state
  const [currPassword, setCurrPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPass, setUpdatingPass] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfileData({
        name,
        email,
        phone,
        department,
        mentor: role === "student" ? mentor : undefined,
      });
      toast.success("Profile updated successfully!", {
        description: "Your account settings and institutional contact details are saved.",
      });
    } catch (err: any) {
      toast.error("Could not update profile: " + (err?.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match.");
      return;
    }

    setUpdatingPass(true);
    try {
      const activeEmail = profile?.email || email;
      if (activeEmail) {
        UserStore.updatePassword(activeEmail, newPassword);
      }
      setCurrPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated successfully!", {
        description: "Your security credentials have been updated in the institutional database.",
      });
    } catch (err: any) {
      toast.error("Could not update password: " + err?.message);
    } finally {
      setUpdatingPass(false);
    }
  };

  const roleLabel =
    role === "student"
      ? "Student Scholar"
      : role === "teacher"
        ? "Faculty Member"
        : role === "hod"
          ? "Dean / Head of Department"
          : role === "admin"
            ? "Campus Administrator"
            : "Guardian / Parent";

  const RoleIcon =
    role === "student"
      ? GraduationCap
      : role === "teacher"
        ? Users
        : role === "hod" || role === "admin"
          ? Building
          : Heart;

  return (
    <AppShell>
      <PageHeader
        eyebrow="Institutional Account Settings"
        title="Profile & Preferences"
        description={`Manage credentials, notification channels, and system preferences for ${roleLabel}.`}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        {/* Left Column: Personal Information & Role Customizations */}
        <div className="space-y-6">
          {/* Primary Profile Card */}
          <Panel title="Personal Information" description="Verified institutional identity">
            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="flex items-center gap-4 border-b border-border/50 pb-5">
                <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-accent/15 text-lg font-bold text-accent shadow-xs">
                  {name
                    .split(" ")
                    .map((p) => p[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase() || "SV"}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-base font-bold text-foreground">{name}</p>
                    <StatusPill tone="accent">{role.toUpperCase()}</StatusPill>
                  </div>
                  <p className="truncate text-xs text-muted-foreground mt-0.5">{department}</p>
                  <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-present">
                    <UserCheck className="h-3.5 w-3.5" /> Identity Verified Active
                  </span>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">Full Name</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-10 rounded-xl border-border bg-surface text-sm font-medium"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">Registered Email</Label>
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10 rounded-xl border-border bg-surface text-sm font-medium"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">Mobile (for SMS Notifications)</Label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-10 rounded-xl border-border bg-surface text-sm font-medium"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">
                    {role === "student" ? "Assigned Mentor" : "Department / Office"}
                  </Label>
                  {role === "student" ? (
                    <Input
                      value={mentor}
                      onChange={(e) => setMentor(e.target.value)}
                      className="h-10 rounded-xl border-border bg-surface text-sm font-medium"
                      required
                    />
                  ) : (
                    <Input
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="h-10 rounded-xl border-border bg-surface text-sm font-medium"
                      required
                    />
                  )}
                </div>
              </div>

              <Button
                type="submit"
                disabled={saving}
                className="h-10 px-6 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 shadow-xs font-semibold text-xs transition-all"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving Changes…
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Save Profile Details
                  </>
                )}
              </Button>
            </form>
          </Panel>

          {/* ========================================================================= */}
          {/* ROLE-SPECIFIC SETTINGS SECTIONS */}
          {/* ========================================================================= */}

          {/* 1. STUDENT SPECIFIC SETTINGS */}
          {role === "student" && (
            <Panel title="Student Attendance Alerts" description="Threshold warning and live session push alerts" bodyClassName="p-0">
              <ul className="divide-y divide-border/60">
                <li className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 p-4 hover:bg-muted/20 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Defaulter threshold alert (&lt;75%)</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Send immediate notification when attendance drops below the exam cutoff.</p>
                  </div>
                  <Switch
                    checked={studentAlerts.lowAttendance}
                    onCheckedChange={(c) => {
                      setStudentAlerts((p) => ({ ...p, lowAttendance: c }));
                      toast.info(`Defaulter alerts ${c ? "enabled" : "disabled"}.`);
                    }}
                  />
                </li>
                <li className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 p-4 hover:bg-muted/20 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Live QR Session broadcast alerts</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Notify instantly when a teacher opens a live attendance window for your section.</p>
                  </div>
                  <Switch
                    checked={studentAlerts.qrStart}
                    onCheckedChange={(c) => {
                      setStudentAlerts((p) => ({ ...p, qrStart: c }));
                      toast.info(`Live session notifications ${c ? "enabled" : "disabled"}.`);
                    }}
                  />
                </li>
                <li className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 p-4 hover:bg-muted/20 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Weekly parent SMS summary</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Dispatch weekly attendance percentage digest to parent mobile every Sunday.</p>
                  </div>
                  <Switch
                    checked={studentAlerts.weeklyDigest}
                    onCheckedChange={(c) => {
                      setStudentAlerts((p) => ({ ...p, weeklyDigest: c }));
                      toast.info(`Weekly parent digest ${c ? "enabled" : "disabled"}.`);
                    }}
                  />
                </li>
              </ul>
            </Panel>
          )}

          {/* 2. TEACHER SPECIFIC SETTINGS */}
          {role === "teacher" && (
            <Panel title="Classroom QR & Session Preferences" description="Configure live attendance sessions">
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground">QR Rotation Interval</Label>
                    <select
                      value={facultySettings.qrInterval}
                      onChange={(e) => {
                        setFacultySettings((p) => ({ ...p, qrInterval: e.target.value }));
                        toast.success(`QR rotation set to ${e.target.value}`);
                      }}
                      className="w-full h-10 rounded-xl border border-border bg-surface px-3 text-xs font-medium"
                    >
                      <option value="15s">15 Seconds (High Security)</option>
                      <option value="20s">20 Seconds (Standard / Recommended)</option>
                      <option value="30s">30 Seconds (Large Lecture Halls)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground">Late Arrival Grace Window</Label>
                    <select
                      value={facultySettings.lateGraceMinutes}
                      onChange={(e) => {
                        setFacultySettings((p) => ({ ...p, lateGraceMinutes: e.target.value }));
                        toast.success(`Grace window set to ${e.target.value} minutes`);
                      }}
                      className="w-full h-10 rounded-xl border border-border bg-surface px-3 text-xs font-medium"
                    >
                      <option value="0">No Grace (Exact Time)</option>
                      <option value="5">5 Minutes</option>
                      <option value="10">10 Minutes</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Auto-close session on lecture time completion</p>
                      <p className="text-xs text-muted-foreground">Automatically lock attendance ledger when class period ends.</p>
                    </div>
                    <Switch
                      checked={facultySettings.autoCloseSession}
                      onCheckedChange={(c) => setFacultySettings((p) => ({ ...p, autoCloseSession: c }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Instant alerts for student leave requests</p>
                      <p className="text-xs text-muted-foreground">Receive push notification when a student submits an OD or medical appeal.</p>
                    </div>
                    <Switch
                      checked={facultySettings.notifyOnStudentLeave}
                      onCheckedChange={(c) => setFacultySettings((p) => ({ ...p, notifyOnStudentLeave: c }))}
                    />
                  </div>
                </div>
              </div>
            </Panel>
          )}

          {/* 3. ADMIN / HOD SPECIFIC SETTINGS */}
          {(role === "admin" || role === "hod") && (
            <Panel title="Institutional Governance & Ledger Policies" description="System-wide attendance rules">
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground">Minimum Exam Eligibility Cutoff</Label>
                    <select
                      value={adminSettings.minAttendancePercent}
                      onChange={(e) => {
                        setAdminSettings((p) => ({ ...p, minAttendancePercent: e.target.value }));
                        toast.success(`Minimum eligibility cutoff updated to ${e.target.value}%`);
                      }}
                      className="w-full h-10 rounded-xl border border-border bg-surface px-3 text-xs font-medium"
                    >
                      <option value="70">70% Minimum</option>
                      <option value="75">75% Mandatory (University Norm)</option>
                      <option value="80">80% Strict</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground">Security Audit Trail Retention</Label>
                    <select
                      value={adminSettings.auditLogRetentionDays}
                      onChange={(e) => {
                        setAdminSettings((p) => ({ ...p, auditLogRetentionDays: e.target.value }));
                        toast.success(`Audit log retention set to ${e.target.value} days`);
                      }}
                      className="w-full h-10 rounded-xl border border-border bg-surface px-3 text-xs font-medium"
                    >
                      <option value="90">90 Days</option>
                      <option value="180">180 Days (1 Semester)</option>
                      <option value="365">365 Days (Full Academic Year)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Enforce Knox Hardware Device Binding</p>
                      <p className="text-xs text-muted-foreground">Block attendance scans if student device hardware ID mismatch is detected.</p>
                    </div>
                    <Switch
                      checked={adminSettings.strictKnoxCheck}
                      onCheckedChange={(c) => setAdminSettings((p) => ({ ...p, strictKnoxCheck: c }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Automated Defaulter SMS to Parents</p>
                      <p className="text-xs text-muted-foreground">Dispatch warning SMS automatically when attendance drops below threshold.</p>
                    </div>
                    <Switch
                      checked={adminSettings.autoDefaulterSms}
                      onCheckedChange={(c) => setAdminSettings((p) => ({ ...p, autoDefaulterSms: c }))}
                    />
                  </div>
                </div>
              </div>
            </Panel>
          )}

          {/* 4. PARENT SPECIFIC SETTINGS */}
          {role === "parent" && (
            <Panel title="Parent SMS & Alert Channels" description="Configure alerts for your registered ward" bodyClassName="p-0">
              <ul className="divide-y divide-border/60">
                <li className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 p-4 hover:bg-muted/20 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Daily Attendance SMS Digest</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Receive daily summary of classes attended by 5:00 PM IST.</p>
                  </div>
                  <Switch
                    checked={parentAlerts.dailySmsDigest}
                    onCheckedChange={(c) => {
                      setParentAlerts((p) => ({ ...p, dailySmsDigest: c }));
                      toast.info(`Daily SMS digest ${c ? "enabled" : "disabled"}.`);
                    }}
                  />
                </li>
                <li className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 p-4 hover:bg-muted/20 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Immediate Defaulter Shortage Warning</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Urgent SMS alert if attendance in any subject drops below 75%.</p>
                  </div>
                  <Switch
                    checked={parentAlerts.defaulterWarning}
                    onCheckedChange={(c) => {
                      setParentAlerts((p) => ({ ...p, defaulterWarning: c }));
                      toast.info(`Defaulter shortage alerts ${c ? "enabled" : "disabled"}.`);
                    }}
                  />
                </li>
              </ul>
            </Panel>
          )}
        </div>

        {/* Right Column: Bound Hardware, Appearance, and Security */}
        <div className="space-y-6">
          {/* Hardware Device Attestation Card */}
          <Panel title="Hardware & Device Attestation" description="Cryptographically bound device">
            <div className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border/70 bg-card">
              <div className="flex items-center gap-3 min-w-0">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">Samsung Galaxy SM-G991B</p>
                  <p className="truncate text-[11px] text-muted-foreground">Bound · Android 15 Knox Attested</p>
                </div>
              </div>
              <StatusPill tone="present">Active</StatusPill>
            </div>

            <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
              Your account is cryptographically tied to this smartphone to prevent proxy scanning.
            </p>
          </Panel>

          {/* Theme & Display Mode */}
          <Panel title="Display & Theme" description="Interface theme preference">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-muted text-foreground">
                  {dark ? <Moon className="h-4 w-4 text-accent" /> : <Sun className="h-4 w-4 text-amber-500" />}
                </div>
                <div>
                  <p className="text-sm font-semibold">{dark ? "Dark Mode" : "Light Mode"}</p>
                  <p className="text-xs text-muted-foreground">Current system appearance</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={toggle}
                className="h-9 px-4 rounded-xl text-xs font-semibold"
              >
                Switch to {dark ? "Light" : "Dark"}
              </Button>
            </div>
          </Panel>

          {/* Password & Security Panel */}
          <Panel title="Update Password" description="Account security credentials">
            <form onSubmit={handlePasswordUpdate} className="space-y-3.5">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-muted-foreground">Current Password</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={currPassword}
                  onChange={(e) => setCurrPassword(e.target.value)}
                  className="h-9 rounded-xl border-border bg-surface text-xs"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-muted-foreground">New Password</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-9 rounded-xl border-border bg-surface text-xs"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-muted-foreground">Confirm New Password</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-9 rounded-xl border-border bg-surface text-xs"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={updatingPass}
                className="w-full h-9 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-xs"
              >
                {updatingPass ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating Credentials…
                  </>
                ) : (
                  <>
                    <KeyRound className="mr-2 h-4 w-4" /> Change Password
                  </>
                )}
              </Button>
            </form>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
