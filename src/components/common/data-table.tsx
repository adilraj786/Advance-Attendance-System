import { useMemo, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { EmptyState } from "./section";

export type Column<T> = {
  key: string;
  header: string;
  align?: "left" | "right";
  width?: string;
  sortable?: boolean;
  render?: (row: T) => ReactNode;
};

export function DataTable<T extends object>({
  columns,
  rows,
  searchKeys,
  searchPlaceholder = "Search…",
  filter,
  dense,
}: {
  columns: Column<T>[];
  rows: T[];
  searchKeys?: (keyof T & string)[];
  searchPlaceholder?: string;
  filter?: ReactNode;
  dense?: boolean;
}) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);

  const view = useMemo(() => {
    let out = rows;
    if (q && searchKeys?.length) {
      const needle = q.toLowerCase();
      out = out.filter((r) =>
        searchKeys.some((k) => String((r as Record<string, unknown>)[k as string] ?? "").toLowerCase().includes(needle)),
      );
    }
    if (sort) {
      out = [...out].sort((a, b) => {
        const ar = a as Record<string, unknown>;
        const br = b as Record<string, unknown>;
        const av = ar[sort.key];
        const bv = br[sort.key];
        const cmp =
          typeof av === "number" && typeof bv === "number"
            ? av - bv
            : String(av).localeCompare(String(bv));
        return sort.dir === "asc" ? cmp : -cmp;
      });
    }
    return out;
  }, [rows, q, sort, searchKeys]);

  return (
    <div>
      {(searchKeys?.length || filter) && (
        <div className="mb-3 grid grid-cols-1 gap-2 sm:flex sm:items-center sm:justify-between">
          {searchKeys?.length ? (
            <div className="relative min-w-0 sm:max-w-xs sm:flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={searchPlaceholder}
                className="h-9 rounded-sm border-border bg-surface pl-8 text-sm"
              />
            </div>
          ) : (
            <span />
          )}
          {filter ? <div className="flex shrink-0 flex-wrap gap-2">{filter}</div> : null}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-2xs">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-surface">
              {columns.map((c) => (
                <th
                  key={c.key}
                  style={{ width: c.width }}
                  className={cn(
                    "px-3 py-2 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground",
                    c.align === "right" ? "text-right" : "text-left",
                  )}
                >
                  {c.sortable ? (
                    <button
                      type="button"
                      onClick={() =>
                        setSort((s) =>
                          s?.key === c.key
                            ? { key: c.key, dir: s.dir === "asc" ? "desc" : "asc" }
                            : { key: c.key, dir: "asc" },
                        )
                      }
                      className={cn(
                        "inline-flex items-center gap-1 transition-colors hover:text-foreground",
                        c.align === "right" && "flex-row-reverse",
                      )}
                    >
                      {c.header}
                      {sort?.key === c.key ? (
                        sort.dir === "asc" ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        )
                      ) : null}
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {view.map((row, i) => (
              <tr
                key={i}
                className="border-b border-border/70 transition-colors last:border-0 hover:bg-surface"
              >
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={cn(
                      "px-3 align-middle",
                      dense ? "py-1.5" : "py-2.5",
                      c.align === "right" ? "text-right tabular" : "text-left",
                    )}
                  >
                    {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {view.length === 0 ? (
        <div className="mt-3">
          <EmptyState title="No matching records" description={`Nothing matches “${q}”. Try a different roll number, name or code.`} />
        </div>
      ) : null}
    </div>
  );
}
