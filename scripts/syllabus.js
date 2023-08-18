const { default: axios } = require('axios');
const fs = require('fs');

const BREATHECODE_HOST = process.env.BREATHECODE_HOST || 'https://breathecode-test.herokuapp.com';
const SYLLABUS = process.env.SYLLABUS || 'full-stack,web-development';

async function generateSyllabus() {
  const data = await axios.get(`${BREATHECODE_HOST}/v1/admissions/public/syllabus?slug=${SYLLABUS}`)
    .then((res) => res.data);

  const paths = data?.length > 0 ? `[
    ${data.map((item) => `{"label": "${item.name}", "href": "/read/${item.slug}"}`).join(',')}
  ]` : '[]';

  fs.writeFileSync('public/syllabus.json', JSON.stringify(paths));
}

generateSyllabus();
