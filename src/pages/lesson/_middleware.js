import { NextResponse } from 'next/server';

const middleware = async (req) => {
  const url = await req.nextUrl.clone();
  const { slug } = req.page.params;
  const userPathName = new URL(req.url).pathname;

  const results = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/asset/${slug}`)
    .then((res) => res.json())
    .catch((err) => console.log(err));
  const { translations } = results;

  /*
    spanish handler:
      [x] /lesson/aprender-a-programar => /es/lesson/aprender-a-programar
      [x] /es/lesson/learn-to-code => /es/lesson/aprender-a-programar
      [x] /es/lesson/aprender-a-programar => no redirect, just show lesson content
  */
  if (results.status_code !== 404) {
    if (
      translations.es !== undefined && (
        userPathName === `/default/lesson/${translations.es}`
        || userPathName === `/es/lesson/${translations.us}`)
    ) {
      console.log(`Middleware: redirecting from ${userPathName} → /es/lesson/${translations.es}`);
      return NextResponse.redirect(new URL(`/es/lesson/${translations.es}`, req.url));
    }

    /*
      english handler:
        [x] /lesson/learn-to-code => /en/lesson/learn-to-code
        [x] /en/lesson/aprender-a-programar => /en/lesson/learn-to-code
        [x] /en/lesson/learn-to-code => no redirect, just show lesson content
    */
    if (
      translations.us !== undefined && (
        userPathName === `/default/lesson/${translations.us}`
        || userPathName === `/en/lesson/${translations.es}`)
    ) {
      console.log(`Middleware: redirecting from ${url.pathname} → /en/lesson/${translations.us}`);
      return NextResponse.redirect(new URL(`/en/lesson/${translations.us}`, req.url));
    }
  }
  return '';
};

export default middleware;
