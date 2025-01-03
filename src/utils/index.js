/* eslint-disable indent */
import { addDays, format, isAfter } from 'date-fns';
import { es } from 'date-fns/locale';

const isWindow = typeof window !== 'undefined';

const HAVE_SESSION = isWindow ? localStorage.getItem('accessToken') !== null : false;
/** @const isDevMode
 * principal use for dibuging for another issues and prevent
 * to create unused console.logs in production
*/
const isDevMode = process.env.VERCEL_ENV !== 'production' || process.env.NODE_ENV !== 'production';

const languageLabel = {
  es: 'spanish',
  us: 'english',
};

const assetTypeValues = {
  read: 'LESSON',
  practice: 'EXERCISE',
  project: 'PROJECT',
  answer: 'QUIZ',
};

const slugify = (str) => (typeof str === 'string' ? str
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .trim()
  .replace(/[^\w\s-]/g, '')
  .replace(/[\s_-]+/g, '-')
  .replace(/^-+|-+$/g, '')
  : '');

const unSlugify = (str, capitalize = false) => (typeof str === 'string'
  ? str
    .replace(/-/g, ' ')
    .replace(
      /\w\S*/g,
      (txt) => {
        const firstLetter = capitalize ? txt.charAt(0).toUpperCase() : txt.charAt(0);
        return firstLetter + txt.substring(1).toLowerCase();
      },
    )
  : '');

const unSlugifyCapitalize = (str) => (typeof str === 'string' ? str
  .replace(/-/g, ' ')
  .replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase(),
  )
  : '');

function slugToTitle(slug) {
  if (slug === undefined) return '';
  return slug.split('-').map(
    (word, i) => {
      if (i === 0) return word.charAt(0).toUpperCase() + word.slice(1);
      return word.charAt(0) + word.slice(1);
    },
  ).join(' ').replace(/([A-Z])/g, ' $1')
    .trim();
}

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
const tokenExists = String(getStorageItem('accessToken')).length > 5;

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
const removeSessionStorageItem = (key) => {
  if (isWindow) {
    return sessionStorage.removeItem(key);
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
  if (isDevMode) console.log(`[🛠️ DEV LOG] ${msg}`, ...params);
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

const getNextDateInMonths = (months = 1) => {
  const today = new Date();
  const nextMonth = new Date();
  nextMonth.setMonth(today.getMonth() + months);

  const shortWeekDays = {
    en: format(new Date(nextMonth), 'MMM do, YYY'),
    es: format(new Date(nextMonth), "dd 'de' MMMM, YYY", { locale: es }),
  };
  return {
    date: nextMonth,
    translation: shortWeekDays,
  };
};

const getTimeProps = (date) => {
  const kickoffDate = {
    en: date?.kickoff_date && format(new Date(date.kickoff_date), 'MMMM do YYY'),
    es:
      date?.kickoff_date
      && format(new Date(date.kickoff_date), "d 'de' MMMM YYY", { locale: es }),
  };
  const weekDays = {
    en: date.timeslots?.length > 0 && date.timeslots.map((l) => (l.starting_at && format(new Date(l.starting_at), 'EEEE'))),
    es: date.timeslots?.length > 0 && date.timeslots.map((l) => (l.starting_at && format(new Date(l.starting_at), 'EEEE', { locale: es }))),
  };
  const shortWeekDays = {
    en: date.timeslots?.length > 0 && date.timeslots.map((l) => (l.starting_at && format(new Date(l.starting_at), 'EEE'))),
    es: date.timeslots?.length > 0 && date.timeslots.map((l) => (l.starting_at && format(new Date(l.starting_at), 'EEE', { locale: es }))),
  };
  const getHours = (time) => new Date(time).toLocaleTimeString([], { timeZone: 'UTC', hour: '2-digit', minute: '2-digit' });
  const availableTime = date.timeslots.length > 0 && `${getHours(date.timeslots[0].starting_at)} - ${getHours(date.timeslots[0].ending_at)}`;

  return {
    kickoffDate,
    weekDays,
    shortWeekDays,
    availableTime,
  };
};

// convert the input array to camel case
const toCapitalize = (input = '') => input.charAt(0).toUpperCase() + input.toLowerCase().slice(1);

const capitalizeFirstLetter = (str = '') => str.charAt(0).toUpperCase() + str.slice(1);

function formatBytes(bytes, decimals = 2) {
  if (!+bytes) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
}

const resizeMasonryItem = (item) => {
  /* Get the grid object, its row-gap, and the size of its implicit rows */
  const grid = document.getElementsByClassName('masonry')[0];
  // eslint-disable-next-line radix
  const rowGap = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-row-gap'));
  // eslint-disable-next-line radix
  const rowHeight = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-auto-rows'));

  /*
   * Spanning for any brick = S
   * Grid's row-gap = G
   * Size of grid's implicitly create row-track = R
   * Height of item content = H
   * Net height of the item = H1 = H + G
   * Net height of the implicit row-track = T = G + R
   * S = H1 / T
   */

  // We add the 2 to include the height od the 'Read Lesson' link
  const rowSpan = Math.ceil((item.querySelector('.masonry-content').getBoundingClientRect().height + rowGap) / (rowHeight + rowGap)) + 3;

  /* Set the spanning as calculated above (S) */
  // eslint-disable-next-line no-param-reassign
  item.style.gridRowEnd = `span ${rowSpan}`;
};

const resizeAllMasonryItems = () => {
  // Get all item class objects in one list
  const allItems = document.getElementsByClassName('masonry-brick');

  /*
   * Loop through the above list and execute the spanning function to
   * each list-item (i.e. each masonry item)
   */
  for (let i = 0; i < allItems.length; i += 1) {
    resizeMasonryItem(allItems[i]);
  }
};

const calcSVGViewBox = (pathId) => {
  if (typeof document !== 'undefined') {
    const svg = document.querySelector(pathId);
    if (svg) {
      const clientRect = svg?.getBBox();

      const viewBox = `${clientRect.x} ${clientRect.y} ${clientRect.width} ${clientRect.height}`;
      return viewBox;
    }
  }
  return '';
};

const number2DIgits = (number) => number.toString().padStart(2, '0');

const sortToNearestTodayDate = (data, minutes = 30) => {
  // sort date to the nearest today date and 30minutes after starting time
  const currentDate = new Date();
  if (data === undefined || data?.length === 0) return [];

  const filteredDates = data.filter((item) => {
    const endDate = item.ended_at || item.ending_at;
    const startingDate = new Date(item.starting_at);
    const endingDate = new Date(endDate);
    const timeDiff = startingDate - currentDate;
    const minutesDiff = Math.round(timeDiff / (1000 * 60));

    const hasStarted = startingDate < currentDate;
    const isGoingToStartInAnyMin = (minutesDiff >= 0 && minutesDiff <= minutes) || hasStarted;
    const hasExpired = endingDate < currentDate;

    return isGoingToStartInAnyMin && !hasExpired;
  });
  const sortedDates = filteredDates.sort((a, b) => new Date(a.starting_at) - new Date(b.starting_at));

  return sortedDates;
};

const isNumber = (value) => Number.isFinite(Number(value)); // number or string with number (without letters)

const isValidDate = (dateString) => !Number.isNaN(Date.parse(dateString));

const isDateMoreThanAnyDaysAgo = (date, days = 7) => {
  const now = new Date();
  const AnyDaysAgo = addDays(now, days);
  return isAfter(date, AnyDaysAgo);
};

const getQueryString = (key, def) => {
  const urlParams = isWindow && new URLSearchParams(window.location.search);
  return urlParams && (urlParams.get(key) || def);
};

const createArray = (length) => Array.from({ length }, (_, i) => i);
const lengthOfString = (string) => (typeof string === 'string' ? string?.replaceAll(/\s/g, '').length : 0);

const syncInterval = (callback = () => { }) => {
  const now = new Date();
  const secondsToNextMinute = 60 - now.getSeconds();

  setTimeout(() => {
    callback();
    setInterval(callback, 60 * 1000);
  }, secondsToNextMinute * 1000);
};

function getBrowserSize() {
  if (isWindow) {
    const width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    const height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    return { width, height };
  }
  return {};
}

function calculateDifferenceDays(date) {
  const now = new Date();
  const givenDate = new Date(date);

  // Convert dates to milliseconds
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const diffInMilliseconds = givenDate - now;

  // Calculate the difference in days by rounding down
  const diffInDays = Math.floor(diffInMilliseconds / millisecondsPerDay);

  return {
    isRemainingToExpire: diffInMilliseconds > 0,
    result: Math.abs(diffInDays),
  };
}

const intervalToHours = (duration) => {
  const hours = duration.years * 24 * 365 // Hours from years (assuming 365 days per year)
    + duration.months * 24 * 30 // Hours from months (assuming 30 days per month)
    + duration.days * 24 // Hours from days
    + duration.hours
    + duration.minutes / 60 // Convert minutes to hours
    + duration.seconds / 3600;
  return hours;
};

function adjustNumberBeetwenMinMax({ number = 1, min = 1, max = 10 }) {
  const range = max - min;
  const overflow = (number - max) % range;
  const underflow = (min - number) % range;
  if (number > max) {
    return max - overflow;
  }
  if (number < min) {
    return max - underflow;
  }
  return number;
}

function getDiscountedPrice({ numItems, maxItems, discountRatio, bundleSize, pricePerUnit, startDiscountFrom = 0 }) {
  if (numItems > maxItems) {
    console.log('numItems cannot be greater than maxItems');
  }

  let totalDiscountRatio = 0;
  let currentDiscountRatio = discountRatio;
  const discountNerf = 0.1;
  const maxDiscount = 0.2;

  for (let i = startDiscountFrom; i < Math.floor(numItems / bundleSize); i += 1) {
    totalDiscountRatio += currentDiscountRatio;
    currentDiscountRatio -= currentDiscountRatio * discountNerf;
  }

  if (totalDiscountRatio > maxDiscount) {
    totalDiscountRatio = maxDiscount;
  }

  const amount = pricePerUnit * numItems;
  const discount = amount * totalDiscountRatio;

  return {
    original: amount,
    discounted: amount - discount,
  };
}

const formatPrice = (price = 0, hideDecimals = false) => {
  if (price % 1 === 0) {
    return hideDecimals ? `$${price.toFixed(0)}` : `$${price.toFixed(2)}`;
  }
  return `$${price.toFixed(2)}`;
};

const location = isWindow && window.location;

const url = isWindow && new URL(window.location.href);

function cleanObject(obj) {
  const cleaned = {};

  Object.keys(obj).forEach((key) => {
    if (obj[key] !== undefined && obj[key] !== null) {
      if (Array.isArray(obj[key]) && obj[key].length === 0) {
        return; // Ignore empty arrays
      }
      cleaned[key] = obj[key];
    }
  });

  return cleaned;
}

function decodeBase64(encoded) {
  // Decode from base64 and convert to UTF-8 and remove � characters if they exist
  const decoded = new TextDecoder('utf-8')
    .decode(Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0)))
    .replace(/�/g, '');

  return decoded;
}

const languageFix = (text, lan) => text?.[lan] || text?.us || text;

export {
  isWindow, assetTypeValues, HAVE_SESSION, slugify, unSlugify, unSlugifyCapitalize, location,
  isPlural, getStorageItem, includesToLowerCase, getExtensionName,
  removeStorageItem, isDevMode, devLogTable, devLog, languageLabel,
  objectAreNotEqual, cleanQueryStrings, removeURLParameter,
  setStorageItem, toCapitalize, tokenExists, getTimeProps, formatBytes,
  resizeAllMasonryItems, calcSVGViewBox, number2DIgits, getNextDateInMonths,
  sortToNearestTodayDate, isNumber, isDateMoreThanAnyDaysAgo, getQueryString, isValidDate,
  createArray, url, lengthOfString, syncInterval, getBrowserSize, calculateDifferenceDays, intervalToHours, capitalizeFirstLetter,
  adjustNumberBeetwenMinMax, getDiscountedPrice, formatPrice, cleanObject, slugToTitle, decodeBase64,
  removeSessionStorageItem, languageFix,
};
