import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function StatTile({
  label,
  value,
  delta,
  icon: Icon,
  tone = "neutral",
}: {
  label: string;
  value: string;
  delta?: string;
  icon: LucideIcon;
  tone?: "neutral" | "up" | "down";
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted">{label}</span>
        <span className="rounded-lg bg-surface-2 p-1.5 text-accent">
          <Icon size={16} />
        </span>
      </div>
      <div className="mt-3 truncate text-xl font-semibold text-foreground sm:text-2xl" title={value}>
        {value}
      </div>
      {delta && (
        <div
          className={cn(
            "mt-1.5 text-xs font-medium",
            tone === "up" && "text-success",
            tone === "down" && "text-danger",
            tone === "neutral" && "text-muted"
          )}
        >
          {delta}
        </div>
      )}
    </div>
  );
}
