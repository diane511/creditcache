export type AuthMode = "signin" | "signup";
export type SignInMethod = "email" | "phone";

export type SignInFormProps = {
  nextPath?: string;
  inviteToken?: string;
  variant?: "page" | "modal";
  open?: boolean;
  onClose?: () => void;
  mode?: AuthMode;
  defaultMode?: AuthMode;
  onModeChange?: (mode: AuthMode) => void;
  notice?: string | null;
};

export type ApiErrorResponse = {
  success?: boolean;
  code?: string;
  message?: string;
  redirectTo?: string;
  verifyUrl?: string;
  retryAfterSeconds?: number;
  requiresVerification?: boolean;
  email?: string;
  suggestions?: string[];
  errors?: Array<{ field?: string | null; message: string }>;
  fieldErrors?: Record<string, string>;
};

export type CountryOption = {
  iso2: string;
  name: string;
  dialCode: string;
};

export const FALLBACK_COUNTRY = "US";
export const DEFAULT_COUNTRY = FALLBACK_COUNTRY;

export const COUNTRY_OPTIONS: CountryOption[] = [
  { iso2: "US", name: "United States", dialCode: "1" },
  { iso2: "CA", name: "Canada", dialCode: "1" },
  { iso2: "NG", name: "Nigeria", dialCode: "234" },
  { iso2: "GB", name: "United Kingdom", dialCode: "44" },
  { iso2: "IE", name: "Ireland", dialCode: "353" },
  { iso2: "FR", name: "France", dialCode: "33" },
  { iso2: "DE", name: "Germany", dialCode: "49" },
  { iso2: "ES", name: "Spain", dialCode: "34" },
  { iso2: "IT", name: "Italy", dialCode: "39" },
  { iso2: "NL", name: "Netherlands", dialCode: "31" },
  { iso2: "BE", name: "Belgium", dialCode: "32" },
  { iso2: "CH", name: "Switzerland", dialCode: "41" },
  { iso2: "AT", name: "Austria", dialCode: "43" },
  { iso2: "SE", name: "Sweden", dialCode: "46" },
  { iso2: "NO", name: "Norway", dialCode: "47" },
  { iso2: "DK", name: "Denmark", dialCode: "45" },
  { iso2: "FI", name: "Finland", dialCode: "358" },
  { iso2: "PL", name: "Poland", dialCode: "48" },
  { iso2: "PT", name: "Portugal", dialCode: "351" },
  { iso2: "GR", name: "Greece", dialCode: "30" },
  { iso2: "TR", name: "Turkey", dialCode: "90" },
  { iso2: "UA", name: "Ukraine", dialCode: "380" },
  { iso2: "RO", name: "Romania", dialCode: "40" },
  { iso2: "HU", name: "Hungary", dialCode: "36" },
  { iso2: "CZ", name: "Czech Republic", dialCode: "420" },
  { iso2: "SK", name: "Slovakia", dialCode: "421" },
  { iso2: "SI", name: "Slovenia", dialCode: "386" },
  { iso2: "HR", name: "Croatia", dialCode: "385" },
  { iso2: "RS", name: "Serbia", dialCode: "381" },
  { iso2: "BG", name: "Bulgaria", dialCode: "359" },
  { iso2: "LT", name: "Lithuania", dialCode: "370" },
  { iso2: "LV", name: "Latvia", dialCode: "371" },
  { iso2: "EE", name: "Estonia", dialCode: "372" },
  { iso2: "IS", name: "Iceland", dialCode: "354" },
  { iso2: "MX", name: "Mexico", dialCode: "52" },
  { iso2: "BR", name: "Brazil", dialCode: "55" },
  { iso2: "AR", name: "Argentina", dialCode: "54" },
  { iso2: "CL", name: "Chile", dialCode: "56" },
  { iso2: "CO", name: "Colombia", dialCode: "57" },
  { iso2: "PE", name: "Peru", dialCode: "51" },
  { iso2: "VE", name: "Venezuela", dialCode: "58" },
  { iso2: "CR", name: "Costa Rica", dialCode: "506" },
  { iso2: "PA", name: "Panama", dialCode: "507" },
  { iso2: "DO", name: "Dominican Republic", dialCode: "1" },
  { iso2: "PR", name: "Puerto Rico", dialCode: "1" },
  { iso2: "AU", name: "Australia", dialCode: "61" },
  { iso2: "NZ", name: "New Zealand", dialCode: "64" },
];

export const COUNTRY_BY_ISO2 = new Map(COUNTRY_OPTIONS.map((country) => [country.iso2, country]));
export const COUNTRY_OPTIONS_SORTED = [...COUNTRY_OPTIONS].sort((a, b) => {
  if (a.iso2 === DEFAULT_COUNTRY) return -1;
  if (b.iso2 === DEFAULT_COUNTRY) return 1;
  return a.name.localeCompare(b.name);
});

export const DIAL_CODE_LENGTHS_DESC = [...new Set(COUNTRY_OPTIONS.map((country) => country.dialCode.length))].sort(
  (a, b) => b - a,
);

export const DISPOSABLE_EMAIL_DOMAINS = new Set([
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
]);

export function getCountryByIso2(iso2: string) {
  return COUNTRY_BY_ISO2.get(iso2.toUpperCase()) ?? COUNTRY_BY_ISO2.get(DEFAULT_COUNTRY) ?? COUNTRY_OPTIONS[0];
}

export function getCountryFlag(iso2: string) {
  const code = iso2.toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return "🌐";
  return String.fromCodePoint(...[...code].map((char) => 127397 + char.charCodeAt(0)));
}

export function getPhoneDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function normalizePhoneValue(value: string) {
  return value.trim().replace(/[^\d+()\s-]/g, "");
}

export function countDigits(value: string) {
  return (value.match(/\d/g) ?? []).length;
}

export function isValidEmail(email: string) {
  const value = email.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

export function getEmailDomain(email: string) {
  return email.trim().toLowerCase().split("@")[1] ?? "";
}

export function isDisposableEmail(email: string) {
  const domain = getEmailDomain(email);
  if (!domain) return false;

  for (const disposableDomain of DISPOSABLE_EMAIL_DOMAINS) {
    if (domain === disposableDomain || domain.endsWith(`.${disposableDomain}`)) {
      return true;
    }
  }

  return false;
}

export function isProbablyPhone(value: string) {
  const digits = countDigits(value);
  return digits >= 8 && digits <= 15;
}

export function inferCountryFromPhone(value: string) {
  const digits = getPhoneDigits(value);
  if (!digits) return null;

  for (const length of DIAL_CODE_LENGTHS_DESC) {
    const dialCode = digits.slice(0, length);
    const match = COUNTRY_OPTIONS.find((country) => country.dialCode === dialCode);
    if (match) return match;
  }

  return null;
}

export function buildInternationalPhone(value: string, countryIso2 = DEFAULT_COUNTRY) {
  const digits = getPhoneDigits(value);
  if (!digits) return "";

  const country = getCountryByIso2(countryIso2);
  return `+${country.dialCode}${digits}`;
}

export async function detectCountryFromIp(): Promise<string | null> {
  const sources = [
    { url: "/api/geo/country", extractor: (data: unknown) => extractCountryCode(data) },
    { url: "https://ipapi.co/json/", extractor: (data: unknown) => extractCountryCode(data) },
    { url: "https://ipwho.is/?fields=success,country_code", extractor: (data: unknown) => extractCountryCode(data) },
  ];

  for (const source of sources) {
    try {
      const response = await fetch(source.url, {
        method: "GET",
        credentials: source.url.startsWith("/") ? "include" : "omit",
        cache: "no-store",
        headers: { Accept: "application/json" },
      });

      if (!response.ok) continue;

      const data = (await response.json().catch(() => null)) as unknown;
      const countryCode = source.extractor(data);
      if (countryCode) return countryCode;
    } catch {
      // Try the next source.
    }
  }

  return null;
}

export function extractCountryCode(data: unknown) {
  if (!data || typeof data !== "object") return null;

  const candidate = data as { country_code?: string; countryCode?: string; country?: string };
  const raw = (candidate.country_code || candidate.countryCode || candidate.country || "").trim().toUpperCase();
  if (!raw) return null;

  const normalized = raw.slice(0, 2);
  return COUNTRY_BY_ISO2.has(normalized) ? normalized : null;
}

export function formatNationalPhoneNumber(digits: string, countryIso2: string) {
  const cleaned = getPhoneDigits(digits);
  if (!cleaned) return "";

  const country = getCountryByIso2(countryIso2);

  if (country.iso2 === "US" || country.iso2 === "CA" || country.dialCode === "1") {
    const a = cleaned.slice(0, 3);
    const b = cleaned.slice(3, 6);
    const c = cleaned.slice(6, 10);

    if (cleaned.length <= 3) return a;
    if (cleaned.length <= 6) return `(${a}) ${b}`;
    if (cleaned.length <= 10) return `(${a}) ${b}-${c}`;
    return `(${a}) ${b}-${cleaned.slice(6)}`;
  }

  const parts = cleaned.match(/.{1,3}/g) ?? [];
  return parts.join(" ");
}

export function getNationalPhoneExample(countryIso2: string) {
  switch (countryIso2) {
    case "US":
    case "CA":
      return "201 555 0123";
    case "NG":
      return "801 234 5678";
    case "GB":
      return "7700 900123";
    case "FR":
      return "612 345 678";
    case "DE":
      return "151 23456789";
    case "IN":
      return "98765 43210";
    default: {
      const country = getCountryByIso2(countryIso2);
      return `${country.dialCode} 123 456 789`;
    }
  }
}

export function normalizePhoneInput(rawValue: string, currentCountryIso2: string) {
  const trimmed = rawValue.trim();
  const digits = getPhoneDigits(trimmed);
  if (!digits) return { countryIso2: currentCountryIso2, nationalDigits: "" };

  const hasInternationalPrefix = trimmed.startsWith("+") || trimmed.startsWith("00");
  if (hasInternationalPrefix) {
    const inferred = inferCountryFromPhone(trimmed);
    if (inferred && digits.startsWith(inferred.dialCode)) {
      return {
        countryIso2: inferred.iso2,
        nationalDigits: digits.slice(inferred.dialCode.length).replace(/^0+/, ""),
      };
    }
  }

  return { countryIso2: currentCountryIso2, nationalDigits: digits };
}

export function formatPhoneHelpText(countryIso2: string) {
  const country = getCountryByIso2(countryIso2);
  return `${country.name} ${getCountryFlag(country.iso2)} +${country.dialCode}`;
}

export function normalizeAuthError(message?: string) {
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
    return "Your account needs verification. Check your inbox for the code.";
  }

  if (
    (lower.includes("phone") || lower.includes("mobile")) &&
    (lower.includes("already") || lower.includes("exists") || lower.includes("taken") || lower.includes("used"))
  ) {
    return "That phone number is already in use. Try another one.";
  }

  if (
    lower.includes("email") &&
    (lower.includes("already") || lower.includes("exists") || lower.includes("taken") || lower.includes("used"))
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

export function mapAuthErrors(data: ApiErrorResponse | null, fallback = "Authentication failed") {
  const code = data?.code ?? "";
  const message = data?.message?.trim() || fallback;

  switch (code) {
    case "VALIDATION_ERROR":
      return data?.errors?.length ? data.errors.map((item) => item.message) : [message];

    case "USER_NOT_FOUND":
    case "ACCOUNT_NOT_FOUND":
      return [message || "We could not find an account for that email or phone number."];

    case "EMAIL_NOT_VERIFIED":
    case "UNVERIFIED_ACCOUNT":
    case "VERIFICATION_REQUIRED":
      return [message || "Your account is not verified yet."];

    case "INVALID_PASSWORD":
    case "INCORRECT_PASSWORD":
      return [message || "The password is incorrect."];

    case "ACCOUNT_LOCKED":
      return [message || "Your account is locked. Please try again later."];

    case "RATE_LIMITED":
      return [
        data?.retryAfterSeconds
          ? `Too many attempts. Try again in ${Math.ceil(data.retryAfterSeconds / 60)} minute(s).`
          : message,
      ];

    case "EMAIL_EXISTS":
    case "PHONE_EXISTS":
      return [message];

    case "SERVER_ERROR":
    case "INTERNAL_SERVER_ERROR":
      return [message];

    default:
      return [message];
  }
}

export function friendlyModeLabel(mode: AuthMode) {
  return mode === "signin" ? "Sign in" : "Sign up";
}