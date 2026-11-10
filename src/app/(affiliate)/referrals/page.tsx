"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { Clock, Gift, HandCoins, MessageCircle, Users } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CopyButton } from "@/components/ui/CopyButton";
import { StatTile } from "@/components/ui/StatTile";
import { Pagination } from "@/components/ui/Pagination";
import { AFFILIATE } from "@/lib/mock-data";
import { recruitsOf, referralBonusesFor, referralBonusTotals } from "@/lib/admin-data";
import { MIN_ORDER_COMMISSION_FOR_BONUS, REFERRAL_BONUS_PER_SALE } from "@/lib/referrals";
import { useAppData } from "@/lib/store";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils";

const PAGE_SIZE = 10;

/** The site's own address, known only in the browser; empty while rendering on the server. */
function useOrigin() {
  return useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => ""
  );
}

export default function ReferralsPage() {
  const { affiliates } = useAppData();
  const origin = useOrigin();
  const [page, setPage] = useState(1);

  const me = affiliates.find((a) => a.id === AFFILIATE.id);
  const referralCode = me?.referralCode ?? "";
  const inviteLink = `${origin}/join?ref=${encodeURIComponent(referralCode)}`;
  const whatsappText = `Join me as a CyberVilla affiliate and earn on every sale you make. Sign up here: ${inviteLink}`;

  const recruits = useMemo(() => recruitsOf(affiliates, AFFILIATE.id), [affiliates]);
  const bonuses = useMemo(() => referralBonusesFor(affiliates, AFFILIATE.id), [affiliates]);
  const totals = useMemo(() => referralBonusTotals(bonuses), [bonuses]);

  const perRecruit = useMemo(() => {
    const map = new Map<string, { sales: number; earned: number }>();
    for (const b of bonuses) {
      if (b.status === "void" || b.status === "pending") continue;
      const entry = map.get(b.recruitId) ?? { sales: 0, earned: 0 };
      entry.sales += 1;
      entry.earned += b.amount;
      map.set(b.recruitId, entry);
    }
    return map;
  }, [bonuses]);

  const activeRecruits = recruits.filter((r) => r.status === "active").length;
  const pageCount = Math.max(1, Math.ceil(bonuses.length / PAGE_SIZE));
  const pageRows = bonuses.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted">
        Invite other marketers to CyberVilla. You earn {formatCurrency(REFERRAL_BONUS_PER_SALE)} on every qualifying
        order they complete.
      </p>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Your invite" subtitle="Share your link, or give people your code to enter when they sign up." />
          <div className="space-y-4 p-4 sm:p-5">
            <div>
              <p className="text-xs font-medium text-muted">Referral code</p>
              <div className="mt-1.5 flex items-center gap-2">
                <span className="rounded-lg border border-border bg-background px-3 py-2 text-base font-semibold tracking-wider text-accent">
                  {referralCode}
                </span>
                <CopyButton text={referralCode} />
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-muted">Invite link</p>
              <div className="mt-1.5 flex items-center gap-2">
                <code className="min-w-0 flex-1 truncate rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground">
                  {inviteLink}
                </code>
                <CopyButton text={inviteLink} />
              </div>
            </div>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(whatsappText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-black hover:bg-accent-strong"
            >
              <MessageCircle size={15} /> Share on WhatsApp
            </a>
          </div>
        </Card>

        <Card>
          <CardHeader title="How it works" />
          <ol className="space-y-3 p-4 text-sm sm:p-5">
            <Step n={1}>Someone signs up with your link or code.</Step>
            <Step n={2}>We review their application. Once approved, they start selling.</Step>
            <Step n={3}>
              Each order they complete that earns them at least {formatCurrency(MIN_ORDER_COMMISSION_FOR_BONUS)} in
              commission earns you {formatCurrency(REFERRAL_BONUS_PER_SALE)}, added to your payout balance.
            </Step>
            <li className="border-t border-border pt-3 text-xs text-muted">
              In practice that means phones, laptops, tablets and larger parts orders, not small accessories. Signing
              people up doesn&apos;t earn anything by itself, and cancelled or refunded orders don&apos;t earn a bonus.
            </li>
          </ol>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label="Recruits"
          value={formatNumber(recruits.length)}
          delta={`${activeRecruits} active`}
          icon={Users}
        />
        <StatTile
          label="Ready to pay out"
          value={formatCurrency(totals.approved)}
          delta="In your payout balance"
          icon={HandCoins}
          tone="up"
        />
        <StatTile label="Pending" value={formatCurrency(totals.pending)} delta="Orders not yet complete" icon={Clock} />
        <StatTile label="Paid to you" value={formatCurrency(totals.paid)} icon={Gift} />
      </div>

      <Card>
        <CardHeader title="Your recruits" subtitle="People who signed up with your code." />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted">
                <th className="px-4 py-3 font-medium sm:px-5">Name</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium">Bonus orders</th>
                <th className="px-4 py-3 font-medium sm:pr-5">You&apos;ve earned</th>
              </tr>
            </thead>
            <tbody>
              {recruits.map((r) => {
                const stats = perRecruit.get(r.id);
                return (
                  <tr key={r.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium text-foreground sm:px-5">{r.name}</td>
                    <td className="px-4 py-3">
                      <Badge status={r.status}>{r.status === "pending" ? "awaiting approval" : r.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-muted">{formatDate(r.joinedAt)}</td>
                    <td className="px-4 py-3 text-foreground">{formatNumber(stats?.sales ?? 0)}</td>
                    <td className="px-4 py-3 font-medium text-accent sm:pr-5">{formatCurrency(stats?.earned ?? 0)}</td>
                  </tr>
                );
              })}
              {recruits.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-muted">
                    No one has signed up with your code yet. Share your invite link to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardHeader title="Bonus history" subtitle="One entry for every qualifying order your recruits make." />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted">
                <th className="px-4 py-3 font-medium sm:px-5">Date</th>
                <th className="px-4 py-3 font-medium">Recruit</th>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Bonus</th>
                <th className="px-4 py-3 font-medium sm:pr-5">Status</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((b) => (
                <tr key={b.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-muted sm:px-5">{formatDate(b.date)}</td>
                  <td className="px-4 py-3 text-foreground">{b.recruitName}</td>
                  <td className="px-4 py-3 text-muted">{b.orderId}</td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-foreground">{b.product}</td>
                  <td
                    className={
                      b.status === "void"
                        ? "px-4 py-3 text-muted line-through"
                        : "px-4 py-3 font-medium text-accent"
                    }
                  >
                    {formatCurrency(b.amount)}
                  </td>
                  <td className="px-4 py-3 sm:pr-5">
                    <Badge status={b.status === "void" ? "cancelled" : b.status}>{b.status}</Badge>
                  </td>
                </tr>
              ))}
              {bonuses.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-muted">
                    Bonuses appear here as soon as your recruits make sales.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} pageCount={pageCount} onChange={setPage} total={bonuses.length} pageSize={PAGE_SIZE} />
      </Card>
    </div>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-semibold text-accent">
        {n}
      </span>
      <span className="text-foreground">{children}</span>
    </li>
  );
}
