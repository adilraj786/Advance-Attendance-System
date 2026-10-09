import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Copy, Check, X, ShieldAlert, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface SmsBannerProps {
  code: string;
  phone: string;
  onAutoFill?: (code: string) => void;
  onDismiss?: () => void;
}

export function SmsNotificationBanner({ code, phone, onAutoFill, onDismiss }: SmsBannerProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("OTP Copied to Clipboard!", {
      description: `Code: ${code}`,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className="fixed top-4 inset-x-4 sm:inset-x-auto sm:right-6 sm:w-96 z-50 rounded-2xl border border-border bg-card/95 backdrop-blur-md p-3.5 shadow-2xl shadow-black/20"
    >
      <div className="flex items-start gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground shadow-sm">
          <MessageSquare className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-accent flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> SMS from SVIT-AUTH
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">Just now</span>
          </div>
          <p className="mt-1 text-xs text-foreground font-medium leading-relaxed">
            Your SVIT Smart Attendance verification code is{" "}
            <span className="font-mono font-bold text-accent bg-accent/10 px-1.5 py-0.5 rounded text-sm tracking-wider">
              {code}
            </span>
            . Valid for 3 minutes.
          </p>
          <div className="mt-2.5 flex items-center gap-2">
            {onAutoFill && (
              <button
                type="button"
                onClick={() => onAutoFill(code)}
                className="flex items-center gap-1.5 rounded-lg bg-accent px-2.5 py-1 text-[11px] font-semibold text-accent-foreground transition-all hover:bg-accent/90"
              >
                Auto-fill Code
              </button>
            )}
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/50 px-2 py-1 text-[11px] font-medium text-foreground transition-all hover:bg-muted"
            >
              {copied ? <Check className="h-3 w-3 text-ok" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied" : "Copy"}
            </button>
            {onDismiss && (
              <button
                type="button"
                onClick={onDismiss}
                className="ml-auto text-muted-foreground hover:text-foreground p-1"
                aria-label="Dismiss"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
