/* eslint-disable no-param-reassign */
/* eslint-disable no-await-in-loop */
import axios from 'axios';
import { kv } from '@vercel/kv';
import { parseQuerys } from './url';
import { isWhiteLabelAcademy, WHITE_LABEL_ACADEMY } from './variables';
import bc from '../common/services/breathecode';

const BREATHECODE_HOST = process.env.BREATHECODE_HOST || 'https://breathecode-test.herokuapp.com';
const SYLLABUS = process.env.SYLLABUS || 'full-stack,web-development';
const PRISMIC_API = process.env.PRISMIC_API || 'https://your-prismic-repo.cdn.prismic.io/api/v2';
const PRISMIC_REF = process.env.PRISMIC_REF || 'Y-EX4MPL3R3F';

const mapDifficulty = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case 'junior':
      return 'easy';
    case 'semi-senior':
      return 'intermediate';
    case 'senior':
      return 'hard';
    default:
      return 'unknown';
  }
};

const getPrismicPages = () => {
  const data = axios.get(`${PRISMIC_API}/documents/search?ref=${PRISMIC_REF}&type=page&lang=*`)
    .then((res) => res.data.results)
    .catch(() => {
      console.error('SITEMAP: Error fetching Prismic pages');
    });
  return data;
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
const getAsset = async (type = '', extraQuerys = {}, category = '') => {
  const limit = 100;
  let offset = 0;
  let allResults = [];

  const qsRequest = parseQuerys({
    asset_type: type || undefined,
    visibility: 'PUBLIC',
    status: 'PUBLISHED',
    limit,
    offset,
    academy: WHITE_LABEL_ACADEMY,
    ...extraQuerys,
  });

  let response = await bc.get(`${BREATHECODE_HOST}/v1/registry/asset${qsRequest}`)
    .then(async (res) => {
      const data = await res.json();

      if (res.status >= 400) {
        throw new Error(data.detail);
      }
      return data;
    })
    .catch((err) => {
      console.error(`Error: GET_ASSET (/v1/registry/asset${qsRequest}): ${err.detail}`);
      return [];
    });

  let { results } = response;
  const { count } = response;
  allResults = allResults.concat(results);

  while (results.length + offset < count) {
    offset += limit;
    const newQsRequests = parseQuerys({
      asset_type: type === null ? undefined : type,
      visibility: 'PUBLIC',
      status: 'PUBLISHED',
      limit,
      offset,
      academy: WHITE_LABEL_ACADEMY,
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
        console.error(`Error: GET_ASSET in (/v1/registry/asset${qsRequest}): ${err.detail}`);
        return [];
      });
    results = response.results;
    allResults = allResults.concat(results);
  }

  if (category === 'project') {
    return allResults.map((item) => {
      item.difficulty = mapDifficulty(item.difficulty);
      return item;
    });
  }

  return allResults;
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
    const limit = 100;
    let offset = 0;
    let res = await axios.get(`${BREATHECODE_HOST}/v1/registry/academy/technology?limit=${limit}&offset=${offset}&academy=${WHITE_LABEL_ACADEMY}`, {
      headers: {
        Authorization: `Token ${process.env.BC_ACADEMY_TOKEN}`,
        Academy: 4,
      },
    });
    let { results } = res.data;
    const { count } = res.data;

    while (results.length < count) {
      offset += limit;
      res = await axios.get(`${BREATHECODE_HOST}/v1/registry/academy/technology?limit=${limit}&offset=${offset}&academy=${WHITE_LABEL_ACADEMY}`, {
        headers: {
          Authorization: `Token ${process.env.BC_ACADEMY_TOKEN}`,
          Academy: 4,
        },
      });

      if (res.status >= 400) {
        throw new Error(res.detail);
      }

      results = results.concat(res.data.results);
    }

    const formatedWithAssets = results.map((tech) => ({ ...tech, assets: assets.filter((asset) => asset?.technologies?.includes(tech?.slug)) }));

    const technologiesInEnglish = formatedWithAssets.filter((tech) => tech?.assets?.length > 0 && tech?.assets?.filter((asset) => asset?.lang === 'en' || asset?.lang === 'us'))
      .map((finalData) => ({
        ...finalData,
        assets: finalData.assets.filter((asset) => asset?.lang === 'en' || asset?.lang === 'us'),
        lang: 'en',
      }));

    const technologiesInSpanish = formatedWithAssets.filter((tech) => tech?.assets?.length > 0 && tech.assets?.some((asset) => asset?.lang === 'es'))
      .map((finalData) => ({
        ...finalData,
        assets: finalData.assets.filter((asset) => asset?.lang === 'es'),
        lang: 'es',
      }));

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
  getCacheItem,
  setCacheItem,
  getPrismicPages,
  getPublicSyllabus,
  getLandingTechnologies,
  getTechnologyAssets,
  getEvents,
};
