import {
  SET_COHORT_SESSION,
  SET_SORTED_ASSIGNMENTS,
  SET_TASK_COHORT_NULL,
  SET_USER_CAPABILITIES,
} from '../types';

const initialState = {
  cohortSession: {},
  sortedAssignments: [],
  taskCohortNull: [],
  userCapabilities: [],
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
    default: {
      return state;
    }
  }
};
export default cohortHandlerReducer;
