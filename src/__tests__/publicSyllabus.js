import axios from 'axios';
import { warn } from '../../scripts/_utils';

const publicSyllabus = async () => {
  await axios.get(
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

}

publicSyllabus();
