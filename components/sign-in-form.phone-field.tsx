"use client";

import {
  formatNationalPhoneNumber,
  formatPhoneHelpText,
  getCountryByIso2,
  getNationalPhoneExample,
  normalizePhoneInput,
} from "./sign-in-form.utils";
import { CountryPicker } from "./sign-in-form.country-picker";

type ModernPhoneFieldProps = {
  label: string;
  digits: string;
  onDigitsChange: (value: string) => void;
  countryIso2: string;
  onCountryChange: (countryIso2: string) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  disabled?: boolean;
  hint?: string;
};

export function ModernPhoneField({
  label,
  digits,
  onDigitsChange,
  countryIso2,
  onCountryChange,
  placeholder,
  autoComplete,
  required = false,
  disabled = false,
  hint,
}: ModernPhoneFieldProps) {
  const country = getCountryByIso2(countryIso2);

  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</span>

      <div className="flex flex-col gap-2 sm:flex-row">
        <CountryPicker value={countryIso2} onChange={onCountryChange} disabled={disabled} />

        <input
          type="tel"
          value={formatNationalPhoneNumber(digits, countryIso2)}
          onChange={(e) => {
            const rawValue = e.target.value;
            const normalized = normalizePhoneInput(rawValue, countryIso2);
            if (normalized.countryIso2 !== countryIso2) {
              onCountryChange(normalized.countryIso2);
            }
            onDigitsChange(normalized.nationalDigits);
          }}
          onKeyDown={(e) => {
            if (e.ctrlKey || e.metaKey || e.altKey) return;
            if (e.key.length !== 1) return;
            if (/^[a-zA-Z]$/.test(e.key)) {
              e.preventDefault();
            }
          }}
          autoComplete={autoComplete}
          autoCapitalize="none"
          spellCheck={false}
          inputMode="numeric"
          placeholder={placeholder || getNationalPhoneExample(countryIso2)}
          className="min-w-0 flex-1 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-400 dark:border-white/10 dark:bg-zinc-950/40 dark:text-white"
          required={required}
          disabled={disabled}
        />
      </div>

      <div className="mt-1 flex items-center justify-between gap-3 text-xs text-zinc-500 dark:text-zinc-400">
       
        <span>{country.name}</span>
      </div>
    </label>
  );
}