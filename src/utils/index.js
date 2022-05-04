/* eslint-disable indent */
const isWindow = typeof window !== 'undefined';

const HAVE_SESSION = isWindow ? localStorage.getItem('accessToken') !== null : false;
/** @const isDevMode
 * principal use for dibuging for another issues and prevent
 * to create unused console.logs in production
*/
const isDevMode = isWindow && window.location.hostname === 'localhost';

const languageLabel = {
  es: 'Spanish',
  us: 'English',
};

const slugify = (str) => str
  .toLowerCase()
  .trim()
  .replace(/[^\w\s-]/g, '')
  .replace(/[\s_-]+/g, '-')
  .replace(/^-+|-+$/g, '');

const unSlugify = (str) => str
  .replace(/-/g, ' ')
  .replace(/\w\S*/g,
  (txt) => txt.charAt(0) + txt.substr(1).toLowerCase());

const isPlural = (element) => {
  if (element.length > 1) {
    return true;
  }
  return false;
};

const getStorageItem = (key) => {
  if (isWindow) {
    return localStorage.getItem(key);
  }
  return null;
};

const removeStorageItem = (key) => {
  if (isWindow) {
    return localStorage.removeItem(key);
  }
  return null;
};

const includesToLowerCase = (text, keyValue) => text.toLowerCase().includes(keyValue.toLowerCase());

const getExtensionName = (key) => {
  // from: https://github.com/example/ipynbrepo/prob_stats.ipynb
  // to: ipynb
  const extExtractor = /(?:\.([^.]+))?$/;
  return extExtractor.exec(key)[1];
};

const devLog = (msg, ...params) => { // Relevant logs only in dev mode
  if (isDevMode) console.log(`🛠️ ${msg}`, ...params);
};

const devLogTable = (msg, array) => { // Relevant table logs with title only in dev mode
  if (isDevMode) {
    console.group();
      console.log(`%c🛠️${msg}`, 'font-size: 14px');
      console.table(array);
    console.groupEnd();
  }
};

export {
  isWindow,
  HAVE_SESSION,
  slugify,
  unSlugify,
  isPlural,
  getStorageItem,
  includesToLowerCase,
  getExtensionName,
  removeStorageItem,
  isDevMode,
  devLogTable,
  devLog,
  languageLabel,
};
