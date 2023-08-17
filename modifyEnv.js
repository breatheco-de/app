import { isWindow } from './src/utils';

const handleEnv = ({ queryString, env }) => {
  let modifiedEnv = env;
  if (isWindow) {
    const urlHost = new URLSearchParams(window.location.search).get(queryString);
    if (process.env.VERCEL_ENV !== 'production') {
      if (urlHost && urlHost[urlHost.length - 1] === '/') urlHost.slice(0, -1);
      if (urlHost) localStorage.setItem(queryString, urlHost);
      if (localStorage.getItem(queryString)) modifiedEnv = localStorage.getItem(queryString);
      if (modifiedEnv === 'reset') modifiedEnv = env;
      if (modifiedEnv === 'production') modifiedEnv = 'https://breathecode.herokuapp.com';
    }
  }

  return modifiedEnv;
};

const modifyEnv = ({ queryString = 'host', env = process.env.BREATHECODE_HOST }) => {
  const host = handleEnv({ queryString, env });

  return host;
};

export default modifyEnv;
