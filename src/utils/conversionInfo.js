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

/**
 * Build conversion_info for apiv2 from userSession (drops cookie pass-through keys).
 */
export function pickConversionInfo(userSession) {
  if (!userSession || typeof userSession !== 'object') return {};

  const out = {};
  CONVERSION_INFO_KEYS.forEach((key) => {
    const value = userSession[key];
    if (value === undefined || value === null || value === '') return;
    out[key] = value;
  });
  return out;
}
