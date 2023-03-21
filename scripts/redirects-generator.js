/* eslint-disable no-param-reassign */
const { default: axios } = require('axios');
const fs = require('fs');
require('dotenv').config({
  path: '.env.production',
});

const BREATHECODE_HOST = process.env.BREATHECODE_HOST || 'https://breathecode-test.herokuapp.com';

const redirectConfig = {
  permanent: true,
};

const getLessons = () => {
  const data = axios.get(`${BREATHECODE_HOST}/v1/registry/asset?asset_type=lesson&limit=1000`)
    .then((res) => res.data.results)
    .catch((err) => console.log(err));
  return data;
};
const getExercises = () => {
  const data = axios.get(`${BREATHECODE_HOST}/v1/registry/asset?asset_type=exercise&limit=1000`)
    .then((res) => res.data.results)
    .catch((err) => console.log(err));
  return data;
};

const getProjects = () => {
  const data = axios.get(`${BREATHECODE_HOST}/v1/registry/asset?asset_type=project&limit=2000`)
    .then((res) => {
      //  if res.data.results in map have difficulty === 'junior' change to 'easy' and if difficulty === 'semi-senior' change to 'intermediate' and if difficulty === 'senior' change to 'hard' and if difficulty === null change to 'unknown'
      const dataCleaned = res.data.results.map((item) => {
        if (item.difficulty?.toLowerCase() === 'junior') {
          item.difficulty = 'easy';
        }
        if (item.difficulty?.toLowerCase() === 'semi-senior') {
          item.difficulty = 'intermediate';
        }
        if (item.difficulty?.toLowerCase() === 'senior') {
          item.difficulty = 'hard';
        }
        if (item.difficulty === null) {
          item.difficulty = 'unknown';
        }
        return item;
      });
      return dataCleaned;
    })
    .catch((err) => console.log(err));
  return data;
};

const getHowTo = () => {
  const data = axios.get(`${BREATHECODE_HOST}/v1/registry/asset?asset_type=ARTICLE&limit=1000`)
    .then((res) => (res.data.results?.length > 0 ? res.data.results.filter((l) => l?.category?.slug === 'how-to' || l?.category?.slug === 'como') : []))
    .catch((err) => console.log(err));
  return data;
};

const getAliasRedirects = async () => {
  const data = axios.get(`${BREATHECODE_HOST}/v1/registry/alias/redirect?academy=4`)
    .then((res) => res.data)
    .catch((err) => {
      console.error('Error getting alias redirects', err);
    });

  return data;
};

const redirectByLang = ({ slug, lang, difficulty, assetType }) => {
  const assetTypeValue = assetType?.toUpperCase();
  if (assetTypeValue === 'LESSON') {
    return {
      source: `/lesson/${slug}`,
      destination: `/${lang}/lesson/${slug}`,
      ...redirectConfig,
    };
  }
  if (assetTypeValue === 'EXERCISE') {
    return {
      source: `/interactive-exercise/${slug}`,
      destination: `/${lang}/interactive-exercise/${slug}`,
      ...redirectConfig,
    };
  }
  if (assetTypeValue === 'PROJECT' && difficulty) {
    return {
      source: `/interactive-coding-tutorial/${slug}`,
      destination: `/${lang}/interactive-coding-tutorial/${slug}`,
      ...redirectConfig,
    };
  }
  if (assetTypeValue === 'ARTICLE') {
    return {
      source: `/how-to/${slug}`,
      destination: `/${lang}/how-to/${slug}`,
      ...redirectConfig,
    };
  }
  return null;
};

const generateAssetRedirect = (pages) => {
  const redirectList = pages.filter((page) => page.lang !== 'us' && page.lang !== 'en' && page.lang !== null)
    .map((page) => {
      const { slug, lang, asset_type: assetType } = page;

      const redirect = redirectByLang({
        slug,
        lang,
        difficulty: assetType?.toUpperCase() === 'PROJECT' ? page?.difficulty?.toLowerCase() : null,
        assetType,
      });
      return redirect;
    });
  return redirectList || [];
};

const generateAliasRedirects = async (redirects, projects) => {
  const list = projects.map((item) => ({
    source: `/project/${item.slug}`,
    type: 'PROJECT-REROUTE',
    destination: `/${item.lang === 'us' ? 'en' : item.lang}/interactive-coding-tutorial/${item.slug}`,
  }));
  const objectToAliasList = await Promise.all(Object.entries(redirects).map(async ([key, value]) => {
    const lang = value.lang === 'us' ? 'en' : value.lang;
    const getConnector = async () => {
      if (value.type === 'PROJECT') return 'interactive-coding-tutorial';
      if (value.type === 'LESSON') return 'lesson';
      if (value.type === 'EXERCISE') return 'interactive-exercise';
      if (value.type === 'ARTICLE' || value.type === 'QUIZ') return 'how-to';
      return null;
    };

    const connector = await getConnector();

    return ({
      source: `/${connector}/${key?.toLowerCase()}`,
      type: value.type,
      destination: `/${lang}/${connector}/${value.slug}`,
    });
  }));
  return [...objectToAliasList, ...list];
};

async function generateRedirect() {
  console.log('Generating redirects...');

  const lessonsList = await getLessons();
  const excersisesList = await getExercises();
  const projectList = await getProjects();
  const howToList = await getHowTo();
  const aliasRedirectList = await getAliasRedirects();

  const lessonRedirectList = generateAssetRedirect(lessonsList);
  const excersisesRedirectList = generateAssetRedirect(excersisesList);
  const projectRedirectList = generateAssetRedirect(projectList);
  const howToRedirectList = generateAssetRedirect(howToList);

  const aliasRedirectionList = await generateAliasRedirects(aliasRedirectList, projectList);

  const redirectJson = [
    ...lessonRedirectList,
    ...excersisesRedirectList,
    ...projectRedirectList,
    ...howToRedirectList,
  ];

  fs.writeFileSync('public/redirects-from-api.json', JSON.stringify(redirectJson, null, 2));
  fs.writeFileSync('public/alias-redirects.json', JSON.stringify(aliasRedirectionList, null, 2));

  console.log('Redirects generated!');
}
generateRedirect();
