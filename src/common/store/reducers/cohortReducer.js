import {
  SET_MY_COHORTS,
  SET_COHORT_SESSION,
  SET_SORTED_ASSIGNMENTS,
  SET_TASK_COHORT_NULL,
  SET_USER_CAPABILITIES,
  SET_MICRO_COHORTS_ASSIGNMENTS,
} from '../types';

const initialState = {
  myCohorts: [],
  cohortSession: null,
  microCohortsAssignments: {},
  sortedAssignments: [],
  taskCohortNull: [],
  userCapabilities: [],
};

const cohortHandlerReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_MY_COHORTS: {
      const { myCohorts } = action.payload;
      return {
        ...state,
        myCohorts,
      };
    }
    case SET_COHORT_SESSION: {
      const { cohortSession } = action.payload;
      return {
        ...state,
        cohortSession,
      };
    }
    case SET_SORTED_ASSIGNMENTS: {
      const { sortedAssignments } = action.payload;
      return {
        ...state,
        sortedAssignments,
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
    case SET_MICRO_COHORTS_ASSIGNMENTS: {
      const { microCohortsAssignments } = action.payload;
      return {
        ...state,
        microCohortsAssignments,
      };
    }
    default: {
      return state;
    }
  }
};
export default cohortHandlerReducer;
