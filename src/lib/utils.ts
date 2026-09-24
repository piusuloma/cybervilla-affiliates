export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/**
 * Money, in the currency it is actually priced in.
 *
 * Products come from the store with their own currency, so passing null prints
 * the figure bare rather than dressing it up in a symbol nobody quoted. The
 * NGN default is for the screens still running on mock data.
 */
export function formatCurrency(amount: number, currency: string | null = "NGN") {
  if (!currency) {
    return new Intl.NumberFormat("en-NG", { maximumFractionDigits: 0 }).format(amount);
  }
  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    // An unrecognised code would otherwise throw and take the page down with it.
    return `${currency} ${formatNumber(amount)}`;
  }
}

export function formatNumber(n: number) {
  return new Intl.NumberFormat("en-NG").format(n);
}

export function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatDateTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(dateStr);
}

export function toCsv<T extends Record<string, unknown>>(rows: T[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))];
  return lines.join("\n");
}

export function downloadFile(content: string, filename: string, mime = "text/csv") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
