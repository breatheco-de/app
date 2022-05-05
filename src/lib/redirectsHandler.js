const redirectByAsset = async ({
  req, pathConector, results, userPathName, pathWithDifficulty = false, difficulty, NextResponse,
}) => {
  const url = await req.nextUrl.clone();
  const { translations } = results;
  const pagePath = pathWithDifficulty ? `${pathConector}/${difficulty}` : pathConector;

  if (results.status_code !== 404) {
    if (
      translations.es !== undefined && (
        userPathName === `/default/${pagePath}/${translations.es}`
        || userPathName === `/es/${pagePath}/${translations.us}`)
    ) {
      console.log(`Middleware: redirecting from ${userPathName} → /es/${pagePath}/${translations.es}`);
      return NextResponse.redirect(new URL(`/es/${pagePath}/${translations.es}`, req.url));
    }

    if (
      translations.us !== undefined && (
        userPathName === `/default/${pagePath}/${translations.us}`
        || userPathName === `/en/${pagePath}/${translations.es}`)
    ) {
      console.log(`Middleware: redirecting from ${url.pathname} → /en/${pagePath}/${translations.us}`);
      return NextResponse.redirect(new URL(`/en/${pagePath}/${translations.us}`, req.url));
    }
  }
  return '';
};

const redirectHandler = async (req, conditionalResult, NextResponse, redirectValue) => {
  const url = await req.nextUrl.clone();

  if (conditionalResult) {
    console.log(`Middleware: redirecting from ${url.pathname} → ${redirectValue}`);
    return NextResponse.redirect(new URL(redirectValue, req.url));
  }
  return '';
};

export {
  redirectHandler,
  redirectByAsset,
};
