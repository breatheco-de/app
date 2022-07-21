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

const getLandingTechnologies = () => {
  const technologies = axios.get(`${BREATHECODE_HOST}/v1/registry/academy/technology`, {
    headers: {
      Authorization: 'Token ec12d799b6c5a17061f8e8e52490417d99460fb9',
      Academy: 4,
    },
  })
    .then((res) => res.data)
    .catch((err) => console.log(err));

  console.log('technologies:::', technologies);

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

const privateRoutes = [
  '!src/pages/**/[cohortSlug]/[slug]/[version]/*{.js,.jsx}',
  '!src/pages/**/[cohortSlug]/[lesson]/[lessonSlug]/*{.js,.jsx}',
  '!src/pages/survey/[surveyId]/*{.js,.jsx}',
  '!src/pages/profile/*{.js,.jsx}',
  '!src/pages/choose-program/*{.js,.jsx}',
  '!src/pages/example{.js,.jsx}',
];

async function generateSitemap() {
  if (process.env.NODE_ENV === 'development') return;

  const readPages = await getReadPages();
  const lessonsPages = await getLessons();
  const exercisesPages = await getExercises();
  const projectsPages = await getProjects();
  const howTosPages = await getHowTo();
  const technologyLandingPages = await getLandingTechnologies();

  const generateSlugByLang = (data, conector, withDifficulty) => data.filter(
    (f) => f.lang === 'us', // canonical pages
  ).map((l) => (withDifficulty
    ? `/${conector}/${l.difficulty.toLowerCase()}/${l.slug}`
    : `/${conector}/${l.slug}`));

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
    ...technologyLessonsRoute,
    ...exercisesRoute,
    ...technologyExercisesRoute,
    // ...projectsRoute,
    ...projectsCodingRoute,
    ...technologyProjectsRoute,
    ...howTosRoute,
  ].map(addPage).join('\n')}
</urlset>`;
  fs.writeFileSync('public/sitemap.xml', sitemap);
}
generateSitemap();
