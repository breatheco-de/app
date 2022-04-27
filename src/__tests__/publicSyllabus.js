const axios = require('axios');
const fail = (msg, ...params) => {
  console.error(msg, ...params);
  process.exit(1);
}

const publicSyllabus = async () => {
  console.log('process.env.BREATHECODE_HOST:', process.env.BREATHECODE_HOST);
  console.log('process.env.SYLLABUS:', process.env.SYLLABUS);
  const resp = await axios.get(
    `${process.env.BREATHECODE_HOST}/v1/admissions/public/syllabus?slug=${process.env.SYLLABUS}`,
  )
    .then(({ data }) => {
      if (data.length === 0) {
        fail('ERROR: Public syllabus returned empty array: ', data)
      }
      return data
    })
    .catch((err) => {
      fail('ERROR: Public syllabus Fetch', err.message)
    });

  console.log('Public syllabus is working fine', resp);
}

publicSyllabus();