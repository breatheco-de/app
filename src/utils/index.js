const isWindow = typeof window !== 'undefined';

const HAVE_SESSION = isWindow ? localStorage.getItem('accessToken') !== null : false;

export {
  isWindow,
  HAVE_SESSION,
};
