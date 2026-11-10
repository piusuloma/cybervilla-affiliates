"use client";

import { useState } from "react";
import Image from "next/image";
import { CheckCircle2, Gift, AlertCircle } from "lucide-react";
import { checkReferralCode, useAppData } from "@/lib/store";
import type { AffiliateApplication } from "@/lib/types";

const CHANNELS: AffiliateApplication["channel"][] = [
  "Instagram",
  "TikTok",
  "YouTube",
  "Blog / Website",
  "WhatsApp Community",
  "Twitter/X",
];

const inputClass =
  "w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none";

export function JoinForm({ initialCode }: { initialCode: string }) {
  const { affiliates, registerAffiliate } = useAppData();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [channel, setChannel] = useState<AffiliateApplication["channel"]>("Instagram");
  const [channelUrl, setChannelUrl] = useState("");
  const [audienceSize, setAudienceSize] = useState("");
  const [pitch, setPitch] = useState("");
  const [referralCode, setReferralCode] = useState(initialCode);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<{ firstName: string; sponsorFirstName?: string } | null>(null);

  const code = checkReferralCode(affiliates, referralCode);
  // First name only: anyone can type a code here, so it shouldn't reveal more than that.
  const sponsorFirstName = code.ok ? code.sponsor?.name.split(" ")[0] : undefined;
  const canSubmit = name.trim() && email.trim() && channelUrl.trim() && pitch.trim() && code.ok;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    const result = registerAffiliate({
      name,
      email,
      referralCode,
      application: {
        channel,
        channelUrl: channelUrl.trim(),
        audienceSize: Math.max(0, Number(audienceSize) || 0),
        pitch: pitch.trim(),
      },
    });
    if (!result.ok) {
      // A bad code is already shown inline as it is typed; only the email can fail here.
      if (result.field === "email") setEmailError(result.reason);
      return;
    }
    setSubmitted({
      firstName: result.affiliate.name.split(" ")[0],
      sponsorFirstName: result.sponsor?.name.split(" ")[0],
    });
  }

  return (
    <div className="flex min-h-screen items-start justify-center bg-background px-4 py-10 sm:items-center">
      <div className="w-full max-w-lg">
        <div className="mb-6 flex items-center justify-center gap-2.5">
          <span className="relative flex h-9 w-9 shrink-0 overflow-hidden rounded-lg">
            <Image src="/images/Login-bg.png" alt="" fill sizes="36px" className="object-cover" priority />
          </span>
          <span className="text-lg font-semibold tracking-tight text-foreground">
            Cyber<span className="text-brand-gradient">Villa</span> Affiliates
          </span>
        </div>

        <div className="rounded-xl border border-border bg-surface">
          {submitted ? (
            <div className="p-6 text-center sm:p-8">
              <CheckCircle2 size={40} className="mx-auto text-success" />
              <h1 className="mt-4 text-lg font-semibold text-foreground">Application received, {submitted.firstName}</h1>
              <p className="mt-2 text-sm text-muted">
                Our team reviews every application. We&apos;ll email you once yours is approved, and you can start
                sharing links straight away.
              </p>
              {submitted.sponsorFirstName && (
                <p className="mt-3 text-sm text-muted">
                  We&apos;ve noted that {submitted.sponsorFirstName} invited you.
                </p>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 p-5 sm:p-6">
              <div>
                <h1 className="text-lg font-semibold text-foreground">Become a CyberVilla affiliate</h1>
                <p className="mt-1 text-sm text-muted">
                  Share CyberVilla products with your audience and earn on every sale.
                </p>
              </div>

              {sponsorFirstName && (
                <div className="flex items-start gap-2.5 rounded-lg border border-accent/30 bg-accent/10 p-3 text-sm text-foreground">
                  <Gift size={16} className="mt-0.5 shrink-0 text-accent" />
                  <span>You were invited by {sponsorFirstName}.</span>
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block space-y-1">
                  <span className="text-xs font-medium text-muted">Full name</span>
                  <input value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" className={inputClass} />
                </label>
                <label className="block space-y-1">
                  <span className="text-xs font-medium text-muted">Email</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError(null);
                    }}
                    required
                    autoComplete="email"
                    className={inputClass}
                  />
                  {emailError && <span className="block text-xs text-danger">{emailError}</span>}
                </label>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block space-y-1">
                  <span className="text-xs font-medium text-muted">Where you&apos;ll promote</span>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value as AffiliateApplication["channel"])}
                    className={inputClass}
                  >
                    {CHANNELS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block space-y-1">
                  <span className="text-xs font-medium text-muted">Audience size (approx.)</span>
                  <input
                    type="number"
                    min={0}
                    inputMode="numeric"
                    value={audienceSize}
                    onChange={(e) => setAudienceSize(e.target.value)}
                    placeholder="e.g. 5000"
                    className={inputClass}
                  />
                </label>
              </div>

              <label className="block space-y-1">
                <span className="text-xs font-medium text-muted">Link to your page or channel</span>
                <input
                  type="url"
                  value={channelUrl}
                  onChange={(e) => setChannelUrl(e.target.value)}
                  required
                  placeholder="https://"
                  className={inputClass}
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-medium text-muted">Tell us about your audience</span>
                <textarea
                  value={pitch}
                  onChange={(e) => setPitch(e.target.value)}
                  required
                  rows={3}
                  placeholder="Who follows you, and what would you promote to them?"
                  className={inputClass}
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-medium text-muted">Referral code (optional)</span>
                <input
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  placeholder="e.g. TOMIWA0492"
                  autoCapitalize="characters"
                  className={inputClass}
                />
                {!code.ok && (
                  <span className="flex items-start gap-1 text-xs text-danger">
                    <AlertCircle size={13} className="mt-px shrink-0" /> {code.reason}
                  </span>
                )}
              </label>

              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-black hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-40"
              >
                Submit application
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
