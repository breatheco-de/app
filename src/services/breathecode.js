/* eslint-disable default-param-last */
import axios from '../axios';
import { parseQuerys } from '../utils/url';
import modifyEnv from '../../modifyEnv';
import { BREATHECODE_HOST } from '../utils/variables';

const BC_ACADEMY_TOKEN = modifyEnv({ queryString: 'bc_token', env: process.env.BC_ACADEMY_TOKEN });
const host = `${BREATHECODE_HOST}/v1`;
const hostV2 = `${BREATHECODE_HOST}/v2`;

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
      verifyEmail: (email) => axios.get(`${url}/emailverification/${email}`),
      resendConfirmationEmail: (inviteId) => axios.put(`${url}/invite/resend/${inviteId}`),
      me: () => axios.get(`${url}/user/me`),
      updateProfile: (arg) => axios.put(`${url}/user/me`, { ...arg }),
      updateSettings: (arg) => axios.put(`${url}/user/me/settings`, { ...arg }),
      updatePicture: (args) => axios.put(`${url}/profile/me/picture`, args),
      invites: () => ({
        get: () => axios.get(`${url}/user/me/invite?status=PENDING`),
        profileInvites: () => axios.get(`${url}/profile/invite/me`),
        accept: (id) => axios.put(`${url}/user/me/invite/accepted?id=${id}`),
      }),
      acceptProfileAcademy: (id) => axios.put(`${url}/user/me/profile_academy/${id}/active`),
      getRoles: (cohortRole) => axios.get(`${url}/role/${cohortRole}`),
      isValidToken: (token) => axios.get(`${url}/token/${token}`),
      register: (payload) => axios.post(`${url}/user/register`, payload),
      subscribe: (payload) => axios.post(`${url}/subscribe/`, { ...payload }),
      removeGithub: () => axios.delete(`${url}/github/me`),
    };
  },

  media: () => {
    const url = `${hostV2}/media`;

    return {
      operationTypes: () => axios.get(`${url}/operationtype`),
      operationMeta: (operationType) => axios.get(`${url}/operationtype/${operationType}`),
      uploadChunk: (prefix, formData, headers) => axios.put(`${url}/${prefix}`, formData, { headers }),
      endFileUpload: (prefix, args, headers) => axios.put(`${url}/${prefix}`, { ...args }, { headers }),
    };
  },

  messaging: () => {
    const url = `${host}/messaging`;

    return {
      chunkNotification: (args) => axios.get(`${url}/me/notification`, { ...args }),
    };
  },

  admissions: (query = {}, isQueryConnector = false) => {
    const url = `${host}/admissions`;
    const qs = parseQuerys(query, isQueryConnector);
    return {
      me: () => axios.get(`${url}/user/me`),
      syncMyMicroCohorts: (macroCohortSlug) => axios.post(`${url}/me/micro-cohorts/sync/${macroCohortSlug}`),
      cohort: (id, academy) => axios.get(`${url}/academy/cohort/${id}${qs}`, {
        headers: academy && {
          academy,
        },
      }),
      cohorts: () => axios.get(`${url}/cohort/all${qs}`),
      getAcademyCohortUsers: () => axios.get(`${url}/academy/cohort/user${qs}`),
      getAllCohortUsers: (cohortSlug) => axios.get(`${url}/cohort/user?cohorts=${cohortSlug}${qs}`),
      getStudents: (cohortId, academy) => axios.get(`${url}/academy/cohort/user?roles=STUDENT&cohorts=${cohortId}${parseQuerys(query, true)}`, {
        headers: academy && {
          academy,
        },
      }),
      getStudentsWithTasks: (cohortId, academyId) => axios.get(`${url}/academy/cohort/user?tasks=True&roles=STUDENT&cohorts=${cohortId}${parseQuerys(query, true)}`, {
        headers: {
          academy: academyId,
        },
      }),
      singleCohortUser: (cohortId, userId, academy) => axios.get(`${url}/academy/cohort/${cohortId}/user/${userId}${qs}`, {
        headers: academy && {
          academy,
        },
      }),
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
      academySyllabus: (academyId, slug, version) => {
        if (!slug) throw new Error('Missing slug');
        else return axios.get(`${url}/academy/${academyId}/syllabus/${slug}/version/${version}`);
      },
      publicSyllabus: (slug, version) => axios.get(`${url}/syllabus/${slug}/version/${version || '1'}${qs}`, {
        headers: {
          Authorization: `Token ${BC_ACADEMY_TOKEN}`,
          academy: 4,
        },
      }),
      joinCohort: (id) => axios.post(`${url}/cohort/${id}/join`),
      getPublicSyllabusVersion: () => axios.get(`${url}/syllabus/version${qs}`),
      getPublicMembers: () => axios.get(`${url}/public/cohort/user${qs}`),
      takeAttendance: (id, activities) => axios.put(`${url}/academy/cohort/${id}/log${qs}`, activities),
      getAttendance: (id) => axios.get(`${url}/academy/cohort/${id}/log${qs}`),
      updateCohort: (id, args) => axios.put(`${url}/academy/cohort/${id}`, args),
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
      get: () => axios.get(`${url}/task/${qs}`),
      getCohortAssignments: (args) => axios.get(`${url}/academy/cohort/${args.id}/task${qs}`, {
        headers: args?.academy && {
          academy: args?.academy,
        },
      }),
      deliver: (args) => axios.get(`${url}/task/${args.id}/deliver`, {
        headers: args?.academy && {
          academy: args?.academy,
        },
      }),
      getMeFinalProject: () => axios.get(`${url}/user/me/final_project${qs}`),
      createFinalProject: (args) => axios.post(`${url}/user/me/final_project`, args),
      sendScreenshot: (args) => axios.post(`${url}/user/me/final_project/screenshot`, args),
      updateMeFinalProject: (args) => breathecode.put(`${url}/user/me/final_project`, args),
      getMeTasks: () => axios.get(`${url}/user/me/task${qs}`),
      getTask: (taskId) => axios.get(`${url}/task/${taskId}`),
      updateTask: (args) => axios.put(`${url}/task/${args.id}`, args),
      addTasks: (args) => axios.post(`${url}/user/me/task`, args),
      getDeletionOrders: () => axios.get(`${url}/me/deletion_order${qs}`),
      getCodeRevisions: (taskId) => breathecode.get(`${url}/academy/task/${taskId}/coderevision`),
      getFinalProjects: (cohortId) => axios.get(`${url}/academy/cohort/${cohortId}/final_project`),
      putFinalProject: (cohortId, projectId, data) => breathecode.put(`${url}/academy/cohort/${cohortId}/final_project/${projectId}`, data),
      uploadFile: (id, args) => axios.put(`${url}/task/${id}/attachment${qs}`, args),
      getFile: (args) => axios.get(`${url}/task/${args.id}/attachment`, {
        headers: args.academyId && {
          academy: args.academyId,
        },
      }),
      files: (taskId) => breathecode.get(`${url}/academy/task/${taskId}/commitfile${qs}`),
      file: (taskId, commitId) => axios.get(`${url}/academy/task/${taskId}/commitfile/${commitId}`),
      createCodeRevision: (taskId, data) => axios.post(`${url}/academy/task/${taskId}/coderevision`, data),
      getPersonalCodeRevisionsByTask: (taskId) => breathecode.get(`${url}/me/task/${taskId}/coderevision`),
      getPersonalCodeRevisions: () => breathecode.get(`${url}/me/coderevision${qs}`),
      personalFiles: (taskId) => breathecode.get(`${url}/me/task/${taskId}/commitfile${qs}`),
      personalFile: (commitId) => breathecode.get(`${url}/me/commitfile/${commitId}${qs}`),
      rateCodeRevision: (coderevisionId, data) => axios.post(`${url}/me/coderevision/${coderevisionId}/rate`, data),
      syncCohort: (cohortId) => axios.get(`${url}/academy/cohort/${cohortId}/synctasks`),
      updateBulk: (args) => axios.put(`${url}/user/me/task`, args),
      deleteBulk: (args) => axios.delete(`${url}/user/me/task${qs}`, args),
      subtask: () => ({
        get: (id) => axios.get(`${url}/user/me/task/${id}/subtasks`),
        update: (id, args) => axios.put(`${url}/user/me/task/${id}/subtasks`, args),
      }),
      validateFlag: (args) => axios.get(`${url}/academy/asset/flag${qs}`, {
        headers: args.academyId && {
          academy: args.academyId,
        },
      }),
      generateFlag: () => axios.post(`${url}/academy/flag`),
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
    const url = `${host}/mentorship`;
    const qs = parseQuerys(query, connector);
    return {
      getService: () => axios.get(`${url}/academy/service?status=ACTIVE${qs}`),
      getMentor: () => axios.get(`${url}/academy/mentor${qs}`),
      getMySessions: () => axios.get(`${url}/user/me/session${qs}`),
    };
  },

  marketing: (query = {}) => {
    const url = `${host}/marketing`;
    const qs = parseQuerys(query);
    return {
      lead: (data) => axios.post(`${url}/lead${qs}`, data),
      courses: () => axios.get(`${url}/course${qs}`),
      courseTranslations: (courseSlug) => axios.get(`${url}/course/${courseSlug}/translations`),
      getCourse: (courseSlug) => axios.get(`${url}/course/${courseSlug}${qs}`),
    };
  },

  registry: (query = {}) => {
    const url = `${host}/registry`;
    const qs = parseQuerys(query);
    return {
      get: () => axios.get(`${url}/asset${qs}`),
      getAsset: (slug) => axios.get(`${url}/asset/${slug}${qs}`),
      getAssetReadme: (slug) => axios.get(`${url}/asset/${slug}.md`),
      getAssetContext: (id) => axios.get(`${url}/asset/${id}/context`),
      techs: () => axios.get(`${url}/academy/technology${qs}`),
      techsBySort: () => axios.get(`${url}/technology${qs}`),
      techMktInfo: (slug) => axios.get(`${url}/technology/${slug}`),
    };
  },

  certificate: () => {
    const url = `${host}/certificate`;
    return {
      get: () => axios.get(`${url}/me`),
    };
  },

  payment: (query = {}) => {
    const url = `${hostV2}/payments`;
    const qs = parseQuerys(query);
    return {
      checking: (data) => axios.put(`${url}/checking${qs}`, data),
      subscriptions: () => axios.get(`${url}/me/subscription${qs}`),
      pay: (data) => axios.post(`${url}/pay${qs}`, data),
      addCard: (data) => axios.post(`${url}/card${qs}`, data),
      cancelSubscription: (id) => axios.put(`${url}/subscription/${id}/cancel${qs}`),
      cancelMySubscription: (id) => axios.put(`${url}/me/subscription/${id}/cancel${qs}`),
      reactivateMySubscription: (id) => axios.put(`${url}/me/subscription/${id}/reactivate${qs}`),
      getPlan: (slug) => axios.get(`${url}/plan/${slug}${qs}`),
      getpaymentMethods: () => axios.get(`${url}/methods${qs}`),
      planOffer: () => axios.get(`${url}/planoffer${qs}`),
      getServiceItemsByPlan: (id) => axios.get(`${url}/serviceitem?plan=${id}&${parseQuerys(query, true)}`),
      getServiceInfo: (slug) => axios.get(`${url}/service/${slug}/items${qs}`),
      getCohortPlans: () => axios.get(`${url}/plan${qs}`),
      applyCoupon: (bagId) => axios.put(`${url}/bag/${bagId}/coupon${qs}`),
      verifyCoupon: () => axios.get(`${url}/coupon${qs}`),
      getServiceSet: (mentorshipServiceSetId) => axios.get(`${url}/mentorshipserviceset/${mentorshipServiceSetId}`),
      service: () => ({
        consumable: () => axios.get(`${url}/me/service/consumable${qs}`),
        getAcademyServiceBySlug: (serviceSlug) => axios.get(`${url}/academy/academyservice/${serviceSlug}${qs}`),
        getAcademyService: () => axios.get(`${url}/academy/academyservice${qs}`),
        payConsumable: (data) => axios.post(`${url}/consumable/checkout${qs}`, data),
      }),
      getAllEventTypeSets: () => axios.get(`${url}/eventtypeset`),
      getEventTypeSet: (eventTypeSetId) => axios.get(`${url}/eventtypeset/${eventTypeSetId}`),
      getBlockedServices: () => axios.get(`${url}/me/service/blocked${qs}`),
      getMyCoupon: () => axios.get(`${url}/me/coupon${qs}`),
      getMyUserCoupons: () => axios.get(`${url}/me/user/coupons${qs}`),
      updateCoupon: (couponSlug) => axios.put(`${url}/me/user/coupons/${couponSlug}`),
    };
  },
  events: (query = {}) => {
    const url = `${host}/events`;
    const qs = parseQuerys(query);
    return {
      allEvents: () => axios.get(`${url}/all${qs}`),
      getEvent: (slug) => axios.get(`${url}/event/${slug}${qs}`),
      getAcademyEvent: (eventId) => axios.get(`${url}/academy/event/${eventId}${qs}`),
      meOnlineEvents: () => axios.get(`${url}/me?online_event=true${parseQuerys(query, true)}`),
      meCheckin: () => axios.get(`${url}/me/event/checkin${qs}`),
      liveClass: () => axios.get(`${url}/me/event/liveclass${qs}`),
      joinLiveClass: (liveClassHash) => axios.get(`${url}/me/event/liveclass/join/${liveClassHash}${qs}`),
      applyEvent: (eventId, payload) => axios.post(`${url}/me/event/${eventId}/checkin${qs}`, payload),
      getUsers: (eventId) => axios.get(`${url}/event/${eventId}/checkin${qs}`),
      getAllEventTypes: () => axios.get(`${url}/eventype${qs}`),
      liveWorkshopStatus: () => axios.get(`${url}/live-workshop-status`),
    };
  },
  provisioning: (query = {}) => {
    const url = `${host}/provisioning`;
    const qs = parseQuerys(query);
    return {
      academyVendors: (academy) => axios.get(`${url}/academy/${academy}/provisioningprofile${qs}`),
    };
  },
};

export default breathecode;
