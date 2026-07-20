"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ParallaxScrollView } from "@/components/ui/ParallaxScrollView";
import { PackCard } from "@/components/admin/payments/PackCard";
import { MetricChip } from "@/components/admin/payments/MetricChip";
import {
  PACKS,
  QUICK_AMOUNTS,
  MIN_MANUAL_TOP_UP_NGN,
  formatCurrency,
  formatNaira,
  getManualUsdCredit,
} from "@/components/admin/payments/pricing";
import type { PackId } from "@/components/admin/payments/types";

export default function PlansPage() {
  const router = useRouter();
  const [selectedPackId, setSelectedPackId] = useState<PackId>("lowest");
  const [manualAmountNgn, setManualAmountNgn] = useState("");
  const [mode, setMode] = useState<"pack" | "manual">("pack");
  const [error, setError] = useState<string | null>(null);

  const selectedPack = useMemo(
    () => PACKS.find((pack) => pack.id === selectedPackId) ?? PACKS[0],
    [selectedPackId],
  );

  const manualAmount = Number(manualAmountNgn);
  const isManualAmountValid =
    Number.isFinite(manualAmount) && manualAmount >= MIN_MANUAL_TOP_UP_NGN;
  const manualCredit = isManualAmountValid ? getManualUsdCredit(manualAmount) : 0;

  const activeAmountNgn =
    mode === "manual" && isManualAmountValid ? manualAmount : selectedPack.priceNgn;
  const activeAmountUsd =
    mode === "manual" && isManualAmountValid ? manualCredit : selectedPack.creditsCents;

  function goToCheckout(params: {
    amountNgn: number;
    amountUsd: number;
    mode: "pack" | "manual";
    label: string;
  }) {
    const search = new URLSearchParams({
      amountNgn: String(Math.round(params.amountNgn)),
      amountUsd: String(Math.round(params.amountUsd)),
      mode: params.mode,
      label: params.label,
      source: "admin-balance-topup",
    });

    router.push(`/admin/payments?${search.toString()}`);
  }

  function handleProceed() {
    setError(null);

    if (mode === "manual") {
      if (!isManualAmountValid) {
        setError(
          `Enter a valid manual amount of at least ₦${MIN_MANUAL_TOP_UP_NGN.toLocaleString(
            "en-NG",
          )}.`,
        );
        return;
      }

      goToCheckout({
        amountNgn: manualAmount,
        amountUsd: manualCredit,
        mode: "manual",
        label: "Manual top up",
      });
      return;
    }

    goToCheckout({
      amountNgn: selectedPack.priceNgn,
      amountUsd: selectedPack.creditsCents,
      mode: "pack",
      label: selectedPack.badge,
    });
  }

  const hero = (
    <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
      <div className="space-y-4">
        <div className="inline-flex items-center rounded-full border border-slate-200/80 bg-white/75 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-600 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
          Premium Credit Store
        </div>

        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-5xl">
            Choose a Credit Pack
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
            App-store style parallax, native-feel cards, and a sheet layout that scrolls over the
            hero like a real Expo or React Native commerce screen.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <MetricChip label="Fast checkout" value="1 tap to payment" />
          <MetricChip label="Mode" value={mode === "manual" ? "Manual top-up" : "Fixed pack"} />
          <MetricChip
            label="Selected"
            value={
              mode === "manual" && isManualAmountValid
                ? formatNaira(manualAmount)
                : selectedPack.badge
            }
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {PACKS.slice(0, 4).map((pack) => (
          <div
            key={pack.id}
            className="rounded-[24px] border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/5"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                {pack.badge}
              </div>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-900 dark:bg-white/10 dark:text-white">
                <span className="text-sm font-black">{pack.badge[0]}</span>
              </span>
            </div>
            <div className="mt-4 text-lg font-black tracking-tight text-slate-950 dark:text-white">
              {formatCurrency(pack.creditsCents, "USD")}
            </div>
            <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              {formatNaira(pack.priceNgn)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const headerRightAction = (
    <Link
      href="/admin"
      className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
    >
      Back to admin
    </Link>
  );

  return (
    <ParallaxScrollView
      badge="Payments"
      title="Credit Plans"
      subtitle="A cleaner, app-like pricing experience with native-style cards, responsive theme support, and a real sheet-over-hero scroll feel."
      hero={hero}
      rightAction={headerRightAction}
    >
      <section className="grid gap-4 xl:grid-cols-5">
        {PACKS.map((pack) => {
          const active = mode === "pack" && selectedPack.id === pack.id;

          return (
            <PackCard
              key={pack.id}
              pack={pack}
              active={active}
              onSelect={() => {
                setSelectedPackId(pack.id);
                setMode("pack");
                goToCheckout({
                  amountNgn: pack.priceNgn,
                  amountUsd: pack.creditsCents,
                  mode: "pack",
                  label: pack.badge,
                });
              }}
            />
          );
        })}
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[30px] border border-slate-200/80 bg-white/80 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:shadow-[0_18px_50px_rgba(0,0,0,0.25)] sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                Manual top-up
              </div>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-white">
                Custom amount
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                Manual top-ups use the same base rate as the lowest pack and add a 15% premium.
                No discount is applied.
              </p>
            </div>

            <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              15% higher rate
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
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
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-sky-400 dark:border-white/10 dark:bg-slate-950/40 dark:text-white dark:placeholder:text-slate-500"
              />
            </label>

            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-right shadow-sm dark:border-white/10 dark:bg-white/5 sm:min-w-56">
              <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Preview
              </div>
              <div className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-white">
                {isManualAmountValid ? formatCurrency(manualCredit, "USD") : "—"}
              </div>
              <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                {isManualAmountValid ? formatNaira(manualAmount) : "Enter an amount"}
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {QUICK_AMOUNTS.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => {
                  setManualAmountNgn(String(amount));
                  setMode("manual");
                }}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
              >
                {formatNaira(amount)}
              </button>
            ))}
          </div>

          {error ? (
            <div className="mt-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-200">
              {error}
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleProceed}
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-sky-500 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_35px_rgba(59,130,246,0.28)] transition hover:brightness-110 active:scale-[0.99]"
            >
              Proceed to payment
            </button>

            <Link
              href="/admin"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
            >
              Back to admin
            </Link>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-[30px] border border-slate-200/80 bg-white/80 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:shadow-[0_18px_50px_rgba(0,0,0,0.25)] sm:p-6">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
              Checkout summary
            </div>
            <div className="mt-3 text-2xl font-black tracking-tight text-slate-950 dark:text-white">
              {mode === "manual" && isManualAmountValid ? "Manual top up" : selectedPack.badge}
            </div>

            <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-center justify-between gap-3">
                <span>Amount paid</span>
                <span className="font-semibold text-slate-950 dark:text-white">
                  {mode === "manual" && isManualAmountValid
                    ? formatNaira(manualAmount)
                    : formatNaira(selectedPack.priceNgn)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span>Credit added</span>
                <span className="font-semibold text-slate-950 dark:text-white">
                  {mode === "manual" && isManualAmountValid
                    ? formatCurrency(manualCredit, "USD")
                    : formatCurrency(selectedPack.creditsCents, "USD")}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span>Discount</span>
                <span className="font-semibold text-slate-950 dark:text-white">
                  {mode === "manual" ? "None" : selectedPack.discount ?? "—"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span>Mode</span>
                <span className="font-semibold text-slate-950 dark:text-white">
                  {mode === "manual" ? "Manual top up" : "Fixed pack"}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-[30px] border border-slate-200/80 bg-white/80 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:shadow-[0_18px_50px_rgba(0,0,0,0.25)] sm:p-6">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
              Why this feels native
            </div>
            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              <p>• Large rounded surfaces and soft elevation, like an Expo app.</p>
              <p>• A sheet that overlaps the hero instead of a fixed header line.</p>
              <p>• Theme-aware backgrounds and borders, so it stays light or dark correctly.</p>
              <p>• Faster decision making with pack previews, savings, and quick amount chips.</p>
            </div>
          </div>
        </aside>
      </section>

      <section className="mt-6 rounded-[30px] border border-slate-200/80 bg-white/80 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:shadow-[0_18px_50px_rgba(0,0,0,0.25)] sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
              Current selection
            </div>
            <div className="mt-2 text-xl font-black tracking-tight text-slate-950 dark:text-white">
              {mode === "manual" && isManualAmountValid ? "Manual top up" : selectedPack.badge}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
              {formatNaira(activeAmountNgn)}
            </div>
            <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
              {formatCurrency(activeAmountUsd, "USD")}
            </div>
            <button
              type="button"
              onClick={handleProceed}
              className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 dark:bg-white dark:text-slate-950"
            >
              Continue
            </button>
          </div>
        </div>
      </section>
    </ParallaxScrollView>
  );
}