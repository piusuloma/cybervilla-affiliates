"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Bell } from "lucide-react";
import { NAV_ITEMS } from "@/lib/nav";
import { AFFILIATE, NOTIFICATIONS } from "@/lib/mock-data";

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();
  const current = NAV_ITEMS.find((item) => item.href === pathname);
  const unread = NOTIFICATIONS.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-md p-1.5 text-muted hover:bg-surface-2 hover:text-foreground lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-base font-semibold text-foreground sm:text-lg">
          {current?.label ?? "Dashboard"}
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <Link
          href="/notifications"
          className="relative rounded-lg p-2 text-muted hover:bg-surface-2 hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell size={18} />
          {unread > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-accent" />
          )}
        </Link>
        <Link
          href="/settings"
          className="flex items-center gap-2 rounded-lg border border-border py-1 pl-1 pr-3 hover:bg-surface-2"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-gradient text-xs font-semibold text-white">
            {AFFILIATE.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </span>
          <span className="hidden text-sm font-medium text-foreground sm:inline">
            {AFFILIATE.name.split(" ")[0]}
          </span>
        </Link>
      </div>
    </header>
  );
}
