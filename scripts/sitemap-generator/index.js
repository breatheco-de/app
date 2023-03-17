const fs = require('fs');
const globby = require('globby');

const {
  getPrismicPages, getReadPages, getAsset, getLandingTechnologies,
} = require('./requests');

const createArray = (length) => Array.from({ length }, (_, i) => i);

const engLang = {
  en: 'en',
  us: 'en',
};

const {
  privateRoutes,
  sitemapTemplate,
  listOfSitemapsTemplate,
} = require('./sitemap-config');

require('dotenv').config({
  path: '.env.production',
});

async function generateSitemap() {
  console.log('Generating sitemaps...');

  const prismicPages = await getPrismicPages();
  const readPages = await getReadPages();
  const lessonsPages = await getAsset('lesson');
  const exercisesPages = await getAsset('exercise');
  const projectsPages = await getAsset('project');
  const howTosPages = await getAsset('article').then(
    (data) => data.filter((l) => l?.category?.slug === 'how-to' || l?.category?.slug === 'como'),
  );
  const technologyLandingPages = await getLandingTechnologies();

  const pagination = (data, conector) => {
    const limit = 20;
    const dataFilteredEng = data.filter((f) => f.lang === 'us' || f.lang === 'en');
    const dataFilteredEsp = data.filter((f) => f.lang === 'es');

    const pagesEng = Math.ceil(dataFilteredEng.length / limit);
    const pagesEsp = Math.ceil(dataFilteredEsp.length / limit);

    const paginatedEng = createArray(pagesEng).map((el) => `/${conector}?page=${el + 1}`);
    const paginatedEsp = createArray(pagesEsp).map((el) => `/es/${conector}?page=${el + 1}`);

    const paginated = [...paginatedEng, ...paginatedEsp];

    return paginated;
  };

  const generateSlugByLang = (data, conector, withDifficulty) => data.map((l) => (withDifficulty
    ? `${engLang[l.lang] !== 'en' ? `/${l.lang}` : ''}${conector ? `/${conector}` : ''}/${l?.difficulty ? l?.difficulty?.toLowerCase() : 'unknown'}/${l?.slug}`
    : `${engLang[l.lang] !== 'en' ? `/${l.lang}` : ''}${conector ? `/${conector}` : ''}/${l?.slug}`));
  const generateSlug = (data, conector) => data.map((l) => `${conector ? `/${conector}` : ''}/${l?.slug}`);

  const generateTechnologySlug = (data, conector) => (data?.length > 0 ? data.map(
    (l) => (`/${conector}/${l.slug}`),
  ) : []);

  const generatePrismicSlugByLang = (data) => {
    const typePage = data?.length > 0 && data.filter((p) => p.type === 'page');

    const routesList = data?.length > 0 ? typePage.map((l) => {
      const lang = l.lang.split('-')[0];
      if (lang !== 'en') {
        return `/${lang}/${l?.uid}`;
      }
      return `/${l?.uid}`;
    }) : [];
    return routesList;
  };

  const prismicTypePages = generatePrismicSlugByLang(prismicPages);
  const readRoute = generateSlug(readPages, 'read');
  const lessonsRoute = generateSlugByLang(lessonsPages, 'lesson');

  const paginatedLessonsRoute = pagination(lessonsPages, 'lessons');
  const paginatedExercisesRoute = pagination(lessonsPages, 'interactive-exercises');
  const paginatedProjectsRoute = pagination(lessonsPages, 'interactive-coding-tutorials');
  const paginatedHowTosRoute = pagination(lessonsPages, 'how-to');

  const exercisesRoute = generateSlugByLang(exercisesPages, 'interactive-exercise');
  const projectsCodingRoute = generateSlugByLang(projectsPages, 'interactive-coding-tutorial');

  const howTosRoute = generateSlugByLang(howTosPages, 'how-to');
  const technologyLessonsRoute = generateTechnologySlug(technologyLandingPages, 'lessons/technology');
  const technologyExercisesRoute = generateTechnologySlug(technologyLandingPages, 'interactive-exercises/technology');
  const technologyProjectsRoute = generateTechnologySlug(technologyLandingPages, 'interactive-coding-tutorials/technology');
  const allTechnologiesRoute = generateTechnologySlug(technologyLandingPages, 'technology');

  // excludes Nextjs files and API routes.
  const pages = await globby([
    'src/pages/**/*{.js,.jsx}',
    '!src/pages/**/[slug]/*{.js,.jsx}',
    '!src/pages/**/[slug]{.js,.jsx}',
    '!src/pages/**/[uid]{.js,.jsx}',
    '!src/pages/**/[technology]*{.js,.jsx}',
    '!src/pages/**/[technology]/*{.js,.jsx}',
    '!src/pages/edit-markdown.jsx',
    ...privateRoutes,
    '!src/pages/**/_*{.js,.jsx}',
    '!src/pages/api',
  ]);

  const pagesSitemap = sitemapTemplate([
    ...pages, ...readRoute, ...prismicTypePages, ...paginatedLessonsRoute,
    ...paginatedExercisesRoute, ...paginatedProjectsRoute, ...paginatedHowTosRoute,
  ]);
  const howToSitemap = sitemapTemplate(howTosRoute);
  const lessonsSitemap = sitemapTemplate(lessonsRoute);
  const projectsSitemap = sitemapTemplate(projectsCodingRoute);
  const exercisesSitemap = sitemapTemplate(exercisesRoute);
  const technologiesSitemap = sitemapTemplate([...technologyLessonsRoute, ...technologyExercisesRoute, ...technologyProjectsRoute, ...allTechnologiesRoute]);

  const sitemap = listOfSitemapsTemplate([
    'pages-sitemap.xml',
    'howto-sitemap.xml',
    'lessons-sitemap.xml',
    'projects-sitemap.xml',
    'exercises-sitemap.xml',
    'technologies-sitemap.xml',
  ]);

  try {
    fs.writeFileSync('public/pages-sitemap.xml', pagesSitemap);
    fs.writeFileSync('public/howto-sitemap.xml', howToSitemap);
    fs.writeFileSync('public/lessons-sitemap.xml', lessonsSitemap);
    fs.writeFileSync('public/projects-sitemap.xml', projectsSitemap);
    fs.writeFileSync('public/exercises-sitemap.xml', exercisesSitemap);
    fs.writeFileSync('public/technologies-sitemap.xml', technologiesSitemap);
  } catch (err) {
    console.error("Couldn't write sitemaps files", err);
  }

  fs.writeFileSync('public/sitemap.xml', sitemap);

  console.log('Sitemaps generated!');
}
generateSitemap();
