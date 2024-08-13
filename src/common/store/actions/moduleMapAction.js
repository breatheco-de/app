import { useDispatch, useSelector } from 'react-redux';

const useModuleMap = () => {
  const dispatch = useDispatch();
  const taskTodo = useSelector((state) => state.moduleMapReducer.taskTodo);
  const cohortProgram = useSelector((state) => state.moduleMapReducer.cohortProgram);

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

  return {
    cohortProgram,
    taskTodo,
    setTaskTodo,
    setCohortProgram,
  };
};

export default useModuleMap;
