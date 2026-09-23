"use client";

import { useState } from "react";
import { ChevronDown, BookOpen, FileText, LifeBuoy } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Toolbar";
import { FAQS, SUPPORT_TICKETS, AFFILIATE_LINKS, PRODUCTS } from "@/lib/mock-data";
import type { SupportTicket } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

const TUTORIALS = [
  "Getting started as a CyberVilla affiliate",
  "Generating your first affiliate link",
  "Using promotional codes effectively",
  "Reading your transactions & commission statuses",
  "Setting up your payout method",
];

const RELATED_OPTIONS = [
  "None",
  ...AFFILIATE_LINKS.map((l) => `Link: ${l.label} (${l.code})`),
  ...PRODUCTS.slice(0, 5).map((p) => `Product: ${p.name}`),
];

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [tickets, setTickets] = useState<SupportTicket[]>(SUPPORT_TICKETS);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("Commission dispute");
  const [related, setRelated] = useState("None");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    const ticket: SupportTicket = {
      id: `TCK-${440 + tickets.length + 1}`,
      subject,
      category,
      status: "open",
      createdAt: new Date().toISOString().slice(0, 10),
      relatedTo: related !== "None" ? related : undefined,
    };
    setTickets((prev) => [ticket, ...prev]);
    setSubject("");
    setMessage("");
    setRelated("None");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2500);
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted">Find answers, learn the ropes, or get help from the CyberVilla affiliate team.</p>

      <div className="grid gap-4 lg:grid-cols-3">
        <QuickLink icon={BookOpen} title="Tutorials" desc="Short guides to get the most from the program." items={TUTORIALS} />
        <QuickLinkStatic
          icon={FileText}
          title="Affiliate guidelines"
          desc="Program rules, prohibited practices, and brand usage."
        />
        <QuickLinkStatic icon={LifeBuoy} title="Contact support" desc="Use the form below — our team replies within 24 hours." />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Frequently asked questions" />
          <div className="divide-y divide-border">
            {FAQS.map((f, i) => (
              <div key={f.q}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between gap-3 p-4 text-left text-sm font-medium text-foreground sm:p-5"
                >
                  {f.q}
                  <ChevronDown size={16} className={cn("shrink-0 text-muted transition-transform", openFaq === i && "rotate-180")} />
                </button>
                {openFaq === i && <p className="px-4 pb-4 text-sm text-muted sm:px-5">{f.a}</p>}
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Submit a support request" />
          <form onSubmit={handleSubmit} className="space-y-3 p-4 sm:p-5">
            <label className="block space-y-1">
              <span className="text-xs font-medium text-muted">Subject</span>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Briefly describe your issue"
                className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block space-y-1">
                <span className="text-xs font-medium text-muted">Category</span>
                <Select
                  value={category}
                  onChange={setCategory}
                  options={["Commission dispute", "Payments", "Technical issue", "Account", "Other"]}
                  className="w-full"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-medium text-muted">Related to (optional)</span>
                <Select value={related} onChange={setRelated} options={RELATED_OPTIONS} className="w-full" />
              </label>
            </div>
            <label className="block space-y-1">
              <span className="text-xs font-medium text-muted">Message</span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="Tell us more…"
                className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
              />
            </label>
            <div className="flex items-center gap-3">
              <button className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-black hover:bg-accent-strong">
                Submit request
              </button>
              {submitted && <span className="text-xs font-medium text-success">Ticket submitted.</span>}
            </div>
          </form>
        </Card>
      </div>

      <Card>
        <CardHeader title="Your support requests" subtitle={`${tickets.length} tickets`} />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted">
                <th className="px-4 py-3 font-medium sm:px-5">Ticket</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Related to</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium sm:pr-5">Status</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 sm:px-5">
                    <p className="font-medium text-foreground">{t.id}</p>
                    <p className="text-xs text-muted">{t.subject}</p>
                  </td>
                  <td className="px-4 py-3 text-muted">{t.category}</td>
                  <td className="px-4 py-3 text-muted">{t.relatedTo ?? "—"}</td>
                  <td className="px-4 py-3 text-muted">{formatDate(t.createdAt)}</td>
                  <td className="px-4 py-3 sm:pr-5">
                    <Badge status={t.status}>{t.status.replace("_", " ")}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function QuickLink({
  icon: Icon,
  title,
  desc,
  items,
}: {
  icon: typeof BookOpen;
  title: string;
  desc: string;
  items: string[];
}) {
  return (
    <Card className="p-4 sm:p-5">
      <span className="inline-flex rounded-lg bg-accent/10 p-2 text-accent">
        <Icon size={18} />
      </span>
      <h3 className="mt-3 text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-0.5 text-xs text-muted">{desc}</p>
      <ul className="mt-3 space-y-1.5">
        {items.slice(0, 3).map((i) => (
          <li key={i} className="truncate text-xs text-muted hover:text-accent">
            • {i}
          </li>
        ))}
      </ul>
    </Card>
  );
}

function QuickLinkStatic({ icon: Icon, title, desc }: { icon: typeof BookOpen; title: string; desc: string }) {
  return (
    <Card className="p-4 sm:p-5">
      <span className="inline-flex rounded-lg bg-accent/10 p-2 text-accent">
        <Icon size={18} />
      </span>
      <h3 className="mt-3 text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-0.5 text-xs text-muted">{desc}</p>
    </Card>
  );
}
