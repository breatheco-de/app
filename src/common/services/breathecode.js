/* eslint-disable default-param-last */
import axios from '../../axios';
import { parseQuerys } from '../../utils/url';
import modifyEnv from '../../../modifyEnv';
import { cleanObject } from '../../utils';

const BREATHECODE_HOST = modifyEnv({ queryString: 'host', env: process.env.BREATHECODE_HOST });
const RIGOBOT_HOST = modifyEnv({ queryString: 'rigo_host', env: process.env.RIGOBOT_HOST });
const BC_ACADEMY_TOKEN = modifyEnv({ queryString: 'bc_token', env: process.env.BC_ACADEMY_TOKEN });
const host = `${BREATHECODE_HOST}/v1`;
const hostV2 = `${BREATHECODE_HOST}/v2`;
const rigoHostV1 = `${RIGOBOT_HOST}/v1`;

const breathecode = {
  get: (url, config) => fetch(url, {
    headers: {
      ...axios.defaults.headers.common,
      ...config?.headers,
    },
  }).then((res) => res).catch((err) => console.error(err)),
  put: (url, data) => fetch(url, {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...axios.defaults.headers.common,
    },
    body: JSON.stringify(data),
  }).then((res) => res).catch((err) => console.error(err)),
  post: (url, data) => fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...axios.defaults.headers.common,
    },
    body: JSON.stringify(data),
  }).then((res) => res).catch((err) => console.error(err)),

  auth: () => {
    const url = `${host}/auth`;
    return {
      login: (payload) => axios.post(`${url}/login/`, { ...payload, user_agent: 'bc/student' }),
      login2: (payload, lang = 'en') => fetch(`${url}/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept-Language': lang,
        },
        body: JSON.stringify({
          ...payload,
          user_agent: 'bc/student',
        }),
      }),
      verifyRigobotConnection: (token) => breathecode.get(`${rigoHostV1}/auth/me/token?breathecode_token=${token}`),
      resendConfirmationEmail: (inviteId) => axios.put(`${url}/invite/resend/${inviteId}`),
      me: () => axios.get(`${url}/user/me`),
      updateProfile: (arg) => axios.put(`${url}/user/me`, { ...arg }),
      updateSettings: (arg) => axios.put(`${url}/user/me/settings`, { ...arg }),
      updatePicture: (args) => axios.put(`${url}/profile/me/picture`, args),
      invites: () => ({
        get: () => axios.get(`${url}/user/me/invite?status=PENDING`),
        accept: (id) => axios.put(`${url}/user/me/invite/accepted?id=${id}`),
      }),
      getRoles: (cohortRole) => axios.get(`${url}/role/${cohortRole}`),
      isValidToken: (token) => axios.get(`${url}/token/${token}`),
      register: (payload) => axios.post(`${url}/user/register`, payload),
      subscribe: (payload) => axios.post(`${url}/subscribe/`, { ...payload }),
      subscribeToken: (token) => axios.post(`${url}/subscribe/${token}`),
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
          Authorization: `Token ${BC_ACADEMY_TOKEN}`,
          academy: 4,
        },
      }),
    };
  },

  admissions: (query = {}) => {
    const url = `${host}/admissions`;
    const qs = parseQuerys(query);
    return {
      me: () => axios.get(`${url}/user/me`),
      cohort: (id, academy) => axios.get(`${url}/academy/cohort/${id}${qs}`, {
        headers: academy && {
          academy,
        },
      }),
      cohorts: () => axios.get(`${url}/cohort/all${qs}`),
      cohortUsers: (academy) => axios.get(`${url}/academy/cohort/user${qs}`, {
        headers: academy && {
          academy,
        },
      }),
      syllabus: (slug, version, academy) => axios.get(`${url}/syllabus/${slug}/version/${version}${qs}`, {
        headers: academy && {
          academy,
        },
      }),
      publicSyllabus: (slug) => breathecode.get(`${url}/syllabus/${slug}/version/1${qs}`, {
        headers: {
          Authorization: `Token ${BC_ACADEMY_TOKEN}`,
          academy: 4,
        },
      }),
    };
  },

  syllabus: (query = {}) => {
    const url = `${host}/admissions`;
    const qs = parseQuerys(query);
    return {
      get: (academyVersion = '4', slug, version = '1') => {
        if (!slug) throw new Error('Missing slug');
        else return axios.get(`${url}/academy/${academyVersion}/syllabus/${slug}/version/${version}`);
      },
      getPublicVersion: () => axios.get(`${url}/syllabus/version${qs}`),
    };
  },

  todo: (query = {}) => {
    const url = `${host}/assignment`;
    // .map((key) => (query[key] !== null ? `${key}=${query[key]}` : ''))
    const qs = parseQuerys(query);
    return {
      get: () => axios.get(`${url}/task/${qs}`),
      getAssignments: (args) => axios.get(`${url}/academy/cohort/${args.id}/task${qs}`, {
        headers: args?.academy && {
          academy: args?.academy,
        },
      }),
      deliver: (args) => axios.get(`${url}/task/${args.id}/deliver`, {
        headers: args?.academy && {
          academy: args?.academy,
        },
      }),
      getFinalProject: () => axios.get(`${url}/user/me/final_project${qs}`),
      createFinalProject: (args) => axios.post(`${url}/user/me/final_project`, args),
      sendScreenshot: (args) => axios.post(`${url}/user/me/final_project/screenshot`, args),
      updateFinalProject: (args) => breathecode.put(`${url}/user/me/final_project`, args),
      uploadFile: (id, args) => axios.put(`${url}/task/${id}/attachment${qs}`, args),
      getFile: (args) => axios.get(`${url}/task/${args.id}/attachment`, {
        headers: args.academyId && {
          academy: args.academyId,
        },
      }),
      subtask: () => ({
        get: (id) => axios.get(`${url}/user/me/task/${id}/subtasks`),
        update: (id, args) => axios.put(`${url}/user/me/task/${id}/subtasks`, args),
      }),
      // getTaskByStudent: (cohortId) => axios.get(`${url}/user/me/task?cohort=${cohortId}`),
      getTaskByStudent: () => axios.get(`${url}/user/me/task${qs}`),
      add: (args) => axios.post(`${url}/user/me/task`, args),
      // delete: (id, args) => axios.delete(`${url}/user/${id}/task/${args.id}`, args),
      update: (args) => axios.put(`${url}/task/${args.id}`, args),
      updateBulk: (args) => axios.put(`${url}/user/me/task`, args),
      deleteBulk: (args) => axios.delete(`${url}/user/me/task${qs}`, args),
    };
  },

  cohort: (query = {}, isQueryConnector = false) => {
    const url = `${host}/admissions/academy`;
    const qs = parseQuerys(query, isQueryConnector);
    return {
      get: (id) => axios.get(`${url}/cohort/${id}`),
      join: (id) => breathecode.post(`${host}/admissions/cohort/${id}/join`),
      takeAttendance: (id, activities) => axios.put(`${url}/cohort/${id}/log${qs}`, activities),
      getAttendance: (id) => axios.get(`${url}/cohort/${id}/log${qs}`),
      getPublic: (id) => axios.get(`${url}/cohort/${id}`, {
        headers: {
          Authorization: `Token ${BC_ACADEMY_TOKEN}`,
          academy: 4,
        },
      }),
      getFilterStudents: () => axios.get(`${url}/cohort/user${qs}`),
      getMembers: () => axios.get(`${url}/cohort/user${qs}`),
      getStudents: (cohortId, academyId, withDefaultToken = false) => {
        const headers = cleanObject({
          academy: academyId,
          Authorization: withDefaultToken ? `Token ${BC_ACADEMY_TOKEN}` : undefined,
          ...axios.defaults.headers.common,
        });

        return axios.get(`${url}/cohort/user?roles=STUDENT&cohorts=${cohortId}${parseQuerys(query, true)}`, {
          headers,
        });
      },
      getPublicMembers: () => axios.get(`${host}/admissions/public/cohort/user${qs}`),
      // get students without academy header
      getStudents2: (cohortSlug, withDefaultToken = false) => {
        const headers = cleanObject({
          Authorization: withDefaultToken ? `Token ${BC_ACADEMY_TOKEN}` : undefined,
          ...axios.defaults.headers.common,
        });
        return axios.get(`${host}/admissions/cohort/user?cohorts=${cohortSlug}${qs}`, {
          headers,
        });
      },
      getStudentsWithTasks: (cohortId, academyId) => axios.get(`${url}/cohort/user?tasks=True&roles=STUDENT&cohorts=${cohortId}${qs.replace('?', '&')}`, {
        headers: academyId && {
          academy: academyId,
        },
      }),
      update: (id, args) => axios.put(`${url}/cohort/${id}`, args),
      user: ({ cohortId, userId }) => axios({
        method: 'get',
        url: `${url}/cohort/${cohortId}/user/${userId}`,
        headers: {
          Authorization: `Token ${BC_ACADEMY_TOKEN}`,
          academy: 4,
        },
      }),
    };
  },
  activity: (query = {}) => {
    const url = `${hostV2}/activity`;
    const qs = parseQuerys(query);
    return {
      getActivity: (academyId) => axios({
        method: 'get',
        url: `${url}/academy/activity${qs}`,
        headers: {
          academy: academyId,
        },
      }),
      getMeActivity: () => axios.get(`${url}/me/activity${qs}`),
      getActivityReport: (academyId) => axios.get(`${url}/report${qs}`, {
        headers: academyId && {
          academy: academyId,
        },
      }),
    };
  },

  assignments: (query = {}) => {
    const url = `${host}/assignment`;
    const qs = parseQuerys(query);
    return {
      get: () => axios.get(`${url}/user/me/task`),
      getCodeRevisions: (taskId) => breathecode.get(`${url}/academy/task/${taskId}/coderevision`),
      files: (taskId) => breathecode.get(`${url}/academy/task/${taskId}/commitfile${qs}`),
      file: (taskId, commitId) => axios.get(`${url}/academy/task/${taskId}/commitfile/${commitId}`),
      createCodeRevision: (taskId, data) => axios.post(`${url}/academy/task/${taskId}/coderevision`, data),
      getPersonalCodeRevisionsByTask: (taskId) => breathecode.get(`${url}/me/task/${taskId}/coderevision`),
      getPersonalCodeRevisions: () => breathecode.get(`${url}/me/coderevision${qs}`),
      personalFiles: (taskId) => breathecode.get(`${url}/me/task/${taskId}/commitfile${qs}`),
      personalFile: (commitId) => breathecode.get(`${url}/me/commitfile/${commitId}${qs}`),
      rateCodeRevision: (coderevisionId, data) => axios.post(`${url}/me/coderevision/${coderevisionId}/rate`, data),
    };
  },
  feedback: () => {
    const url = `${host}/feedback`;
    return {
      getSurvey: (id) => axios.get(`${url}/user/me/survey/${id}/questions`),
      sendVote: (arg) => axios.put(`${url}/user/me/answer/${arg.entity_id}`, { ...arg }),
    };
  },
  mentorship: (query = {}, connector = false) => {
    const url = `${host}/mentorship/academy`;
    const urlNoAcademy = `${host}/mentorship`;
    const qs = parseQuerys(query, connector);
    return {
      getService: () => axios.get(`${url}/service?status=ACTIVE${qs}`),
      getServiceSet: (mentorshipServiceSetId) => axios.get(`${host}/payments/mentorshipserviceset/${mentorshipServiceSetId}`),
      getMentor: () => axios.get(`${url}/mentor${qs}`),
      getMySessions: () => axios.get(`${urlNoAcademy}/user/me/session${qs}`),
    };
  },

  marketing: (query = {}) => {
    const url = `${host}/marketing`;
    const qs = parseQuerys(query);
    return {
      lead: (data) => axios.post(`${url}/lead${qs}`, data),
    };
  },

  lesson: (query = {}) => {
    const url = `${host}/registry`;
    const qs = parseQuerys(query);
    return {
      get: () => axios.get(`${url}/asset${qs}`),
      getAsset: (slug) => axios.get(`${url}/asset/${slug}`),
      techs: () => axios.get(`${url}/academy/technology${qs}`),
    };
  },

  certificate: () => {
    const url = `${host}/certificate`;
    return {
      get: () => axios.get(`${url}/me`),
    };
  },

  public: (query = {}, isQueryConnector = false) => {
    const url = `${host}/admissions/public`;

    const qs = parseQuerys(query, isQueryConnector);
    return {
      mentors: () => axios.get(`${url}/cohort/user${qs}`),
      events: () => axios.get(`${host}/events/all${qs}`),
      singleEvent: (slug) => axios.get(`${host}/events/event/${slug}${qs}`),
      cohorts: () => axios.get(`${host}/admissions/cohort/all${qs}`),
      syllabusMembers: (courseSyllabus) => axios.get(`${url}/cohort/user?syllabus=${courseSyllabus}${qs}`),
    };
  },
  payment: (query = {}) => {
    const url = `${host}/payments`;
    const qs = parseQuerys(query);
    return {
      checking: (data) => axios.put(`${url}/checking${qs}`, data),
      subscriptions: () => axios.get(`${url}/me/subscription${qs}`),
      courses: () => axios.get(`${host}/marketing/course${qs}`),
      pay: (data) => breathecode.post(`${url}/pay${qs}`, data),
      addCard: (data) => breathecode.post(`${url}/card${qs}`, data),
      cancelSubscription: (id) => axios.put(`${url}/subscription/${id}/cancel${qs}`),
      cancelMySubscription: (id) => axios.put(`${url}/me/subscription/${id}/cancel${qs}`),
      getPlan: (slug) => axios.get(`${url}/plan/${slug}${qs}`),
      planOffer: () => axios.get(`${url}/planoffer${qs}`),
      getPlanProps: (id) => axios.get(`${url}/serviceitem?plan=${id}`),
      getCohortPlans: () => axios.get(`${url}/plan${qs}`),
      applyCoupon: (bagId) => axios.put(`${url}/bag/${bagId}/coupon${qs}`),
      verifyCoupon: () => axios.get(`${url}/coupon${qs}`),
      service: () => ({
        consumable: () => axios.get(`${url}/me/service/consumable${qs}`),
        // getAcademyService: (serviceSlug) => axios.get(`${url}/academy/academyservice/${serviceSlug}${qs}`),
        getAcademyService: () => breathecode.get(`${url}/academy/academyservice${qs}`),
        payConsumable: (data) => axios.post(`${url}/consumable/checkout${qs}`, data),
      }),
      getEvent: (eventId) => axios.get(`${host}/events/academy/event/${eventId}${qs}`),
      getEventTypeSet: (eventTypeSetId) => axios.get(`${url}/eventtypeset/${eventTypeSetId}`),
      events: () => axios.get(`${host}/events/me?online_event=true&${qs}`),
    };
  },
  events: (query = {}) => {
    const url = `${host}/events/me`;
    const qs = parseQuerys(query);
    return {
      // get: () => axios.get(`${url}/event${qs}`),
      liveClass: () => axios.get(`${url}/event/liveclass${qs}`),
      joinLiveClass: (liveClassHash) => axios.get(`${url}/event/liveclass/join/${liveClassHash}${qs}`),
      joinLiveClass2: (liveClassHash) => axios.get(`${host}/me/event/liveclass/join/${liveClassHash}${qs}`),
      applyEvent: (eventId) => axios.post(`${url}/event/${eventId}/checkin${qs}`),
      getUsers: (eventId) => axios.get(`${host}/events/event/${eventId}/checkin${qs}`),
    };
  },
  rigobot: (query = {}) => {
    const url = `${rigoHostV1}`;
    const qs = parseQuerys(query);
    return {
      completionJob: (data) => axios.post(`${url}/prompting/completion/43${qs}`, data),
    };
  },
};

export default breathecode;
