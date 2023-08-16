const axios = require('axios');
require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
});
const fail = (msg, ...params) => {
  console.error(msg, ...params);
  process.exit(1);
}

const publicSyllabus = async () => {
  const resp = await axios.get(
    `${process.env.BREATHECODE_HOST}/v1/admissions/public/syllabus?slug=${process.env.SYLLABUS}`,
  )
    .then(({ data }) => {
      return data
    })
    .catch((err) => {
      fail('ERROR: Public syllabus Fetch', err.message)
    });

  console.log('Public syllabus is working fine', resp);
}

publicSyllabus();