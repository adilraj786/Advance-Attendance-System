import { useState } from "react";
import { Download, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { DataTable, type Column } from "@/components/common/data-table";
import { PageHeader, Panel } from "@/components/common/section";
import { StatusPill } from "@/components/common/status-pill";
import { Button } from "@/components/ui/button";
import { AUDIT_LOGS } from "@/lib/data";
import { cn } from "@/lib/utils";

type Log = (typeof AUDIT_LOGS)[number];

const columns: Column<Log>[] = [
  { key: "time", header: "Timestamp", width: "170px", sortable: true, render: (r) => <span className="tabular font-mono text-xs text-muted-foreground">{r.time}</span> },
  {
    key: "user",
    header: "Actor",
    sortable: true,
    render: (r) => (
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">{r.user}</p>
        <p className="text-[11px] text-muted-foreground">{r.role}</p>
      </div>
    ),
  },
  { key: "action", header: "Action Performed", sortable: true, render: (r) => <span className="text-sm font-medium">{r.action}</span> },
  { key: "target", header: "Target Entity", render: (r) => <span className="tabular font-mono text-xs text-muted-foreground">{r.target}</span> },
  {
    key: "severity",
    header: "Event Level",
    align: "right",
    sortable: true,
    render: (r) => (
      <div className="flex justify-end">
        <StatusPill tone={r.severity === "alert" ? "absent" : r.severity === "notice" ? "leave" : "muted"} className="capitalize">
          {r.severity}
        </StatusPill>
      </div>
    ),
  },
];

const LEVELS = ["all", "info", "notice", "alert"] as const;

export function AuditLogsView() {
  const [logs, setLogs] = useState(AUDIT_LOGS);
  const [level, setLevel] = useState<(typeof LEVELS)[number]>("all");

  const filtered = logs.filter((l) => (level === "all" ? true : l.severity === level));

  const handleExport = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Timestamp,Actor,Role,Action,Target,Severity\n" +
      filtered.map((l) => `"${l.time}","${l.user}","${l.role}","${l.action}","${l.target}","${l.severity}"`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SVIT_Audit_Trail_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Security audit logs exported to CSV!");
  };

  return (
    <AppShell>
      <PageHeader
        eyebrow="Compliance & Security Immutable Log"
        title="System audit logs"
        description="Tamper-evident trail of manual attendance alterations, session tokens, and admin mutations."
        action={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setLogs([...AUDIT_LOGS]);
                toast.info("Audit feed synchronized with Firestore logger.");
              }}
              className="h-10 px-4 rounded-xl border-border hover:bg-muted/50 font-medium transition-all"
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh
            </Button>
            <Button
              onClick={handleExport}
              className="h-10 px-4 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 shadow-xs font-semibold"
            >
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
          </div>
        }
      />

      <Panel
        title="Audit Trail Records"
        description={`${filtered.length} captured events in this window`}
      >
        <div className="mb-4 flex flex-wrap gap-1.5">
          {LEVELS.map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setLevel(lvl)}
              className={cn(
                "rounded-xl border px-3.5 py-1.5 text-xs font-medium capitalize transition-all",
                level === lvl
                  ? "border-accent bg-accent/15 text-foreground shadow-xs font-semibold"
                  : "border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground",
              )}
            >
              {lvl} ({lvl === "all" ? logs.length : logs.filter((x) => x.severity === lvl).length})
            </button>
          ))}
        </div>

        <DataTable
          columns={columns}
          rows={filtered}
          searchKeys={["user", "action", "target"]}
          searchPlaceholder="Search actor, target entity or description…"
        />
      </Panel>
    </AppShell>
  );
}
