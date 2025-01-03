import useModuleMap from '../store/actions/moduleMapAction';

function useModuleHandler() {
  const { state, setCurrentTask, setSubTasks, setNextModule, setPrevModule } = useModuleMap();

  return {
    setCurrentTask,
    setSubTasks,
    setNextModule,
    setPrevModule,
    ...state,
  };
}

export default useModuleHandler;
