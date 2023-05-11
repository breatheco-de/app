import { NextResponse } from 'next/server';
import aliasRedirects from '../../public/alias-redirects.json';
import { redirectHandler } from '../lib/redirectsHandler';

function middleware(req) {
  const url = req.nextUrl;
  const { pathname } = url;

  const currentProject = aliasRedirects.find((item) => {
    const sourceWithEngPrefix = `/en${item?.source}`;
    const destinationIsNotEqualToSource = item?.source !== item?.destination && sourceWithEngPrefix !== item?.destination;

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

  return redirectHandler(req, conditionalResult(), NextResponse, currentProject?.destination);
}
export default middleware;
