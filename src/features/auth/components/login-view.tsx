import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  CalendarCheck,
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  ShieldCheck,
  Building2,
  GraduationCap,
  Users,
  ShieldAlert,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { COLLEGE, type Role } from "@/lib/data";
import { ROLE_HOME } from "@/lib/utils";
import { useAuth, UserStore, SmsNotificationBanner } from "../index";

const ROLE_INFO: Record<
  Role,
  { label: string; icon: typeof User; defaultEmail: string; hint: string; phone: string; name: string }
> = {
  student: {
    label: "Student",
    icon: GraduationCap,
    defaultEmail: "ananya.deshpande@svit.ac.in",
    hint: "Scan QR, timetable & track 75% eligibility",
    phone: "+91 98220 41123",
    name: "Ananya Deshpande (21CS042)",
  },
  teacher: {
    label: "Faculty",
    icon: Users,
    defaultEmail: "anil.kulkarni@svit.ac.in",
    hint: "Live dynamic QR sessions & roster management",
    phone: "+91 98450 11223",
    name: "Prof. Anil Kulkarni",
  },
  admin: {
    label: "Admin",
    icon: Building2,
    defaultEmail: "registrar@svit.ac.in",
    hint: "Institution ledger, audit logs & academic calendar",
    phone: "+91 99000 88776",
    name: "Dr. Meenakshi Rao (Registrar)",
  },
  parent: {
    label: "Parent",
    icon: ShieldCheck,
    defaultEmail: "deshpande.parent@gmail.com",
    hint: "Ward's attendance digest, teacher chat & alerts",
    phone: "+91 98220 41123",
    name: "Sudhir Deshpande",
  },
  hod: {
    label: "HOD / Dean",
    icon: Building2,
    defaultEmail: "kavita.nair@svit.ac.in",
    hint: "Departmental analytics & faculty oversight",
    phone: "+91 99000 77665",
    name: "Dr. Kavita Nair",
  },
};

const SIGNIN_ROLES: Role[] = ["student", "teacher", "admin", "parent"];
const SIGNUP_ROLES: Role[] = ["student", "parent"];

export function LoginView() {
  const navigate = useNavigate();
  const { initiateLogin, initiateSignup, quickLogin, isAuthenticated, role: userRole, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate({ to: ROLE_HOME[userRole] });
    }
  }, [authLoading, isAuthenticated, userRole, navigate]);

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [role, setSelectedRole] = useState<Role>("student");

  // Form states
  const [identifier, setIdentifier] = useState(ROLE_INFO.student.defaultEmail);
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [roll, setRoll] = useState("");
  const [phone, setPhone] = useState("+91 98220 41123");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Status states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [dispatchedInfo, setDispatchedInfo] = useState<{ code: string; phone: string } | null>(null);

  const handleRoleChange = (newRole: Role) => {
    setSelectedRole(newRole);
    setError(null);
    if (mode === "signin") {
      setIdentifier(ROLE_INFO[newRole].defaultEmail);
      setPhone(ROLE_INFO[newRole].phone);
    }
  };

  const handleModeSwitch = (newMode: "signin" | "signup") => {
    setMode(newMode);
    setError(null);
    if (newMode === "signup") {
      if (role !== "student" && role !== "parent") {
        setSelectedRole("student");
        setIdentifier("");
      }
      setPassword("");
    } else {
      setIdentifier(ROLE_INFO[role].defaultEmail);
      setPassword("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "signin") {
        if (!password.trim()) {
          setError("Please enter your account password.");
          setLoading(false);
          return;
        }

        const res = await initiateLogin(identifier, password, role);
        setDispatchedInfo({ code: res.otp, phone: res.phone });

        toast.success("Security 6-Digit OTP Dispatched!", {
          description: `Code sent to registered mobile for ${res.name}.`,
        });
      } else {
        // Enforce signup role restrictions
        if (role === "teacher" || role === "admin" || role === "hod") {
          setError("Faculty and Administrative accounts can only be provisioned by the Administrator in the Admin Panel.");
          setLoading(false);
          return;
        }

        if (!name.trim()) {
          setError("Please enter your full name.");
          setLoading(false);
          return;
        }
        if (!identifier.trim() || !identifier.includes("@")) {
          setError("Please enter a valid email address.");
          setLoading(false);
          return;
        }
        if (!phone.trim() || phone.replace(/[^0-9]/g, "").length < 10) {
          setError("Please enter a valid 10-digit mobile number for OTP dispatch.");
          setLoading(false);
          return;
        }
        if (!password.trim() || password.length < 6) {
          setError("Password must be at least 6 characters long.");
          setLoading(false);
          return;
        }

        const res = await initiateSignup(identifier, password, name, role, roll, phone);
        setDispatchedInfo({ code: res.otp, phone: res.phone });

        toast.success("Account Registered & OTP Sent!", {
          description: `Verification OTP dispatched to registered mobile.`,
        });
      }

      setTimeout(() => {
        navigate({ to: "/otp" });
      }, 700);
    } catch (err: any) {
      setError(err?.message || "Authentication failed. Please verify your credentials.");
      toast.error("Authentication Blocked", {
        description: err?.message || "Please check credentials and selected role.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (selectedR: Role) => {
    quickLogin(selectedR);
    toast.success(`Direct Access: Logged in as ${ROLE_INFO[selectedR].label}!`, {
      description: `Authenticated with role: ${selectedR.toUpperCase()}`,
    });
    navigate({ to: ROLE_HOME[selectedR] });
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    toast.success("Password reset instructions dispatched!", {
      description: `Temporary reset link sent to ${forgotEmail}. Please check your inbox.`,
    });
    setShowForgot(false);
  };

  const activeRolesList = mode === "signup" ? SIGNUP_ROLES : SIGNIN_ROLES;

  return (
    <div className="grid min-h-screen lg:h-screen lg:max-h-screen lg:overflow-hidden lg:grid-cols-[1.15fr_1fr]">
      {/* Dispatched SMS Overlay */}
      <AnimatePresence>
        {dispatchedInfo && (
          <SmsNotificationBanner
            code={dispatchedInfo.code}
            phone={dispatchedInfo.phone}
            onDismiss={() => setDispatchedInfo(null)}
          />
        )}
      </AnimatePresence>

      {/* Brand Hero Sidebar */}
      <motion.aside
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative hidden flex-col justify-between border-r border-border bg-slate-950 px-8 py-8 lg:px-10 lg:py-8 text-white lg:flex"
      >
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-accent-foreground shadow-lg shadow-accent/20">
            <CalendarCheck className="h-5 w-5" strokeWidth={2.2} />
          </div>
          <div>
            <span className="font-display text-base font-bold text-white block">Smart Attendance System</span>
            <span className="text-xs text-slate-400 font-medium">Enterprise Campus Portal · SVIT</span>
          </div>
        </div>

        <div className="max-w-lg space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/15 text-accent text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="h-3.5 w-3.5" /> Strict Role-Based Authentication
          </span>
          <h1 className="font-display text-3xl xl:text-4xl font-bold leading-[1.15] tracking-tight text-white">
            Proxy-proof attendance with 2FA verification.
          </h1>
          <p className="text-xs xl:text-sm leading-relaxed text-slate-300">
            Cryptographic dynamic QR sessions, strict role-based access control (RBAC), and unique 6-digit OTP phone authentication.
          </p>

          <div className="space-y-2 pt-2 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Dedicated access partitions for Student, Faculty, Admin & Guardian.</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Faculty and Admin profiles are strictly appointed by the Registrar.</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Unique 6-digit mobile OTP verification per session.</span>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-3 text-[11px] text-slate-500">
          Smart Attendance System · Real-Time Institutional Ledger
        </div>
      </motion.aside>

      {/* Auth Form Main Area */}
      <main className="flex flex-col justify-between bg-background p-4 sm:p-6 lg:py-6 lg:px-8 overflow-y-auto">
        <div className="mx-auto w-full max-w-md space-y-4 my-auto">
          {/* Header */}
          <div className="space-y-1 text-center lg:text-left">
            <div className="flex items-center justify-center gap-2 lg:hidden mb-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-accent-foreground">
                <CalendarCheck className="h-4 w-4" />
              </div>
              <span className="font-display font-bold text-sm">Smart Attendance System</span>
            </div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
              {mode === "signin" ? "Sign In to Workspace" : "Register Scholar / Parent Profile"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {mode === "signin"
                ? "Select your target role and enter your verified credentials."
                : "Create a new scholar or guardian profile with mobile 2FA verification."}
            </p>
          </div>

          {/* Quick Demo Role Shortcut (Only for Quick Testing in Signin Mode) */}
          {mode === "signin" && (
            <div className="rounded-xl border border-border/80 bg-muted/30 p-2.5">
              <div className="flex items-center justify-between mb-1.5 px-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <KeyRound className="h-3 w-3 text-accent" /> One-Click Quick Access
                </span>
                <span className="text-[10px] text-accent font-medium">Demo Mode</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                {SIGNIN_ROLES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleQuickDemo(r)}
                    className="group relative flex flex-col items-center justify-center rounded-lg border border-border/60 bg-card p-2 text-center transition-all hover:border-accent hover:shadow-xs active:scale-[0.98]"
                  >
                    <span className="text-xs font-bold text-foreground group-hover:text-accent">
                      {ROLE_INFO[r].label}
                    </span>
                    <span className="text-[9px] text-muted-foreground mt-0.5 leading-none">
                      {r === "student" ? "Scholar" : r === "teacher" ? "Faculty" : r === "admin" ? "Registrar" : "Parent"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Role Selection Tabs */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {mode === "signin" ? "Target Role Authentication" : "Select Registration Role"}
              </Label>
              {mode === "signup" && (
                <span className="text-[10px] text-muted-foreground font-medium">
                  Faculty/Admin provisioned by Admin
                </span>
              )}
            </div>

            <div className={`grid gap-1 rounded-lg border border-border bg-muted/40 p-1 ${mode === "signup" ? "grid-cols-2" : "grid-cols-4"}`}>
              {activeRolesList.map((r) => {
                const isSelected = role === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleRoleChange(r)}
                    className={`flex items-center justify-center gap-1 rounded-md py-1.5 text-xs font-semibold transition-all ${
                      isSelected
                        ? "bg-card text-foreground shadow-xs border border-border/60"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span>{ROLE_INFO[r].label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Admin Policy Notice for Signup */}
          {mode === "signup" && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-amber-600 dark:text-amber-400">
              <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
              <div className="min-w-0 leading-relaxed">
                <strong>Faculty & Administrator Policy:</strong> Teacher and Admin accounts cannot be publicly registered. They are appointed directly by the Administrator inside the Admin Panel.
              </div>
            </div>
          )}

          {/* Role Identifier Info Banner (No Password Displayed) */}
          {mode === "signin" && (
            <div className="flex items-center justify-between rounded-lg border border-accent/20 bg-accent/5 px-3 py-2 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <Info className="h-4 w-4 shrink-0 text-accent" />
                <div className="min-w-0">
                  <span className="font-semibold text-foreground block truncate">
                    {ROLE_INFO[role].name}
                  </span>
                  <span className="text-[11px] text-muted-foreground block truncate">
                    Official ID: {ROLE_INFO[role].defaultEmail}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Error Banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive"
              >
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "signup" && (
              <>
                <div className="space-y-1">
                  <Label htmlFor="name" className="text-xs">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      required
                      placeholder={role === "student" ? "e.g. Rahul Sharma" : "e.g. Rajesh Sharma"}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-9 h-9 rounded-lg text-xs"
                    />
                  </div>
                </div>

                {role === "student" && (
                  <div className="space-y-1">
                    <Label htmlFor="roll" className="text-xs">University Roll Number</Label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="roll"
                        type="text"
                        placeholder="e.g. 21CS088"
                        value={roll}
                        onChange={(e) => setRoll(e.target.value)}
                        className="pl-9 h-9 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <Label htmlFor="phone" className="text-xs">Mobile Number (for 6-Digit 2FA SMS)</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-9 h-9 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1">
              <Label htmlFor="identifier" className="text-xs">
                {mode === "signin" ? "Institutional Email or Username" : "Email Address"}
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="identifier"
                  type="text"
                  required
                  placeholder={mode === "signin" ? ROLE_INFO[role].defaultEmail : "name@example.com"}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="pl-9 h-9 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs">Password</Label>
                {mode === "signin" && (
                  <button
                    type="button"
                    onClick={() => setShowForgot(true)}
                    className="text-[11px] font-medium text-accent hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-10 h-9 rounded-lg text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {mode === "signin" && (
              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-border text-accent focus:ring-accent"
                  />
                  <span>Keep session authenticated</span>
                </label>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-lg bg-accent hover:bg-accent/90 text-accent-foreground font-semibold text-xs shadow-md shadow-accent/15 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === "signin" ? "Verifying Credentials…" : "Creating Profile…"}
                </>
              ) : (
                <>
                  {mode === "signin" ? `Sign In as ${ROLE_INFO[role].label}` : "Register & Dispatch OTP"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Mode Switcher */}
          <div className="text-center pt-1">
            <p className="text-xs text-muted-foreground">
              {mode === "signin" ? "Need student or parent registration?" : "Already registered?"}{" "}
              <button
                type="button"
                onClick={() => handleModeSwitch(mode === "signin" ? "signup" : "signin")}
                className="font-semibold text-accent hover:underline ml-1"
              >
                {mode === "signin" ? "Create an account" : "Sign in instead"}
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-2 text-center text-[11px] text-muted-foreground">
          Smart Attendance System · Academic Affairs & IT Infrastructure
        </footer>
      </main>

      {/* Forgot Password Modal */}
      {showForgot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4"
          >
            <h3 className="font-display font-bold text-lg text-foreground">Reset Password</h3>
            <p className="text-xs text-muted-foreground">
              Enter your college registered email ID. We will send a secure link to reset your credentials.
            </p>
            <form onSubmit={handleForgotPassword} className="space-y-3">
              <Input
                type="email"
                required
                placeholder="ananya.deshpande@svit.ac.in"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="h-10 rounded-lg text-sm"
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForgot(false)}
                  className="flex-1 rounded-lg h-9 text-xs"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 rounded-lg h-9 bg-accent text-accent-foreground text-xs">
                  Send Link
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
