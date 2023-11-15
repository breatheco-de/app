import { ORIGIN_HOST } from '../../utils/variables';

export default function handler(req, res) {
  const vercelEnv = process.env.VERCEL_ENV;

  if (vercelEnv === 'production') {
    res.end(`User-agent: *
Allow: /
Disallow: /static/
Disallow: /_next/
Disallow: /*.json$
Disallow: /docs/*
Sitemap: ${ORIGIN_HOST}/sitemap.xml
Host: ${ORIGIN_HOST}`);
  }
  if ((vercelEnv === 'preview' || vercelEnv === 'development') && vercelEnv !== 'production') {
    res.end(`User-agent: *
Disallow: /static/
Disallow: /_next/
Disallow: /`);
  }
}
