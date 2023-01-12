const { default: axios } = require('axios');
const fs = require('fs');
const globby = require('globby');
require('dotenv').config({
  path: '.env.development',
});

const BREATHECODE_HOST = process.env.BREATHECODE_HOST || 'https://breathecode-test.herokuapp.com';
const SYLLABUS = process.env.SYLLABUS || 'full-stack,web-development';

const getReadPages = () => {
  const resp = axios.get(
    `${BREATHECODE_HOST}/v1/admissions/public/syllabus?slug=${SYLLABUS}`,
  )
    .then((res) => res.data)
    .catch((err) => console.log(err));
  return resp;
};

const getLessons = () => {
  const data = axios.get(`${BREATHECODE_HOST}/v1/registry/asset?type=lesson&limit=1000`)
    .then((res) => res.data.results)
    .catch((err) => console.log(err));
  return data;
};

const getExercises = () => {
  const data = axios.get(`${BREATHECODE_HOST}/v1/registry/asset?type=exercise&limit=1000`)
    .then((res) => res.data.results)
    .catch((err) => console.log(err));
  return data;
};

const getProjects = () => {
  const data = axios.get(`${BREATHECODE_HOST}/v1/registry/asset?type=project&limit=1000`)
    .then((res) => res.data.results)
    .catch((err) => console.log(err));
  return data;
};

const getHowTo = () => {
  const data = axios.get(`${BREATHECODE_HOST}/v1/registry/asset?type=ARTICLE&limit=1000`)
    .then((res) => res.data.results.filter((l) => l?.category?.slug === 'how-to' || l?.category?.slug === 'como'))
    .catch((err) => console.log(err));
  return data;
};

const getLandingTechnologies = () => {
  const technologies = axios.get(`${BREATHECODE_HOST}/v1/registry/academy/technology`, {
    headers: {
      Authorization: `Token ${process.env.BC_ACADEMY_TOKEN}`,
      Academy: 4,
    },
  })
    .then((res) => res.data)
    .catch((err) => console.log(err));

  return technologies;
};

const getFrequently = (route) => {
  if (
    route.includes('/interactive-exercises')
    || route.includes('/interactive-coding-tutorial')
    || route.includes('/how-to')
    || route.includes('/read/')
    || route.includes('/lessons')
    || route.includes('/about-us')
    || route.includes('/login')
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

function addPage(page) {
  const path = page.replace('src/pages', '').replace('/index', '').replace('.jsx', '').replace('.js', '');
  const route = path === '/index' ? '' : path;
  const websiteUrl = process.env.WEBSITE_URL || 'https://4geeks.com';
  return `  <url>
    <loc>${`${websiteUrl}${route}`}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${getFrequently(route)}</changefreq>
    <priority>0.9</priority>
  </url>`;
}

const sitemapTemplate = (pages = []) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${[
    ...pages,
  ].map(addPage).join('\n')}
</urlset>`;

const privateRoutes = [
  '!src/pages/**/[cohortSlug]/[slug]/[version]/*{.js,.jsx}',
  '!src/pages/**/[cohortSlug]/[lesson]/[lessonSlug]/*{.js,.jsx}',
  '!src/pages/survey/[surveyId]/*{.js,.jsx}',
  '!src/pages/profile/*{.js,.jsx}',
  '!src/pages/choose-program/*{.js,.jsx}',
  '!src/pages/example{.js,.jsx}',
];

async function generateSitemap() {
  console.log('Generating sitemaps...');

  const readPages = await getReadPages();
  const lessonsPages = await getLessons();
  const exercisesPages = await getExercises();
  const projectsPages = await getProjects();
  const howTosPages = await getHowTo();
  const technologyLandingPages = await getLandingTechnologies();

  const generateSlugByLang = (data, conector, withDifficulty) => data.filter(
    (f) => f.lang === 'us', // canonical pages
  ).map((l) => (withDifficulty
    ? `/${conector}/${l?.difficulty ? l?.difficulty?.toLowerCase() : 'unknown'}/${l?.slug}`
    : `/${conector}/${l?.slug}`));

  const generateTechnologySlug = (data, conector) => data.map(
    (l) => (`/${conector}/${l.slug}`),
  );

  const readRoute = generateSlugByLang(readPages, 'read');
  const lessonsRoute = generateSlugByLang(lessonsPages, 'lesson');
  const exercisesRoute = generateSlugByLang(exercisesPages, 'interactive-exercise');
  const projectsCodingRoute = generateSlugByLang(projectsPages, 'interactive-coding-tutorial', true);
  // const projectsRoute = generateSlugByLang(projectsPages, 'project'); // non-canonical
  const howTosRoute = generateSlugByLang(howTosPages, 'how-to');
  const technologyLessonsRoute = generateTechnologySlug(technologyLandingPages, 'lessons/technology');
  const technologyExercisesRoute = generateTechnologySlug(technologyLandingPages, 'interactive-exercises/technology');
  const technologyProjectsRoute = generateTechnologySlug(technologyLandingPages, 'interactive-coding-tutorials/technology');

  // excludes Nextjs files and API routes.
  const pages = await globby([
    'src/pages/**/*{.js,.jsx}',
    '!src/pages/**/[slug]/*{.js,.jsx}',
    '!src/pages/**/[slug]{.js,.jsx}',
    '!src/pages/**/[technology]*{.js,.jsx}',
    '!src/pages/**/[technology]/*{.js,.jsx}',
    '!src/pages/edit-markdown.jsx',
    ...privateRoutes,
    '!src/pages/**/_*{.js,.jsx}',
    '!src/pages/api',
  ]);

  const pagesSitemap = sitemapTemplate([...pages, ...readRoute]);
  const howToSitemap = sitemapTemplate(howTosRoute);
  const lessonsSitemap = sitemapTemplate(lessonsRoute);
  const projectsSitemap = sitemapTemplate(projectsCodingRoute);
  const exercisesSitemap = sitemapTemplate(exercisesRoute);
  const technologiesSitemap = sitemapTemplate([...technologyLessonsRoute, ...technologyExercisesRoute, ...technologyProjectsRoute]);

  fs.writeFileSync('public/pages-sitemap.xml', pagesSitemap);
  fs.writeFileSync('public/howto-sitemap.xml', howToSitemap);
  fs.writeFileSync('public/lessons-sitemap.xml', lessonsSitemap);
  fs.writeFileSync('public/projects-sitemap.xml', projectsSitemap);
  fs.writeFileSync('public/exercises-sitemap.xml', exercisesSitemap);
  fs.writeFileSync('public/technologies-stiemap.xml', technologiesSitemap);

  console.log('Sitemaps generated!');
}
generateSitemap();
