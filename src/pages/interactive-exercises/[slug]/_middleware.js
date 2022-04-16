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
        userPathName === `/default/interactive-exercises/${translations.es}`
        || userPathName === `/es/interactive-exercises/${translations.us}`)
    ) {
      console.log(`Middleware: redirecting from ${userPathName} → /es/interactive-exercises/${translations.es}`);
      return NextResponse.redirect(new URL(`/es/interactive-exercises/${translations.es}`, req.url));
    }

    if (
      translations.us !== undefined && (
        userPathName === `/default/interactive-exercises/${translations.us}`
        || userPathName === `/en/interactive-exercises/${translations.es}`)
    ) {
      console.log(`Middleware: redirecting from ${url.pathname} → /en/interactive-exercises/${translations.us}`);
      return NextResponse.redirect(new URL(`/en/interactive-exercises/${translations.us}`, req.url));
    }
  }
  return '';
};

export default middleware;
