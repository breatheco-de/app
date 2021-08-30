import { useDispatch, useSelector } from 'react-redux';

const useModuleMap = () => {
  const dispatch = useDispatch();
  const modules = useSelector((state) => state.moduleMapReducer.modules);
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
  return {
    updateModuleStatus,
    modules,
  };
};

export default useModuleMap;
