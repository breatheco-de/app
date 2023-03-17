export default function handler(req, res) {
  const host = req?.headers?.host;
  const vercelEnv = process.env.VERCEL_ENV;

  if (vercelEnv === 'production') {
    res.end(`User-agent: *
Allow: /
Sitemap: https://4geeks.com/sitemap.xml
Host: https://4geeks.com`);
  }
  if (vercelEnv === 'preview' || vercelEnv === 'development') {
    res.end(`User-agent: *
Disallow: /`);
  }

  res.end(`current host: ${host}, env: ${vercelEnv}`);
}
