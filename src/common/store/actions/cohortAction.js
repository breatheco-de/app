import { useDispatch, useSelector } from 'react-redux';
import {
  SET_COHORT_SESSION,
  SET_TASK_COHORT_NULL,
  SET_USER_CAPABILITIES,
  SET_COHORTS_ASSIGNMENTS,
  SET_REVIEW_MODAL_STATE,
} from '../types';
import { usePersistent } from '../../hooks/usePersistent';

const useCohortAction = () => {
  const dispatch = useDispatch();
  const [, persistCohortSession] = usePersistent('cohortSession', {});
  const state = useSelector((reducerState) => reducerState.cohortReducer);

  const setCohortSession = (payload) => {
    dispatch({
      type: SET_COHORT_SESSION,
      payload: {
        cohortSession: payload,
      },
    });
    if (payload !== undefined && payload !== null) persistCohortSession(payload);
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
    setCohortsAssingments,
    setReviewModalState,
  };
};

export default useCohortAction;
