export type PackId = "lowest" | "popular" | "more-value" | "top-value" | "ultimate";

export type PricingPack = {
  id: PackId;
  badge: string;
  priceNgn: number;
  originalPriceNgn: number | null;
  discount: string | null;
  creditsCents: number;
  accent: "blue" | "purple" | "emerald" | "gold";
  sparkle?: boolean;
  label: string;
  perks: string[];
};