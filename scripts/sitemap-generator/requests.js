const { default: axios } = require('axios');

const BREATHECODE_HOST = process.env.BREATHECODE_HOST || 'https://breathecode-test.herokuapp.com';
const SYLLABUS = process.env.SYLLABUS || 'full-stack,web-development';
const PRISMIC_API = process.env.PRISMIC_API || 'https://your-prismic-repo.cdn.prismic.io/api/v2';
const PRISMIC_REF = process.env.PRISMIC_REF || 'Y-EX4MPL3R3F';

const getPrismicPages = () => {
  const data = axios.get(`${PRISMIC_API}/documents/search?ref=${PRISMIC_REF}&type=page&lang=*`)
    .then((res) => res.data.results)
    .catch(() => {
      console.error('SITEMAP: Error fetching Prismic pages');
    });
  return data;
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

const getLessons = () => {
  const data = axios.get(`${BREATHECODE_HOST}/v1/registry/asset?asset_type=lesson&limit=1000`)
    .then((res) => res.data.results)
    .catch(() => {
      console.error('SITEMAP: Error fetching Lessons pages');
    });
  return data;
};

const getExercises = () => {
  const data = axios.get(`${BREATHECODE_HOST}/v1/registry/asset?asset_type=exercise&limit=1000`)
    .then((res) => res.data.results)
    .catch(() => {
      console.error('SITEMAP: Error fetching Exercises pages');
    });
  return data;
};

const getProjects = () => {
  const data = axios.get(`${BREATHECODE_HOST}/v1/registry/asset?asset_type=project&limit=1000`)
    .then((res) => res.data.results)
    .catch(() => {
      console.error('SITEMAP: Error fetching Projects pages');
    });
  return data;
};

const getHowTo = () => {
  const data = axios.get(`${BREATHECODE_HOST}/v1/registry/asset?asset_type=ARTICLE&limit=1000`)
    .then((res) => res.data.results.filter((l) => l?.category?.slug === 'how-to' || l?.category?.slug === 'como'))
    .catch(() => {
      console.error('SITEMAP: Error HowTo Read pages');
    });
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
    .catch(() => {
      console.error('SITEMAP: Error fetching Technologies pages');
    });

  return technologies;
};

module.exports = {
  getPrismicPages,
  getReadPages,
  getLessons,
  getExercises,
  getProjects,
  getHowTo,
  getLandingTechnologies,
};
