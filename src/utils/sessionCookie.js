/* eslint-disable camelcase */
/**
 * Shared consumer cookies with domain=.4geeks.com and subdomains:
 * - 4g_ctx: visit/attribution session
 * - 4g_tok: auth token
 */

const SESSION_COOKIE_NAME = '4g_ctx';
const CONSUMER_TOKEN_COOKIE_NAME = '4g_tok';
const SESSION_VERSION = 4;
const LEGACY_USER_SESSION_KEY = 'userSession';
const LEGACY_ACCESS_TOKEN_KEY = 'accessToken';

const COOKIE_MAX_AGE_SECONDS = 180 * 24 * 60 * 60; // 180 days
const SESSION_COOKIE_SIZE_LIMIT = 3500;
const UTM_TRUNCATE_LEN = 200;

/**
 * userSession ↔ 4g_ctx adapters.
 * `cookie`: path string, or array = OR on read (first path = canonical write).
 */
const FIELD_MAP = [
  { session: 'utm_source', cookie: 'utm.utm_source' },
  { session: 'utm_medium', cookie: 'utm.utm_medium' },
  { session: 'utm_campaign', cookie: 'utm.utm_campaign' },
  { session: 'utm_content', cookie: 'utm.utm_content' },
  { session: 'utm_term', cookie: 'utm.utm_term' },
  { session: 'utm_placement', cookie: 'utm.utm_placement' },
  { session: 'utm_url', cookie: 'utm.utm_url' },
  { session: 'utm_plan', cookie: 'utm.utm_plan' },
  { session: 'utm_referrer', cookie: ['utm.referral', 'utm.utm_referrer'] },
  { session: 'ref', cookie: ['utm.ref', 'utm.coupon'] },
  { session: 'internal_cta_placement', cookie: ['utm.internal_cta_placement', 'internal_cta_placement'] },
  { session: 'internal_cta_content', cookie: ['utm.internal_cta_content', 'internal_cta_content'] },
  { session: 'internal_cta_campaign', cookie: ['utm.internal_cta_campaign', 'internal_cta_campaign'] },
  { session: 'landing_url', cookie: 'landing_page' },
  { session: 'conversion_url', cookie: 'conversion_page' },
];

function getCookiePath(cookie, path) {
  return path.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), cookie);
}

function fieldMapDenylistKeys() {
  return FIELD_MAP.flatMap(({ session, cookie }) => {
    const paths = Array.isArray(cookie) ? cookie : [cookie];
    return [session, ...paths.map((p) => p.split('.')[0])];
  });
}

/**
 * Derive parent cookie Domain for sibling subdomain sharing.
 * `learn.4geeks.com` → `.4geeks.com`. Omit on localhost / IPs / single-label hosts.
 */
function getParentCookieDomain(hostname) {
  const host = hostname
    ?? (typeof window !== 'undefined' ? window.location.hostname : undefined);
  if (!host) return undefined;

  if (
    host === 'localhost'
    || host.endsWith('.localhost')
    || /^\d{1,3}(\.\d{1,3}){3}$/.test(host)
    || host.includes(':')
  ) {
    return undefined;
  }

  const parts = host.split('.').filter(Boolean);
  if (parts.length < 2) return undefined;
  return `.${parts.slice(-2).join('.')}`;
}

function readCookie(name) {
  if (typeof document === 'undefined') return null;
  const prefix = `${name}=`;
  const row = document.cookie.split('; ').find((c) => c.startsWith(prefix));
  if (!row) return null;
  return row.slice(prefix.length);
}

function writeCookie(name, value, maxAge = COOKIE_MAX_AGE_SECONDS) {
  if (typeof document === 'undefined') return;
  const attributes = ['path=/', `max-age=${maxAge}`, 'samesite=lax'];
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    attributes.push('secure');
  }
  const domain = getParentCookieDomain();
  if (domain) attributes.push(`domain=${domain}`);
  document.cookie = `${name}=${value}; ${attributes.join('; ')}`;
}

function clearCookie(name) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; path=/; max-age=0; samesite=lax`;
  const domain = getParentCookieDomain();
  if (domain) {
    document.cookie = `${name}=; path=/; max-age=0; samesite=lax; domain=${domain}`;
  }
}

function encodeCookiePayload(payload) {
  let candidate = payload;
  let encoded = encodeURIComponent(JSON.stringify(candidate));

  if (encoded.length > SESSION_COOKIE_SIZE_LIMIT) {
    const utm = { ...(payload.utm || {}) };
    Object.keys(utm).forEach((key) => {
      const val = utm[key];
      if (typeof val === 'string' && val.length > UTM_TRUNCATE_LEN) {
        utm[key] = val.slice(0, UTM_TRUNCATE_LEN);
      }
    });
    candidate = { ...payload, utm };
    encoded = encodeURIComponent(JSON.stringify(candidate));
  }

  if (encoded.length > SESSION_COOKIE_SIZE_LIMIT) {
    console.warn('4g_ctx cookie exceeds size limit after UTM truncate', encoded.length);
    return null;
  }

  return encoded;
}

function getSessionFromCookie() {
  if (typeof document === 'undefined') return null;
  try {
    const raw = readCookie(SESSION_COOKIE_NAME);
    if (!raw) return null;
    const session = JSON.parse(decodeURIComponent(raw));
    if (session.version !== SESSION_VERSION) {
      clearCookie(SESSION_COOKIE_NAME);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

function setSessionCookie(session) {
  if (typeof document === 'undefined') return;
  const encoded = encodeCookiePayload(session);
  if (!encoded) return;
  writeCookie(SESSION_COOKIE_NAME, encoded);
}

/**
 * Cookie 4g_ctx → in-memory userSession (pass-through + adapters).
 */
function cookieToUserSession(cookie) {
  if (!cookie || typeof cookie !== 'object') return null;

  const omit = new Set([
    'version',
    'initialized',
    ...fieldMapDenylistKeys(),
  ]);

  const userSession = {};
  Object.keys(cookie).forEach((key) => {
    if (omit.has(key)) return;
    userSession[key] = cookie[key];
  });

  FIELD_MAP.forEach((entry) => {
    const paths = Array.isArray(entry.cookie) ? entry.cookie : [entry.cookie];
    const found = paths
      .map((p) => getCookiePath(cookie, p))
      .find((value) => value !== undefined && value !== null && value !== '');
    if (found !== undefined) {
      userSession[entry.session] = found;
    } else {
      userSession[entry.session] = entry.empty !== undefined ? entry.empty : '';
    }
  });

  return userSession;
}

/**
 * Build cookie-shaped patch from userSession (adapters + pass-through).
 */
function userSessionToCookiePatch(userSession) {
  if (!userSession || typeof userSession !== 'object') return {};

  const patch = {
    version: SESSION_VERSION,
    timestamp: Date.now(),
  };

  FIELD_MAP.forEach((entry) => {
    const value = userSession[entry.session];
    if (value === undefined || value === null || value === '') return;

    // Write into cookie shape, e.g. utm_source → patch.utm.utm_source
    const cookiePath = Array.isArray(entry.cookie) ? entry.cookie[0] : entry.cookie;
    const pathSegments = cookiePath.split('.');
    const leafKey = pathSegments[pathSegments.length - 1];

    if (pathSegments.length === 1) {
      patch[leafKey] = value;
      return;
    }

    let nestedParent = patch;
    for (let i = 0; i < pathSegments.length - 1; i += 1) {
      const segment = pathSegments[i];
      if (!nestedParent[segment] || typeof nestedParent[segment] !== 'object') {
        nestedParent[segment] = {};
      }
      nestedParent = nestedParent[segment];
    }
    nestedParent[leafKey] = value;
  });

  const passThroughDenylist = new Set([
    ...fieldMapDenylistKeys(),
    'version',
    'initialized',
    'timestamp',
    'translations',
  ]);

  Object.keys(userSession).forEach((key) => {
    if (passThroughDenylist.has(key)) return;
    if (userSession[key] === undefined) return;
    patch[key] = userSession[key];
  });

  return patch;
}

function mergeSessionCookie(existing, patch) {
  const base = existing && typeof existing === 'object' ? existing : {};
  return {
    ...base,
    ...patch,
    version: SESSION_VERSION,
    initialized: true,
    utm: {
      ...(base.utm || {}),
      ...(patch.utm || {}),
    },
    timestamp: patch.timestamp || Date.now(),
  };
}

/**
 * Persist userSession into 4g_ctx (merge + adapters + pass-through).
 */
export function saveUserSession(userSession) {
  if (typeof window === 'undefined') return;
  const existing = getSessionFromCookie();
  const patch = userSessionToCookiePatch(userSession);
  const merged = mergeSessionCookie(existing, patch);
  setSessionCookie(merged);
}

function removeLegacyUserSession() {
  try {
    localStorage.removeItem(LEGACY_USER_SESSION_KEY);
  } catch {
    // ignore
  }
}

function migrateUserSessionFromLocalStorageToCookie() {
  if (typeof window === 'undefined') return null;
  try {
    const existing = getSessionFromCookie();
    if (existing) {
      removeLegacyUserSession();
      return cookieToUserSession(existing);
    }

    const stored = localStorage.getItem(LEGACY_USER_SESSION_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    removeLegacyUserSession();
    saveUserSession(parsed);
    const afterSave = getSessionFromCookie();
    return afterSave ? cookieToUserSession(afterSave) : { ...parsed };
  } catch {
    removeLegacyUserSession();
    return null;
  }
}

/**
 * Load visit session: cookie first, else migrate LS userSession.
 */
export function loadUserSession() {
  if (typeof window === 'undefined') return null;

  const fromCookie = getSessionFromCookie();
  if (fromCookie) {
    removeLegacyUserSession();
    return cookieToUserSession(fromCookie);
  }

  return migrateUserSessionFromLocalStorageToCookie();
}

// —— Auth token (4g_tok) ——

function getTokenFromCookieOnly() {
  const raw = readCookie(CONSUMER_TOKEN_COOKIE_NAME);
  if (!raw) return null;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export function setTokenCookie(token) {
  if (typeof document === 'undefined' || !token) return;
  writeCookie(CONSUMER_TOKEN_COOKIE_NAME, encodeURIComponent(token));
}

export function clearTokenCookie() {
  clearCookie(CONSUMER_TOKEN_COOKIE_NAME);
}

function migrateAccessTokenFromLocalStorageToCookie() {
  if (typeof window === 'undefined') return null;
  try {
    const fromCookie = getTokenFromCookieOnly();
    if (fromCookie) {
      localStorage.removeItem(LEGACY_ACCESS_TOKEN_KEY);
      return fromCookie;
    }

    const legacy = localStorage.getItem(LEGACY_ACCESS_TOKEN_KEY);
    if (!legacy) return null;

    setTokenCookie(legacy);
    localStorage.removeItem(LEGACY_ACCESS_TOKEN_KEY);
    return legacy;
  } catch {
    try {
      localStorage.removeItem(LEGACY_ACCESS_TOKEN_KEY);
    } catch {
      // ignore
    }
    return null;
  }
}

/**
 * Resolve auth token: optional ?token= (persisted), else 4g_tok (+ migrate LS accessToken).
 */
export function getToken() {
  if (typeof window === 'undefined') return null;

  try {
    const query = new URLSearchParams(window.location.search || '');
    const queryToken = query.get('token')?.split('?')[0];
    if (queryToken) {
      setTokenCookie(queryToken);
      return queryToken;
    }
  } catch {
    // ignore
  }

  return migrateAccessTokenFromLocalStorageToCookie();
}
