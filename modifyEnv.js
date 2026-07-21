import { isWindow } from './src/utils';

/**
 * Ensure API hosts are absolute URLs. Values like "breathecode-test.herokuapp.com"
 * (from ?host= or localStorage) are treated as relative paths by axios/fetch and
 * become http://localhost:3000/breathecode-test.herokuapp.com/...
 */
const ensureAbsoluteUrl = (value) => {
  if (!value || typeof value !== 'string') return value;
  const trimmed = value.trim().replace(/\/$/, '');
  if (!trimmed || trimmed === 'reset' || trimmed === 'production') return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

const handleEnv = ({ queryString, env }) => {
  let modifiedEnv = env;
  if (isWindow) {
    const urlHost = new URLSearchParams(window.location.search).get(queryString);
    if (process.env.VERCEL_ENV !== 'production') {
      if (urlHost) {
        localStorage.setItem(queryString, ensureAbsoluteUrl(urlHost));
      }
      if (localStorage.getItem(queryString)) {
        modifiedEnv = localStorage.getItem(queryString);
      }
      if (modifiedEnv === 'reset') {
        localStorage.removeItem(queryString);
        modifiedEnv = env;
      }
      if (modifiedEnv === 'production') modifiedEnv = 'https://breathecode.herokuapp.com';
    }
  }

  return ensureAbsoluteUrl(modifiedEnv);
};

const modifyEnv = ({ queryString = 'host', env = process.env.BREATHECODE_HOST }) => {
  const host = handleEnv({ queryString, env });

  return host;
};

export default modifyEnv;
