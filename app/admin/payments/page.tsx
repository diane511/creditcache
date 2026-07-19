// main/app/admin/payments/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getManualCredit } from "@/lib/creditcache-payments";

type VerifyState = {
  status: "idle" | "loading" | "success" | "failed";
  message: string;
  reference?: string;
  paidAmountNgn?: number;
  creditedUsd?: number;
};

type PackId = "lowest" | "popular" | "more-value" | "top-value" | "ultimate";

type PricingPack = {
  id: PackId;
  badge: string;
  priceNgn: number;
  originalPriceNgn: number | null;
  discount: string | null;
  creditsCents: number;
  accent: "blue" | "purple" | "emerald" | "gold";
  sparkle?: boolean;
};

const PACKS: PricingPack[] = [
  {
    id: "lowest",
    badge: "LOWEST ENTRY",
    priceNgn: 2500,
    originalPriceNgn: null,
    discount: null,
    creditsCents: 10_000_000,
    accent: "blue",
  },
  {
    id: "popular",
    badge: "POPULAR",
    priceNgn: 7500,
    originalPriceNgn: 8333,
    discount: "10% OFF",
    creditsCents: 30_000_000,
    accent: "purple",
  },
  {
    id: "more-value",
    badge: "MORE VALUE",
    priceNgn: 20000,
    originalPriceNgn: 26667,
    discount: "25% OFF",
    creditsCents: 100_000_000,
    accent: "emerald",
  },
  {
    id: "top-value",
    badge: "TOP VALUE",
    priceNgn: 45000,
    originalPriceNgn: 75000,
    discount: "40% OFF",
    creditsCents: 600_000_000,
    accent: "blue",
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
  },
];

const PACK_RATE_CENTS_PER_NGN = PACKS[0].creditsCents / PACKS[0].priceNgn;
const MANUAL_RATE_MULTIPLIER = 0.85; // 15% worse than packs
const MIN_MANUAL_TOP_UP_NGN = 1;

function formatCurrency(cents: number, currencyCode = "USD") {
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

function formatNaira(amount: number) {
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

function readPositiveNumber(value: string | null) {
  if (!value) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

function getManualUsdCredit(amountNgn: number) {
  return Math.round(amountNgn * PACK_RATE_CENTS_PER_NGN * MANUAL_RATE_MULTIPLIER);
}

function getPackAccentClasses(accent: PricingPack["accent"], selected: boolean) {
  if (selected) {
    return "border-white/30 bg-white/15 text-white shadow-[0_18px_40px_rgba(59,130,246,0.22)]";
  }

  switch (accent) {
    case "purple":
      return "border-white/10 bg-gradient-to-br from-white/10 via-white/6 to-white/5 text-white";
    case "emerald":
      return "border-white/10 bg-gradient-to-br from-emerald-400/14 via-white/6 to-white/5 text-white";
    case "gold":
      return "border-white/10 bg-gradient-to-br from-amber-400/18 via-white/6 to-white/5 text-white";
    default:
      return "border-white/10 bg-gradient-to-br from-sky-400/14 via-white/6 to-white/5 text-white";
  }
}

function PackIcon({ accent }: { accent: PricingPack["accent"] }) {
  const common = "h-5 w-5";
  if (accent === "emerald") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={common}>
        <path
          d="M12 3l3 6 6 3-6 3-3 6-3-6-6-3 6-3 3-6Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (accent === "gold") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={common}>
        <path
          d="M12 2l1.7 5.2L19 9l-5.3 1.8L12 16l-1.7-5.2L5 9l5.3-1.8L12 2Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M5 19h14"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.6"
        />
      </svg>
    );
  }

  if (accent === "purple") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={common}>
        <path
          d="M4 12h16M12 4v16"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M8 8l8 8M16 8l-8 8"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.65"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={common}>
      <path
        d="M12 4v16m-6-6 6 6 6-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WorkspacePremiumGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <path
        d="M12 3l3 4 5 .8-3.6 3.4.9 5.1L12 13.9 6.7 16.3l.9-5.1L4 7.8 9 7l3-4Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LocalOfferGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <path
        d="M20 13.5l-6.5 6.5L4 10.5V4h6.5L20 13.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 8.5h.01"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SavingsGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <path
        d="M12 4c4 0 7 2.7 7 6.5S16 17 12 17s-7-2.7-7-6.5S8 4 12 4Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="M12 7v7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9.5 9.5 12 7l2.5 2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function BoltGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <path
        d="M13 2L4 14h6l-1 8 9-12h-6l1-8Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TicketFrame({
  accent,
  children,
  selected = false,
  sparkle = false,
}: {
  accent: PricingPack["accent"];
  children: React.ReactNode;
  selected?: boolean;
  sparkle?: boolean;
}) {
  const base =
    accent === "gold"
      ? "from-amber-500/18 via-white/8 to-fuchsia-500/12"
      : accent === "emerald"
        ? "from-emerald-500/16 via-white/8 to-sky-500/10"
        : accent === "purple"
          ? "from-violet-500/18 via-white/8 to-blue-500/12"
          : "from-sky-500/18 via-white/8 to-violet-500/12";

  return (
    <div
      className={[
        "group relative overflow-hidden rounded-[20px] border backdrop-blur-[12px] transition-all duration-300",
        "shadow-[0_20px_55px_rgba(0,0,0,0.28)] hover:-translate-y-1 hover:scale-[1.03] hover:shadow-[0_24px_70px_rgba(56,189,248,0.18)]",
        selected ? "border-white/30" : "border-white/10",
        `bg-gradient-to-br ${base}`,
      ].join(" ")}
    >
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`ticket-${accent}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.04)" />
          </linearGradient>
        </defs>

        <rect
          x="1.5"
          y="1.5"
          width="97"
          height="97"
          rx="20"
          fill={`url(#ticket-${accent})`}
          stroke="rgba(255,255,255,0.14)"
          strokeWidth="1.2"
        />

        <circle cx="1.5" cy="50" r="7.6" fill="#0F172A" />
        <circle cx="98.5" cy="50" r="7.6" fill="#0F172A" />

        <line
          x1="9"
          y1="50"
          x2="91"
          y2="50"
          stroke="rgba(255,255,255,0.22)"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
      </svg>

      {sparkle ? (
        <div className="pointer-events-none absolute right-4 top-4 flex items-center gap-1 text-amber-200">
          <span className="text-lg">✦</span>
          <span className="text-xs font-semibold uppercase tracking-[0.2em]">Special</span>
        </div>
      ) : null}

      <div className="relative">{children}</div>
    </div>
  );
}

function PricingCard({
  pack,
  selected,
  onBuyNow,
}: {
  pack: PricingPack;
  selected: boolean;
  onBuyNow: () => void;
}) {
  const icon =
    pack.accent === "gold" ? (
      <BoltGlyph />
    ) : pack.accent === "emerald" ? (
      <SavingsGlyph />
    ) : pack.accent === "purple" ? (
      <LocalOfferGlyph />
    ) : (
      <WorkspacePremiumGlyph />
    );

  return (
    <TicketFrame accent={pack.accent} selected={selected} sparkle={pack.sparkle}>
      <div className="flex h-full flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
              {icon}
            </span>
            {pack.badge}
          </div>

          {pack.discount ? (
            <div className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
              {pack.discount}
            </div>
          ) : (
            <div className="h-8" />
          )}
        </div>

        <div className="mt-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/65">
            Credits
          </div>
          <div className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
            {formatCurrency(pack.creditsCents, "USD")}
          </div>
        </div>

        <div className="mt-5 space-y-2">
          {pack.originalPriceNgn ? (
            <div className="text-sm text-white/55 line-through">
              {formatNaira(pack.originalPriceNgn)}
            </div>
          ) : (
            <div className="text-sm text-white/55">One-time purchase</div>
          )}

          <div className="text-2xl font-black tracking-tight text-emerald-300">
            {formatNaira(pack.priceNgn)}
          </div>

          <div className="text-xs leading-5 text-white/70">
            {pack.originalPriceNgn ? "One-time purchase" : "No discount, best entry point"}
          </div>
        </div>

        <div className="mt-auto pt-5">
          <button
            type="button"
            onClick={onBuyNow}
            className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-sky-500 to-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(59,130,246,0.35)] transition hover:brightness-110 hover:shadow-[0_18px_40px_rgba(139,92,246,0.35)] active:scale-[0.99]"
          >
            Buy Now
          </button>
        </div>
      </div>
    </TicketFrame>
  );
}

export default function PaymentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const requestedAmountNgn = useMemo(
    () => readPositiveNumber(searchParams.get("amountNgn")),
    [searchParams],
  );
  const requestedAmountUsd = useMemo(
    () => readPositiveNumber(searchParams.get("amountUsd")),
    [searchParams],
  );
  const requestedMode = searchParams.get("mode");
  const requestedLabel = searchParams.get("label")?.trim() || "Credit pack";
  const requestedSource = searchParams.get("source")?.trim() || "pricing-page";

  const requestedPack = useMemo(() => {
    if (!requestedAmountNgn) return null;
    return PACKS.find((pack) => pack.priceNgn === requestedAmountNgn) ?? null;
  }, [requestedAmountNgn]);

  const initialMode: "pack" | "manual" =
    requestedMode === "manual"
      ? "manual"
      : requestedPack
        ? "pack"
        : requestedAmountNgn
          ? "manual"
          : "pack";

  const initialPackId = requestedPack?.id ?? PACKS[0].id;
  const initialManualAmount = initialMode === "manual" && requestedAmountNgn ? String(requestedAmountNgn) : "";

  const [email, setEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedPackId, setSelectedPackId] = useState<PackId>(initialPackId);
  const [mode, setMode] = useState<"pack" | "manual">(initialMode);
  const [manualAmountNgn, setManualAmountNgn] = useState(initialManualAmount);
  const [error, setError] = useState<string | null>(null);
  const [verifyState, setVerifyState] = useState<VerifyState>({
    status: "idle",
    message: "Waiting for payment details.",
  });

  const reference = searchParams.get("tx_ref") ?? searchParams.get("reference") ?? "";
  const transactionId = searchParams.get("transaction_id") ?? "";

  const selectedPack = useMemo(
    () => PACKS.find((pack) => pack.id === selectedPackId) ?? PACKS[0],
    [selectedPackId],
  );

  const manualAmount = Number(manualAmountNgn);
  const isManualAmountValid = Number.isFinite(manualAmount) && manualAmount >= MIN_MANUAL_TOP_UP_NGN;
  const manualCredit = isManualAmountValid ? getManualUsdCredit(manualAmount) : 0;

  const activeAmountNgn = mode === "manual" && isManualAmountValid ? manualAmount : selectedPack.priceNgn;
  const activeCreditUsd = mode === "manual" && isManualAmountValid ? manualCredit : selectedPack.creditsCents;

  const callbackUrl = useMemo(() => {
    if (typeof window === "undefined") return "";

    const url = new URL("/admin/payments", window.location.origin);
    searchParams.forEach((value, key) => {
      if (key === "reference" || key === "tx_ref" || key === "transaction_id") return;
      url.searchParams.set(key, value);
    });

    return url.toString();
  }, [searchParams]);

  useEffect(() => {
    async function loadLoggedInUser() {
      try {
        setEmailLoading(true);
        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
        });

        const data = (await response.json().catch(() => null)) as
          | {
              user?: {
                email?: string;
              } | null;
              message?: string;
            }
          | null;

        if (!response.ok || !data?.user?.email) {
          throw new Error(data?.message ?? "Unable to load logged-in user email.");
        }

        setEmail(data.user.email);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load user email.");
      } finally {
        setEmailLoading(false);
      }
    }

    loadLoggedInUser();
  }, []);

  useEffect(() => {
    async function verifyPayment() {
      if (!reference && !transactionId) return;

      setVerifyState({
        status: "loading",
        message: "Verifying payment...",
      });

      try {
        const params = new URLSearchParams();
        if (reference) params.set("tx_ref", reference);
        if (transactionId) params.set("transaction_id", transactionId);

        const response = await fetch(`/api/creditcache/payments/verify?${params.toString()}`, {
          method: "GET",
          credentials: "include",
        });

        const data = (await response.json().catch(() => null)) as
          | {
              status?: boolean;
              message?: string;
              data?: {
                status?: string;
                reference?: string;
                amount?: number;
                creditedUsd?: number;
                creditedUsdCents?: number;
              };
            }
          | null;

        if (!response.ok || !data?.status || !data.data) {
          throw new Error(data?.message ?? "Payment verification failed.");
        }

        setVerifyState({
          status: "success",
          message: data.message ?? "Payment verified and balance updated.",
          reference: data.data.reference,
          paidAmountNgn: typeof data.data.amount === "number" ? data.data.amount : undefined,
          creditedUsd:
            typeof data.data.creditedUsdCents === "number"
              ? data.data.creditedUsdCents
              : data.data.creditedUsd,
        });

        router.replace("/admin?payment=success");
      } catch (err) {
        setVerifyState({
          status: "failed",
          message: err instanceof Error ? err.message : "Unable to verify payment.",
        });
      }
    }

    verifyPayment();
  }, [reference, transactionId, router]);

  async function startCheckout(params: {
    amountNgn: number;
    amountUsd: number;
    mode: "pack" | "manual";
    label: string;
  }) {
    setError(null);

    if (!email.trim()) {
      setError("Unable to find the logged-in user's email.");
      return;
    }

    if (params.mode === "manual" && params.amountNgn < MIN_MANUAL_TOP_UP_NGN) {
      setError(`Enter a valid manual amount of at least ₦${MIN_MANUAL_TOP_UP_NGN.toLocaleString("en-NG")}.`);
      return;
    }

    if (params.amountNgn <= 0 || params.amountUsd <= 0) {
      setError("Choose a pack or enter a valid manual amount.");
      return;
    }

    if (!callbackUrl) {
      setError("Unable to build the callback URL.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/creditcache/payments/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          amountNgn: params.amountNgn,
          amountUsd: params.amountUsd,
          mode: params.mode,
          callbackUrl,
          label: params.label,
          source: requestedSource,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | {
            status?: boolean;
            message?: string;
            data?: {
              authorization_url?: string;
              tx_ref?: string;
            };
          }
        | null;

      if (!response.ok || !data?.status || !data.data?.authorization_url) {
        throw new Error(data?.message ?? "Unable to start checkout.");
      }

      window.location.href = data.data.authorization_url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start payment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0F172A] px-4 py-8 text-white">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/75 backdrop-blur">
            Premium Credit Store
          </div>

          <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">
            Choose a Credit Pack
          </h1>

          <p className="mt-4 text-sm leading-6 text-white/70 sm:text-base">
            High-value packs for fixed pricing, plus a manual top-up option with a 15% higher rate and no discount.
          </p>
        </div>

        <section className="mt-10">
          <div className="grid gap-4 xl:grid-cols-5">
            {PACKS.map((pack) => (
              <PricingCard
                key={pack.id}
                pack={pack}
                selected={selectedPack.id === pack.id && mode === "pack"}
                onBuyNow={() => {
                  setSelectedPackId(pack.id);
                  setMode("pack");
                  void startCheckout({
                    amountNgn: pack.priceNgn,
                    amountUsd: pack.creditsCents,
                    mode: "pack",
                    label: pack.badge,
                  });
                }}
              />
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-[0_24px_70px_rgba(0,0,0,0.22)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/55">
                  Manual top-up
                </div>
                <h2 className="mt-2 text-2xl font-black tracking-tight">Custom amount</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
                  Manual top-ups use the same base rate as the lowest pack, then add a 15% premium.
                  No discount is applied.
                </p>
              </div>

              <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80">
                15% higher rate
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
                  Naira amount
                </span>
                <input
                  type="number"
                  min={MIN_MANUAL_TOP_UP_NGN}
                  step={1}
                  value={manualAmountNgn}
                  onChange={(e) => {
                    setManualAmountNgn(e.target.value);
                    setMode("manual");
                  }}
                  placeholder="e.g. 25000"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white outline-none transition placeholder:text-white/35 focus:border-white/30"
                />
              </label>

              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right sm:min-w-56">
                <div className="text-[10px] uppercase tracking-[0.18em] text-white/55">Preview</div>
                <div className="mt-2 text-2xl font-black tracking-tight text-emerald-300">
                  {isManualAmountValid ? formatCurrency(manualCredit, "USD") : "—"}
                </div>
                <div className="mt-1 text-xs text-white/60">
                  {isManualAmountValid ? formatNaira(manualAmount) : "Enter an amount"}
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-3 rounded-3xl border border-white/10 bg-black/20 p-4 sm:grid-cols-3">
              <div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-white/55">Price</div>
                <div className="mt-1 text-lg font-bold">
                  {isManualAmountValid ? formatNaira(manualAmount) : "—"}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-white/55">Credit</div>
                <div className="mt-1 text-lg font-bold">
                  {isManualAmountValid ? formatCurrency(manualCredit, "USD") : "—"}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-white/55">Discount</div>
                <div className="mt-1 text-lg font-bold text-rose-300">None</div>
              </div>
            </div>

            {error ? (
              <div className="mt-4 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                {error}
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  const amount = Number(manualAmountNgn);
                  const credits = isManualAmountValid ? getManualUsdCredit(amount) : 0;
                  setMode("manual");
                  void startCheckout({
                    amountNgn: amount,
                    amountUsd: credits,
                    mode: "manual",
                    label: "Manual top up",
                  });
                }}
                disabled={loading || emailLoading}
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-sky-500 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(59,130,246,0.35)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Opening checkout..." : "Buy manual top-up"}
              </button>

              <Link
                href="/admin"
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/10"
              >
                Back to admin
              </Link>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-[0_24px_70px_rgba(0,0,0,0.22)]">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/55">
                Checkout summary
              </div>
              <div className="mt-3 text-2xl font-black tracking-tight">
                {mode === "manual" && isManualAmountValid
                  ? "Manual top up"
                  : requestedPack?.badge || selectedPack.badge}
              </div>

              <div className="mt-4 space-y-3 text-sm text-white/75">
                <div className="flex items-center justify-between gap-3">
                  <span>Amount paid</span>
                  <span className="font-semibold text-white">
                    {mode === "manual" && isManualAmountValid
                      ? formatNaira(manualAmount)
                      : formatNaira(selectedPack.priceNgn)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span>Credit added</span>
                  <span className="font-semibold text-white">
                    {mode === "manual" && isManualAmountValid
                      ? formatCurrency(manualCredit, "USD")
                      : formatCurrency(selectedPack.creditsCents, "USD")}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span>Rate</span>
                  <span className="font-semibold text-white/90">
                    {mode === "manual" && isManualAmountValid ? "+15% premium" : "Fixed pack rate"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span>Selected source</span>
                  <span className="font-semibold text-white/90">{requestedSource}</span>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-[0_24px_70px_rgba(0,0,0,0.22)]">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/55">
                Payment status
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-sm font-medium text-white">
                  {verifyState.status === "loading"
                    ? "Verifying..."
                    : verifyState.status === "success"
                      ? "Verified"
                      : verifyState.status === "failed"
                        ? "Not verified"
                        : "Waiting"}
                </div>
                <p className="mt-2 text-sm leading-6 text-white/70">{verifyState.message}</p>

                {verifyState.reference ? (
                  <div className="mt-3 text-xs text-white/55">Reference: {verifyState.reference}</div>
                ) : null}

                {typeof verifyState.paidAmountNgn === "number" ? (
                  <div className="mt-2 text-xs text-white/55">
                    Paid amount: {formatNaira(verifyState.paidAmountNgn)}
                  </div>
                ) : null}

                {typeof verifyState.creditedUsd === "number" ? (
                  <div className="mt-2 text-xs text-white/55">
                    Credited: {formatCurrency(verifyState.creditedUsd, "USD")}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-[0_24px_70px_rgba(0,0,0,0.22)]">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/55">
                Notes
              </div>
              <p className="mt-3 text-sm leading-6 text-white/70">
                Fixed packs keep their discounted pricing. Manual top-ups are always priced 15%
                higher than the fixed pack rate and do not show a discount.
              </p>
            </div>
          </aside>
        </section>

        <div className="mt-10 text-center text-xs text-white/40">
          If a pack is selected, its fixed price and credit amount are used. Manual amounts follow
          the premium rate.
        </div>
      </div>
    </div>
  );
}