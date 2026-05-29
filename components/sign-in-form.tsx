"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

type AuthMode = "signin" | "signup";
type SignInMethod = "email" | "phone";

type SignInFormProps = {
  nextPath?: string;
  variant?: "page" | "modal";
  open?: boolean;
  onClose?: () => void;
  mode?: AuthMode;
  defaultMode?: AuthMode;
  onModeChange?: (mode: AuthMode) => void;
};

const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "10minutemail.com",
  "10minutemail.net",
  "10minutemail.org",
  "mailinator.com",
  "guerrillamail.com",
  "yopmail.com",
  "trashmail.com",
  "tempmail.com",
  "temp-mail.org",
  "getnada.com",
  "moakt.com",
  "sharklasers.com",
  "mintemail.com",
  "maildrop.cc",
  "dispostable.com",
  "fakeinbox.com",
  "emailondeck.com",
  "mailnesia.com",
  "throwawaymail.com",
  "sharklasers.com",
]);

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

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path
        fill="currentColor"
        d="M12 5c5.5 0 9.7 4 10.8 6.5a1.3 1.3 0 0 1 0 1C21.7 15 17.5 19 12 19S2.3 15 1.2 12.5a1.3 1.3 0 0 1 0-1C2.3 9 6.5 5 12 5Zm0 2C8 7 4.7 9.8 3.6 12c1.1 2.2 4.4 5 8.4 5s7.3-2.8 8.4-5C19.3 9.8 16 7 12 7Zm0 1.8A3.2 3.2 0 1 1 12 15a3.2 3.2 0 0 1 0-6.2Zm0 2A1.2 1.2 0 1 0 12 13a1.2 1.2 0 0 0 0-2.4Z"
      />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path
        fill="currentColor"
        d="M3.7 2.3 2.3 3.7l3 3C3.1 8.4 1.8 10.3 1.2 12.5a1.3 1.3 0 0 0 0 1C2.3 16 6.5 20 12 20c2 0 3.8-.4 5.4-1.2l2.9 2.9 1.4-1.4L3.7 2.3Zm8.3 15.7c-4 0-7.3-2.8-8.4-5 .5-1 1.3-2.2 2.4-3.2l2 2a3.2 3.2 0 0 0 4.2 4.2l1.7 1.7c-.6.2-1.2.3-1.9.3Zm.7-5.2a1.2 1.2 0 0 1-1.5-1.5l1.5 1.5Zm9.3-5.8C20.7 8 16.6 4 12 4c-1.1 0-2.2.2-3.2.5l1.7 1.7A6.8 6.8 0 0 1 12 6c4 0 7.3 2.8 8.4 5-.4.8-1 1.7-1.8 2.5l1.4 1.4c1.1-1.2 1.8-2.4 2-3.4a1.3 1.3 0 0 0 0-1ZM12 8.8a3.2 3.2 0 0 1 3.2 3.2c0 .4-.1.8-.2 1.1l-4.1-4.1c.3-.1.7-.2 1.1-.2Z"
      />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        fill="currentColor"
        d="M12 2 1 21h22L12 2Zm0 6a1 1 0 0 1 1 1v5a1 1 0 1 1-2 0V9a1 1 0 0 1 1-1Zm0 10.2a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4Z"
      />
    </svg>
  );
}

function normalizePhoneValue(value: string) {
  return value.trim().replace(/[^\d+()\s-]/g, "");
}

function countDigits(value: string) {
  return (value.match(/\d/g) ?? []).length;
}

function isValidEmail(email: string) {
  const value = email.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

function getEmailDomain(email: string) {
  return email.trim().toLowerCase().split("@")[1] ?? "";
}

function isDisposableEmail(email: string) {
  const domain = getEmailDomain(email);
  if (!domain) return false;

  for (const disposableDomain of DISPOSABLE_EMAIL_DOMAINS) {
    if (domain === disposableDomain || domain.endsWith(`.${disposableDomain}`)) {
      return true;
    }
  }

  return false;
}

function isProbablyPhone(value: string) {
  const digits = countDigits(value);
  return digits >= 8 && digits <= 15;
}

function normalizeAuthError(message?: string) {
  const raw = (message ?? "Authentication failed").trim();
  const lower = raw.toLowerCase();

  if (
    lower.includes("verify your email") ||
    lower.includes("email not verified") ||
    lower.includes("account not verified") ||
    lower.includes("email verification") ||
    lower.includes("please verify your email") ||
    lower.includes("confirm your email")
  ) {
    return "The email/phone or password is incorrect.";
  }

  if (
    (lower.includes("phone") || lower.includes("mobile")) &&
    (lower.includes("already") ||
      lower.includes("exists") ||
      lower.includes("taken") ||
      lower.includes("used"))
  ) {
    return "That phone number is already in use. Try another one.";
  }

  if (
    lower.includes("email") &&
    (lower.includes("already") ||
      lower.includes("exists") ||
      lower.includes("taken") ||
      lower.includes("used"))
  ) {
    return "That email address is already in use. Try another one.";
  }

  if (
    lower.includes("temporary") ||
    lower.includes("disposable") ||
    lower.includes("throwaway") ||
    lower.includes("temp mail")
  ) {
    return "Temporary email addresses are not allowed. Please use a real inbox.";
  }

  if (lower.includes("invalid credentials") || lower.includes("wrong password")) {
    return "The email/phone or password is incorrect.";
  }

  if (lower.includes("password") && lower.includes("weak")) {
    return "Your password is too weak. Use at least 8 characters with upper and lower case letters and a number.";
  }

  return raw;
}

export function SignInForm({
  nextPath = "/dashboard",
  variant = "page",
  open = true,
  onClose,
  mode,
  defaultMode = "signin",
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

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const currentMode = mode ?? internalMode;

  const updateMode = (nextMode: AuthMode) => {
    if (mode === undefined) {
      setInternalMode(nextMode);
    }
    onModeChange?.(nextMode);
    setErrors([]);
  };

  if (variant === "modal" && !open) return null;

  function validateBeforeSubmit() {
    const nextErrors: string[] = [];

    if (currentMode === "signin") {
      const value = identifier.trim();

      if (!value) {
        nextErrors.push(
          method === "email"
            ? "Please enter your email address."
            : "Please enter your phone number."
        );
      } else if (method === "email") {
        if (!isValidEmail(value)) {
          nextErrors.push("Please enter a valid email address, like name@example.com.");
        }
      } else if (!isProbablyPhone(value)) {
        nextErrors.push("Please enter a valid phone number with 8 to 15 digits.");
      }

      if (!password.trim()) {
        nextErrors.push("Please enter your password.");
      } else if (password.length < 8) {
        nextErrors.push("Password must be at least 8 characters long.");
      }
    }

    if (currentMode === "signup") {
      const email = signupEmail.trim();
      const phone = signupPhone.trim();

      if (!email) {
        nextErrors.push("Please enter an email address.");
      } else {
        if (!isValidEmail(email)) {
          nextErrors.push("Please enter a valid email address, like name@example.com.");
        }
        if (isDisposableEmail(email)) {
          nextErrors.push("Temporary email addresses are not allowed. Please use a real inbox.");
        }
      }

      if (!phone) {
        nextErrors.push("Please enter a phone number.");
      } else if (!isProbablyPhone(phone)) {
        nextErrors.push("Please enter a valid phone number with 8 to 15 digits.");
      }

      if (!password.trim()) {
        nextErrors.push("Please enter a password.");
      } else {
        if (password.length < 8) {
          nextErrors.push("Password must be at least 8 characters long.");
        }
        if (!/[a-z]/.test(password)) {
          nextErrors.push("Password must include at least one lowercase letter.");
        }
        if (!/[A-Z]/.test(password)) {
          nextErrors.push("Password must include at least one uppercase letter.");
        }
        if (!/\d/.test(password)) {
          nextErrors.push("Password must include at least one number.");
        }
      }

      if (!confirmPassword.trim()) {
        nextErrors.push("Please confirm your password.");
      } else if (password !== confirmPassword) {
        nextErrors.push("Passwords do not match.");
      }
    }

    return nextErrors;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrors([]);

    try {
      const validationErrors = validateBeforeSubmit();
      if (validationErrors.length) {
        setErrors(validationErrors);
        return;
      }

      const endpoint =
        currentMode === "signin" ? "/api/auth/signin" : "/api/auth/signup";

      const payload =
        currentMode === "signin"
          ? {
              method,
              identifier: identifier.trim(),
              password,
            }
          : {
              email: signupEmail.trim(),
              phone: normalizePhoneValue(signupPhone),
              password,
            };

      const res = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json().catch(() => null)) as {
        message?: string;
        verifyUrl?: string;
      } | null;

      if (!res.ok) {
        throw new Error(normalizeAuthError(data?.message));
      }

      if (currentMode === "signup" && data?.verifyUrl) {
        router.replace(data.verifyUrl);
        router.refresh();
        return;
      }

      window.location.href = nextPath;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Authentication failed";
      setErrors([normalizeAuthError(message)]);
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
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            showConfirmPassword={showConfirmPassword}
            setShowConfirmPassword={setShowConfirmPassword}
            loading={loading}
            errors={errors}
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
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        showConfirmPassword={showConfirmPassword}
        setShowConfirmPassword={setShowConfirmPassword}
        loading={loading}
        errors={errors}
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
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (value: boolean) => void;
  loading: boolean;
  errors: string[];
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
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  loading,
  errors,
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
              {mode === "signin" ? "Sign in" : "Create account"}
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

        {mode === "signin" ? (
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
          {mode === "signin" ? (
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {identifierLabel}
              </span>
              <input
                type={identifierType}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete={identifierAutoComplete}
                autoCapitalize="none"
                spellCheck={false}
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
                  autoCapitalize="none"
                  spellCheck={false}
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
                  autoCapitalize="none"
                  spellCheck={false}
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

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 pr-12 text-zinc-950 outline-none transition focus:border-zinc-400 dark:border-white/10 dark:bg-zinc-950/40 dark:text-white"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white"
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </label>

          {mode === "signup" ? (
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
                  className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 pr-12 text-zinc-950 outline-none transition focus:border-zinc-400 dark:border-white/10 dark:bg-zinc-950/40 dark:text-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={
                    showConfirmPassword ? "Hide confirm password" : "Show confirm password"
                  }
                  aria-pressed={showConfirmPassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </label>
          ) : null}
        </div>

        {errors.length ? (
          <div
            role="alert"
            aria-live="polite"
            className="mt-4 rounded-3xl border border-red-200/70 bg-red-50/90 p-4 shadow-sm backdrop-blur dark:border-red-500/20 dark:bg-red-500/10"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-200">
                <ErrorIcon />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-red-900 dark:text-red-100">
                  Please fix the following
                </p>
                <ul className="mt-2 space-y-1 text-sm leading-6 text-red-800 dark:text-red-100/90">
                  {errors.map((item, index) => (
                    <li key={`${item}-${index}`} className="flex gap-2">
                      <span className="mt-[2px] text-red-500 dark:text-red-200">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100"
        >
          {loading ? "Please wait..." : mode === "signin" ? "Sign in" : "Create account"}
        </button>

        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-4 w-full text-sm font-medium text-zinc-600 transition hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
        >
          {mode === "signin"
            ? "Need an account? Create one"
            : "Already have an account? Sign in"}
        </button>
      </form>
    </div>
  );
}