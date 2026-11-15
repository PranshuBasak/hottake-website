export type Consent = "all" | "essential";

export const CONSENT_COOKIE = "ht_consent";
export const VISITOR_COOKIE = "ht_vid";
export const SESSION_COOKIE = "ht_sid";
export const LAST_VISIT_COOKIE = "ht_last";
export const CONSENT_MAX_AGE = 60 * 60 * 24 * 365; // 12 months
export const SESSION_MAX_AGE = 60 * 30; // 30 minutes, rolling

export function parseConsent(raw: string | null | undefined): Consent | null {
  return raw === "all" || raw === "essential" ? raw : null;
}

/** Browser privacy signals make "essential only" the default until the visitor chooses. */
export function effectiveConsent(stored: Consent | null, signals: { dnt?: boolean; gpc?: boolean }): Consent | null {
  if (stored) return stored;
  if (signals.dnt || signals.gpc) return "essential";
  return null;
}

/** Cookie string for document.cookie. */
export function consentCookie(value: Consent, secure: boolean): string {
  return `${CONSENT_COOKIE}=${value}; Max-Age=${CONSENT_MAX_AGE}; Path=/; SameSite=Lax${secure ? "; Secure" : ""}`;
}
