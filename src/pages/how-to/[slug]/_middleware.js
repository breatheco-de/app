import { NextResponse } from 'next/server';
import { redirectByAsset } from '../../../lib/redirectsHandler';

const middleware = async (req) => {
  const { slug } = req.page.params;
  const userPathName = new URL(req.url).pathname;

  const results = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/asset/${slug}`)
    .then((res) => res.json())
    .catch((err) => console.log(err));

  return redirectByAsset({
    req, slug, results, userPathName, NextResponse,
  });
};

export default middleware;
