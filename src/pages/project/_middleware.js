import { NextResponse } from 'next/server';

const middleware = async (req) => {
  const url = await req.nextUrl.clone();
  const { slug } = req.page.params;
  const userPathName = new URL(req.url).pathname;

  const results = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/asset/${slug}`)
    .then((res) => res.json())
    .catch((err) => console.log(err));
  const { translations } = results;

  if (results.status_code !== 404) {
    if (
      translations.es !== undefined && (
        userPathName === `/default/project/${translations.es}`
        || userPathName === `/project/${translations.es}`
        || userPathName === `/es/project/${translations.us}`)
    ) {
      console.log(`Middleware: redirecting from ${userPathName} → /en/project/${translations.us}`);
      return NextResponse.redirect(new URL(`/es/project/${translations.es}`, req.url));
    }

    if (
      translations.us !== undefined && (
        userPathName === `/default/project/${translations.us}`
        || userPathName === `/project/${translations.us}`
        || userPathName === `/en/project/${translations.es}`)
    ) {
      console.log(`Middleware: redirecting from ${url.pathname} → /en/project/${translations.us}`);
      return NextResponse.redirect(new URL(`/en/project/${translations.us}`, req.url));
    }
  }
  return '';
};

export default middleware;
