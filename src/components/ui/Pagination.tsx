import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  pageCount,
  onChange,
  total,
  pageSize,
}: {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
  total: number;
  pageSize: number;
}) {
  if (pageCount <= 1) return null;
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 text-xs text-muted sm:px-5">
      <span>
        Showing <span className="text-foreground">{start}–{end}</span> of{" "}
        <span className="text-foreground">{total}</span>
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="rounded-md border border-border p-1.5 hover:bg-surface-2 disabled:opacity-40 disabled:hover:bg-transparent"
          aria-label="Previous page"
        >
          <ChevronLeft size={14} />
        </button>
        {Array.from({ length: pageCount }).map((_, i) => {
          const p = i + 1;
          if (pageCount > 7 && Math.abs(p - page) > 2 && p !== 1 && p !== pageCount) {
            if (p === 2 || p === pageCount - 1) return <span key={p}>…</span>;
            return null;
          }
          return (
            <button
              key={p}
              onClick={() => onChange(p)}
              className={cn(
                "h-7 w-7 rounded-md text-xs font-medium",
                p === page ? "bg-accent text-black" : "hover:bg-surface-2 text-muted"
              )}
            >
              {p}
            </button>
          );
        })}
        <button
          onClick={() => onChange(Math.min(pageCount, page + 1))}
          disabled={page === pageCount}
          className="rounded-md border border-border p-1.5 hover:bg-surface-2 disabled:opacity-40 disabled:hover:bg-transparent"
          aria-label="Next page"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
