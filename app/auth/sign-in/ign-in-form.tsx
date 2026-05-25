"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

type SignInFormProps = {
  nextPath?: string;
  variant?: "page" | "modal";
  open?: boolean;
  onClose?: () => void;
  mode?: AuthMode;
  defaultMode?: AuthMode;
  onModeChange?: (mode: AuthMode) => void;
};

type AuthMode = "sign-in" | "sign-up";
type SignInMethod = "email" | "phone";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        fill="currentColor"
        d="M21.35 11.1H12v2.95h5.36c-.23 1.43-1.47 4.19-5.36 4.19-3.23 0-5.86-2.68-5.86-5.98S8.77 6.28 12 6.28c1.84 0 3.07.78 3.78 1.45l2.58-2.48C16.7 4.1 14.63 3 12 3 6.92 3 2.78 7.14 2.78 12.22S6.92 21.44 12 21.44c6.66 0 9.05-4.67 9.05-7.98 0-.54-.06-.96-.15-1.36z"
      />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        fill="currentColor"
        d="M6.6 10.79a15.2 15.2 0 0 0 6.61 6.61l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.95 21 3 13.05 3 3.99a1 1 0 0 1 1-1h3.47a1 1 0 0 1 1 1c0 1.24.2 2.45.57 3.57a1 1 0 0 1-.24 1.02l-2.2 2.2z"
      />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        fill="currentColor"
        d="M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zm0 2v.4l8 5.33 8-5.33V7H4zm16 10V9.1l-7.45 4.97a1 1 0 0 1-1.1 0L4 9.1V17h16z"
      />
    </svg>
  );
}

export function SignInForm({
  nextPath = "/dashboard",
  variant = "page",
  open = true,
  onClose,
  mode,
  defaultMode = "sign-in",
  onModeChange,
}: SignInFormProps) {
  const router = useRouter();
  const [internalMode, setInternalMode] = useState<AuthMode>(defaultMode);
  const [method, setMethod] = useState<SignInMethod>("email");

  const [identifier, setIdentifier] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentMode = mode ?? internalMode;

  const updateMode = (nextMode: AuthMode) => {
    if (mode === undefined) {
      setInternalMode(nextMode);
    }
    onModeChange?.(nextMode);
  };

  if (variant === "modal" && !open) return null;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (currentMode === "sign-up") {
        if (!signupEmail.trim() || !signupPhone.trim()) {
          throw new Error("Email and phone are required");
        }
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }
      }

      const endpoint =
        currentMode === "sign-in" ? "/api/auth/sign-in" : "/api/auth/sign-up";

      const payload =
        currentMode === "sign-in"
          ? {
              method,
              identifier,
              password,
            }
          : {
              email: signupEmail,
              phone: signupPhone,
              password,
            };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          message?: string;
        } | null;
        throw new Error(data?.message ?? "Authentication failed");
      }

      router.replace(nextPath);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  if (variant === "modal") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/70 px-4 py-4 backdrop-blur-sm">
        <div className="relative w-full max-w-lg max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-3xl border border-white/10 bg-white shadow-2xl dark:bg-zinc-950">
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close sign in form"
              className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 transition hover:bg-zinc-100 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-white/10"
            >
              ×
            </button>
          ) : null}

          <AuthContent
            nextPath={nextPath}
            mode={currentMode}
            setMode={updateMode}
            method={method}
            setMethod={setMethod}
            identifier={identifier}
            setIdentifier={setIdentifier}
            signupEmail={signupEmail}
            setSignupEmail={setSignupEmail}
            signupPhone={signupPhone}
            setSignupPhone={setSignupPhone}
            password={password}
            setPassword={setPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            loading={loading}
            error={error}
            handleSubmit={handleSubmit}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md items-center px-4 py-10">
      <AuthContent
        nextPath={nextPath}
        mode={currentMode}
        setMode={updateMode}
        method={method}
        setMethod={setMethod}
        identifier={identifier}
        setIdentifier={setIdentifier}
        signupEmail={signupEmail}
        setSignupEmail={setSignupEmail}
        signupPhone={signupPhone}
        setSignupPhone={setSignupPhone}
        password={password}
        setPassword={setPassword}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
        loading={loading}
        error={error}
        handleSubmit={handleSubmit}
      />
    </div>
  );
}

type AuthContentProps = {
  nextPath: string;
  mode: AuthMode;
  setMode: (mode: AuthMode) => void;
  method: SignInMethod;
  setMethod: (mode: SignInMethod) => void;
  identifier: string;
  setIdentifier: (value: string) => void;
  signupEmail: string;
  setSignupEmail: (value: string) => void;
  signupPhone: string;
  setSignupPhone: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  loading: boolean;
  error: string | null;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
};

function AuthContent({
  nextPath,
  mode,
  setMode,
  method,
  setMethod,
  identifier,
  setIdentifier,
  signupEmail,
  setSignupEmail,
  signupPhone,
  setSignupPhone,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  loading,
  error,
  handleSubmit,
}: AuthContentProps) {
  const identifierLabel = method === "email" ? "Email" : "Phone number";
  const identifierType = method === "email" ? "email" : "tel";
  const identifierAutoComplete = method === "email" ? "email" : "tel";

  return (
    <div className="w-full">
      <div className="border-b border-zinc-200 px-6 py-5 dark:border-white/10">
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
              {mode === "sign-in" ? "Sign in" : "Create account"}
            </h1>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        <div className="space-y-3">
          <Link
            href={`/auth/google?next=${encodeURIComponent(nextPath)}`}
            className="flex w-full items-center justify-center gap-3 rounded-full border border-zinc-200 bg-zinc-50 px-5 py-3 text-sm font-bold text-zinc-900 transition hover:bg-zinc-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            <GoogleIcon />
            Continue with Google
          </Link>

          <Link
            href={`/auth/credit-cache?next=${encodeURIComponent(nextPath)}`}
            className="flex w-full items-center justify-center gap-3 rounded-full border border-zinc-200 bg-zinc-50 px-5 py-3 text-sm font-bold text-zinc-900 transition hover:bg-zinc-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            <Image
              src="/cc.jpg"
              alt=""
              width={20}
              height={20}
              className="h-5 w-5 rounded-full object-cover"
            />
            Continue with Credit Cache
          </Link>
        </div>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-zinc-200 dark:bg-white/10" />
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
            or
          </span>
          <div className="h-px flex-1 bg-zinc-200 dark:bg-white/10" />
        </div>

        {mode === "sign-in" ? (
          <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl bg-zinc-100 p-1 dark:bg-white/5">
            <button
              type="button"
              onClick={() => setMethod("email")}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                method === "email"
                  ? "bg-white text-zinc-950 shadow-sm dark:bg-zinc-950 dark:text-white"
                  : "text-zinc-600 dark:text-zinc-400"
              }`}
            >
              <EmailIcon />
              Email
            </button>

            <button
              type="button"
              onClick={() => setMethod("phone")}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                method === "phone"
                  ? "bg-white text-zinc-950 shadow-sm dark:bg-zinc-950 dark:text-white"
                  : "text-zinc-600 dark:text-zinc-400"
              }`}
            >
              <PhoneIcon />
              Phone
            </button>
          </div>
        ) : null}

        <div className="space-y-4">
          {mode === "sign-in" ? (
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {identifierLabel}
              </span>
              <input
                type={identifierType}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete={identifierAutoComplete}
                placeholder={method === "email" ? "name@example.com" : "+1 555 000 0000"}
                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-400 dark:border-white/10 dark:bg-zinc-950/40 dark:text-white"
                required
              />
            </label>
          ) : (
            <>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Email
                </span>
                <input
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="name@example.com"
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
                  value={signupPhone}
                  onChange={(e) => setSignupPhone(e.target.value)}
                  autoComplete="tel"
                  placeholder="+1 555 000 0000"
                  className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-400 dark:border-white/10 dark:bg-zinc-950/40 dark:text-white"
                  required
                />
              </label>
            </>
          )}

          <label className="block">
            <div className="mb-1 flex items-center justify-between gap-3">
              <span className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Password
              </span>

              <Link
                href={`/auth/forgot-password?next=${encodeURIComponent(nextPath)}`}
                className="text-xs font-medium text-zinc-500 transition hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
              >
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-400 dark:border-white/10 dark:bg-zinc-950/40 dark:text-white"
              required
            />
          </label>

          {mode === "sign-up" ? (
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Confirm password
              </span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-400 dark:border-white/10 dark:bg-zinc-950/40 dark:text-white"
                required
              />
            </label>
          ) : null}
        </div>

        {error ? (
          <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100"
        >
          {loading ? "Please wait..." : mode === "sign-in" ? "Sign in" : "Create account"}
        </button>

        <button
          type="button"
          onClick={() => setMode(mode === "sign-in" ? "sign-up" : "sign-in")}
          className="mt-4 w-full text-sm font-medium text-zinc-600 transition hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
        >
          {mode === "sign-in"
            ? "Need an account? Create one"
            : "Already have an account? Sign in"}
        </button>
      </form>
    </div>
  );
}