const isAbsoluteUrl = (url) => /^[a-z][a-z0-9+.-]*:/.test(url);

const getUrlProps = (url) => new URL(url);

const urlExists = (url, callback) => {
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
      callback(xhr.status < 400);
    }
  };
  xhr.open('HEAD', url);
  xhr.send();
};

const parseQuerys = (query) => Object.keys(query)
  .map((key) => (query[key] !== undefined ? `${key}=${query[key]}` : ''))
  .join('&');

export {
  isAbsoluteUrl,
  getUrlProps,
  urlExists,
  parseQuerys,
};
