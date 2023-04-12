import { NextResponse } from 'next/server';
import aliasRedirects from '../../public/alias-redirects.json';
import { redirectHandler } from '../lib/redirectsHandler';

function middleware(req) {
  const url = req.nextUrl;
  const { pathname } = url;

  const currentProject = aliasRedirects.find((item) => item?.source === pathname);
  const conditionalResult = () => {
    if (currentProject?.type === 'PROJECT-REROUTE' && currentProject?.source) {
      return true;
    }
    if (currentProject?.source) {
      return true;
    }
    return false;
  };

  return redirectHandler(req, conditionalResult(), NextResponse, currentProject?.destination);
}
export default middleware;
