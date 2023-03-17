import { NextResponse } from 'next/server';
import aliasRedirects from '../../public/alias-redirects.json';
import { redirectHandler } from '../lib/redirectsHandler';

function middleware(req) {
  const url = req.nextUrl;
  const { pathname, locale } = url;

  const currentProject = aliasRedirects.find((item) => item?.source === pathname);
  const conditionalResult = () => {
    if (currentProject?.type === 'PROJECT-REROUTE' && currentProject?.source) {
      return true;
    }
    if (currentProject?.source && locale === 'en' && !currentProject?.destination.includes('/en/')) {
      return true;
    }
    return false;
  };

  return redirectHandler(req, conditionalResult(), NextResponse, currentProject?.destination);
}
export default middleware;
