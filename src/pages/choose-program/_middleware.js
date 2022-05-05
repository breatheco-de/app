import { NextResponse } from 'next/server';
import { redirectHandler } from '../../lib/redirectsHandler';

const middleware = async (req) => {
  const token = await req.cookies.accessToken;

  return redirectHandler(req, !token, NextResponse, '/login');
};
export default middleware;
