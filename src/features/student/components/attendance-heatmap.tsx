import { CALENDAR, type DayStatus } from "@/lib/data";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const cls: Record<DayStatus, string> = {
  present: "bg-present/75",
  absent: "bg-absent/75",
  leave: "bg-leave/80",
  holiday: "bg-muted",
  none: "bg-muted/40",
};

const legend: { status: DayStatus; label: string }[] = [
  { status: "present", label: "Present" },
  { status: "absent", label: "Absent" },
  { status: "leave", label: "Leave" },
  { status: "holiday", label: "Holiday" },
];

export function AttendanceHeatmap() {
  const weeks: (typeof CALENDAR)[] = [];
  for (let i = 0; i < CALENDAR.length; i += 7) weeks.push(CALENDAR.slice(i, i + 7));

  return (
    <div>
      <TooltipProvider delayDuration={80}>
        <div className="flex gap-[3px] overflow-x-auto pb-1">
          {weeks.map((w, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {w.map((d) => (
                <Tooltip key={d.date}>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        "h-3.5 w-3.5 rounded-[2px] transition-opacity hover:opacity-70",
                        cls[d.status],
                      )}
                    />
                  </TooltipTrigger>
                  <TooltipContent className="rounded-sm text-xs">
                    {d.date} · <span className="capitalize">{d.status === "none" ? "upcoming" : d.status}</span>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          ))}
        </div>
      </TooltipProvider>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
        {legend.map((l) => (
          <span key={l.status} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className={cn("h-2.5 w-2.5 rounded-[2px]", cls[l.status])} />
            {l.label}
          </span>
        ))}
      </div>
    </div>
  );
}
