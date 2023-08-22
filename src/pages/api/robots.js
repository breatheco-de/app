export default function handler(req, res) {
  const vercelEnv = process.env.VERCEL_ENV;

  if (vercelEnv === 'production') {
    res.end(`User-agent: *
Allow: /
Disallow: /static/
Disallow: /_next/
Disallow: /*.json$
Sitemap: https://4geeks.com/sitemap.xml
Host: https://4geeks.com`);
  }
  if ((vercelEnv === 'preview' || vercelEnv === 'development') && vercelEnv !== 'production') {
    res.end(`User-agent: *
Disallow: /static/
Disallow: /_next/
Disallow: /`);
  }
}
