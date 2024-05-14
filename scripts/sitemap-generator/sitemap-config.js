import { DOMAIN_NAME } from '../../src/utils/variables';

const websiteUrl = process.env.DOMAIN_NAME || 'https://4geeks.com';

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
  return `${index === 0 ? '<url>' : '  <url>'}
    <loc>${`${websiteUrl}${route}`}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${getFrequently(route)}</changefreq>
    <priority>${getPriotity(route)}</priority>
  </url>`;
}
function addPageWithHrefLang(pagePath, index, data) {
  const path = pagePath.replace('src/pages', '').replace('/index', '').replace('.jsx', '').replace('.js', '');
  const route = path === '/index' ? '' : path;
  const translations = data?.translations || {};
  const alternateLanguages = Array.isArray(data?.alternate_languages) ? data?.alternate_languages : [];
  const locationLang = {
    us: 'en',
    en: 'en',
    es: 'es',
  };

  const languagesArr = [
    ...alternateLanguages,
    {
      id: data?.id,
      type: data?.type,
      lang: data?.lang,
      uid: data?.uid,
    },
  ];

  const translationsArr = languagesArr?.map((tr) => ({
    [tr.lang.split('-')[0]]: tr.uid,
  }));
  const prismicTranslations = {
    ...translationsArr?.reduce((acc, curr) => ({ ...acc, ...curr }), {}),
  };
  const translationInEnglish = prismicTranslations?.en || translations?.en || translations?.us;
  const translationInSpanish = prismicTranslations.es || translations?.es;

  const translationArray = [
    {
      value: 'en',
      lang: 'en',
      slug: (data?.lang === 'en' || data?.lang === 'us') ? (data?.uid || data?.slug) : translationInEnglish,
      link: `/${data?.connector ? `${data?.connector}/` : ''}${(data?.lang === 'en' || data?.lang === 'us') ? (data?.uid || data?.slug) : translationInEnglish}`,
    },
    {
      value: 'es',
      lang: 'es',
      slug: data?.lang === 'es' ? (data?.uid || data?.slug) : translationInSpanish,
      link: `/es/${data?.connector ? `${data?.connector}/` : ''}${data?.lang === 'es' ? (data?.uid || data?.slug) : translationInSpanish}`,
    },
  ].filter((item) => item?.slug !== undefined);

  const hreflangs = translationArray.length > 1 ? translationArray.map((translation) => {
    const lang = translation?.lang;
    const urlAlternate = `${DOMAIN_NAME}${translation.link}`;

    return ['default', 'us', 'en'].includes(lang) ? `<xhtml:link rel="alternate" hreflang="x-default" href="${urlAlternate}" />
    <xhtml:link rel="alternate" hreflang="${locationLang[lang] || 'en'}" href="${urlAlternate}" />` : `
    <xhtml:link rel="alternate" hrefLang="${locationLang[lang]}" href="${urlAlternate}" />`;
  }) : '';
  return `${index === 0 ? '<url>' : '  <url>'}
    <loc>${`${websiteUrl}${route}`}</loc>
    ${hreflangs}
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${getFrequently(route)}</changefreq>
    <priority>${getPriotity(route)}</priority>
  </url>`;
}
function addSitemap(page, index) {
  return `${index === 0 ? '<sitemap>' : '  <sitemap>'}
    <loc>${websiteUrl}/${page}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`;
}

const sitemapTemplate = (pages = [], externalContent = '') => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  ${externalContent}  
  ${[
    ...pages,
  ].map(addPage).join('\n')}
</urlset>`;
const sitemapTemplateWithHreflangConnector = (pages = []) => `${pages.map((page, index) => addPageWithHrefLang(page.pathURL, index, page)).join('\n')}`;
const sitemapTemplateWithHreflang = (pages = []) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  ${pages.map((page, index) => addPageWithHrefLang(page.pathURL, index, page)).join('\n')}
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
  '!src/pages/**/[cohortSlug]/student/[studentId]/*{.js,.jsx}',
  '!src/pages/**/[cohortSlug]/student/[studentId]/assignment/[assignmentId]/*{.js,.jsx}',
  '!src/pages/survey/[surveyId]/*{.js,.jsx}',
  '!src/pages/profile/*{.js,.jsx}',
  '!src/pages/choose-program/*{.js,.jsx}',
  '!src/pages/example{.js,.jsx}',
  '!src/pages/mentorship{.js,.jsx}',
  '!src/pages/slice-simulator.jsx',
  '!src/pages/**/[id]{.js,.jsx}',
  '!src/pages/thumbnail.jsx',
];

export {
  privateRoutes,
  sitemapTemplate,
  sitemapTemplateWithHreflang,
  sitemapTemplateWithHreflangConnector,
  listOfSitemapsTemplate,
};
