import axios from '../../axios';

const host = `${process.env.BREATHECODE_HOST}/v1`;
const breathecode = {
  auth: () => {
    const url = `${host}/auth`;
    return {
      // NOTE: WARN spreading ...payload returns objects of each email letter values
      login: (email, password) => axios.post(`${url}/login/`, {
        email,
        password,
        user_agent: 'bc/student',
      }),
      me: () => axios.get(`${url}/user/me`),
      isValidToken: (token) => axios.get(`${url}/token/${token}`),
      register: (payload) => axios.post(`${url}/user/register/`, payload),
    };
  },
};

export default breathecode;
