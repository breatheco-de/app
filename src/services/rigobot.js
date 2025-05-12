/* eslint-disable default-param-last */
import axios from '../axios';
import { parseQuerys } from '../utils/url';
import { RIGOBOT_HOST } from '../utils/variables';

const rigoHostV1 = `${RIGOBOT_HOST}/v1`;

const rigobot = {

  auth: () => {
    const url = `${rigoHostV1}/auth`;
    return {
      meToken: (token) => axios.get(`${url}/me/token?breathecode_token=${token}`),
    };
  },

  prompting: (query = {}) => {
    const url = `${rigoHostV1}/prompting`;
    const qs = parseQuerys(query);
    return {
      completionJob: (data) => axios.post(`${url}/completion/43${qs}`, data),
    };
  },
};

export default rigobot;
