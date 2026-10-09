import { AppShell } from "@/components/layout/app-shell";
import { ChatThread } from "./chat-thread";
import { PageHeader, Panel } from "@/components/common/section";
import { StatusPill } from "@/components/common/status-pill";
import { WeeklyAiSummary } from "./ai-summary";
import { BOT_CHIPS, BOT_THREAD } from "@/lib/data";

export function AssistantView() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Semester V · CSE-A"
        title="Attendance assistant"
        description="Answers are computed from your own records. Nothing is shared with faculty."
        action={<StatusPill tone="accent">Active</StatusPill>}
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <Panel title="Conversation" description="Assistant · responds instantly" bodyClassName="p-0">
          <ChatThread
            initial={BOT_THREAD}
            chips={BOT_CHIPS}
            themLabel="Assistant"
            themInitials="AI"
            placeholder="Ask about attendance, leave or subjects…"
          />
        </Panel>

        <div className="space-y-4">
          <WeeklyAiSummary />
          <Panel title="What it can do" description="Read-only access to your records">
            <ul className="space-y-2.5 text-xs leading-relaxed text-muted-foreground">
              <li>Explain subject-wise percentages and the detention margin.</li>
              <li>Project the effect of a planned absence before you take it.</li>
              <li>Draft a leave request with the correct dates and subjects.</li>
              <li>Generate a term report you can download from Reports.</li>
            </ul>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
