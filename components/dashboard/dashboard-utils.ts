import type { HistoryItem } from "./dashboard-types";

export function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function formatMoneyFromCents(amountCents: number, currency: string) {
  return formatMoney(amountCents / 100, currency);
}

export function firstNameOf(value: string) {
  const cleaned = value.trim();
  if (!cleaned) return "";
  return cleaned.split(/\s+/)[0] || cleaned;
}

export function normalizeUsername(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, ".")
    .replace(/^\.+|\.+$/g, "")
    .replace(/\.+/g, ".");
}

export function generateUsernameSuggestions(name: string, email: string, currentUsername: string) {
  const nameRoot = normalizeUsername(name);
  const emailRoot = normalizeUsername((email.split("@")[0] || "").trim());
  const currentRoot = normalizeUsername(currentUsername);

  const base = emailRoot || nameRoot || currentRoot || "credit.cache";
  const compact = base.replace(/[._-]/g, "");
  const suggestions = [
    base,
    nameRoot ? `${nameRoot}1` : "",
    emailRoot ? `${emailRoot}_cache` : "",
    compact ? `${compact}${Math.floor(Math.random() * 90 + 10)}` : "",
  ].filter(Boolean);

  return Array.from(new Set(suggestions)).slice(0, 4);
}

export function toneClass(tone: HistoryItem["tone"] = "primary") {
  switch (tone) {
    case "good":
      return "text-emerald-600 dark:text-emerald-400";
    case "warn":
      return "text-amber-600 dark:text-amber-400";
    case "danger":
      return "text-rose-600 dark:text-rose-400";
    case "primary":
    default:
      return "text-zinc-950 dark:text-white";
  }
}

export function uniqBy<T>(items: T[], keyOf: (item: T) => string) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = keyOf(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}