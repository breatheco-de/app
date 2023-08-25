const getFrequently = (route) => {
  if (
    route.includes('/interactive-exercises')
    || route.includes('/interactive-coding-tutorial')
    || route.includes('/how-to')
    || route.includes('/read/')
    || route.includes('/lessons')
    || route.includes('/about-us')
    || route.includes('/login')
    || route.includes('/workshops')
    || route === ''
  ) return 'weekly';
  if (
    route.includes('/lesson/')
    || route.includes('/project/')
    || route.includes('/interactive-exercise/')
    || route.includes('/how-to/')
  ) return 'monthly';
  return 'yearly';
};
const getPriotity = (route) => {
  if (route.includes('/how-to')) return '0.9';
  if (route.includes('/lessons') || route.includes('/read/')) return '0.8';
  if (route.includes('/interactive-exercises')) return '0.7';
  if (route.includes('/interactive-coding-tutorial')) return '0.6';
  if (route.includes('/workshops')) return '0.5';
  return '0.6';
};

function addPage(page, index) {
  const path = page.replace('src/pages', '').replace('/index', '').replace('.jsx', '').replace('.js', '');
  const route = path === '/index' ? '' : path;
  const websiteUrl = process.env.WEBSITE_URL || 'https://4geeks.com';
  return `${index === 0 ? '<url>' : '  <url>'}
    <loc>${`${websiteUrl}${route}`}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${getFrequently(route)}</changefreq>
    <priority>${getPriotity(route)}</priority>
  </url>`;
}
function addSitemap(page, index) {
  const websiteUrl = process.env.WEBSITE_URL || 'https://4geeks.com';
  return `${index === 0 ? '<sitemap>' : '  <sitemap>'}
    <loc>${websiteUrl}/${page}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`;
}

const sitemapTemplate = (pages = []) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${[
    ...pages,
  ].map(addPage).join('\n')}
</urlset>`;

const listOfSitemapsTemplate = (pages = []) => `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${[
    ...pages,
  ].map(addSitemap).join('\n')}
</sitemapindex>`;

const privateRoutes = [
  '!src/pages/**/[cohortSlug]/*{.js,.jsx}',
  '!src/pages/**/[cohortSlug]/[slug]/[version]/*{.js,.jsx}',
  '!src/pages/**/[cohortSlug]/[lesson]/[lessonSlug]/*{.js,.jsx}',
  '!src/pages/survey/[surveyId]/*{.js,.jsx}',
  '!src/pages/profile/*{.js,.jsx}',
  '!src/pages/choose-program/*{.js,.jsx}',
  '!src/pages/example{.js,.jsx}',
  '!src/pages/mentorship{.js,.jsx}',
];

module.exports = {
  privateRoutes,
  sitemapTemplate,
  listOfSitemapsTemplate,
};
