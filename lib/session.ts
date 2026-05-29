export const SESSION_COOKIE = "cc_session";
export const OAUTH_STATE_COOKIE = "cc_oauth_state";
export const OAUTH_NEXT_COOKIE = "cc_oauth_next";

export const SESSION_DAYS = 30;
export const OAUTH_STATE_MINUTES = 10;

export function isProduction() {
  return process.env.NODE_ENV === "production";
}