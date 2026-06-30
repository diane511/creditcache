"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type AuthMode = "signin" | "signup";
type IdentifierMode = "email" | "phone";

type AdminAuthFormProps = {
  mode: AuthMode;
  nextPath?: string;
};

type ApiResponse = {
  success?: boolean;
  message?: string;
  code?: string;
  nextPath?: string;
  email?: string;
  verificationRequired?: boolean;
};

function normalizeClientPhone(value: string) {
  const trimmed = value.trim();
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  return hasPlus ? `+${digits}` : digits;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
}

function getPasswordScore(password: string) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/\d]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
}

function getPasswordLabel(score: number) {
  if (score <= 1) return "Weak";
  if (score === 2) return "Fair";
  if (score === 3) return "Good";
  return "Strong";
}

function getFriendlyError(code?: string, fallback?: string) {
  switch (code) {
    case "missing_fields":
      return "Please fill in all required fields.";
    case "invalid_email":
      return "Please enter a valid email address.";
    case "invalid_phone":
      return "Please enter a valid phone number.";
    case "account_not_found":
      return "No account was found for that email or phone number.";
    case "account_exists_email":
      return "An account with this email already exists.";
    case "account_exists_phone":
      return "An account with this phone number already exists.";
    case "account_exists_email_unverified":
      return "An account with this email already exists, but it is not verified yet.";
    case "account_exists_phone_unverified":
      return "An account with this phone number already exists, but it is not verified yet.";
    case "incorrect_password":
      return "Incorrect password.";
    case "email_not_verified":
      return "Please verify your email before signing in.";
    case "admin_access_required":
      return "This account does not have admin access.";
    case "account_locked":
      return "This account is temporarily locked. Try again later.";
    case "weak_password":
      return "Password must be at least 8 characters long and include stronger character variety.";
    case "password_mismatch":
      return "Passwords do not match.";
    case "server_error":
      return "Server validation failed. Please try again.";
    case "verification_required":
      return "Verification email has been sent. Check your inbox.";
    default:
      return fallback ?? "Something went wrong.";
  }
}

export function AdminAuthForm({ mode, nextPath: nextPathProp }: AdminAuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const searchNext = searchParams.get("next");
  const nextPath =
    nextPathProp ??
    searchNext ??
    (mode === "signin"
      ? "/admin"
      : "/admin/ops-7c3a/signin?registered=1");

  const [identifierMode, setIdentifierMode] = useState<IdentifierMode>("email");
  const [identifier, setIdentifier] = useState("");
  const [legalName, setLegalName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordScore = useMemo(() => getPasswordScore(password), [password]);
  const passwordLabel = getPasswordLabel(passwordScore);

  const isSignin = mode === "signin";
  const isSignup = mode === "signup";

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignup) {
        if (!agree) {
          throw new Error("Please agree to the terms before creating your account.");
        }

        if (password !== confirmPassword) {
          throw new Error("Passwords do not match.");
        }
      }

      if (isSignin) {
        const cleanedIdentifier = identifier.trim();

        if (!cleanedIdentifier) {
          throw new Error("Please enter your email or phone number.");
        }

        if (identifierMode === "email" && !isValidEmail(cleanedIdentifier)) {
          throw new Error("Please enter a valid email address.");
        }

        if (identifierMode === "phone") {
          const normalized = normalizeClientPhone(cleanedIdentifier);
          if (!isValidPhone(normalized)) {
            throw new Error("Please enter a valid phone number.");
          }
        }
      }

      if (isSignup) {
        if (!legalName.trim()) throw new Error("Legal name is required.");
        if (!isValidEmail(email.trim())) throw new Error("Please enter a valid email address.");
        if (phone.trim() && !isValidPhone(normalizeClientPhone(phone))) {
          throw new Error("Please enter a valid phone number.");
        }
      }

      const endpoint = isSignin
        ? "/api/admin/auth/signin"
        : "/api/admin/auth/signup";

      const payload = isSignin
        ? {
            identifier: identifier.trim(),
            identifierType: identifierMode,
            password,
            next: nextPath,
          }
        : {
            legalName: legalName.trim(),
            email: email.trim(),
            phone: phone.trim() ? normalizeClientPhone(phone) : undefined,
            password,
            confirmPassword,
            next: nextPath,
          };

      const res = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json().catch(() => null)) as ApiResponse | null;

      if (!res.ok) {
        if (data?.code === "email_not_verified" || data?.code === "verification_required") {
          router.replace(data?.nextPath ?? "/auth/verify-email");
          router.refresh();
          return;
        }

        const message = getFriendlyError(data?.code, data?.message);
        throw new Error(message);
      }

      if (data?.code === "verification_required" || data?.verificationRequired) {
        router.replace(data?.nextPath ?? "/auth/verify-email");
        router.refresh();
        return;
      }

      router.replace(data?.nextPath ?? nextPath);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full bg-zinc-50 text-zinc-950 dark:bg-zinc-900 dark:text-white">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-12">
        <section className="flex flex-col justify-center">
          <div className="mb-6 inline-flex w-fit items-center gap-3 rounded-full border border-zinc-200 bg-white px-4 py-2 shadow-sm dark:border-white/10 dark:bg-white/5">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-white/10">
              <Image
                src="/cc.jpg"
                alt="Credit Cache logo"
                width={40}
                height={40}
                className="h-10 w-10 object-cover"
                priority
              />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400">
                Credit Cache
              </p>
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {isSignin ? "Admin Access" : "Admin Registration"}
              </p>
            </div>
          </div>

          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">
              {isSignin ? "Welcome back" : "Get started"}
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-zinc-950 dark:text-white sm:text-5xl">
              {isSignin ? "Continue from where you left off." : "Create your admin account."}
            </h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-zinc-600 dark:text-zinc-400">
              {isSignin
                ? "Sign in to access your Credit Cache admin dashboard, manage activity, and keep everything moving from one clean workspace."
                : "Register with your email, verify it, and then sign in to the admin dashboard."}
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
                <p className="text-sm font-semibold text-zinc-950 dark:text-white">
                  Secure access
                </p>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  Protected sign-in flow.
                </p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
                <p className="text-sm font-semibold text-zinc-950 dark:text-white">
                  Clean workflow
                </p>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  Fast admin onboarding.
                </p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
                <p className="text-sm font-semibold text-zinc-950 dark:text-white">
                  Responsive UI
                </p>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  Looks great on all screens.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex justify-center lg:justify-end">
          <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl dark:border-white/10 dark:bg-zinc-950">
            <div className="border-b border-zinc-200 px-6 py-5 dark:border-white/10 sm:px-8">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-white/10">
                  <Image
                    src="/cc.jpg"
                    alt="Credit Cache logo"
                    width={48}
                    height={48}
                    className="h-10 w-10 object-cover"
                    priority
                  />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                    Credit Cache
                  </p>
                  <h1 className="text-xl font-black tracking-tight text-zinc-950 dark:text-white">
                    {isSignin ? "Admin sign in" : "Admin sign up"}
                  </h1>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 sm:p-8">
              <div className="space-y-4">
                {isSignin ? (
                  <>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setIdentifierMode("email")}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                          identifierMode === "email"
                            ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950"
                            : "border border-zinc-200 text-zinc-700 dark:border-white/10 dark:text-zinc-300"
                        }`}
                      >
                        Email
                      </button>
                      <button
                        type="button"
                        onClick={() => setIdentifierMode("phone")}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                          identifierMode === "phone"
                            ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950"
                            : "border border-zinc-200 text-zinc-700 dark:border-white/10 dark:text-zinc-300"
                        }`}
                      >
                        Phone
                      </button>
                    </div>

                    <label className="block">
                      <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        {identifierMode === "email" ? "Email" : "Phone number"}
                      </span>
                      <input
                        type={identifierMode === "email" ? "email" : "tel"}
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        autoComplete="username"
                        placeholder={identifierMode === "email" ? "admin@example.com" : "+1234567890"}
                        className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-400 dark:border-white/10 dark:bg-zinc-950/40 dark:text-white"
                        required
                      />
                    </label>
                  </>
                ) : (
                  <>
                    <label className="block">
                      <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Legal name
                      </span>
                      <input
                        type="text"
                        value={legalName}
                        onChange={(e) => setLegalName(e.target.value)}
                        autoComplete="name"
                        placeholder="Lee Crase"
                        className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-400 dark:border-white/10 dark:bg-zinc-950/40 dark:text-white"
                        required
                      />
                    </label>

                    <label className="block">
                      <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Email
                      </span>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        placeholder="admin@example.com"
                        className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-400 dark:border-white/10 dark:bg-zinc-950/40 dark:text-white"
                        required
                      />
                    </label>

                    <label className="block">
                      <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Phone number
                      </span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        autoComplete="tel"
                        placeholder="+1234567890"
                        className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-400 dark:border-white/10 dark:bg-zinc-950/40 dark:text-white"
                      />
                    </label>
                  </>
                )}

                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Password
                  </span>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete={isSignin ? "current-password" : "new-password"}
                      className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 pr-24 text-zinc-950 outline-none transition focus:border-zinc-400 dark:border-white/10 dark:bg-zinc-950/40 dark:text-white"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-2 my-auto rounded-full px-3 text-xs font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/10"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>

                  {isSignup ? (
                    <div className="mt-2">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-white/10">
                        <div
                          className="h-full rounded-full bg-zinc-950 dark:bg-white"
                          style={{ width: `${Math.max(20, passwordScore * 20)}%` }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        Password strength: {passwordLabel}
                      </p>
                    </div>
                  ) : null}
                </label>

                {isSignup ? (
                  <>
                    <label className="block">
                      <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Confirm password
                      </span>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          autoComplete="new-password"
                          className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 pr-24 text-zinc-950 outline-none transition focus:border-zinc-400 dark:border-white/10 dark:bg-zinc-950/40 dark:text-white"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword((prev) => !prev)}
                          className="absolute inset-y-0 right-2 my-auto rounded-full px-3 text-xs font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/10"
                        >
                          {showConfirmPassword ? "Hide" : "Show"}
                        </button>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
                      <input
                        type="checkbox"
                        checked={agree}
                        onChange={(e) => setAgree(e.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-zinc-300"
                        required
                      />
                      <span>
                        I confirm that this is an admin account and I will keep the credentials secure.
                      </span>
                    </label>
                  </>
                ) : null}
              </div>

              {error ? (
                <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                  {error}
                </p>
              ) : null}

              <div className="mt-4 flex items-center justify-between gap-4 text-sm">
                {isSignin ? (
                  <>
                    <Link
                      href="/admin/ops-7c3a/signup"
                      className="font-medium text-zinc-700 underline decoration-zinc-300 underline-offset-4 transition hover:text-zinc-950 dark:text-zinc-300 dark:decoration-zinc-600 dark:hover:text-white"
                    >
                      Create admin account
                    </Link>

                    <Link
                      href="/auth/forgot-password"
                      className="font-medium text-zinc-700 underline decoration-zinc-300 underline-offset-4 transition hover:text-zinc-950 dark:text-zinc-300 dark:decoration-zinc-600 dark:hover:text-white"
                    >
                      Forgot password?
                    </Link>
                  </>
                ) : (
                  <Link
                    href="/admin/ops-7c3a/signin"
                    className="font-medium text-zinc-700 underline decoration-zinc-300 underline-offset-4 transition hover:text-zinc-950 dark:text-zinc-300 dark:decoration-zinc-600 dark:hover:text-white"
                  >
                    Back to sign in
                  </Link>
                )}
              </div>

              <p className="mt-4 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                {isSignin
                  ? "Only users with ADMIN or SUPER_ADMIN roles can access this area."
                  : "A verification email will be required before the account can sign in."}
              </p>

              <button
                type="submit"
                disabled={loading}
                className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100"
              >
                {loading
                  ? isSignin
                    ? "Please wait..."
                    : "Creating account..."
                  : isSignin
                    ? "Admin sign in"
                    : "Create admin account"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}