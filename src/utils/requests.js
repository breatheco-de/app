/* eslint-disable no-restricted-syntax */
/* eslint-disable no-param-reassign */
/* eslint-disable no-await-in-loop */
import axios from 'axios';
import { kv } from '@vercel/kv';
import TagManager from 'react-gtm-module';
import { parseQuerys } from './url';
import { isWhiteLabelAcademy, WHITE_LABEL_ACADEMY } from './variables';
import bc from '../common/services/breathecode';
import { log } from './logging';

const BREATHECODE_HOST = process.env.BREATHECODE_HOST || 'https://breathecode-test.herokuapp.com';
const SYLLABUS = process.env.SYLLABUS || 'full-stack,web-development';
const PRISMIC_API = process.env.PRISMIC_API || 'https://your-prismic-repo.cdn.prismic.io/api/v2';
const PRISMIC_REF = process.env.PRISMIC_REF || 'Y-EX4MPL3R3F';

const mapDifficulty = (difficulty) => {
  const difficultyStr = difficulty?.toLowerCase();
  if (['junior', 'beginner'].includes(difficultyStr)) {
    return 'easy';
  } if (difficultyStr === 'semi-senior') {
    return 'intermediate';
  } if (difficultyStr === 'senior') {
    return 'hard';
  }
  return difficultyStr || 'unknown';
};

const reportDatalayer = (payload) => {
  TagManager.dataLayer(payload);
};

const getPrismicPages = async () => {
  try {
    const response = await fetch(`${PRISMIC_API}/documents/search?ref=${PRISMIC_REF}&type=page&lang=*`);
    const data = await response.json();
    log(`\n${data?.results?.length} pages fetched from Prismic\n`);
    if (response.status > 400 && response.statusText !== 'OK') {
      throw new Error('SITEMAP: Error fetching Prismic pages');
    } else {
      return data.results;
    }
  } catch (msg) {
    console.error('SITEMAP:', msg);
    return [];
  }
};

const getTechnologyAssets = async (slug) => {
  const resp = axios.get(`${process.env.BREATHECODE_HOST}/v1/registry/asset?limit=9000&technologies=${slug}&academy=${WHITE_LABEL_ACADEMY}`)
    .then((res) => res.data.results)
    .catch(() => {
      console.error('SITEMAP: Error fetching Technology Assets');
    });
  return resp;
};

const getPublicSyllabus = () => {
  const resp = axios.get(
    `${BREATHECODE_HOST}/v1/admissions/public/syllabus?slug=${SYLLABUS}`,
  )
    .then((res) => res.data)
    .catch(() => {
      console.error('SITEMAP: Error fetching Read pages');
    });
  return resp;
};
const getMktCourses = () => {
  const languages = ['en', 'es'];
  const fetchWithLanguages = languages.map((lang) => axios.get(`${BREATHECODE_HOST}/v1/marketing/course?lang=${lang}`)
    .then((res) => {
      const list = res?.data || [];
      const data = list?.filter((course) => course?.course_translation && course?.visibility !== 'UNLISTED')
        .map((course) => ({
          ...course,
          lang,
        }));
      return data;
    })
    .catch(() => {
      console.error(`SITEMAP: Error fetching Marketing Courses for language ${lang}`);
    }));
  return Promise.all(fetchWithLanguages).then((data) => data.flat());
};

const getEvents = async (extraQuerys = {}) => {
  if (!isWhiteLabelAcademy) {
    const qs = parseQuerys(extraQuerys, true);
    const { data } = await axios.get(`${BREATHECODE_HOST}/v1/events/all${qs}`);

    return data;
  }
  return [];
};

/**
 * @param {String} type Type of the asset (LESSON, ARTICLE, EXERCISE, PROJECT)
 * @param {Object} extraQuerys Extra querys to filter the assets
 * @param {string} category Category of the asset for filter purposes
 * @returns {Promise} Array of objects with the assets
 */
const getAsset = async (type = '', extraQuerys = {}, category = '', onlyFirstFetch = false) => {
  const limit = 100;
  let offset = 0;
  let allResults = [];

  const qsRequest = parseQuerys({
    asset_type: type || undefined,
    status: 'PUBLISHED',
    limit,
    offset,
    academy: WHITE_LABEL_ACADEMY,
    expand: 'technologies',
    ...extraQuerys,
  });

  // let response = fetchWithEncoding(`${BREATHECODE_HOST}/v1/registry/asset${qsRequest}`, ['br', 'gzip', 'deflate']);
  let response = await bc.get(`${BREATHECODE_HOST}/v1/registry/asset${qsRequest}`)
    .then(async (res) => {
      const data = await res.json();

      if (res.status >= 400) {
        throw new Error(data.detail);
      }
      return data;
    })
    .catch((err) => {
      console.error(`\nError: GET_ASSET in (/v1/registry/asset${qsRequest}): \n`);
      console.error(err, '\n\n');
      return [];
    });

  log(`Generating ${category}: ${response.results.length} recopilated of ${response.count} assets`);

  let { results } = response;
  const { count } = response;
  allResults = allResults.concat(results);

  while (!onlyFirstFetch && (results.length + offset < count)) {
    offset += limit;
    const newQsRequests = parseQuerys({
      asset_type: type === null ? undefined : type,
      status: 'PUBLISHED',
      limit,
      offset,
      academy: WHITE_LABEL_ACADEMY,
      expand: 'technologies',
      ...extraQuerys,
    });

    response = await bc.get(`${BREATHECODE_HOST}/v1/registry/asset${newQsRequests}`)
      .then(async (res) => {
        const data = await res.json();

        if (res.status >= 400) {
          throw new Error(data.detail);
        }
        return data;
      })
      .catch((err) => {
        console.error(`\nError: GET_ASSET in (/v1/registry/asset${newQsRequests}): \n`);
        console.error(err, '\n\n');
        return [];
      });

    if (response.results) {
      results = response.results;
      allResults = allResults.concat(results);
      log(`Generating ${category}: ${allResults.length} recopilated of ${count} assets`);
    }
  }

  const translationsObjectsCleaned = allResults.map((item) => {
    const recopilatedTranslationObject = {};
    const existentLangs = ['en', 'us', 'es'];
    for (const index in existentLangs) {
      // Verify if the asset has a translation in the existentLangs list
      if (Object.prototype.hasOwnProperty.call(item?.translations, existentLangs[index])) {
        const lang = existentLangs[index];
        const existsAsset = allResults.some((result) => result.slug === item?.translations[lang]);
        if (item?.translations?.[lang] && existsAsset) {
          recopilatedTranslationObject[lang] = item.translations[lang];
        }
        if (!item?.translations?.[lang] && item.lang === lang) {
          recopilatedTranslationObject[item.lang] = item.slug;
        }
      }
    }
    return ({
      ...item,
      translations: recopilatedTranslationObject,
    });
  });

  if (category === 'project') {
    return translationsObjectsCleaned.map((item) => {
      item.difficulty = mapDifficulty(item.difficulty);
      return item;
    });
  }

  return translationsObjectsCleaned;
};

/**
 * @param {String} key The key of the value in redis
 */
const getCacheItem = async (key) => {
  try {
    console.log(`Fetching ${key} from cache`);
    const item = await kv.get(key);
    return item;
  } catch (e) {
    console.log(`Failed to fetch ${key} from vercel cache`);
    return null;
  }
};

/**
 * @param {String} key The key of the value in redis
 * @param {Object} value The value to be stored in the cache
 */
const setCacheItem = async (key, value) => {
  try {
    console.log(`Setting up ${key} on cache`);
    await kv.set(key, value, { ex: 604800 }); //Set expire time to one week
  } catch (e) {
    console.log(`Failed to set ${key} on cache`);
  }
};

// mover a carpeta sitemap-generator
const getLandingTechnologies = async (assets) => {
  try {
    const results = [];
    assets.forEach((asset) => {
      asset.technologies.forEach((tech) => {
        const alreadyExists = !results.some((result) => result.slug === tech.slug);
        if (tech.visibility === 'PUBLIC' && alreadyExists) results.push({ ...tech });
      });
      asset.technologies = asset.technologies.map((tech) => tech);
    });

    const formatedWithAssets = results.map((tech) => ({
      ...tech,
      assets: assets.filter((asset) => asset?.technologies?.some((assetTech) => assetTech?.slug === tech?.slug)),
    }));

    const technologiesInEnglish = formatedWithAssets.filter((tech) => tech?.assets?.length > 0 && tech?.assets?.filter((asset) => asset?.lang === 'en' || asset?.lang === 'us'))
      .map((finalData) => {
        const uniqueTypes = new Set();
        const filteredAssets = finalData.assets.filter((asset) => {
          const isEnglish = asset?.lang === 'en' || asset?.lang === 'us';
          if (isEnglish) {
            uniqueTypes.add(asset.asset_type);
          }
          return isEnglish;
        });

        return ({
          ...finalData,
          assets: filteredAssets,
          assetTypesInTechnology: [...uniqueTypes], // generate unique asset types to use in filters (future implementation)
          lang: 'en',
        });
      });

    const technologiesInSpanish = formatedWithAssets.filter((tech) => tech?.assets?.length > 0 && tech.assets?.some((asset) => asset?.lang === 'es'))
      .map((finalData) => {
        const uniqueTypes = new Set();
        const filteredAssets = finalData.assets.filter((asset) => {
          const isSpanish = asset?.lang === 'es';
          if (isSpanish) {
            uniqueTypes.add(asset.asset_type);
          }
          return isSpanish;
        });

        return ({
          ...finalData,
          assets: filteredAssets,
          assetTypesInTechnology: [...uniqueTypes], // generate unique asset types to use in filters (future implementation)
          lang: 'es',
        });
      });

    const dataEng = technologiesInEnglish;
    const dataEsp = technologiesInSpanish;

    return [...dataEng, ...dataEsp];
  } catch (e) {
    console.error('SITEMAP: Error fetching Technologies pages');
    return [];
  }
};

export {
  getAsset,
  reportDatalayer,
  getCacheItem,
  setCacheItem,
  getPrismicPages,
  getPublicSyllabus,
  getLandingTechnologies,
  getTechnologyAssets,
  getEvents,
  getMktCourses,
};
