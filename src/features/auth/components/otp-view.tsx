import { useEffect, useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck, Loader2, Sparkles, KeyRound, MessageSquare, AlertCircle, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { readRole, ROLE_HOME } from "@/lib/utils";
import { useAuth, UserStore, SmsNotificationBanner } from "../index";

export function OtpView() {
  const navigate = useNavigate();
  const { pendingAuth, verifyOtp, resendOtp, role, activeOtpData } = useAuth();

  const [mounted, setMounted] = useState(false);
  const [code, setCode] = useState("");
  const [left, setLeft] = useState(180); // 3 minutes standard OTP validity
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSmsBanner, setShowSmsBanner] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activePhone = mounted && pendingAuth?.phone ? pendingAuth.phone : "+91 98220 41123";
  const activeOtp = mounted && (pendingAuth?.otp || activeOtpData?.code) ? (pendingAuth?.otp || activeOtpData?.code!) : "849201";
  const maskedPhone = UserStore.maskPhone(activePhone);

  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);

  const handleVerify = async () => {
    if (code.length < 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const ok = await verifyOtp(code);
      if (ok) {
        toast.success("Identity & 2FA Successfully Verified!", {
          description: `Welcome back, ${pendingAuth?.name || "User"}! Opening authorized workspace…`,
        });
        const targetRole = pendingAuth?.role || role || readRole();
        setTimeout(() => {
          navigate({ to: ROLE_HOME[targetRole] });
        }, 350);
      }
    } catch (err: any) {
      setError(err?.message || "Verification failed. Please check the 6-digit code.");
      toast.error("Verification Failed", {
        description: err?.message || "Invalid OTP code entered.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    const newCode = resendOtp();
    setLeft(180);
    setCode("");
    setError(null);
    setShowSmsBanner(true);
    toast.info("Fresh 6-Digit OTP Dispatched!", {
      description: `Dispatched unique 2FA code to ${activePhone}.`,
    });
  };

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-12">
      {/* Interactive SMS Notification Banner */}
      <AnimatePresence>
        {showSmsBanner && (
          <SmsNotificationBanner
            code={activeOtp}
            phone={activePhone}
            onAutoFill={(otp) => {
              setCode(otp);
              toast.success("OTP Auto-filled from SMS notification!");
            }}
            onDismiss={() => setShowSmsBanner(false)}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md space-y-6 rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign in
          </Link>
          <span className="flex items-center gap-1 text-[11px] font-medium text-accent">
            <ShieldCheck className="h-3.5 w-3.5" /> 2FA Guard Active
          </span>
        </div>

        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent/15 text-accent text-[11px] font-bold uppercase tracking-wider">
            <Sparkles className="h-3 w-3" /> Two-Factor Phone Authentication
          </span>
          <h1 className="mt-2 font-display text-2xl font-bold text-foreground">Enter 6-Digit Security OTP</h1>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            A unique one-time verification code was dispatched to your mobile number{" "}
            <span suppressHydrationWarning className="font-semibold text-foreground font-mono">
              {maskedPhone}
            </span>
            .
          </p>
        </div>

        {/* Interactive OTP Auto-fill Badge */}
        <div
          onClick={() => {
            setCode(activeOtp);
            toast.success("OTP inserted!");
          }}
          className="cursor-pointer flex items-center justify-between rounded-xl border border-accent/30 bg-accent/10 px-3.5 py-2.5 text-xs text-accent transition-all hover:bg-accent/15 active:scale-[0.99]"
          title="Click to auto-fill OTP"
        >
          <span className="flex items-center gap-1.5 font-medium">
            <KeyRound className="h-3.5 w-3.5" /> SMS OTP:
          </span>
          <div className="flex items-center gap-2">
            <span
              suppressHydrationWarning
              className="font-mono font-bold tracking-widest text-sm bg-card px-2.5 py-0.5 rounded-md border border-accent/30 shadow-xs"
            >
              {activeOtp}
            </span>
            <span className="text-[10px] underline font-medium text-accent/80">Auto-fill</span>
          </div>
        </div>

        {/* 6-Digit OTP Input */}
        <div className="flex justify-center py-2">
          <InputOTP maxLength={6} value={code} onChange={setCode}>
            <InputOTPGroup className="gap-1.5 sm:gap-2">
              <InputOTPSlot index={0} className="rounded-md border-border h-12 w-11 text-base font-bold font-mono" />
              <InputOTPSlot index={1} className="rounded-md border-border h-12 w-11 text-base font-bold font-mono" />
              <InputOTPSlot index={2} className="rounded-md border-border h-12 w-11 text-base font-bold font-mono" />
              <InputOTPSlot index={3} className="rounded-md border-border h-12 w-11 text-base font-bold font-mono" />
              <InputOTPSlot index={4} className="rounded-md border-border h-12 w-11 text-base font-bold font-mono" />
              <InputOTPSlot index={5} className="rounded-md border-border h-12 w-11 text-base font-bold font-mono" />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center justify-center gap-2 text-center text-xs text-destructive font-medium bg-destructive/10 p-2 rounded-lg"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          onClick={handleVerify}
          disabled={loading || code.length < 6}
          className="w-full h-11 rounded-xl bg-accent font-semibold text-accent-foreground shadow-md shadow-accent/15 transition-all hover:bg-accent/90 text-sm"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying OTP & Granting Access…
            </>
          ) : (
            "Verify & Sign In"
          )}
        </Button>

        <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground">
          <span>
            {left > 0 ? (
              <>
                Expires in{" "}
                <span suppressHydrationWarning className="tabular font-semibold text-foreground">
                  {formatCountdown(left)}
                </span>
              </>
            ) : (
              <span className="text-destructive font-semibold">OTP Expired</span>
            )}
          </span>
          <button
            type="button"
            onClick={handleResend}
            className="flex items-center gap-1 font-semibold text-accent hover:underline disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RefreshCw className="h-3 w-3" /> Resend OTP
          </button>
        </div>

        <div className="border-t border-border pt-4 text-center">
          <p className="text-[11px] text-muted-foreground">
            Smart Attendance System · Encrypted 2FA Phone Verification
          </p>
        </div>
      </motion.div>
    </div>
  );
}
