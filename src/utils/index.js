/* eslint-disable indent */
const isWindow = typeof window !== 'undefined';

const HAVE_SESSION = isWindow ? localStorage.getItem('accessToken') !== null : false;
/** @const isDevMode
 * principal use for dibuging for another issues and prevent
 * to create unused console.logs in production
*/
const isDevMode = isWindow && window.location.hostname === 'localhost';

const languageLabel = {
  es: 'spanish',
  us: 'english',
};

const assetTypeValues = {
  read: 'LESSON',
  practice: 'EXERCISE',
  code: 'PROJECT',
  answer: 'QUIZ',
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

const cleanQueryStrings = (url) => url.split('?')[0];

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

const setStorageItem = (key, value) => {
  if (isWindow) {
    return localStorage.setItem(key, value);
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

const objectAreNotEqual = (t1, t2) => Object.keys(t1).map((l) => t1[l] === t2[l]).includes(false);

function removeURLParameter(url, parameter) {
  const urlparts = url.split('?');
  if (urlparts.length >= 2) {
      const prefix = `${encodeURIComponent(parameter)}=`;
      const pars = urlparts[1].split(/[&;]/g);

      // reverse iteration as may be destructive
      // eslint-disable-next-line no-plusplus
      for (let i = pars.length; i-- > 0;) {
          // idiom for string.startsWith
          if (pars[i].lastIndexOf(prefix, 0) !== -1) {
              pars.splice(i, 1);
          }
      }

      return urlparts[0] + (pars.length > 0 ? `?${pars.join('&')}` : '');
  }
  return url;
}

export {
  isWindow, assetTypeValues, HAVE_SESSION, slugify, unSlugify,
  isPlural, getStorageItem, includesToLowerCase, getExtensionName,
  removeStorageItem, isDevMode, devLogTable, devLog, languageLabel,
  objectAreNotEqual, cleanQueryStrings, removeURLParameter,
  setStorageItem,
};
