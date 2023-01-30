const { default: axios } = require('axios');
const fs = require('fs');
require('dotenv').config({
  path: '.env.development',
});

const BREATHECODE_HOST = process.env.BREATHECODE_HOST || 'https://breathecode-test.herokuapp.com';

const getLessons = () => {
  const data = axios.get(`${BREATHECODE_HOST}/v1/registry/asset?asset_type=lesson&limit=1000`)
    .then((res) => res.data.results)
    .catch((err) => console.log(err));
  return data;
};

const redirectByLang = (slug, lang) => {
  const redirect = {
    source: `/lesson/${slug}`,
    destination: `/${lang}/lesson/${slug}`,
    permanent: true,
    // locale: false,
  };
  return redirect;
};

const generateAssetRedirect = (pages) => {
  const redirectList = pages.filter((page) => page.lang !== 'us' && page.lang !== 'en')
    .map((page) => {
      const redirect = redirectByLang(page?.slug, page?.lang);
      return redirect;
    });
  return redirectList;
};

async function generateRedirect() {
  console.log('Generating redirects...');

  const lessonsList = await getLessons();
  const lessonRedirectList = generateAssetRedirect(lessonsList);

  fs.writeFileSync('public/redirects.json', JSON.stringify(lessonRedirectList, null, 2));

  console.log('Redirects generated!');
}
generateRedirect();
