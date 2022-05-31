import { NextResponse } from 'next/server';
import { redirectByAsset } from '../../lib/redirectsHandler';

const middleware = async (req) => {
  const { slug } = req.page.params;
  const currentPathName = new URL(req.url).pathname;
  const pathConector = 'lesson';

  const alias = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/alias/redirect`);
  const aliasList = await alias.json();
  const redirectSlug = aliasList[slug] || slug;

  const data = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/asset/${redirectSlug}`);
  const results = await data.json();

  const pathWithoutSlug = currentPathName.slice(0, currentPathName.lastIndexOf('/'));
  const userPathName = `${pathWithoutSlug}/${results.slug || slug}`;

  const aliasRedirect = aliasList[slug] !== undefined && userPathName;

  return redirectByAsset({
    req, pathConector, results, aliasRedirect, userPathName, NextResponse,
  });
};

export default middleware;
