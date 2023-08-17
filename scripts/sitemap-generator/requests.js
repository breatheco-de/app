/* eslint-disable no-await-in-loop */
const { default: axios } = require('axios');
const { parseQuerys } = require('../../src/utils/url');
require('dotenv').config({
  path: '.env.production',
});

const BREATHECODE_HOST = process.env.BREATHECODE_HOST || 'https://breathecode-test.herokuapp.com';
const SYLLABUS = process.env.SYLLABUS || 'full-stack,web-development';
const PRISMIC_API = process.env.PRISMIC_API || 'https://your-prismic-repo.cdn.prismic.io/api/v2';
const PRISMIC_REF = process.env.PRISMIC_REF || 'Y-EX4MPL3R3F';
const WHITE_LABLE_ACADEMY = process.env.WHITE_LABLE_ACADEMY || '4,5,6,47';

const getPrismicPages = () => {
  const data = axios.get(`${PRISMIC_API}/documents/search?ref=${PRISMIC_REF}&type=page&lang=*`)
    .then((res) => res.data.results)
    .catch(() => {
      console.error('SITEMAP: Error fetching Prismic pages');
    });
  return data;
};

const getTechonologyAssets = async (slug) => {
  const resp = axios.get(`${process.env.BREATHECODE_HOST}/v1/registry/asset?limit=9000&technologies=${slug}&academy=${WHITE_LABLE_ACADEMY}`)
    .then((res) => res.data.results)
    .catch(() => {
      console.error('SITEMAP: Error fetching Technology Assets');
    });
  return resp;
};

const getReadPages = () => {
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
  const qs = parseQuerys(extraQuerys, true);
  const { data } = await axios.get(`${BREATHECODE_HOST}/v1/events/all${qs}`);

  return data;
};

const getAsset = async (type, extraQuerys = {}) => {
  const qs = parseQuerys(extraQuerys, true);
  const limit = 100;
  let offset = 0;
  let allResults = [];

  let results = await axios.get(`${BREATHECODE_HOST}/v1/registry/asset?asset_type=${type}&visibility=PUBLIC&status=PUBLISHED&limit=${limit}&offset=${offset}${qs}&academy=${WHITE_LABLE_ACADEMY}`)
    .then((res) => res.data.results)
    .catch(() => {
      console.error(`SITEMAP: Error fetching ${type.toUpperCase()} pages`);
      return [];
    });

  while (results.length > 0) {
    allResults = allResults.concat(results);
    offset += limit;

    results = await axios.get(`${BREATHECODE_HOST}/v1/registry/asset?asset_type=${type}&visibility=PUBLIC&status=PUBLISHED&limit=${limit}&offset=${offset}${qs}`)
      .then((res) => res.data.results)
      .catch(() => {
        console.error(`SITEMAP: Error fetching ${type.toUpperCase()} pages`);
        return [];
      });
  }

  return allResults;
};

const getLandingTechnologies = () => {
  const technologies = axios.get(`${BREATHECODE_HOST}/v1/registry/academy/technology?limit=1000&academy=${WHITE_LABLE_ACADEMY}`, {
    headers: {
      Authorization: `Token ${process.env.BC_ACADEMY_TOKEN}`,
      Academy: 4,
    },
  })
    .then(async (res) => {
      const formatedWithAssets = res.data.results.map(async (tech) => {
        const assets = await getTechonologyAssets(tech?.slug);
        return { ...tech, assets };
      });

      const technologiesInEnglish = Promise.all(formatedWithAssets).then(
        (formatedData) => formatedData.filter((tech) => tech?.assets?.length > 0 && tech?.assets?.filter((asset) => asset?.lang === 'en' || asset?.lang === 'us'))
          .map((finalData) => ({
            ...finalData,
            lang: 'en',
          })),
      );

      const technologiesInSpanish = Promise.all(formatedWithAssets).then(
        (formatedData) => formatedData.filter((tech) => tech?.assets?.length > 0 && tech.assets?.some((asset) => asset?.lang === 'es'))
          .map((finalData) => ({
            ...finalData,
            lang: 'es',
          })),
      );

      const dataEng = await technologiesInEnglish;
      const dataEsp = await technologiesInSpanish;

      return [...dataEng, ...dataEsp];
    })
    .catch(() => {
      console.error('SITEMAP: Error fetching Technologies pages');
    });

  return technologies;
};

module.exports = {
  getAsset,
  getPrismicPages,
  getReadPages,
  getLandingTechnologies,
  getTechonologyAssets,
  getEvents,
};
