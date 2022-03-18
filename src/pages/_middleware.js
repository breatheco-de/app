import { NextResponse } from 'next/server';
import redirects from '../lib/redirects.json';
/*
  The implementation of redirect in middleware is the same as the one in next.js,
  the diference is that we can make smart redirects with backend
  or add functional queries to the url
*/

const middleware = async (req) => {
  const url = await req.nextUrl.clone();
  // We can make userful improvements with cookies and middleware here
  const token = await req.cookies.accessToken || '';
  const privateRoutes = ['/choose-program', '/syllabus/', '/cohort/'];

  // logical and fast redirection when token exists
  if (url.pathname === '/login') {
    if (token) {
      const sessionRedirection = `/${token ? 'choose-program' : 'login'}`;
      return NextResponse.redirect(new URL(sessionRedirection, req.url));
    }
  }
  // console.log('privRoute:::', privateRoutes, url.pathname, privateRoutes.includes(url.pathname));
  if (!token && privateRoutes.includes(url.pathname)) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const currentPathname = url.pathname.toLowerCase();
  const start = Date.now();

  // Find the redirect from the local JSON file, do note this JSON shouldn't be
  // large, as the space in Edge Functions is quite limited
  const localRedirect = (redirects)[currentPathname];
  if (localRedirect) {
    const destinationFound = `${localRedirect.destination}?l=${start - Date.now()}`;
    return NextResponse.redirect(new URL(destinationFound, req.url));
  }
  return console.log('Middleware triggered');
};

export default middleware;
