import { useDispatch, useSelector } from 'react-redux';

const useModuleMap = () => {
  const dispatch = useDispatch();
  const state = useSelector((reducerState) => reducerState.moduleMapReducer);

  const setCurrentTask = (newState) => {
    dispatch({
      type: 'CHANGE_CURRENT_TASK',
      payload: newState,
    });
  };

  const setSubTasks = (newState) => {
    dispatch({
      type: 'CHANGE_SUB_TASKS',
      payload: newState,
    });
  };

  const setNextModule = (payload) => {
    dispatch({
      type: 'CHANGE_NEXT_MODULE',
      payload,
    });
  };

  const setPrevModule = (payload) => {
    dispatch({
      type: 'CHANGE_PREV_MODULE',
      payload,
    });
  };

  return {
    setCurrentTask,
    setSubTasks,
    setNextModule,
    setPrevModule,
    state,
  };
};

export default useModuleMap;
