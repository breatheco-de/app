import { NextResponse } from 'next/server';
import { redirectHandler } from '../../lib/redirectsHandler';

// TODO: Delete middleware redirections when all redirections are done
const middleware = async (req) => {
  const token = await req.cookies.accessToken;
  const queryToken = await req.nextUrl.searchParams.get('token');
  const isAuth = queryToken || token;

  return redirectHandler(req, !isAuth, NextResponse, '/login');
};
export default middleware;
