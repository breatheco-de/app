import axios from '../../axios';

const host = `${process.env.BREATHECODE_HOST}/v1`;
const breathecode = {
  get: (url) => axios.get(url),
  auth: () => {
    const url = `${host}/auth`;
    return {
      login: (payload) => axios.post(`${url}/login/`, { ...payload, user_agent: 'bc/student' }),
      me: () => axios.get(`${url}/user/me`),
      updateProfile: (arg) => axios.put(`${url}/user/me`, { ...arg }),
      updatePicture: (args) => axios.put(`${url}/profile/me/picture`, args),
      invites: () => ({
        get: () => axios.get(`${url}/user/me/invite?status=PENDING`),
        accept: (id) => axios.put(`${url}/user/me/invite/accepted?id=${id}`),
      }),
      getRoles: (cohortRole) => axios.get(`${url}/role/${cohortRole}`),
      isValidToken: (token) => axios.get(`${url}/token/${token}`),
      register: (payload) => axios.post(`${url}/user/register`, payload),
      subscribe: (payload) => axios.post(`${url}/subscribe/`, { ...payload }),
      removeGithub: () => axios.delete(`${url}/github/me`),
      temporalToken: () => axios({
        method: 'post',
        url: `${url}/token/me`,
        // headers: {},
        data: {
          token_type: 'one_time',
        },
      }),
      getUser: ({ userId }) => axios({
        method: 'get',
        url: `${url}/academy/member/${userId}`,
        headers: {
          Authorization: `Token ${process.env.BC_ACADEMY_TOKEN}`,
          academy: 4,
        },
      }),
    };
  },

  admissions: (query = {}) => {
    const url = `${host}/admissions`;
    const qs = Object.keys(query)
      .map((key) => `${key}=${query[key]}`)
      .join('&');
    return {
      me: () => axios.get(`${url}/user/me`),
      cohorts: () => axios.get(`${url}/cohort/all?${qs}`),
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
    // .map((key) => (query[key] !== null ? `${key}=${query[key]}` : ''))
    const qs = Object.keys(query)
      .map((key) => (query[key] !== undefined ? `${key}=${query[key]}` : ''))
      .join('&');
    return {
      get: () => axios.get(`${url}/task/?${qs}`),
      getAssignments: (args) => axios.get(`${url}/academy/cohort/${args.id}/task?${qs}`),
      deliver: (args) => axios.get(`${url}/task/${args.id}/deliver`, {
        headers: {
          academy: args.academyId,
        },
      }),
      uploadFile: (id, args) => axios.put(`${url}/task/${id}/attachment?${qs}`, args),
      getFile: (args) => axios.get(`${url}/task/${args.id}/attachment`, {
        headers: {
          academy: args.academyId,
        },
      }),
      subtask: () => ({
        get: (id) => axios.get(`${url}/user/me/task/${id}/subtasks`),
        update: (id, args) => axios.put(`${url}/user/me/task/${id}/subtasks`, args),
      }),
      // getTaskByStudent: (cohortId) => axios.get(`${url}/user/me/task?cohort=${cohortId}`),
      getTaskByStudent: () => axios.get(`${url}/user/me/task?${qs}`),
      add: (args) => axios.post(`${url}/user/me/task`, args),
      // delete: (id, args) => axios.delete(`${url}/user/${id}/task/${args.id}`, args),
      update: (args) => axios.put(`${url}/task/${args.id}`, args),
      updateBulk: (args) => axios.put(`${url}/user/me/task`, args),
      deleteBulk: (args) => axios.delete(`${url}/user/me/task?${qs}`, args),
    };
  },

  cohort: (query = {}) => {
    const url = `${host}/admissions/academy`;
    const qs = Object.keys(query)
      .map((key) => `${key}=${query[key]}`)
      .join('&');
    return {
      get: (id) => axios.get(`${url}/cohort/${id}`),
      log: (id, activities) => axios.put(`${url}/cohort/${id}/log?${qs}`, activities),
      getPublic: (id) => axios.get(`${url}/cohort/${id}`, {
        headers: {
          Authorization: `Token ${process.env.BC_ACADEMY_TOKEN}`,
          academy: 4,
        },
      }),
      getFilterStudents: () => axios.get(`${url}/cohort/user?${qs}`),
      getStudents: (cohortId, academyId) => axios.get(`${url}/cohort/user?role=STUDENT&cohorts=${cohortId}${academyId ? `&academy=${academyId}` : ''}`),
      update: (id, args) => axios.put(`${url}/cohort/${id}`, args),
      user: ({ cohortId, userId }) => axios({
        method: 'get',
        url: `${url}/cohort/${cohortId}/user/${userId}`,
        headers: {
          Authorization: `Token ${process.env.BC_ACADEMY_TOKEN}`,
          academy: 4,
        },
      }),
    };
  },

  assignments: () => {
    const url = `${host}/assignment`;
    return {
      get: () => axios.get(`${url}/user/me/task`),
    };
  },
  feedback: () => {
    const url = `${host}/feedback`;
    return {
      getSurvey: (id) => axios.get(`${url}/user/me/survey/${id}/questions`),
      sendVote: (arg) => axios.put(`${url}/user/me/answer/${arg.entity_id}`, { ...arg }),
    };
  },
  mentorship: (query = {}) => {
    const url = `${host}/mentorship/academy`;
    const urlNoAcademy = `${host}/mentorship`;
    const qs = Object.keys(query)
      .map((key) => `${key}=${query[key]}`)
      .join('&');
    return {
      getService: () => axios.get(`${url}/service?status=ACTIVE`),
      getMentor: () => axios.get(`${url}/mentor?${qs}`),
      getMySessions: () => axios.get(`${urlNoAcademy}/user/me/session?${qs}`),
    };
  },

  marketing: (query = {}) => {
    const url = `${host}/marketing`;
    const qs = Object.keys(query)
      .map((key) => `${key}=${query[key]}`)
      .join('&');
    return {
      lead: (data) => axios.post(`${url}/lead?${qs}`, data),
    };
  },

  lesson: (query = {}) => {
    const url = `${host}/registry`;
    const qs = Object.keys(query)
      .map((key) => `${key}=${query[key]}`)
      .join('&');
    return {
      get: () => axios.get(`${url}/asset?${qs}`),
      getAsset: (slug) => axios.get(`${url}/asset/${slug}`),
      techs: () => axios.get(`${url}/academy/technology?${qs}`),
    };
  },
  activity: () => {
    const url = `${host}/activity`;
    return {
      addBulk: (cohortId, activities) => axios.post(`${url}/academy/cohort/${cohortId}`, activities),
      getAttendance: (cohortId) => axios.get(`${url}/cohort/${cohortId}?slug=classroom_attendance,classroom_unattendance`),
    };
  },
  certificate: () => {
    const url = `${host}/certificate`;
    return {
      get: () => axios.get(`${url}/me`),
    };
  },

  public: (query = {}) => {
    const url = `${host}/admissions/public`;

    const qs = Object.keys(query)
      .map((key) => (query[key] !== undefined ? `${key}=${query[key]}` : ''))
      .join('&');
    return {
      mentors: () => axios.get(`${url}/cohort/user?${qs}`),
      events: () => axios.get(`${host}/events/all?${qs}`),
      cohorts: () => axios.get(`${host}/admissions/cohort/all?${qs}`),
    };
  },
};

export default breathecode;
