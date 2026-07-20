import type { PricingPack } from "./types";
import { formatCurrency, formatNaira, getAccentRing, getPackRatio } from "./pricing";

function PackIcon({ accent }: { accent: PricingPack["accent"] }) {
  const className = "h-5 w-5";
  if (accent === "gold") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
        <path
          d="M12 2l1.7 5.2L19 9l-5.3 1.8L12 16l-1.7-5.2L5 9l5.3-1.8L12 2Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (accent === "emerald") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
        <path
          d="M12 3l3 6 6 3-6 3-3 6-3-6-6-3 6-3 3-6Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (accent === "purple") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
        <path d="M4 12h16M12 4v16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M12 4v16m-6-6 6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

type PackCardProps = {
  pack: PricingPack;
  active: boolean;
  onSelect: () => void;
};

export function PackCard({ pack, active, onSelect }: PackCardProps) {
  const savings = pack.originalPriceNgn ? pack.originalPriceNgn - pack.priceNgn : 0;
  const ratio = getPackRatio(pack);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        "group relative flex h-full w-full flex-col overflow-hidden rounded-[28px] border text-left transition duration-300",
        "border-slate-200/80 bg-white/80 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl",
        "hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(15,23,42,0.14)]",
        "dark:border-white/10 dark:bg-white/5 dark:shadow-[0_18px_50px_rgba(0,0,0,0.25)]",
        active ? "ring-2 ring-sky-500/70 dark:ring-sky-400/70" : "ring-0",
      ].join(" ")}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${getAccentRing(pack.accent)} opacity-70`} />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.58),rgba(255,255,255,0.16))] dark:bg-[linear-gradient(to_bottom,rgba(255,255,255,0.08),rgba(255,255,255,0.02))]" />

      <div className="relative flex h-full flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-800 dark:bg-white/10 dark:text-white">
              <PackIcon accent={pack.accent} />
            </span>
            {pack.badge}
          </div>

          {pack.discount ? (
            <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
              {pack.discount}
            </div>
          ) : (
            <div className="h-8" />
          )}
        </div>

        <div className="mt-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
            Credit bundle
          </div>
          <div className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
            {formatCurrency(pack.creditsCents, "USD")}
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-slate-600 dark:text-slate-300">Price</span>
            <span className="font-semibold text-slate-950 dark:text-white">
              {formatNaira(pack.priceNgn)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-slate-600 dark:text-slate-300">Effective rate</span>
            <span className="font-semibold text-slate-950 dark:text-white">
              {ratio.toLocaleString()} credits / ₦1
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-slate-600 dark:text-slate-300">Savings</span>
            <span className="font-semibold text-slate-950 dark:text-white">
              {pack.originalPriceNgn ? formatNaira(savings) : "—"}
            </span>
          </div>
        </div>

        <div className="mt-5 rounded-3xl border border-slate-200/80 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            Best for
          </div>
          <div className="mt-1 text-sm font-semibold text-slate-950 dark:text-white">
            {pack.label}
          </div>

          <ul className="mt-3 space-y-2">
            {pack.perks.map((perk) => (
              <li
                key={perk}
                className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300"
              >
                <span className="mt-1 inline-flex h-1.5 w-1.5 rounded-full bg-sky-500" />
                <span>{perk}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-auto pt-5">
          <div
            className={[
              "inline-flex w-full items-center justify-center rounded-full px-4 py-3 text-sm font-semibold text-white transition active:scale-[0.99]",
              active
                ? "bg-gradient-to-r from-emerald-500 to-sky-500 shadow-[0_14px_35px_rgba(16,185,129,0.25)]"
                : "bg-gradient-to-r from-sky-500 to-violet-600 shadow-[0_14px_35px_rgba(59,130,246,0.28)]",
            ].join(" ")}
          >
            {active ? "Selected" : "Select pack"}
          </div>
        </div>
      </div>
    </button>
  );
}