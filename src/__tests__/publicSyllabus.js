const axios = require('axios');
const fail = (msg, ...params) => {
  console.error(msg, ...params);
  process.exit(1);
}

const publicSyllabus = async () => {
  console.log('process.env.BREATHECODE_HOST:', process.env.BREATHECODE_HOST);
  const resp = await axios.get(
    "https://breathecode.herokuapp.com/v1/admissions/public/syllabus?slug=full-stack,web-development",
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