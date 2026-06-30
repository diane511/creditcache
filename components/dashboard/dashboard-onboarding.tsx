"use client";

import { useMemo, useState } from "react";
import type { ProfileFormData, SubmitProfileResult } from "./dashboard-types";

type DashboardOnboardingProps = {
  firstName: string;
  initialLegalName: string;
  initialDateOfBirth: string;
  initialUsername: string;
  suggestedUsernames: string[];
  onSubmit: (data: ProfileFormData) => Promise<SubmitProfileResult>;
  onComplete: () => void;
  onCancel?: () => void;
};

function StepLabel({ active, children }: { active: boolean; children: string }) {
  return (
    <span
      className={[
        "rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] transition-all duration-300 ease-out",
        active
          ? "bg-zinc-950 text-white shadow-sm dark:bg-white dark:text-zinc-950"
          : "bg-zinc-100 text-zinc-500 dark:bg-white/10 dark:text-zinc-400",
      ].join(" ")}
    >
      {children}
    </span>
  );
}

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
      <path
        d="M15 18l-6-6 6-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WelcomeIllustration() {
  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-black/5 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 p-4 shadow-sm dark:border-white/10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.18),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(255,255,255,0.08),_transparent_30%)]" />
      <div className="relative grid gap-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="h-2.5 w-24 rounded-full bg-white/20" />
            <div className="h-2 w-32 rounded-full bg-white/12" />
          </div>
          <div className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/80">
            Step 1 of 3
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-2xl border border-white/10 bg-white/8 p-2 text-white">
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-white/60" />
              <div className="h-2 w-16 rounded-full bg-white/20" />
            </div>
            <div className="space-y-2">
              <div className="h-2 w-full rounded-full bg-white/14" />
              <div className="h-2 w-4/5 rounded-full bg-white/14" />
              <div className="h-2 w-2/3 rounded-full bg-white/14" />
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/8 p-2 text-white">
            <div className="mb-2 flex items-center justify-between">
              <div className="h-2 w-12 rounded-full bg-white/20" />
              <div className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-[9px] font-semibold text-emerald-200">
                Ready
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-end gap-1">
                <span className="h-4 w-2 rounded-full bg-white/25" />
                <span className="h-7 w-2 rounded-full bg-white/35" />
                <span className="h-10 w-2 rounded-full bg-white/45" />
                <span className="h-6 w-2 rounded-full bg-white/30" />
              </div>
              <div className="h-2 w-20 rounded-full bg-white/14" />
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/8 p-2 text-white">
            <div className="h-2 w-14 rounded-full bg-white/20" />
            <div className="mt-2 space-y-2">
              <div className="rounded-xl bg-white/10 px-2 py-1 text-[10px] text-white/80">
                Profile
              </div>
              <div className="rounded-xl bg-white/10 px-2 py-1 text-[10px] text-white/80">
                Updates
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/8 px-3 py-2 text-white">
          <div className="space-y-1">
            <div className="h-2 w-20 rounded-full bg-white/20" />
            <div className="h-2 w-28 rounded-full bg-white/12" />
          </div>
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-white/40" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/25" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          </div>
        </div>
      </div>
    </div>
  );
}

function OpportunitiesIllustration() {
  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-black/5 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-950">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0,transparent_18px,rgba(0,0,0,0.03)_18px,rgba(0,0,0,0.03)_19px,transparent_19px),linear-gradient(to_bottom,transparent_0,transparent_18px,rgba(0,0,0,0.03)_18px,rgba(0,0,0,0.03)_19px,transparent_19px)] bg-[size:20px_20px] dark:bg-[linear-gradient(to_right,transparent_0,transparent_18px,rgba(255,255,255,0.04)_18px,rgba(255,255,255,0.04)_19px,transparent_19px),linear-gradient(to_bottom,transparent_0,transparent_18px,rgba(255,255,255,0.04)_18px,rgba(255,255,255,0.04)_19px,transparent_19px)]" />
      <div className="relative grid gap-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="h-2.5 w-28 rounded-full bg-zinc-300 dark:bg-white/15" />
            <div className="h-2 w-36 rounded-full bg-zinc-200 dark:bg-white/10" />
          </div>
          <div className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400">
            Matches
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-2 dark:border-white/10 dark:bg-white/5">
            <div className="mb-2 flex items-center justify-between">
              <div className="h-2 w-14 rounded-full bg-zinc-300 dark:bg-white/15" />
              <div className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-semibold text-emerald-600 dark:text-emerald-300">
                96% match
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-2 w-full rounded-full bg-zinc-200 dark:bg-white/10" />
              <div className="h-2 w-4/5 rounded-full bg-zinc-200 dark:bg-white/10" />
              <div className="flex items-center justify-between pt-1">
                <div className="h-2 w-16 rounded-full bg-zinc-200 dark:bg-white/10" />
                <div className="h-5 w-10 rounded-full bg-zinc-950 dark:bg-white" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-2 dark:border-white/10 dark:bg-white/5">
            <div className="mb-2 flex items-center justify-between">
              <div className="h-2 w-12 rounded-full bg-zinc-300 dark:bg-white/15" />
              <div className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[9px] font-semibold text-amber-600 dark:text-amber-300">
                Due soon
              </div>
            </div>
            <div className="flex h-14 items-end gap-1">
              <span className="h-5 w-2 rounded-full bg-zinc-300 dark:bg-white/20" />
              <span className="h-8 w-2 rounded-full bg-zinc-300 dark:bg-white/20" />
              <span className="h-12 w-2 rounded-full bg-zinc-300 dark:bg-white/20" />
              <span className="h-7 w-2 rounded-full bg-zinc-300 dark:bg-white/20" />
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-2 dark:border-white/10 dark:bg-white/5">
            <div className="h-2 w-14 rounded-full bg-zinc-300 dark:bg-white/15" />
            <div className="mt-2 space-y-2">
              <div className="rounded-xl bg-zinc-200 px-2 py-1.5 text-[10px] text-zinc-600 dark:bg-white/10 dark:text-zinc-300">
                Review later
              </div>
              <div className="rounded-xl bg-zinc-200 px-2 py-1.5 text-[10px] text-zinc-600 dark:bg-white/10 dark:text-zinc-300">
                Clear details
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-white/10 dark:bg-white/5">
          <div className="space-y-1">
            <div className="h-2 w-24 rounded-full bg-zinc-300 dark:bg-white/15" />
            <div className="h-2 w-32 rounded-full bg-zinc-200 dark:bg-white/10" />
          </div>
          <div className="rounded-full bg-zinc-950 px-3 py-1 text-[10px] font-semibold text-white dark:bg-white dark:text-zinc-950">
            Open queue
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardOnboarding({
  firstName,
  initialLegalName,
  initialDateOfBirth,
  initialUsername,
  suggestedUsernames,
  onSubmit,
  onComplete,
  onCancel,
}: DashboardOnboardingProps) {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [saving, setSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    legalName: initialLegalName,
    dateOfBirth: initialDateOfBirth,
    username: initialUsername,
  });

  const progress = useMemo(() => ((step + 1) / 3) * 100, [step]);

  async function handleFinish() {
    setSaving(true);
    setProfileError(null);
    setProfileMessage(null);

    try {
      const res = await onSubmit(profileForm);

      if (!res?.success) {
        if (res?.code === "USERNAME_TAKEN" && Array.isArray(res?.suggestions) && res.suggestions.length) {
          setProfileError(res.message ?? "That username is already taken.");
          setProfileForm((current) => ({
            ...current,
            username: res.suggestions?.[0] ?? current.username,
          }));
          return;
        }

        setProfileError(res?.message ?? "Could not save your profile.");
        return;
      }

      setProfileMessage(res.message ?? "Done.");
      onComplete();
    } catch {
      setProfileError("Could not save your profile.");
    } finally {
      setSaving(false);
    }
  }

  const showBack = step > 0;
  const showSkip = step < 2 && Boolean(onCancel);
  const primaryLabel = step === 2 ? (saving ? "Saving..." : "Finish") : "Next";

  return (
    <section className="w-full border-b border-zinc-200 bg-white px-4 py-6 text-zinc-950 dark:border-white/10 dark:bg-zinc-950 dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-3xl">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex gap-2">
              {showBack ? (
                <button
                  type="button"
                  onClick={() =>
                    setStep((current) => (current > 0 ? ((current - 1) as 0 | 1 | 2) : current))
                  }
                  aria-label="Back"
                  className="inline-flex items-center justify-center rounded-full border border-zinc-200 p-2 text-zinc-700 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-zinc-50 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/5"
                >
                  <BackIcon />
                </button>
              ) : null}

              {showSkip ? (
                <button
                  type="button"
                  onClick={onCancel}
                  className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-zinc-50 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/5"
                >
                  Skip
                </button>
              ) : null}
            </div>

            <button
              type="button"
              onClick={step === 2 ? handleFinish : () => setStep((current) => ((current + 1) as 0 | 1 | 2))}
              disabled={step === 2 && saving}
              className="rounded-full bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100"
            >
              {primaryLabel}
            </button>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-white/10">
            <div
              className="h-2 rounded-full bg-zinc-950 transition-all duration-300 ease-out dark:bg-white"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div key={step} className="mt-6 space-y-6 animate-[dashboardFadeIn_.22s_ease-out]">
          {step === 0 ? (
            <div className="space-y-4">
              <WelcomeIllustration />

              <div className="space-y-2 transition-all duration-300 ease-out">
                <h2 className="text-xl font-bold tracking-tight transition-all duration-300 ease-out sm:text-2xl">
                  Getting started with Credit Cache.
                </h2>
                <p className="text-sm leading-6 text-zinc-600 transition-all duration-300 ease-out dark:text-zinc-300">
                  A simple place for your account, updates, and next steps.
                </p>
              </div>

              <div className="grid gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                <div className="rounded-2xl border border-zinc-200 px-4 py-3 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-zinc-300 dark:border-white/10 dark:hover:border-white/20">
                  Set up your profile
                </div>
                <div className="rounded-2xl border border-zinc-200 px-4 py-3 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-zinc-300 dark:border-white/10 dark:hover:border-white/20">
                  Track what matters
                </div>
                <div className="rounded-2xl border border-zinc-200 px-4 py-3 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-zinc-300 dark:border-white/10 dark:hover:border-white/20">
                  Move through the dashboard fast
                </div>
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="space-y-4">
              <OpportunitiesIllustration />

              <div className="space-y-2 transition-all duration-300 ease-out">
                <h2 className="text-xl font-bold tracking-tight transition-all duration-300 ease-out sm:text-2xl">
                  Opportunities made simple.
                </h2>
                <p className="text-sm leading-6 text-zinc-600 transition-all duration-300 ease-out dark:text-zinc-300">
                  Credit Cache highlights matched opportunities so you can review them quickly.
                </p>
              </div>

              <div className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
                <div className="rounded-2xl border border-zinc-200 px-4 py-3 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-zinc-300 dark:border-white/10 dark:hover:border-white/20">
                  Matched opportunities first
                </div>
                <div className="rounded-2xl border border-zinc-200 px-4 py-3 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-zinc-300 dark:border-white/10 dark:hover:border-white/20">
                  Clear deadlines and details
                </div>
                <div className="rounded-2xl border border-zinc-200 px-4 py-3 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-zinc-300 dark:border-white/10 dark:hover:border-white/20">
                  Save and review later
                </div>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-4">
              <div className="space-y-2 transition-all duration-300 ease-out">
                <h2 className="text-xl font-bold tracking-tight transition-all duration-300 ease-out sm:text-2xl">
                  Finish your profile.
                </h2>
                <p className="text-sm leading-6 text-zinc-600 transition-all duration-300 ease-out dark:text-zinc-300">
                  Add your details and you are done.
                </p>
              </div>

              <div className="space-y-4">
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-zinc-700 transition-all duration-300 ease-out dark:text-zinc-300">
                    Legal name
                  </span>
                  <input
                    value={profileForm.legalName}
                    onChange={(e) =>
                      setProfileForm((current) => ({
                        ...current,
                        legalName: e.target.value,
                      }))
                    }
                    placeholder="Your full legal name"
                    className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-zinc-950 outline-none transition-all duration-200 ease-out placeholder:text-zinc-400 focus:-translate-y-0.5 focus:border-zinc-400 dark:border-white/10 dark:bg-zinc-950/40 dark:text-white dark:focus:border-white/20"
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-zinc-700 transition-all duration-300 ease-out dark:text-zinc-300">
                    Date of birth
                  </span>
                  <input
                    type="date"
                    value={profileForm.dateOfBirth}
                    onChange={(e) =>
                      setProfileForm((current) => ({
                        ...current,
                        dateOfBirth: e.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-zinc-950 outline-none transition-all duration-200 ease-out focus:-translate-y-0.5 focus:border-zinc-400 dark:border-white/10 dark:bg-zinc-950/40 dark:text-white dark:focus:border-white/20"
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-zinc-700 transition-all duration-300 ease-out dark:text-zinc-300">
                    Username
                  </span>
                  <input
                    value={profileForm.username}
                    onChange={(e) =>
                      setProfileForm((current) => ({
                        ...current,
                        username: e.target.value,
                      }))
                    }
                    placeholder={suggestedUsernames[0] || "credit.cache"}
                    className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-zinc-950 outline-none transition-all duration-200 ease-out placeholder:text-zinc-400 focus:-translate-y-0.5 focus:border-zinc-400 dark:border-white/10 dark:bg-zinc-950/40 dark:text-white dark:focus:border-white/20"
                  />
                </label>

                <div className="flex flex-wrap gap-2">
                  {suggestedUsernames.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() =>
                        setProfileForm((current) => ({
                          ...current,
                          username: item,
                        }))
                      }
                      className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-zinc-50 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/10"
                    >
                      {item}
                    </button>
                  ))}
                </div>

                {profileError ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 transition-all duration-300 ease-out dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
                    {profileError}
                  </div>
                ) : null}

                {profileMessage ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 transition-all duration-300 ease-out dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
                    {profileMessage}
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <style jsx global>{`
        @keyframes dashboardFadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}