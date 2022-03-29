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
    const redirectStruct = {
      x /en/lesson/aprender-a-programar => takes you to /en/lesson/learn-to-code
      x /lesson/aprender-a-programar => takes you to /es/lesson/aprender-a-programar
      x /es/lesson/learn-to-code => takes you to /es/lesson/aprender-a-programar
      x? /lesson/learn-to-code => takes you to /en/lesson/learn-to-code
      x /es/lesson/aprender-a-programar => no redirect, just show lesson content
      x /en/lesson/learn-to-code => no redirect, just show lesson content
    }
  */

  // spanish handler
  if (
    userPathName === `/default/lesson/${translations.es}`
    || userPathName === `/es/lesson/${translations.us}`
  ) {
    console.log(`Middleware: redirecting from ${userPathName} → /es/lesson/${translations.es}`);
    return NextResponse.redirect(new URL(`/es/lesson/${translations.es}`, req.url));
  }

  // english handler
  if (
    userPathName === `/default/lesson/${translations.us}`
    || userPathName === `/en/lesson/${translations.es}`
  ) {
    console.log(`new change in conditional === ${userPathName}`);
    console.log(`Middleware: redirecting from ${url.pathname} → /en/lesson/${translations.us}`);
    return NextResponse.redirect(new URL(`/en/lesson/${translations.us}`, req.url));
  }
  return '';
};

export default middleware;
