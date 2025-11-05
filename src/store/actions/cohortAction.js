import { useDispatch, useSelector } from 'react-redux';
import {
  SET_COHORT_SESSION,
  SET_TASK_COHORT_NULL,
  SET_USER_CAPABILITIES,
  SET_CAPABILITIES_CACHE,
  SET_COHORTS_ASSIGNMENTS,
  SET_REVIEW_MODAL_STATE,
} from '../types';

const useCohortAction = () => {
  const dispatch = useDispatch();
  const state = useSelector((reducerState) => reducerState.cohortReducer);

  const setCohortSession = (payload) => {
    dispatch({
      type: SET_COHORT_SESSION,
      payload: {
        cohortSession: payload,
      },
    });
  };

  const setTaskCohortNull = (payload) => {
    dispatch({
      type: SET_TASK_COHORT_NULL,
      payload: {
        taskCohortNull: payload,
      },
    });
  };

  const setUserCapabilities = (paylaod) => {
    dispatch({
      type: SET_USER_CAPABILITIES,
      payload: {
        userCapabilities: paylaod,
      },
    });
  };

  const setCapabilitiesCache = (academyId, capabilities) => {
    dispatch({
      type: SET_CAPABILITIES_CACHE,
      payload: {
        academyId,
        capabilities,
      },
    });
  };

  const setCohortsAssingments = (paylaod) => {
    dispatch({
      type: SET_COHORTS_ASSIGNMENTS,
      payload: {
        cohortsAssignments: paylaod,
      },
    });
  };

  const setReviewModalState = (payload) => {
    dispatch({
      type: SET_REVIEW_MODAL_STATE,
      payload: {
        reviewModalState: payload,
      },
    });
  };

  return {
    state,
    setCohortSession,
    setTaskCohortNull,
    setUserCapabilities,
    setCapabilitiesCache,
    setCohortsAssingments,
    setReviewModalState,
  };
};

export default useCohortAction;
