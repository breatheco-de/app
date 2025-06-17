import { NextResponse } from 'next/server';
import aliasRedirects from '../public/alias-redirects.json';
import redirectsFromApi from '../public/redirects-from-api.json';
import staticRedirects from '../public/redirects.json';
import { log } from './utils/logging';

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|static|_next/static|_next/image|favicon.ico).*)',
  ],
};

async function middleware(req) {
  const url = req.nextUrl.clone();
  const { href, origin } = url;
  let fullPath = href.replace(origin, '');

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
    const destinationUrl = `${origin}${currentProject.destination}`;
    if (destinationUrl === href) {
      log('Middleware: already on destination URL, skipping redirect.');
      return NextResponse.next();
    }

    log(`Middleware: redirecting from ${href} → ${currentProject.destination}`);
    return NextResponse.redirect(destinationUrl, 301);
  }

  return NextResponse.next();
}

export default middleware;
