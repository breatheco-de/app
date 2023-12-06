export const DOMAIN_NAME = process.env.DOMAIN_NAME || '';
export const BASE_PLAN = process.env.BASE_PLAN || '';
export const BREATHECODE_HOST = process.env.BREATHECODE_HOST || '';
export const WHITE_LABEL_ACADEMY = process.env.WHITE_LABEL_ACADEMY || undefined;
export const ORIGIN_HOST = (typeof window !== 'undefined' && window.location.origin) || DOMAIN_NAME;
export const isWhiteLabelAcademy = typeof DOMAIN_NAME === 'string' && DOMAIN_NAME !== 'https://4geeks.com';
export const excludeCagetoriesFor = {
  lessons: 'how-to,como,blog-us,blog-es',
};
export const categoriesFor = {
  howTo: 'how-to,como',
};
