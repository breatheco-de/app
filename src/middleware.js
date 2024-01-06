import { NextResponse } from 'next/server';
import aliasRedirects from '../public/alias-redirects.json';
import redirectsFromApi from '../public/redirects-from-api.json';
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
  const url = await req.nextUrl.clone();
  const { origin, pathname } = url;

  const aliasAndLessonRedirects = [...aliasRedirects, ...redirectsFromApi];
  const currentProject = aliasAndLessonRedirects.find((item) => {
    const sourceWithEngPrefix = `/en${item?.source}`;
    const destinationIsNotEqualToSource = item?.source !== item?.destination && sourceWithEngPrefix !== item?.destination;

    if (url.href.includes(item?.destination)) return false;
    if (item?.source === pathname && destinationIsNotEqualToSource) return true;
    return false;
  });

  const conditionalResult = () => {
    if (currentProject?.type === 'PROJECT-REROUTE' && currentProject?.source) {
      return true;
    }
    if (currentProject?.source) {
      return true;
    }
    return false;
  };

  if (conditionalResult()) {
    log(`Middleware: redirecting from ${pathname} → ${currentProject?.destination}`);
    return NextResponse.redirect(`${origin}${currentProject?.destination || ''}`);
  }
  return NextResponse.next();
}
export default middleware;
