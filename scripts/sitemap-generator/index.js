const fs = require('fs');
const globby = require('globby');

const {
  getPrismicPages, getReadPages, getAsset, getLandingTechnologies, getEvents,
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
  const lessonsPages = await getAsset('LESSON,ARTICLE&exclude_category=how-to,como');

  const exercisesPages = await getAsset('exercise');
  const projectsPages = await getAsset('project');
  const howTosPages = await getAsset('article').then(
    (data) => data.filter((l) => l?.category?.slug === 'how-to' || l?.category?.slug === 'como'),
  );
  const technologyLandingPages = await getLandingTechnologies();
  const eventsPages = await getEvents();

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

  const generateSlugByLang = (data, conector, withDifficulty) => {
    const filteredBySlug = data.filter((f) => f?.slug);

    return filteredBySlug.map((l) => (withDifficulty
      ? `${engLang[l.lang] !== 'en' ? `${l?.lang ? `/${l?.lang}` : ''}` : ''}${conector ? `/${conector}` : ''}/${l?.difficulty ? l?.difficulty?.toLowerCase() : 'unknown'}/${l?.slug}`
      : `${engLang[l.lang] !== 'en' ? `${l?.lang ? `/${l?.lang}` : ''}` : ''}${conector ? `/${conector}` : ''}/${l?.slug}`));
  };
  const generateSlug = (data, conector) => data.map((l) => `${conector ? `/${conector}` : ''}/${l?.slug}`);

  const generateTechnologySlug = (data, conector, type) => {
    const getLangConnector = (lang) => (lang === 'en' ? '' : `/${lang}`);

    if (type === 'lesson') {
      const lessonsData = data?.length > 0 ? data.filter((l) => {
        const lessonExists = l.assets.some((a) => a?.asset_type === 'LESSON');
        return lessonExists;
      }) : [];
      return lessonsData?.map((l) => (`${getLangConnector(l.lang)}/${conector}/${l?.slug}`));
    }
    if (type === 'exercise') {
      const exercisesData = data?.length > 0 ? data.filter((l) => {
        const assets = l.assets.some((a) => a?.asset_type === 'EXERCISE');
        return assets;
      }) : [];
      return exercisesData?.map((l) => (`${getLangConnector(l.lang)}/${conector}/${l?.slug}`));
    }
    if (type === 'project') {
      const projectsData = data?.length > 0 ? data.filter((l) => {
        const assets = l.assets.some((a) => a?.asset_type === 'PROJECT');
        return assets.length > 0 && (`${getLangConnector(l.lang)}/${conector}/${l?.slug}`);
      }) : [];
      return projectsData;
    }
    if (type === 'tech') {
      return (data?.length > 0 ? data.map(
        (l) => (`${getLangConnector(l.lang)}/${conector}/${l?.slug}`),
      ) : []);
    }
    return '';
  };

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
  const exercisesRoute = generateSlugByLang(exercisesPages, 'interactive-exercise');
  const projectsCodingRoute = generateSlugByLang(projectsPages, 'interactive-coding-tutorial');
  const howTosRoute = generateSlugByLang(howTosPages, 'how-to');
  const eventsRoute = generateSlugByLang(eventsPages, 'workshops');

  const paginatedLessonsRoute = pagination(lessonsPages, 'lessons');
  const paginatedExercisesRoute = pagination(exercisesPages, 'interactive-exercises');
  const paginatedProjectsRoute = pagination(projectsPages, 'interactive-coding-tutorials');
  const paginatedHowTosRoute = pagination(howTosPages, 'how-to');

  const technologyLessonsRoute = generateTechnologySlug(technologyLandingPages, 'lessons/technology', 'lesson');
  const technologyExercisesRoute = generateTechnologySlug(technologyLandingPages, 'interactive-exercises/technology', 'exercise');
  const technologyProjectsRoute = generateTechnologySlug(technologyLandingPages, 'interactive-coding-tutorials/technology', 'project');
  const allTechnologiesRoute = generateTechnologySlug(technologyLandingPages, 'technology', 'tech');

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
  const eventsSitemap = sitemapTemplate(eventsRoute);

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
    fs.writeFileSync('public/events-sitemap.xml', eventsSitemap);
  } catch (err) {
    console.error("Couldn't write sitemaps files", err);
  }

  fs.writeFileSync('public/sitemap.xml', sitemap);

  console.log('Sitemaps generated!');
}
generateSitemap();
