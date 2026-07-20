import type { PricingPack } from "./types";

export const PACKS: PricingPack[] = [
  {
    id: "lowest",
    badge: "LOWEST ENTRY",
    priceNgn: 2500,
    originalPriceNgn: null,
    discount: null,
    creditsCents: 10_000_000,
    accent: "blue",
    label: "Quick start",
    perks: ["Best for first top-up", "Fast checkout", "Easy budget entry"],
  },
  {
    id: "popular",
    badge: "POPULAR",
    priceNgn: 7500,
    originalPriceNgn: 8333,
    discount: "10% OFF",
    creditsCents: 30_000_000,
    accent: "purple",
    label: "Most chosen",
    perks: ["Balanced value", "Smooth upgrade path", "Great for active use"],
  },
  {
    id: "more-value",
    badge: "MORE VALUE",
    priceNgn: 20000,
    originalPriceNgn: 26667,
    discount: "25% OFF",
    creditsCents: 100_000_000,
    accent: "emerald",
    label: "Better savings",
    perks: ["Stronger unit value", "Good mid-tier scale", "Reduced repeat top-ups"],
  },
  {
    id: "top-value",
    badge: "TOP VALUE",
    priceNgn: 45000,
    originalPriceNgn: 75000,
    discount: "40% OFF",
    creditsCents: 600_000_000,
    accent: "blue",
    label: "Highest value",
    perks: ["Biggest jump in credits", "Best for heavy usage", "Lower effective rate"],
  },
  {
    id: "ultimate",
    badge: "ULTIMATE",
    priceNgn: 75000,
    originalPriceNgn: 166667,
    discount: "55% OFF",
    creditsCents: 1_000_000_000,
    accent: "gold",
    sparkle: true,
    label: "Max tier",
    perks: ["Maximum credits", "Premium tier savings", "Best for power users"],
  },
];

export const PACK_RATE_CENTS_PER_NGN = PACKS[0].creditsCents / PACKS[0].priceNgn;
export const MANUAL_RATE_MULTIPLIER = 0.85;
export const MIN_MANUAL_TOP_UP_NGN = 1;
export const QUICK_AMOUNTS = [5_000, 10_000, 25_000, 50_000];

export function formatCurrency(cents: number, currencyCode = "USD") {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 2,
    }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${currencyCode.toUpperCase()}`;
  }
}

export function formatNaira(amount: number) {
  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `₦${Math.round(amount).toLocaleString("en-NG")}`;
  }
}

export function formatCompactNumber(value: number) {
  try {
    return new Intl.NumberFormat(undefined, {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  } catch {
    return value.toLocaleString();
  }
}

export function getManualUsdCredit(amountNgn: number) {
  return Math.round(amountNgn * PACK_RATE_CENTS_PER_NGN * MANUAL_RATE_MULTIPLIER);
}

export function getPackRatio(pack: PricingPack) {
  return Math.round(pack.creditsCents / pack.priceNgn);
}

export function getAccentRing(accent: PricingPack["accent"]) {
  switch (accent) {
    case "purple":
      return "from-violet-500/25 via-violet-400/10 to-sky-500/15";
    case "emerald":
      return "from-emerald-500/25 via-emerald-400/10 to-sky-500/12";
    case "gold":
      return "from-amber-400/25 via-amber-300/10 to-fuchsia-500/12";
    default:
      return "from-sky-500/25 via-sky-400/10 to-violet-500/12";
  }
}