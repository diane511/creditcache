import Link from "next/link";
import type { ReactNode } from "react";

type AuthShellProps = {
  badge: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthShell({ badge, title, description, children }: AuthShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.22),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.16),_transparent_32%)]" />
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:56px_56px]" />

      <div className="relative mx-auto grid min-h-screen w-full max-w-6xl items-center gap-10 px-4 py-8 md:px-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="max-w-xl lg:py-10">
          <Link href="/auth/sign-in" className="inline-flex items-center gap-2 text-sm text-slate-300 transition hover:text-white">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5">
              ←
            </span>
            Back to sign in
          </Link>

          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-emerald-300" />
            {badge}
          </div>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white md:text-6xl">
            {title}
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-300">
            {description}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              ["Fast", "One clean flow"],
              ["Secure", "Token + session protection"],
              ["Polished", "Built to feel premium"],
            ].map(([label, copy]) => (
              <div
                key={label}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/10 backdrop-blur"
              >
                <p className="text-sm font-medium text-white">{label}</p>
                <p className="mt-1 text-sm leading-6 text-slate-300">{copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/8 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/80 p-6 sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
                  <span className="text-xl">✦</span>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Account security</p>
                  <p className="font-medium text-white">{badge}</p>
                </div>
              </div>
            </div>

            {children}
          </div>
        </section>
      </div>
    </main>
  );
}