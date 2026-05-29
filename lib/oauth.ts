type GoogleTokenResponse = {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
  id_token?: string;
  refresh_token?: string;
};

type GoogleProfile = {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
};

function getGoogleConfig(origin: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ??
    new URL("/api/auth/google/callback", origin).toString();

  if (!clientId || !clientSecret) {
    throw new Error("Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET");
  }

  return {
    clientId,
    clientSecret,
    redirectUri,
  };
}

export function buildGoogleAuthorizeUrl(origin: string, state: string) {
  const { clientId, redirectUri } = getGoogleConfig(origin);

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");

  return url.toString();
}

export async function exchangeGoogleCode(origin: string, code: string) {
  const { clientId, clientSecret, redirectUri } = getGoogleConfig(origin);

  const body = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Google token exchange failed: ${text || res.statusText}`);
  }

  return (await res.json()) as GoogleTokenResponse;
}

export async function fetchGoogleProfile(accessToken: string) {
  const res = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Google profile fetch failed: ${text || res.statusText}`);
  }

  return (await res.json()) as GoogleProfile;
}