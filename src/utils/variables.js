import modifyEnv from '../../modifyEnv';

export const DOMAIN_NAME = process.env.DOMAIN_NAME || '';
export const BASE_PLAN = process.env.BASE_PLAN || '';

export const resolveCheckoutPlanSlug = (queryPlan, isWhiteLabel, academyDefaultPlan) => {
  if (queryPlan) return queryPlan;
  if (isWhiteLabel) return academyDefaultPlan || BASE_PLAN;
  return '';
};
export const BASE_COURSE = process.env.BASE_COURSE || '';
export const IP_API_KEY = process.env.NEXT_PUBLIC_IP_API_KEY || '';
export const BREATHECODE_HOST = modifyEnv({ queryString: 'host', env: process.env.BREATHECODE_HOST || '' });
export const RIGOBOT_HOST = modifyEnv({ queryString: 'host_rigo', env: process.env.RIGOBOT_HOST || '' });
export const WHITE_LABEL_ACADEMY = process.env.WHITE_LABEL_ACADEMY || undefined;
export const ORIGIN_HOST = (typeof window !== 'undefined' && window.location.origin) || DOMAIN_NAME;
const normalizedDomainName = typeof DOMAIN_NAME === 'string'
  ? DOMAIN_NAME.trim().replace(/\/$/, '')
  : '';

/** True when DOMAIN_NAME is set and is not the main 4Geeks site. */
export const isWhiteLabelAcademy = normalizedDomainName.length > 0
  && normalizedDomainName !== 'https://4geeks.com';

/**
 * Prismic CMS is opt-in for builds/deploys.
 * Set PRISMIC_ENABLED=true (and valid PRISMIC_API / PRISMIC_REF) to turn it back on.
 */
export const isPrismicEnabled = process.env.PRISMIC_ENABLED === 'true';

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

export const defaultProfiles = [{
  user: {
    id: -1,
    first_name: 'Andrea',
    last_name: 'Vega',
    profile: {
      avatar_url: 'https://randomuser.me/api/portraits/women/2.jpg',
      github_username: null,
    },
  },
},
{
  user: {
    id: -2,
    first_name: 'Luis',
    last_name: 'Diaz',
    profile: {
      avatar_url: 'https://randomuser.me/api/portraits/men/1.jpg',
      github_username: null,
    },
  },
},
{
  user: {
    id: -3,
    first_name: 'Tomas',
    last_name: 'Gonzalez',
    profile: {
      avatar_url: 'https://ca.slack-edge.com/T0BFXMWMV-U03T95TLQMC-b3d800f56e90-512',
      github_username: null,
    },
  },
},
];
