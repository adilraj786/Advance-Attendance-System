import { Sparkles } from "lucide-react";
import { AI_SUMMARY } from "@/lib/data";
import { cn } from "@/lib/utils";

export function WeeklyAiSummary({ className, subject = "Ananya" }: { className?: string; subject?: string }) {
  const rate = Math.round((AI_SUMMARY.attended / AI_SUMMARY.held) * 1000) / 10;

  return (
    <section className={cn("rounded-md border border-border bg-card", className)}>
      <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 shrink-0 text-accent" strokeWidth={1.8} />
          <h3 className="truncate text-sm font-semibold">Weekly summary</h3>
        </div>
        <span className="shrink-0 tabular text-[11px] text-muted-foreground">{AI_SUMMARY.window}</span>
      </header>

      <div className="grid gap-4 p-4 sm:grid-cols-[auto_minmax(0,1fr)]">
        <div className="sm:w-32">
          <p className="font-display text-2xl font-semibold tabular leading-none">{rate}%</p>
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            {AI_SUMMARY.attended} of {AI_SUMMARY.held} sessions
          </p>
        </div>

        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Needs attention</p>
              <ul className="mt-1.5 space-y-1">
                {AI_SUMMARY.weak.map((s) => (
                  <li key={s} className="flex items-center gap-2 text-xs">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-absent" />
                    <span className="truncate">{s}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Holding well</p>
              <ul className="mt-1.5 space-y-1">
                {AI_SUMMARY.strong.map((s) => (
                  <li key={s} className="flex items-center gap-2 text-xs">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-present" />
                    <span className="truncate">{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="border-l-2 border-accent/50 pl-3 text-xs leading-relaxed">
            {AI_SUMMARY.suggestion.replace("Attend", `${subject === "Ananya" ? "Attend" : "Attend"}`)}
          </p>
          <p className="text-[11px] leading-relaxed text-muted-foreground">{AI_SUMMARY.note}</p>
        </div>
      </div>
    </section>
  );
}
