/* eslint-disable no-undef */
import axios from 'axios';
import { fail, warn } from './_utils';
import { BREATHECODE_HOST, DOMAIN_NAME, WHITE_LABEL_ACADEMY } from '../src/utils/variables';

const SYLLABUS = process.env.SYLLABUS || 'full-stack,web-development';
const whiteLabelAcademies = WHITE_LABEL_ACADEMY;

async function generateSyllabus() {
  const whiteLableArray = whiteLabelAcademies?.length > 0 ? whiteLabelAcademies.split(',') : [];
  const existsDomainName = typeof DOMAIN_NAME === 'string' && DOMAIN_NAME.length > 0;

  if (whiteLableArray?.length > 0) {
    console.log('White label academy has been set to: ', whiteLableArray);
    if (!existsDomainName) {
      fail('ERROR: No domain name has been set on DOMAIN_NAME env variable');
    }

    const logoData = await axios.get(`${BREATHECODE_HOST}/v1/admissions/academy/${whiteLableArray[0]}`)
      .then((resp) => resp?.data)
      .catch((err) => {
        warn('WARN: No logo data has been found', err.response?.data);
      });

    if (logoData?.name) {
      Bun.write('public/logo.json', JSON.stringify(logoData));
    }
  } else {
    console.log('No white label academy has been set on WHITE_LABEL_ACADEMY env variable');
  }

  const data = await axios.get(`${BREATHECODE_HOST}/v1/admissions/public/syllabus?slug=${SYLLABUS}`)
    .then((res) => res.data);

  const paths = data?.length > 0 ? `[
    ${data.map((item) => `{"label": "${item.name}", "href": "/read/${item.slug}"}`).join(',')}
  ]` : '[]';

  Bun.write('public/syllabus.json', JSON.stringify(paths));
}

generateSyllabus();
