const redirectHandler = async (req, conditionalResult, NextResponse, redirectValue) => {
  const url = await req.nextUrl.clone();

  if (conditionalResult) {
    console.log(`Middleware: redirecting from ${url.pathname} → ${redirectValue}`);
    return NextResponse.redirect(new URL(redirectValue, req.url));
  }
  return '';
};

export default redirectHandler;
