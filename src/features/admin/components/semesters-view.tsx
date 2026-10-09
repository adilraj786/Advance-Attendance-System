import { useState } from "react";
import { Plus, Check, Layers, Archive } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader, Panel } from "@/components/common/section";
import { StatusPill } from "@/components/common/status-pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SEMESTERS as INITIAL_SEMESTERS } from "@/lib/data";
import { cn } from "@/lib/utils";

export function SemestersView() {
  const [semesters, setSemesters] = useState(INITIAL_SEMESTERS);
  const [active, setActive] = useState(INITIAL_SEMESTERS.find((s) => s.active)!.code);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newSpan, setNewSpan] = useState("");
  const [newWorking, setNewWorking] = useState(90);

  const handleSetActive = (code: string) => {
    setActive(code);
    toast.success(`Academic term ${code} is now set as ACTIVE!`, {
      description: "All upcoming QR attendance sessions will register against this term.",
    });
  };

  const handleCreateTerm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newCode) {
      toast.error("Please provide term name and code.");
      return;
    }

    const newTerm = {
      code: newCode,
      name: newName,
      span: newSpan || "Sep 2026 – Jan 2027",
      working: Number(newWorking) || 90,
      active: false,
    };

    setSemesters((prev) => [...prev, newTerm]);
    setShowAdd(false);
    setNewName("");
    setNewCode("");
    setNewSpan("");
    toast.success(`New term "${newName}" configured in registry!`);
  };

  return (
    <AppShell>
      <PageHeader
        eyebrow="Academic Term & Session Configuration"
        title="Semester management"
        description="Switch active semester ledger, review historical archives and set planned instructional working days."
        action={
          <Button
            onClick={() => setShowAdd(!showAdd)}
            className="h-10 px-4 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 shadow-xs font-semibold text-xs"
          >
            <Plus className="mr-1.5 h-4 w-4" /> Create Academic Term
          </Button>
        }
      />

      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Panel title="Configure New Academic Term" description="Set calendar period and total instructional days">
              <form onSubmit={handleCreateTerm} className="grid gap-3 sm:grid-cols-4">
                <Input
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="Term Code (e.g. 2026-ODD)"
                  className="h-10 rounded-xl"
                  required
                />
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Term Name (e.g. Autumn 2026)"
                  className="h-10 rounded-xl"
                  required
                />
                <Input
                  value={newSpan}
                  onChange={(e) => setNewSpan(e.target.value)}
                  placeholder="Date Span (e.g. Aug – Dec 2026)"
                  className="h-10 rounded-xl"
                />
                <Button type="submit" className="h-10 rounded-xl bg-accent text-accent-foreground font-semibold">
                  Add Term
                </Button>
              </form>
            </Panel>
          </motion.div>
        )}
      </AnimatePresence>

      <Panel title="Academic Terms" description="Click to activate an academic session" bodyClassName="p-0">
        <ul className="divide-y divide-border/60">
          {semesters.map((s) => {
            const isCurrent = active === s.code;
            return (
              <li
                key={s.code}
                className={cn(
                  "grid gap-4 p-4 sm:grid-cols-[auto_minmax(0,1fr)_auto_auto] sm:items-center transition-colors",
                  isCurrent ? "bg-accent/10" : "hover:bg-muted/30",
                )}
              >
                <span className={cn(
                  "grid h-10 w-10 shrink-0 place-items-center rounded-xl font-bold text-xs shadow-2xs",
                  isCurrent ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground",
                )}>
                  <Layers className="h-5 w-5" />
                </span>

                <div className="min-w-0">
                  <div className="flex items-center gap-2.5">
                    <p className="truncate text-sm font-bold text-foreground">{s.name}</p>
                    <span className="font-mono text-xs text-muted-foreground px-2 py-0.5 rounded-md bg-card border border-border">
                      {s.code}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {s.span} · <strong className="text-foreground">{s.working}</strong> scheduled instructional days
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <StatusPill tone={isCurrent ? "present" : "muted"}>
                    {isCurrent ? "Active Term" : "Archived"}
                  </StatusPill>
                </div>

                <div className="flex justify-end">
                  {isCurrent ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-present px-3 py-1.5 rounded-lg bg-present/10">
                      <Check className="h-4 w-4" /> Current Session
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSetActive(s.code)}
                      className="h-9 px-3 rounded-lg border-border hover:border-accent hover:text-accent font-semibold text-xs transition-all"
                    >
                      Set As Active
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </Panel>
    </AppShell>
  );
}
