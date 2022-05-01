import { NextResponse } from 'next/server';
/*
  Redirects in middleware is the same as the one in next.js,
  the diference is that we can make smart redirections with enpoints
  or improve functional queries to the url
*/

const PUBLIC_FILE = /\.(.*)$/;

const stripDefaultLocale = (str) => {
  const stripped = str.replace('/default', '');
  return stripped;
};

const middleware = async (req) => {
  const url = await req.nextUrl.clone();
  const country = req.geo.country?.toLowerCase() || 'us';
  console.log('country:', country);

  const {
    pathname, origin, locale, search,
  } = url;

  if (pathname.includes('/lesson/')) {
    return '';
  }

  // Replace "/default" from locale with "/en"
  const shouldHandleLocale = !PUBLIC_FILE.test(pathname)
    && !pathname.includes('/api/')
    && locale === 'default';

  const redirectURL = `${origin}/en${stripDefaultLocale(pathname)}${search}`;

  return shouldHandleLocale ? NextResponse.redirect(redirectURL) : '';
};

export default middleware;
