const { default: axios } = require('axios');
const fs = require('fs');
const { fail } = require('./_utils');
require('dotenv').config({
  path: '.env.production',
});

const WHITE_LABEL_ACADEMY = process.env.WHITE_LABEL_ACADEMY || '4,5,6,47';
const BREATHECODE_HOST = process.env.BREATHECODE_HOST || 'https://breathecode-test.herokuapp.com';
const SYLLABUS = process.env.SYLLABUS || 'full-stack,web-development';
const whiteLabelAcademies = WHITE_LABEL_ACADEMY;
const DOMAIN_NAME = process.env.DOMAIN_NAME || '';

async function generateSyllabus() {
  const whiteLableArray = whiteLabelAcademies?.length > 0 ? whiteLabelAcademies.split(',') : [];
  const existsDomainName = typeof DOMAIN_NAME === 'string' && DOMAIN_NAME.length > 0;

  if (whiteLableArray?.length > 0) {
    console.log('White label academy has been set to: ', whiteLableArray);
    if (!existsDomainName) {
      fail('ERROR: No domain name has been set on DOMAIN_NAME env variable');
    }

    const logoData = await axios.get(`${BREATHECODE_HOST}/v1/admissions/academy/${whiteLableArray[0]}`)
      .then((resp) => resp?.data);

    if (logoData?.name) {
      fs.writeFileSync('public/logo.json', JSON.stringify(logoData));
    }
  } else {
    console.log('No white label academy has been set on WHITE_LABEL_ACADEMY env variable');
  }

  const data = await axios.get(`${BREATHECODE_HOST}/v1/admissions/public/syllabus?slug=${SYLLABUS}`)
    .then((res) => res.data);

  const paths = data?.length > 0 ? `[
    ${data.map((item) => `{"label": "${item.name}", "href": "/read/${item.slug}"}`).join(',')}
  ]` : '[]';

  fs.writeFileSync('public/syllabus.json', JSON.stringify(paths));
}

generateSyllabus();
