const axios = require('axios');
const { warn } = require('../../scripts/_utils');
require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
});

const publicSyllabus = async () => {
  const resp = await axios.get(
    `${process.env.BREATHECODE_HOST}/v1/admissions/public/syllabus?slug=${process.env.SYLLABUS}`,
  )
    .then(({ data }) => {
      if (data.length === 0) {
        warn('WARN: Public syllabus returned empty array: ', data)
      }
      return data
    })
    .catch((err) => {
      warn('WARN: Public syllabus Fetch', err.message)
    });

  // console.log('Public syllabus is working fine', resp);
}

publicSyllabus();
