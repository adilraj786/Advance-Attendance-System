import { useState } from "react";
import { Laptop, Smartphone, ShieldCheck, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader, Panel } from "@/components/common/section";
import { StatusPill } from "@/components/common/status-pill";
import { Button } from "@/components/ui/button";
import { LOGIN_HISTORY } from "@/lib/data";
import { cn } from "@/lib/utils";

export function DevicesView() {
  const [revoked, setRevoked] = useState<string[]>([]);

  const handleRevokeAllOthers = () => {
    const allOthers = LOGIN_HISTORY.filter((l) => !l.current).map((l) => l.ip + l.time);
    setRevoked(allOthers);
    toast.success("All other active sessions revoked!", {
      description: "Remote devices logged out. QR attendance can only be marked from this hardware.",
    });
  };

  const handleRevokeSingle = (key: string, device: string) => {
    setRevoked((prev) => [...prev, key]);
    toast.info(`Revoked session for ${device}.`);
  };

  return (
    <AppShell>
      <PageHeader
        eyebrow="Account Security & Hardware Verification"
        title="Login history & active sessions"
        description="One bound device per scholar ensures anti-proxy integrity. Revoking a session signs it out instantly."
        action={
          <Button
            variant="outline"
            onClick={handleRevokeAllOthers}
            className="h-10 px-4 rounded-xl border-border hover:bg-destructive/10 hover:text-destructive font-medium transition-all shadow-2xs"
          >
            <LogOut className="mr-2 h-4 w-4" /> Revoke All Other Sessions
          </Button>
        }
      />

      <Panel title="Active & Historical Sign-ins" description="Audit log of authorized hardware tokens (last 30 days)" bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {["Device & Client", "Location", "IP Address", "Timestamp", "Session State"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {LOGIN_HISTORY.map((l) => {
                const key = l.ip + l.time;
                const isRevoked = revoked.includes(key);
                return (
                  <motion.tr
                    key={key}
                    layout
                    className={cn(
                      "border-b border-border/60 hover:bg-muted/20 transition-colors",
                      isRevoked && "opacity-45 bg-muted/10",
                    )}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="grid h-8 w-8 place-items-center rounded-xl bg-accent/10 text-accent">
                          {l.device.toLowerCase().includes("samsung") || l.device.toLowerCase().includes("iphone") ? (
                            <Smartphone className="h-4 w-4" />
                          ) : (
                            <Laptop className="h-4 w-4" />
                          )}
                        </span>
                        <div>
                          <span className="font-semibold text-sm text-foreground block">{l.device}</span>
                          <span className="text-[11px] text-muted-foreground">Hardware Biometric Bound</span>
                        </div>
                        {l.current ? <StatusPill tone="accent">Current device</StatusPill> : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground font-medium">{l.location}</td>
                    <td className="px-4 py-3 tabular font-mono text-xs text-muted-foreground">{l.ip}</td>
                    <td className="px-4 py-3 tabular text-xs text-muted-foreground font-medium">{l.time}</td>
                    <td className="px-4 py-3 text-right">
                      {l.current ? (
                        <span className="text-xs font-semibold text-present flex items-center justify-end gap-1">
                          <ShieldCheck className="h-4 w-4" /> Active Now
                        </span>
                      ) : isRevoked ? (
                        <StatusPill tone="muted">Revoked</StatusPill>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-3 rounded-lg border-destructive/40 text-destructive hover:bg-destructive/10 text-xs font-medium"
                          onClick={() => handleRevokeSingle(key, l.device)}
                        >
                          Revoke Access
                        </Button>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </AppShell>
  );
}
