"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeftRight, X } from "lucide-react";
import { ADMIN_NAV_ITEMS } from "@/lib/admin-nav";
import { cn } from "@/lib/utils";

export function AdminSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={onClose} aria-hidden />}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-surface transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <Link href="/admin" className="flex items-center gap-2.5">
            <span className="relative flex h-8 w-8 shrink-0 overflow-hidden rounded-lg">
              <Image src="/images/Login-bg.png" alt="" fill sizes="32px" className="object-cover" priority />
            </span>
            <span className="text-base font-semibold tracking-tight text-foreground">
              Cyber<span className="text-brand-gradient">Villa</span>
            </span>
          </Link>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted hover:bg-surface-2 hover:text-foreground lg:hidden"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <p className="px-5 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">Super Admin</p>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
          {ADMIN_NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active ? "bg-accent/10 text-accent" : "text-muted hover:bg-surface-2 hover:text-foreground"
                )}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-3">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            <ArrowLeftRight size={16} />
            View as affiliate
          </Link>
        </div>
      </aside>
    </>
  );
}
