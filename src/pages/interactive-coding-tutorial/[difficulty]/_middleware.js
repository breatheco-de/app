import { NextResponse } from 'next/server';

const middleware = async (req) => {
  const url = await req.nextUrl.clone();
  const { difficulty, slug } = req.page.params;
  const userPathName = new URL(req.url).pathname;

  const results = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/asset/${slug}`)
    .then((res) => res.json())
    .catch((err) => console.log(err));
  const { translations } = results;

  if (results.status_code !== 404) {
    if (
      translations.es !== undefined && (
        userPathName === `/default/interactive-coding-tutorial/${difficulty}/${translations.es}`
        || userPathName === `/es/interactive-coding-tutorial/${difficulty}/${translations.us}`)
    ) {
      console.log(`Middleware: redirecting from ${userPathName} → /es/interactive-coding-tutorial/${translations.es}`);
      return NextResponse.redirect(new URL(`/es/interactive-coding-tutorial/${difficulty}/${translations.es}`, req.url));
    }

    if (
      translations.us !== undefined && (
        userPathName === `/default/interactive-coding-tutorial/${difficulty}/${translations.us}`
        || userPathName === `/en/interactive-coding-tutorial/${difficulty}/${translations.es}`)
    ) {
      console.log(`Middleware: redirecting from ${url.pathname} → /en/interactive-coding-tutorial/${translations.us}`);
      return NextResponse.redirect(new URL(`/en/interactive-coding-tutorial/${difficulty}/${translations.us}`, req.url));
    }
  }
  return '';
};

export default middleware;
