/* eslint-disable camelcase */

/** Keys allowed by apiv2 `validate_conversion_info` (subscribe / pay). */
const CONVERSION_INFO_KEYS = [
  'utm_placement',
  'utm_referrer',
  'utm_medium',
  'utm_source',
  'utm_term',
  'utm_content',
  'utm_campaign',
  'conversion_url',
  'landing_url',
  'user_agent',
  'plan',
  'coupon',
  'ref',
  'location',
  'translations',
  'internal_cta_placement',
  'internal_cta_content',
  'internal_cta_campaign',
];

/** UTM keys to flatten at dataLayer root (GTM DLVs expect root-level utms). */
const UTM_DATALAYER_KEYS = [
  'utm_placement',
  'utm_referrer',
  'utm_medium',
  'utm_source',
  'utm_term',
  'utm_content',
  'utm_campaign',
];

function pickKeys(userSession, keys) {
  if (!userSession || typeof userSession !== 'object') return {};

  const out = {};
  keys.forEach((key) => {
    const value = userSession[key];
    if (value === undefined || value === null || value === '') return;
    out[key] = value;
  });
  return out;
}

/**
 * Build conversion_info for apiv2 from userSession (drops cookie pass-through keys).
 */
export function pickConversionInfo(userSession) {
  return pickKeys(userSession, CONVERSION_INFO_KEYS);
}

/**
 * UTM params for dataLayer root (begin_checkout, sign_up, etc.).
 */
export function pickUtmsFromSession(userSession) {
  return pickKeys(userSession, UTM_DATALAYER_KEYS);
}
