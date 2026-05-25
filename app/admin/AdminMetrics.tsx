"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/Badge";

type Metric = {
  label: string;
  value: number;
  history?: number[];
  updatedAt?: string;
  unit?: string;
};

type Props = {
  metrics: Metric[];
};

type Trend = "up" | "down" | "steady";
type SortBy = "leader" | "trend" | "name";

type MetricStats = {
  trend: Trend;
  delta: number;
  deltaPct: number;
  min: number;
  max: number;
  average: number;
  latest: number;
  previous: number;
  history: number[];
};

function formatRelativeTime(iso?: string, now = Date.now()) {
  if (!iso) return "Live";
  const ts = new Date(iso).getTime();
  if (Number.isNaN(ts)) return "Live";

  const diffMs = ts - now;
  const absSeconds = Math.round(Math.abs(diffMs) / 1000);

  if (absSeconds < 10) return "just now";

  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 60 * 60 * 24 * 365],
    ["month", 60 * 60 * 24 * 30],
    ["week", 60 * 60 * 24 * 7],
    ["day", 60 * 60 * 24],
    ["hour", 60 * 60],
    ["minute", 60],
    ["second", 1],
  ];

  for (const [unit, secondsPerUnit] of units) {
    if (absSeconds >= secondsPerUnit) {
      const value = Math.round(diffMs / 1000 / secondsPerUnit);
      return new Intl.RelativeTimeFormat(undefined, { numeric: "auto" }).format(
        value,
        unit,
      );
    }
  }

  return "just now";
}

function formatNumber(value: number, unit?: string) {
  const formatted = new Intl.NumberFormat(undefined, {
    maximumFractionDigits: Number.isInteger(value) ? 0 : 1,
  }).format(value);

  return unit ? `${formatted} ${unit}` : formatted;
}

function getMetricStats(values: number[]): MetricStats {
  const history = values.length ? values : [0];
  const latest = history[history.length - 1] ?? 0;
  const previous = history[history.length - 2] ?? latest;
  const delta = latest - previous;
  const deltaPct = previous === 0 ? 0 : (delta / previous) * 100;

  const min = Math.min(...history);
  const max = Math.max(...history);
  const average = history.reduce((sum, v) => sum + v, 0) / history.length;

  let trend: Trend = "steady";
  if (delta > 0) trend = "up";
  if (delta < 0) trend = "down";

  return { trend, delta, deltaPct, min, max, average, latest, previous, history };
}

function Sparkline({
  values,
  label,
}: {
  values: number[];
  label: string;
}) {
  const width = 320;
  const height = 96;
  const padding = 10;

  const safeValues = values.length ? values : [0, 0];
  const min = Math.min(...safeValues);
  const max = Math.max(...safeValues);
  const range = Math.max(1, max - min);

  const points = safeValues
    .map((value, index) => {
      const x =
        padding +
        (index * (width - padding * 2)) / Math.max(1, safeValues.length - 1);
      const y =
        height -
        padding -
        ((value - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-24 w-full"
      role="img"
      aria-label={`${label} trend sparkline`}
      preserveAspectRatio="none"
    >
      <line
        x1={padding}
        y1={height - padding}
        x2={width - padding}
        y2={height - padding}
        className="stroke-black/10 dark:stroke-white/10"
        strokeWidth="1"
      />
      <polyline
        fill="none"
        points={points}
        className="stroke-zinc-950 dark:stroke-white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={width - padding}
        cy={
          height -
          padding -
          ((safeValues[safeValues.length - 1] - min) / range) *
            (height - padding * 2)
        }
        r="4"
        className="fill-zinc-950 dark:fill-white"
      />
    </svg>
  );
}

function MetricRow({
  metric,
  nowTick,
  rank,
}: {
  metric: Metric;
  nowTick: number;
  rank: number;
}) {
  const history =
    metric.history && metric.history.length ? metric.history : [metric.value];
  const stats = getMetricStats(history);
  const latest = stats.latest;

  const tone =
    stats.trend === "up"
      ? "good"
      : stats.trend === "down"
        ? "warn"
        : "primary";

  const trendLabel =
    stats.trend === "up"
      ? `+${Math.abs(stats.delta).toLocaleString()}`
      : stats.trend === "down"
        ? `-${Math.abs(stats.delta).toLocaleString()}`
        : "Stable";

  const progress =
    stats.max > 0 ? Math.max(0, Math.min(100, (latest / stats.max) * 100)) : 0;

  return (
    <div className="grid gap-4 px-4 py-4 sm:px-5 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            #{rank}
          </span>
          <h3 className="text-base font-semibold tracking-tight text-zinc-950 dark:text-white">
            {metric.label}
          </h3>
          <Badge tone={tone}>{trendLabel}</Badge>
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
          <span>Updated {formatRelativeTime(metric.updatedAt, nowTick)}</span>
          <span className="hidden sm:inline">•</span>
          <span>
            Avg {Math.round(stats.average).toLocaleString()} · Low{" "}
            {Math.round(stats.min).toLocaleString()} · High{" "}
            {Math.round(stats.max).toLocaleString()}
          </span>
        </div>

        <div className="mt-3 flex items-end gap-2">
          <div className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white">
            {latest.toLocaleString()}
          </div>
          {metric.unit ? (
            <div className="pb-1 text-sm font-medium text-zinc-500 dark:text-zinc-400">
              {metric.unit}
            </div>
          ) : null}
        </div>

        <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          {stats.deltaPct > 0
            ? `+${stats.deltaPct.toFixed(1)}%`
            : stats.deltaPct < 0
              ? `${stats.deltaPct.toFixed(1)}%`
              : "0.0%"}{" "}
          vs previous point
        </div>

        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
          <div
            className="h-full rounded-full bg-zinc-950 dark:bg-white"
            style={{ width: `${progress}%` }}
            aria-hidden="true"
          />
        </div>
      </div>

      <div className="w-full rounded-2xl border border-black/5 bg-black/[0.02] p-3 dark:border-white/10 dark:bg-white/[0.03]">
        <Sparkline values={history} label={metric.label} />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="grid place-items-center px-6 py-16 text-center">
      <div className="max-w-sm">
        <div className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-white">
          No metrics yet
        </div>
        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Add some metrics to see live totals, trends, spark lines, and freshness
          indicators here.
        </p>
      </div>
    </div>
  );
}

export function AdminMetrics({ metrics }: Props) {
  const [nowTick, setNowTick] = useState(Date.now());
  const [sortBy, setSortBy] = useState<SortBy>("leader");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const timer = window.setInterval(() => setNowTick(Date.now()), 15000);
    return () => window.clearInterval(timer);
  }, []);

  const enriched = useMemo(() => {
    const filtered = metrics.filter((metric) =>
      metric.label.toLowerCase().includes(query.trim().toLowerCase()),
    );

    const withStats = filtered.map((metric, index) => {
      const history =
        metric.history && metric.history.length ? metric.history : [metric.value];
      return {
        metric,
        index,
        stats: getMetricStats(history),
      };
    });

    withStats.sort((a, b) => {
      if (sortBy === "name") {
        return a.metric.label.localeCompare(b.metric.label);
      }
      if (sortBy === "trend") {
        const deltaDiff = b.stats.delta - a.stats.delta;
        if (deltaDiff !== 0) return deltaDiff;
        return b.metric.value - a.metric.value;
      }

      return b.metric.value - a.metric.value;
    });

    return withStats;
  }, [metrics, query, sortBy]);

  const total = metrics.reduce((sum, item) => sum + item.value, 0);
  const average = metrics.length ? total / metrics.length : 0;

  const leader = metrics.reduce<Metric | null>(
    (best, item) => {
      if (!best) return item;
      return item.value > best.value ? item : best;
    },
    null,
  );

  const rising = metrics.filter((metric) => {
    const history =
      metric.history && metric.history.length ? metric.history : [metric.value];
    return (
      history.length > 1 &&
      (history[history.length - 1] ?? 0) > (history[history.length - 2] ?? 0)
    );
  }).length;

  const falling = metrics.filter((metric) => {
    const history =
      metric.history && metric.history.length ? metric.history : [metric.value];
    return (
      history.length > 1 &&
      (history[history.length - 1] ?? 0) < (history[history.length - 2] ?? 0)
    );
  }).length;

  const combinedHistory = metrics.flatMap((metric) =>
    metric.history && metric.history.length ? metric.history.slice(-12) : [metric.value],
  );

  const freshest = metrics.reduce<Metric | null>((best, metric) => {
    if (!metric.updatedAt) return best;
    if (!best?.updatedAt) return metric;
    return new Date(metric.updatedAt).getTime() > new Date(best.updatedAt).getTime()
      ? metric
      : best;
  }, null);

  const visibleCount = enriched.length;
  const hiddenCount = metrics.length - visibleCount;

  return (
    <section className="overflow-hidden rounded-3xl border border-black/5 bg-white/80 shadow-sm backdrop-blur dark:border-white/10 dark:bg-zinc-950/50">
      <div className="border-b border-black/5 px-4 py-4 sm:px-5 dark:border-white/10">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-white">
                Metrics
              </h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                A live view of the workspace with trends, movement, and freshness.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge tone="primary">{formatNumber(total)} combined</Badge>
              <Badge tone="good">{rising} rising</Badge>
              <Badge tone="warn">{falling} falling</Badge>
              <Badge>{metrics.length} total</Badge>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
            <label className="block">
              <span className="sr-only">Search metrics</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search metrics..."
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-sm text-zinc-950 outline-none ring-0 placeholder:text-zinc-400 focus:border-black/20 dark:border-white/10 dark:bg-zinc-950 dark:text-white dark:placeholder:text-zinc-500"
              />
            </label>

            <label className="block">
              <span className="sr-only">Sort metrics</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-sm text-zinc-950 outline-none focus:border-black/20 dark:border-white/10 dark:bg-zinc-950 dark:text-white"
              >
                <option value="leader">Sort by value</option>
                <option value="trend">Sort by trend</option>
                <option value="name">Sort by name</option>
              </select>
            </label>

            <div className="flex items-center gap-2">
              <Badge tone="primary">{visibleCount} shown</Badge>
              {hiddenCount > 0 ? <Badge>{hiddenCount} hidden</Badge> : null}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-0 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="border-b border-black/5 p-4 sm:p-5 dark:border-white/10 xl:border-b-0 xl:border-r">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Workspace pulse
              </div>
              <div className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white">
                {leader?.label ?? "No leader"}
              </div>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                The strongest signal in the dashboard right now, with a live trend
                line and freshness indicator.
              </p>
            </div>

            <div className="grid min-w-0 gap-2 rounded-2xl border border-black/5 bg-black/[0.02] p-4 text-left dark:border-white/10 dark:bg-white/[0.03] sm:grid-cols-2 lg:min-w-[260px] lg:text-right">
              <div>
                <div className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Current leader
                </div>
                <div className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">
                  {leader ? formatNumber(leader.value, leader.unit) : "—"}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Updated
                </div>
                <div className="mt-1 text-sm font-medium text-zinc-950 dark:text-white">
                  {freshest?.updatedAt
                    ? formatRelativeTime(freshest.updatedAt, nowTick)
                    : "Live"}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-black/5 bg-black/[0.02] p-4 dark:border-white/10 dark:bg-white/[0.03]">
            <Sparkline values={combinedHistory} label="Combined metrics" />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-black/5 p-4 dark:border-white/10">
              <div className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Average
              </div>
              <div className="mt-1 text-lg font-semibold text-zinc-950 dark:text-white">
                {formatNumber(average)}
              </div>
            </div>

            <div className="rounded-2xl border border-black/5 p-4 dark:border-white/10">
              <div className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Rising
              </div>
              <div className="mt-1 text-lg font-semibold text-zinc-950 dark:text-white">
                {rising}
              </div>
            </div>

            <div className="rounded-2xl border border-black/5 p-4 dark:border-white/10">
              <div className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Falling
              </div>
              <div className="mt-1 text-lg font-semibold text-zinc-950 dark:text-white">
                {falling}
              </div>
            </div>

            <div className="rounded-2xl border border-black/5 p-4 dark:border-white/10">
              <div className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Freshest
              </div>
              <div className="mt-1 text-sm font-semibold text-zinc-950 dark:text-white">
                {freshest?.label ?? "—"}
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-0 divide-y divide-black/5 rounded-2xl border border-black/5 dark:divide-white/10 dark:border-white/10">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                Live items
              </span>
              <span className="text-sm font-medium text-zinc-950 dark:text-white">
                {metrics[0]?.value ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                Freshness
              </span>
              <span className="text-sm font-medium text-zinc-950 dark:text-white">
                {metrics[0]?.updatedAt
                  ? formatRelativeTime(metrics[0].updatedAt, nowTick)
                  : "Live"}
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                Trend
              </span>
              <span className="text-sm font-medium text-zinc-950 dark:text-white">
                Active
              </span>
            </div>
          </div>
        </div>

        <div className="p-0">
          <div className="border-b border-black/5 px-4 py-4 sm:px-5 dark:border-white/10">
            <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Snapshot
            </div>
            <div className="mt-1 text-lg font-semibold tracking-tight text-zinc-950 dark:text-white">
              Metric breakdown
            </div>
          </div>

          <div className="divide-y divide-black/5 dark:divide-white/10">
            {enriched.length ? (
              enriched.map(({ metric, index }) => (
                <div key={`${metric.label}-${index}`}>
                  <MetricRow metric={metric} nowTick={nowTick} rank={index + 1} />
                </div>
              ))
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}