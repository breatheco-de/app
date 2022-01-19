export const isAbsoluteUrl = (url) => /^[a-z][a-z0-9+.-]*:/.test(url);

export const getUrlProps = (url) => new URL(url);
