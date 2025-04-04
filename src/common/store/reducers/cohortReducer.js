import {
  SET_COHORT_SESSION,
  SET_TASK_COHORT_NULL,
  SET_USER_CAPABILITIES,
  SET_COHORTS_ASSIGNMENTS,
  SET_REVIEW_MODAL_STATE,
} from '../types';

const initialState = {
  cohortSession: null,
  cohortsAssignments: {},
  taskCohortNull: [],
  userCapabilities: [],
  reviewModalState: {
    isOpen: false,
    currentTask: null,
    externalFiles: null,
    defaultStage: undefined,
    cohortSlug: undefined,
  },
};

const cohortHandlerReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_COHORT_SESSION: {
      const { cohortSession } = action.payload;
      return {
        ...state,
        cohortSession,
      };
    }
    case SET_TASK_COHORT_NULL: {
      const { taskCohortNull } = action.payload;
      return {
        ...state,
        taskCohortNull,
      };
    }
    case SET_USER_CAPABILITIES: {
      const { userCapabilities } = action.payload;
      return {
        ...state,
        userCapabilities,
      };
    }
    case SET_COHORTS_ASSIGNMENTS: {
      const { cohortsAssignments } = action.payload;
      return {
        ...state,
        cohortsAssignments,
      };
    }
    case SET_REVIEW_MODAL_STATE: {
      const { reviewModalState } = action.payload;
      return {
        ...state,
        reviewModalState,
      };
    }
    default: {
      return state;
    }
  }
};
export default cohortHandlerReducer;
