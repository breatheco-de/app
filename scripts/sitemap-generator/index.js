const fs = require('fs');
const globby = require('globby');

const {
  getPrismicPages, getReadPages, getLessons, getExercises, getProjects, getHowTo,
  getLandingTechnologies,
} = require('./requests');

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
  const lessonsPages = await getLessons();
  const exercisesPages = await getExercises();
  const projectsPages = await getProjects();
  const howTosPages = await getHowTo();
  const technologyLandingPages = await getLandingTechnologies();

  const generateSlugByLang = (data, conector, withDifficulty) => data.filter(
    (f) => f.lang === 'us', // canonical pages
  ).map((l) => (withDifficulty
    ? `${conector ? `/${conector}` : ''}/${l?.difficulty ? l?.difficulty?.toLowerCase() : 'unknown'}/${l?.slug}`
    : `${conector ? `/${conector}` : ''}/${l?.slug}`));

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
  const readRoute = generateSlugByLang(readPages, 'read');
  const lessonsRoute = generateSlugByLang(lessonsPages, 'lesson');
  const exercisesRoute = generateSlugByLang(exercisesPages, 'interactive-exercise');
  const projectsCodingRoute = generateSlugByLang(projectsPages, 'interactive-coding-tutorial', true);
  // const projectsRoute = generateSlugByLang(projectsPages, 'project'); // non-canonical
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

  const pagesSitemap = sitemapTemplate([...pages, ...readRoute, ...prismicTypePages]);
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
