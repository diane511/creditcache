"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

type ParallaxScrollViewProps = {
  badge?: string;
  title: string;
  subtitle?: string;
  hero?: ReactNode;
  rightAction?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function ParallaxScrollView({
  badge,
  title,
  subtitle,
  hero,
  rightAction,
  children,
  className = "",
}: ParallaxScrollViewProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    let raf = 0;

    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const maxScroll = Math.max(1, 320);
        setProgress(Math.min(1, el.scrollTop / maxScroll));
      });
    };

    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      cancelAnimationFrame(raf);
    };
  }, []);

  const heroTranslateY = progress * -34;
  const heroScale = 1 - progress * 0.05;
  const sheetLift = Math.min(18, progress * 18);

  return (
    <div
      className={[
        "relative h-[100dvh] overflow-hidden",
        "bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50",
        className,
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-[-5rem] h-72 w-72 rounded-full bg-sky-400/20 blur-3xl dark:bg-sky-500/10" />
        <div className="absolute right-[-6rem] top-16 h-80 w-80 rounded-full bg-violet-400/15 blur-3xl dark:bg-violet-500/10" />
        <div className="absolute bottom-[-7rem] left-1/3 h-80 w-80 rounded-full bg-emerald-400/15 blur-3xl dark:bg-emerald-500/10" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.84),rgba(255,255,255,0.62),rgba(255,255,255,0.28))] dark:bg-[linear-gradient(to_bottom,rgba(2,6,23,0.9),rgba(2,6,23,0.74),rgba(2,6,23,0.42))]" />
      </div>

      <div
        ref={scrollerRef}
        className="relative z-10 h-full overflow-y-auto overscroll-contain"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div className="mx-auto w-full max-w-7xl px-4 pb-10 pt-5 sm:px-6 lg:px-8">
          <section
            className="relative min-h-[36vh] pb-20 pt-2 sm:min-h-[38vh] sm:pb-24"
            style={{
              transform: `translateY(${heroTranslateY}px) scale(${heroScale})`,
              transformOrigin: "center top",
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                {badge ? (
                  <div className="inline-flex items-center rounded-full border border-slate-200/80 bg-white/75 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-600 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                    {badge}
                  </div>
                ) : null}

                <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-5xl">
                  {title}
                </h1>

                {subtitle ? (
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
                    {subtitle}
                  </p>
                ) : null}
              </div>

              {rightAction ? (
                <div className="shrink-0 pt-1" style={{ opacity: 1 - Math.min(1, progress * 1.15) }}>
                  {rightAction}
                </div>
              ) : null}
            </div>

            {hero ? (
              <div
                className="mt-6"
                style={{
                  transform: `translateY(${Math.max(0, progress * 8)}px)`,
                }}
              >
                {hero}
              </div>
            ) : null}
          </section>

          <section
            className={[
              "relative z-20 -mt-10 rounded-t-[34px] rounded-b-none border border-b-0",
              "border-slate-200/80 bg-white/88 shadow-[0_28px_80px_rgba(15,23,42,0.10)] backdrop-blur-xl",
              "dark:border-white/10 dark:bg-slate-950/88 dark:shadow-[0_28px_80px_rgba(0,0,0,0.28)]",
              "pb-10 pt-6 sm:pt-7",
            ].join(" ")}
            style={{
              transform: `translateY(${sheetLift}px)`,
            }}
          >
            <div className="px-4 sm:px-6 lg:px-8">{children}</div>
          </section>
        </div>
      </div>
    </div>
  );
}