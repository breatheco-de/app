import { useDispatch, useSelector } from 'react-redux';
import {
  SET_COHORT_SESSION,
  SET_SORTED_ASSIGNMENTS,
  SET_TASK_COHORT_NULL,
  SET_USER_CAPABILITIES,
} from '../types';
import { usePersistent } from '../../hooks/usePersistent';

const useCohort = () => {
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

  const setSortedAssignments = (payload) => {
    dispatch({
      type: SET_SORTED_ASSIGNMENTS,
      payload: {
        sortedAssignments: payload,
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

  return {
    state,
    setCohortSession,
    setTaskCohortNull,
    setSortedAssignments,
    setUserCapabilities,
  };
};

export default useCohort;
