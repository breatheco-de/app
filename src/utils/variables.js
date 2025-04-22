import modifyEnv from '../../modifyEnv';

export const DOMAIN_NAME = process.env.DOMAIN_NAME || '';
export const BASE_PLAN = process.env.BASE_PLAN || '';
export const BASE_COURSE = process.env.BASE_COURSE || '';
export const BREATHECODE_HOST = modifyEnv({ queryString: 'host', env: process.env.BREATHECODE_HOST || '' });
export const RIGOBOT_HOST = modifyEnv({ queryString: 'host_rigo', env: process.env.RIGOBOT_HOST || '' });
export const WHITE_LABEL_ACADEMY = process.env.WHITE_LABEL_ACADEMY || undefined;
export const ORIGIN_HOST = (typeof window !== 'undefined' && window.location.origin) || DOMAIN_NAME;
export const isWhiteLabelAcademy = typeof DOMAIN_NAME === 'string' && DOMAIN_NAME !== 'https://4geeks.com';
export const excludeCagetoriesFor = {
  lessons: 'how-to,como,blog-us,blog-es',
};
export const categoriesFor = {
  howTo: 'how-to,como',
};

export const currenciesSymbols = {
  USD: '$',
  EUR: '€',
};

export const SILENT_CODE = {
  USER_EXISTS: 'user-exists',
  USER_INVITE_ACCEPTED_EXISTS: 'user-invite-exists-status-accepted',
  EMAIL_NOT_VALIDATED: 'email-not-validated',
  CARD_ERROR: 'card-error',
  LIST_PROCESSING_ERRORS: ['rate-limit-error', 'invalid-request', 'authentication-error', 'payment-service-are-down', 'stripe-error'],
  UNEXPECTED_EXCEPTION: 'unexpected-exception',
};
