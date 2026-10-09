import { Bell } from "lucide-react";
import { NOTIFICATIONS } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dot } from "@/components/common/status-pill";
import { cn } from "@/lib/utils";

const toneMap = { risk: "absent", accent: "accent", ok: "present", muted: "muted" } as const;

export function NotificationList({ compact }: { compact?: boolean }) {
  return (
    <ul className="divide-y divide-border">
      {NOTIFICATIONS.map((n) => (
        <li
          key={n.id}
          className={cn(
            "grid grid-cols-[auto_minmax(0,1fr)] gap-3 py-3 transition-colors hover:bg-surface",
            compact && "py-2.5",
          )}
        >
          <span className="mt-1.5">
            <Dot tone={toneMap[n.tone]} />
          </span>
          <div className="min-w-0">
            <div className="flex items-baseline justify-between gap-3">
              <p className={cn("truncate text-sm", n.unread ? "font-semibold" : "font-medium text-foreground/80")}>
                {n.title}
              </p>
              <span className="shrink-0 text-[11px] text-muted-foreground">{n.time}</span>
            </div>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{n.body}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function NotificationsPanel() {
  const unread = NOTIFICATIONS.filter((n) => n.unread).length;
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-sm" aria-label="Notifications">
          <Bell className="h-4 w-4" strokeWidth={1.7} />
          {unread > 0 ? (
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-accent" />
          ) : null}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full gap-0 border-l border-border bg-card p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border px-5 py-4">
          <SheetTitle className="font-display text-base">
            Notifications <span className="ml-1 text-xs font-normal text-muted-foreground">{unread} unread</span>
          </SheetTitle>
        </SheetHeader>
        <div className="overflow-y-auto px-5">
          <NotificationList />
        </div>
      </SheetContent>
    </Sheet>
  );
}
