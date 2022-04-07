import axios from '../../axios';

const host = `${process.env.BREATHECODE_HOST}/v1`;
const breathecode = {
  auth: () => {
    const url = `${host}/auth`;
    return {
      login: (payload) => axios.post(`${url}/login/`, { ...payload, user_agent: 'bc/student' }),
      me: () => axios.get(`${url}/user/me`),
      invites: () => ({
        get: () => axios.get(`${url}/user/me/invite?status=PENDING`),
        accept: (id) => axios.put(`${url}/user/me/invite/accepted?id=${id}`),
      }),
      isValidToken: (token) => axios.get(`${url}/token/${token}`),
      register: (payload) => axios.post(`${url}/user/register`, payload),
      subscribe: (payload) => axios.post(`${url}/subscribe/`, { ...payload }),
    };
  },

  admissions: () => {
    const url = `${host}/admissions`;
    return {
      me: () => axios.get(`${url}/user/me`),
    };
  },

  syllabus: () => {
    const url = `${host}/admissions`;
    return {
      get: (academyVersion = '4', slug, version = '1') => {
        if (!slug) throw new Error('Missing slug');
        else return axios.get(`${url}/academy/${academyVersion}/syllabus/${slug}/version/${version}`);
      },
    };
  },

  todo: (query = {}) => {
    const url = `${host}/assignment`;
    const qs = Object.keys(query)
      .map((key) => `${key}=${query[key]}`)
      .join('&');
    return {
      // getTaskByStudent: (cohortId) => axios.get(`${url}/user/me/task?cohort=${cohortId}`),
      getTaskByStudent: () => axios.get(`${url}/user/me/task?${qs}`),
      add: (args) => axios.post(`${url}/user/me/task`, args),
      // delete: (id, args) => axios.delete(`${url}/user/${id}/task/${args.id}`, args),
      update: (args) => axios.put(`${url}/task/${args.id}`, args),
      updateBulk: (args) => axios.put(`${url}/user/me/task`, args),
      deleteBulk: (args) => axios.delete(`${url}/user/me/task`, args),
    };
  },

  cohort: () => {
    const url = `${host}/admissions/academy`;
    return {
      get: (id) => axios.get(`${url}/cohort/${id}`),
      getStudents: (cohortId) => axios.get(`${url}/cohort/user?role=STUDENT&cohorts=${cohortId}`),
      update: (id, args) => axios.put(`${url}/cohort/${id}`, args),
    };
  },

  assignments: () => {
    const url = `${host}/assignment`;
    return {
      get: () => axios.get(`${url}/user/me/task`),
    };
  },
  mentorship: () => {
    const url = `${host}/mentorship/academy`;
    return {
      getService: () => axios.get(`${url}/service`),
      getMentor: ({ serviceSlug }) => axios.get(`${url}/mentor?service=${serviceSlug}`),
    };
  },
  lesson: (query) => {
    const url = `${host}/registry/asset`;
    const qs = Object.keys(query)
      .map((key) => `${key}=${query[key]}`)
      .join('&');
    return {
      get: () => axios.get(`${url}?${qs}`),
    };
  },
  activity: () => {
    const url = `${host}/activity`;
    return {
      addBulk: (cohortId, activities) => axios.post(`${url}/academy/cohort/${cohortId}`, activities),
      getAttendance: (cohortId) => axios.get(`${url}/cohort/${cohortId}?slug=classroom_attendance,classroom_unattendance`),
    };
  },
};

export default breathecode;
