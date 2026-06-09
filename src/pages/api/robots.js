import { ORIGIN_HOST } from '../../utils/variables';

export default function handler(req, res) {
  const vercelEnv = process.env.VERCEL_ENV;
  const host = (req.headers.host || '').toLowerCase();
  const originHost = ORIGIN_HOST.toLowerCase();
  const isNoIndexHost = host.includes('learn.4geeks.com') || originHost.includes('learn.4geeks.com');
  const shouldNoIndex = process.env.ROBOTS_NOINDEX === 'true' || isNoIndexHost;

  if (shouldNoIndex) {
    res.end(`User-agent: *
Disallow: /`);
    return;
  }

  if (vercelEnv === 'production') {
    res.end(`User-agent: *
Allow: /
Disallow: /ask.4geeks.com/
Disallow: /ask2.4geeks.com/
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
