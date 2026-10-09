import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Panel({
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn("rounded-2xl border border-border bg-card shadow-2xs overflow-hidden", className)}>
      {title ? (
        <header className="flex flex-col gap-2 border-b border-border px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-foreground break-words">{title}</h3>
            {description ? <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed break-words">{description}</p> : null}
          </div>
          {action ? <div className="flex flex-wrap items-center gap-2 shrink-0 pt-1 sm:pt-0">{action}</div> : null}
        </header>
      ) : null}
      <div className={cn("p-4 sm:p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-4 sm:mb-6">
      <div className="min-w-0 flex-1">
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-accent leading-normal break-words">{eyebrow}</p>
        ) : null}
        <h1 className="mt-1 font-display text-xl sm:text-2xl font-bold sm:font-semibold text-foreground break-words leading-tight">{title}</h1>
        {description ? <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed break-words">{description}</p> : null}
      </div>
      {action ? <div className="flex flex-wrap items-center gap-2 shrink-0 pt-1 sm:pt-0 w-full sm:w-auto">{action}</div> : null}
    </header>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-2 rounded-2xl border border-dashed border-border p-6 sm:p-8 bg-surface/50">
      <p className="text-sm font-bold text-foreground">{title}</p>
      <p className="max-w-md text-xs leading-relaxed text-muted-foreground">{description}</p>
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}

export function SkeletonRows({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="shimmer h-10 rounded-xl bg-muted/70" />
      ))}
    </div>
  );
}
