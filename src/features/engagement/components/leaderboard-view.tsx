import { useState } from "react";
import { Flame, Medal, Trophy, Search, Heart, Award } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader, Panel } from "@/components/common/section";
import { StatusPill } from "@/components/common/status-pill";
import { Input } from "@/components/ui/input";
import { LEADERBOARD } from "@/lib/data";
import { cn } from "@/lib/utils";

export function LeaderboardView() {
  const [scope, setScope] = useState<"week" | "month" | "term">("term");
  const [deptFilter, setDeptFilter] = useState<string>("All");
  const [q, setQ] = useState("");
  const [cheers, setCheers] = useState<Record<number, number>>({});

  const handleCheer = (rank: number, name: string) => {
    setCheers((prev) => ({ ...prev, [rank]: (prev[rank] || 0) + 1 }));
    toast.success(`Sent cheer & high-five to ${name}! 🎉`, {
      description: "Applauded verified attendance excellence.",
    });
  };

  const filtered = LEADERBOARD.filter((s) => {
    if (deptFilter !== "All" && !s.dept.includes(deptFilter)) return false;
    if (q && !`${s.name} ${s.dept}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  type LeaderEntry = (typeof LEADERBOARD)[number];
  const podium = [filtered[1] ?? LEADERBOARD[1], filtered[0] ?? LEADERBOARD[0], filtered[2] ?? LEADERBOARD[2]].filter(
    (s): s is LeaderEntry => s !== undefined,
  );

  return (
    <AppShell>
      <PageHeader
        eyebrow="Campus Recognition"
        title="Attendance leaderboard"
        description="Ranked by verified scan consistency. Maintained across 2,500+ undergraduate scholars."
        action={
          <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-xl border border-border/50 text-xs">
            {(["week", "month", "term"] as const).map((s) => (
              <button
                key={s}
                onClick={() => {
                  setScope(s);
                  toast.info(`Filtered leaderboard to ${s}ly ranking.`);
                }}
                className={`px-3.5 py-1.5 rounded-lg font-medium capitalize transition-all ${
                  scope === s
                    ? "bg-card text-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s} view
              </button>
            ))}
          </div>
        }
      />

      {/* Top 3 Podium Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {podium.map((s, idx) => {
          const isGold = idx === 1;
          const isSilver = idx === 0;
          const rankNum = isGold ? 1 : isSilver ? 2 : 3;
          const accentColor = isGold
            ? "border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400"
            : isSilver
              ? "border-slate-400/50 bg-slate-400/10 text-slate-600 dark:text-slate-300"
              : "border-orange-600/50 bg-orange-600/10 text-orange-600 dark:text-orange-400";

          return (
            <motion.div
              key={s.name}
              whileHover={{ y: -3 }}
              className={cn(
                "relative flex flex-col items-center justify-between rounded-2xl border p-6 text-center shadow-xs transition-all",
                isGold ? "border-accent bg-card shadow-md sm:-translate-y-2" : "border-border bg-card",
              )}
            >
              <span className={cn("grid h-10 w-10 place-items-center rounded-2xl text-base font-bold shadow-xs", accentColor)}>
                {rankNum === 1 ? <Trophy className="h-5 w-5" /> : <Medal className="h-5 w-5" />}
              </span>

              <div className="mt-3">
                <span className="font-display text-base font-bold text-foreground block">{s.name}</span>
                <span className="text-xs text-muted-foreground font-mono">{s.dept}</span>
              </div>

              <div className="mt-4 flex items-baseline gap-1.5">
                <span className="font-display text-3xl font-bold tabular text-accent">{s.percent}%</span>
                <span className="text-xs text-muted-foreground font-medium">presence</span>
              </div>

              <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-accent">
                <Flame className="h-4 w-4" /> {s.streak} Days Streak
              </div>
            </motion.div>
          );
        })}
      </div>

      <Panel title="Institutional Standings" description="Top consistent scholars across college departments">
        <div className="mb-4 grid gap-3 sm:flex sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search scholar name or dept…"
              className="h-10 pl-9 rounded-xl border-border bg-surface text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {["All", "CSE", "ECE", "MECH", "IT", "AIML"].map((dept) => (
              <button
                key={dept}
                type="button"
                onClick={() => setDeptFilter(dept)}
                className={cn(
                  "rounded-xl border px-3 py-1.5 text-xs font-medium transition-all",
                  deptFilter === dept
                    ? "border-accent bg-accent/15 text-foreground shadow-xs font-semibold"
                    : "border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        <ul className="divide-y divide-border/60 rounded-xl border border-border/80 overflow-hidden">
          <AnimatePresence>
            {filtered.map((s) => (
              <motion.li
                key={s.name + s.rank}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid gap-3 p-3.5 sm:grid-cols-[auto_minmax(0,1fr)_auto_auto] sm:items-center hover:bg-muted/30 transition-colors"
              >
                <span className="grid h-8 w-8 place-items-center rounded-xl font-mono text-xs font-bold bg-muted/60 text-muted-foreground">
                  #{s.rank}
                </span>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-foreground">{s.name}</p>
                    {s.badge && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-md">
                        <Award className="h-3 w-3" /> {s.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.dept}</p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 text-xs font-bold text-accent">
                    <Flame className="h-3.5 w-3.5" /> {s.streak}d streak
                  </span>
                  <span className="font-display text-sm font-bold tabular text-foreground w-12 text-right">
                    {s.percent}%
                  </span>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleCheer(s.rank, s.name)}
                    className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-accent hover:text-accent hover:bg-accent/10 active:scale-95"
                  >
                    <Heart className="h-3.5 w-3.5 text-accent" />
                    <span>{cheers[s.rank] || 0}</span>
                  </button>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </Panel>
    </AppShell>
  );
}
