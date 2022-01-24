import { useDispatch, useSelector } from 'react-redux';

const useModuleMap = () => {
  const dispatch = useDispatch();
  const modules = useSelector((state) => state.moduleMapReducer.modules);
  const contextState = useSelector((state) => state.moduleMapReducer.contextState);
  const updateModuleStatus = (module) => {
    const changedModules = modules.map((m, index) => {
      if (index === module.index) {
        return {
          ...m, status: module.status,
        };
      }
      return m;
    });
    dispatch({
      type: 'CHANGE_STATUS',
      payload: changedModules,
    });
  };

  const setContextState = (newState) => {
    dispatch({
      type: 'CHANGE_CONTEXT_STATE',
      payload: newState,
    });
  };

  // const changeSingleTask = (newState) => {
  //   dispatch({
  //     type: 'CHANGE_SINGLE_TASK_STATUS',
  //     payload: newState,
  //   });
  // };
  return {
    modules,
    contextState,
    setContextState,
    updateModuleStatus,
    // changeSingleTask,
  };
};

export default useModuleMap;
