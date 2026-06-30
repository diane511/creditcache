import { NextRequest, NextResponse } from "next/server";

type GeoResponse = {
  success: boolean;
  country_code: string;
  country_name?: string;
  source: "header" | "ipapi" | "fallback";
};

const FALLBACK_COUNTRY = "US";

function normalizeCountryCode(value: string | null | undefined) {
  const code = (value ?? "").trim().toUpperCase();
  return /^[A-Z]{2}$/.test(code) ? code : null;
}

function countryNameFromCode(code: string) {
  try {
    const display = new Intl.DisplayNames(["en"], { type: "region" });
    return display.of(code) ?? undefined;
  } catch {
    return undefined;
  }
}

function getHeaderCountry(req: NextRequest) {
  const headers = req.headers;

  const candidates = [
    headers.get("x-vercel-ip-country"),
    headers.get("cf-ipcountry"),
    headers.get("x-country-code"),
    headers.get("x-geo-country"),
    headers.get("x-country"),
  ];

  for (const candidate of candidates) {
    const code = normalizeCountryCode(candidate);
    if (code) return code;
  }

  return null;
}

async function getCountryFromIpFallback(req: NextRequest) {
  const forwardedFor = req.headers.get("x-forwarded-for") ?? "";
  const firstIp = forwardedFor.split(",")[0]?.trim() || "";

  if (!firstIp) return null;

  try {
    const res = await fetch(`https://ipapi.co/${encodeURIComponent(firstIp)}/json/`, {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!res.ok) return null;

    const data = (await res.json().catch(() => null)) as {
      country_code?: string;
      country_name?: string;
    } | null;

    const countryCode = normalizeCountryCode(data?.country_code);
    if (!countryCode) return null;

    return {
      country_code: countryCode,
      country_name: data?.country_name || countryNameFromCode(countryCode),
      source: "ipapi" as const,
    };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const headerCountry = getHeaderCountry(req);

  if (headerCountry) {
    const response: GeoResponse = {
      success: true,
      country_code: headerCountry,
      country_name: countryNameFromCode(headerCountry),
      source: "header",
    };

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  }

  const fallbackLookup = await getCountryFromIpFallback(req);
  if (fallbackLookup) {
    return NextResponse.json(
      {
        success: true,
        ...fallbackLookup,
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  }

  const response: GeoResponse = {
    success: true,
    country_code: FALLBACK_COUNTRY,
    country_name: countryNameFromCode(FALLBACK_COUNTRY),
    source: "fallback",
  };

  return NextResponse.json(response, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}