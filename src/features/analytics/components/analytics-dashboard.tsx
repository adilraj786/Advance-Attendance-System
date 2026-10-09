import { useState } from "react";
import { Download, FileText, Printer, CheckCircle } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader, Panel } from "@/components/common/section";
import { StatCard } from "@/components/common/stat-card";
import { StatusPill } from "@/components/common/status-pill";
import { Button } from "@/components/ui/button";
import { COLLEGE, SUBJECTS, TREND, WEEKDAY_BARS, pct } from "@/lib/data";

const tooltipStyle = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  fontSize: 12,
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
};

export function AnalyticsDashboard() {
  const [period, setPeriod] = useState<"term" | "month" | "week">("term");

  const handleExportCSV = () => {
    const headers = ["Subject Code", "Subject Name", "Faculty", "Total Classes", "Attended Classes", "Percentage"];
    const rows = SUBJECTS.map((s) => [
      s.code,
      `"${s.name}"`,
      `"${s.faculty}"`,
      s.total,
      s.attended,
      `${pct(s.attended, s.total)}%`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SVIT_Attendance_Report_SemV_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Attendance report CSV generated & downloaded!", {
      description: "Includes all verified subject logs for Semester V.",
    });
  };

  const handlePrint = () => {
    toast.info("Preparing formal attendance statement for printing…");
    setTimeout(() => {
      window.print();
    }, 400);
  };

  return (
    <AppShell>
      <PageHeader
        eyebrow="Institutional Reports & Audit"
        title="Attendance analytics"
        description="Comprehensive analysis of lecture distribution, student retention and attendance trends."
        action={
          <div className="flex gap-2.5">
            <Button
              variant="outline"
              onClick={handlePrint}
              className="h-10 px-4 rounded-xl border-border hover:bg-muted/50 font-medium transition-all shadow-2xs"
            >
              <Printer className="mr-2 h-4 w-4" /> Print Statement
            </Button>
            <Button
              onClick={handleExportCSV}
              className="h-10 px-4 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 shadow-xs font-semibold transition-all"
            >
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
          </div>
        }
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-xl border border-border/50 text-xs">
          {(["term", "month", "week"] as const).map((p) => (
            <button
              key={p}
              onClick={() => {
                setPeriod(p);
                toast.info(`Switched view to ${p}ly statistics.`);
              }}
              className={`px-3.5 py-1.5 rounded-lg font-medium capitalize transition-all ${
                period === p
                  ? "bg-card text-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {p} view
            </button>
          ))}
        </div>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <CheckCircle className="h-3.5 w-3.5 text-present" /> Verified QR Ledger
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Term average" value="83.4" unit="%" delta="+1.2%" hint="vs previous term" tone="present" />
        <StatCard label="Peak attendance" value="Tuesday" hint="92.4% present rate" tone="present" />
        <StatCard label="Weakest weekday" value="Saturday" hint="70.4% present rate" tone="absent" />
        <StatCard label="Sessions logged" value="1,846" hint="QR verified scans" tone="accent" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Weekday attendance distribution" description="Classroom presence vs absence by day">
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={WEEKDAY_BARS} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
                <RTooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--muted)" }} />
                <Bar dataKey="present" stackId="a" fill="var(--present)" radius={[0, 0, 4, 4]} barSize={28} />
                <Bar dataKey="absent" stackId="a" fill="var(--absent)" radius={[4, 4, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Semester progression trend" description="Institutional average across calendar months">
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={TREND} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
                <YAxis domain={[65, 95]} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
                <RTooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="overall"
                  stroke="var(--chart-1)"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "var(--chart-1)" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <Panel
        title="Official Report Card Statement"
        description="Tamper-proof academic record with QR authentication watermark"
        action={<StatusPill tone="muted"><FileText className="h-3 w-3" /> PDF / Printable Form</StatusPill>}
        bodyClassName="p-6 sm:p-8"
      >
        <div className="mx-auto max-w-2xl rounded-2xl border border-border/80 bg-surface p-6 sm:p-8 shadow-xs">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 border-b border-border/80 pb-5">
            <div className="min-w-0">
              <p className="font-display text-lg font-bold text-foreground">{COLLEGE.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{COLLEGE.city} · Official Term Attendance Statement</p>
            </div>
            <div className="text-right text-xs text-muted-foreground font-mono">
              <span>Ref. SVIT/ATT/2026/0841</span>
              <br />
              <span>17 Aug 2026</span>
            </div>
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 text-xs sm:grid-cols-4 bg-card/60 p-4 rounded-xl border border-border/50">
            {[
              ["Student Name", "Ananya Deshpande"],
              ["Roll Number", "SVIT21CS042"],
              ["Programme", "B.Tech CSE"],
              ["Term", "Semester V"],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="mt-0.5 font-semibold text-foreground">{v}</dd>
              </div>
            ))}
          </dl>

          <table className="mt-6 w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="py-2.5 text-left font-semibold">Course / Subject</th>
                <th className="py-2.5 text-right font-semibold">Held</th>
                <th className="py-2.5 text-right font-semibold">Attended</th>
                <th className="py-2.5 text-right font-semibold">Percentage</th>
              </tr>
            </thead>
            <tbody>
              {SUBJECTS.map((s) => {
                const p = pct(s.attended, s.total);
                return (
                  <tr key={s.code} className="border-b border-border/50 hover:bg-muted/20">
                    <td className="py-2.5 font-medium">{s.name}</td>
                    <td className="py-2.5 text-right tabular text-muted-foreground">{s.total}</td>
                    <td className="py-2.5 text-right tabular text-foreground font-medium">{s.attended}</td>
                    <td className={"py-2.5 text-right tabular font-bold " + (p < 75 ? "text-absent" : "text-present")}>
                      {p}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="mt-8 flex items-end justify-between gap-4 border-t border-border/60 pt-4">
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Generated from real-time cryptographic QR session scans.
              <br />
              Authorized for semester exam hall ticket generation.
            </p>
            <div className="text-right">
              <p className="h-8 w-36 border-b border-dashed border-border" />
              <p className="mt-1 text-[11px] font-semibold text-muted-foreground">Head of Department (CSE)</p>
            </div>
          </div>
        </div>
      </Panel>
    </AppShell>
  );
}
