export type CreditCachePack = {
  label: string;
  badge: string;
  amountNgn: number;
  creditedUsd: number;
  description: string;
};

export const MAX_CREDIT_USD = 1_000_000;
export const MANUAL_RATE_USD_PER_NGN = 20;

export const CREDITCACHE_PACKS: CreditCachePack[] = [
  {
    label: "Hot Recommended",
    badge: "Best start",
    amountNgn: 500,
    creditedUsd: 14000,
    description: "Lowest entry pack.",
  },
  {
    label: "Save More",
    badge: "Popular",
    amountNgn: 2000,
    creditedUsd: 60000,
    description: "Better than 4 small top-ups.",
  },
  {
    label: "Power Pack",
    badge: "More value",
    amountNgn: 10000,
    creditedUsd: 320000,
    description: "Stronger value pack.",
  },
  {
    label: "Max Saver",
    badge: "Top value",
    amountNgn: 24000,
    creditedUsd: 840000,
    description: "Highest pack value.",
  },
];

export function getPackByAmount(amountNgn: number) {
  return CREDITCACHE_PACKS.find((pack) => pack.amountNgn === amountNgn) ?? null;
}

export function getManualCredit(amountNgn: number) {
  return Math.round(amountNgn * MANUAL_RATE_USD_PER_NGN);
}

export function createTxRef(prefix = "cc") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function isSuccessfulStatus(status: unknown) {
  const normalized = String(status ?? "").toLowerCase();
  return normalized === "successful" || normalized === "success" || normalized === "completed";
}