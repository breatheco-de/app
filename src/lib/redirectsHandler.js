const redirectByAsset = async ({
  req, pathConector, results, userPathName, NextResponse, aliasRedirect = false,
}) => {
  // const url = await req.nextUrl.clone();
  const { translations } = results;
  const pagePath = pathConector;

  if (results && aliasRedirect) {
    console.log('redirected by alias endpoint');
    return NextResponse.redirect(new URL(aliasRedirect, req.url));
  }

  if (results.status_code !== 404) {
    /*
      spanish handler:
        [-] /lesson/aprender-a-programar => /es/lesson/aprender-a-programar
        [x] /es/lesson/learn-to-code => /es/lesson/aprender-a-programar
        [x] /es/lesson/aprender-a-programar => no redirect, just show lesson content
  */
    if (
      translations.es !== undefined && (
        userPathName === `/default/${pagePath}/${translations.es}`
        || userPathName === `/es/${pagePath}/${translations.us}`)
    ) {
      console.log(`Middleware: redirecting from ${userPathName} → /es/${pagePath}/${translations.es}`);
      return NextResponse.redirect(new URL(`/es/${pagePath}/${translations.es}`, req.url));
    }

    /*
      english handler:
        [-] /lesson/learn-to-code => /en/lesson/learn-to-code
        [x] /en/lesson/aprender-a-programar => /en/lesson/learn-to-code
        [x] /en/lesson/learn-to-code => no redirect, just show lesson content
    */
    if (
      translations.us !== undefined && (
        userPathName === `/default/${pagePath}/${translations.us}`
        || userPathName === `/${pagePath}/${translations.es}`)
    ) {
      console.log(`Middleware: redirecting from ${userPathName} → /${pagePath}/${translations.us}`);
      return NextResponse.redirect(new URL(`/${pagePath}/${translations.us}`, req.url));
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

const publicRedirectByAsset = ({
  router, aliasRedirect, translations, userPathName, pagePath, isPublic = false,
}) => {
  const translationUs = translations?.us || translations?.en;

  if (aliasRedirect) {
    return router.push(userPathName);
  }
  if (!isPublic) {
    if (translations?.es !== undefined && (
      userPathName === `/default/${pagePath}/${translations.es}`
      || userPathName === `/es/${pagePath}/${translationUs}`)
    ) {
      console.log(`Page: redirecting from ${userPathName} → ${`/es/${pagePath}/${translations.es}`}`);
      router.push(`/es/${pagePath}/${translations.es}`);
    }

    if (
      translationUs !== undefined && (
        userPathName === `/default/${pagePath}/${translationUs}`
        || userPathName === `/en/${pagePath}/${translations.es}`)
    ) {
      console.log(`Page: redirecting from ${userPathName} → ${`/${pagePath}/${translationUs}`}`);
      router.push(`/en/${pagePath}/${translationUs}`);
    }
  }
  return '';
};

export {
  redirectHandler,
  redirectByAsset,
  publicRedirectByAsset,
};
