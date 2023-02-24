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

const parseQuerys = (query) => {
  let queryString = '';
  try {
    Object.keys(query).forEach((key) => {
      if (query[key] !== undefined && query[key] !== null) {
        queryString += `${queryString ? '&' : '?'}${key}=${query[key]}`;
      }
    });
  } catch (e) {
    return '';
  }
  return queryString;
};

export {
  isAbsoluteUrl,
  getUrlProps,
  urlExists,
  parseQuerys,
};
