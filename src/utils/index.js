const isWindow = typeof window !== 'undefined';

const HAVE_SESSION = isWindow ? localStorage.getItem('accessToken') !== null : false;

const slugify = (str) => str
  .toLowerCase()
  .trim()
  .replace(/[^\w\s-]/g, '')
  .replace(/[\s_-]+/g, '-')
  .replace(/^-+|-+$/g, '');

const isPlural = (element) => {
  if (element.length > 1) {
    return true;
  }
  return false;
};

export {
  isWindow,
  HAVE_SESSION,
  slugify,
  isPlural,
};
