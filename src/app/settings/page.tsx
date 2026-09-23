"use client";

import { useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AFFILIATE } from "@/lib/mock-data";
import { cn, formatDate } from "@/lib/utils";

const TOGGLES = [
  { key: "commission", label: "Commission milestones" },
  { key: "transaction", label: "Transaction status changes" },
  { key: "payout", label: "Payout processing & completion" },
  { key: "promotion", label: "Promotion & commission term changes" },
];

export default function SettingsPage() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    commission: true,
    transaction: true,
    payout: true,
    promotion: false,
  });
  const [saved, setSaved] = useState(false);

  function save(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader title="Profile" subtitle="Your affiliate identity on CyberVilla." />
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-gradient text-xl font-semibold text-white">
            {AFFILIATE.name.split(" ").map((n) => n[0]).join("")}
          </span>
          <div>
            <p className="text-base font-semibold text-foreground">{AFFILIATE.name}</p>
            <p className="text-sm text-muted">{AFFILIATE.email}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge tone="accent">{AFFILIATE.tier}</Badge>
              <span className="text-xs text-muted">Affiliate ID: {AFFILIATE.id}</span>
              <span className="text-xs text-muted">Joined {formatDate(AFFILIATE.joinedAt)}</span>
            </div>
          </div>
        </div>
      </Card>

      <form onSubmit={save} className="space-y-5">
        <Card>
          <CardHeader title="Personal information" />
          <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5">
            <Field label="Full name" defaultValue={AFFILIATE.name} />
            <Field label="Email address" defaultValue={AFFILIATE.email} type="email" />
            <Field label="Phone number" placeholder="+234 800 000 0000" />
            <Field label="Country" defaultValue="Nigeria" />
          </div>
        </Card>

        <Card>
          <CardHeader title="Security" />
          <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5">
            <Field label="New password" type="password" placeholder="••••••••" />
            <Field label="Confirm new password" type="password" placeholder="••••••••" />
          </div>
        </Card>

        <Card>
          <CardHeader title="Notification preferences" subtitle="Choose what you want to be notified about." />
          <div className="divide-y divide-border">
            {TOGGLES.map((t) => (
              <label key={t.key} className="flex items-center justify-between gap-4 p-4 text-sm text-foreground sm:px-5">
                {t.label}
                <button
                  type="button"
                  onClick={() => setPrefs((p) => ({ ...p, [t.key]: !p[t.key] }))}
                  className={cn(
                    "relative h-6 w-11 shrink-0 rounded-full transition-colors",
                    prefs[t.key] ? "bg-accent" : "bg-surface-2"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 h-5 w-5 rounded-full bg-black transition-transform",
                      prefs[t.key] ? "translate-x-5" : "translate-x-0.5"
                    )}
                  />
                </button>
              </label>
            ))}
          </div>
        </Card>

        <div className="flex items-center gap-3">
          <button className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-black hover:bg-accent-strong">
            Save changes
          </button>
          {saved && <span className="text-xs font-medium text-success">Saved.</span>}
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  placeholder,
  defaultValue,
  type = "text",
}: {
  label: string;
  placeholder?: string;
  defaultValue?: string;
  type?: string;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-muted">{label}</span>
      <input
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
      />
    </label>
  );
}
