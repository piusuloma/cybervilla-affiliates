"use client";

import { useState } from "react";
import Link from "next/link";
import { BadgeCheck, Bell, CreditCard, Megaphone, ReceiptText } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { NOTIFICATIONS } from "@/lib/mock-data";
import type { AppNotification } from "@/lib/types";
import { cn, timeAgo } from "@/lib/utils";

const ICONS: Record<AppNotification["type"], typeof Bell> = {
  earning: BadgeCheck,
  transaction: ReceiptText,
  payout: CreditCard,
  promotion: Megaphone,
};

export default function NotificationsPage() {
  const [items, setItems] = useState<AppNotification[]>(NOTIFICATIONS);
  const unreadCount = items.filter((n) => !n.read).length;

  function markRead(id: string) {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{unreadCount} unread notifications</p>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-xs font-medium text-accent hover:underline">
            Mark all as read
          </button>
        )}
      </div>

      <Card>
        <ul className="divide-y divide-border">
          {items.map((n) => {
            const Icon = ICONS[n.type];
            const body = (
              <div
                className={cn(
                  "flex items-start gap-3 p-4 transition-colors hover:bg-surface-2 sm:p-5",
                  !n.read && "bg-accent/[0.04]"
                )}
              >
                <span className={cn("rounded-lg p-2", n.read ? "bg-surface-2 text-muted" : "bg-accent/10 text-accent")}>
                  <Icon size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className={cn("text-sm", n.read ? "text-foreground" : "font-semibold text-foreground")}>
                      {n.title}
                    </p>
                    {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
                  </div>
                  <p className="mt-0.5 text-xs text-muted">{n.body}</p>
                  <p className="mt-1.5 text-[11px] text-muted">{timeAgo(n.timestamp)}</p>
                </div>
              </div>
            );
            return (
              <li key={n.id}>
                {n.href ? (
                  <Link href={n.href} onClick={() => markRead(n.id)}>
                    {body}
                  </Link>
                ) : (
                  <button onClick={() => markRead(n.id)} className="w-full text-left">
                    {body}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}
