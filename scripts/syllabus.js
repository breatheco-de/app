const { default: axios } = require('axios');
const fs = require('fs');

const BREATHECODE_HOST = process.env.BREATHECODE_HOST || 'https://breathecode-test.herokuapp.com';
const SYLLABUS = process.env.SYLLABUS || 'full-stack,web-development';

async function generateSyllabus() {
  if (process.env.NODE_ENV === 'development') return;

  const data = await axios.get(`${BREATHECODE_HOST}/v1/admissions/public/syllabus?slug=${SYLLABUS}`)
    .then((res) => res.data);

  const paths = `[
    ${data.map((item) => `{"label": "${item.name}", "href": "/read/${item.slug}"}`).join(',')}
  ]`;

  fs.writeFileSync('public/syllabus.json', JSON.stringify(paths));
}

generateSyllabus();
