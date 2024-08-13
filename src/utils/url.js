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

const parseQuerys = (query, connector = false) => {
  let queryString = '';
  try {
    Object.keys(query).forEach((key) => {
      // query[key] !== undefined && query[key] !== null
      if (query[key] !== undefined) {
        if (connector) {
          queryString += `&${key}=${query[key]}`;
        }
        if (!connector && query[key] !== undefined) {
          queryString += `${queryString ? '&' : '?'}${key}=${query[key]}`;
        }
      }
    });
  } catch (e) {
    return console.error('🛠️ parseQuerys error:', e);
  }
  return queryString;
};

const getPrismicPagesUrls = (prismicPagesList) => {
  const onlyUrlsList = prismicPagesList.map(prismicPage => {
    if (prismicPage.lang.includes('es')) return `/es/${prismicPage.uid}`;

    return `/${prismicPage.uid}`;
  })

  return onlyUrlsList;
}

export {
  isAbsoluteUrl,
  getUrlProps,
  urlExists,
  parseQuerys,
  getPrismicPagesUrls,
};
