"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  COUNTRY_OPTIONS_SORTED,
  getCountryByIso2,
  getCountryFlag,
} from "./sign-in-form.utils";

type CountryPickerProps = {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
};

export function CountryPicker({ value, onChange, disabled }: CountryPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const selectedCountry = getCountryByIso2(value);

  useEffect(() => {
    function onDocumentClick(event: MouseEvent) {
      if (!wrapperRef.current) return;
      if (event.target instanceof Node && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onDocumentClick);
    return () => document.removeEventListener("mousedown", onDocumentClick);
  }, []);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const filteredCountries = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return COUNTRY_OPTIONS_SORTED;

    return COUNTRY_OPTIONS_SORTED.filter((country) => {
      return (
        country.name.toLowerCase().includes(normalizedQuery) ||
        country.iso2.toLowerCase().includes(normalizedQuery) ||
        country.dialCode.includes(normalizedQuery.replace(/\D/g, ""))
      );
    });
  }, [query]);

  return (
    <div ref={wrapperRef} className="relative w-full sm:w-auto">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex min-h-[52px] w-full items-center justify-between gap-2 rounded-2xl border border-zinc-200 bg-white px-3 py-3 text-left text-sm font-semibold text-zinc-950 outline-none transition hover:border-zinc-300 focus:border-zinc-400 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-zinc-950/40 dark:text-white dark:hover:border-white/20 dark:focus:border-white/20 sm:w-auto sm:justify-start"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Select country, current ${selectedCountry.name}`}
      >
        <span className="text-base leading-none">{getCountryFlag(selectedCountry.iso2)}</span>
        <span className="min-w-0 flex-1 truncate text-sm font-semibold sm:static sm:flex-none">
          +{selectedCountry.dialCode}
        </span>
        <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4 text-zinc-400">
          <path
            fill="currentColor"
            d="M5.7 7.6a1 1 0 0 1 1.4 0L10 10.5l2.9-2.9a1 1 0 1 1 1.4 1.4l-3.6 3.6a1 1 0 0 1-1.4 0L5.7 9a1 1 0 0 1 0-1.4Z"
          />
        </svg>
      </button>

      {open ? (
        <div className="absolute left-0 top-[calc(100%+0.5rem)] z-50 w-full overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-[0_20px_80px_rgba(0,0,0,0.12)] backdrop-blur dark:border-white/10 dark:bg-zinc-950 sm:w-96">
          <div className="border-b border-zinc-100 p-3 dark:border-white/10">
            <div className="relative">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
              >
                <path
                  fill="currentColor"
                  d="M10.5 4a6.5 6.5 0 1 1 4.1 11.5l4 4-1.4 1.4-4-4A6.5 6.5 0 0 1 10.5 4Zm0 2a4.5 4.5 0 1 0 0 9a4.5 4.5 0 0 0 0-9Z"
                />
              </svg>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search country or code"
                className="h-11 w-full rounded-2xl border border-zinc-200 bg-zinc-50 pl-10 pr-4 text-sm text-zinc-950 outline-none transition focus:border-zinc-400 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-white/20"
                autoComplete="off"
              />
            </div>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-2 sm:max-h-80">
            {filteredCountries.length ? (
              filteredCountries.map((country) => {
                const active = country.iso2 === value;
                return (
                  <button
                    key={country.iso2}
                    type="button"
                    onClick={() => {
                      onChange(country.iso2);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm transition ${
                      active
                        ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950"
                        : "text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-white/5"
                    }`}
                    role="option"
                    aria-selected={active}
                  >
                    <span className="text-base leading-none">{getCountryFlag(country.iso2)}</span>
                    <span className="min-w-0 flex-1 truncate font-medium">{country.name}</span>
                    <span className="shrink-0 font-semibold text-zinc-500 dark:text-zinc-400">
                      +{country.dialCode}
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
                No countries found.
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}