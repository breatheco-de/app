import { useDispatch, useSelector } from 'react-redux';

const useModuleMap = () => {
  const dispatch = useDispatch();
  const state = useSelector((reducerState) => reducerState.moduleMapReducer);

  const setTaskTodo = (newState) => {
    dispatch({
      type: 'CHANGE_TASK_TO_DO',
      payload: newState,
    });
  };

  const setCohortProgram = (newState) => {
    dispatch({
      type: 'CHANGE_COHORT_PROGRAM',
      payload: newState,
    });
  };

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
    setTaskTodo,
    setCohortProgram,
    setCurrentTask,
    setSubTasks,
    setNextModule,
    setPrevModule,
    state,
  };
};

export default useModuleMap;
