import { isWindow } from './src/utils';

const handleEnv = ({ queryString, env }) => {
  let host = env;
  if (isWindow) {
    const urlHost = new URLSearchParams(window.location.search).get(queryString);

    if (urlHost && urlHost[urlHost.length - 1] === '/') urlHost.slice(0, -1);
    if (urlHost) localStorage.setItem('host', urlHost);
    if (localStorage.getItem('host')) host = localStorage.getItem(queryString);
    if (host === 'reset') host = env;
  }

  return host;
};

const modifyEnv = ({ queryString = 'host', env = process.env.BREATHECODE_HOST }) => {
  const host = handleEnv({ queryString, env });

  return host;
};

export default modifyEnv;
