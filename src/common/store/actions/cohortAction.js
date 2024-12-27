import { useDispatch, useSelector } from 'react-redux';
import {
  SET_MY_COHORTS,
  SET_COHORT_SESSION,
  SET_TASK_COHORT_NULL,
  SET_USER_CAPABILITIES,
  SET_COHORTS_ASSIGNMENTS,
} from '../types';
import { usePersistent } from '../../hooks/usePersistent';

const useCohortAction = () => {
  const dispatch = useDispatch();
  const [, persistCohortSession] = usePersistent('cohortSession', {});
  const state = useSelector((reducerState) => reducerState.cohortReducer);

  const setMyCohorts = (payload) => {
    dispatch({
      type: SET_MY_COHORTS,
      payload: {
        myCohorts: payload,
      },
    });
  };

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

  return {
    state,
    setMyCohorts,
    setCohortSession,
    setTaskCohortNull,
    setUserCapabilities,
    setCohortsAssingments,
  };
};

export default useCohortAction;
