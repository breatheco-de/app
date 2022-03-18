import { NextResponse } from 'next/server';
import redirects from '../lib/redirects.json';
/*
  The implementation of redirect in middleware is the same as the one in next.js,
  the diference is that we can make smart redirects with backend
  or add functional queries to the url
*/

const middleware = async (req) => {
  const url = await req.nextUrl.clone();
  const currentPathname = url.pathname.toLowerCase();
  const start = Date.now();

  // Find the redirect from the local JSON file, do note this JSON shouldn't be
  // large, as the space in Edge Functions is quite limited
  const localRedirect = (redirects)[currentPathname];
  if (localRedirect) {
    const destinationFound = `${localRedirect.destination}?l=${start - Date.now()}`;
    return NextResponse.redirect(new URL(destinationFound, req.url));
  }
  return '';
};

export default middleware;
