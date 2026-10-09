import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  unit,
  delta,
  hint,
  icon: Icon,
  tone = "default",
  className,
}: {
  label: string;
  value: string | number;
  unit?: string;
  delta?: string;
  hint?: string;
  icon?: LucideIcon;
  tone?: "default" | "accent" | "present" | "absent" | "leave";
  className?: string;
}) {
  const toneText =
    tone === "accent"
      ? "text-accent"
      : tone === "present"
        ? "text-present"
        : tone === "absent"
          ? "text-absent"
          : tone === "leave"
            ? "text-leave"
            : "text-foreground";

  return (
    <div
      className={cn(
        "group relative rounded-md border border-border bg-card p-4 transition-colors hover:border-foreground/20",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.09em] text-muted-foreground">{label}</p>
        {Icon ? <Icon className="h-4 w-4 shrink-0 text-muted-foreground/70" strokeWidth={1.6} /> : null}
      </div>
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className={cn("font-display text-[28px] font-semibold leading-none tabular", toneText)}>{value}</span>
        {unit ? <span className="text-sm text-muted-foreground">{unit}</span> : null}
      </div>
      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
        {delta ? (
          <span className={cn("tabular font-medium", delta.startsWith("-") ? "text-absent" : "text-present")}>
            {delta}
          </span>
        ) : null}
        {hint ? <span className="truncate">{hint}</span> : null}
      </div>
    </div>
  );
}
