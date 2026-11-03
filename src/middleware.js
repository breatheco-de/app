import { NextResponse } from 'next/server';
import aliasRedirects from '../public/alias-redirects.json';
import redirectsFromApi from '../public/redirects-from-api.json';
import staticRedirects from '../public/redirects.json';
import { log } from './utils/logging';
import {
  SESSION_COOKIE_NAME,
  COOKIE_MAX_AGE_SECONDS,
  getParentCookieDomain,
  captureAttributionFromSearch,
} from './utils/sessionCookie';

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|static|_next|favicon.ico).*)',
  ],
};

function applyAttributionCookie(req, response) {
  const encoded = captureAttributionFromSearch(
    req.cookies.get(SESSION_COOKIE_NAME)?.value,
    req.nextUrl.searchParams,
  );
  if (!encoded) return response;

  const cookie = {
    name: SESSION_COOKIE_NAME,
    value: encoded,
    path: '/',
    maxAge: COOKIE_MAX_AGE_SECONDS,
    sameSite: 'lax',
  };
  if (req.nextUrl.protocol === 'https:') cookie.secure = true;
  const domain = getParentCookieDomain(req.nextUrl.hostname);
  if (domain) cookie.domain = domain;

  response.cookies.set(cookie);
  return response;
}

async function middleware(req) {
  const url = req.nextUrl.clone();
  const { href, origin, searchParams, pathname } = url;
  let fullPath = pathname;
  log('DEBUG fullPath:', fullPath, 'search:', url.search);

  if (pathname.startsWith('/_next/') || req.headers.get('x-nextjs-data') === '1') {
    return NextResponse.next();
  }

  const assetPagePatterns = [
    /^\/how-to\/[^/]+$/,
    /^\/es\/how-to\/[^/]+$/,
    /^\/como\/[^/]+$/,
    /^\/es\/como\/[^/]+$/,
    /^\/lesson\/[^/]+$/,
    /^\/es\/lesson\/[^/]+$/,
    /^\/interactive-coding-tutorial\/[^/]+$/,
    /^\/es\/interactive-coding-tutorial\/[^/]+$/,
    /^\/interactive-exercise\/[^/]+$/,
    /^\/es\/interactive-exercise\/[^/]+$/,
  ];

  const isIndividualPage = assetPagePatterns.some((pattern) => pattern.test(pathname));

  if (isIndividualPage) {
    const invalidParams = [
      'page', // should not be in individual assets
      'slug',
      'search',
      'techs',
      'difficulty',
      'withVideo',
    ];
    let hasInvalidParams = false;

    invalidParams.forEach((param) => {
      if (searchParams.has(param)) {
        searchParams.delete(param);
        hasInvalidParams = true;
      }
    });

    if (hasInvalidParams) {
      url.search = searchParams.toString();
      log(`Middleware: removing invalid params from individual page: ${pathname}`);
      log(`Middleware: redirecting ${href} → ${url.toString()}`);
      return applyAttributionCookie(req, NextResponse.redirect(url, 301));
    }
  }
  const localeMatch = fullPath.match(/^\/(es|en|us)(\/|$)/);
  const localePrefix = localeMatch ? localeMatch[1] : null;

  if (localePrefix) {
    fullPath = fullPath.replace(`/${localePrefix}`, '');
  }

  const allRedirects = [...staticRedirects, ...aliasRedirects, ...redirectsFromApi];

  const currentProject = allRedirects.find((item) => {
    const normalizedSource = item.source.endsWith('/') ? item.source.slice(0, -1) : item.source;
    const normalizedPath = fullPath.endsWith('/') ? fullPath.slice(0, -1) : fullPath;

    return (
      normalizedSource === normalizedPath || normalizedSource === `/${localePrefix}${normalizedPath}`
    ) && item.source !== item.destination;
  });

  // Evitar redirecciones infinitas
  if (currentProject) {
    const destinationUrl = `${origin}${currentProject.destination}${url.search}`;
    if (destinationUrl === href) {
      log('Middleware: already on destination URL, skipping redirect.');
      return applyAttributionCookie(req, NextResponse.next());
    }

    log(`Middleware: redirecting from ${href} → ${currentProject.destination}`);
    return applyAttributionCookie(req, NextResponse.redirect(destinationUrl, 301));
  }

  return applyAttributionCookie(req, NextResponse.next());
}

export default middleware;
