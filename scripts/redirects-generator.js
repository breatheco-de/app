/* eslint-disable no-param-reassign */
const { default: axios } = require('axios');
const fs = require('fs');
require('dotenv').config({
  path: '.env.development',
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
  const data = axios.get(`${BREATHECODE_HOST}/v1/registry/asset?asset_type=project&limit=1000`)
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
    .then((res) => (res.data.results > 0 ? res.data.results.filter((l) => l?.category?.slug === 'how-to' || l?.category?.slug === 'como') : []))
    .catch((err) => console.log(err));
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
      source: `/interactive-coding-tutorial/${difficulty}/${slug}`,
      destination: `/${lang}/interactive-coding-tutorial/${difficulty}/${slug}`,
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

async function generateRedirect() {
  console.log('Generating redirects...');

  const lessonsList = await getLessons();
  const excersisesList = await getExercises();
  const projectList = await getProjects();
  const howToList = await getHowTo();

  const lessonRedirectList = generateAssetRedirect(lessonsList);
  const excersisesRedirectList = generateAssetRedirect(excersisesList);
  const projectRedirectList = generateAssetRedirect(projectList);
  const howToRedirectList = generateAssetRedirect(howToList);

  const redirectJson = [
    ...lessonRedirectList,
    ...excersisesRedirectList,
    ...projectRedirectList,
    ...howToRedirectList,
  ];

  fs.writeFileSync('public/redirects.json', JSON.stringify(redirectJson, null, 2));

  console.log('Redirects generated!');
}
generateRedirect();
