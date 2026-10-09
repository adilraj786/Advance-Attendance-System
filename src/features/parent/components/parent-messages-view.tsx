import { AppShell } from "@/components/layout/app-shell";
import { ChatThread } from "@/features/engagement/components/chat-thread";
import { PageHeader, Panel } from "@/components/common/section";
import { StatusPill } from "@/components/common/status-pill";
import { WeeklyAiSummary } from "@/features/engagement/components/ai-summary";
import { TEACHER_THREAD } from "@/lib/data";
import { useAuth } from "@/features/auth";

export function ParentMessagesView() {
  const { profile } = useAuth();
  const parentName = profile?.name || "Parent";

  return (
    <AppShell>
      <PageHeader
        eyebrow={`Guardian Portal · ${parentName}`}
        title="Chat with class teacher"
        description="Messages are visible to the class teacher and the department office only."
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <Panel
          title="Prof. Rajeev Iyer"
          description="Class teacher · CSE-A · usually replies within a day"
          action={<StatusPill tone="present">Online</StatusPill>}
          bodyClassName="p-0"
        >
          <ChatThread
            initial={TEACHER_THREAD}
            themLabel="Prof. Iyer"
            themInitials="RI"
            placeholder="Message Prof. Rajeev Iyer…"
            autoReply="Noted, thank you. I will confirm after tomorrow's attendance review."
          />
        </Panel>

        <div className="space-y-4">
          <WeeklyAiSummary />
          <Panel title="Contacts" description="Department of Computer Science">
            <ul className="space-y-3 text-xs">
              {[
                { n: "Dr. Kavita Nair", r: "Head of Department" },
                { n: "Prof. Anil Kulkarni", r: "Computer Networks" },
                { n: "Dr. Meenakshi Rao", r: "Registrar's office" },
              ].map((c) => (
                <li key={c.n} className="flex items-center gap-2.5">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-sm border border-border bg-surface text-[10px] font-semibold text-muted-foreground">
                    {c.n.split(" ").slice(-2).map((x: string) => x[0]).join("")}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{c.n}</span>
                    <span className="block truncate text-[11px] text-muted-foreground">{c.r}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
