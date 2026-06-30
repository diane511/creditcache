"use client";

import { useEffect, useMemo, useRef, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { GoogleIcon, PhoneIcon, EmailIcon, EyeIcon, EyeOffIcon, ErrorIcon } from "./sign-in-form.icons";
import { ModernPhoneField } from "./sign-in-form.phone-field";
import {
  DEFAULT_COUNTRY,
  type AuthMode,
  type ApiErrorResponse,
  type SignInFormProps,
  type SignInMethod,
  buildInternationalPhone,
  detectCountryFromIp,
  friendlyModeLabel,
  isDisposableEmail,
  isProbablyPhone,
  isValidEmail,
  mapAuthErrors,
  normalizeAuthError,
} from "./sign-in-form.utils";

export function SignInForm({
  nextPath = "/dashboard",
  inviteToken,
  variant = "page",
  open = true,
  onClose,
  mode,
  defaultMode = "signin",
  onModeChange,
  notice = null,
}: SignInFormProps) {
  const router = useRouter();

  const [internalMode, setInternalMode] = useState<AuthMode>(defaultMode);
  const [method, setMethod] = useState<SignInMethod>("email");

  const [identifier, setIdentifier] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signinPhoneCountry, setSigninPhoneCountry] = useState<string>(DEFAULT_COUNTRY);
  const [signupPhoneCountry, setSignupPhoneCountry] = useState<string>(DEFAULT_COUNTRY);

  const signinCountryTouchedRef = useRef(false);
  const signupCountryTouchedRef = useRef(false);
  const didResolveCountryRef = useRef(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [verificationEmail, setVerificationEmail] = useState<string | null>(null);
  const [verificationNotice, setVerificationNotice] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  const currentMode = mode ?? internalMode;

  const updateMode = (nextMode: AuthMode) => {
    if (mode === undefined) {
      setInternalMode(nextMode);
    }
    onModeChange?.(nextMode);
    setErrors([]);
    setSuccessMessage(null);
    setVerificationNotice(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  useEffect(() => {
    if (variant === "modal" && !open) {
      setErrors([]);
      setSuccessMessage(null);
      setVerificationNotice(null);
    }
  }, [variant, open]);

  useEffect(() => {
    let cancelled = false;

    if (didResolveCountryRef.current) return;
    didResolveCountryRef.current = true;

    async function resolveDefaultCountry() {
      const detectedCountry = await detectCountryFromIp();
      if (cancelled || !detectedCountry) return;

      if (!signinCountryTouchedRef.current) {
        setSigninPhoneCountry(detectedCountry);
      }

      if (!signupCountryTouchedRef.current) {
        setSignupPhoneCountry(detectedCountry);
      }
    }

    void resolveDefaultCountry();

    return () => {
      cancelled = true;
    };
  }, []);

  const disclaimerText = useMemo(() => {
    if (currentMode === "signin") {
      return method === "email"
        ? "Use your verified email and password to continue."
        : "Pick a country, then enter your phone number to continue.";
    }

    return "New accounts will receive a welcome message and an email verification step before dashboard access.";
  }, [currentMode, method]);

  const handleSigninCountryChange = (nextCountryIso2: string) => {
    signinCountryTouchedRef.current = true;
    setSigninPhoneCountry(nextCountryIso2);
  };

  const handleSignupCountryChange = (nextCountryIso2: string) => {
    signupCountryTouchedRef.current = true;
    setSignupPhoneCountry(nextCountryIso2);
  };

  if (variant === "modal" && !open) return null;

  function validateBeforeSubmit() {
    const nextErrors: string[] = [];

    if (currentMode === "signin") {
      const value = identifier.trim();

      if (!value) {
        nextErrors.push(method === "email" ? "Please enter your email address." : "Please enter your phone number.");
      } else if (method === "email") {
        if (!isValidEmail(value)) {
          nextErrors.push("Please enter a valid email address, like name@example.com.");
        }
      } else if (!isProbablyPhone(value)) {
        nextErrors.push("Please enter a valid phone number with 8 to 15 digits.");
      }

      if (!password.trim()) {
        nextErrors.push("Please enter your password.");
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

  function extractVerificationDestination(data: ApiErrorResponse | null, email: string) {
    if (data?.verifyUrl) return data.verifyUrl;
    if (data?.redirectTo) return data.redirectTo;
    return `/auth/verify-email?email=${encodeURIComponent(email)}`;
  }

  async function handleResendVerification() {
    const email = verificationEmail || (currentMode === "signup" ? signupEmail.trim() : identifier.trim());
    if (!email) {
      setErrors(["Enter your email first so we can resend the verification code."]);
      return;
    }

    setResending(true);
    setErrors([]);
    setSuccessMessage(null);
    setVerificationNotice(null);

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = (await res.json().catch(() => null)) as ApiErrorResponse | null;

      if (!res.ok || data?.success === false) {
        setErrors(mapAuthErrors(data, "We could not resend the verification email."));
        return;
      }

      setVerificationEmail(email);
      setVerificationNotice(data?.message || "Verification email sent.");
    } catch {
      setErrors(["We could not resend the verification email."]);
    } finally {
      setResending(false);
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrors([]);
    setSuccessMessage(null);
    setVerificationNotice(null);

    try {
      const validationErrors = validateBeforeSubmit();
      if (validationErrors.length) {
        setErrors(validationErrors);
        return;
      }

      const endpoint =
        currentMode === "signin"
          ? "/api/auth/signin"
          : `/api/auth/signup${inviteToken ? `?invite=${encodeURIComponent(inviteToken)}` : ""}`;

      const payload =
        currentMode === "signin"
          ? {
              method,
              identifier:
                method === "phone" ? buildInternationalPhone(identifier, signinPhoneCountry) : identifier.trim(),
              phoneCountry: method === "phone" ? signinPhoneCountry : undefined,
              password,
              nextPath,
            }
          : {
              email: signupEmail.trim(),
              phone: buildInternationalPhone(signupPhone, signupPhoneCountry),
              phoneCountry: signupPhoneCountry,
              password,
              nextPath,
              inviteToken,
            };

      const res = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json().catch(() => null)) as ApiErrorResponse | null;

      if (!res.ok || data?.success === false) {
        const apiCode = data?.code ?? "";

        if (
          data?.requiresVerification ||
          apiCode === "EMAIL_NOT_VERIFIED" ||
          apiCode === "UNVERIFIED_ACCOUNT" ||
          apiCode === "VERIFICATION_REQUIRED"
        ) {
          const emailForVerify =
            currentMode === "signup"
              ? signupEmail.trim()
              : data?.email || identifier.trim();

          setVerificationEmail(emailForVerify);
          setVerificationNotice(data?.message || "Your account needs verification. Check your inbox to continue.");

          const verifyDestination = extractVerificationDestination(data, emailForVerify);
          startTransition(() => {
            router.replace(verifyDestination);
          });
          return;
        }

        setErrors(
          mapAuthErrors(
            data,
            res.status >= 500 ? "Something went wrong. Please try again." : "Authentication failed",
          ),
        );
        return;
      }

      if (currentMode === "signup") {
        const emailForVerify = signupEmail.trim();
        setVerificationEmail(emailForVerify);
        setSuccessMessage(
          data?.message || "Welcome to Credit Cache. Check your inbox to verify your email and continue.",
        );

        const verifyDestination = extractVerificationDestination(data, emailForVerify);
        startTransition(() => {
          router.replace(verifyDestination);
        });
        return;
      }

      const destination = data?.redirectTo || nextPath;

      if (data?.requiresVerification) {
        const emailForVerify = data.email || identifier.trim();
        setVerificationEmail(emailForVerify);
        setVerificationNotice(data.message || "Your account needs verification. Check your inbox to continue.");

        startTransition(() => {
          router.replace(extractVerificationDestination(data, emailForVerify));
        });
        return;
      }

      setSuccessMessage(data?.message || "Signed in successfully.");
      startTransition(() => {
        router.replace(destination);
        router.refresh();
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Authentication failed";
      setErrors([normalizeAuthError(message)]);
    } finally {
      setLoading(false);
    }
  }

  const busy = loading || isPending || resending;

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md items-center px-4 py-10">
      <div className="w-full overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-[0_24px_80px_rgba(0,0,0,0.08)] dark:border-white/10 dark:bg-white/5">
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

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                Credit Cache
              </p>
              <h1 className="truncate text-xl font-black tracking-tight text-zinc-950 dark:text-white">
                {friendlyModeLabel(currentMode)}
              </h1>
            </div>

            {variant === "modal" && onClose ? (
              <button
                type="button"
                onClick={onClose}
                className="ml-auto rounded-full p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white"
                aria-label="Close"
              >
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
                  <path
                    d="M6 6l12 12M18 6l-12 12"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            ) : null}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {notice ? (
            <div className="mb-4 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-200">
              {notice}
            </div>
          ) : null}

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

          {currentMode === "signin" ? (
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
            {currentMode === "signin" ? (
              method === "email" ? (
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Email
                  </span>
                  <input
                    type="email"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    autoComplete="email"
                    autoCapitalize="none"
                    spellCheck={false}
                    placeholder="name@example.com"
                    className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-400 dark:border-white/10 dark:bg-zinc-950/40 dark:text-white"
                    required
                  />
                </label>
              ) : (
                <ModernPhoneField
                  label="Phone number"
                  digits={identifier}
                  onDigitsChange={setIdentifier}
                  countryIso2={signinPhoneCountry}
                  onCountryChange={(nextCountryIso2) => {
                    signinCountryTouchedRef.current = true;
                    setSigninPhoneCountry(nextCountryIso2);
                  }}
                  placeholder="201 555 0123"
                  autoComplete="tel-national"
                  required
                 
                />
              )
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

                <ModernPhoneField
                  label="Phone number"
                  digits={signupPhone}
                  onDigitsChange={setSignupPhone}
                  countryIso2={signupPhoneCountry}
                  onCountryChange={(nextCountryIso2) => {
                    signupCountryTouchedRef.current = true;
                    setSignupPhoneCountry(nextCountryIso2);
                  }}
                  placeholder="201 555 0123"
                  autoComplete="tel-national"
                  required
                 
                />
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
                  autoComplete={currentMode === "signin" ? "current-password" : "new-password"}
                  className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 pr-12 text-zinc-950 outline-none transition focus:border-zinc-400 dark:border-white/10 dark:bg-zinc-950/40 dark:text-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </label>

            {currentMode === "signup" ? (
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
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
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

          {successMessage ? (
            <div className="mt-4 rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
              {successMessage}
            </div>
          ) : null}

          {verificationNotice ? (
            <div className="mt-4 rounded-3xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-200">
              {verificationNotice}
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={busy}
                  className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-zinc-950 shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-950 dark:text-white"
                >
                  {resending ? "Resending..." : "Resend verification email"}
                </button>
                {verificationEmail ? (
                  <Link
                    href={`/auth/verify-email?email=${encodeURIComponent(verificationEmail)}`}
                    className="rounded-full border border-blue-200 px-4 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 dark:border-blue-500/20 dark:text-blue-200 dark:hover:bg-blue-500/10"
                  >
                    Open verification page
                  </Link>
                ) : null}
              </div>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={busy}
            className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100"
          >
            {busy ? "Please wait..." : currentMode === "signin" ? "Sign in" : "Create account"}
          </button>

          <button
            type="button"
            onClick={() => updateMode(currentMode === "signin" ? "signup" : "signin")}
            disabled={busy}
            className="mt-4 w-full text-sm font-medium text-zinc-600 transition hover:text-zinc-950 disabled:cursor-not-allowed disabled:opacity-60 dark:text-zinc-400 dark:hover:text-white"
          >
            {currentMode === "signin"
              ? "Need an account? Create one"
              : "Already have an account? Sign in"}
          </button>

          <p className="mt-4 text-center text-xs leading-5 text-zinc-500 dark:text-zinc-400">
            {disclaimerText}
          </p>
        </form>
      </div>
    </div>
  );
}