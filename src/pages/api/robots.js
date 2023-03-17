export default function handler(req, res) {
  const host = req?.headers?.host;

  if (host === 'https://4geeks.com') {
    res.send(`User-agent: *
Allow: /
Sitemap: https://4geeks.com/sitemap.xml
Host: https://4geeks.com`);
  }
  if (host.includes('dev.4geeks.com')) {
    res.send(`User-agent: *
Disallow: /`);
  }
  if (host.includes('vercel.app')) {
    res.send(`User-agent: *
Disallow: /`);
  }
  return res.send('Nothing to see here');
}
