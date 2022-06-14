const { default: axios } = require('axios');
const fs = require('fs');
const globby = require('globby');

const BREATHECODE_HOST = process.env.BREATHECODE_HOST || 'https://breathecode-test.herokuapp.com';
const SYLLABUS = process.env.SYLLABUS || 'full-stack,web-development';

// const languages = {
//   us: 'en',
//   en: 'en',
//   es: 'es',
// };

const getReadPages = () => {
  const resp = axios.get(
    `${BREATHECODE_HOST}/v1/admissions/public/syllabus?slug=${SYLLABUS}`,
  )
    .then((res) => res.data)
    .catch((err) => console.log(err));
  return resp;
};

const getLessons = () => {
  const data = axios.get(`${BREATHECODE_HOST}/v1/registry/asset?type=lesson`)
    .then((res) => res.data)
    .catch((err) => console.log(err));
  return data;
};

const getExercises = () => {
  const data = axios.get(`${BREATHECODE_HOST}/v1/registry/asset?type=exercise&big=true`)
    .then((res) => res.data)
    .catch((err) => console.log(err));
  return data;
};

const getProjects = () => {
  const data = axios.get(`${BREATHECODE_HOST}/v1/registry/asset?type=project`)
    .then((res) => res.data)
    .catch((err) => console.log(err));
  return data;
};

const getHowTo = () => {
  const data = axios.get(`${BREATHECODE_HOST}/v1/registry/asset?type=ARTICLE`)
    .then((res) => res.data)
    .catch((err) => console.log(err));
  return data;
};

function addPage(page) {
  const path = page.replace('src/pages', '').replace('/index', '').replace('.jsx', '').replace('.js', '');
  const route = path === '/index' ? '' : path;
  const websiteUrl = process.env.WEBSITE_URL || 'https://4geeks.com';
  return `  <url>
    <loc>${`${websiteUrl}${route}`}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>`;
}

const privateRoutes = [
  '!src/pages/**/[cohortSlug]/[slug]/[version]/*{.js,.jsx}',
  '!src/pages/**/[cohortSlug]/[lesson]/[lessonSlug]/*{.js,.jsx}',
  '!src/pages/profile/*{.js,.jsx}',
  '!src/pages/choose-program/*{.js,.jsx}',
];

async function generateSitemap() {
  if (process.env.NODE_ENV === 'development') return;

  const readPages = await getReadPages();
  const lessonsPages = await getLessons();
  const exercisesPages = await getExercises();
  const projectsPages = await getProjects();
  const howTosPages = await getHowTo();

  const generateSlugByLang = (data, conector, withDifficulty) => data.filter(
    (f) => f.lang === 'us', // canonical pages
  ).map((l) => (withDifficulty
    ? `/${conector}/${l.difficulty.toLowerCase()}/${l.slug}`
    : `/${conector}/${l.slug}`));

  const readRoute = generateSlugByLang(readPages, 'read');
  const lessonsRoute = generateSlugByLang(lessonsPages, 'lesson');
  const exercisesRoute = generateSlugByLang(exercisesPages, 'interactive-exercise');
  const projectsCodingRoute = generateSlugByLang(projectsPages, 'interactive-coding-tutorial', true);
  // const projectsRoute = generateSlugByLang(projectsPages, 'project'); // non-canonical
  const howTosRoute = generateSlugByLang(howTosPages, 'how-to');

  // excludes Nextjs files and API routes.
  const pages = await globby([
    'src/pages/**/*{.js,.jsx}',
    '!src/pages/**/[slug]/*{.js,.jsx}',
    '!src/pages/**/[slug]{.js,.jsx}',
    ...privateRoutes,
    '!src/pages/**/_*{.js,.jsx}',
    '!src/pages/api',
  ]);
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${[
    ...pages,
    ...readRoute,
    ...lessonsRoute,
    ...exercisesRoute,
    // ...projectsRoute,
    ...projectsCodingRoute,
    ...howTosRoute,
  ].map(addPage).join('\n')}
</urlset>`;
  fs.writeFileSync('public/sitemap.xml', sitemap);
}
generateSitemap();
