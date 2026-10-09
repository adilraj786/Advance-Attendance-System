import { cn } from "@/lib/utils";

const tones = {
  present: "border-present/35 text-present bg-present/10",
  absent: "border-absent/35 text-absent bg-absent/10",
  leave: "border-leave/45 text-leave bg-leave/12",
  accent: "border-accent/35 text-accent bg-accent/10",
  muted: "border-border text-muted-foreground bg-muted/60",
  neutral: "border-border text-foreground bg-muted/50",
} as const;

export function StatusPill({
  tone = "muted",
  children,
  className,
}: {
  tone?: keyof typeof tones;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-[11px] font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Dot({ tone }: { tone: keyof typeof tones }) {
  const bg =
    tone === "present"
      ? "bg-present"
      : tone === "absent"
        ? "bg-absent"
        : tone === "leave"
          ? "bg-leave"
          : tone === "accent"
            ? "bg-accent"
            : "bg-muted-foreground";
  return <span className={cn("h-1.5 w-1.5 rounded-full", bg)} />;
}
